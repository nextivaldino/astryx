// JanelaDefinicoes (next-desktop) — as definições numa janela flutuante, ao estilo do
// painel de definições do Opera: barra lateral com secções e pesquisa, conteúdo à direita.
//
//  ┌ ⠿ ─────────────── Definições ─────────────── (✕) ┐   ← arrastar pela barra; duplo clique maximiza
//  │ [🔍 Procurar…]   │  Aparência                       │
//  │ ◉ Aparência      │  [miniatura ao vivo]             │
//  │ ▦ Fundo          │  Estilo · Modo · Destaque · Fundo │
//  │ ⚙ Interface      │                                  │
//  │ … (da app)       │                                  │
//  │ ⓘ Sobre          │                                  │
//  └──────────────────┴──────────────────────────────── ◢┘   ← redimensionar pelo canto
//
// - Não bloqueia a app: cada mudança aplica-se logo e vê-se por trás (pré-visualização ao vivo).
// - Lembra a posição e o tamanho; nunca sai do ecrã. Ecrã estreito: ocupa-o todo.
// - Abre/fecha com ⌘/Ctrl + , ; Esc fecha. Só existe no DOM enquanto está aberta.
// - As mesmas escolhas da versão mobile (useAparencia), mais o tamanho da interface.
// Leve: arrastar mexe só no `translate` da janela (sem renderizar o React).
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button, Icon, Switch, Text } from '@astryxdesign/core';
import { OPCOES } from '../comum/aparencia.js';
import { Amostras, EscolhaEstilo, GrupoDef, LinhaDef, PadraoFundo, segmento } from '../mobile/Definicoes.jsx';
import { PaletaIcone } from '../mobile/icones.jsx';
import pacote from '../package.json';
import './janela.css';

const CHAVE = 'ds-janela-definicoes';
const VERSAO = pacote.version;
const MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const TECLA = MAC ? '⌘' : 'Ctrl';

const svg = (d) => (props) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{d}</svg>
);
const GrelhaIcone = svg(<><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M3.5 9.5h17M3.5 14.5h17M9.5 3.5v17M14.5 3.5v17" /></>);
const AjustesIcone = svg(<><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>);
const ProcurarIcone = svg(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>);

const normalizar = (t) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const ler = () => { try { return JSON.parse(localStorage.getItem(CHAVE)) ?? {}; } catch { return {}; } };
const gravar = (v) => { try { localStorage.setItem(CHAVE, JSON.stringify({ ...ler(), ...v })); } catch {} };
const zoom = () => parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

/**
 * @param aberta / onFechar / onAbrir   estado da janela (onAbrir liga o atalho ⌘/Ctrl + ,)
 * @param aparencia, mudar, repor       de useAparencia()
 * @param seccoesApp  [{ id, titulo, icone, conteudo }]  secções da própria app (ex.: Conta)
 * @param app         { nome, versao }  para "Sobre"
 * @param seccao      secção inicial (por omissão: Aparência)
 */
export default function JanelaDefinicoes({ aberta, onFechar, onAbrir, ...resto }) {
  useEffect(() => {
    const tecla = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== ',') return;
      e.preventDefault();
      if (aberta) onFechar(); else onAbrir?.();
    };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, [aberta, onAbrir, onFechar]);
  return aberta ? <Janela onFechar={onFechar} {...resto} /> : null;
}

