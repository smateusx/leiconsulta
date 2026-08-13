package com.leiconsulta.consulta;

import java.util.ArrayList;
import java.util.List;

public class ConsultaResponse {
  private String fonte = "java";
  private String parecer = "livre";
  private String codigo;
  private List<MatchDto> resultados = new ArrayList<>();

  public String getFonte() {
    return fonte;
  }

  public void setFonte(String fonte) {
    this.fonte = fonte;
  }

  public String getParecer() {
    return parecer;
  }

  public void setParecer(String parecer) {
    this.parecer = parecer;
  }

  public String getCodigo() {
    return codigo;
  }

  public void setCodigo(String codigo) {
    this.codigo = codigo;
  }

  public List<MatchDto> getResultados() {
    return resultados;
  }

  public void setResultados(List<MatchDto> resultados) {
    this.resultados = resultados;
  }
}
