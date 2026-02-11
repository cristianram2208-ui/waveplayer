// 1. SELECCIÓN DE ELEMENTOS (Lo primero que lee JS)
// Guardo los elementos en variables para no buscarlos todo el rato 
const grid = document.getElementById('grid-canciones');
const reproductor = document.getElementById('reproductor');
const audioTag = document.getElementById('audioTag');
const tituloPlayer = document.getElementById('titulo-player');
const btnPlay = document.getElementById('btnPlay');
const barra = document.getElementById('barraProgreso');
const tiempoTxt = document.getElementById('tiempoActual');

// 2. CARGA INICIAL (Al abrir la web)
document.addEventListener('DOMContentLoaded', () => {
    // Aseguro que el reproductor esté oculto al arrancar
    reproductor.classList.add('oculto'); 

    // Uso fetch para pillar el JSON local
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            let cancionesJSON = data.canciones;

            // Recupero las canciones que guardó el usuario en su navegador
            // Si no hay nada, devuelvo un array vacío para que no de error
            let cancionesUser = JSON.parse(localStorage.getItem('playlistUser')) || [];

            // Concateno (junto) las dos listas
            let listaTotal = cancionesJSON.concat(cancionesUser);

            pintarCanciones(listaTotal);
        })
        .catch(error => console.error("Error cargando datos:", error));
});

// 3. Pintar las tarjetas
function pintarCanciones(lista) {
    grid.innerHTML = ''; // Limpio por si acaso

    lista.forEach(cancion => {
        // Creo el div de la tarjeta
        const div = document.createElement('div');
        div.className = 'tarjeta';
        // Esto es para accesibilidad: permite seleccionar con TAB
        div.setAttribute('tabindex', '0'); 

        // Preparo el botón de borrar SOLO si es del usuario
        let botonBorrar = '';
        if (cancion.esUsuario) {
            // El stopPropagation es clave: evita que al borrar suene la música
            botonBorrar = `<button class="btn-borrar" onclick="borrarCancion('${cancion.titulo}', event)">
                             <i class="fas fa-trash"></i>
                           </button>`;
        }

        // Inyecto el HTML. Uso onerror en la img por si el link falla, que cargue la default
        div.innerHTML = `
            ${botonBorrar}
            <img src="${cancion.imagen}" alt="${cancion.titulo}" onerror="this.src='assets/img/default.jpg'" loading="lazy">
            <h3>${cancion.titulo}</h3>
            <p>${cancion.artista}</p>
        `;

        // Evento Click: Cargar la canción
        div.addEventListener('click', () => cargarYReproducir(cancion));

        // Evento Teclado: Para gente que no usa ratón (Accesibilidad)
        div.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                cargarYReproducir(cancion);
            } 
        });

        grid.appendChild(div);
    });
}

// 4. Lógica de reproducción.
function cargarYReproducir(cancion) {
    audioTag.src = cancion.audio;
    tituloPlayer.innerText = cancion.titulo;
    
    // Muestro el reproductor (le quito la clase oculto)
    reproductor.classList.remove('oculto');
    
    audioTag.play();
    btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
}

// 5. CONTROLES DEL REPRODUCTOR (Botones y barra)
function togglePlay() {
    if (audioTag.paused) {
        audioTag.play();
        btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioTag.pause();
        btnPlay.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Manipulo el currentTime para saltar en el tiempo
function saltar(segundos) {
    audioTag.currentTime += segundos;
}

// BARRA DE PROGRESO 
// Actualizo la barra y el texto 
// cada vez que avanza el audio (cada segundo)
audioTag.addEventListener('timeupdate', () => {
    // La duración de la canción
    barra.max = audioTag.duration;

    // El segundo y minuto actual de la canción
    barra.value = audioTag.currentTime;

    // Como el audio te lo da en segundos, 
    // convertimos cada 60 segundos en un minuto
    let mins = Math.floor(audioTag.currentTime / 60);
    let segs = Math.floor(audioTag.currentTime % 60);

    // Poner el 0 delante cuando
    // sea menos de 10 segundos
    if(segs < 10) {
      segs = '0' + segs;  
    }
    tiempoTxt.innerText = `${mins}:${segs}`;
});

// Permite arrastrar la barra para cambiar el momento de la canción
barra.addEventListener('input', () => {
    audioTag.currentTime = barra.value;
});

// 6. GESTIÓN DE CANCIONES (Añadir y Borrar)
//AÑADIR CANCIÓN
function anadirCancion() {
    const titulo = document.getElementById('userTitulo').value;
    const audio = document.getElementById('userAudio').value;
    const img = document.getElementById('userImagen').value;

    // Validación simple
    if (!titulo || !audio) {
        alert("Falta el título o el audio.");
        return;
    }

    // Creo el objeto
    const nueva = {
        titulo: titulo,
        artista: "Mi Selección",
        imagen: img || 'assets/img/default.jpg', // Si no pone imagen, uso la default
        audio: audio,
        esUsuario: true // Marco importante para saber que se puede borrar
    };

    // Guardo en el navegador
    let cancionesUser = JSON.parse(localStorage.getItem('playlistUser')) || [];
    cancionesUser.push(nueva);
    localStorage.setItem('playlistUser', JSON.stringify(cancionesUser));

    // Recargo para ver los cambios
    location.reload();
}

// BORRAR CANCIÓN 
function borrarCancion(tituloBorrar, evento) {
    // Paro el evento para que no llegue a la tarjeta (si no, sonaría la música)
    evento.stopPropagation(); 

    if(confirm("¿Seguro que quieres borrarla?")) {
        let cancionesUser = JSON.parse(localStorage.getItem('playlistUser')) || [];
        
        // Filtro: me quedo con todas MENOS la que quiero borrar
        let actualizadas = cancionesUser.filter(c => c.titulo !== tituloBorrar);
        
        localStorage.setItem('playlistUser', JSON.stringify(actualizadas));
        location.reload();
    }
}