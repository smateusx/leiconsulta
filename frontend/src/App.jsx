import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "";

const ROUTES = {
  "/": "Início",
  "/consultar": "Consultar",
  "/acervo": "Acervo",
  "/nova": "Nova lei",
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
      <header className="site-header">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            go("/");
          }}
        >
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
          <Consultar python={python} onError={setError} error={error} />
        )}
        {page === "/acervo" && (
          <Acervo
            leis={leis}
            error={error}
            notice={notice}
            onDelete={async (id) => {
              const ok = window.confirm("Apagar esta lei do acervo?");
              if (!ok) return;
              const res = await fetch(`${API}/api/leis/${id}`, { method: "DELETE" });
              if (!res.ok) {
                setError("Não foi possível apagar.");
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
    </div>
  );
}

function Home({ go, python, total }) {
  return (
    <section className="home">
      <p className="kicker">Acervo municipal</p>
      <h1>Consulte antes de criar a lei.</h1>
      <p className="lead">
        Vereador e deputado colam o rascunho e veem se já existe lei igual ou
        parecida. Menos papel, menos repetição.
      </p>
      <div className="home-actions">
        <button type="button" onClick={() => go("/consultar")}>
          Consultar proposta
        </button>
        <button type="button" className="ghost" onClick={() => go("/acervo")}>
          Ver acervo ({total})
        </button>
      </div>
      <p className="status">
        {python ? "Similaridade no Python (TF-IDF)." : "Similaridade no Java (palavras). Ligue o Python para o motor completo."}
      </p>
    </section>
  );
}

function Consultar({ python, onError, error }) {
  const [texto, setTexto] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    onError("");
    setLoading(true);
    setResult(null);
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

  return (
    <section className="card">
      <h1 className="page-title">Consultar proposta</h1>
      <p className="hint">
        Cole o rascunho. O sistema compara com o acervo
        {python ? " usando Python." : " no Java, se o Python estiver desligado."}
      </p>
      <form onSubmit={onSubmit}>
        <label htmlFor="mun">Município (opcional)</label>
        <input
          id="mun"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          placeholder="ex.: Itaí"
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
        <button type="submit" disabled={loading || texto.trim().length < 8}>
          {loading ? "Comparando…" : "Ver se já existe"}
        </button>
      </form>
      {error && <p className="msg error">{error}</p>}
      {result && (
        <div className="results">
          <p className="hint">
            Fonte: {result.fonte === "python" ? "Python" : "Java"} ·{" "}
            {result.resultados?.length
              ? `${result.resultados.length} lei(s) próxima(s)`
              : "nada parecido no acervo"}
          </p>
          {(result.resultados || []).map((item) => (
            <article key={item.id} className={`match ${item.nivel}`}>
              <strong>{item.titulo}</strong>
              <p>
                {item.municipio} · {item.ano} · {Math.round(item.score * 100)}% ·{" "}
                {item.nivel}
              </p>
              <p>{item.ementa}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Acervo({ leis, error, notice, onDelete }) {
  return (
    <section className="card">
      <h1 className="page-title">Acervo</h1>
      {error && <p className="msg error">{error}</p>}
      {notice && <p className="msg ok">{notice}</p>}
      {!leis.length && <p className="hint">Ainda não há leis cadastradas.</p>}
      <div className="list">
        {leis.map((lei) => (
          <article key={lei.id} className="law">
            <div>
              <strong>{lei.titulo}</strong>
              <p>
                {lei.municipio} · {lei.ano}
              </p>
              <p>{lei.ementa}</p>
            </div>
            <button className="danger" type="button" onClick={() => onDelete(lei.id)}>
              Apagar
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Nova({ error, onSaved, onError }) {
  const [titulo, setTitulo] = useState("");
  const [municipio, setMunicipio] = useState("Itaí");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [ementa, setEmenta] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    onError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/leis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, municipio, ano: Number(ano), ementa, texto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error || "Não foi possível guardar a lei.");
        return;
      }
      onSaved();
    } catch {
      onError("A API Java está fora do ar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h1 className="page-title">Nova lei</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="titulo">Título</label>
        <input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        <label htmlFor="municipio">Município</label>
        <input id="municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} required />
        <label htmlFor="ano">Ano</label>
        <input id="ano" type="number" value={ano} onChange={(e) => setAno(e.target.value)} required />
        <label htmlFor="ementa">Ementa</label>
        <input id="ementa" value={ementa} onChange={(e) => setEmenta(e.target.value)} required />
        <label htmlFor="texto">Texto</label>
        <textarea id="texto" rows="8" value={texto} onChange={(e) => setTexto(e.target.value)} required />
        <button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar no acervo"}
        </button>
      </form>
      {error && <p className="msg error">{error}</p>}
    </section>
  );
}
