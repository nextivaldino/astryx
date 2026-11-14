// Processo principal do Electron (Astryx-NEXT).
//
//   import { BrowserWindow, ipcMain, nativeTheme } from 'electron';
//   import { ligarAstryxNext, PRELOAD } from './astryx-next/electron/principal.js';
//   const win = new BrowserWindow({ ..., webPreferences: { preload: PRELOAD } });
//   ligarAstryxNext(win, { ipcMain, nativeTheme });
//
// Recebe ipcMain/nativeTheme da app (não importa 'electron'): funciona mesmo que o
// Astryx-NEXT esteja numa pasta sem o Electron instalado.
//
// A barra de título nativa, os menus do sistema e o fundo da janela passam a seguir
// o modo escolhido na app (Definições → Aparência → Modo).
import { fileURLToPath } from 'node:url';

export const PRELOAD = fileURLToPath(new URL('./preload.cjs', import.meta.url));
const FUNDO = { claro: '#fafafb', escuro: '#222226' };
const MODOS = { claro: 'light', escuro: 'dark', sistema: 'system' };

export function ligarAstryxNext(win, { ipcMain, nativeTheme }) {
  const pintar = () => win.setBackgroundColor(nativeTheme.shouldUseDarkColors ? FUNDO.escuro : FUNDO.claro);
  const aoMudar = (e, modo) => {
    if (e.sender !== win.webContents || !(modo in MODOS)) return; // só esta janela, só valores conhecidos
    nativeTheme.themeSource = MODOS[modo];
    pintar();
  };
  ipcMain.on('astryx-next:modo', aoMudar);
  nativeTheme.on('updated', pintar);
  win.on('closed', () => { ipcMain.off('astryx-next:modo', aoMudar); nativeTheme.off('updated', pintar); });
  pintar();
}
