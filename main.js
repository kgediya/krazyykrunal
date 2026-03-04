document.addEventListener('DOMContentLoaded', () => {
  const greetings = [
    'Kem cho',
    'Namaste',
    'Hola',
    'Bonjour',
    'Ciao',
    'Salaam',
    'Hello'
  ];

  rotateGreetings(greetings);
  setupMenus();
  loadGallery();
  initThreeBackdrop();
});

function rotateGreetings(greetings) {
  const greetingEl = document.getElementById('greeting-anim');
  if (!greetingEl) return;

  let currentIndex = 0;
  greetingEl.textContent = greetings[currentIndex];

  setInterval(() => {
    greetingEl.style.opacity = '0';
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % greetings.length;
      greetingEl.textContent = greetings[currentIndex];
      greetingEl.style.opacity = '1';
    }, 220);
  }, 2300);
}

function setupMenus() {
  const menuSubmenus = {
    'menu-connect': 'connect-submenu',
    'menu-tools': 'tools-submenu'
  };

  const closeAll = () => {
    Object.values(menuSubmenus).forEach((submenuId) => {
      const submenu = document.getElementById(submenuId);
      if (submenu) submenu.classList.remove('show');
    });

    Object.keys(menuSubmenus).forEach((menuId) => {
      const menu = document.getElementById(menuId);
      if (menu) menu.classList.remove('active');
    });
  };

  Object.keys(menuSubmenus).forEach((menuId) => {
    const menuBtn = document.getElementById(menuId);
    const submenu = document.getElementById(menuSubmenus[menuId]);
    if (!menuBtn || !submenu) return;

    menuBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const wasOpen = submenu.classList.contains('show');
      closeAll();
      if (!wasOpen) {
        submenu.classList.add('show');
        menuBtn.classList.add('active');
      }
    });
  });

  document.addEventListener('click', (event) => {
    const isMenuClick = event.target.closest('.nav-btn') || event.target.closest('.submenu-bar');
    if (!isMenuClick) closeAll();
  });
}

function loadGallery() {
  fetch('gifs.json')
    .then((response) => {
      if (!response.ok) throw new Error('Unable to fetch gifs.json');
      return response.json();
    })
    .then((projects) => {
      if (!Array.isArray(projects)) throw new Error('Invalid gallery format');
      renderGallery(projects);
    })
    .catch(() => {
      renderGallery([
        { title: 'Immersive AR Experience', img: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif' },
        { title: 'Gamified Product Story', img: 'https://media.giphy.com/media/3o7aCVpPjgTP2gFzA0/giphy.gif' },
        { title: 'Realtime 3D Lens UI', img: 'https://media.giphy.com/media/26tknCqiJrBQG6bxC/giphy.gif' }
      ]);
    });
}

function renderGallery(projects) {
  const gallery = document.getElementById('project-gallery');
  if (!gallery) return;

  gallery.innerHTML = projects
    .map((project, index) => {
      const safeTitle = escapeHtml(project.title || 'XR Project');
      const safeImg = escapeHtml(project.img || '');
      return `
        <article class="work-card reveal" style="--delay:${(index % 10) * 55}ms">
          <img src="${safeImg}" alt="${safeTitle}" loading="lazy" decoding="async">
          <p class="work-title">${safeTitle}</p>
        </article>
      `;
    })
    .join('');

  enableCardTilt();
}

function enableCardTilt() {
  const cards = document.querySelectorAll('.work-card');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 10;

      card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
}

function initThreeBackdrop() {
  if (!window.THREE) return;

  const canvas = document.getElementById('scene-bg');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6.8);

  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  const particleGeo = new THREE.BufferGeometry();
  const count = 1400;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const radius = 1.4 + Math.random() * 2.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.65 })
  );
  mainGroup.add(particles);

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.35, 0.3, 180, 26),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.14 })
  );
  mainGroup.add(knot);

  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.3, 0)),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
  );
  mainGroup.add(frame);

  const mouse = { x: 0, y: 0 };
  window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resize);
  resize();

  let rafId = 0;

  function animate() {
    if (!reduceMotion) {
      particles.rotation.y += 0.0013;
      particles.rotation.x += 0.0008;
      knot.rotation.x += 0.0016;
      knot.rotation.y += 0.002;
      frame.rotation.x -= 0.0012;
      frame.rotation.y += 0.001;

      mainGroup.rotation.y += (mouse.x * 0.25 - mainGroup.rotation.y) * 0.02;
      mainGroup.rotation.x += (mouse.y * 0.2 - mainGroup.rotation.x) * 0.02;
    }

    renderer.render(scene, camera);
    rafId = window.requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('beforeunload', () => {
    window.cancelAnimationFrame(rafId);
    renderer.dispose();
    particleGeo.dispose();
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
