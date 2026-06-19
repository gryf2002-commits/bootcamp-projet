#!/usr/bin/env node
/* ============================================================================
 * SunMates — SMOKE TEST (filet anti-régression)
 * ----------------------------------------------------------------------------
 * Vérifie l'essentiel sur preview.html, dans les DEUX modes (complet + Lite) :
 *   • l'app BOOTE (pas d'écran blanc),
 *   • ZÉRO erreur JS au démarrage (hors réseau/CDN bloqués en local),
 *   • le HTML finit par </html> (anti-troncature — incident connu),
 *   • styles.css est bien lié et la DA s'applique (fond non blanc),
 *   • le GEOFENCING se déclenche (GPS simulé sur une quête).
 *
 * Lancer :  npm test
 * Chrome :  auto-détecté ; sinon  set PUPPETEER_EXECUTABLE_PATH=C:\chemin\chrome.exe
 *           (profil Chrome temporaire isolé → ne touche jamais ton navigateur).
 * ============================================================================ */
const puppeteer = require("puppeteer-core");
const os = require("os"), path = require("path"), fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const FILE = "file:///" + path.join(ROOT, "preview.html").replace(/\\/g, "/");

// Erreurs attendues quand on ouvre l'app en local (Supabase/CDN/manifest injoignables) → ignorées.
const IGNORE = /Failed to load resource|net::ERR|ERR_|supabase|cdn|fetch|Access-Control|favicon|manifest|MIME/i;

function findChrome() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const c = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    (process.env.LOCALAPPDATA || "") + "/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return c.find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });
}

async function checkMode(browser, name, url, opts) {
  opts = opts || {};
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });

  if (opts.geo) {
    // GPS simulé + permission accordée → le watch démarre et doit déclencher le geofencing.
    await page.evaluateOnNewDocument((g) => {
      const pos = { coords: { latitude: g.lat, longitude: g.lng, accuracy: 10 }, timestamp: Date.now() };
      navigator.geolocation.getCurrentPosition = (ok) => ok(pos);
      navigator.geolocation.watchPosition = (ok) => { setTimeout(() => ok(pos), 300); return 1; };
      navigator.geolocation.clearWatch = () => {};
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query = () => Promise.resolve({ state: "granted", addEventListener() {}, onchange: null });
      }
    }, opts.geo);
  }

  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await new Promise((r) => setTimeout(r, opts.geo ? 9000 : 3500)); // laisse l'IIFE booter (+ le watch si geo)

  const info = await page.evaluate(() => ({
    bodyLen: ((document.body && document.body.innerText) || "").length,
    htmlEnd: document.documentElement.outerHTML.trim().endsWith("</html>"),
    cssLink: !![...document.querySelectorAll("link[rel=stylesheet]")].find((l) => /styles\.css/.test(l.href)),
    themed: (() => { const bg = getComputedStyle(document.body).backgroundColor; return !!bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && bg !== "rgb(255, 255, 255)"; })(),
    geoToast: (() => { const w = document.getElementById("toastWrapLow"); return w ? /près de/i.test(w.innerText) : false; })(),
  }));
  const real = errors.filter((e) => !IGNORE.test(e));
  await page.close();

  const checks = [
    ["boot (contenu rendu)", info.bodyLen > 200],
    ["0 erreur JS", real.length === 0],
    ["finit par </html>", info.htmlEnd],
    ["styles.css lié", info.cssLink],
    ["DA appliquée (fond stylé)", info.themed],
  ];
  if (opts.geo) checks.push(["geofencing déclenché", info.geoToast]);

  const pass = checks.every(([, ok]) => ok);
  console.log("\n=== " + name + " ===");
  checks.forEach(([n, ok]) => console.log("  " + (ok ? "OK  " : "ECHEC") + " · " + n));
  real.slice(0, 6).forEach((e) => console.log("     - " + e));
  return pass;
}

(async () => {
  const exe = findChrome();
  if (!exe) {
    console.error("Chrome introuvable. Définis PUPPETEER_EXECUTABLE_PATH vers chrome.exe / chromium.");
    process.exit(2);
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sm-smoke-"));
  const browser = await puppeteer.launch({
    executablePath: exe, headless: "new", userDataDir: tmp,
    args: ["--no-sandbox", "--disable-gpu", "--no-first-run", "--no-default-browser-check"],
  });
  let ok = true;
  try {
    ok = (await checkMode(browser, "Mode COMPLET (beta)", FILE + "?beta=1")) && ok;
    ok = (await checkMode(browser, "Mode LITE", FILE + "?lite=1")) && ok;
    ok = (await checkMode(browser, "GEOFENCING (GPS = Tour Eiffel)", FILE + "?beta=1", { geo: { lat: 48.8584, lng: 2.2945 } })) && ok;
  } finally {
    await browser.close();
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
  console.log("\n" + (ok ? "✅ SMOKE TEST OK" : "❌ SMOKE TEST FAIL"));
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error("RUNNER ERROR", e); process.exit(2); });
