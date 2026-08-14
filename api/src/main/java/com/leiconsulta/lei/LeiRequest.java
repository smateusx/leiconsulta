package com.leiconsulta.lei;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LeiRequest {
  @NotBlank(message = "Informe o título.")
  @Size(max = 200, message = "O título é longo demais.")
  private String titulo;

  @Size(max = 40, message = "O número da lei é longo demais.")
  private String numero;

  @NotBlank(message = "Informe o município.")
  @Size(max = 120, message = "O município é longo demais.")
  private String municipio;

  @Min(value = 1800, message = "Informe um ano válido.")
  @Max(value = 2100, message = "Informe um ano válido.")
  private Integer ano;

  @NotBlank(message = "Informe a ementa.")
  @Size(max = 2000, message = "A ementa é longa demais.")
  private String ementa;

  @NotBlank(message = "Informe o texto da lei.")
  @Size(max = 50000, message = "O texto é longo demais.")
  private String texto;

  public String getTitulo() {
    return titulo;
  }

  public void setTitulo(String titulo) {
    this.titulo = titulo;
  }

  public String getNumero() {
    return numero;
  }

  public void setNumero(String numero) {
    this.numero = numero;
  }

  public String getMunicipio() {
    return municipio;
  }

  public void setMunicipio(String municipio) {
    this.municipio = municipio;
  }

  public Integer getAno() {
    return ano;
  }

  public void setAno(Integer ano) {
    this.ano = ano;
  }

  public String getEmenta() {
    return ementa;
  }

  public void setEmenta(String ementa) {
    this.ementa = ementa;
  }

  public String getTexto() {
    return texto;
  }

  public void setTexto(String texto) {
    this.texto = texto;
  }
}
