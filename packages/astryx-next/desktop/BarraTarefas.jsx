// BarraTarefas (next-desktop) — a BarraApp em modo "barra de tarefas", inspirada na
// superbarra do Windows 7, com a linguagem do Astryx-NEXT (vidro, destaque, Mona Sans).
//
//  ┌────────────────────────────────────────────────────────────────────────────────┐
//  │ (◉) │ [▣ Início] [▥] [✓✓] [🛠] …           [🔍] [🔔2] [⚙] [⌄] │ ● 14:05  │▏│
//  └────────────────────────────────────────────────────────────────────────────────┘
//   Iniciar  páginas (só ícone; com nome se houver espaço)   tabuleiro       relógio  início
//
// - Iniciar: o menu da app (com as páginas no topo), desenrola do botão.
// - Páginas: o ícone da atual fica realçado, com um traço de luz na cor de destaque.
// - Tabuleiro: pesquisa (abre na própria barra), avisos (com contagem e lista),
//   definições (se a app der onDefinicoes), opções da página (sub-barra) e os botões
//   extra da app; depois o estado da ligação e o relógio (hora e data).
// - O fino traço à direita leva à página inicial (o "mostrar ambiente de trabalho").
// Usada pela BarraApp: em baixo (fixa no fundo) ou em cima (no lugar da barra).
import { useEffect, useId, useRef, useState } from 'react';
import { DropdownMenu, DropdownMenuDivider, DropdownMenuGroup, DropdownMenuItem, Icon, TextInput } from '@astryxdesign/core';
import { useOnline } from '../comum/index.js';
import { useDock } from '../mobile/DockContext.jsx';
import { OpcaoDock } from '../mobile/Dock.jsx';
import { SinoIcone } from '../mobile/icones.jsx';
import './barra-tarefas.css';

const TIPO_ICONE = { sucesso: 'success', erro: 'error', atencao: 'warning' };
const horas = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });
const dia = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
const diaLongo = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'full' });

/** Hora certa ao minuto (um só temporizador, alinhado à mudança de minuto). */
function useRelogio() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    let t;
    const tic = () => { setAgora(new Date()); t = setTimeout(tic, 60000 - (Date.now() % 60000)); };
    t = setTimeout(tic, 60000 - (Date.now() % 60000));
    return () => clearTimeout(t);
  }, []);
  return agora;
}

