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
  setupSmoothNavigation();
  loadPortfolio();
  initThreeBackdrop();
  initSpectaclesCursor();
});

const fallbackPortfolio = {
  spotlight: {
    image: './bitmoji-avatar-trimmed.png',
    imageAlt: 'Bitmoji avatar of Krazyy Krunal'
  },
  featured: [
    {
      title: 'AR Home Automation',
      summary: 'A spatial control layer for smart-home interactions with utility at the center.',
      meta: 'Utility XR / Spectacles Prototype',
      img: 'https://github.com/kgediya/spectacles-smart-home-ar/raw/main/assets/demo-preview.gif',
      href: 'https://github.com/kgediya/spectacles-smart-home-ar',
      cta: 'View Build'
    }
  ],
  recent: [
    {
      title: 'Immersive XR Experiments',
      summary: 'Quick updates can be added here as lightweight cards.',
      meta: 'Recent Build',
      img: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif',
      href: 'https://www.linkedin.com/in/krazyykrunal'
    }
  ],
  tools: [
    {
      title: 'XR Planner',
      description: 'A planning tool for immersive build workflows.',
      type: 'Planning Tool',
      href: '/xrplanner/',
      tags: ['Planning', 'Ops', 'XR']
    }
  ],
  social: [
    {
      platform: 'instagram',
      permalink: 'https://www.instagram.com/reel/DL4rk36t4gH/?utm_source=ig_embed&utm_campaign=loading',
      captioned: false,
      label: 'Recent Drop'
    },
    {
      platform: 'instagram',
      permalink: 'https://www.instagram.com/reel/DMOF81vNuJz/?utm_source=ig_embed&utm_campaign=loading',
      captioned: false,
      label: 'Experiment'
    },
    {
      platform: 'instagram',
      permalink: 'https://www.instagram.com/reel/DIOheUktl60/?utm_source=ig_embed&utm_campaign=loading',
      captioned: false,
      label: 'Behind The Build'
    }
  ]
};

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
    Object.entries(menuSubmenus).forEach(([menuId, submenuId]) => {
      const submenu = document.getElementById(submenuId);
      const menu = document.getElementById(menuId);
      if (submenu) submenu.classList.remove('show');
      if (menu) {
        menu.classList.remove('active');
        menu.setAttribute('aria-expanded', 'false');
      }
    });
  };

  Object.entries(menuSubmenus).forEach(([menuId, submenuId]) => {
    const menuBtn = document.getElementById(menuId);
    const submenu = document.getElementById(submenuId);
    if (!menuBtn || !submenu) return;

    menuBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const wasOpen = submenu.classList.contains('show');
      closeAll();
      if (!wasOpen) {
        submenu.classList.add('show');
        menuBtn.classList.add('active');
        menuBtn.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(() => {
          ensureSubmenuVisible(submenu);
        });
      }
    });
  });

  document.addEventListener('click', (event) => {
    const isMenuClick = event.target.closest('.nav-btn') || event.target.closest('.submenu-bar');
    if (!isMenuClick) closeAll();
  });
}

function ensureSubmenuVisible(submenu) {
  const isSmallLayout = window.matchMedia('(max-width: 768px)').matches;
  if (!isSmallLayout || !submenu) return;

  const rect = submenu.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const topPadding = 12;
  const hiddenBelowFold = rect.bottom > viewportHeight - 16;
  const hiddenAboveFold = rect.top < topPadding;

  if (hiddenBelowFold || hiddenAboveFold) {
    smoothScrollToY(window.scrollY + rect.top - topPadding, 700);
  }
}

function setupSmoothNavigation() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      smoothScrollToElement(target, 1100);

      if (history.pushState) {
        history.pushState(null, '', href);
      } else {
        window.location.hash = href;
      }
    });
  });
}

function smoothScrollToElement(element, duration = 1000) {
  const startY = window.scrollY;
  const targetY = element.getBoundingClientRect().top + window.scrollY - 20;
  smoothScrollToY(targetY, duration);
}

