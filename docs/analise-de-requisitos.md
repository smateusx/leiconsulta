# Análise de requisitos — LeiConsulta

**Projeto:** LeiConsulta  
**Base:** análise de negócio do mesmo piloto (Cachoeira/BA)  
**Data:** 13/08/2026

## 1. Atores do sistema

- **Usuário de gabinete** (vereador, deputado ou assessoria): senha compartilhada nesta versão.

## 2. Requisitos funcionais

| ID | Requisito | Status |
|---|---|---|
| RF01 | Cadastrar lei (título, número, município, ano, ementa, texto) | Feito |
| RF02 | Listar e buscar leis do acervo | Feito |
| RF03 | Filtrar acervo por ano | Feito |
| RF04 | Ler texto completo da lei | Feito |
| RF05 | Apagar lei (com confirmação) | Feito |
| RF06 | Consultar rascunho contra o acervo | Feito |
| RF07 | Devolver parecer: já existe / parecida / livre | Feito |
| RF08 | Mostrar leis próximas, percentual e termos em comum | Feito |
| RF09 | Comparar rascunho e lei lado a lado | Feito |
| RF10 | Aceitar texto colado, .txt e PDF com texto | Feito |
| RF11 | Gerar código da consulta (LC-AAAA-NNNN) | Feito |
| RF12 | Guardar histórico de consultas | Feito |
| RF13 | Imprimir e baixar parecer | Feito |
| RF14 | Exportar acervo em PDF | Feito |
| RF15 | ~~Exibir estado do motor (Python ou Java)~~ | Removido — linguagem técnica, não é para o gabinete |
| RF16 | Página de ajuda com os três pareceres | Feito |
| RF17 | **Alterar lei já cadastrada** | Feito |
| RF18 | Filtrar acervo por município | Feito |
| RF19 | Filtrar histórico por parecer | Feito |
| RF20 | Abrir comprovante da consulta pelo código | Feito |
| RF21 | Mostrar quantidade de leis por ano na tela inicial | Feito |
| RF22 | Separar lei parecida de lei só com palavras em comum | Feito |
| RF23 | Sugerir municípios já cadastrados ao preencher a ficha | Feito |
| RF24 | Baixar cópia do acervo em JSON | Feito |
| RF25 | ~~Mostrar no topo se a API e o Python estão ligados~~ | Removido — usuário do gabinete não precisa disso |
| RF26 | Mostrar quantas leis a busca do acervo devolveu | Feito |
| RF27 | Copiar ementa da lei no acervo | Feito |
| RF28 | Abrir o acervo filtrado pelo ano a partir da tela inicial | Feito |
| RF29 | Limpar filtros do acervo e rascunho da consulta | Feito |
| RF30 | Baixar o texto de uma lei em .txt | Feito |
| RF31 | Copiar o parecer da consulta | Feito |
| RF32 | Buscar no histórico por trecho do rascunho | Feito |
| RF33 | Limpar a ficha de nova lei | Feito |
| RF34 | Restaurar o acervo a partir da cópia de segurança | Feito |
| RF35 | Copiar o texto completo da lei e o rascunho da consulta | Feito |
| RF36 | Apagar consulta do histórico | Feito |
| RF37 | Ver os últimos comprovantes na tela inicial | Feito |
| RF38 | Confirmar antes de restaurar a cópia de segurança | Feito |
| RF39 | Ordenar o acervo por ano ou título | Feito |
| RF40 | Imprimir uma lei do acervo | Feito |
| RF41 | Copiar o rascunho na tela de consultar | Feito |
| RF42 | Abrir acervo ou histórico a partir dos números da tela inicial | Feito |
| RF43 | Ir ao parecer depois da consulta e orientar acervo/histórico vazios | Feito |
| RF44 | Baixar a lista de comprovantes do histórico | Feito |
| RF45 | Depois da consulta, guardar a proposta ou abrir a lei encontrada | Feito |
| RF46 | Avisar na ficha se o número ou o título já existe no município | Feito |
| RF47 | Destacar e abrir o texto da lei encontrada no acervo | Feito |
| RF48 | No acervo, consultar se há outra lei parecida (sem comparar a lei consigo mesma) | Feito |

## 3. Requisitos não funcionais

| ID | Requisito | Como o piloto atende |
|---|---|---|
| RNF01 | Sem serviço pago | Local: React, Spring Boot, FastAPI, SQLite |
| RNF02 | Java no portfólio | API Spring Boot 3 / Java 21 |
| RNF03 | Interface em português | Toda a UI em pt-BR |
| RNF04 | Uso em notebook (Windows) | Três processos locais (5173, 8080, 8002) |
| RNF05 | Consulta funciona se o Python cair | Fallback Jaccard no Java |
| RNF06 | PDF escaneado fora do recorte | Sem OCR nesta versão |
| RNF07 | Dados no disco local | `api/data/leis.db` |
| RNF08 | Regras de parecer testáveis | `ConsultaServiceTest` (JUnit) |

## 4. Regras de negócio (operacionais)

- RN01: parecer **já existe** se houver match com nível `igual` (score ≥ 0,72).
- RN02: parecer **revisar** se o melhor relevante for `parecida` (score ≥ 0,22).
- RN03: parecer **livre** se não houver parecida/igual (só relacionada ou nada).
- RN04: o parecer **não** é parecer jurídico.
- RN05: na tela Consultar, o cálculo usa o município informado; se vier vazio, usa o acervo inteiro. Ao **guardar**, compara com o acervo inteiro (evita furar com “Cachoeira” vs “Cachoeira/BA”).
- RN06: ao guardar lei nova, o sistema consulta de novo e **recusa** se for igual ou parecida de verdade (não pede “guardar mesmo assim”). Texto sem relação (ex.: trabalho acadêmico com 9% de palavras comuns) **não** é recusado.
- RN07: arquivo aceito só `.txt` e `.pdf` com texto selecionável, até 5 MB.

## 5. Casos de uso (resumo)

1. **Consultar proposta** — ator cola/envia texto → sistema devolve parecer + código.
2. **Guardar lei** — ator preenche ficha → sistema grava no SQLite se o acervo não tiver igual/parecida.
3. **Consultar acervo** — ator busca/filtra → lê ou exporta.
4. **Reconsultar pelo histórico** — ator reabre rascunho antigo.
5. **Abrir comprovante** — ator informa o código LC-AAAA-NNNN e vê a consulta.

## 6. Fora de escopo

Login, OCR, diário oficial, tramitação, votação, assinatura digital, multi-gabinete na nuvem.

## 7. Rastreio (implementação)

Camadas: React (`frontend`) → Java (`api`) → Python TF-IDF (`similaridade`) ou Jaccard no Java. Identificador de consulta: `LC-{ano}-{id}`.
