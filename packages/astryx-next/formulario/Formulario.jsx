// Formulário inteligente (Astryx-NEXT) — evolução do formulário do KARGA mobile.
//
//  <Formulario id="nova-tarefa" onSubmeter={(v) => …} onAviso={dock.aviso}>
//    <Seccao titulo="Tarefa">
//      <Campo nome="titulo" rotulo="Título" obrigatorio largo />
//      <Campo nome="notas" rotulo="Notas" tipo="texto-longo" largo />
//    </Seccao>
//  </Formulario>
//
// - Legenda dentro do campo: sobe e encolhe ao escrever.
// - Validação ao sair do campo (✓ ou mensagem), teclado e preenchimento
//   automático certos pelo tipo (email, telefone, data, hora, número…).
// - Grelha que se ajusta: 1 coluna no telemóvel, 2+ no tablet; `largo` ocupa a linha.
// - Progresso por segmentos (um por campo) + "Falta: X" que leva ao campo.
//   Cores do KARGA: laranja = faltam obrigatórios · azul = faltam opcionais · verde = completo.
// - Secções com contagem; completas e fora de foco, encolhem para um resumo.
// - Rascunho guardado neste dispositivo; recuperado ao voltar.
// Estilos em formulario.css.
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, Icon } from '@astryxdesign/core';
import './formulario.css';

const Ctx = createContext(null);
const SeccaoCtx = createContext(null);

