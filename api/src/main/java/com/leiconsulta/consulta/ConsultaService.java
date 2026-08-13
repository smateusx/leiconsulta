package com.leiconsulta.consulta;

import com.leiconsulta.lei.Lei;
import com.leiconsulta.lei.LeiRepository;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Year;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ConsultaService {
  private final LeiRepository leis;
  private final ConsultaRegistroRepository registros;
  private final RestClient http;
  private final String pythonUrl;

  public ConsultaService(
      LeiRepository leis,
      ConsultaRegistroRepository registros,
      @Value("${python.url}") String pythonUrl) {
    this.leis = leis;
    this.registros = registros;
    this.pythonUrl = pythonUrl;
    this.http = RestClient.create();
  }

  public boolean pythonLigado() {
    try {
      Map<?, ?> body = http.get()
          .uri(pythonUrl + "/health")
          .retrieve()
          .body(Map.class);
      return body != null && Boolean.TRUE.equals(body.get("ok"));
    } catch (Exception ex) {
      return false;
    }
  }

  public ConsultaResponse consultar(String texto, String municipio) {
    return consultar(texto, municipio, null);
  }

  public ConsultaResponse consultar(String texto, String municipio, Long excluirId) {
    List<Lei> acervo = municipio == null || municipio.isBlank()
        ? leis.findAllByOrderByAnoDescTituloAsc()
        : leis.findByMunicipioIgnoreCaseOrderByAnoDesc(municipio.trim());
    if (excluirId != null) {
      acervo = acervo.stream().filter(lei -> !excluirId.equals(lei.getId())).toList();
    }

    ConsultaResponse python = tentarPython(texto, acervo);
    ConsultaResponse resposta = python != null ? python : fallbackJava(texto, acervo);
    try {
      return gravar(resposta, texto, municipio);
    } catch (Exception ex) {
      return resposta;
    }
  }

  public String motivoRecusa(ConsultaResponse consulta) {
    if (consulta == null || consulta.getResultados() == null || consulta.getResultados().isEmpty()) {
      if (consulta != null && "nao_protocolar".equals(consulta.getParecer())) {
        return "Não foi guardada porque já existe uma lei idêntica (ou quase idêntica) no acervo.";
      }
      return "Não foi guardada porque já existe uma lei parecida no acervo.";
    }
    MatchDto top = consulta.getResultados().get(0);
    String nome = top.getNumero() == null || top.getNumero().isBlank()
        ? top.getTitulo()
        : "Lei nº " + top.getNumero() + " — " + top.getTitulo();
    int pct = (int) Math.round(top.getScore() * 100);
    if ("nao_protocolar".equals(consulta.getParecer()) || "igual".equals(top.getNivel())) {
      return "Não foi guardada porque o texto é idêntico ou quase idêntico a "
          + nome + " (" + pct + "% de semelhança). Use a lei que já está no acervo.";
    }
    return "Não foi guardada porque o texto é parecido com "
        + nome + " (" + pct + "% de semelhança). Pode ser o mesmo assunto com outra redação.";
  }

  public List<ConsultaRegistro> historico() {
    return registros.findAllByOrderByCriadoEmDesc();
  }

  public ConsultaRegistro obter(String codigo) {
    return registros.findByCodigoIgnoreCase(codigo.trim())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consulta não encontrada."));
  }

  private ConsultaResponse gravar(ConsultaResponse resposta, String texto, String municipio) {
    ConsultaRegistro registro = new ConsultaRegistro();
    registro.setMunicipio(municipio == null || municipio.isBlank() ? "todos" : municipio.trim());
    registro.setTexto(texto);
    registro.setParecer(resposta.getParecer());
    registro.setFonte(resposta.getFonte());
    registro.setResumo(resumo(resposta));
    registro = registros.save(registro);
    String codigo = String.format(Locale.ROOT, "LC-%d-%04d", Year.now().getValue(), registro.getId());
    registro.setCodigo(codigo);
    registros.save(registro);
    resposta.setCodigo(codigo);
    return resposta;
  }

  private static String resumo(ConsultaResponse resposta) {
    if (resposta.getResultados() == null || resposta.getResultados().isEmpty()) {
      return "Nada parecido no acervo";
    }
    MatchDto top = resposta.getResultados().get(0);
    String lei = top.getNumero() == null || top.getNumero().isBlank()
        ? top.getTitulo()
        : "Lei nº " + top.getNumero();
    return lei + " · " + Math.round(top.getScore() * 100) + "% · " + top.getNivel();
  }

  public static final long TAMANHO_MAXIMO = 5L * 1024 * 1024;

  public Map<String, String> extrair(MultipartFile arquivo) {
    if (arquivo == null || arquivo.isEmpty()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Envie um arquivo .txt ou .pdf de até 5 MB.");
    }
    if (arquivo.getSize() > TAMANHO_MAXIMO) {
      throw new ResponseStatusException(
          HttpStatus.PAYLOAD_TOO_LARGE, "O arquivo passa de 5 MB. Envie um .txt ou .pdf de até 5 MB.");
    }
    String nome = arquivo.getOriginalFilename() == null
        ? ""
        : arquivo.getOriginalFilename().toLowerCase(Locale.ROOT);
    try {
      if (nome.endsWith(".txt")) {
        return Map.of("texto", textoOuErro(new String(arquivo.getBytes(), StandardCharsets.UTF_8)));
      }
      if (!nome.endsWith(".pdf")) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Formato não aceito. Use só .txt ou .pdf (texto selecionável), até 5 MB.");
      }
      return Map.of("texto", textoOuErro(textoDoPdf(arquivo.getBytes())));
    } catch (ResponseStatusException ex) {
      throw ex;
    } catch (IOException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível ler o arquivo.");
    }
  }

  private static String textoDoPdf(byte[] bytes) throws IOException {
    try (PDDocument doc = PDDocument.load(bytes)) {
      if (doc.isEncrypted()) {
        throw new ResponseStatusException(
            HttpStatus.UNPROCESSABLE_ENTITY, "Este PDF está protegido e não dá para ler o texto.");
      }
      return new PDFTextStripper().getText(doc);
    }
  }

  private static String textoOuErro(String bruto) {
    String texto = bruto == null ? "" : bruto.replace('\u0000', ' ').trim();
    if (texto.length() < 8) {
      throw new ResponseStatusException(
          HttpStatus.UNPROCESSABLE_ENTITY,
          "Não achei texto no arquivo. Use .txt ou PDF com texto selecionável (não escaneado), até 5 MB.");
    }
    return texto;
  }

  private ConsultaResponse tentarPython(String texto, List<Lei> acervo) {
    try {
      Map<String, Object> payload = new HashMap<>();
      payload.put("texto", texto);
      payload.put(
          "leis",
          acervo.stream().map(lei -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", lei.getId());
            item.put("titulo", lei.getTitulo());
            item.put("numero", lei.getNumero() == null ? "" : lei.getNumero());
            item.put("municipio", lei.getMunicipio());
            item.put("ano", lei.getAno());
            item.put("ementa", lei.getEmenta());
            item.put("texto", lei.getTexto());
            return item;
          }).toList());

      ConsultaResponse resposta = http.post()
          .uri(pythonUrl + "/compare")
          .contentType(MediaType.APPLICATION_JSON)
          .body(payload)
          .retrieve()
          .body(new ParameterizedTypeReference<ConsultaResponse>() {});
      if (resposta != null) {
        resposta.setFonte("python");
        resposta.setParecer(parecer(resposta.getResultados()));
      }
      return resposta;
    } catch (Exception ex) {
      return null;
    }
  }

  private ConsultaResponse fallbackJava(String texto, List<Lei> acervo) {
    Set<String> query = tokens(texto);
    List<MatchDto> matches = new ArrayList<>();
    for (Lei lei : acervo) {
      Set<String> doc = tokens(lei.getTitulo() + " " + lei.getEmenta() + " " + lei.getTexto());
      if (query.isEmpty() || doc.isEmpty()) {
        continue;
      }
      Set<String> inter = new HashSet<>(query);
      inter.retainAll(doc);
      Set<String> uni = new HashSet<>(query);
      uni.addAll(doc);
      double score = uni.isEmpty() ? 0 : (double) inter.size() / uni.size();
      if (score < 0.08) {
        continue;
      }
      MatchDto item = toMatch(lei, score, texto);
      matches.add(item);
    }
    matches.sort(Comparator.comparingDouble(MatchDto::getScore).reversed());
    ConsultaResponse res = new ConsultaResponse();
    res.setFonte("java");
    res.setResultados(matches.stream().limit(8).collect(Collectors.toList()));
    res.setParecer(parecer(res.getResultados()));
    return res;
  }

  static String parecer(List<MatchDto> matches) {
    if (matches == null || matches.isEmpty()) {
      return "livre";
    }
    boolean igual = matches.stream().anyMatch(item -> "igual".equals(item.getNivel()));
    if (igual) {
      return "nao_protocolar";
    }
    boolean parecida = matches.stream().anyMatch(item -> "parecida".equals(item.getNivel()));
    return parecida ? "revisar" : "livre";
  }

  public boolean deveRecusar(ConsultaResponse consulta) {
    if (consulta == null) {
      return false;
    }
    if ("nao_protocolar".equals(consulta.getParecer()) || "revisar".equals(consulta.getParecer())) {
      return true;
    }
    if (consulta.getResultados() == null) {
      return false;
    }
    return consulta.getResultados().stream().anyMatch(item ->
        "igual".equals(item.getNivel())
            || "parecida".equals(item.getNivel())
            || item.getScore() >= 0.08);
  }

  static MatchDto toMatch(Lei lei, double score, String query) {
    MatchDto item = new MatchDto();
    item.setId(lei.getId());
    item.setTitulo(lei.getTitulo());
    item.setNumero(lei.getNumero());
    item.setMunicipio(lei.getMunicipio());
    item.setAno(lei.getAno());
    item.setEmenta(lei.getEmenta());
    item.setTexto(lei.getTexto());
    item.setTermos(termosComuns(query, lei));
    item.setScore(Math.round(score * 1000.0) / 1000.0);
    if (score >= 0.72) {
      item.setNivel("igual");
    } else if (score >= 0.08) {
      item.setNivel("parecida");
    } else {
      item.setNivel("relacionada");
    }
    return item;
  }

  private static List<String> termosComuns(String query, Lei lei) {
    Set<String> inter = new HashSet<>(tokens(query));
    inter.retainAll(tokens(lei.getTitulo() + " " + lei.getEmenta() + " " + lei.getTexto()));
    return inter.stream().sorted().limit(8).toList();
  }

  private static Set<String> tokens(String text) {
    if (text == null) {
      return Set.of();
    }
    return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-zà-ü0-9]+"))
        .filter(t -> t.length() > 3)
        .collect(Collectors.toSet());
  }
}
