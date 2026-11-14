// BarraEstado — barra de estado no fundo da janela, com informação da app.
//   <BarraEstado inicio={…} fim={…} />  com itens <Estado icone="…">texto</Estado>
// Telemóvel (<640px): escondida, exceto avisos (ex.: sem ligação) — ver barra-estado.css.
import { Icon } from '@astryxdesign/core';
export { useOnline } from '../comum/index.js';
import './barra-estado.css';

/** Um item da barra: ícone (opcional) + texto. `aviso` mantém-no visível no telemóvel. */
export function Estado({ icone, inicio, aviso, children, ...props }) {
  return (
    <span className="ds-estado-item" data-aviso={aviso || undefined} {...props}>
      {inicio}
      {icone && <Icon icon={icone} size="xsm" />}
      <span>{children}</span>
    </span>
  );
}

export default function BarraEstado({ inicio, fim }) {
  return (
    <footer className="ds-estado">
      <div className="ds-estado-grupo">{inicio}</div>
      <div className="ds-estado-grupo">{fim}</div>
    </footer>
  );
}
