# Análise de negócio — LeiConsulta

**Projeto:** LeiConsulta  
**Município-piloto:** Cachoeira / Bahia  
**Data:** 13/08/2026  
**Objetivo deste documento:** descrever o problema, os atores, o valor e o recorte do produto. Não substitui parecer jurídico.

## 1. Problema

Gabinetes de vereador e de deputado ainda protocolam projeto de lei sem uma checagem rápida no acervo municipal. O resultado comum é:

- lei repetida ou quase igual à que já existe;
- retrabalho de assessoria e da Câmara;
- papel e arquivo morto como “memória” do que já foi votado.

O problema não é “falta de diário oficial”. É **falta de um passo operacional** entre o rascunho e o protocolo: *isso já existe no município?*

## 2. Situação atual (as-is)

1. Assessoria redige o rascunho (Word, PDF, papel).
2. Alguém “lembra” se já teve lei parecida, ou folheia pasta / PDF do diário.
3. Se a busca falha, o projeto segue.
4. Só depois da tramitação se descobre sobreposição.

Custo: tempo de gabinete, desgaste político e lei inútil.

## 3. Situação desejada (to-be)

1. O rascunho entra no LeiConsulta (texto, .txt ou PDF com texto).
2. O sistema compara com o acervo do município.
3. Sai um **parecer operacional** (já existe / parecida / livre) e um **código** (ex.: LC-2026-0001).
4. Só então se protocola. A lei aprovada volta para o acervo.

Isso não substitui a consultoria jurídica da Câmara. É um **filtro de duplicidade de texto**.

## 4. Atores

| Ator | Interesse |
|---|---|
| Vereador / deputado | Não protocolar o que já existe; ter comprovante da consulta |
| Assessoria | Checar rápido; guardar leis; exportar |
| Câmara / arquivo | Acervo digital consultável |
| Cidadão (fora do recorte atual) | Transparência — não é usuário desta versão |

## 5. Proposta de valor

- Menos lei repetida.
- Menos papel como único índice.
- Rastro (código + histórico) de que o acervo foi consultado.
- Custo zero de nuvem no piloto: roda na máquina, SQLite, sem assinatura.

## 6. Escopo do piloto

**Dentro:** Cachoeira/BA como município de exemplo; cadastro de leis; consulta por similaridade; parecer; histórico; impressão/download; PDF.

**Fora (agora):** login, papéis de permissão, OCR de PDF escaneado, integração com o Diário Oficial, validade jurídica do parecer, hospedagem pública, app mobile.

## 7. Modelo (negócio, não financeiro)

Não há cobrança neste piloto. O “cliente” é o gabinete. O produto é interno.

Se um dia virar serviço: município ou gabinete paga hospedagem + carga do acervo. Isso **não** está no piloto (regra: zero serviço pago).

## 8. Riscos

| Risco | Efeito | Mitigação no piloto |
|---|---|---|
| Similaridade erra (falso livre / falso igual) | Protocolo indevido ou bloqueio indevido | Parecer é operacional; limiares visíveis; texto lado a lado |
| Acervo incompleto | “Livre” sem a lei real | Deixa explícito: só compara o que está cadastrado |
| PDF só imagem | Não extrai texto | Mensagem clara; .txt como alternativa |
| Confundir com parecer jurídico | Uso indevido | Ajuda e textos: não é análise legal |

## 9. Indicadores de sucesso (piloto)

- Consulta em menos de alguns segundos no acervo de exemplo.
- Código gravado no histórico após cada consulta.
- Assessoria consegue achar a lei de silêncio (1142/2018) a partir de um rascunho sobre barulho após 22h.
- Exportar o acervo em PDF.

## 10. Conclusão

O LeiConsulta atende um **processo de gabinete**, não o processo legislativo completo. O valor está em **consultar antes de protocolar**, com acervo local e custo zero.
