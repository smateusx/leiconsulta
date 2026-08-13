package com.leiconsulta.consulta;

import com.leiconsulta.lei.Lei;
import com.leiconsulta.lei.LeiRepository;
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
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ConsultaService {
  private final LeiRepository leis;
  private final RestClient http;
  private final String pythonUrl;

  public ConsultaService(
      LeiRepository leis,
      @Value("${python.url}") String pythonUrl) {
    this.leis = leis;
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
    List<Lei> acervo = municipio == null || municipio.isBlank()
        ? leis.findAllByOrderByAnoDescTituloAsc()
        : leis.findByMunicipioIgnoreCaseOrderByAnoDesc(municipio.trim());

    ConsultaResponse python = tentarPython(texto, acervo);
    if (python != null) {
      return python;
    }
    return fallbackJava(texto, acervo);
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
      MatchDto item = toMatch(lei, score);
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

  static MatchDto toMatch(Lei lei, double score) {
    MatchDto item = new MatchDto();
    item.setId(lei.getId());
    item.setTitulo(lei.getTitulo());
    item.setNumero(lei.getNumero());
    item.setMunicipio(lei.getMunicipio());
    item.setAno(lei.getAno());
    item.setEmenta(lei.getEmenta());
    item.setTexto(lei.getTexto());
    item.setScore(Math.round(score * 1000.0) / 1000.0);
    if (score >= 0.72) {
      item.setNivel("igual");
    } else if (score >= 0.22) {
      item.setNivel("parecida");
    } else {
      item.setNivel("relacionada");
    }
    return item;
  }

  private static Set<String> tokens(String text) {
    return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-zà-ü0-9]+"))
        .filter(t -> t.length() > 3)
        .collect(Collectors.toSet());
  }
}
