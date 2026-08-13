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
    "como", "mais", "menos", "sobre", "entre", "depois", "antes", "fica",
    "ficam", "sera", "será", "sendo", "ainda", "onde", "quando", "porque",
}

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


def nivel(score: float) -> str:
    if score >= 0.72:
        return "igual"
    if score >= 0.15:
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
        if value < 0.08:
            continue
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
                "nivel": nivel(value),
                "termos": termos_comuns(body.texto, lei),
            }
        )
    resultados.sort(key=lambda item: item["score"], reverse=True)
    return {"fonte": "python", "resultados": resultados[:8]}
