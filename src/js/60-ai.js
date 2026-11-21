/* =====================================================================
   60 · INTELLIGENCE ARTIFICIELLE — gratuite, avec ou sans internet
   Moteurs possibles (Profil → Tuteur IA) :
   • "bibi"    : Bibi hors ligne — tuteur intégré qui s'appuie sur les 218 phrases × 15 langues.
                 Marche partout, sans internet, sans téléchargement.
   • "webllm"  : IA DANS l'appli (WebLLM + WebGPU). Le modèle est téléchargé UNE fois
                 (≈ 400 Mo à 1 Go), puis tout fonctionne en mode avion.
   • "local"   : IA d'une autre appli de l'appareil qui propose un « serveur local compatible OpenAI »
                 (Jan, Ollama, LM Studio sur ordinateur ; toute appli mobile qui offre cette option).
   • "nano"    : IA intégrée à Google Chrome sur ordinateur (Gemini Nano), hors ligne après téléchargement.
   • "free"    : IA gratuite en ligne SANS clé (Pollinations) — demande internet.
   • "gemini" / "openai" / "anthropic" : votre propre clé (Gemini a une offre gratuite).
   "auto" choisit : WebLLM prêt > serveur local joignable > Chrome Nano > (en ligne) IA gratuite > Bibi.
   ===================================================================== */
/** Textes de l'interface du tuteur (i18n4.js), avec repli sur le français. */
const X = () => Object.assign({}, TX.fr, TX[S.ui] || {});

