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
//   <640px   título ao centro; abas passam para uma barra no fundo do ecrã
//
// Só compõe componentes do Astryx; o estilo vem de barra-app.css + tema.
import { useEffect, useId, useState } from 'react';
import { Button, DropdownMenu, Icon, Tab, TabList, TextInput } from '@astryxdesign/core';
import './barra-app.css';

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
 */
export default function BarraApp({
  app, menuApp, titulo, abas = [], abaAtiva, onAbaChange, pesquisa, fim, subBarra,
}) {
  const idSub = useId();
  const chave = `ds-barra-sub:${app.nome}`;
  const [aberta, setAberta] = useState(() => lerAberta(chave));
  const [aPesquisar, setAPesquisar] = useState(false);
  useEffect(() => gravarAberta(chave, aberta), [chave, aberta]);

  const abasEl = abas.length > 0 && (
    <TabList value={abaAtiva} onChange={onAbaChange} size="sm" overflow="scroll">
      {abas.map((a) => (
        <Tab key={a.valor} value={a.valor} label={a.rotulo} icon={a.icone && <Icon icon={a.icone} size="sm" />} />
      ))}
    </TabList>
  );

  return (
    <>
      <header className="ds-barra" data-sub-aberta={aberta || undefined}>
        <div className="ds-barra-principal">
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
        </div>

        {/* Pesquisa em ecrãs estreitos: linha própria, como a search bar do GNOME */}
        {pesquisa && aPesquisar && (
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

      {/* Telemóvel: as abas descem para uma barra no fundo (view switcher bar do GNOME) */}
      {abas.length > 0 && (
        <nav className="ds-barra-fundo" aria-label="Páginas">
          {abas.map((a) => (
            <button
              key={a.valor}
              type="button"
              className="ds-barra-fundo-item"
              aria-current={a.valor === abaAtiva ? 'page' : undefined}
              onClick={() => onAbaChange(a.valor)}
            >
              {a.icone && <Icon icon={a.icone} />}
              <span>{a.rotulo}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
