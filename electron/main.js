// Fenêtre de bureau BiTalkBi (Windows 11 et Linux)
// L'appli est servie par une adresse sécurisée « app:// » : nécessaire pour le micro (enregistrement),
// l'IA hors ligne intégrée (WebLLM, modules JavaScript) et le stockage hors ligne.
const { app, BrowserWindow, shell, Menu, protocol, session, net } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } }]);
if (!app.requestSingleInstanceLock()) app.quit();
const ROOT = path.join(__dirname, "..", "www");
function createWindow() {
  const win = new BrowserWindow({
    width: 1100, height: 800, minWidth: 360, minHeight: 560, title: "BiTalkBi",
    backgroundColor: "#fdf8ff", icon: path.join(__dirname, "..", "build", "icon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.loadURL("app://bitalkbi/index.html");
  // Les liens externes s'ouvrent dans le navigateur, jamais dans l'appli
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("app://")) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
}
app.whenReady().then(() => {
  protocol.handle("app", req => {
    let p = decodeURIComponent(new URL(req.url).pathname); if (!p || p === "/") p = "/index.html";
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT)) return new Response("Interdit", { status: 403 });   // pas d'accès hors du dossier de l'appli
    return net.fetch(pathToFileURL(file).toString());
  });
  // Micro autorisé uniquement pour l'appli elle-même
  const allow = (perm, origin) => ["media", "microphone", "audioCapture"].includes(perm) && String(origin || "").startsWith("app://");
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb, d) => cb(allow(perm, d && d.requestingUrl)));
  session.defaultSession.setPermissionCheckHandler((wc, perm, origin) => allow(perm, origin));
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("second-instance", () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