const AI_DEF = {
  prov: "auto",
  keys: { gemini: "", openai: "", anthropic: "" },
  models: { gemini: "gemini-2.5-flash", openai: "gpt-4o-mini", anthropic: "claude-haiku-4-5", free: "openai" },
  local: { url: "http://127.0.0.1:11434/v1", model: "llama3.2", key: "" },
  web: { model: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", ready: false }
};
S.ai = Object.assign({}, AI_DEF, S.ai || {});
["keys", "models", "local", "web"].forEach(k => S.ai[k] = Object.assign({}, AI_DEF[k], S.ai[k] || {}));
S.notes = S.notes || [];          // carnet : corrections et mots notés pendant les conversations
S.talks = S.talks || [];          // historique des conversations avec le tuteur
S.aiOk = S.aiOk || false;         // consentement donné avant le premier envoi à une IA en ligne

/** Modèles WebLLM proposés (multilingues, du plus léger au plus fin). */
const WEB_MODELS = [
  ["Qwen2.5-0.5B-Instruct-q4f16_1-MLC", "Qwen 2.5 · 0,5 B (≈ 400 Mo, téléphones)"],
  ["Qwen2.5-1.5B-Instruct-q4f16_1-MLC", "Qwen 2.5 · 1,5 B (≈ 1 Go, recommandé)"],
  ["Llama-3.2-1B-Instruct-q4f16_1-MLC", "Llama 3.2 · 1 B (≈ 900 Mo)"],
  ["gemma-2-2b-it-q4f16_1-MLC", "Gemma 2 · 2 B (≈ 1,5 Go, ordinateurs)"]
];
const CLOUD = { free: 1, gemini: 1, openai: 1, anthropic: 1 };

const AI = {
  engine: null,                    // moteur WebLLM chargé
  nanoSession: null,
  lastProv: "bibi",
  hasWebGPU: () => !!navigator.gpu,
  hasNano: () => typeof window.LanguageModel !== "undefined",

  /** Quel moteur sera utilisé maintenant ? (renvoie un identifiant) */
  async pick(){
    const p = S.ai.prov;
    if (p !== "auto") return p;
    if (AI.engine || (S.ai.web.ready && AI.hasWebGPU())) return "webllm";
    if (await AI.localUp()) return "local";
    if (AI.hasNano()){ try { if (await LanguageModel.availability() === "available") return "nano"; } catch (e) {} }
    if (navigator.onLine) return "free";
    return "bibi";
  },
  /** Le serveur local répond-il ? (1,2 s max) */
  async localUp(){
    try { const c = new AbortController(); setTimeout(() => c.abort(), 1200);
      const r = await fetch(S.ai.local.url.replace(/\/$/, "") + "/models", { signal: c.signal, headers: AI.localHeaders() }); return r.ok; }
    catch (e) { return false; }
  },
  localHeaders(){ const h = { "content-type": "application/json" }; if (S.ai.local.key) h.authorization = "Bearer " + S.ai.local.key; return h; },

  /** Charge (ou télécharge la 1re fois) le modèle WebLLM. onProgress(texte, 0..1) */
  async loadWeb(onProgress){
    if (AI.engine) return AI.engine;
    if (!AI.hasWebGPU()) throw new Error(X().noGpu);
    let lib;
    try { lib = await import("./vendor/web-llm.js"); }                       // copie intégrée (fabriquée par GitHub Actions)
    catch (e) { lib = await import("https://esm.run/@mlc-ai/web-llm"); }       // secours : en ligne
    const appConfig = Object.assign({}, lib.prebuiltAppConfig, { useIndexedDBCache: true }); // IndexedDB : marche aussi dans l'appli Windows
    AI.engine = await lib.CreateMLCEngine(S.ai.web.model, { appConfig, initProgressCallback: r => onProgress && onProgress(r.text, r.progress || 0) });
    S.ai.web.ready = true; save();
    return AI.engine;
  },

  /** Envoie une conversation à l'IA. msgs = [{role:"user"|"assistant", content}] ; image = base64 JPEG (facultatif). */
  async chat(system, msgs, image){
    const prov = await AI.pick(); AI.lastProv = prov;
    if (prov === "bibi") throw Object.assign(new Error("bibi"), { code: "bibi" });
    if (CLOUD[prov] && !S.aiOk) throw Object.assign(new Error("consent"), { code: "consent" });
    if (image && !["gemini", "openai", "anthropic", "free"].includes(prov)) throw new Error(X().noVision);
    const all = [{ role: "system", content: system }].concat(msgs);
    if (prov === "webllm"){
      const eng = await AI.loadWeb();
      const r = await eng.chat.completions.create({ messages: all, max_tokens: 400, temperature: 0.7 });
      return r.choices[0].message.content.trim();
    }
    if (prov === "nano"){
      if (!AI.nanoSession) AI.nanoSession = await LanguageModel.create({ initialPrompts: [{ role: "system", content: system }] });
      const last = msgs[msgs.length - 1];
      return (await AI.nanoSession.prompt(last.content)).trim();
    }
    if (prov === "local"){
      return AI.openaiLike(S.ai.local.url.replace(/\/$/, "") + "/chat/completions", AI.localHeaders(), S.ai.local.model, all);
    }
    if (prov === "free") return AI.free(all, image);
    const key = S.ai.keys[prov], model = S.ai.models[prov];
    if (!key) throw new Error(X().needKey);
    if (prov === "openai"){
      const m = image ? withImageOpenAI(all, image) : all;
      return AI.openaiLike("https://api.openai.com/v1/chat/completions", { "content-type": "application/json", authorization: "Bearer " + key }, model, m);
    }
    if (prov === "gemini"){
      const contents = msgs.map((x, i) => ({ role: x.role === "assistant" ? "model" : "user",
        parts: (image && i === msgs.length - 1) ? [{ inline_data: { mime_type: "image/jpeg", data: image } }, { text: x.content }] : [{ text: x.content }] }));
      const d = await postJson("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
        { "content-type": "application/json", "x-goog-api-key": key },
        { system_instruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 600 } });
      return ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || []).map(p => p.text || "").join("").trim();
    }
    if (prov === "anthropic"){
      const m = msgs.map((x, i) => ({ role: x.role, content: (image && i === msgs.length - 1)
        ? [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } }, { type: "text", text: x.content }] : x.content }));
      const d = await postJson("https://api.anthropic.com/v1/messages",
        { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        { model, max_tokens: 600, system, messages: m });
      return (d.content || []).map(c => c.text || "").join("").trim();
    }
    throw new Error("?");
  },
  async openaiLike(url, headers, model, messages){
    const d = await postJson(url, headers, { model, messages, max_tokens: 600, temperature: 0.7 });
    return ((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "").trim();
  },
  /** IA gratuite sans clé (Pollinations). Limitée (≈ 1 demande toutes les 15 s) : on réessaie une fois. */
  async free(messages, image){
    const m = image ? withImageOpenAI(messages, image) : messages;
    for (let attempt = 0; attempt < 2; attempt++){
      try { return await AI.openaiLike("https://text.pollinations.ai/openai", { "content-type": "application/json" }, S.ai.models.free, m); }
      catch (e) {
        if (attempt === 0 && /429|busy|503/.test(e.message)){ toast(X().freeWait); await new Promise(r => setTimeout(r, 15000)); continue; }
        // secours : forme simple GET
        const sys = messages[0].content, last = messages[messages.length - 1].content;
        const hist = messages.slice(1, -1).slice(-6).map(x => (x.role === "user" ? "Learner: " : "Tutor: ") + x.content).join("\n");
        const r = await fetchT("https://text.pollinations.ai/" + encodeURIComponent((hist ? hist + "\n" : "") + "Learner: " + last) + "?model=openai&system=" + encodeURIComponent(sys), {}, 30000);
        if (!r.ok) throw new Error("HTTP " + r.status);
        return (await r.text()).trim();
      }
    }
  },
  /** Transcription de la voix (micro « enregistrement ») : Gemini ou OpenAI (clé) ; sinon erreur. */
  async transcribe(wav, l){
    const prov = S.ai.keys.gemini ? "gemini" : S.ai.keys.openai ? "openai" : "";
    if (prov === "openai"){
      const fd = new FormData(); fd.append("file", wav, "voice.wav"); fd.append("model", "whisper-1"); fd.append("language", LANGS[l].tts.split("-")[0]);
      const r = await fetchT("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { authorization: "Bearer " + S.ai.keys.openai }, body: fd }, 30000);
      const d = await r.json(); if (!r.ok) throw apiError(r.status, d); return d.text || "";
    }
    if (prov === "gemini"){
      const b64 = await blobB64(wav);
      const d = await postJson("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(S.ai.models.gemini) + ":generateContent",
        { "content-type": "application/json", "x-goog-api-key": S.ai.keys.gemini },
        { contents: [{ role: "user", parts: [{ inline_data: { mime_type: "audio/wav", data: b64 } }, { text: "Transcribe exactly what is said, in " + LANGS[l].native + " (" + LANGS[l].tts + "). Output only the transcription." }] }] });
      return ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || []).map(p => p.text || "").join("").trim();
    }
    throw Object.assign(new Error("no-stt"), { code: "no-stt" });
  },
  canTranscribe: () => !!(S.ai.keys.gemini || S.ai.keys.openai) && navigator.onLine
};

