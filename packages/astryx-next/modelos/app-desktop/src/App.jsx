// {{TITULO}} — app desktop/web (e Electron) com o visual Astryx-NEXT (next-desktop).
// Gerada pelo assistente criar-app. Ponto de partida: troca os textos, as páginas
// e os dados de exemplo pelos da tua app. Ver README.md.
import { useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import {
  AlertDialog, Banner, Button, Card, DropdownMenu, DropdownMenuDivider, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, Heading, Icon, StatusDot, Text, TextInput, VStack,
} from '@astryxdesign/core';
import { MODO_TEMA, useAparencia, useOnline } from 'astryx-next/comum';
import { BarraApp, BarraEstado, Estado } from 'astryx-next/desktop';
import { CartaoInfo, Definicoes, DockProvider, GrelhaInfo, GrupoDef, LinhaDef } from 'astryx-next/mobile';
import { Campo, Formulario, Seccao } from 'astryx-next/formulario';
import { iniciarSessao, lerSessao, terminarSessao } from './sessao.js';

const APP = { nome: '{{TITULO}}', versao: '0.1.0', icone: 'calendar' };

const PAGINAS = [
  { valor: 'Início', rotulo: 'Início', icone: 'calendar' },
  { valor: 'Registos', rotulo: 'Registos', icone: 'viewColumns' },
  { valor: 'Novo registo', rotulo: 'Novo registo', icone: 'checkDouble' },
];
const NOME_RAPIDO = { claro: 'Tema claro', escuro: 'Tema escuro', personalizado: 'Tema personalizado' };

export default function App() {
  const aparencia = useAparencia(); // [aparencia, mudar, repor, efetiva] — do sistema, não da app
  return (
    <Theme theme={neutralTheme} mode={MODO_TEMA[aparencia[3].modo]}>
      {/* DockProvider: estado dos avisos (também usado pelo formulário e pelas Definições) */}
      <DockProvider>
        <Conteudo aparencia={aparencia} />
      </DockProvider>
    </Theme>
  );
}

function Conteudo({ aparencia }) {
  const [sessao, setSessao] = useState(lerSessao);
  if (!sessao) return <Entrar onEntrar={(nome) => setSessao(iniciarSessao(nome))} />;
  return <Principal sessao={sessao} aparencia={aparencia} onSair={() => { terminarSessao(); setSessao(null); }} />;
}

function Entrar({ onEntrar }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  function submeter(e) {
    e.preventDefault();
    if (!nome.trim()) return setErro('Escreve o teu nome de utilizador');
    onEntrar(nome); // ⚠️ exemplo: aceita qualquer senha. Ligar à autenticação real.
  }
  return (
    <main className="app-entrar">
      <Card padding={6}>
        <form onSubmit={submeter}>
          <VStack gap={4}>
            <Heading level={1}>{APP.nome}</Heading>
            <TextInput label="Utilizador" value={nome} onChange={setNome} autoComplete="username" isRequired />
            <TextInput label="Senha" type="password" value={senha} onChange={setSenha} autoComplete="current-password" />
            {erro && <Banner status="error" title={erro} />}
            <Button type="submit" variant="primary" label="Entrar" width="100%" />
          </VStack>
        </form>
      </Card>
    </main>
  );
}

function Principal({ sessao, aparencia: [aparencia, mudar, repor], onSair }) {
  const online = useOnline();
  const [pagina, setPagina] = useState('Início');
  const [pesquisa, setPesquisa] = useState('');
  const [sobre, setSobre] = useState(false);

  const menuApp = (
    <>
      <DropdownMenuItem label={`Sobre ${APP.nome}`} onClick={() => setSobre(true)} />
      <DropdownMenuItem label="Definições…" onClick={() => setPagina('Definições')} />
      <DropdownMenuDivider />
      <DropdownMenuGroup title="Tema">
        <DropdownMenuRadioGroup label="Tema" value={aparencia.rapido} onChange={(v) => mudar({ rapido: v })}>
          <DropdownMenuRadioItem value="claro" label="Claro" />
          <DropdownMenuRadioItem value="escuro" label="Escuro" />
          <DropdownMenuRadioItem value="personalizado" label="Personalizado" />
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>
      <DropdownMenuDivider />
      <DropdownMenuItem label={`Terminar sessão (${sessao.nome})`} variant="destructive" onClick={onSair} />
    </>
  );

  const subBarra = (
    <div>
      <Text type="supporting">{pagina}</Text>
      <span style={{ flex: 1 }} />
      <Button variant="primary" size="sm" label="Novo registo" onClick={() => setPagina('Novo registo')} />
      <Button variant="secondary" size="sm" label="Filtrar" icon={<Icon icon="funnel" size="sm" />} />
    </div>
  );

  return (
    <>
      <BarraApp
        app={APP}
        menuApp={menuApp}
        titulo={pagina}
        abas={PAGINAS}
        abaAtiva={pagina}
        onAbaChange={setPagina}
        pesquisa={{ valor: pesquisa, onChange: setPesquisa, placeholder: 'Pesquisar…' }}
        fim={
          <DropdownMenu placement="below" alignment="end" button={{ label: 'Menu principal', variant: 'ghost', isIconOnly: true, icon: <Icon icon="menu" /> }}>
            <DropdownMenuItem label="Preferências" onClick={() => setPagina('Definições')} />
            <DropdownMenuItem label="Ajuda" />
          </DropdownMenu>
        }
        subBarra={pagina === 'Definições' ? undefined : subBarra}
      />

      <main className="app-pagina">
        {pagina === 'Início' && <PaginaInicio nome={sessao.nome} onIr={setPagina} />}
        {pagina === 'Registos' && <PaginaRegistos />}
        {pagina === 'Novo registo' && <PaginaFormulario onGuardado={() => setPagina('Registos')} />}
        {pagina === 'Definições' && (
          <Definicoes
            onVoltar={() => setPagina('Início')}
            aparencia={aparencia}
            mudar={mudar}
            repor={repor}
            seccoesApp={[{ titulo: 'Conta', itens: [{ icone: 'info', titulo: sessao.nome, sub: 'Sessão neste dispositivo' }, { icone: 'close', titulo: 'Terminar sessão', perigo: true, onClick: onSair }] }]}
          />
        )}
      </main>

      <BarraEstado
        inicio={
          <>
            <Estado aviso={!online} aria-live="polite" inicio={<StatusDot variant={online ? 'success' : 'error'} label={online ? 'Online' : 'Sem ligação'} />}>
              {online ? 'Online' : 'Sem ligação'}
            </Estado>
            <Estado icone="calendar">{new Intl.DateTimeFormat('pt-PT', { dateStyle: 'full' }).format(new Date())}</Estado>
          </>
        }
        fim={
          <>
            <Estado>{sessao.nome}</Estado>
            <Estado>{NOME_RAPIDO[aparencia.rapido]}</Estado>
            <Estado icone="info">{APP.nome} {APP.versao}</Estado>
          </>
        }
      />

      <AlertDialog
        isOpen={sobre}
        onOpenChange={setSobre}
        title={`${APP.nome} ${APP.versao}`}
        description="Feita com o Astryx-NEXT (next-desktop), o design system próprio baseado no Astryx."
        actionLabel="Fechar"
        onAction={() => setSobre(false)}
      />
    </>
  );
}

// ── Páginas de exemplo: substituir pelas da tua app ──────────────────────

function PaginaInicio({ nome, onIr }) {
  const h = new Date().getHours();
  return (
    <div className="app-inicio">
      <h2 className="app-saudacao">{h < 12 ? 'Bom dia' : h < 20 ? 'Boa tarde' : 'Boa noite'}, {nome}</h2>
      <GrelhaInfo>
        <CartaoInfo tom="coral" icone="calendar" titulo="Hoje" valor="0" descricao="registos novos" />
        <CartaoInfo tom="salvia" icone="checkDouble" titulo="Concluídos" valor="0" descricao="esta semana" />
        <CartaoInfo tom="ceu" icone="viewColumns" titulo="Total" valor="0" descricao="registos" />
        <CartaoInfo tom="ambar" icone="clock" titulo="Pendentes" valor="0" descricao="à espera" />
        <CartaoInfo
          tom="lavanda"
          icone="info"
          titulo="Começar"
          largo
          descricao="Este é o modelo next-desktop. Experimenta o formulário em Novo registo, ou muda o tema no menu da app."
          acao={<Button variant="secondary" size="sm" label="Novo registo" onClick={() => onIr('Novo registo')} />}
        />
      </GrelhaInfo>
    </div>
  );
}

function PaginaRegistos() {
  return (
    <div className="app-largura">
      <GrupoDef titulo="Registos recentes" nota="Lista de exemplo (listas em caixa, estilo GNOME).">
        <LinhaDef icone="calendar" titulo="Primeiro registo" sub="Hoje, 09:00" onClick={() => {}} />
        <LinhaDef icone="calendar" titulo="Segundo registo" sub="Ontem, 17:30" onClick={() => {}} />
        <LinhaDef icone="calendar" titulo="Terceiro registo" sub="Segunda-feira" onClick={() => {}} />
      </GrupoDef>
    </div>
  );
}

function PaginaFormulario({ onGuardado }) {
  return (
    <div className="app-largura">
      <Formulario id="novo-registo" rotuloGuardar="Guardar registo" onSubmeter={onGuardado}>
        <Seccao titulo="Registo">
          <Campo nome="titulo" rotulo="Título" obrigatorio largo />
          <Campo nome="notas" rotulo="Notas" tipo="texto-longo" largo />
        </Seccao>
        <Seccao titulo="Quando">
          <Campo nome="data" rotulo="Data" tipo="data" obrigatorio />
          <Campo nome="hora" rotulo="Hora" tipo="hora" />
        </Seccao>
        <Seccao titulo="Contacto">
          <Campo nome="nome" rotulo="Nome" tipo="nome" />
          <Campo nome="telefone" rotulo="Telefone" tipo="telefone" />
          <Campo nome="email" rotulo="Email" tipo="email" largo />
        </Seccao>
      </Formulario>
    </div>
  );
}
