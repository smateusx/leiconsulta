package com.leiconsulta.consulta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ConsultaRequest {
  @NotBlank(message = "Cole o texto da proposta.")
  @Size(max = 50000, message = "O texto é longo demais.")
  private String texto;

  @Size(max = 120)
  private String municipio;

  private Long excluirId;

  public String getTexto() {
    return texto;
  }

  public void setTexto(String texto) {
    this.texto = texto;
  }

  public String getMunicipio() {
    return municipio;
  }

  public void setMunicipio(String municipio) {
    this.municipio = municipio;
  }

  public Long getExcluirId() {
    return excluirId;
  }

  public void setExcluirId(Long excluirId) {
    this.excluirId = excluirId;
  }
}
