const track = document.querySelector('.horizontal-track');
const screens = [...document.querySelectorAll('.screen')];
const links = [...document.querySelectorAll('[data-index]')];
const currentLabel = document.querySelector('.scene-progress .current');
const previous = document.querySelector('.previous');
const next = document.querySelector('.next');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let active = 0;
let locked = false;
let touchStartX = 0;
let touchStartY = 0;

function moveTo(index) {
  const target = Math.max(0, Math.min(index, screens.length - 1));
  if (target === active || locked) return;
  active = target;
  locked = true;
  screens.forEach((screen, screenIndex) => screen.classList.toggle('is-active', screenIndex === active));
  track.style.transform = `translate3d(${-active * 100}vw, 0, 0)`;
  currentLabel.textContent = String(active + 1).padStart(2, '0');
  links.forEach((link) => link.classList.toggle('active', Number(link.dataset.index) === active));
  previous.disabled = active === 0;
  next.disabled = active === screens.length - 1;
  window.setTimeout(() => { locked = false; }, reduceMotion ? 80 : 850);
}

links.forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  moveTo(Number(link.dataset.index));
  document.querySelector('.header')?.classList.remove('menu-open');
  document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
}));
previous.addEventListener('click', () => moveTo(active - 1));
next.addEventListener('click', () => moveTo(active + 1));
window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') moveTo(active + 1);
  if (event.key === 'ArrowLeft') moveTo(active - 1);
});
window.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && Math.abs(event.deltaY) > 18) {
    event.preventDefault();
    moveTo(active + (event.deltaY > 0 ? 1 : -1));
  }
}, { passive: false });
window.addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;
}, { passive: true });
window.addEventListener('touchend', (event) => {
  const endX = event.changedTouches[0].screenX;
  const endY = event.changedTouches[0].screenY;
  const distanceX = endX - touchStartX;
  if (Math.abs(distanceX) > 45 && Math.abs(distanceX) > Math.abs(endY - touchStartY)) moveTo(active + (distanceX < 0 ? 1 : -1));
}, { passive: true });
previous.disabled = true;
next.disabled = false;
screens[0].classList.add('is-active');
const menuButton = document.querySelector('.menu-toggle');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  document.querySelector('.header')?.classList.toggle('menu-open', open);
});

document.querySelectorAll('.service-list button, .destination-list button').forEach((button) => {
  button.addEventListener('mouseenter', () => {
    button.parentElement.querySelectorAll('button').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
  });
});
const fleetSpecs = {
  'SUV PREMIUM': ['Hasta 6 pasajeros', 'Equipaje incluido', 'Aire acondicionado', 'Interior premium'],
  'EXECUTIVE SEDAN': ['Hasta 4 pasajeros', 'Ideal para ejecutivos', 'Máximo confort', 'Equipaje incluido'],
  'PRIVATE VAN': ['Hasta 10 pasajeros', 'Ideal para grupos', 'Amplio espacio', 'Aire acondicionado']
  ,'LUXURY MINIVAN': ['Hasta 7 pasajeros', 'Confort para grupos pequeños', 'Equipaje incluido', 'Conductor profesional']
  ,'EXECUTIVE SPRINTER': ['Hasta 14 pasajeros', 'Ideal para grupos grandes', 'Amplio espacio', 'Aire acondicionado']
};
document.querySelectorAll('.vehicle-selector button, .fleet-gallery button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.vehicle-selector button, .fleet-gallery button').forEach((item) => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('selected');
    button.setAttribute('aria-pressed', 'true');
    const name = button.dataset.vehicle;
    document.querySelector('.fleet-name').textContent = name;
    document.querySelector('.fleet-details ul').innerHTML = fleetSpecs[name].map((item) => `<li>${item}</li>`).join('');
    document.querySelector('.fleet-capacity').textContent = ({'SUV PREMIUM':'6 PASAJEROS','EXECUTIVE SEDAN':'4 PASAJEROS','PRIVATE VAN':'10 PASAJEROS','LUXURY MINIVAN':'7 PASAJEROS','EXECUTIVE SPRINTER':'14 PASAJEROS'})[name];
    document.querySelector('.fleet-description').textContent = ({'SUV PREMIUM':'Espaciosa, cómoda y diseñada para viajes privados, ejecutivos o familiares.','EXECUTIVE SEDAN':'Diseñado para traslados privados con máxima discreción y confort.','PRIVATE VAN':'Amplia y cómoda para familias, grupos y trayectos compartidos.','LUXURY MINIVAN':'Confort refinado para grupos pequeños y traslados personalizados.','EXECUTIVE SPRINTER':'Espacio y presencia para grupos grandes y transporte corporativo.'})[name];
    document.querySelector('.fleet-photo').dataset.vehicle = name.toLowerCase().replaceAll(' ', '-');
  });
});
document.querySelector('#booking-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector('.form-message');
  if (!form.checkValidity()) { message.textContent = 'Por favor completa los campos requeridos.'; form.reportValidity(); return; }
  message.textContent = 'Solicitud recibida. Nos pondremos en contacto contigo para confirmar los detalles del viaje.';
  form.reset();
});

const aboutVideo = document.querySelector('.about-video');
const useAboutFallback = () => aboutVideo?.classList.add('is-unavailable');
aboutVideo?.addEventListener('error', useAboutFallback);
aboutVideo?.querySelectorAll('source').forEach((source) => source.addEventListener('error', useAboutFallback));


const destinationVideos = [...document.querySelectorAll('.destination-video')];
const destinationButtons = [...document.querySelectorAll('[data-destination]')];
let destinationVideoIndex = 0;
function activateDestination(slug) {
  destinationButtons.forEach((button) => button.classList.toggle('selected', button.dataset.destination === slug));
  if (window.matchMedia('(max-width: 850px), (prefers-reduced-motion: reduce)').matches) return;
  const current = destinationVideos[destinationVideoIndex];
  const incoming = destinationVideos[1 - destinationVideoIndex];
  incoming.classList.remove('ready');
  incoming.poster = `assets/images/${slug}-poster.webp`;
  incoming.src = `assets/videos/${slug}.mp4`;
  incoming.load();
  const reveal = () => {
    incoming.classList.add('ready', 'active');
    incoming.play().catch(() => {});
    current.classList.remove('active', 'ready');
    current.pause();
    destinationVideoIndex = 1 - destinationVideoIndex;
  };
  incoming.addEventListener('canplay', reveal, { once: true });
}
destinationButtons.forEach((button) => {
  button.addEventListener('click', () => activateDestination(button.dataset.destination));
  button.addEventListener('mouseenter', () => activateDestination(button.dataset.destination));
});
activateDestination('santo-domingo');
