# 🦉 BiTalkBi

Application **gratuite, open source (MIT), sans publicité ni compte** pour apprendre **15 langues**
à partir de n'importe laquelle d'entre elles, avec un **tuteur IA** — **même sans internet**.

BiTalkBi 3.0 fusionne **BIBILEARN** (leçons, révisions, histoires, traducteur, voix natives hors ligne)
et **BiaTalk** (tuteur IA : chat, appel, jeux de rôle, personnages, débats, photo, cours).

Langues : anglais (UK), italien, français, roumain, portugais (Brésil / Portugal), espagnol
(Espagne / Mexique / Argentine), allemand, russe, grec moderne, néerlandais, japonais, chinois mandarin.

## Téléchargements directs (après la première fabrication sur GitHub)

| Appareil | Lien |
|---|---|
| Windows 11 (installation en 1 clic) | https://github.com/Bianca23-cloud/BiTalkBi/releases/latest/download/BiTalkBi-Windows-Setup.exe |
| Windows 11 (sans installation) | https://github.com/Bianca23-cloud/BiTalkBi/releases/latest/download/BiTalkBi-Windows-portable.exe |
| Linux | https://github.com/Bianca23-cloud/BiTalkBi/releases/latest/download/BiTalkBi-Linux.AppImage |
| Android | https://github.com/Bianca23-cloud/BiTalkBi/releases/latest/download/BiTalkBi-Android.apk |
| iPhone / iPad / navigateur | https://bianca23-cloud.github.io/BiTalkBi/ (Safari → Partager → Sur l'écran d'accueil) |

## IA gratuite, avec ou sans internet

| Moteur | Internet | Coût | Où |
|---|---|---|---|
| 🦉 Bibi hors ligne (intégré) | non | gratuit | partout |
| 📴 IA dans l'appli (WebLLM : Qwen, Llama, Gemma) | seulement pour le 1er téléchargement | gratuit | navigateurs/appareils avec WebGPU |
| 🖥️ IA locale (Jan, Ollama, LM Studio, toute appli avec serveur « compatible OpenAI ») | non | gratuit | ordinateur, ou téléphone si l'appli d'IA le permet |
| 🧩 IA intégrée à Chrome (Gemini Nano) | non (après téléchargement) | gratuit | Chrome sur ordinateur |
| 🌐 IA gratuite en ligne sans clé (Pollinations) | oui | gratuit | partout |
| 🔑 Gemini (clé gratuite), OpenAI, Anthropic | oui | selon fournisseur | partout |

Mode « Automatique » : IA dans l'appli → IA locale → Chrome → IA gratuite en ligne → Bibi hors ligne.

## Micros

1. Appli Android : reconnaissance vocale du téléphone (marche hors ligne si la langue est téléchargée dans les réglages Google).
2. iPhone (Safari), Chrome, Edge : reconnaissance du navigateur.
3. Si elle est bloquée (iPhone « écran d'accueil », appli Windows, Firefox) : enregistrement → WAV 16 kHz → transcription Gemini ou Whisper.
4. Sinon : dictée du clavier (🎤 du clavier, ⊞ Win + H).

## Développer et tester

```bash
python3 scripts/build.py                         # assemble www/index.html
python3 -m http.server 8080 -d www               # http://localhost:8080
python3 scripts/test_app.py                      # leçons, traducteur, hors ligne (BIBILEARN)
node scripts/test_tutor.mjs                      # tuteur, IA hors ligne, micros Android/iPhone/Windows
npm install && npm start                         # version bureau (Electron)
```

Avant publication : compléter les champs `[à compléter]` de `src/js/62-legal.js`.
Contenu pédagogique original ; BiTalkBi n'est affiliée ni à TalkPal, ni à EWA.
