#!/bin/bash
echo "📦 ¿Descripción del cambio?"
read -r msg
git add .
git commit -m "$msg"
git push
echo "✅ Listo — Vercel desplegará en ~30 segundos"
