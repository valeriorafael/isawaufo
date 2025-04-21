#!/bin/bash

# Script de teste para o site UFO Sightings

echo "Iniciando testes do site UFO Sightings..."

# Verificar se todos os arquivos necessários existem
echo "Verificando arquivos essenciais..."

# Arquivos HTML
HTML_FILES=("index.html" "login.html" "register.html" "sightings.html" "add-sighting.html" "profile.html" "sighting-details.html" "instructions.html")
for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file encontrado"
  else
    echo "✗ ERRO: $file não encontrado"
  fi
done

# Arquivos CSS
if [ -f "css/styles.css" ]; then
  echo "✓ css/styles.css encontrado"
else
  echo "✗ ERRO: css/styles.css não encontrado"
fi

# Arquivos JavaScript
JS_FILES=("js/firebase-config.js" "js/auth.js" "js/auth-protection.js" "js/map.js" "js/sightings.js" "js/add-sighting.js" "js/sighting-details.js" "js/profile.js" "js/main.js")
for file in "${JS_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file encontrado"
  else
    echo "✗ ERRO: $file não encontrado"
  fi
done

# Verificar diretório de imagens
if [ -d "images" ]; then
  echo "✓ Diretório images/ encontrado"
else
  echo "✗ ERRO: Diretório images/ não encontrado"
fi

echo ""
echo "Verificando sintaxe dos arquivos JavaScript..."

# Verificar sintaxe dos arquivos JavaScript (requer node.js)
if command -v node &> /dev/null; then
  for file in "${JS_FILES[@]}"; do
    if [ -f "$file" ]; then
      # Verificar sintaxe JavaScript
      node --check "$file" 2>/dev/null
      if [ $? -eq 0 ]; then
        echo "✓ Sintaxe de $file está correta"
      else
        echo "✗ ERRO: Sintaxe de $file contém erros"
      fi
    fi
  done
else
  echo "Node.js não encontrado, pulando verificação de sintaxe JavaScript"
fi

echo ""
echo "Verificando links internos..."

# Verificar links internos nos arquivos HTML
for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Extrair links internos
    LINKS=$(grep -o 'href="[^"]*\.html"' "$file" | sed 's/href="//g' | sed 's/"//g')
    for link in $LINKS; do
      if [ -f "$link" ]; then
        echo "✓ Link em $file para $link é válido"
      else
        echo "✗ ERRO: Link em $file para $link é inválido"
      fi
    done
  fi
done

echo ""
echo "Verificando referências a scripts e estilos..."

# Verificar referências a arquivos JavaScript
for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Extrair referências a scripts
    SCRIPTS=$(grep -o 'src="[^"]*\.js"' "$file" | sed 's/src="//g' | sed 's/"//g')
    for script in $SCRIPTS; do
      if [[ $script == http* ]]; then
        echo "✓ Referência externa em $file para $script (não verificada)"
      elif [ -f "$script" ]; then
        echo "✓ Referência em $file para $script é válida"
      else
        echo "✗ ERRO: Referência em $file para $script é inválida"
      fi
    done
  fi
done

# Verificar referências a arquivos CSS
for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Extrair referências a estilos
    STYLES=$(grep -o 'href="[^"]*\.css"' "$file" | sed 's/href="//g' | sed 's/"//g')
    for style in $STYLES; do
      if [[ $style == http* ]]; then
        echo "✓ Referência externa em $file para $style (não verificada)"
      elif [ -f "$style" ]; then
        echo "✓ Referência em $file para $style é válida"
      else
        echo "✗ ERRO: Referência em $file para $style é inválida"
      fi
    done
  fi
done

echo ""
echo "Testes concluídos!"
echo "Para testar a funcionalidade completa, abra o site em um navegador e verifique manualmente:"
echo "1. Registro e login de usuários"
echo "2. Visualização do mapa interativo"
echo "3. Adição de avistamentos"
echo "4. Filtros de busca"
echo "5. Avaliações e comentários"
echo "6. Perfil de usuário"
echo ""
echo "Lembre-se de configurar o Firebase conforme as instruções em instructions.html"
