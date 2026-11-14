#!/usr/bin/env node
// Assistente para criar uma app nova (com ou sem o visual Astryx-NEXT).
//
//   node packages/astryx-next/criar/criar-app.mjs            → faz as perguntas
//   node packages/astryx-next/criar/criar-app.mjs --nome loja --tipo mobile --visual sim --modo copiar
//
// Opções (todas opcionais; o que faltar é perguntado):
//   --nome     nome da pasta/pacote (minúsculas e hífenes)
//   --titulo   nome mostrado na app
//   --visual   sim | nao       usar o visual Astryx-NEXT?
//   --tipo     mobile | desktop | ambos
//   --modo     copiar | instalar   (copiar = pasta astryx-next/ dentro do projeto; recomendado)
//   --destino  pasta onde criar (por omissão, a pasta atual)
//   --git      sim | nao       iniciar repositório git com o primeiro commit
// Sem dependências: só Node 18+.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const REPO = 'nextivaldino/astryx';
const pacote = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { version: VERSAO } = JSON.parse(await readFile(join(pacote, 'package.json'), 'utf8'));
const urlPacote = `https://github.com/${REPO}/releases/download/astryx-next-v${VERSAO}/astryx-next-${VERSAO}.tgz`;

// ── Argumentos e perguntas ───────────────────────────────────────────────
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const m = process.argv[i].match(/^--([a-z]+)(?:=(.*))?$/);
  if (m) args[m[1]] = m[2] ?? process.argv[++i];
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
async function perguntar(chave, texto, opcoes, padrao) {
  if (args[chave] != null) {
    if (opcoes && !opcoes.includes(args[chave])) sair(`--${chave} tem de ser: ${opcoes.join(' | ')}`);
    return args[chave];
  }
  if (!process.stdin.isTTY) return padrao;
  const dica = opcoes ? ` (${opcoes.map((o) => (o === padrao ? `[${o}]` : o)).join(' / ')})` : padrao ? ` [${padrao}]` : '';
  for (;;) {
    const r = (await rl.question(`${texto}${dica}: `)).trim().toLowerCase() || padrao;
    if (!opcoes || opcoes.includes(r)) return r;
    console.log(`  Responde ${opcoes.join(' ou ')}.`);
  }
}
function sair(msg) { console.error(`\n✖ ${msg}`); process.exit(1); }

console.log(`\nCriar uma app nova · Astryx-NEXT ${VERSAO}\n`);
const nome = await perguntar('nome', 'Nome da app (pasta, minúsculas e hífenes)', null, 'minha-app');
if (!/^[a-z0-9][a-z0-9-]*$/.test(nome)) sair('o nome só pode ter minúsculas, números e hífenes (ex.: loja-praia)');
const titulo = args.titulo ?? (process.stdin.isTTY
  ? (await rl.question(`Nome mostrado na app [${tituloDe(nome)}]: `)).trim() || tituloDe(nome)
  : tituloDe(nome));
if (/['"`\\{}<>]/.test(titulo)) sair('o nome mostrado não pode ter aspas, chavetas nem < >');
const visual = await perguntar('visual', 'Usar o visual Astryx-NEXT?', ['sim', 'nao'], 'sim');
const tipo = visual === 'sim' ? await perguntar('tipo', 'Que tipo de app?', ['mobile', 'desktop', 'ambos'], 'mobile') : 'base';
const modo = visual === 'sim' ? await perguntar('modo', 'Como incluir o visual?', ['copiar', 'instalar'], 'copiar') : null;
const git = await perguntar('git', 'Iniciar repositório git?', ['sim', 'nao'], 'sim');
const destino = resolve(args.destino ?? process.cwd());
rl.close();

function tituloDe(n) { return n.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' '); }

// ── Criar ────────────────────────────────────────────────────────────────
const apps = tipo === 'ambos'
  ? [{ modelo: 'app-mobile', nome: `${nome}-mobile` }, { modelo: 'app-desktop', nome: `${nome}-desktop` }]
  : [{ modelo: `app-${tipo}`, nome }];

for (const app of apps) if (existsSync(join(destino, app.nome))) sair(`já existe ${join(destino, app.nome)} — escolhe outro nome ou apaga a pasta`);

for (const app of apps) {
  const pasta = join(destino, app.nome);
  await cp(join(pacote, 'modelos', app.modelo), pasta, { recursive: true });
  await rename(join(pasta, 'gitignore'), join(pasta, '.gitignore')); // o npm não publica .gitignore

  // Substitui {{NOME}} e {{TITULO}} em todos os ficheiros de texto
  for (const f of await listar(pasta)) {
    const texto = await readFile(f, 'utf8');
    if (texto.includes('{{')) await writeFile(f, texto.replaceAll('{{NOME}}', app.nome).replaceAll('{{TITULO}}', titulo));
  }

  if (modo === 'copiar') {
    await cp(pacote, join(pasta, 'astryx-next'), {
      recursive: true,
      filter: (f) => !/[\\/](modelos|criar|node_modules)([\\/]|$)/.test(f.slice(pacote.length)),
    });
  } else if (modo === 'instalar') {
    const pj = JSON.parse(await readFile(join(pasta, 'package.json'), 'utf8'));
    pj.dependencies['astryx-next'] = urlPacote;
    pj.scripts['visual:atualizar'] = 'node node_modules/astryx-next/atualizar.mjs';
    await writeFile(join(pasta, 'package.json'), JSON.stringify(pj, null, 2) + '\n');
  }

  await writeFile(join(pasta, 'README.md'), readme(app));

  if (git === 'sim') {
    try {
      const g = (...a) => execFileSync('git', a, { cwd: pasta, stdio: 'ignore' });
      g('init', '-q'); g('add', '-A'); g('commit', '-q', '-m', `Criar ${titulo} (${app.modelo}${modo ? `, Astryx-NEXT ${VERSAO} · ${modo}` : ''})`);
    } catch { console.log(`  (git: não foi possível criar o primeiro commit em ${app.nome}; faz-o à mão)`); }
  }
  console.log(`✔ ${app.nome} criada em ${pasta}`);
}

console.log('\nPróximos passos:');
for (const app of apps) console.log(`  cd "${join(destino, app.nome)}" && npm install && npm run dev`);
console.log('');

async function listar(dir) {
  const r = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) r.push(...(await listar(p))); else r.push(p);
  }
  return r;
}

