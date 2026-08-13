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
  const [python, setPython] = useState(false);
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
    const [listRes, healthRes] = await Promise.all([
      fetch(`${API}/api/leis`),
      fetch(`${API}/api/health`),
    ]);
    if (!listRes.ok) throw new Error("api");
    setLeis(await listRes.json());
    if (healthRes.ok) {
      const health = await healthRes.json();
      setApiUp(true);
      setPython(Boolean(health.python));
    } else {
      setApiUp(true);
    }
  }

  useEffect(() => {
    const onPop = () => setPage(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    load().catch(() => {
      setApiUp(false);
      setError("Não foi possível falar com a API Java. Rode a pasta api com mvnw.");
    });
  }, [page]);

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
        {apiUp === false && (
          <p className="msg error">{error}</p>
        )}
        {page === "/" && <Home go={go} python={python} total={leis.length} />}
        {page === "/consultar" && (
          <Consultar python={python} onError={setError} error={error} go={go} />
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
                setError(data.error || `Não foi possível apagar (código ${res.status}).`);
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

function Home({ go, python, total }) {
  const [stats, setStats] = useState({ consultas: 0, bloquear: 0, revisar: 0, livre: 0 });

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
      <p className="status">
        {python
          ? "Similaridade no Python (TF-IDF). PDF digital entra pelo Python."
          : "Similaridade no Java (palavras). Ligue o Python para PDF e o motor completo."}
      </p>
    </section>
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

function baixarParecer(result, parecer, texto) {
  const linhas = [
    "LeiConsulta — parecer de consulta",
    `Código: ${result.codigo || "sem código"}`,
    `Município: Cachoeira/BA`,
    `Data: ${new Date().toLocaleString("pt-BR")}`,
    `Parecer: ${parecer.titulo}`,
    parecer.texto,
    `Fonte: ${result.fonte === "python" ? "Python" : "Java"}`,
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

function Consultar({ python, onError, error, go }) {
  const [texto, setTexto] = useState("");
  const [municipio, setMunicipio] = useState("Cachoeira");
  const [arquivoNome, setArquivoNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aberto, setAberto] = useState(null);
  const [copiado, setCopiado] = useState(false);

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
      onError("A API Java está fora do ar.");
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
        {python ? " A comparação usa Python." : " A comparação usa o Java se o Python estiver desligado."}
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
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          placeholder="ex.: Cachoeira"
        />
        <label htmlFor="rascunho">Texto da proposta</label>
        <textarea
          id="rascunho"
          rows="8"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Proíbe barulho depois das 22 horas no perímetro urbano..."
          required
        />
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
            Fonte: {result.fonte === "python" ? "Python" : "Java"}
            {result.resultados?.length
              ? ` · ${result.resultados.length} lei(s) próxima(s)`
              : " · nada no acervo"}
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
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 1500);
                  })
                  .catch(() => onError("Não foi possível copiar o código."));
              }}
            >
              {copiado ? "Código copiado" : "Copiar código"}
            </button>
          )}
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
          {(result.resultados || []).map((item) => (
            <article key={item.id} className={`match ${item.nivel}`}>
              <strong>{item.titulo}</strong>
              <p>
                {item.numero ? `Lei nº ${item.numero} · ` : ""}
                {item.municipio} · {item.ano} · {Math.round(item.score * 100)}% ·{" "}
                {NIVEL[item.nivel] || item.nivel}
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
          ))}
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
  const anos = [...new Set(leis.map((lei) => lei.ano))].sort((a, b) => b - a);
  const municipios = [...new Set(leis.map((lei) => lei.municipio))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
  const termo = busca.trim().toLowerCase();
  const filtradas = leis.filter((lei) => {
    if (ano && String(lei.ano) !== ano) return false;
    if (municipio && lei.municipio !== municipio) return false;
    if (!termo) return true;
    return [lei.titulo, lei.numero, lei.municipio, lei.ementa, lei.texto, String(lei.ano)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(termo);
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
      (item) => item.nivel === "igual" || item.nivel === "parecida" || item.score >= 0.08
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
      <div className="filtros tres">
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
      </div>
      {error && <p className="msg error">{error}</p>}
      {notice && <p className="msg ok">{notice}</p>}
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

  useEffect(() => {
    fetch(`${API}/api/consultas`)
      .then((res) => {
        if (!res.ok) throw new Error("api");
        return res.json();
      })
      .then(setItens)
      .catch(() => setErro("Não foi possível carregar o histórico."));
  }, []);

  const filtradas = filtro
    ? itens.filter((item) => item.parecer === filtro)
    : itens;

  return (
    <section className="card">
      <h1 className="page-title">Histórico</h1>
      <p className="hint">
        Cada consulta ganha um código. Serve para mostrar que o acervo foi checado antes de protocolar.
      </p>
      <label htmlFor="filtro-parecer">Parecer</label>
      <select id="filtro-parecer" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
        <option value="">Todos</option>
        <option value="nao_protocolar">Já existiam</option>
        <option value="revisar">Para revisar</option>
        <option value="livre">Livres</option>
      </select>
      {erro && <p className="msg error">{erro}</p>}
      {!filtradas.length && !erro && (
        <p className="hint">
          {itens.length ? "Nenhuma consulta com esse parecer." : "Ainda não há consultas gravadas."}
        </p>
      )}
      <div className="list">
        {filtradas.map((item) => (
          <article key={item.id} className={`match ${item.parecer === "nao_protocolar" ? "igual" : item.parecer === "revisar" ? "parecida" : ""}`}>
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
      <h2 className="sub">Código da consulta</h2>
      <p className="hint">
        Cada consulta ganha um código (ex.: LC-2026-0001). Copie, imprima ou baixe o parecer
        para mostrar que o acervo foi checado.
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
        (item) => item.nivel === "igual" || item.nivel === "parecida" || item.score >= 0.08
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
        Antes de guardar, o sistema consulta o acervo. Se for idêntica ou parecida, explica o motivo e não grava.
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
        <input id="municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} required />
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
        <button type="submit" disabled={loading}>
          {loading ? "Checando o acervo…" : "Guardar no acervo"}
        </button>
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


