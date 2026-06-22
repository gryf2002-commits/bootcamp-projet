// ============================================================
// SunMates — Edge Function "send-email" (Resend) — VERSION SÉCURISÉE
// ============================================================
// ⚠️ L'ancienne version acceptait { to, subject, html } arbitraires : n'importe qui
// pouvait envoyer des e-mails (phishing/spam) depuis ton domaine Resend → blacklist.
// Cette version :
//   1. exige un utilisateur CONNECTÉ (JWT vérifié via l'API Supabase Auth) ;
//   2. n'envoie QU'À l'adresse e-mail du compte connecté (jamais de `to` libre) ;
//   3. n'accepte que des TEMPLATES fixes définis ici (jamais de HTML libre) ;
//   4. restreint le CORS à l'origine de production.
//
// MISE EN PLACE (voir RESEND_SETUP.md) :
//   Secrets : RESEND_API_KEY, EMAIL_FROM. Déploiement : supabase functions deploy send-email
//   Laisse "Verify JWT" ACTIVÉ pour cette fonction (réglage par défaut).
//
// APPEL DEPUIS LE FRONT (utilisateur connecté) :
//   const { data, error } = await db.functions.invoke("send-email", {
//     body: { template: "welcome" }   // ou tout autre clé de TEMPLATES
//   });
// ------------------------------------------------------------

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "SunMates <onboarding@resend.dev>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
// Prod = sunmatesapp.com (CNAME). Si tu sers AUSSI depuis github.io, passe à une allowlist.
const ALLOWED_ORIGIN = "https://sunmatesapp.com";

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Seuls ces templates peuvent partir. Jamais de HTML fourni par le client.
const TEMPLATES: Record<string, { subject: string; html: (name: string) => string }> = {
  welcome: {
    subject: "Bienvenue sur SunMates ☀️",
    html: (name) => `<div style="font-family:sans-serif"><h2>Bienvenue ${name} !</h2>
      <p>Ton compte SunMates est prêt. Pars solo, trouve ta bande — en sécurité.</p></div>`,
  },
  // Ajoute ici d'autres templates au besoin (toujours du HTML défini CÔTÉ SERVEUR).
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (!RESEND_API_KEY) {
      return json({ ok: false, error: "RESEND_API_KEY manquant (configure les secrets)." }, 500);
    }
    // 1) Authentification : on vérifie le JWT auprès de Supabase Auth.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ ok: false, error: "Non autorisé." }, 401);
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: ANON_KEY },
    });
    if (!userRes.ok) return json({ ok: false, error: "Session invalide." }, 401);
    const user = await userRes.json();
    const email = user?.email;
    if (!email) return json({ ok: false, error: "Compte sans e-mail." }, 400);

    // 2) Template fixe uniquement, destinataire = l'utilisateur lui-même.
    const { template, name } = await req.json();
    const t = TEMPLATES[String(template ?? "")];
    if (!t) return json({ ok: false, error: "Template inconnu." }, 400);
    const safeName = String(name ?? "voyageur").replace(/[<>&"']/g, "").slice(0, 40);

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to: email, subject: t.subject, html: t.html(safeName) }),
    });
    const data = await r.json();
    if (!r.ok) return json({ ok: false, error: data?.message || "Échec d'envoi." }, 502);
    return json({ ok: true, id: data?.id });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
