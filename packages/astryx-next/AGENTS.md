# Astryx-NEXT — instruções para assistentes de IA

Estás a trabalhar numa app construída sobre o **Astryx-NEXT**, um design system sobre o
[Astryx](https://github.com/facebook/astryx) (Meta, MIT). **Usa sempre esta base para construir tudo**:
ecrãs, componentes, cores, espaços, movimento e definições. A referência completa de cada componente
está em [`REFERENCIA.md`](REFERENCIA.md).

## Regras (obrigatórias)

1. **Reutiliza antes de criar.** Procura primeiro em:
   1. `astryx-next/mobile`, `astryx-next/desktop`, `astryx-next/formulario` e `astryx-next/comum`;
   2. depois em `@astryxdesign/core` (botões, campos, menus, diálogos, tabelas, ícones…).
   - Só cria um componente novo se nenhum servir, e compõe-no com estes.
   - Não acrescentes outras bibliotecas de UI, de ícones, de animação nem de CSS (Tailwind, MUI, Framer Motion…).
2. **Só tokens, nunca valores à mão.**
   - Usa `var(--color-*)`, `var(--radius-element)`, `var(--radius-container)`, `var(--spacing-*)`,
     `var(--font-size-*)`, `var(--shadow-*)` e `var(--mov-*)`.
   - Sem hexadecimais, sem `px` de raio e sem durações escritas à mão.
   - O claro/escuro, o alto contraste, a densidade, a cor de destaque, o tamanho da interface e a versão mobile
     dependem disso.
3. **Arranque certo.**
   - Em `main.jsx`, `import 'astryx-next/tema'` vem antes de qualquer outro CSS.
   - `aplicarAparenciaGuardada()` corre antes do primeiro render.
   - Na raiz, usa `<Theme theme={neutralTheme} mode={MODO_TEMA[efetiva.modo]}>` com `useAparencia()`.
   - Envolve a app em `<DockProvider>`, também no desktop: é ele que guarda os avisos.
4. **Escolhe o estilo pela plataforma.**
   - **next-mobile** (telemóvel e tablet): `Dock`, `CantoUtilizador`, `CartaoInfo`/`GrelhaInfo`, `Definicoes` e o
     layout `.nm-colunas`.
   - **next-desktop** (web e Electron): `BarraApp`, `BarraEstado`, `JanelaDefinicoes`.
     - A `BarraApp` vira barra de tarefas sozinha; não cries outra navegação inferior.
     - Passa `onDefinicoes` à `BarraApp` para ativar o botão ⚙.
   - Para começar uma app nova, usa o assistente `criar-astryx-next`: ele gera o modelo certo.
5. **Navegação e movimento.**
   - A `Dock` e a `BarraApp` já animam a troca de página.
   - Noutras trocas de página usa `transicao(() => setPagina(x), 'frente' | 'tras')`.
   - Não animes `width`, `height` nem `top`; usa as peças de `tema/movimento.css`.
   - Respeita sempre "menos movimento". As peças do sistema já o fazem.
6. **Avisos.**
   - Usa `useDock().aviso({ tipo, titulo, sub })`:
     - `sucesso` e `info` aparecem 4s numa pílula;
     - `atencao`, `erro` e `mensagem` vão para a ilha da dock e para o histórico.
   - Não cries toasts próprios.
7. **Formulários.**
   - Usa `Formulario` / `Seccao` / `Campo` (progresso, rascunho e validação já incluídos).
   - Dá o `tipo` certo ao campo (`email`, `telefone`, `data`, `hora`, `numero`, `nome`, `texto-longo`).
8. **Definições.**
   - A aparência é do **sistema**, não da app. Não cries opções de tema próprias.
   - No mobile usa `<Definicoes>`; no desktop usa `<JanelaDefinicoes>`.
   - Acrescenta as opções da app em `seccoesApp`.
9. **Não alteres o sistema dentro da app.**
   - A pasta `astryx-next/` (modo copiar) ou `node_modules/astryx-next` (modo instalar) é o sistema.
   - Mudanças ao sistema fazem-se no fork (ramo `estilo-proprio`), registam-se em `ALTERACOES.md` e chegam às apps com
     `npm run visual:atualizar`.
   - Na app escreve-se só o layout das páginas (`src/app.css`).
10. **Acessibilidade.**
    - Todo o botão só com ícone tem `label`/`aria-label`.
    - Os campos têm rótulo visível.
    - Não escondas o anel de foco.
    - As áreas de toque de 44px, a letra de 16px no telemóvel e o hover só com rato já vêm do tema; não os anules.
11. **Língua.** Os textos da interface são em português de Portugal.

## Esqueleto mínimo (mobile)

```jsx
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MODO_TEMA, useAparencia } from 'astryx-next/comum';
import { Dock, DockProvider, Definicoes } from 'astryx-next/mobile';

export default function App() {
  const [a, mudar, repor, efetiva] = useAparencia();
  return (
    <Theme theme={neutralTheme} mode={MODO_TEMA[efetiva.modo]}>
      <DockProvider>{/* páginas + <Dock paginas={…} ativa={…} onIr={…} paineis={…} /> */}</DockProvider>
    </Theme>
  );
}
```

No desktop, troca a `Dock` por `BarraApp` + `BarraEstado` e as `Definicoes` por `JanelaDefinicoes`. Ver os modelos em
`modelos/app-mobile` e `modelos/app-desktop`; são o ponto de partida recomendado.

## Se estás a alterar o próprio sistema (no fork)

- Ordem de preferência:
  1. **tema** (variáveis CSS em `tema/`);
  2. regras sobre as classes de tema do Astryx;
  3. componente novo composto;
  4. por último, código-fonte do Astryx.
- Cada ajuste segue os tokens e ajusta os componentes que dependem dele: nada de exceções pontuais.
- Mudanças só no ramo `estilo-proprio`; o `main` fica igual ao Astryx original.
- Mantém os avisos MIT e de copyright da Meta.
- Regista cada versão em `ALTERACOES.md`, na raiz do fork (Data, Versão, O que mudou, Porquê, Tipo, Impacto, Quebra?).
  Versões em semver.
- Antes de publicar, corre `npm run testar` nesta pasta: cria as três apps modelo e compila-as.

## Antes de terminar uma tarefa

- `npm run build` sem erros.
- Vê o resultado no claro e no escuro, num telemóvel (390px) e num ecrã largo.
- Sem valores de cor ou de tamanho escritos à mão no código novo.
