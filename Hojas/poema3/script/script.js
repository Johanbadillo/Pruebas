function ocultarImagen() {
    document.getElementById('portada').classList.add('caida');
    document.getElementById('titulo1').classList.add('caida');
    document.getElementById('btnReinicio').classList.add('visible');
}

function reiniciar() {
    document.getElementById('portada').classList.remove('caida');
    document.getElementById('titulo1').classList.remove('caida');
    document.getElementById('btnReinicio').classList.remove('visible');
}