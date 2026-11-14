// CartaoInfo (next-mobile) — cartão informativo em tom pastel, suave.
//
//   ┌──────────────────────┐
//   │ ◷ Título             │   ícone + título (tom escuro do pastel)
//   │ 12                   │   valor grande (opcional)
//   │ descrição curta      │
//   │ [ação]               │   botão opcional
//   └──────────────────────┘
//
// tom: coral · ceu · salvia · lavanda · ambar · mar · rosa · neutro
// largo: ocupa 2 colunas da GrelhaInfo. Estilos em cartao-info.css.
import { Icon } from '@astryxdesign/core';
import './cartao-info.css';

export default function CartaoInfo({ tom = 'neutro', icone, titulo, valor, descricao, acao, largo, children }) {
  return (
    <article className="nm-info" data-tom={tom} data-largo={largo || undefined}>
      <header className="nm-info-topo">
        {icone && <span className="nm-info-icone" aria-hidden="true">{typeof icone === 'string' ? <Icon icon={icone} /> : icone}</span>}
        <h3 className="nm-info-titulo">{titulo}</h3>
      </header>
      {valor != null && <p key={String(valor)} className="nm-info-valor">{valor}</p>}
      {descricao && <p className="nm-info-descricao">{descricao}</p>}
      {children}
      {acao && <div className="nm-info-acao">{acao}</div>}
    </article>
  );
}

/** Grelha alinhada: cartões da mesma linha com a mesma altura; colunas automáticas. */
export function GrelhaInfo({ children }) {
  return <div className="nm-grelha-info">{children}</div>;
}
