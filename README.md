# LeiConsulta

Plataforma para guardar leis municipais e consultar se uma proposta nova já existe ou é parecida. Evita lei repetida e papel.

| Parte | Pasta | Porta | Função |
|---|---|---|---|
| React | `frontend` | 5173 | Interface |
| Java / Spring Boot | `api` | 8080 | Cadastro, listagem, consulta |
| Python | `similaridade` | 8002 | Semelhança entre textos (TF-IDF) |

Documentos de análise: `docs/analise-de-negocio.md` e `docs/analise-de-requisitos.md`.

Sem serviços pagos. SQLite em `api/data/leis.db`.

## Parte teórica

Um código/identificador aponta para o texto da lei. A consulta compara o rascunho com o acervo (similaridade de texto) e devolve leis iguais ou parecidas. A API segue REST. Camadas: interface, regras (Java), análise de texto (Python).

## Parte prática

Vereador ou deputado cola o rascunho ou envia PDF, recebe um parecer (já existe, é parecida, ou o acervo está livre) com os termos em comum, e só então protocola. Cada consulta ganha um código (ex.: LC-2026-0001) e fica no histórico. Dá para imprimir o parecer, copiar o código, reconsultar, comparar o rascunho com a lei lado a lado e exportar o acervo em PDF. Há um exemplo em `exemplos/rascunho-silencio.txt`. Página **Ajuda** explica os três pareceres. O exemplo inicial usa **Cachoeira/BA**.

## Como rodar

Três terminais.

**1. API Java**

```bash
cd leiconsulta/api
.\mvnw.cmd spring-boot:run
```

O wrapper usa o JDK em `C:\Program Files\Java\jdk-21`. Se ainda falhar: `powershell -File run.ps1`

**2. Similaridade Python**

```bash
cd leiconsulta/similaridade
C:\Users\teu02\AppData\Local\Programs\Python\Python312\python.exe -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8002 --reload
```

**3. Interface**

```bash
cd leiconsulta/frontend
npm install
npm run dev
```

Abra http://localhost:5173

No Windows, para uso no gabinete: dois cliques em `Ligar-LeiConsulta.bat` (sobe os três serviços, espera e abre o navegador). Senha inicial: **Cachoeira2026** (troque em `api/src/main/resources/application.properties`). Manual: `docs/uso-no-gabinete.md`.

Ou, na mão:

```powershell
cd leiconsulta
powershell -File .\iniciar.ps1
```

Se o Python estiver desligado, o Java ainda consulta (comparação mais simples por palavras). PDF e .txt (até 5 MB) são lidos pelo Java. A cada ligar da API, o SQLite é copiado para `api/data/backups/`.

Testes das regras de parecer (na pasta `api`):

```bash
.\mvnw.cmd test
```

## API

- `GET /api/acesso` → `{ precisaSenha, logado }`
- `POST /api/login` `{ "senha": "..." }` (cookie de sessão)
- `POST /api/sair`
- `GET /api/health`
- `GET /api/leis`
- `GET /api/leis/{id}`
- `PUT /api/leis/{id}`
- `DELETE /api/leis/{id}`
- `POST /api/consultar` `{ "texto": "...", "municipio": "opcional", "excluirId": "opcional" }` → `parecer` + `codigo` (ex.: `LC-2026-0001`)
- `GET /api/consultas`
- `GET /api/consultas/{codigo}`
- `DELETE /api/consultas/{codigo}`
- `POST /api/extrair` (multipart `arquivo`: `.txt` ou `.pdf`) → `{ "texto": "..." }`
