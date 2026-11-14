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