function withImageOpenAI(messages, image){
  return messages.map((x, i) => i === messages.length - 1
    ? { role: x.role, content: [{ type: "text", text: x.content }, { type: "image_url", image_url: { url: "data:image/jpeg;base64," + image } }] } : x);
}
async function fetchT(url, opt, ms){
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms || 45000);
  try { return await fetch(url, Object.assign({ signal: c.signal }, opt)); } finally { clearTimeout(t); }
}
async function postJson(url, headers, body){
  const r = await fetchT(url, { method: "POST", headers, body: JSON.stringify(body) }, 60000);
  let d = {}; try { d = await r.json(); } catch (e) {}
  if (!r.ok) throw apiError(r.status, d);
  return d;
}
function apiError(status, d){
  const x = X();
  if (status === 401 || status === 403) return new Error(x.badKey + " (" + status + ")");
  if (status === 429) return new Error("429 " + x.busy);
  return new Error("HTTP " + status + " " + ((d && d.error && (d.error.message || d.error)) || ""));
}
const blobB64 = b => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.readAsDataURL(b); });
/** Message d'erreur compréhensible. */
function aiFriendly(e){
  const x = X(), m = (e && e.message) || String(e);
  if (/Failed to fetch|NetworkError|aborted|Load failed/i.test(m)) return navigator.onLine ? x.unreach : x.offlineAi;
  return m;
}

/* Conversion audio → WAV mono 16 kHz (accepté par Whisper et Gemini, quel que soit l'appareil) */
async function toWav16k(blob){
  const AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
  const buf = await blob.arrayBuffer();
  const audio = await new Promise((ok, ko) => { const p = ac.decodeAudioData(buf, ok, ko); if (p && p.then) p.then(ok, ko); });
  try { ac.close(); } catch (e) {}
  const src = audio.getChannelData(0), ratio = audio.sampleRate / 16000, n = Math.floor(src.length / ratio);
  const v = new DataView(new ArrayBuffer(44 + n * 2)), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++){ const s = Math.max(-1, Math.min(1, src[Math.floor(i * ratio)])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
  return new Blob([v], { type: "audio/wav" });
}
