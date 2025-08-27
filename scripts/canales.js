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
      navigator.clipboard.writeText(hash)
        .then(() => alert('Hash copiado!'))
        .catch(err => alert('Error copiando hash'));
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
      if(currentHash) window.location.href = `vlc://http//127.0.0.1:6878/ace/manifest.m3u8?id=${currentHash}`;
    });

    const buscador = document.getElementById('buscador');
    buscador.addEventListener('input', () => {
    const texto = buscador.value.toLowerCase();
    document.querySelectorAll('.canal').forEach(canal => {
        const nombre = canal.querySelector('h2').textContent.toLowerCase();
        canal.style.display = nombre.includes(texto) ? 'block' : 'none';
    });
    });
