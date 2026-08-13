package com.leiconsulta.consulta;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "consultas")
public class ConsultaRegistro {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(length = 24)
  private String codigo;

  @Column(nullable = false, length = 120)
  private String municipio;

  @Column(nullable = false, length = 50000)
  private String texto;

  @Column(nullable = false, length = 40)
  private String parecer;

  @Column(nullable = false, length = 20)
  private String fonte;

  @Column(length = 400)
  private String resumo;

  @Column(nullable = false)
  private Instant criadoEm = Instant.now();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getCodigo() {
    return codigo;
  }

  public void setCodigo(String codigo) {
    this.codigo = codigo;
  }

  public String getMunicipio() {
    return municipio;
  }

  public void setMunicipio(String municipio) {
    this.municipio = municipio;
  }

  public String getTexto() {
    return texto;
  }

  public void setTexto(String texto) {
    this.texto = texto;
  }

  public String getParecer() {
    return parecer;
  }

  public void setParecer(String parecer) {
    this.parecer = parecer;
  }

  public String getFonte() {
    return fonte;
  }

  public void setFonte(String fonte) {
    this.fonte = fonte;
  }

  public String getResumo() {
    return resumo;
  }

  public void setResumo(String resumo) {
    this.resumo = resumo;
  }

  public Instant getCriadoEm() {
    return criadoEm;
  }

  public void setCriadoEm(Instant criadoEm) {
    this.criadoEm = criadoEm;
  }
}
