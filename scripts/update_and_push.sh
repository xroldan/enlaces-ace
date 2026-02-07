#!/bin/bash

# Navegar al directorio del repositorio
cd /home/compartir/lista_zeronet/enlaces-ace/

# Ejecutar el script de actualización
/usr/bin/python3 actualizar.py

# Añadir cambios, hacer commit y push
git add data/canales.json
git commit -m "Auto-update channels $(date +'%Y-%m-%d %H:%M:%S')"
git push origin main
