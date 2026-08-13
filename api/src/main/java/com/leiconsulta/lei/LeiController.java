package com.leiconsulta.lei;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/leis")
public class LeiController {
  private final LeiRepository leis;

  public LeiController(LeiRepository leis) {
    this.leis = leis;
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
  @ResponseStatus(HttpStatus.CREATED)
  public Lei criar(@Valid @RequestBody LeiRequest body) {
    Lei lei = new Lei();
    lei.setTitulo(body.getTitulo().trim());
    lei.setNumero(trimToNull(body.getNumero()));
    lei.setMunicipio(body.getMunicipio().trim());
    lei.setAno(body.getAno());
    lei.setEmenta(body.getEmenta().trim());
    lei.setTexto(body.getTexto().trim());
    return leis.save(lei);
  }

  @PutMapping("/{id}")
  public Lei alterar(@PathVariable Long id, @Valid @RequestBody LeiRequest body) {
    Lei lei = leis.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lei não encontrada."));
    lei.setTitulo(body.getTitulo().trim());
    lei.setNumero(trimToNull(body.getNumero()));
    lei.setMunicipio(body.getMunicipio().trim());
    lei.setAno(body.getAno());
    lei.setEmenta(body.getEmenta().trim());
    lei.setTexto(body.getTexto().trim());
    return leis.save(lei);
  }

  @DeleteMapping("/{id}")
  public Map<String, Object> apagar(@PathVariable Long id) {
    if (!leis.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lei não encontrada.");
    }
    leis.deleteById(id);
    return Map.of("message", "deleted", "id", id);
  }

  private static String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}
