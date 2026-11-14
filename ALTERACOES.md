# Alterações — Astryx-NEXT

**Astryx-NEXT** — design system próprio de Ivaldino, construído sobre o **Astryx** (design system open source
da Meta, licença MIT). Vive neste fork, no ramo `estilo-proprio`, como pacote `packages/astryx-next`.
Dois estilos sobre o mesmo tema: **next-desktop** (apps Electron e web) e **next-mobile** (telemóvel e tablet).

O ramo `main` fica igual ao Astryx original (para sincronizar com a Meta); todo o trabalho próprio está em
`estilo-proprio`.

## Origem

| | |
|---|---|
| Base | Astryx `@astryxdesign/core` **0.7.16** + `@astryxdesign/theme-neutral` 0.7.16 |
| Commit de origem (Meta) | `5051ea96a35307183e9f3fab7fadcc7b0d649e45` — *chore: version packages for v0.7.16 (#11618)*, 13/11/2026 |
| Repositório original | https://github.com/meta/astryx |
| Fork | https://github.com/nextivaldino/astryx — ramo `estilo-proprio`, criado a partir da tag `v0.7.16` |
| Pacote | `packages/astryx-next` (nome npm `astryx-next`); usa os pacotes `@astryxdesign/*` 0.7.16 do npm |
| Licença | MIT — mantida; os avisos de copyright da Meta nos ficheiros originais não foram alterados |

Inspiração: **GNOME HIG / libadwaita** (paleta Adwaita, barras, listas em caixa) e **KARGA mobile** (Dock_next-2, tipografia, paleta Coral, formulário).

## Sincronizações com o Astryx

| Data | Versão do Astryx | O que foi trazido | Notas |
|---|---|---|---|
| — | — | Ainda nenhuma sincronização | Partida: 0.7.16 |

---

## 0.1.0-beta.5 — 14/11/2026 · padrão do fundo

Padrões finos para o fundo, sem degradês, escolhidos em **Definições → Aparência → Padrão do fundo**.

| O que mudou | Porquê | Tipo | Impacto | Quebra? |
|---|---|---|---|---|
| `tema/textura.css`: padrões Grelha, Planta (grelha + linhas mestras), Pontos, Linhas e Diagonal, em traços de 1px na cor do texto | Dar carácter ao fundo sem distrair do conteúdo | tema | todos | não |
| Intensidade (suave 5% · média 8% · marcada 12%) e onde mostrar (só no início · em todas) | Cada pessoa escolhe quanto quer ver | tema | todos | não |
| Autoajustável: o passo da grelha acompanha a densidade (16–34px) e a largura do ecrã | Fica proporcional em telemóvel, tablet e desktop | tema | todos | não |
| **Avisos no fundo**: enquanto há um aviso, o padrão ganha a cor dele (vermelho erro, âmbar atenção, verde sucesso, destaque info) e pulsa duas vezes ao chegar; sem padrão (ou fora do início), o fundo ganha um tom leve dessa cor. Desligável; botão "Experimentar" | O fundo também serve de sinal | código-fonte | todos | não |
| Leve: uma só camada fixa por trás de tudo, desenhada uma vez (não se redesenha ao percorrer); cor e intensidade transitam só nessa camada (`@property`); sem pulsar com "Reduzir efeitos" | Não deixar o sistema lento | tema | todos | não |
| A Dock e a BarraApp marcam `<html data-no-inicio>` na 1.ª página | Saber onde é o "início" sem código na app | código-fonte | todos | não |
| Dock: a pílula volta a medir-se quando a faixa dos separadores muda (ex.: a ilha de aviso entra) | Corrige a pílula desalinhada no tablet | código-fonte | tablet | não |

---

## 0.1.0-beta.4 — 14/11/2026 · toque

Correções de usabilidade em ecrãs de toque, sem mudar o desenho. Regras inspiradas em
[taste-skill](https://github.com/Leonxlnx/taste-skill) (Leonxlnx, MIT), medidas num telemóvel de 390px.

| O que mudou | Porquê | Tipo | Impacto | Quebra? |
|---|---|---|---|---|
| `tema/toque.css`: em ecrãs de toque, botões do Astryx, avatar e "Falta:" ganham uma área de toque invisível de pelo menos 44 × 44px (antes 24–32px) | Acertar no botão à primeira (HIG da Apple e do GNOME) | tema | mobile · tablet | não |
| Campos de texto a 16px em ecrãs de toque (antes 14px) | O iPhone ampliava a página ao tocar num campo | tema | mobile · tablet | não |
| Efeitos de passar o rato (`:hover`) só com rato | No toque o realce ficava preso depois de tocar | tema | mobile · tablet | não |
| Dock: separadores só com ícone com 44px de largura mínima (antes 40) | Alvo de toque mínimo | tema | mobile · tablet | não |

---

## 0.1.0-beta.3 — 14/11/2026 · movimento fluido

Uma escala de movimento comum e transições suaves em todo o sistema. Princípios inspirados em
[transitions.dev](https://transitions.dev) (Jakub Antalik): uma só curva que arranca depressa e assenta devagar,
abrir mais lento do que fechar, distâncias curtas, escala quase 1 e desfoque leve. Implementação própria (sem
copiar a biblioteca; a licença dela não permite redistribuí-la). Sempre desligado com "menos movimento" do
sistema ou Definições → Reduzir efeitos.

| O que mudou | Porquê | Tipo | Impacto | Quebra? |
|---|---|---|---|---|
| `tema/movimento.css`: tokens `--mov-*` (durações 150/250/350/400/500ms, curvas `--mov-suave` e `--mov-mola`, distâncias, escala, desfoque) | Tudo mexe da mesma maneira; um só sítio para afinar | tema | todos | não |
| Curvas do Astryx (`--ease-standard/entrance/move`) passam a `--mov-suave`; `--duration-exit` 150ms | Diálogos, menus e popovers do Astryx com o mesmo ritmo; fechar mais rápido | tema | todos | não |
| **Transição entre páginas** (View Transitions): a página desliza 8px para o lado da navegação e cruza com desfoque; dock, barra da app e barra de estado ficam paradas. `transicao(mudar, sentido)` e `sentidoEntre()` em `astryx-next/comum` | Mudar de página deixa de "saltar" | novo componente | todos | não |
| Dock e BarraApp usam a transição ao mudar de separador/aba (frente ou trás conforme a posição); Definições ao entrar e sair das sub-páginas; os modelos ao abrir/fechar as Definições | Navegação fluida sem código extra nas apps | código-fonte | todos | não |
| Dock: **uma só pílula** que desliza entre separadores e ajusta a largura; o texto muda de cor ao mesmo ritmo | Ver para onde se foi | código-fonte | mobile · tablet | não |
| Dock: o painel abre em 400ms e fecha em 350ms; o conteúdo sobe com desfoque ao abrir (e ao passar de um painel para outro) e **continua visível enquanto o painel fecha** (antes ficava vazio de repente) | Painel fluido nos dois sentidos | código-fonte | mobile · tablet | não |
| Ilha, bolha e 🔔: mola mais suave (`--mov-mola`) e entrada com desfoque | Saltos menos bruscos | tema | mobile · tablet | não |
| Formulário: ao guardar com obrigatórios em falta, o campo **abana e assenta** antes de receber o foco | Mostrar onde está o problema | código-fonte | todos | não |
| CartaoInfo: quando o valor muda, cruza com desfoque no sítio | Números que mudam sem saltar | código-fonte | todos | não |
| `visual:atualizar`: a "versão mais recente" vem do feed de lançamentos (sem a API do GitHub, que limita os pedidos, nem cache) | Atualizar funcionava mal com muitos pedidos ou logo após publicar | código-fonte | todos | não |

---

## 0.1.0-beta.2 — 14/11/2026 · usar o Astryx-NEXT em apps novas

Torna o Astryx-NEXT fácil de usar em qualquer app futura, sem depender do fork estar disponível.
Nenhuma mudança visual nos componentes. Ver [`packages/astryx-next/README.md`](packages/astryx-next/README.md).

| O que mudou | Porquê | Tipo | Impacto | Quebra? |
|---|---|---|---|---|
| Assistente `criar/criar-app.mjs`: pergunta o nome, **se a app usa o visual Astryx-NEXT**, o tipo (mobile, desktop ou ambos), o modo (copiar/instalar) e se inicia o git; também aceita tudo por argumentos | Criar apps novas já com a base certa, sem copiar à mão | novo componente | todos | não |
| Modelos `modelos/app-mobile` (next-mobile: entrar, dock, avatar, cartões, formulário, definições), `app-desktop` (next-desktop: barra da app, abas, menu com tema, barra de estado) e `app-base` (Astryx original, sem o visual) | Ponto de partida igual em todas as apps; os laboratórios Agenda e agenda-mobile ficam só para criar modelos | novo componente | todos | não |
| Dois modos: **copiar** (pasta `astryx-next/` dentro do projeto; recomendado) e **instalar** (`.tgz` do lançamento no GitHub). O `vite.config.js` dos modelos trata dos dois | A app continua a instalar e a funcionar mesmo que o fork fique indisponível | novo componente | todos | não |
| `atualizar.mjs` (`npm run visual:atualizar [versão]`): descarrega o pacote para uma pasta temporária, confirma-o, guarda a versão atual em `astryx-next-anterior/` e só depois troca; sem ligação não altera nada. Não usa a API do GitHub (sem limite de pedidos) | Atualizar o visual das apps com segurança e poder voltar atrás | novo componente | todos | não |
| README do pacote e README gerado em cada app (diz se usa o visual, em que modo e como atualizar) | Documentar como usar e manter | documentação | todos | não |
| `package.json`: campos `files`, `repository`, `homepage`; `LICENSE` (MIT, Meta) incluída no pacote | O pacote publicado leva só o necessário e mantém a licença | novo componente | todos | não |
| Definições → Sobre o sistema mostra 0.1.0-beta.2 | Versão certa | código-fonte | todos | não |

---

## 0.1.0-beta.1 — 14/11/2026 · primeira versão beta

> Desenvolvido primeiro como `next-ds` (pasta à parte) e passado para este fork com o nome **Astryx-NEXT**.

Primeira versão beta, publicada no fork (ramo `estilo-proprio`, etiqueta `astryx-next-v0.1.0-beta.1`).
Nenhum componente do Astryx foi alterado no código-fonte: tudo é **tema** (variáveis CSS e
regras sobre as classes de tema do Astryx) ou **componente novo** composto com componentes do Astryx.

Legenda — **Tipo**: tema · swizzle · código-fonte · novo componente. **Impacto**: mobile · tablet · desktop · todos.
**Quebra?**: se quebra compatibilidade com a versão anterior (nesta primeira beta, em relação ao Astryx original).

### Tema comum (`packages/astryx-next/tema/`)

| O que mudou | Porquê | Tipo | Impacto | Quebra? |
|---|---|---|---|---|
| **Tipografia** Mona Sans variável (incluída, offline) com a escala, pesos e entrelinhas do KARGA (`tipografia.css`) | Identidade única; a mesma letra dos projetos KARGA | tema | todos | não |
| **Cores Adwaita** (GNOME): janela, vista, cartões, menus, estados, bordas 7% / 15% (`cores.css`) | Estilo de app GNOME para apps multiplataforma | tema | todos | não |
| **Azul de destaque** `#0073df` (em vez de `#3584e4`) | Texto branco com contraste ≥ 4.5:1 (WCAG AA) | tema | todos | não |
| **Sombras do sistema** (`--shadow-low/med/high`) mais leves e curtas | Visual limpo; sombras pedidas "bem leves" | tema | todos | não |
| **Cantos**: elementos 7.5px (−25%), interiores 3.5px, contentores 12px; regra concêntrica no SegmentedControl (`raios.css`) | Cantos mais contidos e alinhados entre si | tema | todos | não |
| **Botões**: espaço lateral ×4/3 (16px); contorno leve; volume Aqua 25% mais suave; carregar afunda (`acao.css`) | Botões com mais corpo e um 3D discreto | tema | todos | não |
| **Toolbar** passa à linha seguinte quando não cabe | No telemóvel os controlos ficavam cortados | tema | mobile | não |
| **Reticências** (MoreMenu e "mais") 24px | Pontos de 2.7px eram quase invisíveis | tema | todos | não |
| **Volume 3D** (calha / preenchido / puxador) em ProgressBar, Slider, Switch, SegmentedControl, Stepper, Checkbox, Radio (`volume.css`) | Pequeno efeito 3D ao estilo Aqua, sem gradientes | tema | todos | não |
| **Menus que desenrolam** a partir do botão (DropdownMenu, MoreMenu, Selector, MultiSelector, ComplexSelector), colados, cantos retos onde tocam (`menus.css`, `menus.js`) | O menu nasce do botão em vez de flutuar | tema | todos | não |
| **Botões de fechar**: círculo vermelho com ✕ branco (Dialog, Drawer, Toast, Banner, Lightbox, BottomSheet, MobileNav, Popover, Dock) (`fechar.css`) | Ação de fechar reconhecível em todo o sistema | tema | todos | não |
| **Aparência** escolhida pelo utilizador: estilo Adwaita/Coral, modo, 10 fundos (incl. Aurora), 8 cores de destaque (OKLCH, AA), densidade, forma dos botões (arredondados/pílula), reduzir efeitos (`aparencia.css`, `comum/aparencia.js`) | Sistema personalizável por app e por pessoa; densidade e modos pedidos desde o início | tema | todos | não |
| **Tema rápido**: Claro / Escuro / Personalizado sem perder o personalizado | Mudar de tema num toque | tema | todos | não |

### next-desktop (`packages/astryx-next/desktop/`)

| O que mudou | Porquê | Tipo | Impacto | Quebra? |
|---|---|---|---|---|
| **BarraApp**: menu da app no logótipo (Sobre, Preferências, Tema, Atalhos, Ajuda, Terminar sessão), título, separadores com largura igual e indicador na borda, pesquisa, menu principal, sub-barra expansível; adaptativa (tablet: ícone sobre o nome; telemóvel: separadores em barra no fundo) | Barra superior completa ao estilo header bar do GNOME | novo componente | todos | não |
| **BarraEstado**: estado da ligação, informação da app; no telemóvel só os avisos | Informação do sistema sempre visível no desktop | novo componente | desktop · tablet | não |

### next-mobile (`packages/astryx-next/mobile/`)

| O que mudou | Porquê | Tipo | Impacto | Quebra? |
|---|---|---|---|---|
| **Dock** (evolução da Dock_next-2 do KARGA): cápsula concêntrica, painel que cresce, ilha de avisos importantes, separadores com pílula sólida e brilho, ＋ que vira ✕, esconde-se com o teclado, encolhe ao percorrer, faixa esbatida por trás | Barra superior levada para baixo, para telemóvel e tablet | novo componente | mobile · tablet | não |
| **Bolha de avisos**: com a dock cheia, o 🔔 sai e vira uma bolha (mini-dock com os últimos avisos); sino a abanar | Libertar espaço sem esconder as notificações | novo componente | mobile | não |
| **Definições do sistema** (sempre presentes): secções da app + Sistema → Aparência (miniatura ao vivo), Dock (tema igual/inverso, vidro/sólido, lado do ＋, nomes, encolher, esconder), Sobre | Personalização do sistema separada da de cada app | novo componente | mobile · tablet | não |
| **Canto do utilizador**: avatar com relevo, cartão que nasce do avatar, tema rápido em 3 bolinhas, alertas rápidos em pílula, sino pequeno quando há avisos | Conta, tema e alertas sempre à mão | novo componente | mobile · tablet | não |
| **CartaoInfo / GrelhaInfo**: cartões pastel alinhados em grelha automática | Página de início informativa | novo componente | mobile · tablet | não |
| **Layout em colunas** (`nm-colunas`): 1 coluna no telemóvel, 2–3 no tablet | Páginas que se ajustam à largura | novo componente | mobile · tablet | não |

### Formulário inteligente (`packages/astryx-next/formulario/`)

| O que mudou | Porquê | Tipo | Impacto | Quebra? |
|---|---|---|---|---|
| **Formulario / Seccao / Campo**: legenda dentro do campo, validação ao sair, teclado certo por tipo, grelha automática, progresso por segmentos com "Falta: …", secções que encolhem, rascunho automático | Evolução do formulário do KARGA mobile | novo componente | todos | não |

### Apps de teste

- **Agenda** (`../Agenda`, fora do fork): next-desktop — login, BarraApp, BarraEstado, página DesignSystem (montra dos 111 componentes do Astryx).
- **agenda-mobile** (`../agenda-mobile`, fora do fork): next-mobile — dock, canto do utilizador, Início com cartões, Hoje com elementos de teste, formulário "Nova tarefa", Definições.
