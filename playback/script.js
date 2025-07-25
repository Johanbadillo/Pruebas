const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const albumCover = document.querySelector('.album-cover');

playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = 'Pause';
    albumCover.classList.add('rotate');
  } else {
    audio.pause();
    playPauseBtn.textContent = 'Play';
    albumCover.classList.remove('rotate');
  }
});

audio.addEventListener('loadedmetadata', () => {
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress;
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('ended', () => {
  playPauseBtn.textContent = 'Play';
  albumCover.classList.remove('rotate');
});

progressBar.addEventListener('input', () => {
  const time = (progressBar.value / 100) * audio.duration;
  audio.currentTime = time;
});

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value / 100;
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}