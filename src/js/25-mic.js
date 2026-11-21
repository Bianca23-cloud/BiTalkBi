/* =====================================================================
   25 · MICROPHONE : reconnaissance de la parole dans N'IMPORTE QUELLE des 15 langues
   • Android (appli)      : reconnaissance vocale du téléphone (extension Capacitor « speech-recognition »).
   • iPhone, Chrome, Edge : reconnaissance vocale du navigateur (Web Speech API).
   • Windows 11 (appli)   : Windows ne fournit pas ce service aux applis Electron →
                            enregistrement + transcription IA (clé Gemini/OpenAI), sinon saisie vocale Windows (⊞ Win + H).
   • Secours (BiTalkBi)   : si la reconnaissance du navigateur est bloquée (iPhone « écran d'accueil », Firefox…),
                            enregistrement WAV 16 kHz → transcription Gemini ou Whisper.
   ===================================================================== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const Mic = {
  /** Quel micro est disponible ici ? "android" | "web" | "desktop" | "none" */
  webBroken: false,
  kind(){
    if (capPlugin("SpeechRecognition")) return "android";
    const rec = navigator.mediaDevices && window.MediaRecorder && AI.canTranscribe();
    if (IS_DESKTOP) return rec ? "record" : "desktop";
    if (SR && !Mic.webBroken) return "web";
    if (rec) return "record";
    return SR ? "web" : "none";
  },
  /** Le micro peut-il être utilisé maintenant (pour les exercices « Parler ») ? */
  ready(){ const k = Mic.kind(); return k === "android" || k === "record" || (k === "web" && navigator.onLine); },
  /** Écoute l'utilisateur dans la langue l. Renvoie une promesse : liste des phrases entendues (la plus probable d'abord). */
  async listen(l){
    const tag = LANGS[l].tts, kind = Mic.kind();
    if (kind === "android"){
      const P = capPlugin("SpeechRecognition");
      const perm = await P.requestPermissions().catch(() => ({}));
      if (perm && perm.speechRecognition === "denied") throw Object.assign(new Error("not-allowed"), { code: "not-allowed" });
      const r = await P.start({ language: tag, maxResults: 3, prompt: LANGS[l].native, partialResults: false, popup: true });
      return (r && r.matches) || [];
    }
    if (kind === "web"){
      return new Promise((ok, ko) => {
        const r = new SR(); r.lang = tag; r.interimResults = false; r.maxAlternatives = 3; r.continuous = false;
        let done = false;
        r.onresult = e => { done = true; ok([...e.results[0]].map(a => a.transcript)); };
        r.onerror = e => { done = true;
          if (["service-not-allowed", "network", "language-not-supported"].includes(e.error) && navigator.mediaDevices && window.MediaRecorder && AI.canTranscribe()){
            Mic.webBroken = true; ko(Object.assign(new Error("switch"), { code: "switch" })); return; }
          ko(Object.assign(new Error(e.error || "error"), { code: e.error || "error" })); };
        r.onend = () => { if (!done) ko(Object.assign(new Error("no-speech"), { code: "no-speech" })); };
        try { r.start(); } catch (e) { ko(Object.assign(e, { code: "start" })); }
        Mic.current = r;
      });
    }
    if (kind === "record") return [await Mic.record(l)];
    throw Object.assign(new Error(kind), { code: kind });
  },
  /** Enregistre la voix (arrêt auto après 1,6 s de silence, 15 s max) puis la fait transcrire par l'IA. */
  async record(l){
    const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const type = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(st, type ? { mimeType: type } : undefined), parts = [];
    rec.ondataavailable = e => e.data && e.data.size && parts.push(e.data);
    const AC = window.AudioContext || window.webkitAudioContext; let ac = null, raf = 0;
    const end = new Promise(ok => rec.onstop = ok);
    const stop = () => { cancelAnimationFrame(raf); try { if (rec.state !== "inactive") rec.stop(); } catch (e) {} };
    Mic.current = { stop };
    try { ac = new AC(); await ac.resume(); const an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(st).connect(an);
      const b = new Float32Array(1024), t0 = Date.now(); let spoke = false, q = 0;
      const tick = () => { an.getFloatTimeDomainData(b); let s = 0; for (const v of b) s += v * v; s = Math.sqrt(s / b.length);
        if (s > 0.02){ spoke = true; q = 0; } else if (spoke){ q = q || Date.now(); if (Date.now() - q > 1600) return stop(); }
        if (Date.now() - t0 > 15000) return stop(); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    } catch (e) { setTimeout(stop, 8000); }
    rec.start(250); await end;
    st.getTracks().forEach(t => t.stop()); if (ac) ac.close().catch(() => {});
    const blob = new Blob(parts, { type: rec.mimeType || type || "audio/webm" });
    if (blob.size < 1200) throw Object.assign(new Error("no-speech"), { code: "no-speech" });
    return AI.transcribe(await toWav16k(blob), l);
  },
  stop(){ try { if (Mic.current) Mic.current.stop(); } catch (e) {} const P = capPlugin("SpeechRecognition"); if (P) P.stop().catch(() => {}); },
  /** Message clair selon l'erreur. */
  explain(code){
    const t = T();
    if (code === "desktop") return t.micDesktop;
    if (code === "switch") return X().micSwitch;
    if (code === "no-stt") return X().micNoStt;
    if (code === "not-allowed" || code === "service-not-allowed") return t.micDenied;
    if (code === "network") return t.micNetwork;
    if (code === "no-speech" || code === "aborted") return t.micNothing;
    if (code === "language-not-supported") return t.micLang;
    return t.noMic;
  }
};
