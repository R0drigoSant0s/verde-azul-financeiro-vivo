#!/bin/bash

# Adiciona o script build:dev no package.json
if grep -q '"build:dev":' client/package.json; then
  echo "O script build:dev já existe no package.json"
else
  echo "Adicionando o script build:dev no package.json..."
  sed -i '/"scripts": {/a\    "build:dev": "vite build",' client/package.json
fi
