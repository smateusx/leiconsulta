package com.leiconsulta.consulta;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
    return consultas.consultar(body.getTexto().trim(), body.getMunicipio(), body.getExcluirId());
  }

  @GetMapping("/consultas")
  public List<ConsultaRegistro> historico() {
    return consultas.historico();
  }

  @GetMapping("/consultas/{codigo}")
  public ConsultaRegistro consulta(@PathVariable String codigo) {
    return consultas.obter(codigo);
  }

  @DeleteMapping("/consultas/{codigo}")
  public Map<String, Object> apagar(@PathVariable String codigo) {
    return consultas.apagar(codigo);
  }

  @PostMapping(value = "/extrair", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, String> extrair(@RequestParam("arquivo") MultipartFile arquivo) {
    return consultas.extrair(arquivo);
  }
}
