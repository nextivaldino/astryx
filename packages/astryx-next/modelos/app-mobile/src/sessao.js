// ⚠️ Sessão LOCAL de exemplo, para o modelo funcionar sem servidor.
// Substituir pela autenticação real da app (API, token, etc.).
const CHAVE = 'sessao';

export function lerSessao() {
  try { return JSON.parse(localStorage.getItem(CHAVE) ?? 'null'); } catch { return null; }
}
export function iniciarSessao(nome) {
  const sessao = { nome: nome.trim() };
  try { localStorage.setItem(CHAVE, JSON.stringify(sessao)); } catch {}
  return sessao;
}
export function terminarSessao() {
  try { localStorage.removeItem(CHAVE); } catch {}
}
