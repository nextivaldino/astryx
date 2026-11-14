// Definições (next-mobile) — existe sempre, em qualquer app.
//
//   Definições
//   ├ [secções da app]   ← cada app passa as suas (seccoesApp)
//   └ Sistema            ← do design system, igual em todas as apps
//       ├ Aparência ›    estilo, modo, fundo, destaque, densidade, efeitos
//       ├ Dock ›         tema (igual/inverso), material, botão Criar, nomes, encolher, esconder
//       └ Sobre o sistema ›
//
// Listas em caixa, ao estilo GNOME (boxed lists). Estilos em definicoes.css.
import { useState } from 'react';
import { Button, Heading, Icon, SegmentedControl, SegmentedControlItem, Switch, Text } from '@astryxdesign/core';
import { OPCOES } from '../comum/aparencia.js';
import { transicao } from '../comum/index.js';
import { useDock } from './DockContext.jsx';
import { CasaIcone, MaisIcone, PaletaIcone, SinoIcone } from './icones.jsx';
import './dock.css';
import './definicoes.css';

/** Cabeçalho de página com "voltar" e título grande. */
function Topo({ titulo, onVoltar, voltarRotulo }) {
  return (
    <header className="nm-def-topo">
      {onVoltar && (
        <Button variant="ghost" size="sm" label={voltarRotulo} icon={<Icon icon="chevronLeft" />} onClick={onVoltar} />
      )}
      <Heading level={1}>{titulo}</Heading>
    </header>
  );
}

/** Grupo de linhas numa caixa (boxed list). */
export function GrupoDef({ titulo, nota, children }) {
  return (
    <section className="nm-def-grupo">
      {titulo && <h2 className="nm-def-grupo-titulo">{titulo}</h2>}
      <div className="nm-def-caixa">{children}</div>
      {nota && <p className="nm-def-nota">{nota}</p>}
    </section>
  );
}

/** Linha: ícone + título/subtítulo à esquerda; controlo ou › à direita. */
export function LinhaDef({ icone, titulo, sub, fim, onClick, perigo }) {
  const Corpo = onClick ? 'button' : 'div';
  return (
    <Corpo type={onClick ? 'button' : undefined} className="nm-def-linha" data-perigo={perigo || undefined} onClick={onClick}>
      {icone && <span className="nm-def-icone">{typeof icone === 'string' ? <Icon icon={icone} /> : icone}</span>}
      <span className="nm-def-texto">
        <span className="nm-def-titulo">{titulo}</span>
        {sub && <span className="nm-def-sub">{sub}</span>}
      </span>
      {fim ?? (onClick && !perigo && <Icon icon="chevronRight" />)}
    </Corpo>
  );
}

