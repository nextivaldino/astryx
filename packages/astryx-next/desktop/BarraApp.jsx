// BarraApp — barra superior de aplicação, inspirada nas header bars do GNOME.
//
//  ┌ principal ────────────────────────────────────────────────────────────┐
//  │ [logo ⌄] │ título   [aba][aba][aba]        [pesquisa] [fim…] [⌄]      │
//  ├ sub-barra (tom mais leve, expansível) ────────────────────────────────┤
//  │ conteúdo da página: ações, filtros, gestão                            │
//  └───────────────────────────────────────────────────────────────────────┘
//
// Adaptativa (barra-app.css):
//   ≥1024px  tudo visível
//   <1024px  nome da app escondido (fica o ícone); pesquisa vira botão 🔍
//   <768px   (ou sempre, nas Definições) vira BARRA DE TAREFAS ao estilo Windows 7:
//            Iniciar + páginas + tabuleiro, em baixo ou em cima (BarraTarefas.jsx)
//
// Só compõe componentes do Astryx; o estilo vem de barra-app.css + tema.
import { useEffect, useId, useState } from 'react';
import { Button, DropdownMenu, Icon, Tab, TabList, TextInput } from '@astryxdesign/core';
import { sentidoEntre, transicao } from '../comum/index.js';
import BarraTarefas from './BarraTarefas.jsx';
import './barra-app.css';

