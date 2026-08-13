package com.leiconsulta.lei;

import com.leiconsulta.consulta.ConsultaResponse;
import com.leiconsulta.consulta.ConsultaService;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/leis")
public class LeiController {
  private final LeiRepository leis;
  private final ConsultaService consultas;

  public LeiController(LeiRepository leis, ConsultaService consultas) {
    this.leis = leis;
    this.consultas = consultas;
  }

  @GetMapping
  public List<Lei> listar(@RequestParam(required = false) String municipio) {
    if (municipio != null && !municipio.isBlank()) {
      return leis.findByMunicipioIgnoreCaseOrderByAnoDesc(municipio.trim());
    }
    return leis.findAllByOrderByAnoDescTituloAsc();
  }

  @GetMapping("/{id}")
  public Lei obter(@PathVariable Long id) {
    return leis.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lei não encontrada."));
  }

  @PostMapping
  public ResponseEntity<?> criar(@Valid @RequestBody LeiRequest body) {
    String municipio = body.getMunicipio().trim();
    String titulo = body.getTitulo().trim();
    String numero = trimToNull(body.getNumero());
    String ementa = body.getEmenta().trim();
    String texto = body.getTexto().trim();

    if (leis.existsByMunicipioIgnoreCaseAndTituloIgnoreCase(municipio, titulo)) {
      return recusaTitulo(titulo);
    }
    if (numero != null && leis.existsByMunicipioIgnoreCaseAndNumeroIgnoreCase(municipio, numero)) {
      return recusaNumero(numero);
    }

    ResponseEntity<?> recusa = recusarSeParecida(titulo, ementa, texto, null);
    if (recusa != null) {
      return recusa;
    }

    Lei lei = new Lei();
    lei.setTitulo(titulo);
    lei.setNumero(numero);
    lei.setMunicipio(municipio);
    lei.setAno(body.getAno());
    lei.setEmenta(ementa);
    lei.setTexto(texto);
    return ResponseEntity.status(HttpStatus.CREATED).body(leis.save(lei));
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> alterar(@PathVariable Long id, @Valid @RequestBody LeiRequest body) {
    Lei lei = leis.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lei não encontrada."));
    String municipio = body.getMunicipio().trim();
    String titulo = body.getTitulo().trim();
    String numero = trimToNull(body.getNumero());
    String ementa = body.getEmenta().trim();
    String texto = body.getTexto().trim();

    if (leis.existsByMunicipioIgnoreCaseAndTituloIgnoreCaseAndIdNot(municipio, titulo, id)) {
      return recusaTitulo(titulo);
    }
    if (numero != null && leis.existsByMunicipioIgnoreCaseAndNumeroIgnoreCaseAndIdNot(municipio, numero, id)) {
      return recusaNumero(numero);
    }

    ResponseEntity<?> recusa = recusarSeParecida(titulo, ementa, texto, id);
    if (recusa != null) {
      return recusa;
    }

    lei.setTitulo(titulo);
    lei.setNumero(numero);
    lei.setMunicipio(municipio);
    lei.setAno(body.getAno());
    lei.setEmenta(ementa);
    lei.setTexto(texto);
    return ResponseEntity.ok(leis.save(lei));
  }

  @DeleteMapping("/{id}")
  public Map<String, Object> apagar(@PathVariable Long id) {
    if (!leis.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lei não encontrada.");
    }
    leis.deleteById(id);
    return Map.of("message", "deleted", "id", id);
  }

  private ResponseEntity<?> recusarSeParecida(String titulo, String ementa, String texto, Long excluirId) {
    Lei igual = leiTextoIgual(titulo, ementa, texto, excluirId);
    if (igual != null) {
      Map<String, Object> recusa = new LinkedHashMap<>();
      String nome = igual.getNumero() == null || igual.getNumero().isBlank()
          ? igual.getTitulo()
          : "Lei nº " + igual.getNumero() + " — " + igual.getTitulo();
      recusa.put("error", "Não foi guardada porque o texto é idêntico ou quase idêntico a " + nome + ".");
      recusa.put("parecer", "nao_protocolar");
      recusa.put("resultados", List.of());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(recusa);
    }

    String paraComparar = titulo + " " + ementa + " " + texto;
    ConsultaResponse checagem = consultas.consultar(paraComparar, null, excluirId);
    if (consultas.deveRecusar(checagem)) {
      Map<String, Object> recusa = new LinkedHashMap<>();
      recusa.put("error", consultas.motivoRecusa(checagem));
      recusa.put("parecer", checagem.getParecer());
      recusa.put("resultados", checagem.getResultados());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(recusa);
    }
    return null;
  }

  private Lei leiTextoIgual(String titulo, String ementa, String texto, Long excluirId) {
    String nTexto = norm(texto);
    String nTudo = norm(titulo + " " + ementa + " " + texto);
    String nEmenta = norm(ementa);
    for (Lei lei : leis.findAll()) {
      if (excluirId != null && excluirId.equals(lei.getId())) {
        continue;
      }
      if (!nTexto.isBlank() && nTexto.equals(norm(lei.getTexto()))) {
        return lei;
      }
      if (nEmenta.length() >= 24 && nEmenta.equals(norm(lei.getEmenta()))) {
        return lei;
      }
      if (nTudo.equals(norm(lei.getTitulo() + " " + lei.getEmenta() + " " + lei.getTexto()))) {
        return lei;
      }
    }
    return null;
  }

  private static String norm(String value) {
    if (value == null) {
      return "";
    }
    return value.toLowerCase().replaceAll("\\s+", " ").trim();
  }

  private static String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  private static ResponseEntity<Map<String, Object>> recusaTitulo(String titulo) {
    Map<String, Object> recusa = new LinkedHashMap<>();
    recusa.put("error", "Não foi guardada porque já existe uma lei com o mesmo título no município: " + titulo + ".");
    recusa.put("parecer", "nao_protocolar");
    recusa.put("resultados", List.of());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(recusa);
  }

  private static ResponseEntity<Map<String, Object>> recusaNumero(String numero) {
    Map<String, Object> recusa = new LinkedHashMap<>();
    recusa.put("error", "Não foi guardada porque já existe a Lei nº " + numero + " neste município.");
    recusa.put("parecer", "nao_protocolar");
    recusa.put("resultados", List.of());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(recusa);
  }
}
