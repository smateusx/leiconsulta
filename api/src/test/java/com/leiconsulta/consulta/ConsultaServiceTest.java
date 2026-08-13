package com.leiconsulta.consulta;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class ConsultaServiceTest {
  private final ConsultaService consultas = new ConsultaService(null, null, "http://127.0.0.1:8002");

  private static MatchDto match(String nivel, double score) {
    MatchDto item = new MatchDto();
    item.setNivel(nivel);
    item.setScore(score);
    return item;
  }

  @Test
  void soRelacionadaFicaLivre() {
    assertEquals("livre", ConsultaService.parecer(List.of(match("relacionada", 0.12))));
  }

  @Test
  void parecidaPedeRevisar() {
    assertEquals("revisar", ConsultaService.parecer(List.of(match("parecida", 0.30))));
  }

  @Test
  void igualNaoProtocolar() {
    assertEquals("nao_protocolar", ConsultaService.parecer(List.of(match("igual", 0.81))));
  }

  @Test
  void naoRecusaRelacionadaDeNovePorCento() {
    ConsultaResponse consulta = new ConsultaResponse();
    consulta.setParecer("livre");
    consulta.setResultados(List.of(match("relacionada", 0.09)));
    assertFalse(consultas.deveRecusar(consulta));
  }

  @Test
  void recusaQuandoParecida() {
    ConsultaResponse consulta = new ConsultaResponse();
    consulta.setParecer("revisar");
    consulta.setResultados(List.of(match("parecida", 0.31)));
    assertTrue(consultas.deveRecusar(consulta));
  }
}
