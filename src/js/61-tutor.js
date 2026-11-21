/* =====================================================================
   61 · TUTEUR (fusion BiaTalk) : chat, appel, jeux de rôle, personnages, débat, photo,
        cours express, « explique-moi », Bibi hors ligne, carnet de corrections.
   La langue apprise = S.target ; les explications et corrections = S.source (langue de départ).
   ===================================================================== */
const nat = l => LANGS[l].native + " (" + LANGS[l].tts + ")";
const lvlId = () => LEVELS[levelIdx(S.target)].id;
const provName = p => ({ bibi: X().pBibi, webllm: X().pWeb, local: X().pLocal, nano: X().pNano, free: X().pFree, gemini: X().pGemini, openai: X().pOpenai, anthropic: X().pAnthropic, auto: X().pAuto })[p] || p;

/** Consignes données à l'IA. Courtes : elles doivent aussi marcher avec les petits modèles hors ligne. */
function tutorPrompt(mode, ctx){
  const t = nat(S.target), s = nat(S.source);
  let role = "You are Bibi, a warm and patient language tutor.";
  if (mode === "role") role = ctx.p + " This is a role-play with a language learner.";
  if (mode === "char") role = ctx.p + " You are talking with a language learner.";
  if (mode === "debate") role = "You are a polite debate partner. Motion: \"" + ctx.motion + "\". The learner argues " + (ctx.side === "pro" ? "FOR" : "AGAINST") + " it; you defend the other side, one argument at a time.";
  if (mode === "photo") role = "You are a tutor. Describe the learner's photo simply, then ask questions about it.";
  if (mode === "call") role += " This is a spoken phone call: be very brief and natural.";
  return role + "\nRules:\n- Reply ONLY in " + t + ", at CEFR level " + lvlId() + ", in 1 to 3 short sentences, and end with a question.\n" +
    "- If the learner's last message has mistakes, add ONE last line starting with § then the corrected sentence and a very short explanation in " + s + ".\n" +
    "- No lists, no markdown. Be kind and encouraging.";
}
const splitCorr = txt => { const i = txt.indexOf("§"); return i < 0 ? { t: txt.trim(), c: "" } : { t: txt.slice(0, i).trim(), c: txt.slice(i + 1).trim() }; };
const engBadge = p => `<span class="pill eng" title="${esc(X().using)}">${p === "bibi" || p === "webllm" || p === "local" || p === "nano" ? "📴 " : "🌐 "}${esc(provName(p))}</span>`;

/** Fenêtre de consentement avant le 1er envoi à une IA en ligne (RGPD + AI Act art. 50). */
function askConsent(){
  return new Promise(ok => {
    const x = X(), d = document.createElement("div"); d.className = "modal"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-labelledby", "cT");
    d.innerHTML = `<div class="card"><h2 id="cT">🤖 ${esc(x.consentT)}</h2><p>${esc(x.consentP)}</p>
      <p><a href="#" id="cL">${esc(x.legal)}</a></p><div class="row"><button class="btn" id="cY">${esc(x.accept)}</button><button class="btn alt" id="cN">${esc(x.refuse)}</button></div></div>`;
    document.body.appendChild(d); d.querySelector("#cY").focus();
    d.querySelector("#cY").onclick = () => { S.aiOk = true; S.aiOkDate = new Date().toISOString(); save(); d.remove(); ok(true); };
    d.querySelector("#cN").onclick = () => { S.ai.prov = "bibi"; save(); d.remove(); ok(false); };
    d.querySelector("#cL").onclick = e => { e.preventDefault(); d.remove(); ok(false); go("legal"); };
  });
}
/** Appel à l'IA avec gestion du consentement et du repli vers Bibi. Renvoie le texte, ou null (→ Bibi). */
async function askAI(system, msgs, image){
  for (let k = 0; k < 2; k++){
    try { return await AI.chat(system, msgs, image); }
    catch (e) {
      if (e.code === "consent"){ if (await askConsent()) continue; return null; }
      if (e.code === "bibi") return null;
      throw e;
    }
  }
  return null;
}

