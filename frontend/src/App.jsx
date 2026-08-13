import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "";

const ROUTES = {
  "/": "Início",
  "/consultar": "Consultar",
  "/acervo": "Acervo",
  "/nova": "Nova lei",
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
          <Consultar python={python} onError={setError} error={error} go={go} />
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
      <p className="kicker">Cachoeira / Bahia</p>
      <h1>Consulte antes de criar a lei.</h1>
      <p className="lead">
        Cole o rascunho e receba um parecer: já existe, é parecida, ou o acervo
        está livre. Menos papel, menos lei repetida.
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
        {python
          ? "Similaridade no Python (TF-IDF)."
          : "Similaridade no Java (palavras). Ligue o Python para o motor completo."}
      </p>
    </section>
  );
}

function Consultar({ python, onError, error, go }) {
  const [texto, setTexto] = useState("");
  const [municipio, setMunicipio] = useState("Cachoeira");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aberto, setAberto] = useState(null);

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
        Cole o rascunho. O sistema compara com o acervo de Cachoeira
        {python ? " usando Python." : " no Java, se o Python estiver desligado."}
      </p>
      <form onSubmit={onSubmit}>
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
        <button type="submit" disabled={loading || texto.trim().length < 8}>
          {loading ? "Comparando…" : "Ver se já existe"}
        </button>
      </form>
      {error && <p className="msg error">{error}</p>}
      {result && parecer && (
        <div className={`parecer ${result.parecer || "livre"}`}>
          <strong>{parecer.titulo}</strong>
          <p>{parecer.texto}</p>
          <p className="hint">
            Fonte: {result.fonte === "python" ? "Python" : "Java"}
            {result.resultados?.length
              ? ` · ${result.resultados.length} lei(s) próxima(s)`
              : " · nada no acervo"}
          </p>
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
              <button
                className="ghost small"
                type="button"
                onClick={() => setAberto(aberto === item.id ? null : item.id)}
              >
                {aberto === item.id ? "Ocultar texto" : "Ler texto"}
              </button>
              {aberto === item.id && item.texto && (
                <p className="full-text">{item.texto}</p>
              )}
            </article>
          ))}
        </div>
      )}
      {result?.parecer === "livre" && (
        <button type="button" className="ghost" onClick={() => go("/nova")}>
          Guardar esta proposta no acervo
        </button>
      )}
    </section>
  );
}

function Acervo({ leis, error, notice, onDelete }) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(null);
  const termo = busca.trim().toLowerCase();
  const filtradas = termo
    ? leis.filter((lei) =>
        [lei.titulo, lei.numero, lei.municipio, lei.ementa, lei.texto, String(lei.ano)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(termo)
      )
    : leis;

  return (
    <section className="card">
      <h1 className="page-title">Acervo</h1>
      <label htmlFor="busca">Buscar</label>
      <input
        id="busca"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="título, número, ementa, Paraguaçu..."
      />
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
              {aberto === lei.id && <p className="full-text">{lei.texto}</p>}
            </div>
            <div className="law-actions">
              <button
                className="ghost small"
                type="button"
                onClick={() => setAberto(aberto === lei.id ? null : lei.id)}
              >
                {aberto === lei.id ? "Ocultar" : "Ler"}
              </button>
              <button className="danger" type="button" onClick={() => onDelete(lei.id)}>
                Apagar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Nova({ error, onSaved, onError }) {
  const [titulo, setTitulo] = useState("");
  const [numero, setNumero] = useState("");
  const [municipio, setMunicipio] = useState("Cachoeira");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [ementa, setEmenta] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    onError("");
    setLoading(true);
    try {
      const consulta = await fetch(`${API}/api/consultar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, municipio }),
      });
      if (consulta.ok) {
        const data = await consulta.json();
        if (data.parecer === "nao_protocolar" || data.parecer === "revisar") {
          const aviso = data.parecer === "nao_protocolar"
            ? "Já existe lei igual ou quase igual. Guardar mesmo assim?"
            : "Há leis parecidas no acervo. Guardar mesmo assim?";
          if (!window.confirm(aviso)) {
            setLoading(false);
            return;
          }
        }
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
      <p className="hint">
        Antes de guardar, o sistema consulta o acervo. Se achar igual ou parecida, pede confirmação.
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
        <label htmlFor="texto">Texto</label>
        <textarea id="texto" rows="8" value={texto} onChange={(e) => setTexto(e.target.value)} required />
        <button type="submit" disabled={loading}>
          {loading ? "Checando e guardando…" : "Guardar no acervo"}
        </button>
      </form>
      {error && <p className="msg error">{error}</p>}
    </section>
  );
}
