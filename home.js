const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');

    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? '×' : '☰';
  });

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = '☰';
    });
  });
}

const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const coin = document.getElementById('profileCoin');

const frontDuration = 7000;
const backDuration = 5000;
const flipDuration = 1400;

function flipToBack() {
  if (!coin) return;

  coin.classList.add('is-flipping');

  setTimeout(() => {
    coin.classList.remove('is-flipping');

    setTimeout(() => {
      flipToFront();
    }, backDuration);
  }, flipDuration);
}

function flipToFront() {
  if (!coin) return;

  coin.classList.remove('is-flipping');

  setTimeout(() => {
    flipToBack();
  }, frontDuration);
}

if (coin) {
  setTimeout(flipToBack, frontDuration);
}


/**
 * CAROUSEL 
 */

const projectGrid = document.querySelector('.project-grid');
const projectCards = document.querySelectorAll('.project');
const previousButton = document.querySelector('.carousel-button.previous');
const nextButton = document.querySelector('.carousel-button.next');
const carouselStatus = document.querySelector('.carousel-status');

let currentProject = 0;

function updateCarousel() {
  projectCards.forEach((card, index) => {
    const isActive = index === currentProject;

    card.classList.toggle('active', isActive);
    card.setAttribute('aria-hidden', String(!isActive));
  });

  if (carouselStatus) {
    carouselStatus.textContent =
      `${currentProject + 1} / ${projectCards.length}`;
  }

  if (previousButton) {
    previousButton.disabled = currentProject === 0;
  }

  if (nextButton) {
    nextButton.disabled =
      currentProject === projectCards.length - 1;
  }
}

function showNextProject() {
  if (currentProject < projectCards.length - 1) {
    currentProject += 1;
    updateCarousel();
  }
}

function showPreviousProject() {
  if (currentProject > 0) {
    currentProject -= 1;
    updateCarousel();
  }
}

if (projectGrid && projectCards.length > 0) {
  previousButton?.addEventListener('click', showPreviousProject);
  nextButton?.addEventListener('click', showNextProject);

  updateCarousel();
}


/**
 * EMAIL
 */

const emailLink = document.getElementById('email-link');

if (emailLink) {
  const email = [
    'ferrigno',
    '.giulia02',
    '@',
    'gmail',
    '.com'
  ].join('');

  emailLink.href = `mailto:${email}`;
}