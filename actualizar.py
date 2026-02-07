import json
from datetime import datetime
import requests
from abc import ABC, abstractmethod

# Configuración de fuentes de entrada
INPUT_SOURCES = [
    {
        "url": "https://ipfs.io/ipns/k2k4r8oqlcjxsritt5mczkcn4mmvcmymbqw7113fz2flkrerfwfps004/data/listas/listaplana.txt",
        "format": "text"
    },
    {
        "url": "https://ipfs.io/ipns/k51qzi5uqu5di462t7j4vu4akwfhvtjhy88qbupktvoacqfqe9uforjvhyi4wr/hashes.json",
        "format": "json"
    },
    {
        "url": "https://ipfs.io/ipns/k51qzi5uqu5dh5qej4b9wlcr5i6vhc7rcfkekhrxqek5c9lk6gdaiik820fecs/hashes.json",
        "format": "json"
    }
]

OUTPUT_FILE = "/home/compartir/lista_zeronet/enlaces-ace/data/canales.json"
LOG_FILE = "/home/compartir/lista_zeronet/enlaces-ace/logs/actualizar.log"

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{timestamp}] {msg}\n")
    except Exception as e:
        print(f"Error al escribir en el log: {e}")

class SourceAdapter(ABC):
    @abstractmethod
    def parse(self, content):
        pass

class PlainTextAdapter(SourceAdapter):
    def parse(self, content):
        lines = [line.strip() for line in content.splitlines() if line.strip()]
        # Agrupar en pares (título, hash)
        return [(lines[i], lines[i+1]) for i in range(0, len(lines) - 1, 2)]

class JsonAdapter(SourceAdapter):
    def parse(self, content):
        data = json.loads(content)
        result = []
        for item in data.get("hashes", []):
            title = item.get("title", "")
            hash_val = item.get("hash", "")
            if title and hash_val:
                result.append((title, hash_val))
        return result

class Fetcher:
    def __init__(self):
        self.adapters = {
            "text": PlainTextAdapter(),
            "json": JsonAdapter()
        }

    def fetch(self, source):
        url = source["url"]
        fmt = source.get("format", "text")
        
        response = requests.get(url)
        response.raise_for_status()
        
        adapter = self.adapters.get(fmt)
        if not adapter:
            raise ValueError(f"Formato no soportado: {fmt}")
        
        items = adapter.parse(response.text)
        return items

def limpiar_titulo(titulo):
    # Eliminar cualquier cosa después de " --> " o flechas similares
    if " --> " in titulo:
        titulo = titulo.split(" --> ")[0]
    return titulo.strip()

def main():
    todos_canales = [] # Lista de tuplas (titulo, hash)
    fetcher = Fetcher()
    
    for source in INPUT_SOURCES:
        try:
            url = source["url"]
            enlaces = fetcher.fetch(source)
            num_items = len(enlaces)
            todos_canales.extend(enlaces)
            log(f"Leídos {num_items} canales de {url}")
        except Exception as e:
            log(f"Error procesando {source.get('url')}: {e}")

    if todos_canales:
        try:
            # Limpiar y ordenar
            canales_procesados = []
            for titulo, hash_val in todos_canales:
                canales_procesados.append((limpiar_titulo(titulo), hash_val))
            
            # Ordenar alfabéticamente por título (sin distinguir mayúsculas)
            canales_procesados.sort(key=lambda x: x[0].lower())
            
            # Aplanar para el formato JSON final: [titulo1, hash1, titulo2, hash2, ...]
            resultado_final = []
            for t, h in canales_procesados:
                resultado_final.extend([t, h])
                
            with open(OUTPUT_FILE, "w") as f:
                json.dump(resultado_final, f, indent=2)
            log(f"Actualización completada. Total canales: {len(canales_procesados)}")
        except Exception as e:
            log(f"Error guardando {OUTPUT_FILE}: {e}")
    else:
        log("No se obtuvieron enlaces de ninguna fuente.")

if __name__ == "__main__":
    main()