function smoothScrollToY(targetY, duration = 1000) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function loadPortfolio() {
  fetch('portfolio-data.json')
    .then((response) => {
      if (!response.ok) throw new Error('Unable to fetch portfolio-data.json');
      return response.json();
    })
    .then((data) => renderPortfolio(normalizePortfolio(data)))
    .catch(() => renderPortfolio(fallbackPortfolio));
}

function normalizePortfolio(data) {
  return {
    spotlight: data?.spotlight || fallbackPortfolio.spotlight,
    featured: Array.isArray(data?.featured) ? data.featured : fallbackPortfolio.featured,
    recent: Array.isArray(data?.recent) ? data.recent : fallbackPortfolio.recent,
    tools: Array.isArray(data?.tools) ? data.tools : fallbackPortfolio.tools,
    social: Array.isArray(data?.social) ? data.social : fallbackPortfolio.social
  };
}

function renderPortfolio(data) {
  renderSpotlight(data.spotlight);
  renderFeatured(data.featured);
  renderRecent(data.recent);
  renderTools(data.tools);
  renderSocial(data.social);
  enableCardTilt();
}

function renderSpotlight(spotlight) {
  const root = document.getElementById('hero-spotlight');
  if (!root || !spotlight) return;

  const safeImage = escapeAttribute(spotlight.image || './bitmoji-avatar-trimmed.png');
  const safeImageAlt = escapeHtml(spotlight.imageAlt || 'Krazyy Krunal avatar');

  root.innerHTML = `
    <div class="spotlight-avatar-shell">
      <img class="spotlight-avatar" src="${safeImage}" alt="${safeImageAlt}">
    </div>
  `;
}

function renderFeatured(items) {
  const root = document.getElementById('featured-gallery');
  if (!root) return;

  if (!items.length) {
    root.innerHTML = '<div class="section-empty">Add featured projects in <code>portfolio-data.json</code>.</div>';
    return;
  }

  root.innerHTML = items
    .map((item, index) => {
      const safeTitle = escapeHtml(item.title || 'XR Project');
      const safeSummary = escapeHtml(item.summary || '');
      const safeMeta = escapeHtml(item.meta || '');
      const safeImg = escapeHtml(item.img || '');
      const safeHref = escapeAttribute(item.href || '#');
      const external = isExternalLink(item.href);
      return `
        <a class="feature-card reveal" style="--delay:${(index % 8) * 60}ms" href="${safeHref}" target="${external ? '_blank' : '_self'}" rel="${external ? 'noopener noreferrer' : ''}">
          <img src="${safeImg}" alt="${safeTitle}" loading="lazy" decoding="async">
          <div class="feature-body">
            <p class="feature-meta">${safeMeta}</p>
            <h3 class="feature-title">${safeTitle}</h3>
            <p class="feature-summary">${safeSummary}</p>
          </div>
        </a>
      `;
    })
    .join('');
}

function renderRecent(items) {
  const root = document.getElementById('project-gallery');
  if (!root) return;

  if (!items.length) {
    root.innerHTML = '<div class="section-empty">Add recent builds in <code>portfolio-data.json</code>.</div>';
    return;
  }

  root.innerHTML = items
    .map((item, index) => {
      const safeTitle = escapeHtml(item.title || 'XR Project');
      const safeSummary = escapeHtml(item.summary || '');
      const safeMeta = escapeHtml(item.meta || '');
      const safeImg = escapeHtml(item.img || '');
      const safeHref = escapeAttribute(item.href || '#');
      const external = isExternalLink(item.href);
      return `
        <a class="work-card reveal" style="--delay:${(index % 10) * 55}ms" href="${safeHref}" target="${external ? '_blank' : '_self'}" rel="${external ? 'noopener noreferrer' : ''}">
          <img src="${safeImg}" alt="${safeTitle}" loading="lazy" decoding="async">
          <div class="work-body">
            <p class="work-meta">${safeMeta}</p>
            <h3 class="work-title">${safeTitle}</h3>
            <p class="work-summary">${safeSummary}</p>
          </div>
        </a>
      `;
    })
    .join('');
}

