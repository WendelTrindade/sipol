const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

// Segurança: desabilitar navegação externa
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });
  contents.setWindowOpenHandler(({ url }) => {
    // Abrir links externos no navegador padrão
    if (url.startsWith('blob:') || url.startsWith('file://')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'SIPOL — Sistema Integrado de Polícia',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Permite localStorage e blob: URLs
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    backgroundColor: '#0f172a',
    show: false,
  });

  // Menu simplificado
  const menu = Menu.buildFromTemplate([
    {
      label: 'SIPOL',
      submenu: [
        { label: 'Sobre', click: () => {
          const { dialog } = require('electron');
          dialog.showMessageBox(win, {
            type: 'info',
            title: 'Sobre o SIPOL',
            message: 'SIPOL — Sistema Integrado de Polícia',
            detail: 'Versão 1.0.0\nDECAR/PCGO\n\nSistema offline de gestão de inteligência policial.',
            buttons: ['OK'],
            icon: path.join(__dirname, 'assets', 'icon.ico'),
          });
        }},
        { type: 'separator' },
        { label: 'Sair', accelerator: 'Alt+F4', role: 'quit' },
      ],
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom padrão' },
        { role: 'zoomIn', label: 'Aumentar zoom' },
        { role: 'zoomOut', label: 'Diminuir zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela cheia' },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  // Abrir blob: URLs de impressão normalmente
  win.webContents.on('new-window', (event, url) => {
    if (url.startsWith('blob:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
