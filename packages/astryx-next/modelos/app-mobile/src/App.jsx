// {{TITULO}} — app móvel (telemóvel e tablet) com o visual Astryx-NEXT (next-mobile).
// Gerada pelo assistente criar-app. Ponto de partida: troca os textos, as páginas
// e os dados de exemplo pelos da tua app. Ver README.md.
import { useEffect, useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { Banner, Button, Card, Heading, Icon, Text, TextInput, VStack } from '@astryxdesign/core';
import { MODO_TEMA, useAparencia, useOnline } from 'astryx-next/comum';
import {
  CantoUtilizador, CartaoInfo, CasaIcone, Definicoes, Dock, DockProvider, GrelhaInfo, GrupoDef, LinhaDef, OpcaoDock, useDock,
} from 'astryx-next/mobile';
import { Campo, Formulario, Seccao } from 'astryx-next/formulario';
import { iniciarSessao, lerSessao, terminarSessao } from './sessao.js';

const APP = { nome: '{{TITULO}}', versao: '0.1.0' };

const PAGINAS = [
  { valor: 'Início', rotulo: 'Início', icone: <CasaIcone /> },
  { valor: 'Registos', rotulo: 'Registos', icone: 'viewColumns' },
  { valor: 'Mais', rotulo: 'Mais', icone: 'moreHorizontal' },
];

export default function App() {
  const aparencia = useAparencia(); // [aparencia, mudar, repor, efetiva] — do sistema, não da app
  return (
    <Theme theme={neutralTheme} mode={MODO_TEMA[aparencia[3].modo]}>
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
      <div className="app-entrar-marca">
        <span className="app-logo"><CasaIcone /></span>
        <Heading level={1}>{APP.nome}</Heading>
        <Text type="supporting">Entra para continuar.</Text>
      </div>
      <Card padding={5}>
        <form onSubmit={submeter}>
          <VStack gap={4}>
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

const hojeLongo = () => new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
const icone = (i) => (typeof i === 'string' ? <Icon icon={i} /> : i);

function Principal({ sessao, aparencia: [aparencia, mudar, repor], onSair }) {
  const dock = useDock();
  const online = useOnline();
  const [pagina, setPagina] = useState('Início');

  // Ligação: "Sem ligação" fica na ilha da dock; quando volta, some e aparece um alerta rápido.
  const [primeira, setPrimeira] = useState(true);
  useEffect(() => {
    if (primeira) { setPrimeira(false); if (online) return; }
    if (online) { dock.retirarAviso('rede-off'); dock.aviso({ tipo: 'sucesso', titulo: 'Ligação restabelecida' }); }
    else dock.aviso({ id: 'rede-off', tipo: 'erro', titulo: 'Sem ligação', sub: 'As alterações ficam à espera' });
  }, [online]); // eslint-disable-line react-hooks/exhaustive-deps

  const paineis = {
    avisos: {
      rotulo: 'Avisos',
      conteudo: dock.historico.length === 0 ? (
        <p className="app-vazio">Sem avisos por agora.</p>
      ) : (
        <div className="nm-grelha">
          {dock.historico.map((a) => (
            <OpcaoDock
              key={a.id}
              data-tipo={a.tipo}
              icone={{ sucesso: 'success', erro: 'error', atencao: 'warning' }[a.tipo] ?? 'info'}
              titulo={a.titulo}
              contexto={[a.sub, new Intl.DateTimeFormat('pt-PT', { timeStyle: 'short' }).format(a.criadoEm)].filter(Boolean).join(' · ')}
            />
          ))}
        </div>
      ),
    },
    criar: {
      rotulo: 'Criar',
      conteudo: (
        <div className="nm-grelha">
          <OpcaoDock icone="calendar" titulo="Novo registo" contexto="Formulário com progresso e rascunho" onClick={() => dock.abrir('novo')} />
          <OpcaoDock icone="search" titulo="Procurar" contexto="Em todos os registos" onClick={() => { dock.fechar(); dock.aviso({ tipo: 'info', titulo: 'Procurar', sub: 'Por ligar à tua app' }); }} />
        </div>
      ),
    },
    novo: {
      rotulo: 'Novo registo',
      cheio: true,
      conteudo: (
        <Formulario
          id="novo-registo"
          onAviso={dock.aviso}
          rotuloGuardar="Guardar registo"
          onSubmeter={(v) => { dock.fechar(); dock.aviso({ tipo: 'sucesso', titulo: 'Registo guardado', sub: v.titulo }); }}
        >
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
      ),
    },
    mais: {
      rotulo: APP.nome,
      conteudo: (
        <div className="nm-grelha">
          <OpcaoDock icone="wrench" titulo="Definições" contexto="Aparência, dock e conta" onClick={() => { dock.fechar(); setPagina('Definições'); }} />
          <OpcaoDock icone="info" titulo={`Sobre ${APP.nome}`} contexto={`Versão ${APP.versao} · Astryx-NEXT`} />
          <OpcaoDock icone="close" titulo="Terminar sessão" contexto={sessao.nome} className="nm-opcao app-perigo" onClick={onSair} />
        </div>
      ),
    },
  };

  if (pagina === 'Definições') {
    return (
      <Definicoes
        onVoltar={() => setPagina('Início')}
        aparencia={aparencia}
        mudar={mudar}
        repor={repor}
        seccoesApp={[
          { titulo: APP.nome, itens: [{ icone: 'info', titulo: 'Notificações', sub: 'Por ligar à tua app', onClick: () => dock.aviso({ tipo: 'info', titulo: 'Notificações', sub: 'Por ligar à tua app' }) }] },
          { titulo: 'Conta', itens: [{ icone: 'info', titulo: sessao.nome, sub: 'Sessão neste dispositivo' }, { icone: 'close', titulo: 'Terminar sessão', perigo: true, onClick: onSair }] },
        ]}
      />
    );
  }

  const atual = PAGINAS.find((p) => p.valor === pagina) ?? PAGINAS[0];
  return (
    <>
      <header className="app-topo">
        <div className="app-titulo">
          <span className="app-titulo-icone" aria-hidden="true">{icone(atual.icone)}</span>
          <Heading level={1}>{pagina}</Heading>
        </div>
        <CantoUtilizador
          nome={sessao.nome}
          online={online}
          aparencia={aparencia}
          mudar={mudar}
          itens={[
            { icone: 'wrench', titulo: 'Definições', onClick: () => setPagina('Definições') },
            { icone: 'info', titulo: `Sobre ${APP.nome}`, contexto: APP.versao },
            { icone: 'close', titulo: 'Terminar sessão', perigo: true, onClick: onSair },
          ]}
        />
        <Text type="supporting" className="app-data">{hojeLongo()}</Text>
      </header>

      <main className="app-pagina">
        {pagina === 'Início' ? <PaginaInicio nome={sessao.nome} onIr={setPagina} /> : <PaginaRegistos />}
      </main>

      <Dock paginas={PAGINAS} ativa={pagina} onIr={setPagina} paineis={paineis} separadorPainel={{ Mais: 'mais' }} />
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
          descricao="Este é o modelo next-mobile. Toca em ＋ para experimentar o formulário, ou vai a Registos."
          acao={<Button variant="secondary" size="sm" label="Ver registos" onClick={() => onIr('Registos')} />}
        />
      </GrelhaInfo>
    </div>
  );
}

function PaginaRegistos() {
  return (
    <div className="nm-colunas">
      <GrupoDef titulo="Registos recentes" nota="Lista de exemplo (listas em caixa, estilo GNOME).">
        <LinhaDef icone="calendar" titulo="Primeiro registo" sub="Hoje, 09:00" onClick={() => {}} />
        <LinhaDef icone="calendar" titulo="Segundo registo" sub="Ontem, 17:30" onClick={() => {}} />
        <LinhaDef icone="calendar" titulo="Terceiro registo" sub="Segunda-feira" onClick={() => {}} />
      </GrupoDef>
      <GrupoDef titulo="Resumo">
        <LinhaDef icone="checkDouble" titulo="Concluídos" fim={<Text type="supporting">0</Text>} />
        <LinhaDef icone="clock" titulo="Pendentes" fim={<Text type="supporting">0</Text>} />
      </GrupoDef>
    </div>
  );
}
