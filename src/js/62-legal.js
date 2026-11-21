/* =====================================================================
   62 · INFORMATIONS LÉGALES (droit français / UE) — textes statiques de l'appli
   Les mentions entre [crochets] sont à compléter par l'éditrice avant publication.
   ===================================================================== */
const LEGAL_VERSION = "1.0 — 21 novembre 2026";
const LEGAL = [
 ["mentions", "Mentions légales", `<p>Conformément à l'article 6 de la loi n° 2004-575 du 21 juin 2004 (LCEN).</p>
<h3>Éditrice</h3><p>Bianca Constantin (compte GitHub Bianca23-cloud) — [statut et n° SIRET à compléter] — [adresse à compléter] — contact : [e-mail à compléter]. Directrice de la publication : Bianca Constantin.</p>
<h3>Hébergement de la version web</h3><p>GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>
<h3>Propriété intellectuelle</h3><p>Code sous licence MIT. Nom « BiTalkBi », mascotte « Bibi » et contenus pédagogiques : créations originales de l'éditrice. BiTalkBi est indépendante : elle n'est affiliée ni à TalkPal, Inc., ni à EWA, ni à aucun fournisseur d'IA cité.</p>`],
 ["cgu", "Conditions générales d'utilisation", `<h3>1. Service</h3><p>BiTalkBi est une application gratuite d'apprentissage des langues (leçons, révisions, histoires, traducteur, tuteur IA). Elle ne délivre ni diplôme ni certification.</p>
<h3>2. Âge</h3><p>Destinée aux personnes de 15 ans et plus ; en dessous, accord d'un parent requis. Les fournisseurs d'IA en ligne ont leur propre âge minimum (18 ans pour Anthropic, par exemple).</p>
<h3>3. Intelligence artificielle</h3><p>Les réponses du tuteur sont générées automatiquement et peuvent contenir des erreurs. Elles ne constituent pas un conseil médical, juridique ou financier. Les personnages historiques sont des simulations.</p>
<h3>4. Clés et services tiers</h3><p>Si vous saisissez une clé (Gemini, OpenAI, Anthropic) ou reliez une IA locale, vous restez responsable de son usage et des éventuels coûts du fournisseur. L'IA gratuite en ligne (Pollinations) est fournie par un tiers, sans garantie de disponibilité.</p>
<h3>5. Bon usage</h3><p>Interdiction d'utiliser l'appli pour produire des contenus illicites, haineux ou portant atteinte aux droits d'autrui.</p>
<h3>6. Responsabilité et droit applicable</h3><p>Application fournie « en l'état ». Droit français ; recherche d'une solution amiable avant tout litige ; possibilité de recourir gratuitement à un médiateur de la consommation.</p>`],
 ["privacy", "Politique de confidentialité (RGPD)", `<p>Responsable du traitement : Bianca Constantin — [e-mail]. Principe : <b>minimisation</b>. Pas de compte, pas de publicité, pas de cookie, pas de mesure d'audience.</p>
<h3>Sur votre appareil uniquement</h3><ul><li>Réglages, progression, révisions, carnet, historique des conversations, clés API.</li></ul><p>L'éditrice n'y a pas accès.</p>
<h3>Ce qui ne quitte jamais l'appareil</h3><ul><li>Leçons, révisions, histoires, Bibi hors ligne, IA dans l'appli (WebLLM), IA intégrée à Chrome.</li><li>IA locale : les échanges vont seulement vers l'adresse que vous avez indiquée (en général votre propre appareil).</li></ul>
<h3>Envoyé à un tiers, seulement si vous l'utilisez</h3><ul>
<li><b>IA en ligne choisie</b> (Pollinations, Google, OpenAI ou Anthropic) : vos messages, l'audio enregistré (transcription) et la photo du mode Photo, après votre accord. Base légale : exécution du service demandé (art. 6.1.b RGPD). Transferts possibles hors UE avec garanties du fournisseur.</li>
<li><b>Traducteur en ligne</b> (Google Translate, MyMemory) : le texte à traduire.</li>
<li><b>Reconnaissance vocale du système</b> (Siri/dictée Apple, Google, navigateur) : votre voix, selon les réglages de l'appareil.</li>
<li><b>Téléchargement de l'IA hors ligne</b> : les fichiers du modèle viennent de Hugging Face / GitHub (votre adresse IP est visible de ces serveurs).</li></ul>
<h3>Durée et droits</h3><p>Conservation jusqu'à suppression (Profil → « Tout effacer ») ou désinstallation. Droits d'accès, rectification, effacement, portabilité (« Exporter ma progression »), opposition : [e-mail]. Réclamation possible auprès de la CNIL (www.cnil.fr).</p>`],
 ["ai", "Transparence sur l'IA (AI Act)", `<p>Conformément à l'article 50 du règlement (UE) 2024/1689 :</p><ul>
<li>Le tuteur est une <b>intelligence artificielle</b>, pas un humain.</li><li>Les textes, voix de synthèse et corrections du tuteur sont <b>générés automatiquement</b> ; le moteur utilisé est toujours affiché.</li>
<li>Les personnages historiques ou fictifs sont des <b>simulations</b>.</li><li>« Bibi hors ligne » n'est pas une IA générative : il compare vos réponses aux phrases du cours.</li></ul>
<p>Système à risque limité : outil d'entraînement, sans évaluation officielle des apprenants.</p>`],
 ["a11y", "Déclaration d'accessibilité", `<p>Objectif : RGAA 4.1 / WCAG 2.2 niveau AA. État : <b>partiellement conforme</b> (sans audit externe).</p><ul>
<li>Navigation au clavier, lien d'évitement, focus visible ; options grand texte et contraste élevé.</li><li>Réponses annoncées aux lecteurs d'écran (aria-live) ; langue déclarée sur chaque phrase étrangère.</li>
<li>Chaque exercice oral a une alternative écrite.</li></ul><p>Signaler un problème : [e-mail]. Recours : Défenseur des droits.</p>`],
 ["licenses", "Licences", `<p><b>BiTalkBi</b> — © 2026 Bianca Constantin — Licence MIT (utilisation, copie, modification et distribution libres, avec la notice de copyright ; logiciel fourni « en l'état », sans garantie).</p>
<p>Composants : Electron, electron-builder, Capacitor et ses extensions voix/micro, WebLLM (@mlc-ai/web-llm, Apache 2.0). Modèles d'IA hors ligne sous leur propre licence (Qwen : Apache 2.0 ; Llama 3.2 : Llama Community License ; Gemma : Gemma Terms of Use). Voix natives : Microsoft Edge TTS.</p>`]
];
VIEWS.legal = function(m, id){
  const p = LEGAL.find(x => x[0] === id);
  if (!p){ m.innerHTML = `<h1>⚖️ ${esc(X().legal)}</h1><ul class="plain">${LEGAL.map(x => `<li><a href="#" data-l="${x[0]}">${esc(x[1])}</a></li>`).join("")}</ul><p class="rom">Version ${LEGAL_VERSION}</p>`;
    $$("[data-l]").forEach(a => a.onclick = e => { e.preventDefault(); go("legal", a.dataset.l); }); return; }
  m.innerHTML = `<h1>${esc(p[1])}</h1><article class="card legal" lang="fr">${p[2]}</article><p class="rom">Version ${LEGAL_VERSION}</p><button class="btn alt" id="bk">← ${esc(X().legal)}</button>`;
  $("#bk").onclick = () => go("legal");
};