function renderTools(items) {
  const root = document.getElementById('tool-gallery');
  if (!root) return;

  if (!items.length) {
    root.innerHTML = '<div class="section-empty">Add tools in <code>portfolio-data.json</code>.</div>';
    return;
  }

  root.innerHTML = items
    .map((item, index) => {
      const safeTitle = escapeHtml(item.title || 'Tool');
      const safeDescription = escapeHtml(item.description || '');
      const safeType = escapeHtml(item.type || 'Tool');
      const safeHref = escapeAttribute(item.href || '#');
      const external = isExternalLink(item.href);
      return `
        <a class="tool-card reveal" style="--delay:${(index % 10) * 45}ms" href="${safeHref}" target="${external ? '_blank' : '_self'}" rel="${external ? 'noopener noreferrer' : ''}">
          <div class="tool-body">
            <p class="tool-type">${safeType}</p>
            <h3 class="tool-title">${safeTitle}</h3>
            <p class="tool-description">${safeDescription}</p>
          </div>
        </a>
      `;
    })
    .join('');
}

function renderSocial(items) {
  const root = document.getElementById('social-feed');
  if (!root) return;

  if (!items.length) {
    root.innerHTML = '<div class="section-empty">Add social embeds in <code>portfolio-data.json</code>.</div>';
    return;
  }

  root.innerHTML = items
    .map((item, index) => {
      if ((item.platform || '').toLowerCase() === 'instagram' && item.permalink) {
        const safePermalink = escapeAttribute(item.permalink);
        const captioned = item.captioned ? ' data-instgrm-captioned' : '';
        const safeLabel = escapeHtml(item.label || 'Instagram');
        return `
          <article class="embed-card reveal" style="--delay:${(index % 10) * 45}ms">
            <div class="embed-card-head">
              <p class="embed-label">${safeLabel}</p>
              <a class="embed-link" href="${safePermalink}" target="_blank" rel="noopener noreferrer">Open</a>
            </div>
            <blockquote class="instagram-media"${captioned} data-instgrm-permalink="${safePermalink}" data-instgrm-version="14"></blockquote>
          </article>
        `;
      }

      const safeTitle = escapeHtml(item.fallbackTitle || 'Social post');
      const safeDescription = escapeHtml(item.fallbackDescription || 'Embed unavailable for this platform.');
      return `
        <article class="embed-card reveal" style="--delay:${(index % 10) * 45}ms">
          <div class="embed-fallback">
            <h3 class="social-title">${safeTitle}</h3>
            <p class="log-copy">${safeDescription}</p>
          </div>
        </article>
      `;
    })
    .join('');
  processInstagramEmbeds();
}

function processInstagramEmbeds() {
  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
    return;
  }

  if (document.querySelector('script[data-instgrm-loader]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.instagram.com/embed.js';
  script.setAttribute('data-instgrm-loader', 'true');
  script.onload = () => {
    if (window.instgrm?.Embeds?.process) {
      window.instgrm.Embeds.process();
    }
  };
  document.body.appendChild(script);
}

function enableCardTilt() {
  const cards = document.querySelectorAll('.feature-card, .work-card, .tool-card, .social-card');
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
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.16 })
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

function initSpectaclesCursor() {
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursor = document.getElementById('spectacles-cursor');
  if (!supportsFinePointer || !cursor) return;

  document.body.classList.add('cursor-active');

  const state = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };

  window.addEventListener('pointermove', (event) => {
    state.x = event.clientX;
    state.y = event.clientY;
    cursor.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`;
  });

  document.addEventListener('pointerover', (event) => {
    const hoverable = event.target.closest('a, button, .nav-btn, .tool-card, .work-card, .feature-card');
    document.body.classList.toggle('cursor-hover', Boolean(hoverable));
  });

  document.addEventListener('pointerleave', () => {
    document.body.classList.remove('cursor-hover');
  });

  cursor.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`;
}

function isExternalLink(href) {
  return typeof href === 'string' && /^(https?:)?\/\//.test(href);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
