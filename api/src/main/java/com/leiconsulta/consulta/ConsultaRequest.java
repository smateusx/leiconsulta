package com.leiconsulta.consulta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ConsultaRequest {
  @NotBlank
  @Size(max = 50000)
  private String texto;

  @Size(max = 120)
  private String municipio;

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
}
