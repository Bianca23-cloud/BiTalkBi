#!/usr/bin/env bash
# Intègre la bibliothèque WebLLM (IA hors ligne) dans l'appli : www/vendor/web-llm.js
# (sinon l'appli la charge en ligne la première fois). Lancé par GitHub Actions.
set -e
npm install --no-save --legacy-peer-deps @mlc-ai/web-llm@0.2 >/dev/null
mkdir -p www/vendor
cp node_modules/@mlc-ai/web-llm/lib/index.js www/vendor/web-llm.js
echo "WebLLM intégré : $(du -h www/vendor/web-llm.js | cut -f1)"
