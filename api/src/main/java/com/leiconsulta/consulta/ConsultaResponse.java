package com.leiconsulta.consulta;

import java.util.ArrayList;
import java.util.List;

public class ConsultaResponse {
  private String fonte = "java";
  private List<MatchDto> resultados = new ArrayList<>();

  public String getFonte() {
    return fonte;
  }

  public void setFonte(String fonte) {
    this.fonte = fonte;
  }

  public List<MatchDto> getResultados() {
    return resultados;
  }

  public void setResultados(List<MatchDto> resultados) {
    this.resultados = resultados;
  }
}