/* ---------- Menu du tuteur ---------- */
VIEWS.tutor = async function(m){
  const x = X();
  const modes = [["chat","💬",x.mChat,x.dChat],["call","📞",x.mCall,x.dCall],["role","🎭",x.mRole,x.dRole],["char","🧑‍🎨",x.mChar,x.dChar],
    ["debate","⚖️",x.mDebate,x.dDebate],["photo","📷",x.mPhoto,x.dPhoto],["course","📚",x.mCourse,x.dCourse],["explain","💡",x.mExplain,x.dExplain],
    ["bibi","🦉",x.mBibi,x.dBibi],["notes","📒",x.mNotes,x.dNotes + " (" + S.notes.length + ")"]];
  m.innerHTML = `<h1>🧑‍🏫 ${esc(x.tutorTitle)}</h1>
  <section class="card"><div class="row"><span>${esc(x.engineNow)} :</span><span id="engNow">…</span><button class="btn alt" id="aiSet">⚙️ ${esc(x.engine)}</button></div></section>
  <div class="grid">${modes.map(([id, ic, n, d]) => `<button class="tile" data-m="${id}"><span class="ic" aria-hidden="true">${ic}</span><b>${esc(n)}</b><small>${esc(d)}</small></button>`).join("")}</div>
  ${S.talks.length ? `<section class="card" style="margin-top:14px"><h2>🗂️ ${esc(x.history)}</h2><ul class="plain">${S.talks.slice(0, 8).map((h, i) => `<li><a href="#" data-h="${i}">${esc(h.title)} · ${esc(langLabel(h.l))}</a> <small>${new Date(h.d).toLocaleDateString()}</small></li>`).join("")}</ul></section>` : ""}
  <p class="rom"><a href="#" id="lg">${esc(x.legal)}</a></p>`;
  $("#aiSet").onclick = () => go("aiset");
  $("#lg").onclick = e => { e.preventDefault(); go("legal"); };
  $$("[data-m]").forEach(b => b.onclick = () => {
    const id = b.dataset.m;
    if (["chat", "call", "course", "explain", "bibi", "notes", "photo"].includes(id)) go(id === "chat" ? "talk" : id === "call" ? "tcall" : id, { mode: id });
    else go("tpick", id);
  });
  $$("[data-h]").forEach(a => a.onclick = e => { e.preventDefault(); go("thist", +a.dataset.h); });
  AI.pick().then(p => { const e = $("#engNow"); if (e) e.innerHTML = engBadge(p); });
};

/* ---------- Choix d'un jeu de rôle, d'un personnage ou d'un sujet de débat ---------- */
VIEWS.tpick = function(m, kind){
  const x = X(), ui = S.ui;
  if (kind === "role") m.innerHTML = `<h1>🎭 ${esc(x.mRole)}</h1><div class="grid">${ROLEPLAYS.map(([ic, id], i) => `<button class="tile" data-i="${i}"><span class="ic" aria-hidden="true">${ic}</span><b>${esc(ROLE_NAMES[id][ui] || ROLE_NAMES[id].fr)}</b></button>`).join("")}</div>`;
  if (kind === "char") m.innerHTML = `<h1>🧑‍🎨 ${esc(x.mChar)}</h1><p class="rom">${esc(x.dChar)}</p><div class="grid">${CHARACTERS.map(([ic, n], i) => `<button class="tile" data-i="${i}"><span class="ic" aria-hidden="true">${ic}</span><b>${esc(n)}</b></button>`).join("")}</div>`;
  if (kind === "debate"){
    const list = DEBATES[ui] || DEBATES.fr;
    m.innerHTML = `<h1>⚖️ ${esc(x.mDebate)}</h1><section class="card"><label for="mo">${esc(x.motion)}</label><select id="mo" style="width:100%">${list.map(d => `<option>${esc(d)}</option>`).join("")}</select>
    <label for="sd" style="display:block;margin-top:10px">${esc(x.side)}</label><select id="sd"><option value="pro">${esc(x.pro)}</option><option value="con">${esc(x.con)}</option></select>
    <div class="row" style="margin-top:12px"><button class="btn" id="go">${esc(x.go)}</button></div></section>`;
    $("#go").onclick = () => go("talk", { mode: "debate", ctx: { motion: $("#mo").value, side: $("#sd").value }, title: "⚖️ " + $("#mo").value });
    return;
  }
  $$("[data-i]").forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    if (kind === "role"){ const r = ROLEPLAYS[i]; go("talk", { mode: "role", ctx: { p: r[2] }, title: r[0] + " " + (ROLE_NAMES[r[1]][ui] || ROLE_NAMES[r[1]].fr) }); }
    else { const c = CHARACTERS[i]; go("talk", { mode: "char", ctx: { p: c[2] }, title: c[0] + " " + c[1] }); }
  });
};

