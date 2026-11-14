# Astryx-NEXT

**Design system para apps desktop (web e Electron) e mobile**, construído sobre o
[Astryx](https://github.com/facebook/astryx) 0.7.16 da Meta (MIT). Uma só base visual para todas as apps, com duas
variantes da mesma família:

| Estilo | Para | Peças principais |
|---|---|---|
| **next-desktop** | web e Electron | `BarraApp` (menu da app, abas, pesquisa, sub-barra; vira barra de tarefas ao estilo Windows 7), `BarraEstado`, `JanelaDefinicoes` (janela flutuante) |
| **next-mobile** | telemóvel e tablet | `Dock` (ilha de avisos, painéis), `CantoUtilizador`, `CartaoInfo`/`GrelhaInfo`, `Definicoes` |

Comum às duas:
- **tema** com cores Adwaita (GNOME) e letra Mona Sans na escala KARGA, com claro, escuro, densidade, 8 cores de
  destaque, 10 fundos, padrões de fundo e tamanho da interface;
- **movimento** fluido (páginas que deslizam, pílula da dock que desliza, painéis suaves);
- **formulário inteligente** (`Formulario`/`Seccao`/`Campo`);
- **mobile mais suave**: no toque, os cantos arredondam, a letra passa a 16px e os controlos a 44px.

> **Beta pública.** A API pode ainda mudar antes da 1.0.0. Tudo o que muda fica em
> [`ALTERACOES.md`](../../ALTERACOES.md).

📖 **Referência completa:** [`REFERENCIA.md`](REFERENCIA.md) · 🤖 **Para assistentes de IA:** [`AGENTS.md`](AGENTS.md)

---

## Começar: criar uma app

Precisas do **Node 18+**. Não é preciso clonar nada:

```sh
npx --yes --package=https://github.com/nextivaldino/astryx/releases/download/astryx-next-v1.0.0-beta.2/astryx-next-1.0.0-beta.2.tgz criar-astryx-next
```

O assistente faz cinco perguntas:

1. **Nome** da app.
2. **Usar o visual Astryx-NEXT?** — *sim*, ou *nao* para uma app com o Astryx original.
3. **Tipo** — `mobile`, `desktop` ou `ambos` (cria `<nome>-mobile` e `<nome>-desktop`).
4. **Como incluir o visual** — `copiar` (recomendado) ou `instalar`.
5. **Iniciar git?** — cria o repositório com o primeiro commit.

Depois:

```sh
cd minha-app && npm install && npm run dev
```

A app criada traz três ficheiros de apoio:
- `README.md`, que diz se usa o visual, em que modo e como o atualizar;
- `AGENTS.md`, para que qualquer assistente de IA construa sempre com esta base;
- `CLAUDE.md`.

Também aceita tudo por argumentos, sem perguntas:

```sh
npx --yes --package=<url do .tgz> criar-astryx-next --nome loja --titulo "Loja" --visual sim --tipo mobile --modo copiar --git sim --destino ~/Projetos
```

Com o fork clonado, o mesmo assistente corre com `node packages/astryx-next/criar/criar-app.mjs`.

## Os dois modos

| | **copiar** (recomendado) | **instalar** |
|---|---|---|
| Onde fica | pasta `astryx-next/` dentro do projeto | `node_modules/astryx-next`, a partir do lançamento no GitHub |
| Se o fork ou o GitHub ficarem indisponíveis | **nada muda**: instala e funciona na mesma | a app instalada funciona; uma instalação limpa noutro computador falha |
| Atualizar | `npm run visual:atualizar` | `npm install <url do lançamento>` |
| Ideal para | apps a sério, que têm de durar | experiências rápidas |

O `vite.config.js` dos modelos trata dos dois: se existir a pasta `astryx-next/`, usa-a.

## Atualizar o visual numa app

```sh
npm run visual:atualizar                   # a versão mais recente publicada
npm run visual:atualizar -- 1.0.0-beta.2   # uma versão específica (também serve para voltar atrás)
```

No modo copiar, o comando:
1. descarrega o pacote para uma pasta temporária;
2. confirma que é mesmo o Astryx-NEXT;
3. guarda a versão atual em `astryx-next-anterior/` e só depois troca.

Sem ligação, ou com o fork em baixo, **nada é alterado**. Para desfazer: apaga `astryx-next/` e renomeia
`astryx-next-anterior/`.

## Usar numa app que já existe

1. Copia esta pasta para `astryx-next/` na raiz da app, sem `modelos/` e `criar/` (ou instala o `.tgz`).
2. Instala as dependências:
   `npm install @astryxdesign/core@0.7.16 @astryxdesign/theme-neutral@0.7.16 @fontsource-variable/mona-sans @stylexjs/stylex`
3. Copia o `vite.config.js` de [`modelos/app-mobile`](modelos/app-mobile/vite.config.js).
4. Segue o [arranque](REFERENCIA.md#arranque) da referência: o tema primeiro, `aplicarAparenciaGuardada()`,
   `<Theme>` + `<DockProvider>`.

## Definições: as mesmas escolhas no mobile e no desktop

- **Mobile:** `<Definicoes>`, uma página com Aparência, Dock e Sobre, com miniatura ao vivo.
- **Desktop/Electron:** `<JanelaDefinicoes>`, uma janela flutuante ao estilo do Opera:
  - arrasta-se pela barra de título e redimensiona-se pelo canto;
  - duplo clique maximiza; ⌘/Ctrl + , abre;
  - tem barra lateral com pesquisa e pré-visualização ao vivo;
  - lembra a posição.
- As duas usam a mesma `useAparencia()`: uma escolha nova no sistema aparece nas duas.

**Barra de tarefas (desktop):**
- Quando a janela fica estreita, a `BarraApp` passa a barra de tarefas ao estilo Windows 7: Iniciar, páginas em
  ícones, tabuleiro com pesquisa, avisos, definições e relógio.
- Em Definições → Barra da app escolhe-se se aparece só ao reduzir ou sempre, e se fica em baixo ou em cima.

No **Electron**, a barra de título nativa segue o modo da app com duas linhas no processo principal (ver
[`astryx-next/electron`](REFERENCIA.md#astryx-nextelectron)).

## Exportações

| Entrada | Conteúdo |
|---|---|
| `astryx-next/tema` | o tema (só CSS; importar primeiro) |
| `astryx-next/comum` | `useAparencia`, `aplicarAparenciaGuardada`, `MODO_TEMA`, `transicao`, `useOnline`, `OPCOES`… |
| `astryx-next/mobile` | `Dock`, `DockProvider`, `useDock`, `CantoUtilizador`, `CartaoInfo`, `GrelhaInfo`, `Definicoes`, `GrupoDef`, `LinhaDef`, `OpcaoDock`, ícones |
| `astryx-next/desktop` | `BarraApp`, `BarraEstado`, `Estado`, `JanelaDefinicoes`, `BarraTarefas` |
| `astryx-next/formulario` | `Formulario`, `Seccao`, `Campo` |
| `astryx-next/electron` | `ligarAstryxNext`, `PRELOAD` |

Detalhes de cada um em [`REFERENCIA.md`](REFERENCIA.md).

## Desempenho e acessibilidade

- **Leve:**
  - CSS e alguns componentes React, sem bibliotecas extra de animação ou UI;
  - o padrão do fundo é uma só camada fixa;
  - a janela de definições só existe enquanto está aberta.
- **Movimento:** respeita "menos movimento" do sistema e a opção **Reduzir efeitos**.
- **Toque:** áreas de 44px, campos de 16px (o iPhone não amplia) e realce de hover só com rato.
- **Contraste:** cores com contraste AA nos dois modos.

## Mudar o próprio sistema

As regras estão em [`AGENTS.md`](AGENTS.md#se-estás-a-alterar-o-próprio-sistema-no-fork). Em resumo:
- muda-se primeiro o tema (variáveis CSS);
- tudo no ramo `estilo-proprio`, com registo em `ALTERACOES.md`;
- `npm run testar` antes de publicar;
- as apps recebem a mudança com `npm run visual:atualizar`.

## Licença

MIT. Baseado no Astryx © Meta Platforms, Inc. — ver [`LICENSE`](LICENSE).

Inspirado em:
- GNOME HIG / libadwaita;
- KARGA mobile;
- [transitions.dev](https://transitions.dev) (princípios de movimento);
- [taste-skill](https://github.com/Leonxlnx/taste-skill) (regras de toque).
