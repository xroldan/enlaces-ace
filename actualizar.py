import json
from datetime import datetime

INPUT_FILE = "data/listaplana.txt"
OUTPUT_FILE = "data/canales.json"
LOG_FILE = "log/actualizar.log"

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {msg}\n")

try:
    # Leer enlaces
    with open(INPUT_FILE, "r") as f:
        enlaces = [line.strip() for line in f if line.strip()]
    num_lineas = len(enlaces)

    # Guardar JSON
    with open(OUTPUT_FILE, "w") as f:
        json.dump(enlaces, f, indent=2)

    log(f"Leídas {num_lineas} líneas de {INPUT_FILE}. Actualización completada.")

except Exception as e:
    log(f"Error durante la actualización: {e}")