/** Tipos de campo: teclado, preenchimento automático e validação. */
const TIPOS = {
  texto: { type: 'text' },
  'texto-longo': { area: true },
  email: { type: 'email', inputMode: 'email', autoComplete: 'email', valida: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Email incompleto (ex.: nome@dominio.cv)' },
  telefone: { type: 'tel', inputMode: 'tel', autoComplete: 'tel', valida: (v) => v.replace(/\D/g, '').length >= 7 || 'Pelo menos 7 dígitos' },
  numero: { type: 'text', inputMode: 'decimal', valida: (v) => !Number.isNaN(Number(v.replace(',', '.'))) || 'Só números' },
  data: { type: 'date' },
  hora: { type: 'time' },
  nome: { type: 'text', autoComplete: 'name', autoCapitalize: 'words' },
};

const preenchido = (v) => (typeof v === 'string' ? v.trim() !== '' : v != null && v !== false);
const lerRascunho = (id) => { try { return JSON.parse(localStorage.getItem(`nf-rascunho:${id}`) ?? 'null'); } catch { return null; } };

/**
 * @param id         identifica o rascunho guardado (omitir = sem rascunho)
 * @param inicial    valores iniciais
 * @param onSubmeter (valores) => void — só é chamado com os obrigatórios feitos
 * @param onAviso    ({ tipo, titulo, sub }) — para alertas rápidos (ex.: dock.aviso)
 * @param rotuloGuardar  texto do botão
 */
export default function Formulario({ id, inicial = {}, onSubmeter, onAviso, rotuloGuardar = 'Guardar', children }) {
  const [valores, setValores] = useState(() => ({ ...inicial, ...(id ? lerRascunho(id) ?? {} : {}) }));
  const [campos, setCampos] = useState([]); // registo: { nome, rotulo, obrigatorio, seccao, idInput }
  const raiz = useRef(null);

  // Rascunho: avisa se recuperou um; guarda enquanto se escreve.
  useEffect(() => {
    if (id && lerRascunho(id) && Object.values(lerRascunho(id)).some(preenchido)) {
      onAviso?.({ tipo: 'info', titulo: 'Rascunho recuperado', sub: 'Continuas onde ficaste' });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(() => { try { localStorage.setItem(`nf-rascunho:${id}`, JSON.stringify(valores)); } catch {} }, 500);
    return () => clearTimeout(t);
  }, [id, valores]);

  const registar = useCallback((c) => {
    setCampos((l) => [...l.filter((x) => x.nome !== c.nome), c]);
    return () => setCampos((l) => l.filter((x) => x.nome !== c.nome));
  }, []);
  const mudar = useCallback((nome, v) => setValores((a) => ({ ...a, [nome]: v })), []);

  // Progresso (pela ordem do formulário no ecrã)
  const ordenados = useMemo(() => {
    const ordem = [...(raiz.current?.querySelectorAll('[data-nf-campo]') ?? [])].map((e) => e.dataset.nfCampo);
    return [...campos].sort((a, b) => ordem.indexOf(a.nome) - ordem.indexOf(b.nome));
  }, [campos]);
  const faltam = ordenados.filter((c) => !preenchido(valores[c.nome]));
  const faltamObrig = faltam.filter((c) => c.obrigatorio);
  const tom = faltam.length === 0 ? 'completo' : faltamObrig.length ? 'falta' : 'pronto';
  const proximo = faltamObrig[0] ?? faltam[0];

  const focar = (c) => {
    const el = document.getElementById(c.idInput);
    if (!el) return;
    el.closest('.nf-seccao')?.dispatchEvent(new CustomEvent('nf-abrir'));
    requestAnimationFrame(() => { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
  };

  function submeter(e) {
    e.preventDefault();
    if (faltamObrig.length) return focar(faltamObrig[0]);
    onSubmeter?.(valores);
    if (id) try { localStorage.removeItem(`nf-rascunho:${id}`); } catch {}
  }

  const estado = tom === 'completo' ? 'Completo'
    : tom === 'falta' ? `${faltamObrig.length} ${faltamObrig.length === 1 ? 'obrigatório' : 'obrigatórios'} em falta`
    : 'Obrigatórios feitos';

  return (
    <Ctx.Provider value={{ valores, mudar, registar }}>
      <form ref={raiz} className="nf" onSubmit={submeter} noValidate>
        {/* Progresso: um segmento por campo */}
        <div className="nf-progresso" data-tom={tom}>
          <div className="nf-progresso-topo">
            <strong aria-live="polite">{estado}</strong>
            <span>{ordenados.length - faltam.length} de {ordenados.length}</span>
          </div>
          <div className="nf-segmentos" aria-hidden="true">
            {ordenados.map((c) => (
              <span key={c.nome} data-cheio={preenchido(valores[c.nome]) || undefined} data-obrigatorio={c.obrigatorio || undefined} />
            ))}
          </div>
          {proximo && (
            <button type="button" className="nf-falta" onClick={() => focar(proximo)}>
              Falta: <strong>{proximo.rotulo}</strong>{faltam.length > 1 && ` e mais ${faltam.length - 1}`} <Icon icon="arrowDown" size="sm" />
            </button>
          )}
        </div>

        {children}

        <div className="nf-acoes">
          <Button type="submit" variant="primary" label={faltamObrig.length ? `Faltam ${faltamObrig.length}` : rotuloGuardar} width="100%" />
        </div>
      </form>
    </Ctx.Provider>
  );
}

/** Secção: título + contagem; completa e fora de foco, encolhe para um resumo. */
export function Seccao({ titulo, children }) {
  const { valores } = useContext(Ctx);
  const [campos, setCampos] = useState([]);
  const [aberta, setAberta] = useState(true);
  const ref = useRef(null);

  const registarNaSeccao = useCallback((c) => {
    setCampos((l) => [...l.filter((x) => x.nome !== c.nome), c]);
    return () => setCampos((l) => l.filter((x) => x.nome !== c.nome));
  }, []);

  const feitos = campos.filter((c) => preenchido(valores[c.nome])).length;
  const completa = campos.length > 0 && feitos === campos.length;

  // Abre quando o progresso pede ("Falta: …")
  useEffect(() => {
    const el = ref.current;
    const abrir = () => setAberta(true);
    el.addEventListener('nf-abrir', abrir);
    return () => el.removeEventListener('nf-abrir', abrir);
  }, []);

  const sair = (e) => { if (completa && !e.currentTarget.contains(e.relatedTarget)) setAberta(false); };
  const resumo = campos.map((c) => valores[c.nome]).filter(preenchido).join(' · ');

  return (
    <SeccaoCtx.Provider value={registarNaSeccao}>
      <fieldset ref={ref} className="nf-seccao" data-completa={completa || undefined} onBlur={sair}>
        <legend className="nf-seccao-titulo">
          <span>{titulo}</span>
          <span className="nf-contagem">{completa ? <Icon icon="check" size="sm" /> : `${feitos}/${campos.length}`}</span>
        </legend>
        {!aberta && (
          <button type="button" className="nf-resumo" onClick={() => setAberta(true)} aria-label={`Editar ${titulo}: ${resumo}`}>
            <span>{resumo}</span>
            <Icon icon="chevronDown" size="sm" />
          </button>
        )}
        <div className="nf-grelha" hidden={!aberta}>{children}</div>
      </fieldset>
    </SeccaoCtx.Provider>
  );
}

/** Campo com legenda dentro. tipo: texto · texto-longo · email · telefone · numero · data · hora · nome */
export function Campo({ nome, rotulo, tipo = 'texto', obrigatorio, largo, ajuda }) {
  const { valores, mudar, registar } = useContext(Ctx);
  const registarNaSeccao = useContext(SeccaoCtx);
  const idInput = useId();
  const [tocado, setTocado] = useState(false);
  const t = TIPOS[tipo] ?? TIPOS.texto;
  const valor = valores[nome] ?? '';

  useEffect(() => registar({ nome, rotulo, obrigatorio, idInput }), [nome, rotulo, obrigatorio, idInput, registar]);
  useEffect(() => registarNaSeccao?.({ nome }), [nome, registarNaSeccao]);

  const vazio = !preenchido(valor);
  const resultado = vazio ? true : (t.valida?.(valor) ?? true);
  const erro = tocado && (vazio ? (obrigatorio ? 'Obrigatório' : null) : resultado === true ? null : resultado);
  const valido = tocado && !vazio && resultado === true;

  const props = {
    id: idInput,
    className: 'nf-entrada',
    value: valor,
    placeholder: ' ', // para o :placeholder-shown da legenda flutuante
    onChange: (e) => mudar(nome, e.target.value),
    onBlur: () => setTocado(true),
    required: obrigatorio,
    'aria-invalid': erro ? true : undefined,
    'aria-describedby': erro || ajuda ? `${idInput}-nota` : undefined,
    type: t.type, inputMode: t.inputMode, autoComplete: t.autoComplete, autoCapitalize: t.autoCapitalize,
  };

  return (
    <div className="nf-campo" data-nf-campo={nome} data-largo={largo || undefined} data-erro={erro ? '' : undefined} data-valido={valido || undefined} data-sempre-acima={['data', 'hora'].includes(tipo) || undefined}>
      {t.area ? <textarea {...props} type={undefined} rows={2} /> : <input {...props} />}
      <label htmlFor={idInput} className="nf-legenda">
        {rotulo}{obrigatorio && <span className="nf-obrigatorio" aria-hidden="true"> *</span>}
      </label>
      {valido && <span className="nf-ok" aria-hidden="true"><Icon icon="check" size="sm" /></span>}
      {(erro || ajuda) && <p id={`${idInput}-nota`} className="nf-nota">{erro || ajuda}</p>}
    </div>
  );
}
