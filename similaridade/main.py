import re
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOP = {
    "para", "pela", "pelo", "pela", "com", "uma", "uns", "umas", "que", "nao",
    "não", "dos", "das", "nos", "nas", "aos", "às", "este", "esta", "isso",
    "isto", "como", "mais", "menos", "sobre", "entre", "depois", "antes", "fica",
    "ficam", "sera", "será", "serao", "serão", "sendo", "ainda", "onde",
    "quando", "porque", "porém", "porem", "assim", "alem", "além", "desde",
    "durante", "contra", "segundo", "qualquer", "nenhum", "nenhuma", "sempre",
    "nunca", "muito", "muita", "muitos", "pouco", "pouca", "outro", "outra",
    "outros", "outras", "todo", "toda", "todos", "todas", "cada", "deste",
    "desta", "destes", "destas", "desse", "dessa", "aquele", "aquela", "aquilo",
    "deve", "devem", "devera", "deverá", "deverao", "deverão", "pode", "podem",
    "poderá", "podera", "feito", "forma", "parte", "apenas", "tambem", "também",
    "atraves", "através", "conforme", "disposto", "presente", "artigo", "inciso",
    "paragrafo", "parágrafo", "municipio", "município", "desta", "neste",
    "nesta", "nesse", "nessa", "esses", "essas", "eles", "elas", "seus", "suas",
    "nosso", "nossa", "vosso", "vossa", "mesmo", "mesma", "mesmos", "mesmas",
    "após", "apos", "então", "entao", "hoje", "aqui", "ali", "qual", "quais",
    "cujo", "cuja", "cujos", "cujas", "são", "sao", "está", "esta", "estão",
    "estao", "foi", "foram", "será", "terão", "terao", "tem", "têm", "havia",
    "apresentacao", "apresentação", "apresentar", "utilizar", "utilizado",
    "utilizados", "exemplo", "exemplos", "conteudo", "conteúdo", "conteudos",
    "projeto", "trabalho", "alunos", "equipe", "secao", "seção",
}

LIMIAR_LISTAR = 0.12
LIMIAR_PARECIDA = 0.22
LIMIAR_IGUAL = 0.72
MIN_TERMOS = 3

TOKEN = re.compile(r"[a-zà-ü0-9]{4,}")

app = FastAPI(title="LeiConsulta similaridade")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class LeiIn(BaseModel):
    id: int
    titulo: str
    numero: str = ""
    municipio: str
    ano: int
    ementa: str
    texto: str


class CompareIn(BaseModel):
    texto: str = Field(min_length=8)
    leis: list[LeiIn] = []


@app.get("/health")
def health():
    return {"ok": True}


def nivel(score: float, n_termos: int) -> str:
    if score >= LIMIAR_IGUAL:
        return "igual"
    if score >= LIMIAR_PARECIDA and n_termos >= MIN_TERMOS:
        return "parecida"
    return "relacionada"


def tokens(text: str) -> set[str]:
    return {
        word
        for word in TOKEN.findall(text.lower())
        if word not in STOP
    }


def termos_comuns(query: str, lei: LeiIn) -> list[str]:
    inter = tokens(query) & tokens(f"{lei.titulo} {lei.ementa} {lei.texto}")
    return sorted(inter)[:8]


@app.post("/extrair")
async def extrair(arquivo: UploadFile = File(...)):
    nome = (arquivo.filename or "").lower()
    data = await arquivo.read()
    if nome.endswith(".txt"):
        texto = data.decode("utf-8", errors="ignore")
    elif nome.endswith(".pdf"):
        leitor = PdfReader(BytesIO(data))
        texto = "\n".join((pagina.extract_text() or "") for pagina in leitor.pages)
    else:
        raise HTTPException(status_code=400, detail="Use arquivo .txt ou .pdf.")
    texto = " ".join(texto.split()).strip()
    if len(texto) < 8:
        raise HTTPException(
            status_code=422,
            detail="Não achei texto no arquivo. PDF escaneado (imagem) não entra sem OCR.",
        )
    return {"texto": texto}


@app.post("/compare")
def compare(body: CompareIn):
    if not body.leis:
        return {"fonte": "python", "resultados": []}

    corpus = [
        f"{lei.titulo} {lei.ementa} {lei.texto}" for lei in body.leis
    ]
    docs = [body.texto, *corpus]
    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words=list(STOP),
        ngram_range=(1, 2),
        max_features=8000,
    )
    matrix = vectorizer.fit_transform(docs)
    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    resultados = []
    for lei, score in zip(body.leis, scores):
        value = float(score)
        if value < LIMIAR_LISTAR:
            continue
        termos = termos_comuns(body.texto, lei)
        resultados.append(
            {
                "id": lei.id,
                "titulo": lei.titulo,
                "numero": lei.numero,
                "municipio": lei.municipio,
                "ano": lei.ano,
                "ementa": lei.ementa,
                "texto": lei.texto,
                "score": round(value, 3),
                "nivel": nivel(value, len(termos)),
                "termos": termos,
            }
        )
    resultados.sort(key=lambda item: item["score"], reverse=True)
    return {"fonte": "python", "resultados": resultados[:8]}
