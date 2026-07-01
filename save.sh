#!/bin/bash

echo "💾 Değişiklikler kaydediliyor..."

# Commit mesajı al
if [ -z "$1" ]; then
  MSG="chore: auto save $(date '+%Y-%m-%d %H:%M')"
else
  MSG="$1"
fi

# Frontend
echo "📦 Frontend push ediliyor..."
cd ~/projeler/efsora/frontend
git add -A
git commit -m "$MSG" 2>/dev/null || echo "Frontend: commit yok"
git push origin main 2>/dev/null || git push origin master 2>/dev/null

# Backend
echo "☕ Backend push ediliyor..."
cd ~/projeler/efsora/backend
git add -A
git commit -m "$MSG" 2>/dev/null || echo "Backend: commit yok"
git push origin master 2>/dev/null || git push origin main 2>/dev/null

# Ana repo
echo "🏠 Ana repo push ediliyor..."
cd ~/projeler/efsora
git add -A
git commit -m "$MSG" 2>/dev/null || echo "Ana repo: commit yok"
git push origin main 2>/dev/null || git push origin master 2>/dev/null

echo "✅ Tamamlandı!"
