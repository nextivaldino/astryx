// Aparência do sistema (Astryx-NEXT): estilo, modo, fundo, destaque, densidade…
// Guardada neste dispositivo e aplicada como atributos no <html>, que o CSS
// de tema/aparencia.css lê. Igual em todas as apps (é do sistema, não da app).
import { useCallback, useEffect, useState } from 'react';

const CHAVE = 'next-aparencia-v1';

export const OPCOES = {
  estilo: [
    { valor: 'adwaita', rotulo: 'Adwaita', descricao: 'Sóbrio e neutro, ao estilo GNOME' },
    { valor: 'coral', rotulo: 'Coral', descricao: 'Quente e expressivo, ao estilo KARGA' },
  ],
  modo: [
    { valor: 'sistema', rotulo: 'Sistema' },
    { valor: 'claro', rotulo: 'Claro' },
    { valor: 'escuro', rotulo: 'Escuro' },
  ],
  fundo: [
    { valor: 'padrao', cor: '#fafafb', rotulo: 'Padrão' },
    { valor: 'marfim', cor: '#f7f4ef', rotulo: 'Marfim' },
    { valor: 'linho', cor: '#f4eee4', rotulo: 'Linho' },
    { valor: 'salvia', cor: '#e3e9df', rotulo: 'Sálvia' },
    { valor: 'nevoa', cor: '#e1e8ec', rotulo: 'Névoa' },
    { valor: 'ceu', cor: '#e4ecff', rotulo: 'Céu' },
    { valor: 'coral', cor: '#fee4da', rotulo: 'Coral' },
    { valor: 'lavanda', cor: '#eeeafa', rotulo: 'Lavanda' },
    { valor: 'grafite', cor: '#101012', rotulo: 'Grafite' },
    { valor: 'aurora', cor: '#d9d3f3', rotulo: 'Aurora' },
  ],
  destaque: [
    { valor: 'azul', cor: '#0073df', rotulo: 'Azul' },
    { valor: 'coral', cor: '#c94636', rotulo: 'Coral' },
    { valor: 'ceu', cor: '#5164e9', rotulo: 'Céu' },
    { valor: 'salvia', cor: '#038342', rotulo: 'Sálvia' },
    { valor: 'lavanda', cor: '#8a4fd7', rotulo: 'Lavanda' },
    { valor: 'ambar', cor: '#f9ad26', rotulo: 'Âmbar' },
    { valor: 'mar', cor: '#007e7b', rotulo: 'Mar' },
    { valor: 'rosa', cor: '#c82d7c', rotulo: 'Rosa' },
  ],
  // Padrão do fundo (tema/textura.css)
  textura: [
    { valor: 'nenhuma', rotulo: 'Nenhum' },
    { valor: 'grelha', rotulo: 'Grelha' },
    { valor: 'planta', rotulo: 'Planta' },
    { valor: 'pontos', rotulo: 'Pontos' },
    { valor: 'linhas', rotulo: 'Linhas' },
    { valor: 'diagonal', rotulo: 'Diagonal' },
  ],
  texturaIntensidade: [
    { valor: 'suave', rotulo: 'Suave' },
    { valor: 'media', rotulo: 'Média' },
    { valor: 'marcada', rotulo: 'Marcada' },
  ],
  texturaOnde: [
    { valor: 'inicio', rotulo: 'Só no início' },
    { valor: 'todas', rotulo: 'Em todas' },
  ],
  // Tamanho da interface (desktop / Electron): zoom de toda a app
  escala: [
    { valor: '90', rotulo: '90%' },
    { valor: '100', rotulo: '100%' },
    { valor: '110', rotulo: '110%' },
    { valor: '125', rotulo: '125%' },
  ],
  formaBotoes: [
    { valor: 'arredondado', rotulo: 'Arredondados' },
    { valor: 'pilula', rotulo: 'Pílula' },
  ],
  densidade: [
    { valor: 'compacta', rotulo: 'Compacta' },
    { valor: 'normal', rotulo: 'Normal' },
    { valor: 'confortavel', rotulo: 'Confortável' },
  ],
  ladoCriar: [
    { valor: 'direita', rotulo: 'À direita' },
    { valor: 'esquerda', rotulo: 'À esquerda' },
  ],
  dockTema: [
    { valor: 'igual', rotulo: 'Igual à app' },
    { valor: 'inverso', rotulo: 'Inverso' },
  ],
  dockMaterial: [
    { valor: 'vidro', rotulo: 'Vidro' },
    { valor: 'solido', rotulo: 'Sólido' },
  ],
  nomesDock: [
    { valor: 'ativo', rotulo: 'Só o ativo' },
    { valor: 'frequentes', rotulo: 'Mais usados' },
    { valor: 'todos', rotulo: 'Todos' },
  ],
};

