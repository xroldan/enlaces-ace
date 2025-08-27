import subprocess
import json

# Ruta a tu archivo plano con los enlaces
INPUT_FILE = "data/listaplana.txt"
OUTPUT_FILE = "data/canales.json"  # dentro del repo

# Leer enlaces del archivo plano
with open(INPUT_FILE, "r") as f:
    enlaces = [line.strip() for line in f if line.strip()]

# Guardar en formato JSON
with open(OUTPUT_FILE, "w") as f:
    json.dump(enlaces, f, indent=2)

# Subir a GitHub
subprocess.run(["git", "add", OUTPUT_FILE])
subprocess.run(["git", "commit", "-m", "Actualización automática de enlaces"])
subprocess.run(["git", "push"])
