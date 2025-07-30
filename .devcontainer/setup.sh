#!/bin/bash
if [ ! -d "./node_modules" ]; then
    echo "Ejecutando 'npm install'"
    npm install
else
    echo "Se ha verificado que ya existe la carpeta 'node_modules'."
fi

# Resuelve error con devcontainers en windows, que muestra TODOS los archivos como modificados
# en la ventana "Source Control" de VSCode
git config core.fileMode false
git config core.autocrlf true