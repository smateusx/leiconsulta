package com.leiconsulta.lei;

import java.util.List;
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
    boolean soExemploAntigo = leis.count() > 0 && leis.findAll().stream()
        .allMatch(lei -> "Itaí".equalsIgnoreCase(lei.getMunicipio()));
    if (soExemploAntigo) {
      leis.deleteAll();
    }

    upsert(
        "1142/2018",
        "Horário de silêncio no perímetro urbano",
        "Cachoeira",
        2018,
        "Dispõe sobre o limite de ruído após as 22 horas no perímetro urbano de Cachoeira/BA.",
        "Fica proibida a produção de ruído que perturbe o sossego após as 22 horas e antes das 7 horas, em dias úteis, no perímetro urbano de Cachoeira, Bahia. Festas, bares e obras noturnas dependem de autorização da prefeitura. No período junino, a Secretaria de Cultura poderá autorizar extensão de horário no centro histórico e no entorno da Praça da Aclamação. A fiscalização poderá aplicar multa ao infrator.");
    upsert(
        "1203/2019",
        "Conservação de calçadas e do centro histórico",
        "Cachoeira",
        2019,
        "Obriga o proprietário a manter calçada livre e preservar a fachada no centro histórico.",
        "O proprietário do imóvel em Cachoeira é responsável por construir e conservar a calçada em frente ao lote, com faixa livre para pedestres, inclusive pessoa com deficiência. No centro histórico, qualquer alteração de fachada, cor ou calçamento depende de parecer do órgão de patrimônio. É vedado estacionar veículo sobre a calçada.");
    upsert(
        "1288/2020",
        "Funcionamento da feira livre",
        "Cachoeira",
        2020,
        "Organiza dias, horários e ocupação de box na feira livre municipal.",
        "A feira livre de Cachoeira funciona aos sábados, das 6 às 13 horas. Cada feirante ocupa o box definido pela secretaria municipal. É vedado ocupar calçada vizinha ou via de trânsito. Produtos de origem animal seguem regras sanitárias.");
    upsert(
        "1310/2021",
        "Descarte irregular de entulho nas margens do Paraguaçu",
        "Cachoeira",
        2021,
        "Proíbe o descarte de entulho em via pública, terreno baldio e margem do rio Paraguaçu.",
        "Fica proibido o descarte de entulho, restos de obra e móveis em via pública, terreno baldio ou margem do rio Paraguaçu, no município de Cachoeira/BA. O infrator deverá remover o material e poderá ser autuado. A prefeitura manterá pontos de entrega voluntária.");
    upsert(
        "1394/2022",
        "Isenção parcial de IPTU para idoso",
        "Cachoeira",
        2022,
        "Concede desconto no IPTU do imóvel de moradia do idoso de baixa renda em Cachoeira/BA.",
        "O idoso com 60 anos ou mais, residente no único imóvel próprio usado como moradia em Cachoeira, Bahia, cuja renda familiar seja de até dois salários mínimos, poderá requerer desconto de 50% no IPTU. O benefício é pessoal e intransferível.");
    upsert(
        "1411/2023",
        "Proteção do samba de roda e da cultura popular",
        "Cachoeira",
        2023,
        "Reconhece o samba de roda e manifestações do Recôncavo como patrimônio cultural de Cachoeira.",
        "Ficam reconhecidos como patrimônio cultural imaterial do município de Cachoeira o samba de roda, as irmandades e as festas do Recôncavo. A Secretaria de Cultura apoiará ensaios, cortejos e apresentação em praça pública. É vedada a cobrança de taxa para uso de espaço público nessas manifestações, salvo dano comprovado ao patrimônio.");
    upsert(
        "1450/2024",
        "Travessia fluvial entre Cachoeira e São Félix",
        "Cachoeira",
        2024,
        "Dispõe sobre apoio municipal à travessia do rio Paraguaçu entre Cachoeira e São Félix.",
        "O município de Cachoeira articula com o Estado o funcionamento regular da travessia fluvial sobre o rio Paraguaçu, entre Cachoeira e São Félix. A prefeitura poderá ceder área de embarque, sinalização e apoio a pedestres e ciclistas. É vedado o abandono de embarcação irregular na orla.");
  }

  private void upsert(
      String numero,
      String titulo,
      String municipio,
      int ano,
      String ementa,
      String texto) {
    List<Lei> existentes = leis.findAll();
    Lei achada = existentes.stream()
        .filter(lei -> titulo.equalsIgnoreCase(lei.getTitulo())
            && municipio.equalsIgnoreCase(lei.getMunicipio()))
        .findFirst()
        .orElse(null);
    if (achada == null) {
      leis.save(lei(numero, titulo, municipio, ano, ementa, texto));
      return;
    }
    if (achada.getNumero() == null || achada.getNumero().isBlank()) {
      achada.setNumero(numero);
      leis.save(achada);
    }
  }

  private static Lei lei(
      String numero,
      String titulo,
      String municipio,
      int ano,
      String ementa,
      String texto) {
    Lei item = new Lei();
    item.setNumero(numero);
    item.setTitulo(titulo);
    item.setMunicipio(municipio);
    item.setAno(ano);
    item.setEmenta(ementa);
    item.setTexto(texto);
    return item;
  }
}
