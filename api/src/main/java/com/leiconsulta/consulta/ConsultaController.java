package com.leiconsulta.consulta;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ConsultaController {
  private final ConsultaService consultas;

  public ConsultaController(ConsultaService consultas) {
    this.consultas = consultas;
  }

  @GetMapping("/health")
  public Map<String, Object> health() {
    return Map.of("ok", true, "python", consultas.pythonLigado());
  }

  @PostMapping("/consultar")
  public ConsultaResponse consultar(@Valid @RequestBody ConsultaRequest body) {
    return consultas.consultar(body.getTexto().trim(), body.getMunicipio());
  }
}
