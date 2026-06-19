// ============================================================================
// SunMates — Edge Function « suggest »
// Suggestions contextuelles selon le LIEU + l'heure + la météo, générées par l'IA (Claude).
//
// POURQUOI une Edge Function : la clé API doit vivre CÔTÉ SERVEUR. Si on appelait
// Claude depuis le front (app.html sur GitHub Pages), la clé serait visible par
// tout le monde dans le code source → fuite immédiate. Ici elle reste secrète.
//
// DÉPLOIEMENT (à faire par Maxime, une fois, dans un terminal) :
//   1) Installer la CLI Supabase : https://supabase.com/docs/guides/cli
//   2) supabase login
//   3) supabase link --project-ref <ref-de-ton-projet>
//   4) supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   (ta clé API Anthropic)
//   5) supabase functions deploy suggest
//
// Côté app, on l'appelle via le helper aiSuggest() (déjà dans app.html), qui retombe
// silencieusement sur des suggestions « règles » si la fonction n'est pas déployée.
// ============================================================================

import Anthropic from "npm:@anthropic-ai/sdk@0.70.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // Pré-vol CORS (le navigateur l'envoie avant le POST).
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const body = await req.json().catch(() => ({}));
    const { quartier, ville, heure, meteo, interets } = body || {};

    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return json({ error: "ANTHROPIC_API_KEY manquante (supabase secrets set)" }, 500);

    const client = new Anthropic({ apiKey: key });

    const system =
      "Tu es le copilote local de SunMates, une app pour rencontrer des gens EN VRAI dans son quartier. " +
      "Donne 3 idées d'activité TRÈS COURTES (max 8 mots chacune), concrètes et adaptées au lieu, à l'heure et à la météo, " +
      "qui donnent envie de sortir et de croiser du monde (amitié/aventure, JAMAIS de drague). Ton chaleureux, en français. " +
      "Réponds UNIQUEMENT par un objet JSON de la forme {\"suggestions\":[\"...\",\"...\",\"...\"]} et rien d'autre.";

    const user =
      `Lieu : ${quartier || "?"}, ${ville || "?"}. ` +
      `Heure locale : ${heure ?? "?"} h. ` +
      `Météo : ${meteo || "inconnue"}. ` +
      `Centres d'intérêt : ${(Array.isArray(interets) ? interets.join(", ") : "") || "variés"}.`;

    // Modèle Haiku : le plus rapide / le moins cher, parfait pour 3 phrases courtes.
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: user }],
    });

    // On lit le texte renvoyé puis on en extrait le JSON (robuste si le modèle ajoute du texte autour).
    const textBlock = msg.content.find((b: { type: string }) => b.type === "text") as
      | { type: "text"; text: string }
      | undefined;
    const raw = textBlock?.text || "{}";
    let suggestions: string[] = [];
    try {
      suggestions = (JSON.parse(raw).suggestions || []) as string[];
    } catch {
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) { try { suggestions = JSON.parse(m[0]); } catch { /* on laisse vide */ } }
    }

    return json({ suggestions: suggestions.slice(0, 3) });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