/* ---------- Conversation écrite / orale avec l'IA ---------- */
VIEWS.talk = function(m, arg){
  arg = arg || { mode: "chat" };
  const x = X(), mode = arg.mode === "chat" ? "chat" : arg.mode;
  const conv = { title: arg.title || "💬 " + x.mChat, l: S.target, d: Date.now(), msgs: [] };
  const sys = tutorPrompt(mode, arg.ctx || {});
  m.innerHTML = `<h1>${esc(conv.title)}</h1><div id="eng" class="rom"></div>
   <div class="chat" id="chat" role="log" aria-live="polite"></div>
   <div class="composer"><button class="btn alt mic" id="mic" aria-label="${esc(T().speakBtn)}">🎤</button>
   <textarea id="msg" rows="1" lang="${LANGS[S.target].tts}" placeholder="${esc(x.write)}" aria-label="${esc(x.write)}"></textarea>
   <button class="btn" id="snd" aria-label="${esc(x.send)}">➤</button></div>`;
  const chat = $("#chat"), ta = $("#msg");
  function bubble(role, text, corr){
    const b = document.createElement("div"); b.className = "msg " + role;
    if (role === "ai"){ b.lang = LANGS[S.target].tts; b.dir = "auto"; }
    b.innerHTML = `<span>${esc(text)}</span>` + (role === "ai" ? `<div class="tools"><button data-a="l">🔊 ${esc(x.listenB)}</button><button data-a="s">🐢 ${esc(x.slow)}</button><button data-a="t">🌐 ${esc(x.transl)}</button></div>` : "")
      + (corr ? `<div class="corr" lang="${LANGS[S.source].tts}">✏️ ${esc(corr)} <button data-a="n">📒 ${esc(x.save)}</button></div>` : "");
    b.querySelectorAll("[data-a]").forEach(btn => btn.onclick = async () => {
      const a = btn.dataset.a;
      if (a === "l") speak(text, S.target); if (a === "s") speak(text, S.target, 0.65);
      if (a === "n"){ S.notes.unshift({ l: S.target, t: corr, d: Date.now() }); save(); toast(x.saved); btn.disabled = true; }
      if (a === "t"){ btn.disabled = true;
        try { let tr = null;
          if (navigator.onLine){ try { tr = (await onlineTranslate(text, S.target, S.source)).t; } catch (e) {} }   // traduction gratuite en ligne
          if (!tr){ try { tr = await askAI("Translate the user's text into " + nat(S.source) + ". Output only the translation.", [{ role: "user", content: text }]); } catch (e) {} }  // sinon IA (hors ligne possible)
          if (tr) b.insertAdjacentHTML("beforeend", `<div class="trans" lang="${LANGS[S.source].tts}">${esc(tr)}</div>`); else toast(x.offlineAi);
        } catch (e) { toast(aiFriendly(e)); btn.disabled = false; } }
    });
    chat.appendChild(b); b.scrollIntoView({ block: "end", behavior: "smooth" });
  }
  async function aiTurn(image){
    const w = document.createElement("div"); w.className = "msg ai typing"; w.textContent = x.thinking; chat.appendChild(w);
    try {
      const msgs = conv.msgs.length ? conv.msgs.map(z => ({ role: z.role, content: z.content })) : [{ role: "user", content: "Start: greet me and ask a first simple question." + (image ? " Describe the photo." : "") }];
      const raw = await askAI(sys, msgs, image);
      w.remove();
      if (raw === null){ toast(x.bibiFallback); go("bibi"); return; }
      const o = splitCorr(raw);
      conv.msgs.push({ role: "assistant", content: o.t }); bubble("ai", o.t, o.c); keep();
      $("#eng").innerHTML = engBadge(AI.lastProv);
      speak(o.t, S.target);
    } catch (e) { w.remove(); chat.insertAdjacentHTML("beforeend", `<div class="notice" role="alert">⚠️ ${esc(aiFriendly(e))}</div>`); }
  }
  function keep(){ if (!S.talks.includes(conv)){ S.talks.unshift(conv); S.talks = S.talks.slice(0, 40); } save(); }
  async function submit(txt){
    txt = (txt || ta.value).trim(); if (!txt) return; ta.value = "";
    conv.msgs.push({ role: "user", content: txt }); bubble("me", txt); addXp(5);
    await aiTurn();
  }
  $("#snd").onclick = () => submit();
  ta.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); submit(); } };
  micButton($("#mic"), ta, submit);
  aiTurn(arg.image);
};