function Janela({ onFechar, aparencia, mudar, repor, seccoesApp = [], app, seccao: inicial = 'aparencia' }) {
  const janela = useRef(null);
  const procuraRef = useRef(null);
  const conteudo = useRef(null);
  const vazio = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const idTitulo = useId();
  const [seccao, setSeccao] = useState(inicial);
  const [procura, setProcura] = useState('');
  const [maximizada, setMaximizada] = useState(() => !!ler().max);
  const [fechando, setFechando] = useState(false);

  const fechar = () => {
    if (document.documentElement.hasAttribute('data-reduzir-efeitos') || matchMedia('(prefers-reduced-motion: reduce)').matches) onFechar();
    else setFechando(true); // fecha no fim da animação (onAnimationEnd)
  };

  // Posição: mantém a janela dentro do ecrã (a barra de título fica sempre ao alcance)
  const colocar = (x, y) => {
    const el = janela.current;
    const z = zoom();
    const vw = innerWidth / z, vh = innerHeight / z, w = el.offsetWidth;
    pos.current = { x: Math.min(Math.max(x, 120 - w), vw - 120), y: Math.min(Math.max(y, 0), vh - 48) };
    el.style.translate = `${pos.current.x}px ${pos.current.y}px`;
  };

  // Abrir: tamanho e posição guardados (ou ao centro); foco na pesquisa; ao fechar, o foco volta
  useLayoutEffect(() => {
    const el = janela.current;
    const g = ler();
    if (g.w) { el.style.inlineSize = `${g.w}px`; el.style.blockSize = `${g.h}px`; }
    const z = zoom();
    colocar(g.x ?? (innerWidth / z - el.offsetWidth) / 2, g.y ?? Math.max(40, (innerHeight / z - el.offsetHeight) / 2.4));
    const anterior = document.activeElement;
    procuraRef.current?.focus({ preventScroll: true });

    let t;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => { if (!el.hasAttribute('data-max')) gravar({ w: el.offsetWidth, h: el.offsetHeight }); }, 300);
    });
    ro.observe(el);
    const aoMudarEcra = () => colocar(pos.current.x, pos.current.y);
    addEventListener('resize', aoMudarEcra);
    return () => { ro.disconnect(); clearTimeout(t); removeEventListener('resize', aoMudarEcra); anterior?.focus?.({ preventScroll: true }); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Arrastar pela barra de título (só mexe no translate; sem renderizar)
  const arrastar = {
    onPointerDown: (e) => {
      if (e.button !== 0 || maximizada || e.target.closest('button') || matchMedia('(width <= 720px)').matches) return;
      const z = zoom();
      const inicio = { cx: e.clientX, cy: e.clientY, ...pos.current };
      const el = janela.current;
      const alvo = e.currentTarget;
      alvo.setPointerCapture(e.pointerId);
      el.setAttribute('data-a-arrastar', '');
      const mover = (ev) => colocar(inicio.x + (ev.clientX - inicio.cx) / z, inicio.y + (ev.clientY - inicio.cy) / z);
      const largar = () => {
        el.removeAttribute('data-a-arrastar');
        alvo.removeEventListener('pointermove', mover);
        gravar(pos.current);
      };
      alvo.addEventListener('pointermove', mover);
      alvo.addEventListener('pointerup', largar, { once: true });
      alvo.addEventListener('pointercancel', largar, { once: true });
    },
    onDoubleClick: (e) => {
      if (e.target.closest('button')) return;
      setMaximizada((m) => { gravar({ max: !m }); return !m; });
    },
  };

  // Pesquisa: mostra só os blocos que têm o texto (ignora acentos e maiúsculas)
  const q = normalizar(procura.trim());
  useLayoutEffect(() => {
    const raiz = conteudo.current;
    let algum = false;
    raiz.querySelectorAll('[data-jd-bloco]').forEach((b) => {
      const ok = !q || normalizar(`${b.textContent} ${b.dataset.palavras ?? ''}`).includes(q);
      b.hidden = !ok;
      algum ||= ok;
    });
    raiz.querySelectorAll('[data-jd-seccao]').forEach((s) => { s.hidden = !!q && !s.querySelector('[data-jd-bloco]:not([hidden])'); });
    vazio.current.hidden = !q || algum;
  });

  const seg = (campo, rotulo) => segmento(aparencia, mudar, campo, rotulo);
  const bloco = (palavras, filhos) => <div data-jd-bloco="" data-palavras={palavras}>{filhos}</div>;

  const SECCOES = [
    {
      id: 'aparencia', titulo: 'Aparência', icone: <PaletaIcone />,
      conteudo: (
        <>
          {!q && <MiniDesktop textura={aparencia.textura} />}
          {bloco('estilo adwaita coral gnome karga', <EscolhaEstilo aparencia={aparencia} mudar={mudar} />)}
          {bloco('modo claro escuro sistema tema', <GrupoDef titulo="Modo"><div className="nm-def-controlo">{seg('modo', 'Modo')}</div></GrupoDef>)}
          {bloco('cor destaque acento', <Amostras nome="destaque" rotulo="Cor de destaque" opcoes={OPCOES.destaque} valor={aparencia.destaque} onChange={(v) => mudar({ destaque: v })} />)}
          {bloco('fundo cor', <Amostras nome="fundo" rotulo="Fundo" opcoes={OPCOES.fundo} valor={aparencia.fundo} onChange={(v) => mudar({ fundo: v })} />)}
        </>
      ),
    },
    {
      id: 'fundo', titulo: 'Padrão do fundo', icone: <GrelhaIcone />,
      conteudo: bloco('padrao grelha planta pontos linhas diagonal intensidade avisos notificacao', <PadraoFundo aparencia={aparencia} mudar={mudar} />),
    },
    {
      id: 'interface', titulo: 'Interface', icone: <AjustesIcone />,
      conteudo: (
        <>
          {bloco('tamanho escala zoom letra', <GrupoDef titulo="Tamanho da interface" nota="Aumenta ou reduz tudo: texto, botões e espaços."><div className="nm-def-controlo">{seg('escala', 'Tamanho da interface')}</div></GrupoDef>)}
          {bloco('densidade espaco compacta confortavel', <GrupoDef titulo="Densidade" nota="Espaço entre elementos e altura dos controlos."><div className="nm-def-controlo">{seg('densidade', 'Densidade')}</div></GrupoDef>)}
          {bloco('forma botoes pilula arredondados', <GrupoDef titulo="Forma dos botões"><div className="nm-def-controlo">{seg('formaBotoes', 'Forma dos botões')}</div></GrupoDef>)}
          {bloco('reduzir efeitos animacoes movimento vidro', (
            <GrupoDef nota="Sem vidro nem animações. Mais leve em computadores antigos.">
              <LinhaDef icone="eyeSlash" titulo="Reduzir efeitos" fim={<Switch label="Reduzir efeitos" isLabelHidden value={aparencia.reduzirEfeitos} onChange={(v) => mudar({ reduzirEfeitos: v })} />} />
            </GrupoDef>
          ))}
        </>
      ),
    },
    ...seccoesApp.map((s) => ({ ...s, icone: typeof s.icone === 'string' ? <Icon icon={s.icone} /> : s.icone, conteudo: bloco(s.titulo, s.conteudo) })),
    {
      id: 'sobre', titulo: 'Sobre', icone: <Icon icon="info" />,
      conteudo: (
        <>
          {bloco('sobre versao sistema', (
            <GrupoDef titulo="Sobre">
              {app && <LinhaDef titulo={app.nome} fim={<Text type="supporting">{app.versao}</Text>} />}
              <LinhaDef titulo="Design system" fim={<Text type="supporting">Astryx-NEXT {VERSAO}</Text>} />
              <LinhaDef titulo="Estilo da app" fim={<Text type="supporting">next-desktop</Text>} />
              <LinhaDef titulo="Base" fim={<Text type="supporting">Astryx (Meta, MIT)</Text>} />
            </GrupoDef>
          ))}
          {bloco('atalhos teclado', (
            <GrupoDef titulo="Atalhos">
              <LinhaDef titulo="Abrir ou fechar as definições" fim={<kbd className="ds-janela-tecla">{TECLA} ,</kbd>} />
              <LinhaDef titulo="Fechar esta janela" fim={<kbd className="ds-janela-tecla">Esc</kbd>} />
              <LinhaDef titulo="Maximizar ou restaurar" sub="Duplo clique na barra de título" fim={null} />
            </GrupoDef>
          ))}
          {bloco('repor predefinicoes', <div className="nm-def-repor"><Button variant="secondary" label="Repor predefinições" onClick={repor} /></div>)}
        </>
      ),
    },
  ];
  const atual = SECCOES.find((s) => s.id === seccao) ?? SECCOES[0];
  const visiveis = q ? SECCOES : [atual];

  return (
    <section
      ref={janela}
      className="ds-janela"
      role="dialog"
      aria-modal="false"
      aria-labelledby={idTitulo}
      data-max={maximizada || undefined}
      data-fechando={fechando || undefined}
      onAnimationEnd={(e) => { if (fechando && e.target === janela.current) onFechar(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); fechar(); } }}
    >
      <header className="ds-janela-titulo" {...arrastar}>
        <span className="ds-janela-pega" aria-hidden="true" />
        <h1 id={idTitulo}>Definições</h1>
        <Button variant="ghost" size="sm" label="Fechar" isIconOnly icon={<Icon icon="close" />} onClick={fechar} />
      </header>

      <div className="ds-janela-corpo">
        <nav className="ds-janela-lado" aria-label="Secções das definições">
          <label className="ds-janela-procura">
            <ProcurarIcone />
            <input ref={procuraRef} type="search" placeholder="Procurar definições" aria-label="Procurar definições" value={procura} onChange={(e) => setProcura(e.target.value)} />
          </label>
          {SECCOES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="ds-janela-item"
              aria-current={!q && s.id === atual.id ? 'page' : undefined}
              onClick={() => { setProcura(''); setSeccao(s.id); conteudo.current.scrollTop = 0; }}
            >
              <span className="ds-janela-item-icone">{s.icone}</span>
              {s.titulo}
            </button>
          ))}
          <span className="ds-janela-rodape">As mudanças aplicam-se logo.</span>
        </nav>

        <div ref={conteudo} className="ds-janela-conteudo">
          {visiveis.map((s) => (
            <section key={s.id} className="ds-janela-seccao" data-jd-seccao="" aria-labelledby={`${idTitulo}-${s.id}`}>
              <h2 id={`${idTitulo}-${s.id}`}>{s.titulo}</h2>
              {s.conteudo}
            </section>
          ))}
          <p ref={vazio} className="ds-janela-vazio" hidden>Nenhuma definição com “{procura}”.</p>
        </div>
      </div>
    </section>
  );
}

/** Miniatura ao vivo de uma app next-desktop (usa os tokens atuais). */
function MiniDesktop({ textura }) {
  return (
    <div className="ds-mini" aria-hidden="true">
      <div className="ds-mini-barra"><b /><i /><em /><i /><i /></div>
      <div className="ds-mini-area" data-amostra={`textura-${textura}`}>
        <span /><span /><span />
      </div>
      <div className="ds-mini-estado"><i /><i /></div>
    </div>
  );
}
