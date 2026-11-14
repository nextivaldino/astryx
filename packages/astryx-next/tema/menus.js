// Menus "colados" ao botão (ver menus.css).
// Ao abrir um menu, mede-o junto com o botão e decide que cantos ficam retos:
//   - no menu, só o canto que fica encostado ao botão;
//   - no botão, só o canto que fica encostado ao menu.
// Botões redondos (avatar, só ícone) não colam: o menu flutua como no Astryx.

const SUPERFICIE = '.astryx-popover:has(.astryx-dropdown-menu), .astryx-selector-popup, .astryx-multi-selector-popup, .astryx-complex-selector-popup';
const CAMPO = '.astryx-selector, .astryx-multi-selector, .astryx-complex-selector';
const CANTOS = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'];
const abertos = new Map(); // camada → [superfície, caixa do botão]

const dentro = (x, a, b) => x >= a - 1 && x <= b + 1;
const limpa = (el) => CANTOS.forEach((k) => (el.style[k] = ''));

function botaoDe(camada) {
  const nome = camada.style.getPropertyValue('position-anchor');
  if (!nome) return null;
  const t = [...document.querySelectorAll('[style*="anchor-name"]')].find(
    (el) => el.style.getPropertyValue('anchor-name') === nome,
  );
  return t && (t.closest(CAMPO) || t);
}

function encosta(superficie, caixa) {
  const m = superficie.getBoundingClientRect();
  const b = caixa.getBoundingClientRect();
  const porBaixo = m.top >= b.bottom - 2;
  // ponytail: esquerda/direita físicas; em RTL basta trocar start/end.
  const [mE, mD] = porBaixo ? ['borderTopLeftRadius', 'borderTopRightRadius'] : ['borderBottomLeftRadius', 'borderBottomRightRadius'];
  const [bE, bD] = porBaixo ? ['borderBottomLeftRadius', 'borderBottomRightRadius'] : ['borderTopLeftRadius', 'borderTopRightRadius'];
  if (dentro(m.left, b.left, b.right)) superficie.style[mE] = '0';
  if (dentro(m.right, b.left, b.right)) superficie.style[mD] = '0';
  if (dentro(b.left, m.left, m.right)) caixa.style[bE] = '0';
  if (dentro(b.right, m.left, m.right)) caixa.style[bD] = '0';
}

document.addEventListener(
  'beforetoggle',
  (e) => {
    const camada = e.target;
    const superficie = camada.querySelector?.(`:scope > :is(${SUPERFICIE})`);
    if (!superficie) return;

    if (e.newState === 'closed') {
      const par = abertos.get(camada);
      if (par) par.forEach(limpa);
      abertos.delete(camada);
      delete camada.dataset.dsColado;
      return;
    }

    const caixa = botaoDe(camada);
    if (!caixa) return;
    const r = caixa.getBoundingClientRect();
    if (parseFloat(getComputedStyle(caixa).borderTopLeftRadius) >= r.height / 2 - 1) return; // redondo

    camada.dataset.dsColado = '';
    abertos.set(camada, [superficie, caixa]);
    requestAnimationFrame(() => abertos.has(camada) && encosta(superficie, caixa));
  },
  true,
);