/** Modo da barra: lê a escolha das Definições (<html data-barra-*>) e a largura da janela. */
function useModoBarra() {
  const raiz = document.documentElement;
  const ler = () => ({
    sempre: raiz.dataset.barraTarefas === 'sempre',
    posicao: raiz.dataset.barraPosicao === 'cima' ? 'cima' : 'baixo',
    estreita: matchMedia('(width < 768px)').matches,
  });
  const [modo, setModo] = useState(ler);
  useEffect(() => {
    const atualizar = () => setModo((m) => { const n = ler(); return n.sempre === m.sempre && n.posicao === m.posicao && n.estreita === m.estreita ? m : n; });
    const mo = new MutationObserver(atualizar);
    mo.observe(raiz, { attributes: true, attributeFilter: ['data-barra-tarefas', 'data-barra-posicao'] });
    const mq = matchMedia('(width < 768px)');
    mq.addEventListener('change', atualizar);
    return () => { mo.disconnect(); mq.removeEventListener('change', atualizar); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { tarefas: modo.sempre || modo.estreita, posicao: modo.posicao };
}

const lerAberta = (chave) => { try { return localStorage.getItem(chave) === '1'; } catch { return false; } };
const gravarAberta = (chave, v) => { try { localStorage.setItem(chave, v ? '1' : '0'); } catch {} };

/**
 * @param app        { nome, versao, icone }  — icone: nome de ícone do tema (ex.: 'calendar')
 * @param menuApp    itens do menu da app (DropdownMenuItem, RadioGroup, Divider…)
 * @param titulo     título da página atual
 * @param abas       [{ valor, rotulo, icone }]  + abaAtiva / onAbaChange
 * @param pesquisa   { valor, onChange, placeholder } (opcional)
 * @param fim        botões extra antes do disparador (ex.: menu principal)
 * @param subBarra   conteúdo da sub-barra; sem ele não há disparador
 * @param onDefinicoes  abre as definições (botão ⚙ no tabuleiro da barra de tarefas)
 */
export default function BarraApp({
  app, menuApp, titulo, abas = [], abaAtiva, onAbaChange, pesquisa, fim, subBarra, onDefinicoes,
}) {
  const idSub = useId();
  const chave = `ds-barra-sub:${app.nome}`;
  const [aberta, setAberta] = useState(() => lerAberta(chave));
  const [aPesquisar, setAPesquisar] = useState(false);
  const irPara = (v) => v !== abaAtiva && transicao(() => onAbaChange(v), sentidoEntre(abas.map((a) => a.valor), abaAtiva, v));
  useEffect(() => gravarAberta(chave, aberta), [chave, aberta]);
  // 1.ª aba = início (o padrão do fundo pode aparecer só aqui)
  const noInicio = abaAtiva === abas[0]?.valor;
  const { tarefas, posicao } = useModoBarra();
  // Avisa o resto da página (barra de estado, margens) de onde está a barra de tarefas
  useEffect(() => {
    if (!tarefas) return;
    document.documentElement.dataset.tarefas = posicao;
    return () => { delete document.documentElement.dataset.tarefas; };
  }, [tarefas, posicao]);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-no-inicio', noInicio);
    return () => document.documentElement.removeAttribute('data-no-inicio');
  }, [noInicio]);

  const abasEl = abas.length > 0 && (
    <TabList value={abaAtiva} onChange={irPara} size="sm" overflow="scroll">
      {abas.map((a) => (
        <Tab key={a.valor} value={a.valor} label={a.rotulo} icon={a.icone && <Icon icon={a.icone} size="sm" />} />
      ))}
    </TabList>
  );

  const barraTarefas = (
    <BarraTarefas
      app={app}
      menuApp={menuApp}
      abas={abas}
      abaAtiva={abaAtiva}
      irPara={irPara}
      pesquisa={pesquisa}
      fim={fim}
      onDefinicoes={onDefinicoes}
      posicao={posicao}
      sub={subBarra && { aberta, id: idSub, alternar: () => setAberta((v) => !v) }}
    />
  );

  return (
    <>
      <header className="ds-barra" data-sub-aberta={aberta || undefined} data-tarefas={tarefas ? posicao : undefined}>
        {tarefas && posicao === 'cima' && barraTarefas}
        {tarefas && posicao === 'baixo' && (
          <div className="ds-barra-principal" data-min="">
            <span className="ds-barra-logo" aria-hidden="true"><Icon icon={app.icone} /></span>
            {titulo && <h1 className="ds-barra-titulo">{titulo}</h1>}
          </div>
        )}
        {!tarefas && <div className="ds-barra-principal">
          {/* Menu da app: logótipo + nome, como o menu da app no Mac */}
          <DropdownMenu
            placement="below"
            menuWidth={260}
            menuMaxHeight={520}
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
              <button {...props} className="ds-barra-app" aria-label={`Menu da ${app.nome}`}>
                <span className="ds-barra-logo" aria-hidden="true"><Icon icon={app.icone} /></span>
                <span className="ds-barra-app-nome">{app.nome}</span>
                <Icon icon="chevronDown" size="sm" />
              </button>
            )}
          >
            {menuApp}
          </DropdownMenu>

          {titulo && <h1 className="ds-barra-titulo">{titulo}</h1>}

          <nav className="ds-barra-abas" aria-label="Páginas">{abasEl}</nav>

          <div className="ds-barra-fim">
            {pesquisa && (
              <>
                <div className="ds-barra-pesquisa">
                  <TextInput
                    type="search"
                    label="Pesquisar"
                    isLabelHidden
                    size="sm"
                    startIcon="search"
                    placeholder={pesquisa.placeholder ?? 'Pesquisar…'}
                    value={pesquisa.valor}
                    onChange={pesquisa.onChange}
                  />
                </div>
                <Button
                  className="ds-barra-pesquisa-botao"
                  variant="ghost"
                  label="Pesquisar"
                  isIconOnly
                  icon={<Icon icon="search" />}
                  aria-pressed={aPesquisar}
                  onClick={() => setAPesquisar((v) => !v)}
                />
              </>
            )}
            {fim}
            {subBarra && (
              <Button
                className="ds-barra-expandir"
                variant="ghost"
                label={aberta ? 'Esconder opções da página' : 'Mostrar opções da página'}
                tooltip={aberta ? 'Esconder opções da página' : 'Mostrar opções da página'}
                isIconOnly
                icon={<Icon icon="chevronDown" />}
                aria-expanded={aberta}
                aria-controls={idSub}
                onClick={() => setAberta((v) => !v)}
              />
            )}
          </div>
        </div>}

        {/* Pesquisa em ecrãs estreitos: linha própria, como a search bar do GNOME */}
        {!tarefas && pesquisa && aPesquisar && (
          <div className="ds-barra-linha-pesquisa">
            <TextInput
              type="search"
              label="Pesquisar"
              isLabelHidden
              size="sm"
              startIcon="search"
              placeholder={pesquisa.placeholder ?? 'Pesquisar…'}
              value={pesquisa.valor}
              onChange={pesquisa.onChange}
              autoFocus
            />
          </div>
        )}

        {subBarra && (
          <div className="ds-subbarra" id={idSub} inert={!aberta || undefined}>
            <div className="ds-subbarra-conteudo">{subBarra}</div>
          </div>
        )}
      </header>

      {tarefas && posicao === 'baixo' && barraTarefas}
    </>
  );
}
