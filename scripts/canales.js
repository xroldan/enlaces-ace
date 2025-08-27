let currentHash = null;

// Detectar si es dispositivo móvil
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// Cargar canales
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
      <div class="botones-canal">
        <button class="boton boton-copiar" onclick="copiarHash('${i}')" data-tooltip="Copiar hash">
          ${isMobile ? '📋' : 'Copiar'}
        </button>
        <button class="boton boton-reproducir" onclick="abrirPopup('${hash}')" data-tooltip="Reproducir">
          ${isMobile ? '▶️' : 'Reproducir'}
        </button>
      </div>
    `;

    list.appendChild(li);
  }
})
.catch(error => {
  console.error('Error cargando canales:', error);
  mostrarToast('Error cargando canales', 'error');
});

// Función para copiar hash
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

// Función fallback para copiar texto
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

// Función para mostrar toast
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

// Función para abrir popup
function abrirPopup(hash) {
  currentHash = hash;
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('popup').style.display = 'block';
  
  // En móviles, prevenir scroll del body
  if (isMobile) {
    document.body.style.overflow = 'hidden';
  }
}

// Función para cerrar popup
function cerrarPopup() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('popup').style.display = 'none';
  currentHash = null;
  
  // Restaurar scroll en móviles
  if (isMobile) {
    document.body.style.overflow = '';
  }
}

// Event listeners para el popup
document.getElementById('btn-cerrar').addEventListener('click', cerrarPopup);
document.getElementById('overlay').addEventListener('click', cerrarPopup);

// Botón AceStream
document.getElementById('btn-acestream').addEventListener('click', () => {
  if(currentHash) {
    try {
      window.location.href = `acestream://${currentHash}`;
      mostrarToast('Abriendo AceStream...', 'success');
    } catch (error) {
      mostrarToast('Error abriendo AceStream', 'error');
    }
    cerrarPopup();
  }
});

// Botón VLC
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
    cerrarPopup();
  }
});

// Buscador con debounce para mejor rendimiento
let searchTimeout;
const buscador = document.getElementById('buscador');
buscador.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    const texto = e.target.value.toLowerCase().trim();
    const canales = document.querySelectorAll('.canal');
    
    canales.forEach(canal => {
      const nombre = canal.querySelector('h2').textContent.toLowerCase();
      const hash = canal.querySelector('.hash').textContent.toLowerCase();
      
      // Buscar tanto en nombre como en hash
      const coincide = nombre.includes(texto) || hash.includes(texto);
      
      if (coincide) {
        canal.style.display = 'block';
        canal.style.animation = 'fadeIn 0.3s ease';
      } else {
        canal.style.display = 'none';
      }
    });
    
    // Mostrar contador de resultados
    const resultados = document.querySelectorAll('.canal[style*="block"]').length;
    if (texto) {
      mostrarToast(`${resultados} canal${resultados !== 1 ? 'es' : ''} encontrado${resultados !== 1 ? 's' : ''}`, 'success');
    }
  }, 300);
});

// Limpiar búsqueda con Escape
buscador.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    buscador.value = '';
    buscador.dispatchEvent(new Event('input'));
    buscador.blur();
  }
});

// Mejorar experiencia táctil en móviles
if (isMobile) {
  // Agregar feedback táctil
  document.addEventListener('touchstart', function() {}, {passive: true});
  
  // Prevenir zoom en inputs
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.style.fontSize = '16px'; // Previene zoom en iOS
    });
  });
  
  // Mejorar scroll en la lista de canales
  const canalesList = document.getElementById('canales-list');
  canalesList.style.webkitOverflowScrolling = 'touch';
}

// Función para detectar cambios de orientación
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    // Ajustar layout después del cambio de orientación
    window.scrollTo(0, 0);
  }, 100);
});

// Función para detectar cambios de tamaño de ventana
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Reajustar layout si es necesario
    if (window.innerWidth <= 768 && !isMobile) {
      location.reload(); // Recargar para aplicar estilos móviles
    }
  }, 250);
});

// Agregar animación de entrada para los canales
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Aplicar animación de entrada a los canales existentes
document.addEventListener('DOMContentLoaded', () => {
  const canales = document.querySelectorAll('.canal');
  canales.forEach(canal => {
    canal.style.opacity = '0';
    canal.style.transform = 'translateY(20px)';
    canal.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(canal);
  });
});

// Agregar CSS para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .botones-canal {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  @media (max-width: 480px) {
    .botones-canal {
      flex-direction: column;
      align-items: center;
    }
    
    .boton {
      width: 100%;
      max-width: 200px;
    }
  }
`;
document.head.appendChild(style);

// Registrar service worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registrado exitosamente:', registration.scope);
      })
      .catch(error => {
        console.log('Error registrando SW:', error);
      });
  });
}
