import { useEffect, useState } from "react";
import "./App.css";
import Logo from "./Logo.jsx";

const API = import.meta.env.VITE_API_URL || "";
const MAX_ARQUIVO_BYTES = 5 * 1024 * 1024;

const ROUTES = {
  "/": "Início",
  "/consultar": "Consultar",
  "/acervo": "Acervo",
  "/historico": "Histórico",
  "/nova": "Nova lei",
  "/ajuda": "Ajuda",
};

const PARECER = {
  nao_protocolar: {
    titulo: "Já existe lei igual ou quase igual",
    texto: "Não protocolar outra com o mesmo conteúdo. Use a lei que já está no acervo.",
  },
  revisar: {
    titulo: "Há leis parecidas",
    texto: "Leia o texto abaixo antes de protocolar. Pode ser o mesmo assunto com outra redação.",
  },
  livre: {
    titulo: "Nada suficientemente parecido",
    texto: "Pode seguir com a proposta. Depois guarde a lei no acervo.",
  },
};

const NIVEL = {
  igual: "igual",
  parecida: "parecida",
  relacionada: "relacionada",
};

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return ROUTES[path] ? path : "/";
}

export default function App() {
  const [page, setPage] = useState(currentPath);
  const [menuOpen, setMenuOpen] = useState(false);
  const [leis, setLeis] = useState([]);
  const [apiUp, setApiUp] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function go(to) {
    const next = to.replace(/\/+$/, "") || "/";
    window.history.pushState({}, "", next);
    setPage(next);
    setMenuOpen(false);
    setError("");
    setNotice("");
    window.scrollTo(0, 0);
  }

  async function load() {
    const listRes = await fetch(`${API}/api/leis`);
    if (!listRes.ok) throw new Error("api");
    setLeis(await listRes.json());
    setApiUp(true);
  }

  useEffect(() => {
    const onPop = () => setPage(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    load().catch(() => {
      setApiUp(false);
      setError("Não foi possível falar com o servidor. Tente de novo em instantes.");
    });
  }, [page]);

  const municipiosAcervo = [...new Set(leis.map((lei) => lei.municipio).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  return (
    <div className="shell">
      <header className="site-header no-print">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            go("/");
          }}
        >
          <Logo />
          LeiConsulta
        </a>
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Fechar" : "Menu"}
        </button>
        <nav className={menuOpen ? "nav open" : "nav"}>
          {Object.entries(ROUTES).map(([path, label]) => (
            <a
              key={path}
              href={path}
              className={page === path ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                go(path);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main className="page">
        <datalist id="municipios-acervo">
          {municipiosAcervo.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        {apiUp === false && (
          <p className="msg error">{error}</p>
        )}
        {page === "/" && <Home go={go} leis={leis} />}
        {page === "/consultar" && (
          <Consultar onError={setError} error={error} go={go} />
        )}
        {page === "/historico" && <Historico go={go} />}
        {page === "/ajuda" && <Ajuda go={go} />}
        {page === "/acervo" && (
          <Acervo
            leis={leis}
            error={error}
            notice={notice}
            onSaved={async (msg) => {
              setNotice(msg);
              await load();
            }}
            onDelete={async (lei) => {
              const ok = window.confirm(`Apagar do acervo?\n\n${lei.titulo}${lei.numero ? ` (Lei nº ${lei.numero})` : ""}`);
              if (!ok) return;
              const res = await fetch(`${API}/api/leis/${lei.id}`, { method: "DELETE" });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                setError(data.error || "Não foi possível apagar a lei.");
                return;
              }
              setNotice("Lei apagada.");
              await load();
            }}
          />
        )}
        {page === "/nova" && (
          <Nova
            error={error}
            notice={notice}
            onSaved={async () => {
              setNotice("Lei guardada no acervo.");
              await load();
              go("/acervo");
            }}
            onError={setError}
          />
        )}
      </main>
      <footer className="site-footer no-print">
        <p>LeiConsulta · Cachoeira/BA · acervo municipal local</p>
        <button type="button" className="linkish" onClick={() => go("/ajuda")}>
          Como usar
        </button>
      </footer>
    </div>
  );
}

function Home({ go, leis = [] }) {
  const total = leis.length;
  const [stats, setStats] = useState({
    consultas: 0,
    bloquear: 0,
    revisar: 0,
    livre: 0,
    recentes: [],
  });
  const porAno = [...new Set(leis.map((lei) => lei.ano))]
    .sort((a, b) => b - a)
    .map((ano) => ({ ano, qtd: leis.filter((lei) => lei.ano === ano).length }));

  useEffect(() => {
    fetch(`${API}/api/consultas`)
      .then((res) => (res.ok ? res.json() : []))
      .then((itens) => {
        const list = Array.isArray(itens) ? itens : [];
        setStats({
          consultas: list.length,
          bloquear: list.filter((item) => item.parecer === "nao_protocolar").length,
          revisar: list.filter((item) => item.parecer === "revisar").length,
          livre: list.filter((item) => item.parecer === "livre").length,
          recentes: list.slice(0, 3),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <section className="home">
      <p className="kicker">Cachoeira / Bahia</p>
      <h1>Consulte antes de criar a lei.</h1>
      <p className="lead">
        Cole o rascunho ou envie um PDF. O sistema diz se já existe, se é
        parecida, ou se o acervo está livre. Menos papel, menos lei repetida.
      </p>
      <div className="painel">
        <div>
          <strong>{total}</strong>
          <span>leis no acervo</span>
        </div>
        <div>
          <strong>{stats.consultas}</strong>
          <span>consultas</span>
        </div>
        <div>
          <strong>{stats.bloquear}</strong>
          <span>já existiam</span>
        </div>
        <div>
          <strong>{stats.revisar}</strong>
          <span>para revisar</span>
        </div>
      </div>
      {porAno.length > 0 && (
        <p className="hint">
          Acervo por ano:{" "}
          {porAno.map((item, i) => (
            <span key={item.ano}>
              {i ? " · " : ""}
              <button
                type="button"
                className="linkish"
                onClick={() => {
                  sessionStorage.setItem("leiconsulta.acervoAno", String(item.ano));
                  go("/acervo");
                }}
              >
                {item.ano} ({item.qtd})
              </button>
            </span>
          ))}
        </p>
      )}
      <ol className="steps">
        <li>Cole o texto ou envie .txt / .pdf</li>
        <li>Leia o parecer e os trechos em comum</li>
        <li>Protocola só se o acervo estiver livre. Cada consulta ganha um código (LC-2026-0001).</li>
      </ol>
      <div className="home-actions">
        <button type="button" onClick={() => go("/consultar")}>
          Consultar proposta
        </button>
        <button type="button" className="ghost" onClick={() => go("/acervo")}>
          Ver acervo ({total})
        </button>
        <button type="button" className="ghost" onClick={() => go("/historico")}>
          Histórico
        </button>
      </div>
      {stats.recentes.length > 0 && (
        <div className="recentes">
          <p className="kicker">Últimos comprovantes</p>
          {stats.recentes.map((item) => (
            <button
              key={item.id}
              type="button"
              className="ghost recente"
              onClick={() => {
                sessionStorage.setItem("leiconsulta.abrirCodigo", item.codigo || "");
                go("/historico");
              }}
            >
              <strong>{item.codigo}</strong>
              <span>
                {rotuloParecer(item.parecer)} · {formatarData(item.criadoEm)}
              </span>
            </button>
          ))}
        </div>
      )}
      <form
        className="codigo-form"
        onSubmit={(e) => {
          e.preventDefault();
          const campo = e.currentTarget.elements.namedItem("codigo-home");
          const valor = String(campo?.value || "").trim();
          if (!valor) return;
          sessionStorage.setItem("leiconsulta.abrirCodigo", valor);
          go("/historico");
        }}
      >
        <label htmlFor="codigo-home">Abrir comprovante pelo código</label>
        <div className="form-actions">
          <input
            id="codigo-home"
            name="codigo-home"
            placeholder="ex.: LC-2026-0001"
            autoComplete="off"
          />
          <button type="submit">Abrir</button>
        </div>
      </form>
    </section>
  );
}

function ResultadoLei({ item, texto, aberto, setAberto }) {
  return (
    <article className={`match ${item.nivel}`}>
      <strong>{item.titulo}</strong>
      <p>
        {item.numero ? `Lei nº ${item.numero} · ` : ""}
        {item.municipio} · {item.ano} · {Math.round(item.score * 100)}% ·{" "}
        {item.nivel === "igual"
          ? "igual"
          : item.nivel === "parecida"
            ? "parecida"
            : "só palavras em comum"}
      </p>
      <p>{item.ementa}</p>
      {item.termos?.length > 0 && (
        <p className="termos">
          {item.termos.map((termo) => (
            <span key={termo}>{termo}</span>
          ))}
        </p>
      )}
      <button
        className="ghost small no-print"
        type="button"
        onClick={() => setAberto(aberto === item.id ? null : item.id)}
      >
        {aberto === item.id ? "Ocultar texto" : "Ler texto"}
      </button>
      {aberto === item.id && (
        <div className="lado">
          <div>
            <p className="kicker">Sua proposta</p>
            <p className="full-text">{texto}</p>
          </div>
          <div>
            <p className="kicker">Lei do acervo</p>
            <Destaque texto={item.texto} termos={item.termos} />
          </div>
        </div>
      )}
    </article>
  );
}

function Destaque({ texto, termos }) {
  if (!texto) return null;
  const lista = (termos || []).filter(Boolean);
  if (!lista.length) {
    return <p className="full-text">{texto}</p>;
  }
  const escaped = lista.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = texto.split(re);
  return (
    <p className="full-text">
      {parts.map((part, index) =>
        lista.some((item) => item.toLowerCase() === part.toLowerCase()) ? (
          <mark key={index}>{part}</mark>
        ) : (
          part
        )
      )}
    </p>
  );
}

function rotuloParecer(valor) {
  return PARECER[valor]?.titulo || valor;
}

function formatarData(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function copiar(texto) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(texto);
  }
  return Promise.reject();
}

function baixarArquivo(nome, conteudo, tipo = "text/plain;charset=utf-8") {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

function baixarLeiTxt(lei) {
  const nome = String(lei.numero || lei.titulo || "lei")
    .replace(/[^\wÀ-ü/-]+/g, "-")
    .replace(/-+/g, "-");
  baixarArquivo(
    `${nome}.txt`,
    [
      lei.titulo,
      lei.numero ? `Lei nº ${lei.numero}` : "",
      `${lei.municipio} · ${lei.ano}`,
      "",
      lei.ementa,
      "",
      lei.texto,
    ]
      .filter((linha) => linha !== "")
      .join("\n")
  );
}

function baixarParecer(result, parecer, texto) {
  const linhas = [
    "LeiConsulta — parecer de consulta",
    `Código: ${result.codigo || "sem código"}`,
    `Município: Cachoeira/BA`,
    `Data: ${new Date().toLocaleString("pt-BR")}`,
    `Parecer: ${parecer.titulo}`,
    parecer.texto,
    "",
    "Rascunho:",
    texto,
    "",
    "Leis próximas:",
  ];
  for (const item of result.resultados || []) {
    linhas.push(
      `- ${item.numero ? `Lei nº ${item.numero} · ` : ""}${item.titulo} (${Math.round(item.score * 100)}% · ${item.nivel})`
    );
  }
  baixarArquivo(`${result.codigo || "parecer"}.txt`, `${linhas.join("\n")}\n`);
}

function exportarPdf(leis) {
  const artigos = leis
    .map((lei) => {
      const num = lei.numero ? `Lei nº ${lei.numero} · ` : "";
      const titulo = String(lei.titulo || "").replace(/</g, "&lt;");
      const ementa = String(lei.ementa || "").replace(/</g, "&lt;");
      const texto = String(lei.texto || "").replace(/</g, "&lt;");
      return `<article><h2>${titulo}</h2><p class="meta">${num}${lei.municipio} · ${lei.ano}</p><p>${ementa}</p><p>${texto}</p></article>`;
    })
    .join("");
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Acervo LeiConsulta</title>
<style>
  body { font-family: Georgia, serif; color: #1d2430; padding: 24px; }
  h1 { font-size: 22px; }
  article { page-break-inside: avoid; margin: 0 0 28px; padding: 0 0 16px; border-bottom: 1px solid #ccc; }
  h2 { font-size: 16px; margin: 0 0 6px; }
  .meta { color: #5c6470; font-size: 13px; }
  p { line-height: 1.45; }
</style></head><body>
<h1>LeiConsulta — acervo</h1>
<p>Cachoeira/BA · ${leis.length} lei(s) · ${new Date().toLocaleString("pt-BR")}</p>
${artigos}
</body></html>`);
  doc.close();
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(() => iframe.remove(), 2000);
}

const EXEMPLO_RASCUNHO =
  "Proíbe a produção de ruído que perturbe o sossego após as 22 horas e antes das 7 horas no perímetro urbano de Cachoeira, Bahia, inclusive bares, festas e obras noturnas sem autorização.";

async function lerArquivo(file) {
  const nome = (file.name || "").toLowerCase();
  if (file.size > MAX_ARQUIVO_BYTES) {
    throw new Error("O arquivo passa de 5 MB. Envie um .txt ou .pdf de até 5 MB.");
  }
  if (!nome.endsWith(".txt") && !nome.endsWith(".pdf")) {
    throw new Error("Formato não aceito. Use só .txt ou .pdf (texto selecionável), até 5 MB.");
  }
  if (nome.endsWith(".txt")) {
    return file.text();
  }
  const body = new FormData();
  body.append("arquivo", file);
  const res = await fetch(`${API}/api/extrair`, { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Não foi possível ler o arquivo. Use .txt ou .pdf de até 5 MB.");
  }
  return data.texto || "";
}

function DicaArquivo() {
  return (
    <p className="hint">
      Aceito só <strong>.txt</strong> e <strong>.pdf</strong> com texto selecionável, até{" "}
      <strong>5 MB</strong>. PDF escaneado (imagem) não entra.
    </p>
  );
}

function Consultar({ onError, error, go }) {
  const [texto, setTexto] = useState("");
  const [municipio, setMunicipio] = useState("Cachoeira");
  const [arquivoNome, setArquivoNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aberto, setAberto] = useState(null);
  const [copiado, setCopiado] = useState("");

  useEffect(() => {
    const rascunho = sessionStorage.getItem("leiconsulta.rascunho");
    const mun = sessionStorage.getItem("leiconsulta.municipio");
    if (rascunho) {
      setTexto(rascunho);
      sessionStorage.removeItem("leiconsulta.rascunho");
    }
    if (mun) {
      setMunicipio(mun);
      sessionStorage.removeItem("leiconsulta.municipio");
    }
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    onError("");
    setLoading(true);
    setResult(null);
    setAberto(null);
    try {
      const res = await fetch(`${API}/api/consultar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, municipio }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Não foi possível consultar.");
        return;
      }
      setResult(data);
    } catch {
      onError("Não foi possível falar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  const parecer = result ? PARECER[result.parecer] || PARECER.livre : null;

  return (
    <section className="card">
      <h1 className="page-title">Consultar proposta</h1>
      <p className="hint">
        Cole o rascunho ou envie um arquivo. Aceito só .txt e .pdf (texto selecionável), até 5 MB.
      </p>
      <form onSubmit={onSubmit} className="no-print">
        <label htmlFor="arquivo">Arquivo (opcional) — .txt ou .pdf, até 5 MB</label>
        <input
          id="arquivo"
          type="file"
          accept=".txt,.pdf,text/plain,application/pdf"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            onError("");
            try {
              const extraido = await lerArquivo(file);
              setTexto(extraido);
              setArquivoNome(file.name);
              setResult(null);
            } catch (err) {
              onError(err.message);
            }
          }}
        />
        <DicaArquivo />
        {arquivoNome && <p className="hint">Lido: {arquivoNome}</p>}
        <label htmlFor="mun">Município</label>
        <input
          id="mun"
          list="municipios-acervo"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          placeholder="ex.: Cachoeira"
        />
        <label htmlFor="rascunho">Texto da proposta (mínimo 8 caracteres)</label>
        <textarea
          id="rascunho"
          rows="8"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Proíbe barulho depois das 22 horas no perímetro urbano..."
          required
          minLength={8}
        />
        <p className="hint">{texto.trim().length} caracteres</p>
        <div className="form-actions">
          <button type="submit" disabled={loading || texto.trim().length < 8}>
            {loading ? "Comparando…" : "Ver se já existe"}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setTexto(EXEMPLO_RASCUNHO);
              setMunicipio("Cachoeira");
              setArquivoNome("");
              setResult(null);
            }}
          >
            Usar exemplo de Cachoeira
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setTexto("");
              setArquivoNome("");
              setResult(null);
              onError("");
            }}
          >
            Limpar rascunho
          </button>
          {texto.trim().length >= 8 && (
            <button
              type="button"
              className="ghost"
              onClick={() => {
                copiar(texto)
                  .then(() => {
                    setCopiado("rascunho");
                    setTimeout(() => setCopiado(""), 1500);
                  })
                  .catch(() => onError("Não foi possível copiar."));
              }}
            >
              {copiado === "rascunho" ? "Rascunho copiado" : "Copiar rascunho"}
            </button>
          )}
        </div>
      </form>
      {error && <p className="msg error">{error}</p>}
      {result && parecer && (
        <div className={`parecer ${result.parecer || "livre"}`} id="parecer-print">
          <p className="print-only kicker">LeiConsulta · Cachoeira/BA · parecer de consulta</p>
          {result.codigo && <p className="codigo">Consulta {result.codigo}</p>}
          <strong>{parecer.titulo}</strong>
          <p>{parecer.texto}</p>
          <p className="hint">
            Este parecer só compara o texto com o acervo cadastrado. Não é análise jurídica.
          </p>
          <p className="hint">
            {result.resultados?.length
              ? `${result.resultados.length} lei(s) próxima(s)`
              : "Nada parecido no acervo"}
            {" · "}
            {new Date().toLocaleString("pt-BR")}
          </p>
          <button
            className="ghost small no-print"
            type="button"
            onClick={() => window.print()}
          >
            Imprimir parecer
          </button>
          <button
            className="ghost small no-print"
            type="button"
            onClick={() => baixarParecer(result, parecer, texto)}
          >
            Baixar parecer
          </button>
          {result.codigo && (
            <button
              className="ghost small no-print"
              type="button"
              onClick={() => {
                copiar(result.codigo)
                  .then(() => {
                    setCopiado("codigo");
                    setTimeout(() => setCopiado(""), 1500);
                  })
                  .catch(() => onError("Não foi possível copiar o código."));
              }}
            >
              {copiado === "codigo" ? "Código copiado" : "Copiar código"}
            </button>
          )}
          <button
            className="ghost small no-print"
            type="button"
            onClick={() => {
              copiar(
                [result.codigo ? `Consulta ${result.codigo}` : "", parecer.titulo, parecer.texto]
                  .filter(Boolean)
                  .join("\n")
              )
                .then(() => {
                  setCopiado("parecer");
                  setTimeout(() => setCopiado(""), 1500);
                })
                .catch(() => onError("Não foi possível copiar."));
            }}
          >
            {copiado === "parecer" ? "Parecer copiado" : "Copiar parecer"}
          </button>
          <button
            className="ghost small no-print"
            type="button"
            onClick={() => go("/historico")}
          >
            Ver histórico
          </button>
        </div>
      )}
      {result && (
        <div className="results">
          {(result.resultados || [])
            .filter((item) => item.nivel === "igual" || item.nivel === "parecida")
            .map((item) => (
              <ResultadoLei
                key={item.id}
                item={item}
                texto={texto}
                aberto={aberto}
                setAberto={setAberto}
              />
            ))}
          {(result.resultados || []).some((item) => item.nivel === "relacionada") && (
            <div className="no-print">
              <h2 className="sub">Só palavras em comum — não impede protocolar</h2>
              <p className="hint">
                Aparece aqui lei com pouca semelhança. Não é o mesmo assunto.
              </p>
              {(result.resultados || [])
                .filter((item) => item.nivel === "relacionada")
                .map((item) => (
                  <ResultadoLei
                    key={item.id}
                    item={item}
                    texto={texto}
                    aberto={aberto}
                    setAberto={setAberto}
                  />
                ))}
            </div>
          )}
        </div>
      )}
      {result?.parecer === "livre" && (
        <button
          type="button"
          className="ghost no-print"
          onClick={() => {
            sessionStorage.setItem("leiconsulta.novaTexto", texto);
            sessionStorage.setItem("leiconsulta.novaMunicipio", municipio);
            go("/nova");
          }}
        >
          Guardar esta proposta no acervo
        </button>
      )}
    </section>
  );
}

function Acervo({ leis, error, notice, onDelete, onSaved }) {
  const [busca, setBusca] = useState("");
  const [ano, setAno] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [aberto, setAberto] = useState(null);
  const [editando, setEditando] = useState(null);
  const [erroEdicao, setErroEdicao] = useState("");
  const [copiadoId, setCopiadoId] = useState(null);
  const [ordem, setOrdem] = useState("ano-desc");

  useEffect(() => {
    const anoInicial = sessionStorage.getItem("leiconsulta.acervoAno");
    if (anoInicial) {
      setAno(anoInicial);
      sessionStorage.removeItem("leiconsulta.acervoAno");
    }
  }, []);
  const anos = [...new Set(leis.map((lei) => lei.ano))].sort((a, b) => b - a);
  const municipios = [...new Set(leis.map((lei) => lei.municipio))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
  const termo = busca.trim().toLowerCase();
  const filtradas = leis
    .filter((lei) => {
      if (ano && String(lei.ano) !== ano) return false;
      if (municipio && lei.municipio !== municipio) return false;
      if (!termo) return true;
      return [lei.titulo, lei.numero, lei.municipio, lei.ementa, lei.texto, String(lei.ano)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(termo);
    })
    .sort((a, b) => {
      if (ordem === "titulo") {
        return String(a.titulo || "").localeCompare(String(b.titulo || ""), "pt-BR");
      }
      if (ordem === "ano-asc") {
        return a.ano - b.ano || String(a.titulo || "").localeCompare(String(b.titulo || ""), "pt-BR");
      }
      return b.ano - a.ano || String(a.titulo || "").localeCompare(String(b.titulo || ""), "pt-BR");
    });

  async function salvarEdicao(e) {
    e.preventDefault();
    setErroEdicao("");
    const consulta = await fetch(`${API}/api/consultar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texto: `${editando.titulo} ${editando.ementa} ${editando.texto}`,
      }),
    });
    const checagem = await consulta.json().catch(() => ({}));
    const outros = (checagem.resultados || []).filter((item) => item.id !== editando.id);
    const niveis = outros.some(
      (item) => item.nivel === "igual" || item.nivel === "parecida"
    );
    if (niveis) {
      setErroEdicao(motivoNaoGuardar({ ...checagem, resultados: outros }));
      return;
    }
    const res = await fetch(`${API}/api/leis/${editando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: editando.titulo,
        numero: editando.numero || "",
        municipio: editando.municipio,
        ano: Number(editando.ano),
        ementa: editando.ementa,
        texto: editando.texto,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErroEdicao(data.error || "Não foi possível guardar a alteração.");
      return;
    }
    setEditando(null);
    await onSaved("Lei atualizada.");
  }

  return (
    <section className="card">
      <h1 className="page-title">Acervo</h1>
      <div className="filtros quatro">
        <div>
          <label htmlFor="busca">Buscar</label>
          <input
            id="busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="título, número, ementa, Paraguaçu..."
          />
        </div>
        <div>
          <label htmlFor="mun-filtro">Município</label>
          <select id="mun-filtro" value={municipio} onChange={(e) => setMunicipio(e.target.value)}>
            <option value="">Todos</option>
            {municipios.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ano-filtro">Ano</label>
          <select id="ano-filtro" value={ano} onChange={(e) => setAno(e.target.value)}>
            <option value="">Todos</option>
            {anos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ordem-filtro">Ordem</label>
          <select id="ordem-filtro" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
            <option value="ano-desc">Mais recente</option>
            <option value="ano-asc">Mais antiga</option>
            <option value="titulo">Título A–Z</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button
          type="button"
          className="ghost"
          disabled={!filtradas.length}
          onClick={() => exportarPdf(filtradas)}
        >
          Exportar PDF
        </button>
        <button
          type="button"
          className="ghost"
          disabled={!filtradas.length}
          onClick={() =>
            baixarArquivo(
              `leiconsulta-acervo-${new Date().toISOString().slice(0, 10)}.json`,
              JSON.stringify(filtradas, null, 2),
              "application/json"
            )
          }
        >
          Cópia de segurança
        </button>
        <label className="ghost file-btn">
          Restaurar cópia
          <input
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const ok = window.confirm(
                "Restaurar esta cópia? Leis novas entram no acervo. As que já existem ficam como estão."
              );
              if (!ok) return;
              try {
                const dados = JSON.parse(await file.text());
                if (!Array.isArray(dados)) {
                  throw new Error("Esse arquivo não é uma cópia do acervo.");
                }
                let guardadas = 0;
                let ignoradas = 0;
                for (const item of dados) {
                  if (!item?.titulo || !item?.municipio || !item?.ementa || !item?.texto) {
                    ignoradas += 1;
                    continue;
                  }
                  const res = await fetch(`${API}/api/leis`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      titulo: item.titulo,
                      numero: item.numero || "",
                      municipio: item.municipio,
                      ano: Number(item.ano) || new Date().getFullYear(),
                      ementa: item.ementa,
                      texto: item.texto,
                    }),
                  });
                  if (res.status === 201) guardadas += 1;
                  else ignoradas += 1;
                }
                setErroEdicao("");
                await onSaved(
                  guardadas
                    ? `${guardadas} lei(s) restaurada(s).${ignoradas ? ` ${ignoradas} já existiam ou foram ignoradas.` : ""}`
                    : "Nenhuma lei nova. As da cópia já estavam no acervo ou o arquivo não tinha leis válidas."
                );
              } catch {
                setErroEdicao("Não foi possível restaurar. Use o arquivo da Cópia de segurança.");
              }
            }}
          />
        </label>
        {(busca || ano || municipio) && (
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setBusca("");
              setAno("");
              setMunicipio("");
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>
      {erroEdicao && !editando && <p className="msg error">{erroEdicao}</p>}
      {error && <p className="msg error">{error}</p>}
      {notice && <p className="msg ok">{notice}</p>}
      {leis.length > 0 && (
        <p className="hint">
          {filtradas.length === leis.length
            ? `${leis.length} lei(s) no acervo.`
            : `Mostrando ${filtradas.length} de ${leis.length} leis.`}
        </p>
      )}
      {!filtradas.length && (
        <p className="hint">
          {leis.length ? "Nenhuma lei com esse termo." : "Ainda não há leis cadastradas."}
        </p>
      )}
      <div className="list">
        {filtradas.map((lei) => (
          <article key={lei.id} className="law">
            <div>
              <strong>{lei.titulo}</strong>
              <p>
                {lei.numero ? `Lei nº ${lei.numero} · ` : ""}
                {lei.municipio} · {lei.ano}
              </p>
              <p>{lei.ementa}</p>
              {aberto === lei.id && !editando && <p className="full-text">{lei.texto}</p>}
              {editando?.id === lei.id && (
                <form className="edit-form" onSubmit={salvarEdicao}>
                  <label htmlFor={`ed-titulo-${lei.id}`}>Título</label>
                  <input
                    id={`ed-titulo-${lei.id}`}
                    value={editando.titulo}
                    onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
                    required
                  />
                  <label htmlFor={`ed-num-${lei.id}`}>Número</label>
                  <input
                    id={`ed-num-${lei.id}`}
                    value={editando.numero || ""}
                    onChange={(e) => setEditando({ ...editando, numero: e.target.value })}
                  />
                  <label htmlFor={`ed-mun-${lei.id}`}>Município</label>
                  <input
                    id={`ed-mun-${lei.id}`}
                    value={editando.municipio}
                    onChange={(e) => setEditando({ ...editando, municipio: e.target.value })}
                    required
                  />
                  <label htmlFor={`ed-ano-${lei.id}`}>Ano</label>
                  <input
                    id={`ed-ano-${lei.id}`}
                    type="number"
                    value={editando.ano}
                    onChange={(e) => setEditando({ ...editando, ano: e.target.value })}
                    required
                  />
                  <label htmlFor={`ed-em-${lei.id}`}>Ementa</label>
                  <input
                    id={`ed-em-${lei.id}`}
                    value={editando.ementa}
                    onChange={(e) => setEditando({ ...editando, ementa: e.target.value })}
                    required
                  />
                  <label htmlFor={`ed-tx-${lei.id}`}>Texto</label>
                  <textarea
                    id={`ed-tx-${lei.id}`}
                    rows="6"
                    value={editando.texto}
                    onChange={(e) => setEditando({ ...editando, texto: e.target.value })}
                    required
                  />
                  {erroEdicao && <p className="msg error">{erroEdicao}</p>}
                  <div className="form-actions">
                    <button type="submit">Guardar alteração</button>
                    <button type="button" className="ghost" onClick={() => setEditando(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="law-actions">
              <button
                className="ghost small"
                type="button"
                onClick={() => setAberto(aberto === lei.id ? null : lei.id)}
              >
                {aberto === lei.id ? "Ocultar" : "Ler"}
              </button>
              <button
                className="ghost small"
                type="button"
                onClick={() => {
                  setEditando({ ...lei });
                  setAberto(lei.id);
                }}
              >
                Editar
              </button>
              <button
                className="ghost small"
                type="button"
                onClick={() => {
                  copiar(lei.ementa || lei.titulo)
                    .then(() => {
                      setCopiadoId(`ementa-${lei.id}`);
                      setTimeout(() => setCopiadoId(null), 1500);
                    })
                    .catch(() => {});
                }}
              >
                {copiadoId === `ementa-${lei.id}` ? "Copiado" : "Copiar ementa"}
              </button>
              <button
                className="ghost small"
                type="button"
                onClick={() => {
                  copiar(lei.texto || lei.ementa)
                    .then(() => {
                      setCopiadoId(`texto-${lei.id}`);
                      setTimeout(() => setCopiadoId(null), 1500);
                    })
                    .catch(() => {});
                }}
              >
                {copiadoId === `texto-${lei.id}` ? "Copiado" : "Copiar texto"}
              </button>
              <button
                className="ghost small"
                type="button"
                onClick={() => baixarLeiTxt(lei)}
              >
                Baixar texto
              </button>
              <button
                className="ghost small"
                type="button"
                onClick={() => exportarPdf([lei])}
              >
                Imprimir
              </button>
              <button className="danger" type="button" onClick={() => onDelete(lei)}>
                Apagar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Historico({ go }) {
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState("");
  const [aberto, setAberto] = useState(null);
  const [copiado, setCopiado] = useState("");
  const [filtro, setFiltro] = useState("");
  const [buscaCodigo, setBuscaCodigo] = useState("");
  const [destaque, setDestaque] = useState("");
  const [carregou, setCarregou] = useState(false);

  useEffect(() => {
    const pendente = sessionStorage.getItem("leiconsulta.abrirCodigo");
    if (pendente) {
      setBuscaCodigo(pendente);
      setDestaque(pendente.trim().toUpperCase());
      sessionStorage.removeItem("leiconsulta.abrirCodigo");
    }
    fetch(`${API}/api/consultas`)
      .then((res) => {
        if (!res.ok) throw new Error("api");
        return res.json();
      })
      .then((data) => {
        setItens(data);
        setCarregou(true);
      })
      .catch(() => {
        setErro("Não foi possível carregar o histórico.");
        setCarregou(true);
      });
  }, []);

  useEffect(() => {
    if (!carregou) return;
    const codigo = buscaCodigo.trim().toUpperCase();
    if (!/^LC-\d{4}-\d{4}$/.test(codigo)) return;
    if (itens.some((item) => String(item.codigo || "").toUpperCase() === codigo)) return;
    let cancelado = false;
    fetch(`${API}/api/consultas/${encodeURIComponent(codigo)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((item) => {
        if (cancelado || !item?.id) {
          if (!cancelado && !item?.id) {
            setErro("Não achei consulta com esse código.");
          }
          return;
        }
        setErro("");
        setItens((prev) => (prev.some((p) => p.id === item.id) ? prev : [item, ...prev]));
        setDestaque(codigo);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [buscaCodigo, itens, carregou]);

  const termoCodigo = buscaCodigo.trim().toLowerCase();
  const filtradas = itens.filter((item) => {
    if (filtro && item.parecer !== filtro) return false;
    if (!termoCodigo) return true;
    return [item.codigo, item.resumo, item.texto, item.municipio]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(termoCodigo);
  });

  return (
    <section className="card">
      <h1 className="page-title">Histórico</h1>
      <p className="hint">
        Cada consulta ganha um código. Serve para mostrar que o acervo foi checado antes de protocolar.
      </p>
      <label htmlFor="busca-codigo">Buscar</label>
      <input
        id="busca-codigo"
        value={buscaCodigo}
        onChange={(e) => {
          setBuscaCodigo(e.target.value);
          setErro("");
        }}
        placeholder="código, trecho do rascunho, município..."
      />
      <label htmlFor="filtro-parecer">Parecer</label>
      <select id="filtro-parecer" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
        <option value="">Todos</option>
        <option value="nao_protocolar">Já existiam</option>
        <option value="revisar">Para revisar</option>
        <option value="livre">Livres</option>
      </select>
      {(buscaCodigo || filtro) && (
        <div className="form-actions">
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setBuscaCodigo("");
              setFiltro("");
              setDestaque("");
              setErro("");
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
      {erro && <p className="msg error">{erro}</p>}
      {itens.length > 0 && (
        <p className="hint">
          {filtradas.length === itens.length
            ? `${itens.length} consulta(s).`
            : `Mostrando ${filtradas.length} de ${itens.length} consultas.`}
        </p>
      )}
      {!filtradas.length && !erro && (
        <p className="hint">
          {itens.length ? "Nenhuma consulta com esse filtro." : "Ainda não há consultas gravadas."}
        </p>
      )}
      <div className="list">
        {filtradas.map((item) => (
          <article key={item.id} className={`match ${item.parecer === "nao_protocolar" ? "igual" : item.parecer === "revisar" ? "parecida" : ""} ${String(item.codigo || "").toUpperCase() === destaque ? "destaque" : ""}`}>
            <strong>{item.codigo}</strong>
            <p>
              {item.municipio} · {rotuloParecer(item.parecer)} · {formatarData(item.criadoEm)}
            </p>
            <p>{item.resumo}</p>
            <div className="law-actions-row">
              <button
                className="ghost small"
                type="button"
                onClick={() => setAberto(aberto === item.id ? null : item.id)}
              >
                {aberto === item.id ? "Ocultar rascunho" : "Ver rascunho"}
              </button>
              <button
                className="ghost small"
                type="button"
                onClick={() => {
                  copiar(item.codigo)
                    .then(() => {
                      setCopiado(item.codigo);
                      setTimeout(() => setCopiado(""), 1500);
                    })
                    .catch(() => setErro("Não foi possível copiar."));
                }}
              >
                {copiado === item.codigo ? "Copiado" : "Copiar código"}
              </button>
              <button
                className="ghost small"
                type="button"
                onClick={() => {
                  copiar(item.texto || "")
                    .then(() => {
                      setCopiado(`rascunho-${item.id}`);
                      setTimeout(() => setCopiado(""), 1500);
                    })
                    .catch(() => setErro("Não foi possível copiar."));
                }}
              >
                {copiado === `rascunho-${item.id}` ? "Copiado" : "Copiar rascunho"}
              </button>
              <button
                className="ghost small"
                type="button"
                onClick={() => {
                  sessionStorage.setItem("leiconsulta.rascunho", item.texto);
                  sessionStorage.setItem(
                    "leiconsulta.municipio",
                    item.municipio === "todos" ? "Cachoeira" : item.municipio
                  );
                  go("/consultar");
                }}
              >
                Consultar de novo
              </button>
              <button
                className="ghost small"
                type="button"
                onClick={() => {
                  const parecer = PARECER[item.parecer] || PARECER.livre;
                  baixarParecer(
                    {
                      codigo: item.codigo,
                      fonte: item.fonte,
                      parecer: item.parecer,
                      resultados: item.resumo
                        ? [{ titulo: item.resumo, score: 0, nivel: item.parecer, numero: "" }]
                        : [],
                    },
                    parecer,
                    item.texto
                  );
                }}
              >
                Baixar
              </button>
              <button
                className="danger"
                type="button"
                onClick={async () => {
                  const ok = window.confirm(
                    `Apagar esta consulta do histórico?\n\n${item.codigo || ""}`
                  );
                  if (!ok) return;
                  const res = await fetch(
                    `${API}/api/consultas/${encodeURIComponent(item.codigo)}`,
                    { method: "DELETE" }
                  );
                  if (!res.ok) {
                    setErro("Não foi possível apagar a consulta.");
                    return;
                  }
                  setItens((prev) => prev.filter((p) => p.id !== item.id));
                }}
              >
                Apagar
              </button>
            </div>
            {aberto === item.id && <p className="full-text">{item.texto}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function Ajuda({ go }) {
  return (
    <section className="card">
      <h1 className="page-title">Como usar</h1>
      <p className="hint">
        O LeiConsulta guarda leis de Cachoeira/BA e compara um rascunho novo com o acervo.
      </p>
      <h2 className="sub">Os três pareceres</h2>
      <ul className="ajuda-list">
        <li>
          <strong>Já existe.</strong> Não protocolar outra lei com o mesmo conteúdo.
        </li>
        <li>
          <strong>Há leis parecidas.</strong> Leia o texto do acervo. Pode ser o mesmo assunto com outra redação.
        </li>
        <li>
          <strong>Nada parecido.</strong> Pode seguir. Guarde a lei no acervo depois.
        </li>
      </ul>
      <h2 className="sub">Quando o sistema recusa guardar</h2>
      <p className="hint">
        Só recusa se o texto for o mesmo (ou quase) ou o mesmo assunto com outra redação.
        Texto de outro tema entra no acervo.
      </p>
      <h2 className="sub">Acervo</h2>
      <p className="hint">
        Na tela inicial, clique em um ano para ver as leis daquele ano. Dá para ordenar,
        limpar os filtros, copiar a ementa ou o texto, imprimir uma lei, baixar o texto e
        guardar uma <strong>cópia de segurança</strong>. Restaurar essa cópia pede confirmação.
      </p>
      <h2 className="sub">Código da consulta</h2>
      <p className="hint">
        Cada consulta ganha um código (ex.: LC-2026-0001). Copie, imprima, baixe o parecer
        ou abra o comprovante na tela inicial. No histórico dá para apagar uma consulta
        se o rascunho não deve ficar guardado. Não é parecer jurídico da Câmara.
      </p>
      <h2 className="sub">Arquivo</h2>
      <p className="hint">
        Formatos aceitos: <strong>.txt</strong> e <strong>.pdf</strong> (com texto que dá para
        selecionar). Tamanho máximo: <strong>5 MB</strong>. PDF só de imagem (escaneado) não entra.
      </p>
      <button type="button" onClick={() => go("/consultar")}>
        Ir para consultar
      </button>
    </section>
  );
}

function motivoNaoGuardar(consulta) {
  const top = (consulta.resultados || [])[0];
  const identica = consulta.parecer === "nao_protocolar" || top?.nivel === "igual";
  if (!top) {
    return identica
      ? "Não foi guardada porque já existe uma lei idêntica (ou quase idêntica) no acervo."
      : "Não foi guardada porque já existe uma lei parecida no acervo.";
  }
  const nome = top.numero ? `Lei nº ${top.numero} — ${top.titulo}` : top.titulo;
  const pct = Math.round(top.score * 100);
  if (identica) {
    return `Não foi guardada porque o texto é idêntico ou quase idêntico a ${nome} (${pct}% de semelhança). Use a lei que já está no acervo.`;
  }
  return `Não foi guardada porque o texto é parecido com ${nome} (${pct}% de semelhança). Pode ser o mesmo assunto com outra redação.`;
}

function aplicarBloqueio(data, setBloqueio) {
  setBloqueio({
    parecer: data.parecer || "revisar",
    motivo: data.error || motivoNaoGuardar(data),
    resultados: data.resultados || [],
  });
}

function Nova({ error, onSaved, onError }) {
  const [titulo, setTitulo] = useState("");
  const [numero, setNumero] = useState("");
  const [municipio, setMunicipio] = useState("Cachoeira");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [ementa, setEmenta] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [bloqueio, setBloqueio] = useState(null);

  useEffect(() => {
    const rascunho = sessionStorage.getItem("leiconsulta.novaTexto");
    const mun = sessionStorage.getItem("leiconsulta.novaMunicipio");
    if (rascunho) {
      setTexto(rascunho);
      sessionStorage.removeItem("leiconsulta.novaTexto");
    }
    if (mun) {
      setMunicipio(mun);
      sessionStorage.removeItem("leiconsulta.novaMunicipio");
    }
  }, []);

  useEffect(() => {
    const sujo = titulo.trim() || ementa.trim() || texto.trim();
    function avisar(e) {
      if (!sujo) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [titulo, ementa, texto]);

  async function onSubmit(e) {
    e.preventDefault();
    onError("");
    setBloqueio(null);
    setLoading(true);
    try {
      const consulta = await fetch(`${API}/api/consultar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: `${titulo} ${ementa} ${texto}`,
        }),
      });
      const checagem = await consulta.json().catch(() => ({}));
      const niveis = (checagem.resultados || []).some(
        (item) => item.nivel === "igual" || item.nivel === "parecida"
      );
      if (
        checagem.parecer === "nao_protocolar"
        || checagem.parecer === "revisar"
        || niveis
      ) {
        aplicarBloqueio(checagem, setBloqueio);
        return;
      }

      const res = await fetch(`${API}/api/leis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          numero,
          municipio,
          ano: Number(ano),
          ementa,
          texto,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 || data.parecer === "nao_protocolar" || data.parecer === "revisar") {
        aplicarBloqueio(data, setBloqueio);
        return;
      }
      if (!res.ok) {
        onError(
          data.error
          || "Não foi possível guardar a lei. Tente de novo em instantes."
        );
        return;
      }
      onSaved();
    } catch {
      onError("Não foi possível falar com o servidor. A lei não foi guardada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1 className="page-title">Nova lei</h1>
      <p className="hint">
        Antes de guardar, o sistema olha o acervo. Se já existir lei igual ou do mesmo
        assunto, explica o motivo e não grava.
      </p>
      <form onSubmit={onSubmit}>
        <label htmlFor="titulo">Título</label>
        <input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        <label htmlFor="numero">Número (opcional)</label>
        <input
          id="numero"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="ex.: 1142/2018"
        />
        <label htmlFor="municipio">Município</label>
        <input
          id="municipio"
          list="municipios-acervo"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          required
        />
        <label htmlFor="ano">Ano</label>
        <input id="ano" type="number" value={ano} onChange={(e) => setAno(e.target.value)} required />
        <label htmlFor="ementa">Ementa</label>
        <input id="ementa" value={ementa} onChange={(e) => setEmenta(e.target.value)} required />
        <label htmlFor="arquivo-nova">Arquivo (opcional) — .txt ou .pdf, até 5 MB</label>
        <input
          id="arquivo-nova"
          type="file"
          accept=".txt,.pdf,text/plain,application/pdf"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            onError("");
            setBloqueio(null);
            try {
              setTexto(await lerArquivo(file));
            } catch (err) {
              onError(err.message);
            }
          }}
        />
        <DicaArquivo />
        <label htmlFor="texto">Texto</label>
        <textarea id="texto" rows="8" value={texto} onChange={(e) => setTexto(e.target.value)} required />
        <p className="hint">{texto.trim().length} caracteres</p>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Checando o acervo…" : "Guardar no acervo"}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setTitulo("");
              setNumero("");
              setEmenta("");
              setTexto("");
              setBloqueio(null);
              onError("");
            }}
          >
            Limpar ficha
          </button>
        </div>
      </form>
      {bloqueio && (
        <div className={`parecer ${bloqueio.parecer === "nao_protocolar" ? "nao_protocolar" : "revisar"}`}>
          <strong>
            {bloqueio.parecer === "nao_protocolar"
              ? "Não guardada — lei idêntica"
              : "Não guardada — lei parecida"}
          </strong>
          <p>{bloqueio.motivo}</p>
          <div className="results">
            {bloqueio.resultados.slice(0, 3).map((item) => (
              <article key={item.id} className={`match ${item.nivel}`}>
                <strong>{item.titulo}</strong>
                <p>
                  {item.numero ? `Lei nº ${item.numero} · ` : ""}
                  {item.municipio} · {item.ano} · {Math.round(item.score * 100)}% ·{" "}
                  {item.nivel === "igual" ? "idêntica" : item.nivel === "parecida" ? "parecida" : NIVEL[item.nivel] || item.nivel}
                </p>
                <p>{item.ementa}</p>
              </article>
            ))}
          </div>
        </div>
      )}
      {error && <p className="msg error">{error}</p>}
    </section>
  );
}


