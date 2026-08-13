package com.leiconsulta.lei;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedData implements CommandLineRunner {
  private final LeiRepository leis;

  public SeedData(LeiRepository leis) {
    this.leis = leis;
  }

  @Override
  public void run(String... args) {
    boolean vazio = leis.count() == 0;
    boolean soExemploAntigo = !vazio && leis.findAll().stream()
        .allMatch(lei -> "Itaí".equalsIgnoreCase(lei.getMunicipio()));
    if (!vazio && !soExemploAntigo) {
      return;
    }
    if (soExemploAntigo) {
      leis.deleteAll();
    }

    leis.save(lei(
        "Horário de silêncio no perímetro urbano",
        "Cachoeira",
        2018,
        "Dispõe sobre o limite de ruído após as 22 horas no perímetro urbano de Cachoeira/BA.",
        "Fica proibida a produção de ruído que perturbe o sossego após as 22 horas e antes das 7 horas, em dias úteis, no perímetro urbano de Cachoeira, Bahia. Festas, bares e obras noturnas dependem de autorização da prefeitura. No período junino, a Secretaria de Cultura poderá autorizar extensão de horário no centro histórico e no entorno da Praça da Aclamação. A fiscalização poderá aplicar multa ao infrator."));
    leis.save(lei(
        "Conservação de calçadas e do centro histórico",
        "Cachoeira",
        2019,
        "Obriga o proprietário a manter calçada livre e preservar a fachada no centro histórico.",
        "O proprietário do imóvel em Cachoeira é responsável por construir e conservar a calçada em frente ao lote, com faixa livre para pedestres, inclusive pessoa com deficiência. No centro histórico, qualquer alteração de fachada, cor ou calçamento depende de parecer do órgão de patrimônio. É vedado estacionar veículo sobre a calçada."));
    leis.save(lei(
        "Descarte irregular de entulho nas margens do Paraguaçu",
        "Cachoeira",
        2021,
        "Proíbe o descarte de entulho em via pública, terreno baldio e margem do rio Paraguaçu.",
        "Fica proibido o descarte de entulho, restos de obra e móveis em via pública, terreno baldio ou margem do rio Paraguaçu, no município de Cachoeira/BA. O infrator deverá remover o material e poderá ser autuado. A prefeitura manterá pontos de entrega voluntária."));
    leis.save(lei(
        "Funcionamento da feira livre",
        "Cachoeira",
        2020,
        "Organiza dias, horários e ocupação de box na feira livre municipal.",
        "A feira livre de Cachoeira funciona aos sábados, das 6 às 13 horas. Cada feirante ocupa o box definido pela secretaria municipal. É vedado ocupar calçada vizinha ou via de trânsito. Produtos de origem animal seguem regras sanitárias."));
    leis.save(lei(
        "Isenção parcial de IPTU para idoso",
        "Cachoeira",
        2022,
        "Concede desconto no IPTU do imóvel de moradia do idoso de baixa renda em Cachoeira/BA.",
        "O idoso com 60 anos ou mais, residente no único imóvel próprio usado como moradia em Cachoeira, Bahia, cuja renda familiar seja de até dois salários mínimos, poderá requerer desconto de 50% no IPTU. O benefício é pessoal e intransferível."));
  }

  private static Lei lei(String titulo, String municipio, int ano, String ementa, String texto) {
    Lei item = new Lei();
    item.setTitulo(titulo);
    item.setMunicipio(municipio);
    item.setAno(ano);
    item.setEmenta(ementa);
    item.setTexto(texto);
    return item;
  }
}