export default function BarraTarefas({
  app, menuApp, abas, abaAtiva, irPara, pesquisa, fim, onDefinicoes, posicao, sub,
}) {
  const dock = useDock();
  const online = useOnline();
  const agora = useRelogio();
  const idAvisos = useId();
  const avisosRef = useRef(null);
  const pesquisaRef = useRef(null);
  const [aPesquisar, setAPesquisar] = useState(!!pesquisa?.valor);
  const porLer = dock.historico.filter((a) => !a.lido).length;
  const recentes = dock.historico.slice(0, 6);

  // Ao abrir a pesquisa, o cursor vai logo para o campo
  useEffect(() => { if (aPesquisar) pesquisaRef.current?.querySelector('input')?.focus(); }, [aPesquisar]);

  // Ao abrir a lista de avisos, ficam lidos
  useEffect(() => {
    const el = avisosRef.current;
    if (!el) return;
    const aoAbrir = (e) => { if (e.newState === 'open') dock.marcarLidos(); };
    el.addEventListener('toggle', aoAbrir);
    return () => el.removeEventListener('toggle', aoAbrir);
  }, [dock]);

  return (
    <nav className="ds-tarefas" data-posicao={posicao} aria-label={`Barra da ${app.nome}`}>
      {/* Iniciar: o menu da app, com as páginas no topo */}
      <DropdownMenu
        placement={posicao === 'baixo' ? 'above' : 'below'}
        alignment="start"
        menuWidth={300}
        menuMaxHeight={560}
        header={
          <div className="ds-barra-menu-cabecalho">
            <span className="ds-barra-logo" aria-hidden="true"><Icon icon={app.icone} /></span>
            <span>
              <strong>{app.nome}</strong>
              {app.versao && <small>Versão {app.versao}</small>}
            </span>
          </div>
        }
        renderTrigger={(props) => (
          <button {...props} className="ds-tarefas-iniciar" aria-label={`Iniciar: menu da ${app.nome}`}>
            <Icon icon={app.icone} />
          </button>
        )}
      >
        {abas.length > 0 && (
          <DropdownMenuGroup title="Páginas">
            {abas.map((a) => (
              <DropdownMenuItem key={a.valor} icon={a.icone} label={a.rotulo} onClick={() => irPara(a.valor)} />
            ))}
          </DropdownMenuGroup>
        )}
        {abas.length > 0 && menuApp && <DropdownMenuDivider />}
        {menuApp}
      </DropdownMenu>

      <span className="ds-tarefas-separador" aria-hidden="true" />

      {/* Páginas fixadas */}
      <div className="ds-tarefas-paginas">
        {abas.map((a) => (
          <button
            key={a.valor}
            type="button"
            className="ds-tarefas-pagina"
            aria-current={a.valor === abaAtiva ? 'page' : undefined}
            aria-label={a.rotulo}
            title={a.rotulo}
            onClick={() => irPara(a.valor)}
          >
            {a.icone && <Icon icon={a.icone} />}
            <span className="ds-tarefas-pagina-nome" aria-hidden="true">{a.rotulo}</span>
          </button>
        ))}
      </div>

      {/* Tabuleiro */}
      <div className="ds-tarefas-tabuleiro">
        {pesquisa && (
          <div ref={pesquisaRef} className="ds-tarefas-pesquisa" data-aberta={aPesquisar || undefined}>
            {aPesquisar && (
              <TextInput
                type="search"
                label="Pesquisar"
                isLabelHidden
                size="sm"
                startIcon="search"
                placeholder={pesquisa.placeholder ?? 'Pesquisar…'}
                value={pesquisa.valor}
                onChange={pesquisa.onChange}
                onKeyDown={(e) => { if (e.key === 'Escape') setAPesquisar(false); }}
              />
            )}
            <button
              type="button"
              className="ds-tarefas-botao"
              aria-label={aPesquisar ? 'Fechar a pesquisa' : 'Pesquisar'}
              title={aPesquisar ? 'Fechar a pesquisa' : 'Pesquisar'}
              aria-pressed={aPesquisar}
              onClick={() => setAPesquisar((v) => !v)}
            >
              <Icon icon={aPesquisar ? 'close' : 'search'} />
            </button>
          </div>
        )}

        <button type="button" className="ds-tarefas-botao" popoverTarget={idAvisos} aria-label={porLer ? `Avisos: ${porLer} por ler` : 'Avisos'} title="Avisos">
          <SinoIcone />
          {porLer > 0 && <span className="ds-tarefas-selo">{porLer > 9 ? '9+' : porLer}</span>}
        </button>

        {onDefinicoes && (
          <button type="button" className="ds-tarefas-botao ds-tarefas-definicoes" aria-label="Definições" title="Definições (⌘/Ctrl + ,)" onClick={onDefinicoes}>
            <Icon icon="wrench" />
          </button>
        )}

        {sub && (
          <button
            type="button"
            className="ds-tarefas-botao ds-tarefas-sub"
            aria-label={sub.aberta ? 'Esconder opções da página' : 'Mostrar opções da página'}
            title="Opções da página"
            aria-expanded={sub.aberta}
            aria-controls={sub.id}
            onClick={sub.alternar}
          >
            <Icon icon="chevronDown" />
          </button>
        )}

        {fim}

        <span className="ds-tarefas-separador" aria-hidden="true" />

        <span className="ds-tarefas-relogio" title={`${online ? 'Online' : 'Sem ligação'} · ${diaLongo.format(agora)}`}>
          <span className="ds-tarefas-rede" data-online={online || undefined} aria-label={online ? 'Online' : 'Sem ligação'} role="img" />
          <span className="ds-tarefas-hora">
            <strong>{horas.format(agora)}</strong>
            <small>{dia.format(agora)}</small>
          </span>
        </span>

        {abas.length > 0 && (
          <button type="button" className="ds-tarefas-inicio" aria-label="Ir para o início" title="Ir para o início" onClick={() => irPara(abas[0].valor)} />
        )}
      </div>

      {/* Avisos: a lista abre por cima (ou por baixo) da barra, junto ao tabuleiro */}
      <div id={idAvisos} ref={avisosRef} popover="auto" className="ds-tarefas-avisos" data-posicao={posicao} aria-label="Avisos">
        <header className="ds-tarefas-avisos-topo">
          <strong>Avisos</strong>
          <small>{recentes.length ? diaLongo.format(agora) : ''}</small>
        </header>
        {recentes.length === 0 ? (
          <p className="ds-tarefas-avisos-vazio">Sem avisos por agora.</p>
        ) : (
          <div className="nm-grelha">
            {recentes.map((a) => (
              <OpcaoDock
                key={a.id}
                data-tipo={a.tipo}
                icone={TIPO_ICONE[a.tipo] ?? 'info'}
                titulo={a.titulo}
                contexto={[a.sub, horas.format(a.criadoEm)].filter(Boolean).join(' · ')}
              />
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
