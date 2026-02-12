#!/bin/bash

# Navegar al directorio del repositorio
cd /home/compartir/lista_zeronet/enlaces-ace/

# Copiar el archivo local para que GitHub Pages pueda leerlo (evitando error de symlink)
# Aseguramos que el archivo existe antes de copiarlo
if [ -f "/home/compartir/local.m3u" ]; then
    cp /home/compartir/local.m3u data/local.m3u
fi

# Ejecutar el script de actualización!
/usr/bin/python3 actualizar.py

# Verificar si hay cambios en el archivo de canales o en la lista de eventos
if git status --porcelain data/canales.json data/local.m3u | grep -q "^ M\|^??"; then
    echo "Cambios detectados. Subiendo a GitHub..."
    git add data/canales.json data/local.m3u
    git commit -m "Auto-update channels and events $(date +'%Y-%m-%d %H:%M:%S')"
    # Forzamos IdentitiesOnly por si acaso
    git push origin main
else
    echo "No hay cambios nuevos. Todo al día."
fi
