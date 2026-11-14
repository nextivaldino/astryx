// Dock (next-mobile) — a barra superior levada para baixo, para telemóvel e tablet.
// Inspirada na Dock_next-2 do KARGA mobile. Uma só peça: o painel cresce
// para cima a partir da barra.
//
//  ┌ painel (cresce para cima) ────────────────────────────┐
//  │  ═══ puxador                                     (✕)  │
//  │  conteúdo do painel (criar, avisos, mais…)            │
//  ├ barra ────────────────────────────────────────────────┤
//  │ (🔔3)  [ilha de aviso]   [◉ Hoje] [▥] [✓✓] [⋯]   (＋)  │
//  └───────────────────────────────────────────────────────┘
//
// - 🔔 avisos com selo de não lidos (abre o painel "avisos"); só quando há por ler
// - ilha: o aviso mais recente; tocar abre o detalhe
// - separadores: nomes conforme a Aparência (só o ativo · mais usados · todos)
// - ＋ abre o painel "criar"; roda e vira ✕ quando aberto
// - esconde-se com o teclado aberto (fica uma linha para a revelar)
// - encolhe ao percorrer para baixo; Esc / véu / arrastar o puxador fecham
//
// Estilos em dock.css (.nm-*). Usa os tokens do tema Astryx-NEXT.
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button, Icon } from '@astryxdesign/core';
import { sentidoEntre, transicao } from '../comum/index.js';
import { useDock } from './DockContext.jsx';
import { MaisIcone, SinoIcone } from './icones.jsx';
import './dock.css';

const TIPO_ICONE = { info: 'info', sucesso: 'success', atencao: 'warning', erro: 'error', mensagem: 'info' };

function useMedia(query) {
  const [m, setM] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

/** Campo de texto em foco fora da dock (teclado aberto)? */
function useAEscrever() {
  const [a, setA] = useState(false);
  useEffect(() => {
    const campo = (t) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)
      && !/checkbox|radio|button|range/.test(t.type ?? '') && !t.closest('.nm-dock');
    const dentro = (e) => setA(campo(e.target));
    const fora = () => setTimeout(() => setA(campo(document.activeElement)), 0);
    document.addEventListener('focusin', dentro);
    document.addEventListener('focusout', fora);
    return () => { document.removeEventListener('focusin', dentro); document.removeEventListener('focusout', fora); };
  }, []);
  return a;
}

/** Quantas vezes cada separador foi usado (neste dispositivo) — para "Mais usados". */
const CHAVE_USO = 'nm-dock-uso';
const lerUso = () => { try { return JSON.parse(localStorage.getItem(CHAVE_USO) ?? '{}'); } catch { return {}; } };
function useUso() {
  const [uso, setUso] = useState(lerUso);
  const contar = (valor) => setUso((u) => {
    const novo = { ...u, [valor]: (u[valor] ?? 0) + 1 };
    try { localStorage.setItem(CHAVE_USO, JSON.stringify(novo)); } catch {}
    return novo;
  });
  return [uso, contar];
}

