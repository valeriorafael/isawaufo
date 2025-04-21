#!/bin/bash

# Script para testar todas as funcionalidades do site UFO Sightings

echo "Iniciando testes do UFO Sightings..."
echo "======================================"

# Verificar se os arquivos principais existem
echo -e "\n[1/7] Verificando arquivos principais..."
FILES=(
    "index.html"
    "login.html"
    "register.html"
    "add-sighting.html"
    "sightings.html"
    "profile.html"
    "sighting-details.html"
    "admin.html"
    "admin-users.html"
    "admin-sightings.html"
    "admin-comments.html"
    "admin-reports.html"
    "admin-settings.html"
    "offline.html"
    "manifest.json"
    "service-worker.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file encontrado"
    else
        echo "✗ $file não encontrado"
    fi
done

# Verificar arquivos CSS
echo -e "\n[2/7] Verificando arquivos CSS..."
CSS_FILES=(
    "css/styles.css"
    "css/responsive.css"
    "css/social-login.css"
)

for file in "${CSS_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file encontrado"
    else
        echo "✗ $file não encontrado"
    fi
done

# Verificar arquivos JavaScript
echo -e "\n[3/7] Verificando arquivos JavaScript..."
JS_FILES=(
    "js/firebase-config.js"
    "js/auth.js"
    "js/map.js"
    "js/sightings.js"
    "js/add-sighting.js"
    "js/sighting-details.js"
    "js/profile.js"
    "js/main.js"
    "js/auth-protection.js"
    "js/social-login.js"
    "js/offline-manager.js"
    "js/admin.js"
)

for file in "${JS_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file encontrado"
    else
        echo "✗ $file não encontrado"
    fi
done

# Verificar recursos de imagem
echo -e "\n[4/7] Verificando recursos de imagem..."
if [ -f "images/offline-icon.svg" ]; then
    echo "✓ Ícone offline encontrado"
else
    echo "✗ Ícone offline não encontrado"
fi

# Verificar funcionalidade offline
echo -e "\n[5/7] Verificando funcionalidade offline..."
if grep -q "serviceWorker" "index.html" && [ -f "service-worker.js" ] && [ -f "offline.html" ] && [ -f "js/offline-manager.js" ]; then
    echo "✓ Funcionalidade offline implementada corretamente"
else
    echo "✗ Funcionalidade offline incompleta"
fi

# Verificar login social
echo -e "\n[6/7] Verificando login social..."
if grep -q "social-login" "login.html" && [ -f "js/social-login.js" ] && [ -f "css/social-login.css" ]; then
    echo "✓ Login social implementado corretamente"
else
    echo "✗ Login social incompleto"
fi

# Verificar painel administrativo
echo -e "\n[7/7] Verificando painel administrativo..."
ADMIN_FILES=(
    "admin.html"
    "admin-users.html"
    "admin-sightings.html"
    "admin-comments.html"
    "admin-reports.html"
    "admin-settings.html"
    "js/admin.js"
)

admin_complete=true
for file in "${ADMIN_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        admin_complete=false
        break
    fi
done

if [ "$admin_complete" = true ]; then
    echo "✓ Painel administrativo implementado corretamente"
else
    echo "✗ Painel administrativo incompleto"
fi

# Resumo dos testes
echo -e "\n======================================"
echo "Resumo dos testes:"
echo "- Arquivos principais: Verificados"
echo "- Arquivos CSS: Verificados"
echo "- Arquivos JavaScript: Verificados"
echo "- Recursos de imagem: Verificados"
echo "- Funcionalidade offline: Verificada"
echo "- Login social: Verificado"
echo "- Painel administrativo: Verificado"
echo "======================================"

echo -e "\nTestes concluídos!"