/** Bouton micro commun : écoute dans la langue apprise, affiche l'état, explique les erreurs. */
function micButton(btn, ta, onText){
  btn.onclick = async () => {
    if (btn.classList.contains("on")){ Mic.stop(); return; }
    const k = Mic.kind();
    if (k === "desktop" || k === "none"){ toast(Mic.explain(k)); if (ta) ta.focus(); return; }
    btn.classList.add("on"); btn.textContent = "⏹"; btn.setAttribute("aria-label", "Stop");
    try { const list = await Mic.listen(S.target); if (list && list[0]){ if (ta) ta.value = list[0]; onText(list[0]); } else toast(Mic.explain("no-speech")); }
    catch (e) { toast(Mic.explain(e.code || e.message)); }
    finally { btn.classList.remove("on"); btn.textContent = "🎤"; btn.setAttribute("aria-label", T().speakBtn); }
  };
}

/* ---------- Appel vocal ---------- */
VIEWS.tcall = function(m){
  const x = X(), conv = { title: "📞 " + x.mCall, l: S.target, d: Date.now(), msgs: [] }, sys = tutorPrompt("call", {});
  m.innerHTML = `<h1>📞 ${esc(x.mCall)} · ${esc(langLabel(S.target))}</h1><section class="card call"><div class="avatar" id="av">${BIBI}</div>
   <p id="st" aria-live="assertive">${esc(x.startCall)}</p><p class="rom" id="said" lang="${LANGS[S.target].tts}"></p>
   <button class="btn big" id="tk">${esc(x.startCall)}</button></section>`;
  const st = $("#st"), said = $("#said"), tk = $("#tk");
  async function reply(){
    st.textContent = x.thinking;
    try {
      const raw = await askAI(sys, conv.msgs.length ? conv.msgs : [{ role: "user", content: "Start the call: greet me." }]);
      if (raw === null){ toast(x.bibiFallback); go("bibi"); return; }
      const o = splitCorr(raw); conv.msgs.push({ role: "assistant", content: o.t });
      said.textContent = "🦉 " + o.t; $("#av").classList.add("talk"); speak(o.t, S.target);
      setTimeout(() => { const a = $("#av"); if (a) a.classList.remove("talk"); }, 2500);
      st.textContent = x.yourTurn; if (!S.talks.includes(conv)) S.talks.unshift(conv); save();
    } catch (e) { st.textContent = "⚠️ " + aiFriendly(e); }
  }
  tk.onclick = async () => {   // 1er appui = geste utilisateur (exigé par iPhone pour le son)
    tk.textContent = x.talk; tk.onclick = null; await reply();
    micButton(tk, null, async t => { conv.msgs.push({ role: "user", content: t }); said.textContent = "🙂 " + t; addXp(6); await reply(); });
  };
};

