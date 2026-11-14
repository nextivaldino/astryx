// Estado global da Dock (next-mobile): painel aberto, fila de avisos (ilha),
// e se está escondida. As páginas falam com a dock por useDock().
// Inspirado na Dock_next-2 do KARGA mobile.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/** Alertas rápidos: vão para a pílula do canto do utilizador e somem sozinhos.
    Os outros (atenção, erro, mensagem) vão para a ilha da dock e ficam até serem vistos. */
const RAPIDOS = ['sucesso', 'info'];
const RAPIDO_MS = 4000;

const DockContext = createContext(null);

export function DockProvider({ children }) {
  const [painel, setPainel] = useState(null); // nome do painel aberto ou null
  const [avisos, setAvisos] = useState([]); // fila da ilha
  const [historico, setHistorico] = useState([]); // todos os avisos (painel de avisos)
  const [escondida, setEscondida] = useState(false);
  const [rapido, setRapido] = useState(null); // alerta rápido atual (pílula)
  const timerRapido = useRef(null);

  /** aviso({ tipo: 'info'|'sucesso'|'atencao'|'erro'|'mensagem', titulo, sub? }) */
  const aviso = useCallback((a) => {
    const novo = { ...a, id: a.id ?? `${a.tipo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, criadoEm: Date.now(), lido: false };
    setHistorico((l) => [novo, ...l].slice(0, 50));
    if (RAPIDOS.includes(novo.tipo)) {
      setRapido(novo);
      clearTimeout(timerRapido.current);
      timerRapido.current = setTimeout(() => setRapido(null), RAPIDO_MS);
      return;
    }
    setAvisos((l) => (l.some((x) => x.id === novo.id) ? l : [...l, novo]));
  }, []);

  /** Tira um alerta da ilha quando deixa de ser verdade (ex.: a ligação voltou). */
  const retirarAviso = useCallback((id) => setAvisos((l) => l.filter((x) => x.id !== id)), []);
  const dispensarRapido = useCallback(() => { clearTimeout(timerRapido.current); setRapido(null); }, []);

  useEffect(() => () => clearTimeout(timerRapido.current), []);

  // O aviso ativo (alerta rápido ou o último da ilha) pinta o fundo (tema/textura.css).
  // Cada aviso novo volta a pulsar: alterna entre duas animações iguais.
  const ativo = rapido ?? avisos.at(-1);
  useEffect(() => {
    const d = document.documentElement.dataset;
    if (!ativo) { delete d.fundoAviso; delete d.fundoPulso; return; }
    d.fundoAviso = ativo.tipo;
    d.fundoPulso = d.fundoPulso === 'a' ? 'b' : 'a';
  }, [ativo?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { const d = document.documentElement.dataset; delete d.fundoAviso; delete d.fundoPulso; }, []);

  /** Tira os avisos da ilha (ao tocar nela) e devolve-os (espelho síncrono da fila). */
  const avisosRef = useRef(avisos);
  avisosRef.current = avisos;
  const consumirAvisos = useCallback(() => {
    const tirados = avisosRef.current;
    avisosRef.current = [];
    setAvisos([]);
    return tirados;
  }, []);

  const marcarLidos = useCallback(() => setHistorico((l) => l.map((a) => ({ ...a, lido: true }))), []);
  const abrir = useCallback((nome) => setPainel(nome), []);
  const fechar = useCallback(() => setPainel(null), []);
  const esconder = useCallback((on) => setEscondida(on), []);

  const value = useMemo(
    () => ({ painel, avisos, historico, escondida, rapido, aviso, retirarAviso, dispensarRapido, consumirAvisos, marcarLidos, abrir, fechar, esconder }),
    [painel, avisos, historico, escondida, rapido, aviso, retirarAviso, dispensarRapido, consumirAvisos, marcarLidos, abrir, fechar, esconder],
  );
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

const NOOP = {
  painel: null, avisos: [], historico: [], escondida: false, rapido: null,
  aviso() {}, retirarAviso() {}, dispensarRapido() {}, consumirAvisos: () => [], marcarLidos() {}, abrir() {}, fechar() {}, esconder() {},
};

/** API da dock. Fora do DockProvider não faz nada. */
export function useDock() {
  return useContext(DockContext) ?? NOOP;
}
