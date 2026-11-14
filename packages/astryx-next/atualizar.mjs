#!/usr/bin/env node
// Atualiza o Astryx-NEXT de um projeto.
//
//   npm run visual:atualizar                     → a versão mais recente (a da branch estilo-proprio)
//   npm run visual:atualizar -- 0.1.0-beta.2     → uma versão específica (também serve para voltar atrás)
//
// Modo "copiar" (pasta astryx-next/ no projeto): descarrega o pacote do lançamento
// no GitHub para uma pasta temporária, confirma que é o Astryx-NEXT, guarda a versão
// atual em astryx-next-anterior/ e só depois troca.
// Modo "instalar" (node_modules/astryx-next): mostra o comando npm a usar.
//
// Sem ligação, ou com o fork indisponível: não muda nada — a app continua a
// funcionar com a versão que tem. Sem dependências: Node 18+ e o `tar` do sistema.
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'nextivaldino/astryx';
const RAMO = 'estilo-proprio';

const aqui = dirname(fileURLToPath(import.meta.url));
const instalado = basename(dirname(aqui)) === 'node_modules';
const urlPacote = (v) => `https://github.com/${REPO}/releases/download/astryx-next-v${v}/astryx-next-${v}.tgz`;

async function pedir(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'astryx-next-atualizar' } });
  if (!r.ok) throw new Error(r.status === 404 ? `não existe (${url})` : `o GitHub respondeu ${r.status}`);
  return r;
}

async function main() {
  const atual = JSON.parse(await readFile(join(aqui, 'package.json'), 'utf8')).version;
  const pedida = process.argv[2]?.replace(/^astryx-next-v/, '');
  const alvo = pedida ?? (await (await pedir(`https://raw.githubusercontent.com/${REPO}/${RAMO}/packages/astryx-next/package.json`)).json()).version;

  if (instalado) {
    console.log(`Astryx-NEXT instalado como pacote (versão ${atual}). Para mudar para ${alvo}:\n\n  npm install ${urlPacote(alvo)}\n`);
    return;
  }
  if (!pedida && alvo === atual) return console.log(`O Astryx-NEXT já está na versão mais recente (${atual}).`);

  const temporaria = await mkdtemp(join(tmpdir(), 'astryx-next-'));
  try {
    // 1. Descarrega e extrai o pacote para a pasta temporária
    process.stdout.write(`A descarregar o Astryx-NEXT ${alvo}… `);
    const tgz = join(temporaria, 'pacote.tgz');
    await writeFile(tgz, Buffer.from(await (await pedir(urlPacote(alvo))).arrayBuffer()));
    execFileSync('tar', ['-xzf', tgz, '-C', temporaria]);
    console.log('feito.');

    // 2. Confirma que é mesmo o Astryx-NEXT, na versão pedida
    const nova = join(temporaria, 'package');
    const pj = JSON.parse(await readFile(join(nova, 'package.json'), 'utf8'));
    if (pj.name !== 'astryx-next' || pj.version !== alvo) throw new Error('o que foi descarregado não é o Astryx-NEXT pedido');

    // 3. Guarda a versão atual e troca (se a troca falhar, repõe)
    const anterior = join(dirname(aqui), 'astryx-next-anterior');
    await rm(anterior, { recursive: true, force: true });
    await rename(aqui, anterior);
    try {
      await cp(nova, aqui, { recursive: true });
    } catch (erro) {
      await rm(aqui, { recursive: true, force: true });
      await rename(anterior, aqui);
      throw erro;
    }
    console.log(`\nAstryx-NEXT atualizado: ${atual} → ${alvo}.`);
    console.log('A versão anterior ficou em astryx-next-anterior/ — apaga-a quando confirmares que está tudo bem.');
    console.log(`O que mudou: https://github.com/${REPO}/blob/astryx-next-v${alvo}/ALTERACOES.md`);
  } finally {
    await rm(temporaria, { recursive: true, force: true });
  }
}

main().catch((erro) => {
  console.error(`\nNão foi possível atualizar o Astryx-NEXT: ${erro.message}.`);
  console.error('Nada foi alterado: a app continua com a versão atual.');
  process.exitCode = 1;
});
