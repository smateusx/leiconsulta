package com.leiconsulta.lei;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedData implements CommandLineRunner {
  private static final String MUN = "Cachoeira";
  private static final String FONTE =
      " Fonte: Câmara Municipal de Cachoeira/BA (cachoeira.ba.leg.br). Inteiro teor no portal, quando houver PDF.";

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
    exemplosOperacionais();
    leiOrganica();
    leis2015();
    leis2018();
    leis2019();
    leis2020();
    leis2022();
    leis2023();
  }

  private void exemplosOperacionais() {
    norma(
        "1.142/2018",
        "Horário de silêncio no perímetro urbano",
        2018,
        "Dispõe sobre o limite de ruído após as 22 horas no perímetro urbano de Cachoeira/BA.",
        "Fica proibida a produção de ruído que perturbe o sossego após as 22 horas e antes das 7 horas, em dias úteis, no perímetro urbano de Cachoeira, Bahia. Festas, bares e obras noturnas dependem de autorização da prefeitura. No período junino, a Secretaria de Cultura poderá autorizar extensão de horário no centro histórico e no entorno da Praça da Aclamação. A fiscalização poderá aplicar multa ao infrator.");
    norma(
        "1.203/2019",
        "Conservação de calçadas e do centro histórico",
        2019,
        "Obriga o proprietário a manter calçada livre e preservar a fachada no centro histórico.",
        "O proprietário do imóvel em Cachoeira é responsável por construir e conservar a calçada em frente ao lote, com faixa livre para pedestres, inclusive pessoa com deficiência. No centro histórico, qualquer alteração de fachada, cor ou calçamento depende de parecer do órgão de patrimônio. É vedado estacionar veículo sobre a calçada.");
    norma(
        "1.198/2020",
        "Funcionamento da feira livre",
        2020,
        "Organiza dias, horários e ocupação de box na feira livre municipal.",
        "A feira livre de Cachoeira funciona aos sábados, das 6 às 13 horas. Cada feirante ocupa o box definido pela secretaria municipal. É vedado ocupar calçada vizinha ou via de trânsito. Produtos de origem animal seguem regras sanitárias.");
    norma(
        "1.255/2021",
        "Descarte irregular de entulho nas margens do Paraguaçu",
        2021,
        "Proíbe o descarte de entulho em via pública, terreno baldio e margem do rio Paraguaçu.",
        "Fica proibido o descarte de entulho, restos de obra e móveis em via pública, terreno baldio ou margem do rio Paraguaçu, no município de Cachoeira/BA. O infrator deverá remover o material e poderá ser autuado. A prefeitura manterá pontos de entrega voluntária.");
    norma(
        "1.394/2022",
        "Isenção parcial de IPTU para idoso",
        2022,
        "Concede desconto no IPTU do imóvel de moradia do idoso de baixa renda em Cachoeira/BA.",
        "O idoso com 60 anos ou mais, residente no único imóvel próprio usado como moradia em Cachoeira, Bahia, cuja renda familiar seja de até dois salários mínimos, poderá requerer desconto de 50% no IPTU. O benefício é pessoal e intransferível.");
    norma(
        "1.450/2024",
        "Travessia fluvial entre Cachoeira e São Félix",
        2024,
        "Dispõe sobre apoio municipal à travessia do rio Paraguaçu entre Cachoeira e São Félix.",
        "O município de Cachoeira articula com o Estado o funcionamento regular da travessia fluvial sobre o rio Paraguaçu, entre Cachoeira e São Félix. A prefeitura poderá ceder área de embarque, sinalização e apoio a pedestres e ciclistas. É vedado o abandono de embarcação irregular na orla.");
  }

  private void leiOrganica() {
    norma(
        "LOM",
        "Lei Orgânica do Município de Cachoeira",
        1990,
        "Dispõe sobre a organização político-administrativa do Município de Cachoeira, Estado da Bahia.",
        """
Art. 1º. O Município de Cachoeira, pessoa jurídica de direito público interno, no pleno uso de sua autonomia política, administrativa e financeira, reger-se-á por esta Lei Orgânica, em consonância com os textos constitucionais da União e do Estado da Bahia, votada e aprovada por sua Câmara Municipal.
Art. 2º. São poderes do Município, independentes e harmônicos entre si, o Legislativo e o Executivo.
Art. 3º. Todo poder emana do povo, que o exerce por meio de representantes eleitos diretamente.
Art. 4º. A sede do Município é a Cidade de Cachoeira.
Art. 5º. São símbolos do Município o Hino, a Bandeira e o Brasão. Comemorar-se-á anualmente, em 13 de março, o Dia de Aniversário da Cidade, e em 25 de junho, a Data Magna da Cidade.
Art. 28. A Câmara de Vereadores de Cachoeira será formada de 13 vereadores.
Trecho da Lei Orgânica publicado no portal da Câmara Municipal de Cachoeira/BA.""");
  }

  private void leis2015() {
    ementa("2015/01", "Programação cívica de 25 de junho", 2015,
        "Regulamenta a Programação Cívica em Cachoeira, no dia 25 de Junho.");
    ementa("2015/02", "Doação de equipamentos à Santa Casa", 2015,
        "Autoriza a doação de equipamentos da Secretaria de Saúde que não estão sendo utilizados para a Santa Casa de Misericórdia de Cachoeira.");
    ementa("2015/03", "Reajuste salarial 2015", 2015, "Concede reajuste salarial.");
    ementa("2015/04", "Piso salarial de ACS e ACE", 2015,
        "Adequa a legislação municipal à normatização federal, para instituir piso salarial profissional nacional como base da carreira dos agentes comunitários de saúde e dos agentes de combate às endemias.");
    ementa("2015/05", "Plano Municipal de Educação", 2015, "Aprova o Plano Municipal de Educação - PME.");
    ementa("2015/06", "Utilidade pública Instituto Roque Araújo", 2015,
        "Declara de Utilidade Pública Municipal o Instituto Roque Araújo de Cinema e Audiovisual.");
    ementa("2015/07", "Crédito suplementar 20%", 2015,
        "Abre crédito suplementar no valor de 20% do valor total do orçamento vigente.");
    ementa("2015/08", "LDO 2016", 2015, "Lei de Diretrizes Orçamentárias - LDO - 2016.");
    ementa("2015/09", "Confissão de dívida com a Embasa", 2015,
        "Autoriza o Poder Executivo firmar com a EMBASA o instrumento particular de confissão de dívida, encontro de contas e cessão de direito e obrigações.");
    ementa("2015/10", "Desfile cívico e manifestações culturais", 2015,
        "Institui a obrigatoriedade da realização de Desfile Cívico e Manifestações culturais no município de Cachoeira.");
    ementa("2015/11", "Convênio técnico com a Embasa", 2015,
        "Autoriza o Poder Executivo a firmar convênio de cooperação técnica com a EMBASA.");
    ementa("2015/12", "Denominação de logradouros da Rua da Feira", 2015,
        "Dispõe sobre a denominação de ruas, becos, travessas e vilas do bairro da Rua da Feira.");
    ementa("2015/13", "Consórcio intermunicipal", 2015,
        "Autoriza o Poder Executivo a celebrar protocolo de intenções e termos aditivos com outros municípios objetivando a constituição do consórcio intermunicipal.");
    ementa("2015/14", "Plano Municipal de Cultura 2015-2025", 2015,
        "Institui o Plano Municipal de Cultura para o decênio 2015-2025.");
    ementa("2015/15", "Conselho Municipal de Desenvolvimento Sustentável", 2015,
        "Dispõe sobre a instituição do Conselho Municipal de Desenvolvimento Sustentável - CMDS.");
    ementa("2015/16", "Fundo Municipal de Cultura", 2015,
        "Regulamenta o Fundo Municipal de Cultura de Cachoeira - FMC.");
    ementa("2015/17", "Projeto Aluno Nota 10", 2015,
        "Institui o Projeto Aluno nota 10 nas escolas municipais, estaduais e particulares do município de Cachoeira.");
    ementa("2015/18", "Operação de crédito", 2015, "Autoriza o Poder Executivo a contratar operação de crédito.");
    ementa("2015/19", "Minha Casa Minha Vida", 2015,
        "Autoriza o Poder Executivo Municipal a participar do Programa Minha Casa, Minha Vida.");
    ementa("2015/20", "Lei Orçamentária Anual 2015", 2015, "Lei Orçamentária Anual 2015 - LOA.");
    ementa("2015/21", "Conselho Municipal da Cidade - Concidades", 2015,
        "Dispõe sobre o Conselho Municipal da cidade de Cachoeira - Concidades.");
    ementa("2015/22", "Controle da frota municipal", 2015,
        "Dispõe sobre o controle da frota de veículos a serviço do município de Cachoeira.");
    ementa("2015/23", "Aprovação das contas 2013", 2015,
        "Aprovação das contas do prefeito Carlos Pereira - exercício de 2013.");
    ementa("2015/24", "Acesso à informação", 2015,
        "Regula o acesso a informações no âmbito do município de Cachoeira.");
  }

  private void leis2018() {
    ementa("2018/01", "Utilidade pública Associação Quilombola Engenho Novo", 2018,
        "Declara de Utilidade Pública Municipal a Associação Quilombola Engenho Novo.");
    ementa("2018/02", "Utilidade pública Chancelaria Internacional Brasil-Israel", 2018,
        "Declara de Utilidade Pública Municipal a Chancelaria Internacional Brasil - Israel.");
    ementa("2018/03", "Comenda Salustiano Coelho de Araújo", 2018, "Cria a Comenda Salustiano Coelho de Araújo.");
    ementa("2018/04", "Gratuidade nos transportes coletivos", 2018,
        "Dispõe sobre gratuidade nos transportes coletivos de massa.");
    ementa("2018/05", "Disque-Denúncia de violência contra a mulher", 2018,
        "Dispõe sobre a divulgação do serviço de Disque-Denúncia Nacional de Violência contra a Mulher, no município de Cachoeira.");
  }

  private void leis2019() {
    ementa("1.236/2019", "Preservação ambiental e eucalipto", 2019,
        "Dispõe sobre medidas de preservação ambiental, plantio e replantio de florestas de eucalipto ou de outras essências florestais exóticas para fins de uso doméstico ou industrial no município de Cachoeira.");
    ementa("2019/01", "Reajuste dos professores ao piso nacional", 2019,
        "Dispõe sobre o reajuste salarial dos Professores Municipais para ajustar ao Piso Nacional.");
    ementa("2019/02", "Reajuste dos servidores efetivos e comissionados", 2019,
        "Dispõe sobre o reajuste salarial dos servidores públicos efetivos e comissionados do Município de Cachoeira.");
    ementa("2019/03", "Reajuste dos servidores da Câmara", 2019,
        "Concede reajuste na ordem de 4,17% a todos os servidores da Câmara da Cachoeira.");
    ementa("2019/04", "Reajuste de ACS e ACE ao piso nacional", 2019,
        "Dispõe sobre o reajuste salarial dos Agentes Comunitários de Saúde e Agentes de Combate às Endemias, para ajustar ao Piso Nacional.");
    ementa("2019/05", "Selo Empresa Amiga da Juventude", 2019,
        "Cria o Selo Empresa Amiga da Juventude e dá outras providências.");
    ementa("2019/06", "Prêmio Juventude Contra as Drogas", 2019,
        "Institui o Prêmio Juventude Contra as Drogas e dá outras providências.");
    ementa("2019/07", "Semana Municipal da Cultura", 2019,
        "Institui a Semana Municipal da Cultura no Município de Cachoeira e dá outras providências.");
    ementa("2019/08", "Convênios e confissão de débito", 2019,
        "Autoriza o Poder Executivo Municipal firmar convênios, contratos, termo de confissão de débito, e dá outras providências.");
    ementa("2019/09", "Conselho Municipal da Pessoa com Deficiência", 2019,
        "Dispõe sobre a criação do Conselho Municipal de Pessoas Portadoras de Deficiências Físicas e dá outras providências.");
    ementa("2019/10", "Dia Municipal do Advogado", 2019, "Dispõe sobre a criação do Dia Municipal do Advogado.");
    ementa("2019/11", "Cargos temporários", 2019,
        "Cria cargos de caráter temporário, de livre nomeação e exoneração.");
    ementa("2019/12", "REFIS Cachoeira", 2019,
        "Institui o Programa de Incentivo à Regularização Fiscal com a Fazenda Pública do Município de Cachoeira - REFIS Cachoeira, e dá outras providências.");
    ementa("2019/13", "LDO 2020", 2019,
        "Dispõe sobre as diretrizes orçamentárias para o exercício de 2020, e dá outras providências.");
    ementa("2019/14", "LOA 2020", 2019,
        "Estima a receita e fixa a despesa do orçamento anual do Município de Cachoeira para o exercício financeiro de 2020.");
    ementa("2019/15", "Aprovação das contas 2017", 2019,
        "Aprovação das contas do prefeito Fernando Antônio da Silva Pereira - exercício de 2017.");
  }

  private void leis2020() {
    ementa("2020/01", "Feriados municipais", 2020, "Estabelece os feriados municipais e dá outras providências.");
    ementa("2020/02", "Reajuste dos professores 2020", 2020,
        "Dispõe sobre o reajuste salarial dos professores municipais para ajustar ao piso nacional.");
  }

  private void leis2022() {
    ementa("1.273/2022", "Auxílio emergencial Júlia Souza Gomes", 2022,
        "Altera a Lei 1.264 de 2021, que criou o Auxílio Emergencial Júlia Souza Gomes no âmbito da Secretaria de Cultura e Turismo, com o objetivo de garantir aos trabalhadores do setor cultural e de eventos as condições mínimas de sobrevivência diante da pandemia de coronavírus (COVID-19).");
    ementa("1.274/2022", "Patrimonialização e regulamentação da capoeira", 2022,
        "Lei de patrimonialização e regulamentação da capoeira no município.");
    ementa("1.276/2022", "Incentivo financeiro a ACS e ACE", 2022,
        "Autoriza o Poder Executivo Municipal a repassar aos Agentes Comunitários de Saúde (ACS) e aos Agentes de Combate às Endemias (ACE) o incentivo financeiro adicional e dá outras providências.");
    ementa("1.283/2022", "Fundação Casa Paulo Dias Adorno", 2022,
        "Reconhece a Fundação Casa Paulo Dias Adorno como Patrimônio Histórico de Cachoeira.");
    ementa("1.287/2022", "Utilidade pública Loja Maçônica Caridade e Segredo", 2022,
        "Declara de utilidade pública municipal a Loja Maçônica Caridade e Segredo.");
    ementa("1.288/2022", "Utilidade pública Associação Artesanal Chitarte", 2022,
        "Declara de utilidade pública municipal a Associação Artesanal Chitarte de Cachoeira - Bahia.");
    ementa("1.290/2022", "Piso salarial nacional de ACS e ACE", 2022,
        "Dispõe sobre o pagamento do Piso Salarial Nacional dos Agentes Comunitários de Saúde e de Agente de Combate às Endemias, na forma do art. 198 da Constituição Federal, no município de Cachoeira, Estado da Bahia.");
    ementa("1.291/2022", "Dia 13 de junho", 2022,
        "Dispõe sobre o Projeto de Introdução do Dia Treze de Junho, no âmbito do município de Cachoeira, Estado da Bahia.");
    ementa("1.292/2022", "Utilidade pública Associação dos Moradores São Diego-Matinha", 2022,
        "Declara de utilidade pública municipal a Associação dos Moradores São Diego-Matinha no Município de Cachoeira.");
    ementa("1.293/2022", "Convênio da FLICA", 2022,
        "Autoriza o Poder Executivo Municipal a firmar convênio e ou parceria com empresa detentora de marca/exclusividade da FLICA – Festa Literária Internacional de Cachoeira, patrimônio imaterial da cidade de Cachoeira, Bahia (Lei Municipal nº 1.272/2021).");
    ementa("1.294/2022", "Dignidade menstrual", 2022,
        "Institui diretrizes para política pública de dignidade menstrual, conscientização sobre a menstruação e universalização do acesso a absorventes higiênicos para mulheres de baixa renda no município de Cachoeira-Bahia.");
    ementa("1.295/2022", "Estágio na administração municipal", 2022,
        "Dispõe sobre a concessão de estágio no âmbito da administração municipal e dá outras providências.");
    ementa("1.296/2022", "Regime jurídico dos ACS", 2022,
        "Dispõe sobre a regulação na admissão e do regime jurídico dos Agentes de Saúde - ACS, na forma do art. 198 da Constituição Federal, no município de Cachoeira, Estado da Bahia.");
    ementa("1.297/2022", "Cidade-irmã Cartagena das Índias", 2022,
        "Reconhecer a heroica cidade Cartagena de Indias como cidade-irmã da heroica Cachoeira.");
    ementa("1.298/2022", "Utilidade pública Ordem Terceira do Carmo", 2022,
        "Declara de utilidade pública municipal a Venerável Ordem Terceira de Nossa Senhora do Carmo.");
    ementa("1.299/2022", "Plano Municipal de Educação Antirracista", 2022,
        "Dispõe sobre a criação do Plano Municipal de Educação Antirracista de Cachoeira, e dá outras providências.");
    ementa("1.300/2022", "Relógio da torre da Igreja Matriz", 2022,
        "Reconhece o relógio da torre da Igreja Matriz como patrimônio municipal e dá outras providências.");
    ementa("1.301/2022", "LOA 2023", 2022,
        "Estima a receita e fixa a despesa do Orçamento Anual do Município de Cachoeira para o exercício financeiro de 2023.");
    ementa("1.303/2022", "Bônus 14º da educação municipal", 2022,
        "Institui bônus 14º para pagamento a todos os servidores da educação pública municipal, efetivos, contratados e comissionados, da rede pública municipal de Cachoeira.");
  }

  private void leis2023() {
    ementa("2023/01", "Festa da Ostra como patrimônio", 2023,
        "Declara a Festa da Ostra Patrimônio Cultural e Imaterial de Cachoeira.");
    ementa("2023/02", "Festa de Nossa Senhora do Bom Parto", 2023,
        "Declara a Festa de Nossa Senhora do Bom Parto Patrimônio Cultural e Imaterial de Cachoeira.");
    ementa("1.304/2023", "Qualificação de diretor e vice-diretor escolar", 2023,
        "Dispõe sobre o processo de qualificação para o exercício das funções gratificadas de diretor escolar e de vice-diretor escolar das instituições de ensino mantidas pela rede pública municipal de ensino de Cachoeira/BA.");
    ementa("1.305/2023", "Convênios e termo de confissão de débitos", 2023,
        "Autoriza o Poder Executivo Municipal firmar convênios, termo de confissão de débitos e dá outras providências.");
    ementa("1.306/2023", "REFIS 2023", 2023,
        "Institui o Programa de Recuperação Fiscal – REFIS/2023, no âmbito do Município de Cachoeira, na forma que indica.");
    ementa("1.307/2023", "Alteração da Lei 1.221/2018", 2023,
        "Dispõe sobre a alteração da Lei nº 1.221/2018 que alterou a redação do artigo 4º da Lei nº 821/2009.");
    ementa("1.308/2023", "Agentes de contratação - Lei 14.133/2021", 2023,
        "Dispõe sobre a regulamentação da Lei Federal nº 14.133, de 1º de abril de 2021, no que concerne às atribuições e responsabilidades dos agentes de contratação, bem como da criação do cargo em comissão.");
    ementa("1.309/2023", "Alteração do art. 9º da Lei 1.306/2023", 2023,
        "Altera a redação do artigo 9º da Lei 1.306/2023 e dá outras providências.");
    ementa("1.310/2023", "Fundo Municipal de Preservação do Patrimônio", 2023,
        "Autoriza o Poder Executivo a utilizar recursos financeiros do Fundo Municipal de Preservação do Patrimônio, decorrentes do antigo Projeto Monumenta.");
    ementa("1.317/2023", "LDO 2024", 2023,
        "Dispõe sobre as diretrizes orçamentárias para o exercício de 2024 e dá outras providências.");
    ementa("1.320/2023", "Irmandade de Nossa Senhora d'Ajuda", 2023,
        "Declara a Irmandade de Nossa Senhora d'Ajuda como patrimônio histórico cultural e imaterial de Cachoeira-BA.");
    ementa("1.321/2023", "Festa de Nossa Senhora d'Ajuda", 2023,
        "Declara a Festa de Nossa Senhora d'Ajuda como patrimônio histórico cultural e imaterial de Cachoeira-BA.");
    ementa("1.322/2023", "Agosto do Blues", 2023,
        "Projeto de introdução do evento musical Agosto do Blues no município de Cachoeira, Bahia.");
    ementa("1.323/2023", "Irmandade e Festa de Nossa Senhora da Boa Morte", 2023,
        "Declara a Irmandade e a Festa de Nossa Senhora da Boa Morte patrimônio histórico cultural material e imaterial de Cachoeira-Bahia.");
    ementa("1.324/2023", "Associação do Samba Dalva Damiana de Freitas", 2023,
        "Declara a Associação do Samba Dalva Damiana de Freitas patrimônio histórico cultural material de Cachoeira.");
    ementa("1.325/2023", "Crédito especial ao orçamento 2023 (I)", 2023,
        "Autoriza a abertura de crédito especial ao Orçamento Anual de 2023, na forma que indica.");
    ementa("1.326/2023", "Crédito especial ao orçamento 2023 (II)", 2023,
        "Autoriza a abertura de crédito especial ao Orçamento Anual de 2023, na forma que indica.");
    ementa("1.327/2023", "Samba de roda de Cachoeira", 2023,
        "Declara o samba de roda de Cachoeira patrimônio histórico imaterial de Cachoeira-BA.");
    ementa("1.328/2023", "Cine Theatro Cachoeirano", 2023,
        "Declara o Cine Theatro Cachoeirano patrimônio histórico cultural material de Cachoeira, Bahia.");
    ementa("1.329/2023", "Utilidade pública Associação de Capoeiruçu", 2023,
        "Declara de utilidade pública municipal a Associação Beneficente Ação Social Independente do Distrito de Capoeiruçu.");
    ementa("1.330/2023", "Semana Municipal da Juventude", 2023,
        "Institui a Semana Municipal da Juventude no Município de Cachoeira e dá outras providências.");
    ementa("1.331/2023", "Sociedade Seguidores de São Gerônimo (I)", 2023,
        "Declara a Associação Sociedade Seguidores de São Gerônimo como patrimônio histórico, cultural e material de Cachoeira - Bahia.");
    ementa("1.332/2023", "Sociedade Seguidores de São Gerônimo (II)", 2023,
        "Declara a Associação Sociedade Seguidores de São Gerônimo como patrimônio histórico, cultural e material de Cachoeira - Bahia.");
  }

  private void ementa(String numero, String titulo, int ano, String ementa) {
    String texto = "Município de Cachoeira, Estado da Bahia. Ementa oficial: " + ementa + FONTE;
    norma(numero, titulo, ano, ementa, texto);
  }

  private void norma(String numero, String titulo, int ano, String ementa, String texto) {
    upsert(numero, titulo, MUN, ano, ementa, texto);
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
        .filter(lei -> municipio.equalsIgnoreCase(lei.getMunicipio()))
        .filter(lei ->
            (numero != null && numero.equalsIgnoreCase(nvl(lei.getNumero())))
                || (titulo.equalsIgnoreCase(lei.getTitulo()) && lei.getAno() != null && lei.getAno() == ano))
        .findFirst()
        .orElse(null);
    if (achada == null) {
      leis.save(lei(numero, titulo, municipio, ano, ementa, texto));
      return;
    }
    achada.setNumero(numero);
    achada.setAno(ano);
    achada.setEmenta(ementa);
    achada.setTexto(texto);
    leis.save(achada);
  }

  private static String nvl(String value) {
    return value == null ? "" : value;
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
