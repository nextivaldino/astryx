// Preload do Electron (Astryx-NEXT): expõe à app só o necessário para a moldura
// nativa seguir o modo escolhido nas definições. CommonJS: funciona com sandbox.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('astryxNext', {
  /** 'sistema' | 'claro' | 'escuro' — chamado por aplicarAparencia() (astryx-next/comum). */
  definirModo: (modo) => ipcRenderer.send('astryx-next:modo', String(modo)),
});
