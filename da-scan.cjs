/* ============================================================
   da-scan.cjs — Scanner de conformité DA (SunMates)
   Pour CHAQUE preset × CHAQUE mode, vérifie la COULEUR RÉELLEMENT RENDUE
   (pixel, pas la variable CSS) de chaque élément, et liste tout ce qui ne
   suit PAS l'accent du preset (fonds/textes figés hors-DA) + contraste AA.
   Usage : node da-scan.cjs            (tous presets, 6 modes, accueil)
           node da-scan.cjs "🌊 Bleu cobalt"   (un seul preset)
   ============================================================ */
const fs = require("fs"), os = require("os"), path = require("path");
const puppeteer = require("puppeteer-core");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const html = fs.readFileSync("da-console.html", "utf8");
const mB = html.match(/var B=(\{[\s\S]*?\});/); let B; eval("B=" + mB[1]);
const only = process.argv[2];
const presetNames = only ? [only] : Object.keys(B.builtins);
const file = "file:///" + path.resolve("preview.html").split(path.sep).join("/");
const modes = [["jour", ""], ["nuit", "theme-dusk"], ["hiver", "theme-winter"], ["hiver-nuit", "theme-winter theme-dusk"], ["tropiques", "theme-tropic"], ["tropiques-nuit", "theme-tropic theme-dusk"]];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dascan-"));
(async () => {
  const b = await puppeteer.launch({ headless: "new", executablePath: CHROME, userDataDir: tmp, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await p.goto(file, { waitUntil: "networkidle2", timeout: 60000 });
  await p.evaluate(() => { var a = document.getElementById("appView"); if (a) { a.classList.remove("hidden"); a.style.display = ""; } var v = document.getElementById("authView"); if (v) v.classList.add("hidden"); });
  await p.evaluate(() => new Promise(r => setTimeout(r, 500)));
  const findings = await p.evaluate((presetNames, modes, builtins) => {
    // --- helpers couleur ---
    function parseColor(s) { s = String(s || "").trim(); if (!s) return null; var m = s.match(/rgba?\(([^)]+)\)/); if (m) { var p = m[1].split(",").map(x => parseFloat(x)); if (p.length >= 4 && p[3] === 0) return null; return [p[0], p[1], p[2], p[3] == null ? 1 : p[3]]; } if (s[0] === "#") { var h = s.slice(1); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; if (h.length >= 6) { var n = parseInt(h.slice(0, 6), 16); if (!isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]; } } return null; }
    function lum(c) { var a = [c[0], c[1], c[2]].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; }
    function ratio(a, b) { var L1 = lum(a), L2 = lum(b), hi = Math.max(L1, L2), lo = Math.min(L1, L2); return (hi + .05) / (lo + .05); }
    function hsl(c) { var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0, s = mx === 0 ? 0 : d / mx; if (d) { h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, mx]; }
    function hueDist(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
    function firstColor(s) { if (!s || s === "none") return null; var m = s.match(/rgba?\([^)]+\)/); return m ? parseColor(m[0]) : null; }
    function effBg(el) { var n = el; while (n && n.nodeType === 1) { var cs = getComputedStyle(n); if (cs.backgroundImage && cs.backgroundImage.indexOf("gradient") >= 0) return null; /* fond dégradé non échantillonnable → on s'abstient */ var c = parseColor(cs.backgroundColor); if (c && c[3] > .5) return c; n = n.parentElement; } return [255, 255, 255, 1]; }
    function sig(el) { return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && el.className.baseVal === undefined ? "." + String(el.className).trim().split(/\s+/).slice(0, 2).join(".") : ""); }
    var KEEP = [0, 14]; // teintes "danger" tolérées (rouge SOS) ± tol
    function isDangerHue(h) { return KEEP.some(k => hueDist(h, k) < 16); }
    function visible(el) { var r = el.getBoundingClientRect(); if (r.width < 6 || r.height < 6) return false; var cs = getComputedStyle(el); return cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > .1; }
    var out = [];
    presetNames.forEach(function (nm) {
      var preset = builtins[nm]; if (!preset) return;
      modes.forEach(function (md) {
        document.body.className = (md[1] + " sm-da-on").trim();
        window.SMDA.apply(preset);
        document.body.className = (md[1] + " sm-da-on").trim();
        window.SMDA.apply(preset); // double-apply (parité avec le live)
        void document.body.offsetWidth; // force un reflow → styles calculés stabilisés (anti faux positifs)
        var bodyCs = getComputedStyle(document.body);
        var accent = parseColor(bodyCs.getPropertyValue("--accent")) || [0, 0, 0, 1];
        var accH = hsl(accent)[0];
        // une couleur "DA" peut être l'accent OU un joyau (j1=--accent-2, j2=--accent-3) : les tuiles suivent les joyaux
        var daHues = [accH];
        var a2 = parseColor(bodyCs.getPropertyValue("--accent-2")); if (a2) daHues.push(hsl(a2)[0]);
        var a3 = parseColor(bodyCs.getPropertyValue("--accent-3")); if (a3) daHues.push(hsl(a3)[0]);
        function farDA(h) { return daHues.every(function (d) { return hueDist(h, d) > 55; }); }
        var els = [].slice.call(document.querySelectorAll("#appView *")).filter(visible).slice(0, 600);
        els.forEach(function (el) {
          if (el.closest && el.closest(".brand, .gold-hero, .leaflet-container, .leaflet-control, #goldPreviewBanner")) return; // logo/Premium/carte tierce = volontaire
          var cs = getComputedStyle(el);
          // 1) FOND saturé hors-DA (bg-color OU 1er stop d'un gradient)
          var bg = parseColor(cs.backgroundColor); if (!bg || bg[3] < .5) bg = firstColor(cs.backgroundImage);
          if (bg && bg[3] > .5) { var H = hsl(bg); if (H[1] > .42 && H[2] > .25 && farDA(H[0]) && !isDangerHue(H[0])) { out.push({ k: "fond-hors-DA", m: md[0], pr: nm, sel: sig(el), col: "rgb(" + bg.slice(0, 3).map(Math.round) + ")", h: Math.round(H[0]), accH: Math.round(accH) }); } }
          // 2) TEXTE : contraste AA + teinte hors-DA
          var t = (el.childElementCount === 0 && el.textContent.trim().length > 1);
          if (t) { var col = parseColor(cs.color); if (col) { var bgT = effBg(el); if (bgT) { var rt = ratio(col, bgT); if (rt < 4.5) out.push({ k: "contraste<4.5", m: md[0], pr: nm, sel: sig(el), col: "r=" + rt.toFixed(2) }); } var Ht = hsl(col); if (Ht[1] > .45 && farDA(Ht[0]) && !isDangerHue(Ht[0])) out.push({ k: "texte-hors-DA", m: md[0], pr: nm, sel: sig(el), col: "rgb(" + col.slice(0, 3).map(Math.round) + ")", h: Math.round(Ht[0]) }); } }
        });
      });
    });
    // dédup par (type+sélecteur+mode) ; garde 1 exemple
    var seen = {}, dedup = [];
    out.forEach(f => { var key = f.k + "|" + f.sel + "|" + f.m; if (!seen[key]) { seen[key] = 1; dedup.push(f); } });
    return dedup;
  }, presetNames, modes, B.builtins);
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
  // regroupe par cause (type+sélecteur)
  var byCause = {};
  findings.forEach(f => { var c = f.k + " · " + f.sel; (byCause[c] = byCause[c] || []).push((f.pr || "") + "/" + f.m + (f.col ? " " + f.col : "") + (f.h != null ? " h" + f.h + "≠acc" + f.accH : "")); });
  var causes = Object.keys(byCause).sort((a, b) => byCause[b].length - byCause[a].length);
  console.log("=== SCAN DA — " + presetNames.length + " preset(s) × " + modes.length + " modes ===");
  console.log("Anomalies distinctes :", findings.length, "| Causes :", causes.length);
  causes.forEach(c => console.log("\n• " + c + "  (" + byCause[c].length + "×)\n    ex: " + byCause[c].slice(0, 4).join(" | ")));
  if (!findings.length) console.log("\n✅ AUCUNE anomalie DA détectée.");
})().catch(e => { console.error("ERR", e.message); try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) { } process.exit(1); });
