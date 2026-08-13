package com.leiconsulta.lei;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LeiRequest {
  @NotBlank
  @Size(max = 200)
  private String titulo;

  @Size(max = 40)
  private String numero;

  @NotBlank
  @Size(max = 120)
  private String municipio;

  @Min(1800)
  @Max(2100)
  private Integer ano;

  @NotBlank
  @Size(max = 2000)
  private String ementa;

  @NotBlank
  @Size(max = 50000)
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