/** Amostras de cor como botões de rádio nativos (teclado e leitores de ecrã de borla). */
function Amostras({ nome, rotulo, opcoes, valor, onChange }) {
  return (
    <fieldset className="nm-amostras">
      <legend className="nm-def-grupo-titulo">{rotulo}</legend>
      <div className="nm-amostras-lista">
        {opcoes.map((o) => (
          <label key={o.valor} className="nm-amostra" title={o.rotulo}>
            <input type="radio" name={nome} value={o.valor} checked={valor === o.valor} onChange={() => onChange(o.valor)} />
            <span className="nm-amostra-cor" data-amostra={`${nome}-${o.valor}`} aria-hidden="true" />
            <span className="nm-amostra-nome">{o.rotulo}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Miniatura ao vivo: usa os tokens atuais, por isso muda com cada escolha. */
function Miniatura() {
  return (
    <div className="nm-mini" aria-hidden="true">
      <div className="nm-mini-titulo" />
      <div className="nm-mini-sub" />
      <div className="nm-mini-cartao"><span /><span /></div>
      <div className="nm-mini-cartao"><span /><span /></div>
      <div className="nm-mini-dock"><i /><b /><i /><i /><em /></div>
    </div>
  );
}

/** A dock verdadeira, parada, para pré-visualizar (segue as escolhas ao vivo). */
function DockAmostra() {
  return (
    <nav className="nm-dock nm-dock-amostra" aria-hidden="true" inert>
      <div className="nm-barra">
        <span className="nm-botao nm-avisos"><SinoIcone /><span className="nm-selo">2</span></span>
        <div className="nm-separadores">
          <span className="nm-separador" data-atual=""><CasaIcone /><span className="nm-separador-nome">Início</span></span>
          <span className="nm-separador" data-frequente=""><Icon icon="calendar" /><span className="nm-separador-nome">Hoje</span></span>
          <span className="nm-separador"><Icon icon="viewColumns" /><span className="nm-separador-nome">Semana</span></span>
          <span className="nm-separador"><Icon icon="moreHorizontal" /><span className="nm-separador-nome">Mais</span></span>
        </div>
        <span className="nm-criar"><MaisIcone strokeWidth={2.75} /></span>
      </div>
    </nav>
  );
}

function DefDock({ aparencia, mudar }) {
  const seg = (campo, rotulo) => (
    <SegmentedControl label={rotulo} value={aparencia[campo]} onChange={(v) => mudar({ [campo]: v })} layout="fill">
      {OPCOES[campo].map((o) => <SegmentedControlItem key={o.valor} value={o.valor} label={o.rotulo} />)}
    </SegmentedControl>
  );
  const interruptor = (campo, rotulo) => (
    <Switch label={rotulo} isLabelHidden value={aparencia[campo]} onChange={(v) => mudar({ [campo]: v })} />
  );
  return (
    <>
      <div className="nm-def-amostra"><DockAmostra /></div>

      <GrupoDef titulo="Aspeto" nota="Inverso: dock escura numa app clara, e clara numa app escura.">
        <LinhaDef icone={<PaletaIcone />} titulo="Tema da dock" fim={null} />
        <div className="nm-def-controlo">{seg('dockTema', 'Tema da dock')}</div>
        <LinhaDef icone="eyeSlash" titulo="Material" sub="Vidro deixa ver o conteúdo por trás" fim={null} />
        <div className="nm-def-controlo">{seg('dockMaterial', 'Material da dock')}</div>
      </GrupoDef>

      <GrupoDef titulo="Botões">
        <LinhaDef icone={<MaisIcone />} titulo="Botão Criar" sub="Lado da dock onde fica o ＋" fim={null} />
        <div className="nm-def-controlo">{seg('ladoCriar', 'Lado do botão Criar')}</div>
        <LinhaDef icone="viewColumns" titulo="Nomes nos separadores" sub="Os outros ficam só com o ícone" fim={null} />
        <div className="nm-def-controlo">{seg('nomesDock', 'Nomes nos separadores')}</div>
      </GrupoDef>

      <GrupoDef titulo="Comportamento">
        <LinhaDef icone="arrowDown" titulo="Encolher ao percorrer" sub="Fica mais baixa enquanto lês" fim={interruptor('dockEncolher', 'Encolher ao percorrer')} />
        <LinhaDef icone="eyeSlash" titulo="Esconder com o teclado" sub="Dá espaço ao escrever (telemóvel)" fim={interruptor('dockEsconder', 'Esconder com o teclado')} />
      </GrupoDef>
    </>
  );
}

function Aparencia({ aparencia, mudar, repor }) {
  const dock = useDock();
  const seg = (campo, rotulo) => (
    <SegmentedControl label={rotulo} value={aparencia[campo]} onChange={(v) => mudar({ [campo]: v })} layout="fill">
      {OPCOES[campo].map((o) => <SegmentedControlItem key={o.valor} value={o.valor} label={o.rotulo} />)}
    </SegmentedControl>
  );
  return (
    <>
      <Miniatura />

      <section className="nm-def-grupo">
        <h2 className="nm-def-grupo-titulo">Estilo</h2>
        <div className="nm-estilos" role="radiogroup" aria-label="Estilo">
          {OPCOES.estilo.map((o) => (
            <label key={o.valor} className="nm-estilo">
              <input type="radio" name="estilo" checked={aparencia.estilo === o.valor} onChange={() => mudar({ estilo: o.valor })} />
              <span className="nm-estilo-amostra" data-amostra={`estilo-${o.valor}`} aria-hidden="true"><i /><i /><b /></span>
              <span className="nm-def-titulo">{o.rotulo}</span>
              <span className="nm-def-sub">{o.descricao}</span>
            </label>
          ))}
        </div>
      </section>

      <GrupoDef titulo="Modo">
        <div className="nm-def-controlo">{seg('modo', 'Modo')}</div>
      </GrupoDef>

      <Amostras nome="fundo" rotulo="Fundo" opcoes={OPCOES.fundo} valor={aparencia.fundo} onChange={(v) => mudar({ fundo: v })} />
      <Amostras nome="destaque" rotulo="Cor de destaque" opcoes={OPCOES.destaque} valor={aparencia.destaque} onChange={(v) => mudar({ destaque: v })} />

      <Amostras nome="textura" rotulo="Padrão do fundo" opcoes={OPCOES.textura} valor={aparencia.textura} onChange={(v) => mudar({ textura: v })} />
      {aparencia.textura !== 'nenhuma' && (
        <GrupoDef nota="Linhas finas por trás do conteúdo; o passo acompanha a densidade e o ecrã.">
          <LinhaDef icone="eyeSlash" titulo="Intensidade" fim={null} />
          <div className="nm-def-controlo">{seg('texturaIntensidade', 'Intensidade do padrão')}</div>
          <LinhaDef icone={<CasaIcone />} titulo="Onde" sub="Na página inicial, ou em todas" fim={null} />
          <div className="nm-def-controlo">{seg('texturaOnde', 'Onde mostrar o padrão')}</div>
        </GrupoDef>
      )}
      <GrupoDef nota="Enquanto houver um aviso, o fundo ganha a cor dele: vermelho para erros, âmbar para atenção, verde para sucesso.">
        <LinhaDef
          icone={<SinoIcone />}
          titulo="Avisos no fundo"
          fim={<Switch label="Avisos no fundo" isLabelHidden value={aparencia.texturaAvisos} onChange={(v) => mudar({ texturaAvisos: v })} />}
        />
        {aparencia.texturaAvisos && <LinhaDef icone="info" titulo="Experimentar" sub="Mostra um aviso de exemplo" onClick={() => dock.aviso({ tipo: 'info', titulo: 'Assim fica um aviso' })} />}
      </GrupoDef>

      <GrupoDef titulo="Forma dos botões">
        <div className="nm-def-controlo">{seg('formaBotoes', 'Forma dos botões')}</div>
      </GrupoDef>

      <GrupoDef titulo="Densidade" nota="Espaço entre elementos e altura dos controlos.">
        <div className="nm-def-controlo">{seg('densidade', 'Densidade')}</div>
      </GrupoDef>

      <GrupoDef nota="Sem vidro nem animações. Mais leve em telemóveis antigos.">
        <LinhaDef
          icone="eyeSlash"
          titulo="Reduzir efeitos"
          fim={<Switch label="Reduzir efeitos" isLabelHidden value={aparencia.reduzirEfeitos} onChange={(v) => mudar({ reduzirEfeitos: v })} />}
        />
      </GrupoDef>

      <div className="nm-def-repor">
        <Button variant="secondary" label="Repor predefinições" onClick={repor} />
      </div>
    </>
  );
}

/**
 * @param seccoesApp  [{ titulo, itens: [{ icone, titulo, sub, onClick, perigo }] }]
 * @param aparencia/mudar/repor  de useAparencia()
 * @param sistema     { nome, versao } para "Sobre o sistema"
 */
export default function Definicoes({ onVoltar, seccoesApp = [], aparencia, mudar, repor, sistema = { nome: 'Astryx-NEXT', versao: '0.1.0-beta.6' } }) {
  const [vista, setVistaJa] = useState('raiz');
  const setVista = (v) => transicao(() => setVistaJa(v), v === 'raiz' ? 'tras' : 'frente');

  if (vista === 'aparencia') {
    return (
      <div className="nm-def">
        <Topo titulo="Aparência" voltarRotulo="Definições" onVoltar={() => setVista('raiz')} />
        <Aparencia aparencia={aparencia} mudar={mudar} repor={repor} />
      </div>
    );
  }
  if (vista === 'dock') {
    return (
      <div className="nm-def">
        <Topo titulo="Dock" voltarRotulo="Definições" onVoltar={() => setVista('raiz')} />
        <DefDock aparencia={aparencia} mudar={mudar} />
      </div>
    );
  }
  if (vista === 'sobre') {
    return (
      <div className="nm-def">
        <Topo titulo="Sobre o sistema" voltarRotulo="Definições" onVoltar={() => setVista('raiz')} />
        <GrupoDef>
          <LinhaDef titulo="Design system" fim={<Text type="supporting">{sistema.nome} {sistema.versao}</Text>} />
          <LinhaDef titulo="Estilo da app" fim={<Text type="supporting">next-mobile</Text>} />
          <LinhaDef titulo="Base" fim={<Text type="supporting">Astryx (Meta, MIT)</Text>} />
          <LinhaDef titulo="Inspiração" fim={<Text type="supporting">GNOME · KARGA</Text>} />
        </GrupoDef>
      </div>
    );
  }

  const nomeEstilo = OPCOES.estilo.find((o) => o.valor === aparencia.estilo)?.rotulo;
  const nomeModo = OPCOES.modo.find((o) => o.valor === aparencia.modo)?.rotulo;
  return (
    <div className="nm-def">
      <Topo titulo="Definições" voltarRotulo="Voltar" onVoltar={onVoltar} />
      {seccoesApp.map((s) => (
        <GrupoDef key={s.titulo} titulo={s.titulo}>
          {s.itens.map((i) => <LinhaDef key={i.titulo} {...i} />)}
        </GrupoDef>
      ))}
      <GrupoDef titulo="Sistema">
        <LinhaDef icone={<PaletaIcone />} titulo="Aparência" sub={`${nomeEstilo} · ${nomeModo}`} onClick={() => setVista('aparencia')} />
        <LinhaDef icone={<MaisIcone />} titulo="Dock" sub={`${OPCOES.dockTema.find((o) => o.valor === aparencia.dockTema)?.rotulo} · ${OPCOES.dockMaterial.find((o) => o.valor === aparencia.dockMaterial)?.rotulo}`} onClick={() => setVista('dock')} />
        <LinhaDef icone="info" titulo="Sobre o sistema" sub={`${sistema.nome} ${sistema.versao}`} onClick={() => setVista('sobre')} />
      </GrupoDef>
    </div>
  );
}
