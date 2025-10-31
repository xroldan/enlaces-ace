import json
from datetime import datetime
import requests

INPUT_URL = "https://ipfs.io/ipns/k2k4r8oqlcjxsritt5mczkcn4mmvcmymbqw7113fz2flkrerfwfps004/data/listas/listaplana.txt"
# INPUT_FILE = "/home/compartir/lista_zeronet/enlaces-ace/data/listaplana.txt"
OUTPUT_FILE = "/home/compartir/lista_zeronet/enlaces-ace/data/canales.json"
LOG_FILE = "/home/compartir/lista_zeronet/enlaces-ace/logs/actualizar.log"


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{timestamp}] {msg}\n")
    except Exception as e:
        print(f"Error al escribir en el log: {e}")

try:
    # Leer enlaces
    response = requests.get(INPUT_URL)
    # Verificar peticion exitosa (200)
    response.raise_for_status()  # Esto lanzará un error si la descarga falla
    text_content = response.text
    enlaces = [line.strip() for line in text_content.splitlines() if line.strip()]
    num_lineas = len(enlaces)

    # Guardar JSON
    with open(OUTPUT_FILE, "w") as f:
        json.dump(enlaces, f, indent=2)

    log(f"Leídas {num_lineas} líneas de {INPUT_URL}. Actualización completada.")

except Exception as e:
    log(f"Error durante la actualización: {e}")
