// astryx-next/comum — lógica partilhada pelos estilos next-desktop e next-mobile.
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * Muda de página com uma transição suave (View Transitions; ver tema/movimento.css).
 *   transicao(() => setPagina('Registos'), 'frente')   // 'frente' · 'tras' · 'troca'
 * Sem suporte do browser, ou com menos movimento pedido, muda logo, sem animar.
 */
export function transicao(mudar, sentido = 'troca') {
  const raiz = document.documentElement;
  if (!document.startViewTransition || raiz.hasAttribute('data-reduzir-efeitos')
    || matchMedia('(prefers-reduced-motion: reduce)').matches) return mudar();
  raiz.dataset.transicao = sentido;
  document.startViewTransition(() => flushSync(mudar)).finished
    .finally(() => { if (raiz.dataset.transicao === sentido) delete raiz.dataset.transicao; });
}

/** Sentido da navegação entre duas posições de uma lista (separadores, abas). */
export const sentidoEntre = (lista, de, para) => {
  const a = lista.indexOf(de), b = lista.indexOf(para);
  return a < 0 || b < 0 || a === b ? 'troca' : b > a ? 'frente' : 'tras';
};

/** true/false conforme a ligação à rede; atualiza sozinho. */
export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    addEventListener('online', on);
    addEventListener('offline', off);
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, []);
  return online;
}

/** Modo do <Theme> do Astryx para cada escolha de tema. */
export const MODO_TEMA = { sistema: 'system', claro: 'light', escuro: 'dark' };
export const NOME_TEMA = { sistema: 'Tema do sistema', claro: 'Tema claro', escuro: 'Tema escuro' };

/**
 * Tema escolhido: 'sistema' | 'claro' | 'escuro', guardado no dispositivo.
 * Usar com <Theme mode={MODO_TEMA[tema]}>; html[data-theme] acompanha para o
 * fundo e as barras de deslocamento do browser.
 */
export function useTema() {
  const [tema, setTema] = useState(() => { try { return localStorage.getItem('tema') ?? 'sistema'; } catch { return 'sistema'; } });
  useEffect(() => {
    const html = document.documentElement;
    if (tema === 'sistema') delete html.dataset.theme;
    else html.dataset.theme = tema === 'escuro' ? 'dark' : 'light';
    try { localStorage.setItem('tema', tema); } catch {}
  }, [tema]);
  return [tema, setTema];
}

export { OPCOES, PADRAO, RAPIDO, aparenciaEfetiva, aplicarAparencia, aplicarAparenciaGuardada, lerAparencia, useAparencia } from './aparencia.js';
