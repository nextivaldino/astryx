// Canto do utilizador (next-mobile) — canto superior direito (lado='esquerda' para o outro canto).
//
//  (IV)•          avatar: iniciais; ponto vermelho só se há avisos; sem ligação = acinzentado
//  (IV) ✓ Guardado            ← alerta rápido: o avatar estica-se numa pílula e
//                                volta a bolinha ao fim de 4s (tocar abre os avisos)
//
// Tocar no avatar abre um cartão que NASCE do próprio avatar: o avatar fica no
// mesmo sítio, agora dentro do cartão (canto superior), e a máscara circular
// cresce a partir dele. Tocar outra vez no avatar fecha. Popover nativo:
// fecha também ao tocar fora e com Esc. Conteúdo:
//   cabeçalho (nome, estado) · Tema rápido: ☀ Claro  ☾ Escuro  ✦ Personalizado
//   · Avisos · itens da app (Definições, Sobre…) · Terminar sessão
//
// Inspirado no UserCorner do KARGA mobile. Estilos em canto.css.
import { useEffect, useId, useRef } from 'react';
import { Icon } from '@astryxdesign/core';
import { OPCOES, RAPIDO } from '../comum/aparencia.js';
import { useDock } from './DockContext.jsx';
import { SinoIcone } from './icones.jsx';
import './canto.css';

const iniciais = (nome) => nome.trim().split(/[\s._-]+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
const ICONE_TIPO = { sucesso: 'success', info: 'info' };

/**
 * @param nome       nome do utilizador
 * @param online     estado da ligação (ponto no avatar)
 * @param aparencia, mudar   de useAparencia() — para o tema rápido
 * @param itens      [{ icone, titulo, contexto?, onClick, perigo? }] — opções da app
 * @param lado       'direita' (predefinido) | 'esquerda'
 */
export default function CantoUtilizador({ nome, online = true, aparencia, mudar, itens = [], lado = 'direita' }) {
  const dock = useDock();
  const id = useId();
  const painel = useRef(null);
  const porLer = dock.historico.filter((a) => !a.lido).length;
  const alerta = dock.rapido;
  const fechar = () => painel.current?.hidePopover();
  const botao = useRef(null);

  // Ao abrir: encaixa o cartão no avatar (o avatar de dentro fica por cima do de fora).
  useEffect(() => {
    const el = painel.current;
    const encaixar = (e) => {
      if (e.newState !== 'open') return;
      const r = botao.current.querySelector('.nm-canto-avatar').getBoundingClientRect();
      el.style.setProperty('--nm-canto-topo', `${r.top}px`);
      el.style.setProperty('--nm-canto-lado', `${lado === 'direita' ? innerWidth - r.right : r.left}px`);
    };
    el.addEventListener('beforetoggle', encaixar);
    return () => el.removeEventListener('beforetoggle', encaixar);
  }, [lado]);

  const corFundo = OPCOES.fundo.find((o) => o.valor === aparencia.fundo)?.cor;
  const corDestaque = OPCOES.destaque.find((o) => o.valor === aparencia.destaque)?.cor;

  return (
    <div className="nm-canto" data-lado={lado}>
      <button
        ref={botao}
        type="button"
        className="nm-canto-botao"
        data-pilula={alerta ? '' : undefined}
        data-tipo={alerta?.tipo}
        popoverTarget={alerta ? undefined : id}
        aria-label={alerta ? `${alerta.titulo}. Abrir avisos` : `Conta de ${nome}${porLer ? `, ${porLer} avisos por ler` : ''}`}
        onClick={alerta ? () => { dock.dispensarRapido(); dock.abrir('avisos'); } : undefined}
      >
        {/* Um só indicador: online é o normal (nada); sem ligação = avatar acinzentado
            com anel; ponto vermelho só quando há avisos por ler. */}
        <span className="nm-canto-avatar" data-offline={!online || undefined} aria-hidden="true">
          {iniciais(nome)}
        </span>
        <span className="nm-canto-alerta" aria-hidden="true">
          {alerta && (
            <>
              <Icon icon={ICONE_TIPO[alerta.tipo] ?? 'info'} />
              <span className="nm-canto-alerta-texto">
                <strong>{alerta.titulo}</strong>
                {alerta.sub && <span>{alerta.sub}</span>}
              </span>
            </>
          )}
        </span>
      </button>
      {/* Avisos por ler: pequeno sino no canto do avatar, a abanar devagar (fora do botão, que corta) */}
      {porLer > 0 && !alerta && <span className="nm-canto-sino" aria-hidden="true"><SinoIcone /></span>}
      {/* Anúncio para leitores de ecrã */}
      <span className="nm-so-leitor" aria-live="polite">{alerta ? `${alerta.titulo}${alerta.sub ? `. ${alerta.sub}` : ''}` : ''}</span>

      <div id={id} ref={painel} popover="auto" className="nm-canto-painel" data-lado={lado} aria-label="Conta">
        <header className="nm-canto-cabecalho">
          {/* O mesmo avatar, no mesmo sítio: tocar fecha */}
          <button type="button" className="nm-canto-avatar nm-canto-avatar-dentro" data-offline={!online || undefined} popoverTarget={id} popoverTargetAction="hide" aria-label="Fechar conta">
            {iniciais(nome)}
          </button>
          <span className="nm-canto-quem">
            <strong>{nome}</strong>
            <span>{online ? 'Online' : 'Sem ligação'} · sessão neste dispositivo</span>
          </span>
        </header>

        <fieldset className="nm-tema-rapido">
          <legend>Tema</legend>
          {RAPIDO.map((o) => (
            <label key={o.valor} className="nm-tema-opcao">
              <input type="radio" name={`${id}-tema`} checked={aparencia.rapido === o.valor} onChange={() => mudar({ rapido: o.valor })} />
              <span
                className="nm-tema-bola"
                data-tema={o.valor}
                style={o.valor === 'personalizado' ? { '--fundo': corFundo, '--destaque': corDestaque } : undefined}
                aria-hidden="true"
              />
              <span>{o.rotulo}</span>
            </label>
          ))}
        </fieldset>

        <div className="nm-canto-lista">
          <button type="button" className="nm-canto-item" onClick={() => { fechar(); dock.abrir('avisos'); }}>
            <SinoIcone />
            <span className="nm-canto-item-texto">Avisos</span>
            {porLer > 0 && <span className="nm-canto-contagem">{porLer}</span>}
          </button>
          {itens.map((i) => (
            <button key={i.titulo} type="button" className="nm-canto-item" data-perigo={i.perigo || undefined} onClick={() => { fechar(); i.onClick?.(); }}>
              {typeof i.icone === 'string' ? <Icon icon={i.icone} /> : i.icone}
              <span className="nm-canto-item-texto">{i.titulo}</span>
              {i.contexto && <span className="nm-canto-contexto">{i.contexto}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
