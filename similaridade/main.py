from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOP = {
    "para", "pela", "pelo", "pela", "com", "uma", "uns", "umas", "que", "nao",
    "não", "dos", "das", "nos", "nas", "aos", "às", "este", "esta", "isso",
    "como", "mais", "menos", "sobre", "entre", "depois", "antes", "fica",
    "ficam", "sera", "será", "sendo", "ainda", "onde", "quando", "porque",
}

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
    if score >= 0.22:
        return "parecida"
    return "relacionada"


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
            }
        )
    resultados.sort(key=lambda item: item["score"], reverse=True)
    return {"fonte": "python", "resultados": resultados[:8]}
