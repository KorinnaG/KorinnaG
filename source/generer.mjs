/**
 * Génère les images du README (titre du site, boutons, titres de section,
 * cartes de projets)
 * à partir du portfolio : contenus et adresse du site (src/content/,
 * src/config.js), polices, icônes et photos (src/assets/). Pilote Chrome sans
 * interface par le protocole DevTools, sans dépendance, comme
 * scripts/captures.mjs du portfolio.
 *
 * Usage : `node source/generer.mjs`. Le portfolio est cherché à côté de ce
 * dépôt (../portfolio-officiel-ecole) ; PORTFOLIO=<chemin> pour un autre
 * emplacement, CHROME_PATH=<chemin> pour un autre Chrome.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { images } from './gabarits.mjs';

const DEPOT = fileURLToPath(new URL('..', import.meta.url));
const PORTFOLIO = resolve(process.env.PORTFOLIO ?? join(DEPOT, '..', 'portfolio-officiel-ecole'));
const SORTIE = join(DEPOT, 'images');
const CHROMES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function lancerChrome(chrome) {
  return new Promise((resolve, reject) => {
    // Les polices sont lues en file:// depuis une page file:// : Chrome les
    // traite comme une requête d'une autre origine sans ce drapeau.
    const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', '--no-first-run', '--disable-gpu', '--hide-scrollbars', '--disable-extensions', '--allow-file-access-from-files', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    let sortie = '';
    proc.stderr.on('data', (d) => {
      sortie += d;
      const m = sortie.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) resolve({ proc, ws: m[1] });
    });
    proc.on('exit', (code) => reject(new Error(`Chrome s'est arrêté (code ${code})`)));
    setTimeout(() => reject(new Error('Chrome ne répond pas')), 20000);
  });
}

class Cdp {
  constructor(ws) {
    this.socket = new WebSocket(ws);
    this.id = 0;
    this.attente = new Map();
    this.evenements = [];
    this.socket.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.attente.has(msg.id)) {
        const { resolve, reject } = this.attente.get(msg.id);
        this.attente.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        this.evenements.forEach((fn) => fn(msg));
      }
    });
    this.pret = new Promise((resolve) => this.socket.addEventListener('open', resolve));
  }
  envoyer(method, params = {}, sessionId) {
    const id = ++this.id;
    this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => this.attente.set(id, { resolve, reject }));
  }
  attendre(method, sessionId) {
    return new Promise((resolve) => {
      const fn = (msg) => {
        if (msg.method === method && msg.sessionId === sessionId) {
          this.evenements = this.evenements.filter((f) => f !== fn);
          resolve(msg.params);
        }
      };
      this.evenements.push(fn);
    });
  }
}

/** Attend les polices et les images, puis renvoie la boîte de #rendu. */
const MESURE = `document.fonts.ready
  .then(() => Promise.all([...document.images].map((img) => img.decode())))
  .then(() => {
    const r = document.getElementById('rendu').getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  })`;

async function main() {
  const charger = (chemin) => import(pathToFileURL(join(PORTFOLIO, chemin)).href);
  if (!existsSync(join(PORTFOLIO, 'src', 'content', 'site.js'))) throw new Error(`Portfolio introuvable : ${PORTFOLIO} (PORTFOLIO=<chemin>)`);
  const [{ site }, { projets }, { config }] = await Promise.all([charger('src/content/site.js'), charger('src/content/projets.js'), charger('src/config.js')]);

  const chrome = CHROMES.find((c) => existsSync(c));
  if (!chrome) throw new Error('Chrome introuvable (CHROME_PATH=<chemin>)');
  const { proc, ws } = await lancerChrome(chrome);
  const cdp = new Cdp(ws);
  await cdp.pret;
  const temp = await mkdtemp(join(tmpdir(), 'readme-'));
  await mkdir(SORTIE, { recursive: true });

  try {
    const { targetId } = await cdp.envoyer('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.envoyer('Target.attachToTarget', { targetId, flatten: true });
    await cdp.envoyer('Page.enable', {}, sessionId);
    // Fond transparent : les coins arrondis restent nets sur les thèmes clair et sombre de GitHub.
    await cdp.envoyer('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }, sessionId);

    for (const { nom, html, echelle } of images({ portfolio: PORTFOLIO, site, projets, config })) {
      const fichier = join(temp, `${nom}.html`);
      await writeFile(fichier, html);
      await cdp.envoyer('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: echelle, mobile: false }, sessionId);
      const charge = cdp.attendre('Page.loadEventFired', sessionId);
      await cdp.envoyer('Page.navigate', { url: pathToFileURL(fichier).href }, sessionId);
      await charge;
      const { result } = await cdp.envoyer('Runtime.evaluate', { expression: MESURE, awaitPromise: true, returnByValue: true }, sessionId);
      const { data } = await cdp.envoyer('Page.captureScreenshot', { format: 'png', clip: { ...result.value, scale: 1 }, captureBeyondViewport: true }, sessionId);
      await writeFile(join(SORTIE, `${nom}.png`), Buffer.from(data, 'base64'));
      console.log(`images/${nom}.png  ${Math.round(result.value.width * echelle)} × ${Math.round(result.value.height * echelle)}`);
    }
  } finally {
    cdp.socket.close();
    proc.kill();
    await rm(temp, { recursive: true, force: true });
  }
}

main().catch((erreur) => {
  console.error(erreur.message);
  process.exit(1);
});
