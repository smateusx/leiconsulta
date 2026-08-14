# Usar o LeiConsulta no gabinete

O sistema roda **neste computador**. Não precisa de internet paga nem de nuvem. Compare só o que estiver no acervo desta máquina.

## Ligar (todo dia)

1. Dê dois cliques em `Ligar-LeiConsulta.bat` (na pasta do projeto).
2. Espere abrir o navegador em http://localhost:5173/
3. Senha inicial: **Cachoeira2026**
4. Não feche as janelas pretas enquanto estiver usando.

Para trocar a senha, edite `api/src/main/resources/application.properties` na linha `leiconsulta.senha=` e ligue de novo.

## Uso diário

1. **Consultar** — cole o rascunho (ou envie `.txt` / PDF com texto selecionável, até 5 MB).
2. Leia o parecer. Não é parecer jurídico da Câmara; é filtro operacional de texto repetido.
3. Se a lei for protocolada/aprovada e ainda não estiver no acervo, **Nova lei**.
4. O acervo precisa estar completo. “Nada parecido” só vale para o que foi cadastrado.

## Cópia de segurança

- Toda vez que a API sobe, o arquivo `api/data/leis.db` é copiado para `api/data/backups/` (as 14 mais recentes).
- Na tela Acervo também dá para baixar uma cópia em JSON e restaurar (pede confirmação).
- Para voltar um `.db` antigo: **feche** o LeiConsulta, copie o arquivo de `backups` para `api/data/leis.db` (substitua) e ligue de novo.

## O que ainda não faz (de propósito, sem custo)

- PDF só de imagem (escaneado): converta para texto ou use um PDF em que dá para selecionar as palavras.
- Diário Oficial automático: cadastre as leis (ou cole o texto).
- Vários logins com papéis diferentes: a senha é compartilhada no gabinete.
- Hospedagem na internet: o acervo fica neste PC. Não publique a senha padrão.

## Se não abrir

- Java 21, Node.js e (opcional) Python 3.12 instalados neste PC.
- Portas 8080, 8002 e 5173 livres.
- Primeira vez no frontend: na pasta `frontend`, rode `npm install`.