/* ---------- Bibi hors ligne : conversation guidée avec les phrases du cours (aucun réseau) ---------- */
VIEWS.bibi = function(m, arg){
  const x = X();
  if (!arg || !arg.theme){
    const lv = lvlId(), ths = themesOfLevel(lv).concat(THEMES.filter(t => levelOfTheme(t) !== lv)).slice(0, 18);
    m.innerHTML = `<h1>🦉 ${esc(x.mBibi)}</h1><section class="card hero">${BIBI}<p>${esc(x.bibiIntro)}</p></section><h2>${esc(x.pickTheme)}</h2>
    <div class="grid"><button class="tile" data-t="*"><span class="ic" aria-hidden="true">🔁</span><b>${esc(T().review)}</b><small>${dueList().length} ${esc(T().due)}</small></button>
    ${ths.map(t => `<button class="tile" data-t="${t.id}"><span class="ic" aria-hidden="true">${t.icon}</span><b>${esc(themeName(t))}</b><small>${levelOfTheme(t)}</small></button>`).join("")}</div>`;
    $$("[data-t]").forEach(b => b.onclick = () => go("bibi", { theme: b.dataset.t }));
    return;
  }
  let pool = arg.theme === "*" ? dueList() : itemsOf(arg.theme);
  if (!pool.length) pool = itemsOfLevel(lvlId());
  pool = shuffle(pool).slice(0, 10); let k = 0, score = 0;
  const show = () => {
    if (k >= pool.length){ m.innerHTML = `<h1>🦉 ${esc(T().done)}</h1><section class="card hero">${BIBI}<p><b>${score} / ${pool.length}</b> · +${score * 10} ${T().xp}</p></section>
      <div class="row"><button class="btn" id="again">${esc(x.next)}</button><button class="btn alt" id="back">🧑‍🏫 ${esc(x.tutor)}</button></div>`;
      $("#again").onclick = () => go("bibi"); $("#back").onclick = () => go("tutor"); return; }
    const i = pool[k], src = word(i, S.source), tgt = word(i, S.target);
    m.innerHTML = `<h1>🦉 ${esc(x.mBibi)} <small>${k + 1}/${pool.length}</small></h1>${bar(Math.round(k * 100 / pool.length))}
     <section class="card"><p class="rom">${esc(x.sayThis)} ${esc(langLabel(S.target))} :</p><p class="big" lang="${LANGS[S.source].tts}">${esc(src.t)}</p>
     <div class="answer"><button class="btn alt mic" id="mic" aria-label="${esc(T().speakBtn)}">🎤</button>
     <input type="text" id="ans" lang="${LANGS[S.target].tts}" placeholder="${esc(x.write)}" aria-label="${esc(x.write)}"><button class="btn" id="ok">${esc(T().check)}</button></div>
     <div id="res" aria-live="polite"></div></section>`;
    const check = said => {
      const good = similar(said, tgt.t) >= 0.8; grade(i, good); addXp(good ? 10 : 3); if (good) score++;
      $("#res").innerHTML = `<p class="${good ? "ok" : "ko"}">${good ? "✅ " + esc(x.good) : "💪 " + esc(x.almost)}</p>
        <p class="big" lang="${LANGS[S.target].tts}">${esc(tgt.t)}</p>${tgt.r && S.rom ? `<p class="rom">${esc(tgt.r)}</p>` : ""}
        <p class="rom">${esc(x.heard)} : « ${esc(said)} »</p><button class="btn" id="nx">${esc(x.next)} →</button>`;
      speak(tgt.t, S.target); $("#nx").onclick = () => { k++; show(); }; $("#nx").focus();
    };
    $("#ok").onclick = () => { const v = $("#ans").value.trim(); if (v) check(v); };
    $("#ans").onkeydown = e => { if (e.key === "Enter"){ e.preventDefault(); $("#ok").click(); } };
    micButton($("#mic"), $("#ans"), check);
  };
  show();
};

/* ---------- Cours express et « Explique-moi » ---------- */
function oneShot(m, title, label, btnTxt, makePrompt){
  const x = X();
  m.innerHTML = `<h1>${title}</h1><section class="card"><label for="q">${esc(label)}</label><textarea id="q" rows="2" style="width:100%"></textarea>
   <div class="row" style="margin-top:10px"><button class="btn" id="go">${esc(btnTxt)}</button><span id="eng"></span></div></section><section class="card" id="out" aria-live="polite" hidden></section>`;
  $("#go").onclick = async () => {
    const out = $("#out"), b = $("#go"); b.disabled = true; out.hidden = false; out.textContent = x.thinking;
    try { const [sys, user] = makePrompt($("#q").value.trim());
      const r = await askAI(sys, [{ role: "user", content: user }]);
      if (r === null){ out.textContent = x.bibiFallback; setTimeout(() => go("bibi"), 1200); return; }
      out.innerHTML = `<div style="white-space:pre-wrap">${esc(r)}</div>`; $("#eng").innerHTML = engBadge(AI.lastProv); addXp(15);
    } catch (e) { out.textContent = "⚠️ " + aiFriendly(e); }
    b.disabled = false;
  };
}
VIEWS.course = m => oneShot(m, "📚 " + X().mCourse, X().topic, X().makeLesson, q => ["You are a language teacher. Plain text, no markdown. Explanations in " + nat(S.source) + ", examples in " + nat(S.target) + ". Structure: 1) simple definition 2) step-by-step explanation 3) five examples with translation 4) one mini exercise 5) the corrected answer with comments.",
  "Lesson topic: " + (q || "introducing yourself") + ". Level " + lvlId() + "."]);
