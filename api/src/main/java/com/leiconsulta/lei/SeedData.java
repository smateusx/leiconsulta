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
    if (leis.count() > 0) {
      return;
    }
    leis.save(lei(
        "Horário de silêncio no perímetro urbano",
        "Itaí",
        2018,
        "Dispõe sobre o limite de ruído após as 22 horas no perímetro urbano.",
        "Fica proibida a produção de ruído que perturbe o sossego após as 22 horas e antes das 7 horas, em dias úteis, no perímetro urbano do município. Festas, bares e obras noturnas dependem de autorização da prefeitura. A fiscalização poderá aplicar multa ao infrator."));
    leis.save(lei(
        "Conservação de calçadas",
        "Itaí",
        2019,
        "Obriga o proprietário a manter a calçada em bom estado, sem obstáculo ao pedestre.",
        "O proprietário do imóvel é responsável por construir e conservar a calçada em frente ao lote, garantindo faixa livre para circulação de pedestres, inclusive pessoa com deficiência. É vedado estacionar veículo sobre a calçada."));
    leis.save(lei(
        "Descarte irregular de entulho",
        "Itaí",
        2021,
        "Proíbe o descarte de entulho em via pública, terreno baldio e margem de rio.",
        "Fica proibido o descarte de entulho, restos de obra e móveis em via pública, terreno baldio ou margem de curso d'água. O infrator deverá remover o material e poderá ser autuado. A prefeitura manterá pontos de entrega voluntária."));
    leis.save(lei(
        "Funcionamento da feira livre",
        "Itaí",
        2020,
        "Organiza dias, horários e ocupação de box na feira livre municipal.",
        "A feira livre funciona aos sábados, das 6 às 13 horas, na praça central. Cada feirante ocupa o box sorteado pela secretaria de agricultura. É vedado ocupar calçada vizinha ou via de trânsito. Produtos de origem animal seguem regras sanitárias."));
    leis.save(lei(
        "Isenção parcial de IPTU para idoso",
        "Itaí",
        2022,
        "Concede desconto no IPTU do imóvel de moradia do idoso de baixa renda.",
        "O idoso com 60 anos ou mais, residente no único imóvel próprio usado como moradia, cuja renda familiar seja de até dois salários mínimos, poderá requerer desconto de 50% no IPTU. O benefício é pessoal e intransferível."));
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