/** Encolhe ao percorrer para baixo; volta ao subir. */
function useCompacta() {
  const [c, setC] = useState(false);
  useEffect(() => {
    let antes = 0;
    const onScroll = () => {
      const y = scrollY;
      if (y < 24) setC(false);
      else if (y > antes + 4) setC(true);
      else if (y < antes - 4) setC(false);
      antes = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  return c;
}

/**
 * @param paginas   [{ valor, rotulo, icone }] — separadores
 * @param ativa     valor da página atual;  onIr(valor)
 * @param paineis   { nome: { rotulo, conteudo: ReactNode, cheio? } } — inclui
 *                  'avisos' (botão 🔔), 'criar' (botão ＋) e outros abertos por separadores
 * @param separadorPainel  { valorDaPagina: nomeDoPainel } — separadores que abrem um painel (ex.: Mais)
 */
export default function Dock({ paginas, ativa, onIr, paineis, separadorPainel = {} }) {
  const dock = useDock();
  const tablet = useMedia('(min-width: 768px)');
  const aEscrever = useAEscrever();
  const compacta = useCompacta();
  const [uso, contar] = useUso();
  const painelRef = useRef(null);
  const gatilho = useRef(null);
  const arrasto = useRef(null);

  const painel = dock.painel && paineis[dock.painel] ? dock.painel : null;
  const aberto = painel !== null;
  // Ao fechar, o conteúdo fica até o painel acabar de encolher (não fecha vazio)
  const ultimoPainel = useRef(null);
  if (painel) ultimoPainel.current = painel;
  const mostrado = painel ?? (ultimoPainel.current && paineis[ultimoPainel.current] ? ultimoPainel.current : null);
  const separadores = useRef(null);
  const porLer = dock.historico.filter((a) => !a.lido).length;
  const ultimo = dock.avisos.at(-1);
  // Dock cheia (telemóvel com 4+ separadores): o 🔔 sai e vira uma bolha à esquerda.
  const comBolha = !tablet && paineis.avisos && porLer > 0 && paginas.length >= 4;
  const idBolha = useId();
  const bolhaPainel = useRef(null);
  const naoLidos = dock.historico.filter((a) => !a.lido).slice(0, 3);
  const escondida = !tablet && !aberto && (dock.escondida || aEscrever);
  // "Mais usados": os N separadores com mais toques mostram o nome (1 no telemóvel, 3 no tablet).
  const frequentes = new Set(
    paginas.map((p) => p.valor).filter((v) => uso[v]).sort((a, b) => uso[b] - uso[a]).slice(0, tablet ? 3 : 1),
  );

  // Foco: ao abrir vai para o painel; ao fechar volta a quem o abriu.
  useEffect(() => {
    if (aberto) {
      gatilho.current ??= document.activeElement;
      const t = setTimeout(() => painelRef.current?.querySelector('input, textarea, button:not([disabled]), [href]')?.focus({ preventScroll: true }), 60);
      return () => clearTimeout(t);
    }
    gatilho.current?.focus?.({ preventScroll: true });
    gatilho.current = null;
  }, [aberto, painel]);

  // Esc fecha.
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => e.key === 'Escape' && dock.fechar();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [aberto, dock]);

  // Ao abrir os avisos, ficam lidos.
  useEffect(() => { if (painel === 'avisos') dock.marcarLidos(); }, [painel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pílula do separador atual: uma só, que desliza de um separador para o outro.
  useLayoutEffect(() => {
    const caixa = separadores.current;
    if (!caixa) return;
    const medir = () => {
      const atual = caixa.querySelector('.nm-separador[data-atual]');
      caixa.toggleAttribute('data-sem-pilula', !atual);
      if (!atual) return;
      caixa.style.setProperty('--pilula-x', `${atual.offsetLeft}px`);
      caixa.style.setProperty('--pilula-w', `${atual.offsetWidth}px`);
    };
    medir();
    const ro = new ResizeObserver(medir);
    caixa.querySelectorAll('.nm-separador').forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  });

  const alternar = (nome) => (painel === nome ? dock.fechar() : dock.abrir(nome));

  // Arrastar o puxador para baixo fecha.
  const puxador = {
    onPointerDown: (e) => { arrasto.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); },
    onPointerMove: (e) => {
      if (arrasto.current == null) return;
      painelRef.current.style.transform = `translateY(${Math.max(0, e.clientY - arrasto.current)}px)`;
    },
    onPointerUp: (e) => {
      if (arrasto.current == null) return;
      const dy = e.clientY - arrasto.current;
      arrasto.current = null;
      painelRef.current.style.transform = '';
      if (dy > 70) dock.fechar();
    },
  };

  return (
    <>
      {/* Faixa no fundo do ecrã: esbate o conteúdo que passa por baixo da dock */}
      <div className="nm-dock-fundo" data-escondida={escondida || undefined} aria-hidden="true" />
      {aberto && <div className="nm-veu" aria-hidden="true" onClick={dock.fechar} />}
      <nav
        className="nm-dock"
        aria-label="Dock"
        data-tablet={tablet || undefined}
        data-aberta={aberto || undefined}
        data-cheio={(aberto && paineis[painel].cheio) || undefined}
        data-ilha={ultimo ? '' : undefined}
        data-escondida={escondida || undefined}
        data-compacta={(compacta && !aberto && !ultimo) || undefined}
        data-com-bolha={comBolha || undefined}
      >
        {/* Painel: cresce para cima a partir da barra (grid 0fr → 1fr, sem medir alturas) */}
        <div
          ref={painelRef}
          className="nm-painel"
          role={aberto ? 'dialog' : undefined}
          aria-label={aberto ? paineis[painel].rotulo : undefined}
          aria-hidden={!aberto}
          inert={!aberto || undefined}
        >
          <div className="nm-painel-dentro">
            {mostrado && (
              <>
                <div className="nm-painel-topo">
                  <span className="nm-puxador" aria-hidden="true" {...puxador} />
                  <h2 className="nm-painel-titulo">{paineis[mostrado].rotulo}</h2>
                  <Button variant="ghost" size="sm" label="Fechar" isIconOnly icon={<Icon icon="close" />} onClick={dock.fechar} />
                </div>
                <div key={mostrado} className="nm-painel-corpo">{paineis[mostrado].conteudo}</div>
              </>
            )}
          </div>
        </div>

        {/* Barra */}
        <div className="nm-barra">
          {/* 🔔 só aparece quando há avisos por ler (ou com o painel aberto, para o fechar).
              Os avisos continuam acessíveis pelo menu do canto do utilizador. */}
          {paineis.avisos && !comBolha && (porLer > 0 || painel === 'avisos') && (
            <button
              type="button"
              className="nm-botao nm-avisos"
              aria-label={porLer > 0 ? `Avisos: ${porLer} por ler` : 'Avisos'}
              aria-expanded={painel === 'avisos'}
              onClick={() => alternar('avisos')}
            >
              <SinoIcone />
              {porLer > 0 && <span className="nm-selo">{porLer > 99 ? '99+' : porLer}</span>}
            </button>
          )}

          {ultimo && (
            <div className="nm-ilha-slot" aria-live="polite">
              <button
                type="button"
                key={ultimo.id}
                className="nm-ilha"
                data-tipo={ultimo.tipo}
                aria-label={`${ultimo.titulo}${ultimo.sub ? `: ${ultimo.sub}` : ''}${dock.avisos.length > 1 ? ` (e mais ${dock.avisos.length - 1})` : ''}`}
                onClick={() => { dock.consumirAvisos(); dock.abrir('avisos'); }}
              >
                <Icon icon={TIPO_ICONE[ultimo.tipo] ?? 'info'} />
                <span className="nm-ilha-texto" aria-hidden="true">
                  <strong>{ultimo.titulo}</strong>
                  {ultimo.sub && <span>{ultimo.sub}</span>}
                </span>
                {dock.avisos.length > 1 && <span className="nm-ilha-mais" aria-hidden="true">+{dock.avisos.length - 1}</span>}
              </button>
            </div>
          )}

          <div className="nm-separadores" ref={separadores}>
            <span className="nm-pilula" aria-hidden="true" />
            {paginas.map((p) => {
              const nomePainel = separadorPainel[p.valor];
              const atual = nomePainel ? painel === nomePainel : ativa === p.valor && !aberto;
              return (
                <button
                  key={p.valor}
                  type="button"
                  className="nm-separador"
                  aria-current={!nomePainel && ativa === p.valor ? 'page' : undefined}
                  aria-expanded={nomePainel ? painel === nomePainel : undefined}
                  aria-label={p.rotulo}
                  data-atual={atual || undefined}
                  data-frequente={frequentes.has(p.valor) || undefined}
                  onClick={() => {
                    contar(p.valor);
                    if (nomePainel) return alternar(nomePainel);
                    dock.fechar();
                    if (p.valor !== ativa) transicao(() => onIr(p.valor), sentidoEntre(paginas.map((x) => x.valor), ativa, p.valor));
                  }}
                >
                  {typeof p.icone === 'string' ? <Icon icon={p.icone} /> : p.icone}
                  <span className="nm-separador-nome" aria-hidden="true">{p.rotulo}</span>
                </button>
              );
            })}
          </div>

          {paineis.criar && (
            <button
              type="button"
              className="nm-criar"
              aria-label={painel === 'criar' ? 'Fechar' : 'Criar'}
              aria-expanded={painel === 'criar'}
              data-aberto={painel === 'criar' || undefined}
              onClick={() => alternar('criar')}
            >
              <MaisIcone strokeWidth={2.75} />
            </button>
          )}
        </div>
      </nav>

      {/* Bolha de avisos (dock cheia): a "dock menor" à esquerda. Tocar abre a
          mini-dock com os últimos avisos. Some quando não há nada por ler. */}
      {comBolha && (
        <>
          <button
            type="button"
            className="nm-bolha"
            data-escondida={escondida || undefined}
            data-compacta={(compacta && !aberto && !ultimo) || undefined}
            popoverTarget={idBolha}
            aria-label={`Avisos: ${porLer} por ler`}
          >
            <SinoIcone />
            <span className="nm-bolha-n" aria-hidden="true">{porLer > 99 ? '99+' : porLer}</span>
          </button>
          <div id={idBolha} ref={bolhaPainel} popover="auto" className="nm-bolha-painel" aria-label="Avisos por ler">
            <header className="nm-bolha-topo">
              <strong>Avisos</strong>
              <span>{porLer} por ler</span>
            </header>
            <div className="nm-grelha">
              {naoLidos.map((a) => (
                <OpcaoDock
                  key={a.id}
                  data-tipo={a.tipo}
                  icone={{ sucesso: 'success', erro: 'error', atencao: 'warning' }[a.tipo] ?? 'info'}
                  titulo={a.titulo}
                  contexto={[a.sub, new Intl.DateTimeFormat('pt-PT', { timeStyle: 'short' }).format(a.criadoEm)].filter(Boolean).join(' · ')}
                  onClick={() => { bolhaPainel.current?.hidePopover(); dock.abrir('avisos'); }}
                />
              ))}
            </div>
            <div className="nm-bolha-acoes">
              <Button variant="secondary" size="sm" label="Marcar como lidos" onClick={() => { bolhaPainel.current?.hidePopover(); dock.marcarLidos(); }} />
              <Button variant="primary" size="sm" label="Ver todos" onClick={() => { bolhaPainel.current?.hidePopover(); dock.abrir('avisos'); }} />
            </div>
          </div>
        </>
      )}

      {escondida && (
        <button type="button" className="nm-linha" aria-label="Mostrar a dock" onClick={() => { document.activeElement?.blur?.(); dock.esconder(false); }}>
          <span aria-hidden="true" />
        </button>
      )}
    </>
  );
}

/** Linha de opção para painéis (ícone + título + contexto), sem caixa à volta do ícone. */
export function OpcaoDock({ icone, titulo, contexto, ...props }) {
  return (
    <button type="button" className="nm-opcao" {...props}>
      {icone && <span className="nm-opcao-icone">{typeof icone === 'string' ? <Icon icon={icone} /> : icone}</span>}
      <span className="nm-opcao-texto">
        <span className="nm-opcao-titulo">{titulo}</span>
        {contexto && <span className="nm-opcao-contexto">{contexto}</span>}
      </span>
    </button>
  );
}