function readme(app) {
  const estilo = { 'app-mobile': 'next-mobile (telemóvel e tablet: dock, avatar, cartões)', 'app-desktop': 'next-desktop (web e Electron: barra da app e barra de estado)' }[app.modelo];
  const visualTxt = !modo
    ? `Esta app **não usa o visual Astryx-NEXT**: usa o Astryx original (\`@astryxdesign/core\` com o tema neutral).
Para passar a usar o visual, cria uma app nova com o assistente e responde *sim* — ou segue a secção
"Usar numa app que já existe" do README do Astryx-NEXT.`
    : `Esta app **usa o visual Astryx-NEXT ${VERSAO}**, estilo ${estilo}.

${modo === 'copiar'
  ? `O visual está **copiado dentro do projeto**, na pasta \`astryx-next/\`. A app não depende do fork:
continua a instalar e a funcionar mesmo que o GitHub ou o fork estejam indisponíveis. Guarda essa pasta no git.`
  : `O visual está **instalado como pacote** a partir do lançamento no GitHub
(\`${urlPacote}\`). O \`package-lock.json\` fixa a versão; guarda-o no git. Se o fork ficar indisponível,
uma instalação limpa falha — passa para o modo copiar (ver "Mudar de modo").`}

### Atualizar o visual

\`\`\`sh
npm run visual:atualizar                                 # versão mais recente
npm run visual:atualizar -- ${VERSAO}        # uma versão específica
\`\`\`

${modo === 'copiar'
  ? `Descarrega a versão nova para uma pasta temporária, confirma-a, guarda a atual em \`astryx-next-anterior/\` e só
depois troca. Sem ligação, ou com o fork em baixo, **não muda nada**. Para voltar atrás: apaga \`astryx-next/\` e
renomeia \`astryx-next-anterior/\` para \`astryx-next/\`.`
  : 'Mostra o comando `npm install …` da versão pedida.'}

### Mudar de modo

- **instalar → copiar:** copia \`node_modules/astryx-next\` para \`astryx-next/\`, tira \`astryx-next\` das dependências
  no \`package.json\`, muda o script para \`node astryx-next/atualizar.mjs\` e corre \`npm install\`.
- **copiar → instalar:** apaga \`astryx-next/\`, corre \`npm install ${urlPacote}\` e muda o script para
  \`node node_modules/astryx-next/atualizar.mjs\`.

O \`vite.config.js\` já trata dos dois casos: se a pasta \`astryx-next/\` existir, usa-a.

### Regras do visual

- Muda as cores, os raios e a densidade nas **Definições → Aparência** da app, não no CSS.
- Para mudanças do próprio sistema (que devem chegar a todas as apps), muda no fork, na branch \`estilo-proprio\`,
  e regista em \`ALTERACOES.md\`.
- Na app, escreve só o layout das páginas (\`src/app.css\`) e usa os componentes do Astryx e do Astryx-NEXT.`;

  return `# ${titulo}

Criada com o assistente \`criar-app\` (modelo \`${app.modelo}\`).

## Começar

\`\`\`sh
npm install
npm run dev        # desenvolvimento (abre no telemóvel com o endereço "Network")
npm run build      # versão final em dist/
\`\`\`

${modo ? 'A entrada é de exemplo e aceita qualquer senha — liga-a à autenticação real em `src/sessao.js`.\n' : ''}
## Visual

${visualTxt}

## Estrutura

\`\`\`
src/main.jsx     arranque: importa o tema
src/App.jsx      páginas de exemplo (troca pelas tuas)
${modo ? `src/app.css      layout das páginas\nsrc/sessao.js    sessão de exemplo (localStorage)\n` : ''}${modo === 'copiar' ? 'astryx-next/     o visual (não editar aqui; ver "Regras do visual")\n' : ''}\`\`\`
`;
}
