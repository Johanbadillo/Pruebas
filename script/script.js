function createMeteor() {
    const meteor = document.createElement('div');
    meteor.className = 'meteor';

    const startX = Math.random() * window.innerWidth;
    meteor.style.left = startX + 'px';
    meteor.style.top = '0px';

    const size = Math.random() * 20 + 8; // 2 a 6px
    meteor.style.setProperty('--size', size + 'px');

    const offsetX = (Math.random() - 0.5) * 200; // -100 a 100px para el movimiento horizontal
    const offsetY = window.innerHeight + Math.random() * 100; // Asegurarse de que lleguen al fondo
    meteor.style.setProperty('--offset-x', offsetX + 'px');
    meteor.style.setProperty('--offset-y', offsetY + 'px');

    const duration = Math.random() * 1 + 3; // 1 a 3 segundos
    meteor.style.animationDuration = duration + 's';

    document.getElementById('meteors').appendChild(meteor);
    setTimeout(() => meteor.remove(), duration * 1000);
}

function spawnMeteors() {
    createMeteor();
    const nextSpawn = Math.random() * 500 + 100; // 100 a 600ms
    setTimeout(spawnMeteors, nextSpawn);
}

spawnMeteors();