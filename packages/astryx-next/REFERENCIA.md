# Astryx-NEXT — referência

Tudo o que o pacote exporta, com as propriedades. Os componentes do Astryx (`@astryxdesign/core`: `Button`,
`TextInput`, `DropdownMenu`, `Dialog`, `Table`, `Icon`…) continuam disponíveis e já vêm com o tema aplicado.

- [Arranque](#arranque)
- [`astryx-next/comum`](#astryx-nextcomum): aparência, transições, rede
- [`astryx-next/mobile`](#astryx-nextmobile): next-mobile
- [`astryx-next/desktop`](#astryx-nextdesktop): next-desktop
- [`astryx-next/formulario`](#astryx-nextformulario)
- [`astryx-next/electron`](#astryx-nextelectron)
- [Tokens e classes](#tokens-e-classes)
- [Atributos no `<html>`](#atributos-no-html)

---

## Arranque

```jsx
// main.jsx
import { createRoot } from 'react-dom/client';
import { InternationalizationProvider } from '@astryxdesign/core';
import ptPT from '@astryxdesign/core/locales/pt-PT.generated.js';
import 'astryx-next/tema';                                   // 1.º: o tema (ordem das camadas CSS)
import { aplicarAparenciaGuardada } from 'astryx-next/comum';
import App from './App.jsx';
import './app.css';                                           // layout das páginas da app

aplicarAparenciaGuardada();                                   // antes do 1.º render: sem piscar outro tema
createRoot(document.getElementById('root')).render(
  <InternationalizationProvider locale="pt-PT" messages={{ 'pt-PT': ptPT }}><App /></InternationalizationProvider>,
);
```

```jsx
// App.jsx (raiz)
const [aparencia, mudar, repor, efetiva] = useAparencia();
<Theme theme={neutralTheme} mode={MODO_TEMA[efetiva.modo]}>
  <DockProvider>…</DockProvider>
</Theme>
```

O `vite.config.js` dos modelos já trata da resolução do pacote (pasta `astryx-next/` ou `node_modules`).

---

## `astryx-next/comum`

| Exportação | O que é |
|---|---|
| `useAparencia()` | `[aparencia, mudar(parcial), repor(), efetiva]`. Guarda neste dispositivo e aplica no `<html>`. `efetiva` é o que está mesmo aplicado (tem em conta o tema rápido). |
| `aplicarAparenciaGuardada()` | Aplica a aparência guardada. Chamar antes do primeiro render. |
| `aplicarAparencia(a)` / `lerAparencia()` | Versões de baixo nível. |
| `OPCOES` | Valores possíveis de cada escolha (ver tabela abaixo). |
| `PADRAO` | A aparência predefinida. |
| `RAPIDO` | Os três temas rápidos: `claro` · `escuro` · `personalizado`. |
| `MODO_TEMA` | `{ sistema: 'system', claro: 'light', escuro: 'dark' }`, para o `mode` do `<Theme>`. |
| `NOME_TEMA` | Nome legível de cada modo. |
| `transicao(mudar, sentido?)` | Muda de página com animação (View Transitions). `sentido`: `'frente'` · `'tras'` · `'troca'`. Sem suporte, ou com menos movimento, muda logo. |
| `sentidoEntre(lista, de, para)` | `'frente'`/`'tras'`/`'troca'` conforme as posições numa lista. |
| `useOnline()` | `true`/`false` conforme a ligação; atualiza sozinho. |
| `useTema()` | **Antigo**, só claro/escuro. Usar `useAparencia`. |

**Escolhas da aparência** (`mudar({ campo: valor })`):

| Campo | Valores |
|---|---|
| `estilo` | `adwaita` (GNOME, sóbrio) · `coral` (KARGA, quente). Muda também o fundo e o destaque sugeridos. |
| `modo` | `sistema` · `claro` · `escuro` |
| `fundo` | `padrao` · `marfim` · `linho` · `salvia` · `nevoa` · `ceu` · `coral` · `lavanda` · `grafite` · `aurora` |
| `destaque` | `azul` · `coral` · `ceu` · `salvia` · `lavanda` · `ambar` · `mar` · `rosa` |
| `textura` | `nenhuma` · `grelha` · `planta` · `pontos` · `linhas` · `diagonal` |
| `texturaIntensidade` | `suave` · `media` · `marcada` |
| `texturaOnde` | `inicio` (só na 1.ª página) · `todas` |
| `texturaAvisos` | `true`/`false`: o fundo ganha a cor do aviso ativo |
| `escala` | `'90'` · `'100'` · `'110'` · `'125'` (tamanho da interface; desktop) |
| `densidade` | `compacta` · `normal` · `confortavel` |
| `formaBotoes` | `arredondado` · `pilula` |
| `reduzirEfeitos` | `true`/`false`: sem vidro nem animações |
| `ladoCriar`, `nomesDock`, `dockTema`, `dockMaterial`, `dockEncolher`, `dockEsconder` | Comportamento da dock (mobile) |
| `rapido` | `claro` · `escuro` · `personalizado` (o tema rápido do avatar) |

---

## `astryx-next/mobile`

### `DockProvider` e `useDock()`

O `DockProvider` envolve a app (também no desktop: guarda os avisos). O `useDock()` devolve:

| Campo | O que faz |
|---|---|
| `aviso({ tipo, titulo, sub?, id? })` | Mostra um aviso. `tipo`: `sucesso`, `info` (pílula de 4s); `atencao`, `erro`, `mensagem` (ilha da dock, até serem vistos). Com `id`, não repete. |
| `retirarAviso(id)` | Tira um aviso da ilha (ex.: a ligação voltou). |
| `abrir(nome)` / `fechar()` | Abre ou fecha um painel da dock. |
| `painel`, `avisos`, `historico`, `rapido`, `escondida` | Estado atual. |
| `marcarLidos()`, `consumirAvisos()`, `dispensarRapido()`, `esconder(bool)` | Controlo fino. |

### `Dock`

A barra de navegação no fundo do ecrã; o painel cresce para cima a partir dela.

| Propriedade | Tipo | |
|---|---|---|
| `paginas` | `[{ valor, rotulo, icone }]` | Separadores. `icone`: nome de ícone do Astryx (`'calendar'`) ou elemento. A 1.ª é o "início". |
| `ativa` / `onIr(valor)` | | Página atual e navegação (animada sozinha). |
| `paineis` | `{ nome: { rotulo, conteudo, cheio? } }` | Painéis. `avisos` e `criar` têm botão próprio (🔔 e ＋). `cheio`: painel alto (formulários). |
| `separadorPainel` | `{ valorDaPagina: nomeDoPainel }` | Separadores que abrem um painel em vez de uma página (ex.: `{ Mais: 'mais' }`). |

`OpcaoDock({ icone, titulo, contexto, ...button })` é uma linha de opção para os painéis. Envolve várias em
`<div className="nm-grelha">`.

### `CantoUtilizador`

O avatar no canto, com cartão de conta, tema rápido e alertas.

| Propriedade | |
|---|---|
| `nome` | Nome do utilizador (iniciais no avatar). |
| `online` | Estado da ligação. |
| `aparencia`, `mudar` | De `useAparencia()`, para o tema rápido. |
| `itens` | `[{ icone, titulo, contexto?, onClick, perigo? }]` — opções da app (Definições, Sair…). |
| `lado` | `'direita'` (predefinido) ou `'esquerda'`. |

### `CartaoInfo` e `GrelhaInfo`

Cartões informativos em tom pastel, numa grelha que se ajusta sozinha.

| Propriedade | |
|---|---|
| `tom` | `coral` · `ceu` · `salvia` · `lavanda` · `ambar` · `mar` · `rosa` · `neutro` |
| `icone`, `titulo`, `valor`, `descricao` | Conteúdo. `valor` troca com uma animação suave quando muda. |
| `acao` | Botão opcional (ex.: `<Button variant="secondary" size="sm" … />`). |
| `largo` | Ocupa 2 colunas. |

### `Definicoes`, `GrupoDef`, `LinhaDef`

A página de definições do sistema (mobile): Aparência, Dock, Sobre, mais as secções da app.

| `Definicoes` | |
|---|---|
| `onVoltar` | Voltar à app. |
| `aparencia`, `mudar`, `repor` | De `useAparencia()`. |
| `seccoesApp` | `[{ titulo, itens: [{ icone, titulo, sub?, onClick?, perigo? }] }]` |

- `GrupoDef({ titulo?, nota?, children })` é uma lista em caixa, ao estilo GNOME.
- `LinhaDef({ icone?, titulo, sub?, fim?, onClick?, perigo? })` é uma linha da lista. `fim` é o que fica à direita
  (interruptor, valor). Com `onClick`, vira botão com seta.
- Peças partilhadas com o desktop: `EscolhaEstilo`, `PadraoFundo`, `Amostras` e `segmento(aparencia, mudar, campo, rotulo)`.

### Ícones

`SinoIcone`, `MaisIcone`, `PaletaIcone`, `CasaIcone`. Para outros ícones, usa `<Icon icon="…" />` do Astryx. Exemplos
usados no sistema: `calendar`, `viewColumns`, `checkDouble`, `clock`, `info`, `wrench`, `close`, `search`, `menu`,
`funnel`, `moreHorizontal`, `eyeSlash`, `arrowDown`, `chevronRight`, `success`, `error`, `warning`, `upload`.

---

## `astryx-next/desktop`

### `BarraApp`

A barra superior da app, ao estilo das header bars do GNOME, com sub-barra expansível. É adaptativa:
- em ecrãs estreitos esconde o nome da app;
- num telemóvel, as abas descem para uma barra no fundo.

| Propriedade | |
|---|---|
| `app` | `{ nome, versao, icone }` — `icone`: nome de ícone do Astryx. |
| `menuApp` | Itens do menu da app (`DropdownMenuItem`, `DropdownMenuRadioGroup`, `DropdownMenuDivider`…). |
| `titulo` | Título da página atual. |
| `abas` / `abaAtiva` / `onAbaChange` | `[{ valor, rotulo, icone }]`. A troca é animada; a 1.ª aba é o "início". |
| `pesquisa` | `{ valor, onChange, placeholder }` (opcional). |
| `fim` | Botões extra à direita. |
| `subBarra` | Conteúdo da sub-barra (ações da página). Sem ele, não há botão para a abrir. |

### `BarraEstado` e `Estado`

- `BarraEstado({ inicio, fim })` é a barra de estado no fundo da janela.
- `Estado({ icone?, inicio?, aviso?, children })` é um item dessa barra. `aviso` pinta-o de alerta.

### `JanelaDefinicoes`

As definições numa janela flutuante, ao estilo do Opera:
- arrasta-se pela barra de título, redimensiona-se pelo canto e maximiza com duplo clique;
- abre e fecha com ⌘/Ctrl + , e fecha com Esc;
- tem barra lateral com pesquisa;
- não bloqueia a app;
- lembra a posição e o tamanho;
- num ecrã estreito ocupa o ecrã todo.

| Propriedade | |
|---|---|
| `aberta` / `onAbrir` / `onFechar` | Estado. `onAbrir` liga o atalho ⌘/Ctrl + ,. |
| `aparencia`, `mudar`, `repor` | De `useAparencia()`. |
| `app` | `{ nome, versao }` para "Sobre". |
| `seccoesApp` | `[{ id, titulo, icone, conteudo }]` — secções da app na barra lateral. |
| `seccao` | Secção inicial: `aparencia` (predefinida) · `fundo` · `interface` · `sobre` · o `id` de uma da app. |

---

## `astryx-next/formulario`

```jsx
<Formulario id="novo-cliente" onSubmeter={(v) => guardar(v)} onAviso={dock.aviso} rotuloGuardar="Guardar cliente">
  <Seccao titulo="Cliente">
    <Campo nome="nome" rotulo="Nome" tipo="nome" obrigatorio largo />
    <Campo nome="email" rotulo="Email" tipo="email" />
  </Seccao>
</Formulario>
```

O `Formulario` mostra o progresso por segmentos e guarda um rascunho (pelo `id`). Ao guardar com campos em falta, o
campo em falta abana e recebe o foco. O botão diz quantos faltam.

| `Formulario` | |
|---|---|
| `id` | Identifica o rascunho (sem `id`, não há rascunho). |
| `inicial` | Valores iniciais. |
| `onSubmeter(valores)` | Só é chamado com os obrigatórios preenchidos. |
| `onAviso` | Para avisos (ex.: "Rascunho recuperado"); normalmente `dock.aviso`. |
| `rotuloGuardar` | Texto do botão. |

- `Seccao({ titulo })` é um grupo de campos com contagem própria.
- `Campo({ nome, rotulo, tipo?, obrigatorio?, largo?, ajuda? })`. O `tipo` é um de: `texto` · `texto-longo` · `email` ·
  `telefone` · `numero` · `data` · `hora` · `nome`. O tipo define o teclado do telemóvel, o preenchimento automático e
  a validação.

---

## `astryx-next/electron`

```js
import { BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { ligarAstryxNext, PRELOAD } from 'astryx-next/electron'; // modo copiar: './astryx-next/electron/principal.js'
const win = new BrowserWindow({ webPreferences: { preload: PRELOAD } });
ligarAstryxNext(win, { ipcMain, nativeTheme });
```

A barra de título nativa, os menus do sistema e o fundo da janela seguem o modo escolhido nas definições da app.
O preload expõe só `window.astryxNext.definirModo(modo)`.

---

## Tokens e classes

Usa sempre tokens; nunca valores escritos à mão.

| Família | Exemplos |
|---|---|
| Cores (Astryx) | `--color-background-body/card/surface/popover`, `--color-text-primary/secondary/accent/error/success/warning`, `--color-accent`, `--color-accent-muted`, `--color-border`, `--color-border-emphasized`, `--color-overlay-hover` |
| Forma | `--radius-element` (botões, campos), `--radius-container` (caixas), `--radius-inner` |
| Espaço e tamanho | `--spacing-1…6`, `--size-element-sm/md/lg` (seguem a densidade e o mobile) |
| Letra | `--font-size-2xs/xs/sm/base/lg/xl/2xl…` (escala KARGA, maior no mobile) |
| Sombra | `--shadow-low/med/high` |
| Movimento | `--mov-abrir` (250ms), `--mov-fechar` (150ms), `--mov-painel-abrir/fechar`, `--mov-enfase`, `--mov-suave` (curva), `--mov-mola`, `--mov-distancia`, `--mov-desfoque`, `--mov-escala` |
| Animações prontas | `mov-entra` (sobe com desfoque), `mov-troca` (troca no sítio), `mov-tremer` (erro) — `animation: mov-entra var(--mov-abrir) var(--mov-suave)` |

| Classe | |
|---|---|
| `.nm-colunas` | Blocos da página em colunas que se ajustam sozinhas: 1 no telemóvel, 2 no tablet, 3+ no ecrã largo. `--nm-coluna` (largura mínima). |
| `.nm-bloco-largo` | Um bloco que ocupa todas as colunas. |
| `.nm-grelha` | Lista de `OpcaoDock` num painel. |

**Mobile:** em ecrãs de toque e até 640px, o tema (`tema/mobile.css`) arredonda os cantos, aumenta a letra para 16px e
os controlos para 44px, tira os contornos e preenche os campos. Não é preciso fazer nada na app.

---

## Atributos no `<html>`

O sistema escreve-os; a app pode lê-los no CSS, mas não os deve escrever, exceto `data-no-inicio`.

| Atributo | |
|---|---|
| `data-estilo`, `data-fundo`, `data-destaque`, `data-densidade`, `data-escala`, `data-forma-botoes`, `data-textura…`, `data-reduzir-efeitos` | A aparência escolhida. |
| `data-theme` | `light`/`dark` quando o modo não é o do sistema. |
| `data-no-inicio` | Posto pela `Dock`/`BarraApp` na 1.ª página. Numa app sem elas, marca-o à mão. |
| `data-fundo-aviso` | Tipo do aviso ativo (pinta o fundo). |
| `data-transicao` | Sentido da transição de página em curso. |
