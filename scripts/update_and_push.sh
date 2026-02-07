#!/bin/bash

# Navegar al directorio del repositorio
cd /home/compartir/lista_zeronet/enlaces-ace/

# Ejecutar el script de actualización
/usr/bin/python3 actualizar.py

# Verificar si hay cambios en el archivo de canales
if git status --porcelain data/canales.json | grep -q "^ M"; then
    echo "Cambios detectados en los canales. Subiendo a GitHub..."
    git add data/canales.json
    git commit -m "Auto-update channels $(date +'%Y-%m-%d %H:%M:%S')"
    git push origin main
else
    echo "No hay cambios nuevos en los canales. Todo al día."
fi
