function ocultarImagen() {
    document.getElementById('portada').classList.add('caida');
    document.getElementById('decoracion').classList.add('caida');
    document.getElementById('btnReset').classList.add('visible');
}

function reiniciar() {
    document.getElementById('portada').classList.remove('caida');
    document.getElementById('decoracion').classList.remove('caida');
    document.getElementById('btnReset').classList.remove('visible');
}