export const PADRAO = {
  estilo: 'adwaita', modo: 'sistema', fundo: 'padrao', destaque: 'azul',
  textura: 'nenhuma', texturaIntensidade: 'suave', texturaOnde: 'inicio', texturaAvisos: true,
  escala: '100',
  densidade: 'normal', formaBotoes: 'arredondado', ladoCriar: 'direita', nomesDock: 'frequentes', reduzirEfeitos: false,
  // Dock (Definições → Dock)
  dockTema: 'igual', dockMaterial: 'vidro', dockEncolher: true, dockEsconder: true,
  // Tema rápido (as 3 bolinhas do canto do utilizador): 'claro' | 'escuro' | 'personalizado'.
  // Claro/Escuro usam o tema base sem apagar o personalizado.
  rapido: 'personalizado',
};

export const RAPIDO = [
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
  { valor: 'personalizado', rotulo: 'Personalizado' },
];

/** O que está mesmo aplicado: o personalizado, ou o tema base claro/escuro
    (mantém densidade, lado da dock e reduzir efeitos, que não são "tema"). */
export function aparenciaEfetiva(a) {
  if (a.rapido === 'personalizado') return a;
  // Claro/Escuro rápidos mudam só o tema; o comportamento (densidade, dock, efeitos) mantém-se.
  const { estilo, modo, fundo, destaque, ...comportamento } = a;
  return { ...PADRAO, ...comportamento, modo: a.rapido };
}

/** Escolhas que fazem parte do "tema" (mudá-las ativa o personalizado). */
const TEMA = ['estilo', 'modo', 'fundo', 'destaque'];

/** Cada estilo traz o seu fundo e destaque (o utilizador pode mudar depois). */
const SUGESTAO_ESTILO = {
  adwaita: { fundo: 'padrao', destaque: 'azul' },
  coral: { fundo: 'marfim', destaque: 'coral' },
};

/** Lê o que está guardado; valores desconhecidos voltam ao padrão. */
export function lerAparencia() {
  let guardada = {};
  try { guardada = JSON.parse(localStorage.getItem(CHAVE) ?? '{}') ?? {}; } catch {}
  const a = { ...PADRAO };
  for (const [k, lista] of Object.entries(OPCOES)) {
    if (lista.some((o) => o.valor === guardada[k])) a[k] = guardada[k];
  }
  for (const k of ['reduzirEfeitos', 'dockEncolher', 'dockEsconder', 'texturaAvisos']) if (typeof guardada[k] === 'boolean') a[k] = guardada[k];
  if (RAPIDO.some((o) => o.valor === guardada.rapido)) a.rapido = guardada.rapido;
  return a;
}

/** Escreve a aparência no <html> (o CSS faz o resto). */
export function aplicarAparencia(guardada) {
  const a = aparenciaEfetiva(guardada);
  const d = document.documentElement.dataset;
  d.estilo = a.estilo;
  d.fundo = a.fundo;
  d.destaque = a.destaque;
  d.densidade = a.densidade;
  d.escala = a.escala;
  d.textura = a.textura;
  d.texturaIntensidade = a.texturaIntensidade;
  d.texturaOnde = a.texturaOnde;
  d.texturaAvisos = a.texturaAvisos ? 'sim' : 'nao';
  d.formaBotoes = a.formaBotoes;
  d.ladoCriar = a.ladoCriar;
  d.nomesDock = a.nomesDock;
  d.dockTema = a.dockTema;
  d.dockMaterial = a.dockMaterial;
  d.dockEncolher = a.dockEncolher ? 'sim' : 'nao';
  d.dockEsconder = a.dockEsconder ? 'sim' : 'nao';
  if (a.reduzirEfeitos) d.reduzirEfeitos = ''; else delete d.reduzirEfeitos;
  if (a.modo === 'sistema') delete d.theme; else d.theme = a.modo === 'escuro' ? 'dark' : 'light';
  // Electron: a moldura nativa (barra de título, menus do sistema) segue o modo da app.
  // O preload expõe window.astryxNext.definirModo — ver README, "Electron".
  try { globalThis.astryxNext?.definirModo?.(a.modo); } catch {}
}

/** Chamar antes do primeiro render: evita ver outro tema por um instante. */
export function aplicarAparenciaGuardada() {
  aplicarAparencia(lerAparencia());
}

/**
 * [aparencia, mudar(parcial), repor(), efetiva] — usar com <Theme mode={MODO_TEMA[efetiva.modo]}>.
 * Mudar qualquer escolha do tema (na Aparência) passa a usar o personalizado.
 */
export function useAparencia() {
  const [a, setA] = useState(lerAparencia);
  useEffect(() => {
    aplicarAparencia(a);
    try { localStorage.setItem(CHAVE, JSON.stringify(a)); } catch {}
  }, [a]);
  const mudar = useCallback((parcial) => setA((atual) => ({
    ...atual,
    ...(parcial.estilo && parcial.estilo !== atual.estilo ? SUGESTAO_ESTILO[parcial.estilo] : {}),
    ...(TEMA.some((k) => k in parcial) ? { rapido: 'personalizado' } : {}),
    ...parcial,
  })), []);
  const repor = useCallback(() => setA(PADRAO), []);
  return [a, mudar, repor, aparenciaEfetiva(a)];
}
