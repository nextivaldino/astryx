# Astryx-NEXT

O meu design system, construído sobre o [Astryx](https://github.com/facebook/astryx) 0.7.16 (Meta, MIT).
É **a base visual de todas as minhas apps futuras**. Tem dois estilos sobre um tema comum:

| Estilo | Para | Peças principais |
|---|---|---|
| **next-desktop** | web e Electron | `BarraApp` (menu da app, abas, pesquisa, sub-barra), `BarraEstado` |
| **next-mobile** | telemóvel e tablet | `Dock` (com ilha de avisos e bolha), `CantoUtilizador`, `CartaoInfo`/`GrelhaInfo`, `Definicoes` |

Tudo partilha o **tema comum** (cores Adwaita/GNOME, tipografia KARGA com Mona Sans, raios, menus que desenrolam
do botão, volume dos botões) e as **Definições → Aparência** (claro, escuro, alto contraste, densidade, cor de
destaque, estilo Coral, fundos, botões em pílula, reduzir efeitos). O **formulário inteligente**
(`Formulario`/`Seccao`/`Campo`) funciona nos dois estilos.

O registo de todas as mudanças está em [`ALTERACOES.md`](../../ALTERACOES.md), na raiz do fork.

---

## Criar uma app nova

No fork (branch `estilo-proprio`):

```sh
node packages/astryx-next/criar/criar-app.mjs
```

O assistente pergunta:

1. **Nome** da app.
2. **Usar o visual Astryx-NEXT?** — *sim* ou *nao*. Com *nao*, a app usa o Astryx original (tema neutral).
3. **Tipo** — `mobile` (next-mobile), `desktop` (next-desktop) ou `ambos` (cria `<nome>-mobile` e `<nome>-desktop`).
4. **Como incluir o visual** — `copiar` (recomendado) ou `instalar` (ver abaixo).
5. **Iniciar git?** — cria o repositório com o primeiro commit.

Também aceita tudo por argumentos, sem perguntas:

```sh
node packages/astryx-next/criar/criar-app.mjs --nome loja --titulo "Loja" --visual sim --tipo mobile --modo copiar --destino ~/Development.
```

Cada app criada traz o seu `README.md` a dizer se usa o visual, em que modo, e como o atualizar.

## Os dois modos

| | **copiar** (recomendado) | **instalar** |
|---|---|---|
| Onde fica | pasta `astryx-next/` dentro do projeto | `node_modules/astryx-next`, a partir do lançamento no GitHub |
| Se o fork ou o GitHub ficarem indisponíveis | **nada muda**: instala e funciona na mesma | a app instalada continua a funcionar; uma instalação limpa (`npm ci` noutro computador) falha |
| Atualizar | `npm run visual:atualizar` (troca segura, com cópia da versão anterior) | `npm install <url do lançamento>` |
| Ideal para | apps a sério, que têm de durar | experiências rápidas |

O `vite.config.js` das apps trata dos dois: se existir a pasta `astryx-next/`, usa-a; senão, usa o pacote instalado.

## Atualizar o visual numa app

```sh
npm run visual:atualizar                              # a versão mais recente publicada
npm run visual:atualizar -- 0.1.0-beta.2   # uma versão específica (também serve para voltar atrás)
```

No modo copiar, o comando:

1. descarrega o pacote dessa versão (o `.tgz` do lançamento no GitHub) para uma pasta temporária;
2. confirma que é mesmo o Astryx-NEXT;
3. guarda a versão atual em `astryx-next-anterior/` e só então troca.

Se faltar a ligação, o fork estiver em baixo ou algo falhar a meio, **nada é alterado**. Para desfazer à mão:
apaga `astryx-next/` e renomeia `astryx-next-anterior/` para `astryx-next/`.

## Usar numa app que já existe

1. Copia esta pasta (sem `modelos/` e `criar/`) para `astryx-next/` na raiz da app — ou instala o pacote.
2. Instala as dependências que o Astryx-NEXT usa:
   `npm install @astryxdesign/core@0.7.16 @astryxdesign/theme-neutral@0.7.16 @fontsource-variable/mona-sans @stylexjs/stylex`
3. Copia o `vite.config.js` de [`modelos/app-mobile`](modelos/app-mobile/vite.config.js).
4. No arranque (`main.jsx`), **antes** de qualquer outro CSS:

   ```js
   import 'astryx-next/tema';
   import { aplicarAparenciaGuardada } from 'astryx-next/comum';
   aplicarAparenciaGuardada();
   ```

5. Usa `useAparencia()` e `MODO_TEMA` no `<Theme>` (ver `modelos/app-mobile/src/App.jsx`).

## O que o pacote exporta

| Entrada | Conteúdo |
|---|---|
| `astryx-next/tema` | o tema comum (só CSS; importar primeiro) |
| `astryx-next/comum` | `useAparencia`, `aplicarAparenciaGuardada`, `MODO_TEMA`, `useOnline`, `OPCOES`, `PADRAO` |
| `astryx-next/desktop` | `BarraApp`, `BarraEstado`, `Estado` |
| `astryx-next/mobile` | `Dock`, `DockProvider`, `useDock`, `OpcaoDock`, `CantoUtilizador`, `Definicoes`, `GrupoDef`, `LinhaDef`, `CartaoInfo`, `GrelhaInfo`, ícones |
| `astryx-next/formulario` | `Formulario`, `Seccao`, `Campo` |

## Regras para mudar o sistema

- Ordem de preferência: **tema (variáveis CSS) → swizzle → código-fonte**.
- Cada ajuste segue os tokens e ajusta os componentes que dependem dele.
- Muda sempre aqui, no fork (branch `estilo-proprio`), e regista em `ALTERACOES.md` com versão (semver).
- Publica: commit, etiqueta `astryx-next-v<versão>`, push e lançamento no GitHub com o `.tgz` do `npm pack`.
  As apps recebem a mudança com `npm run visual:atualizar`.

## Licença

MIT. Baseado no Astryx © Meta Platforms, Inc. — ver [`LICENSE`](LICENSE).
