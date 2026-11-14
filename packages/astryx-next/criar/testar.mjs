#!/usr/bin/env node
// Teste de fumo do Astryx-NEXT (correr antes de publicar: `npm run testar`).
// Cria as três apps modelo numa pasta temporária — mobile (copiar), desktop (instalar,
// com o .tgz deste pacote) e base (sem o visual) —, instala-as e compila-as.
// Falha se alguma não compilar ou se ficar um {{marcador}} por substituir.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pacote = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = await mkdtemp(join(tmpdir(), 'astryx-next-teste-'));
const correr = (cmd, args, cwd, env = {}) => execFileSync(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] }).toString();

const tgz = join(tmp, correr('npm', ['pack', '--pack-destination', tmp, '--silent'], pacote).trim().split('\n').pop());
const casos = [
  { nome: 't-mobile', args: ['--visual', 'sim', '--tipo', 'mobile', '--modo', 'copiar'] },
  { nome: 't-desktop', args: ['--visual', 'sim', '--tipo', 'desktop', '--modo', 'instalar'] },
  { nome: 't-base', args: ['--visual', 'nao'] },
];

async function marcadores(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', 'dist', 'astryx-next'].includes(e.name) && await marcadores(p)) return true; }
    else if (/\{\{[A-Z]+\}\}/.test(await readFile(p, 'utf8'))) return p;
  }
  return false;
}

let falhas = 0;
for (const c of casos) {
  const pasta = join(tmp, c.nome);
  try {
    correr('node', [join(pacote, 'criar/criar-app.mjs'), '--nome', c.nome, ...c.args, '--git', 'nao', '--destino', tmp], tmp, { ASTRYX_NEXT_TGZ: `file:${tgz}` });
    const sobra = await marcadores(pasta);
    if (sobra) throw new Error(`marcador por substituir em ${sobra}`);
    if (!existsSync(join(pasta, 'AGENTS.md'))) throw new Error('falta o AGENTS.md');
    correr('npm', ['install', '--no-audit', '--no-fund', '--silent'], pasta);
    correr('npx', ['vite', 'build', '--logLevel', 'error'], pasta);
    if (!existsSync(join(pasta, 'dist/index.html'))) throw new Error('a compilação não gerou dist/index.html');
    console.log(`✔ ${c.nome}`);
  } catch (erro) {
    falhas++;
    console.log(`✖ ${c.nome}: ${(erro.stderr?.toString() || erro.message).trim().split('\n').slice(-5).join('\n  ')}`);
  }
}

if (falhas) { console.log(`\n${falhas} falha(s). Ficou tudo em ${tmp} para ver.`); process.exitCode = 1; }
else { await rm(tmp, { recursive: true, force: true }); console.log('\nTudo certo: as três apps modelo compilam.'); }