VIEWS.explain = m => oneShot(m, "💡 " + X().mExplain, X().askQ, X().ask, q => ["You are a language teacher of " + nat(S.target) + ". Answer in " + nat(S.source) + ", simply, step by step, with 2-3 examples in " + nat(S.target) + " and their translation. Plain text, no markdown.", q || "What are the most useful verbs for a beginner?"]);

/* ---------- Photo ---------- */
VIEWS.photo = function(m){
  const x = X();
  m.innerHTML = `<h1>📷 ${esc(x.mPhoto)}</h1><section class="card"><label for="ph">${esc(x.photoPick)}</label><input type="file" id="ph" accept="image/*"><p class="rom">${esc(x.noVision)}</p></section>`;
  $("#ph").onchange = e => { const f = e.target.files[0]; if (!f) return;
    const img = new Image(); img.onload = () => { const k = Math.min(1, 1024 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      go("talk", { mode: "photo", title: "📷 " + x.mPhoto, image: c.toDataURL("image/jpeg", .85).split(",")[1] }); };
    img.src = URL.createObjectURL(f); };
};

/* ---------- Carnet de corrections (révision hors ligne) ---------- */
VIEWS.notes = function(m){
  const x = X(), list = S.notes.filter(n => n.l === S.target);
  m.innerHTML = `<h1>📒 ${esc(x.mNotes)} · ${esc(langLabel(S.target))}</h1>` + (list.length
    ? `<ul class="plain">${list.map(n => `<li class="card"><span lang="${LANGS[S.target].tts}">${esc(n.t)}</span><div class="row"><button class="btn alt" data-s="${S.notes.indexOf(n)}">🔊</button><button class="btn warn" data-d="${S.notes.indexOf(n)}">${esc(x.del)}</button></div></li>`).join("")}</ul>`
    : `<p>${esc(x.notesEmpty)}</p>`);
  $$("[data-s]").forEach(b => b.onclick = () => speak(S.notes[+b.dataset.s].t.split(/[—–(-]/)[0], S.target));
  $$("[data-d]").forEach(b => b.onclick = () => { S.notes.splice(+b.dataset.d, 1); save(); go("notes"); });
};
VIEWS.thist = function(m, i){
  const h = S.talks[i]; if (!h){ go("tutor"); return; }
  m.innerHTML = `<h1>${esc(h.title)}</h1><div class="chat">${h.msgs.map(z => `<div class="msg ${z.role === "user" ? "me" : "ai"}" ${z.role === "user" ? "" : `lang="${LANGS[h.l].tts}"`}>${esc(z.content)}</div>`).join("")}</div>
   <div class="row"><button class="btn warn" id="dl">${esc(X().del)}</button></div>`;
  $("#dl").onclick = () => { S.talks.splice(i, 1); save(); go("tutor"); };
};

/* ---------- Réglages du tuteur IA + test des micros ---------- */
VIEWS.aiset = function(m){
  const x = X(), a = S.ai, provs = ["auto", "bibi", "webllm", "local", "nano", "free", "gemini", "openai", "anthropic"];
  const k = Mic.kind();
  m.innerHTML = `<h1>⚙️ ${esc(x.engine)}</h1>
  <section class="card"><label for="pv">${esc(x.engine)}</label><select id="pv" style="width:100%">${provs.map(p => `<option value="${p}" ${a.prov === p ? "selected" : ""}>${esc(provName(p))}</option>`).join("")}</select>
   <p>${esc(x.engineNow)} : <span id="engNow">…</span></p><div id="pbox"></div></section>
  <section class="card"><h2>📴 ${esc(x.pWeb)}</h2><p class="rom">${esc(x.webHelp)}</p>
   <label for="wm">Modèle</label><select id="wm" style="width:100%">${WEB_MODELS.map(([id, n]) => `<option value="${id}" ${a.web.model === id ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>
   <div class="row" style="margin-top:10px"><button class="btn" id="wl" ${AI.hasWebGPU() ? "" : "disabled"}>⬇ ${esc(x.webLoad)}</button></div>
   <p id="wp" aria-live="polite">${AI.hasWebGPU() ? (a.web.ready ? esc(x.webReady) : "") : "⚠️ " + esc(x.noGpu)}</p></section>
  <section class="card"><h2>🎤 ${esc(x.micState)}</h2><ul class="plain">
   <li>${k === "android" ? "✅" : "⬜"} ${esc(T().micAndroid || "Android")}</li>
   <li>${k === "web" ? "✅" : SR ? "☑️" : "⬜"} ${esc(T().micWeb || "Web")}${Mic.webBroken ? " (⚠️)" : ""}</li>
   <li>${k === "record" ? "✅" : AI.canTranscribe() ? "☑️" : "⬜"} 🎙️ → IA (Gemini / Whisper)</li>
   <li>${k === "desktop" || k === "none" ? "✅" : "⬜"} ⌨️ ${esc(Mic.explain("desktop"))}</li></ul>
   <div class="row"><button class="btn alt mic" id="mt" aria-label="${esc(x.micTest)}">🎤</button><span>${esc(x.micTest)} — ${esc(langLabel(S.target))}</span></div><p id="mr" aria-live="polite" lang="${LANGS[S.target].tts}"></p></section>
  <p class="rom"><a href="#" id="lg">${esc(x.legal)}</a></p>`;
  const box = $("#pbox");
  const drawBox = () => {
    const p = $("#pv").value;
    if (["gemini", "openai", "anthropic"].includes(p)) box.innerHTML = `<label for="ky">Clé API</label><input type="password" id="ky" autocomplete="off" value="${esc(a.keys[p])}" style="width:100%">
      <label for="md">Modèle</label><input type="text" id="md" value="${esc(a.models[p])}" style="width:100%"><p class="rom">${esc(x.keyHelp)}${p === "gemini" ? " aistudio.google.com → Get API key." : ""}</p>`;
    else if (p === "local") box.innerHTML = `<label for="lu">${esc(x.localUrl)}</label><input type="text" id="lu" value="${esc(a.local.url)}" style="width:100%">
      <label for="lm">${esc(x.localModel)}</label><input type="text" id="lm" value="${esc(a.local.model)}" style="width:100%">
      <label for="lk">${esc(x.localKey)}</label><input type="password" id="lk" value="${esc(a.local.key)}" style="width:100%"><p class="rom">${esc(x.localHelp)}</p>`;
    else box.innerHTML = "";
    box.insertAdjacentHTML("beforeend", p === "bibi" ? "" : `<div class="row"><button class="btn alt" id="tc">${esc(x.testConn)}</button></div>`);
    $$("#pbox input").forEach(i => i.onchange = () => {
      if (i.id === "ky") a.keys[p] = i.value.trim(); if (i.id === "md") a.models[p] = i.value.trim() || AI_DEF.models[p];
      if (i.id === "lu") a.local.url = i.value.trim(); if (i.id === "lm") a.local.model = i.value.trim(); if (i.id === "lk") a.local.key = i.value.trim(); save(); });
    const tc = $("#tc"); if (tc) tc.onclick = async () => { tc.disabled = true;
      try { const r = await askAI("Reply with the single word OK.", [{ role: "user", content: "Test" }]); toast(r === null ? x.bibiFallback : x.connOk + " " + provName(AI.lastProv)); }
      catch (e) { toast("❌ " + aiFriendly(e)); } tc.disabled = false; };
  };
  $("#pv").onchange = e => { a.prov = e.target.value; AI.nanoSession = null; save(); drawBox(); AI.pick().then(p => $("#engNow").innerHTML = engBadge(p)); };
  drawBox(); AI.pick().then(p => { const e = $("#engNow"); if (e) e.innerHTML = engBadge(p); });
  $("#wm").onchange = e => { a.web.model = e.target.value; a.web.ready = false; AI.engine = null; save(); };
  $("#wl").onclick = async () => { const b = $("#wl"), wp = $("#wp"); b.disabled = true; wp.textContent = x.webLoading;
    try { await AI.loadWeb((t, p) => { wp.textContent = x.webLoading + " " + Math.round(p * 100) + " %"; }); wp.textContent = x.webReady; }
    catch (e) { wp.textContent = "⚠️ " + aiFriendly(e); } b.disabled = false; };
  micButton($("#mt"), null, t => { $("#mr").textContent = "✅ " + x.heard + " : « " + t + " »"; });
  $("#lg").onclick = e => { e.preventDefault(); go("legal"); };
};
