let currentHash = null;

    fetch('data/canales.json')
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById('canales-list');
      for (let i = 0; i < data.length; i += 2) {
        const nombre = data[i];
        const hash = data[i + 1];

        const li = document.createElement('li');
        li.className = 'canal';

        li.innerHTML = `
          <h2>${nombre}</h2>
          <div class="hash" id="hash-${i}">${hash}</div>
          <button class="boton" onclick="copiarHash('${i}')">Copiar</button>
          <button class="boton" onclick="abrirPopup('${hash}')">Reproducir</button>
        `;

        list.appendChild(li);
      }
    })
    .catch(error => console.error('Error cargando canales:', error));

    function copiarHash(i) {
      const hash = document.getElementById(`hash-${i}`).textContent;
      
      // Método 1: Usar navigator.clipboard (más moderno, sin popups)
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(hash)
          .then(() => mostrarToast('Enlace copiado!', 'success'))
          .catch(err => {
            // Si falla, usar método alternativo
            copiarTextoFallback(hash);
          });
      } else {
        // Método 2: Fallback para navegadores más antiguos
        copiarTextoFallback(hash);
      }
    }

    function copiarTextoFallback(texto) {
      try {
        // Crear un elemento temporal
        const textArea = document.createElement('textarea');
        textArea.value = texto;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        // Intentar copiar
        const exitoso = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (exitoso) {
          mostrarToast('Enlace copiado!', 'success');
        } else {
          mostrarToast('Error copiando enlace', 'error');
        }
      } catch (err) {
        mostrarToast('Error copiando enlace', 'error');
      }
    }

    function mostrarToast(mensaje, tipo = 'success') {
      const toastContainer = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast ${tipo}`;
      toast.textContent = mensaje;
      
      toastContainer.appendChild(toast);
      
      // Mostrar el toast con animación
      setTimeout(() => toast.classList.add('show'), 100);
      
      // Ocultar y eliminar después de 3 segundos
      setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }, 3000);
    }

    function abrirPopup(hash) {
      currentHash = hash;
      document.getElementById('overlay').style.display = 'block';
      document.getElementById('popup').style.display = 'block';
    }

    document.getElementById('btn-cerrar').addEventListener('click', cerrarPopup);
    document.getElementById('overlay').addEventListener('click', cerrarPopup);

    function cerrarPopup() {
      document.getElementById('overlay').style.display = 'none';
      document.getElementById('popup').style.display = 'none';
      currentHash = null;
    }

    document.getElementById('btn-acestream').addEventListener('click', () => {
      if(currentHash) window.location.href = `acestream://${currentHash}`;
    });

    document.getElementById('btn-vlc').addEventListener('click', () => {
      if(currentHash) {
        const streamUrl = `http://127.0.0.1:6878/ace/manifest.m3u8?id=${currentHash}`;
        
        // Usar el mismo sistema robusto de copia
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(streamUrl)
            .then(() => mostrarToast('URL del stream copiada! Pégala en VLC', 'success'))
            .catch(err => {
              copiarTextoFallback(streamUrl);
            });
        } else {
          copiarTextoFallback(streamUrl);
        }
      }
    });

    const buscador = document.getElementById('buscador');
    buscador.addEventListener('input', () => {
    const texto = buscador.value.toLowerCase();
    document.querySelectorAll('.canal').forEach(canal => {
        const nombre = canal.querySelector('h2').textContent.toLowerCase();
        canal.style.display = nombre.includes(texto) ? 'block' : 'none';
    });
    });
