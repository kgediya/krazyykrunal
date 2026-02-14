import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js";

const panels = [
  document.getElementById("panel-1"),
  document.getElementById("panel-2"),
  document.getElementById("panel-3")
];
const progressFill = document.getElementById("progress-fill");
const stepChips = [
  document.getElementById("step-1"),
  document.getElementById("step-2"),
  document.getElementById("step-3")
];

const countdownEls = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  note: document.getElementById("countdown-note"),
  target: document.getElementById("countdown-target-text")
};

const londonTimeEl = document.getElementById("london-time");
const istTimeEl = document.getElementById("ist-time");
const yesMessage = document.getElementById("yes-message");
const invitationStage = document.getElementById("invitation-stage");
const particlesRoot = document.getElementById("love-particles");
const memoryLightbox = document.getElementById("memory-lightbox");
const memoryImage = document.getElementById("memory-image");
const closeMemoryBtn = document.getElementById("close-memory");
const galleryToast = document.getElementById("gallery-toast");
const romanticLaunch = document.getElementById("romantic-launch");
const romanticLaunchLine = document.getElementById("romantic-launch-line");
const romanticLaunchCount = document.getElementById("romantic-launch-count");
const galleryAudio = new Audio("./backgroundmusic/Ham%20Tere%20Pyaar%20Main.mp3");
galleryAudio.loop = true;
galleryAudio.volume = 0.42;
galleryAudio.preload = "auto";

let activePanel = 0;
const defaultGalleryFolder = "./photos";
const isGithubPagesHost = /github\.io$/i.test(window.location.hostname);
let galleryToastTimer = 0;
let coreTapReminderTimer = 0;
let audioUnlockAttached = false;
let orbitGreetingShown = false;
let hasAutoOpenedGallery = false;
let preLaunchRunning = false;
let countdownStartedExpired = false;
let launchTimer = 0;
let launchHideTimer = 0;
let galleryPreloadFolder = "";
let galleryPreloadPromise = null;

function ensureGalleryAudio() {
  const tryPlay = () => {
    galleryAudio.play().catch(() => {
      if (audioUnlockAttached) return;
      audioUnlockAttached = true;
      const unlock = () => {
        galleryAudio.play().catch(() => {});
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        audioUnlockAttached = false;
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    });
  };
  tryPlay();
}

function showGalleryToast(text = "Tap a heart, my love. They are all kissable 💋", duration = 3600) {
  if (!galleryToast) return;
  galleryToast.textContent = text;
  galleryToast.classList.add("show");
  window.clearTimeout(galleryToastTimer);
  galleryToastTimer = window.setTimeout(() => {
    galleryToast.classList.remove("show");
  }, duration);
}

function showPanel(index) {
  const previousPanel = activePanel;
  activePanel = Math.max(0, Math.min(index, panels.length - 1));
  panels.forEach((panel, i) => panel.classList.toggle("active", i === activePanel));
  stepChips.forEach((chip, i) => chip.classList.toggle("active", i <= activePanel));
  progressFill.style.width = `${(activePanel + 1) / panels.length * 100}%`;
  document.body.classList.toggle("is-immersive", activePanel === 1);

  if (activePanel === 1 && previousPanel !== 1) {
    initGallery(defaultGalleryFolder);
    showGalleryToast();
    ensureGalleryAudio();
  } else if (previousPanel === 1 && galleryToast) {
    galleryToast.classList.remove("show");
  }
}

function openGalleryAutomatically() {
  if (preLaunchRunning) return;
  if (hasAutoOpenedGallery) return;
  hasAutoOpenedGallery = true;
  showPanel(1);
}

function startRomanticLaunchCountdown() {
  if (!romanticLaunch || preLaunchRunning) {
    openGalleryAutomatically();
    return;
  }

  showPanel(0);
  preLaunchRunning = true;
  document.body.classList.add("is-prelaunch");
  romanticLaunch.classList.add("show");
  romanticLaunch.setAttribute("aria-hidden", "false");

  const launchLines = [
    "Priyee, love mode booting...",
    "Dil syncing with your smile...",
    "Gallery loading: full pyaar edition..."
  ];

  let seconds = 3;
  romanticLaunchCount.textContent = String(seconds);
  romanticLaunchLine.textContent = launchLines[0];
  window.clearInterval(launchTimer);
  window.clearTimeout(launchHideTimer);

  launchTimer = window.setInterval(() => {
    seconds -= 1;
    if (seconds > 0) {
      romanticLaunchCount.textContent = String(seconds);
      romanticLaunchLine.textContent = launchLines[3 - seconds] || launchLines[launchLines.length - 1];
      return;
    }

    romanticLaunchCount.textContent = "Go";
    romanticLaunchLine.textContent = "Happiest Valentine's Day, Priyee";
    window.clearInterval(launchTimer);
    launchHideTimer = window.setTimeout(() => {
      romanticLaunch.classList.remove("show");
      romanticLaunch.setAttribute("aria-hidden", "true");
      preLaunchRunning = false;
      document.body.classList.remove("is-prelaunch");
      openGalleryAutomatically();
    }, 380);
  }, 1000);
}

document.getElementById("back-to-gallery").addEventListener("click", () => showPanel(1));
document.getElementById("yes-btn").addEventListener("click", () => {
  yesMessage.textContent = "Yay. Date confirmed. Cute chaos loading.";
  spawnBurst(18);
  openRemoteValentinesCalendarEvent();
});

function toggleInvitationOpen() {
  invitationStage.classList.toggle("open");
  if (invitationStage.classList.contains("open")) {
    spawnBurst(16);
    spawnKissBurst(invitationStage, 24);
  }
}

invitationStage.addEventListener("click", toggleInvitationOpen);
invitationStage.addEventListener("keydown", (evt) => {
  if (evt.key === "Enter" || evt.key === " ") {
    evt.preventDefault();
    toggleInvitationOpen();
  }
});

function getUpcomingLondonValentineMidnightUtc() {
  const londonParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const readPart = (type) => Number(londonParts.find((part) => part.type === type)?.value || 0);

  const londonNowEquivalentUtc = Date.UTC(
    readPart("year"),
    readPart("month") - 1,
    readPart("day"),
    readPart("hour"),
    readPart("minute"),
    readPart("second")
  );

  const year = readPart("year");
  return new Date(Date.UTC(year, 1, 14, 0, 0, 0));
}

function formatDateForZone(date, zone, options) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    ...options
  }).format(date);
}

const countdownTarget = getUpcomingLondonValentineMidnightUtc();
countdownEls.target.textContent = `${formatDateForZone(countdownTarget, "Europe/London", { day: "numeric", month: "long", year: "numeric" })}, 12:00 AM London time`;
const romanticCountdownNotes = [
  "Priyee, every second is bringing me closer to your cutest smile.",
  "My heart has exactly one destination: you.",
  "Timer chal raha hai, pyaar toh already full hai.",
  "Your kiss countdown is now in progress."
];
countdownStartedExpired = Date.now() >= countdownTarget.getTime();

function updateCountdown() {
  const now = Date.now();
  const distance = countdownTarget.getTime() - now;

  if (distance <= 0) {
    countdownEls.days.textContent = "00";
    countdownEls.hours.textContent = "00";
    countdownEls.minutes.textContent = "00";
    countdownEls.seconds.textContent = "00";
    countdownEls.note.textContent = "Happy Valentine's Day, Priyee. Aaj full pyaar mode.";
    if (!hasAutoOpenedGallery) {
      startRomanticLaunchCountdown();
    }
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  countdownEls.days.textContent = String(days).padStart(2, "0");
  countdownEls.hours.textContent = String(hours).padStart(2, "0");
  countdownEls.minutes.textContent = String(minutes).padStart(2, "0");
  countdownEls.seconds.textContent = String(seconds).padStart(2, "0");

  if (days === 0 && hours < 6) {
    countdownEls.note.textContent = "Bas thoda sa baaki hai heheheh.";
  } else {
    countdownEls.note.textContent = romanticCountdownNotes[Math.floor(now / 7000) % romanticCountdownNotes.length];
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();

const inviteYear = countdownTarget.getUTCFullYear();
const inviteUtc = new Date(Date.UTC(inviteYear, 1, 14, 15, 30, 0));

function formatGoogleUtc(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function openRemoteValentinesCalendarEvent() {
  const start = new Date(inviteUtc.getTime());
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Priyee + Krupiee Ki Official Valentine’s Date",
    dates: `${formatGoogleUtc(start)}/${formatGoogleUtc(end)}`,
    details: "Virtual Valentine date. Dress code: maroon/pink/red or any shade of love. Be ready for full romantic-comedy vibes.",
    location: "Remote / Video Call",
    add: "kgediya0898@gmail.com,meghnasonie@gmail.com"
  });

  const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

const istDateText = formatDateForZone(inviteUtc, "Asia/Kolkata", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
}).replace(",", "");

const londonDateText = formatDateForZone(inviteUtc, "Europe/London", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
}).replace(",", "");

istTimeEl.textContent = `${istDateText} IST`;
londonTimeEl.textContent = `${londonDateText} London time`;

const canvasHost = document.getElementById("gallery-canvas");
let renderer;
let scene;
let camera;
let galleryGroup;
let animationFrame;
let twinkleMaterial;
let sparkleField;
let starField;
let surpriseCore;

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
let pickTargets = [];
let focusedCard = null;
let dragging = false;
let hasMoved = false;
let lastX = 0;
let lastY = 0;
let inertiaX = 0;
let inertiaY = 0;
let pendingMemoryCard = null;
let pendingMemoryAt = 0;
let inviteTransitionStart = 0;
let inviteStartRotY = 0;
let inviteStartRotX = 0;
let inviteSpinTurns = 2;
const inviteTransitionDuration = 1700;

function openMemoryLightbox(url) {
  if (!url) return;
  memoryImage.src = url;
  memoryLightbox.classList.add("open");
  memoryLightbox.setAttribute("aria-hidden", "false");
}

function closeMemoryLightbox() {
  memoryLightbox.classList.remove("open");
  memoryLightbox.setAttribute("aria-hidden", "true");
  memoryImage.src = "";
  focusedCard = null;
  pendingMemoryCard = null;
}

closeMemoryBtn.addEventListener("click", closeMemoryLightbox);
memoryLightbox.addEventListener("click", (evt) => {
  if (evt.target === memoryLightbox) {
    closeMemoryLightbox();
  }
});

function normalizeFolderPath(path) {
  if (!path) return "./photos";
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function uniqueStrings(list) {
  return [...new Set(list.filter(Boolean))];
}

function isImagePath(path) {
  return /\.(png|jpe?g|webp|gif)$/i.test(path);
}

function buildUrl(base, href) {
  return new URL(href, `${base.replace(/\/?$/, "/")}`).toString();
}

function toRelativeFromOrigin(url) {
  try {
    const absolute = new URL(url, window.location.href);
    if (absolute.origin !== window.location.origin) {
      return null;
    }
    return absolute.pathname + absolute.search;
  } catch {
    return null;
  }
}

function toAbsolutePath(pathLike) {
  try {
    return new URL(pathLike, window.location.href).pathname.replace(/\/$/, "");
  } catch {
    return "";
  }
}

async function fetchManifest(folderPath) {
  const manifestPath = `${folderPath}/manifest.json`;
  const res = await fetch(manifestPath);
  if (!res.ok) throw new Error("manifest not found");
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .map((file) => `${folderPath}/${String(file).replace(/^\/+/, "")}`)
    .filter(isImagePath);
}

function parseDirectoryEntries(html, folderUrl, rootPrefix) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const anchors = [...doc.querySelectorAll("a[href]")];

  const files = [];
  const dirs = [];

  anchors.forEach((anchor) => {
    const rawHref = anchor.getAttribute("href") || "";
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("javascript:")) {
      return;
    }

    let absoluteHref;
    try {
      absoluteHref = buildUrl(folderUrl, rawHref);
    } catch {
      return;
    }

    const cleanHref = absoluteHref.split("?")[0].split("#")[0];

    if (isImagePath(cleanHref)) {
      const relative = toRelativeFromOrigin(cleanHref);
      if (relative) {
        const noQuery = relative.split("?")[0];
        if (noQuery.startsWith(rootPrefix)) {
          files.push(noQuery);
        }
      }
      return;
    }

    if (cleanHref.endsWith("/")) {
      const relativeDir = toRelativeFromOrigin(cleanHref);
      if (relativeDir && !relativeDir.endsWith("../") && !relativeDir.includes("/.")) {
        const cleanDir = relativeDir.split("?")[0].replace(/\/$/, "");
        if (cleanDir.startsWith(rootPrefix)) {
          dirs.push(cleanDir);
        }
      }
    }
  });

  return { files, dirs };
}

async function crawlDirectoryForImages(folderPath, maxDepth = 2) {
  if (isGithubPagesHost) return [];
  const start = normalizeFolderPath(folderPath);
  const rootPrefix = toAbsolutePath(start);
  const queue = [{ path: start, depth: 0 }];
  const visited = new Set();
  const found = [];

  while (queue.length) {
    const { path, depth } = queue.shift();
    if (visited.has(path)) continue;
    visited.add(path);

    let response;
    try {
      response = await fetch(`${path}/`);
    } catch {
      continue;
    }

    if (!response.ok) continue;

    let html;
    try {
      html = await response.text();
    } catch {
      continue;
    }

    const { files, dirs } = parseDirectoryEntries(html, response.url, rootPrefix);
    found.push(...files);

    if (depth < maxDepth) {
      dirs.forEach((dirPath) => {
        const clean = dirPath.replace(/\/$/, "");
        if (clean.includes("..")) return;
        if (!visited.has(clean)) {
          queue.push({ path: clean, depth: depth + 1 });
        }
      });
    }
  }

  return uniqueStrings(found);
}

async function probeCommonFileNames(folderPath) {
  if (isGithubPagesHost) return [];
  const names = [];
  const prefixes = ["IMG_", "DSC_", "PXL_", "MVIMG_", "Photo_", "image_", "pic_"];
  for (let i = 1; i <= 80; i += 1) {
    const p = String(i).padStart(4, "0");
    names.push(`${i}.jpg`, `${i}.jpeg`, `${i}.png`, `${i}.webp`);
    names.push(`${p}.jpg`, `${p}.jpeg`, `${p}.png`, `${p}.webp`);
    prefixes.forEach((prefix) => {
      names.push(`${prefix}${p}.jpg`, `${prefix}${p}.jpeg`, `${prefix}${p}.png`);
    });
  }

  const checks = names.map(async (name) => {
    const url = `${folderPath}/${name}`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok ? url : null;
    } catch {
      return null;
    }
  });

  const found = await Promise.all(checks);
  return uniqueStrings(found);
}

function buildPlaceholderTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#220613";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#ff6f9d");
  grad.addColorStop(1, "#ffb16f");
  ctx.fillStyle = grad;
  ctx.fillRect(45, 45, canvas.width - 90, canvas.height - 90);

  ctx.fillStyle = "#2a0213";
  ctx.font = "bold 62px serif";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "42px sans-serif";
  ctx.fillText("Add photos in folder", canvas.width / 2, canvas.height / 2 + 52);

  return new THREE.CanvasTexture(canvas);
}

function buildHeartShape(size = 1.6) {
  const shape = new THREE.Shape();
  const points = [];

  for (let i = 0; i <= 120; i += 1) {
    const t = (i / 120) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    points.push(new THREE.Vector2((x / 18) * size, (y / 18) * size));
  }

  shape.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    shape.lineTo(points[i].x, points[i].y);
  }

  return shape;
}

function fitTextureCover(texture, frameRatio = 1) {
  const image = texture?.image;
  if (!image || !image.width || !image.height) return;

  const imageRatio = image.width / image.height;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.center.set(0.5, 0.5);

  if (imageRatio > frameRatio) {
    texture.repeat.set(frameRatio / imageRatio, 1);
    texture.offset.set((1 - texture.repeat.x) * 0.5, 0);
  } else {
    texture.repeat.set(1, imageRatio / frameRatio);
    texture.offset.set(0, (1 - texture.repeat.y) * 0.5);
  }

  texture.needsUpdate = true;
}

function remapShapeUvToBounds(geometry) {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const size = new THREE.Vector3();
  bounds.getSize(size);
  const position = geometry.attributes.position;
  const uv = new Float32Array(position.count * 2);

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    uv[i * 2] = size.x ? (x - bounds.min.x) / size.x : 0.5;
    uv[i * 2 + 1] = size.y ? (y - bounds.min.y) / size.y : 0.5;
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

function createHeartPhotoCard(texture, index) {
  const card = new THREE.Group();

  const outerHeart = buildHeartShape(2.1);
  const innerHeart = buildHeartShape(1.84);

  const frameGeometry = new THREE.ExtrudeGeometry(outerHeart, {
    depth: 0.48,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.05,
    curveSegments: 38
  });

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xfa3d80,
    roughness: 0.2,
    metalness: 0.3,
    emissive: 0x530622,
    emissiveIntensity: 0.72
  });

  const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
  frameMesh.rotation.y = Math.PI;
  frameMesh.position.z = -0.28;

  texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
  texture.colorSpace = THREE.SRGBColorSpace;

  const photoGeometry = new THREE.ShapeGeometry(innerHeart, 72);
  remapShapeUvToBounds(photoGeometry);
  fitTextureCover(texture, 1);
  const photoMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: false,
    roughness: 0.14,
    metalness: 0.08,
    side: THREE.DoubleSide,
    emissive: 0x381321,
    emissiveIntensity: 0.38
  });

  const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
  photoMesh.position.z = 0.1;
  photoMesh.userData.cardIndex = index;
  photoMesh.userData.cardRef = card;

  const pickMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2.25, 18, 18),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );
  pickMesh.userData.cardRef = card;

  card.add(frameMesh);
  card.add(photoMesh);
  card.add(pickMesh);
  card.userData.photoMesh = photoMesh;
  card.userData.pickMesh = pickMesh;

  return card;
}

function disposeScene() {
  cancelAnimationFrame(animationFrame);
  window.clearTimeout(coreTapReminderTimer);
  coreTapReminderTimer = 0;
  pickTargets = [];

  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode === canvasHost) {
      canvasHost.removeChild(renderer.domElement);
    }
  }

  renderer = null;
  scene = null;
  camera = null;
  galleryGroup = null;
  sparkleField = null;
  starField = null;
  surpriseCore = null;
  pendingMemoryCard = null;
  pendingMemoryAt = 0;
  inviteTransitionStart = 0;
}

function attachInteraction() {
  const dom = renderer.domElement;

  const onDown = (evt) => {
    dragging = true;
    hasMoved = false;
    lastX = evt.clientX;
    lastY = evt.clientY;
  };

  const onMove = (evt) => {
    if (!dragging || !galleryGroup) return;

    const dx = evt.clientX - lastX;
    const dy = evt.clientY - lastY;
    hasMoved = hasMoved || Math.abs(dx) > 6 || Math.abs(dy) > 6;

    galleryGroup.rotation.y += dx * 0.0032;
    galleryGroup.rotation.x += dy * 0.0018;
    galleryGroup.rotation.x = Math.max(-0.35, Math.min(0.35, galleryGroup.rotation.x));

    inertiaX = dx * 0.0008;
    inertiaY = dy * 0.0004;

    lastX = evt.clientX;
    lastY = evt.clientY;
  };

  const tryPickCard = (evt) => {
    if (!camera || !pickTargets.length || hasMoved) return;
    if (inviteTransitionStart > 0) return;
    if (galleryToast) galleryToast.classList.remove("show");

    const rect = dom.getBoundingClientRect();
    pointerNdc.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointerNdc, camera);
    const intersections = raycaster.intersectObjects(pickTargets, false);
    if (!intersections.length) return;

    const hit = intersections[0].object;
    if (hit.userData.action === "invite") {
      window.clearTimeout(coreTapReminderTimer);
      coreTapReminderTimer = 0;
      spawnBurst(20);
      inviteTransitionStart = performance.now();
      inviteSpinTurns = Math.random() < 0.5 ? 2 : 3;
      if (surpriseCore) {
        inviteStartRotY = surpriseCore.rotation.y;
        inviteStartRotX = surpriseCore.rotation.x;
      }
      focusedCard = null;
      pendingMemoryCard = null;
      return;
    }

    const card = hit.userData.cardRef;
    if (!card) return;

    focusedCard = card;
    spawnBurst(10);
    pendingMemoryCard = card;
    pendingMemoryAt = performance.now() + 760;
  };

  const onUp = (evt) => {
    if (evt) tryPickCard(evt);
    dragging = false;
  };

  dom.onpointerdown = onDown;
  dom.onpointermove = onMove;
  dom.onpointerup = onUp;
  dom.onpointerleave = () => {
    dragging = false;
  };

  dom.onwheel = (evt) => {
    evt.preventDefault();
    camera.position.z = Math.max(14, Math.min(44, camera.position.z + evt.deltaY * 0.018));
  };
}

function createPhotoCards(textures, sourceUrls = []) {
  const n = textures.length;
  const cards = [];

  for (let i = 0; i < n; i += 1) {
    const t = i / n;
    const angle = t * Math.PI * 2;

    const x = 0.72 * 13 * Math.pow(Math.sin(angle), 3);
    const y = 0.72 * (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
    const z = Math.sin(angle * 1.8) * 3.2;

    const card = createHeartPhotoCard(textures[i], i);
    card.position.set(x, y, z);
    card.lookAt(0, 0, 0);
    card.scale.setScalar(1.05);
    card.userData.floatOffset = Math.random() * Math.PI * 2;
    card.userData.basePosition = new THREE.Vector3(x, y, z);
    card.userData.imageUrl = sourceUrls[i] || "";
    card.userData.entryDelay = i * 0.11;
    card.userData.entryFrom = new THREE.Vector3((Math.random() - 0.5) * 1.8, -22 - Math.random() * 5, 15 + Math.random() * 7);
    card.userData.entryDone = false;
    card.position.copy(card.userData.entryFrom);
    card.scale.setScalar(0.55);

    cards.push(card);
  }

  return cards;
}

function createSurpriseCore() {
  const core = new THREE.Group();

  const heartGeom = new THREE.ExtrudeGeometry(buildHeartShape(2.15), {
    depth: 0.24,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.035,
    curveSegments: 42
  });

  const heartMesh = new THREE.Mesh(
    heartGeom,
    new THREE.MeshStandardMaterial({
      color: 0xb76e79,
      roughness: 0.18,
      metalness: 0.56,
      emissive: 0x5a3138,
      emissiveIntensity: 0.4
    })
  );
  heartMesh.rotation.y = Math.PI;
  heartMesh.position.z = 0.12;

  const surpriseTexture = new THREE.TextureLoader().load("./heart.jpg", (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    fitTextureCover(tex, 1);
  });
  surpriseTexture.colorSpace = THREE.SRGBColorSpace;

  const frontHeartGeom = new THREE.ShapeGeometry(buildHeartShape(2.02), 72);
  remapShapeUvToBounds(frontHeartGeom);
  const frontMaterial = new THREE.MeshStandardMaterial({
    map: surpriseTexture,
    roughness: 0.14,
    metalness: 0.08,
    emissive: 0x2e0d1d,
    emissiveIntensity: 0.22,
    side: THREE.DoubleSide
  });

  const backMaterial = new THREE.MeshStandardMaterial({
    map: surpriseTexture,
    roughness: 0.14,
    metalness: 0.08,
    emissive: 0x2e0d1d,
    emissiveIntensity: 0.22,
    side: THREE.DoubleSide
  });

  const frontHeart = new THREE.Mesh(
    frontHeartGeom,
    frontMaterial
  );
  frontHeart.rotation.y = Math.PI;
  frontHeart.position.z = 0.16;

  const backHeart = new THREE.Mesh(frontHeartGeom, backMaterial);
  backHeart.rotation.y = 0;
  backHeart.position.z = -0.16;

  const pickMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 20, 20),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );
  pickMesh.userData.action = "invite";

  core.add(heartMesh);
  core.add(frontHeart);
  core.add(backHeart);
  core.add(pickMesh);
  core.position.set(0, -0.1, 0);
  core.userData.pickMesh = pickMesh;

  return core;
}

function createHeartSpriteTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = "#ffd4e8";
  ctx.font = "48px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u2764", 32, 34);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function smoothStep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function createParticleLayers() {
  const heartTexture = createHeartSpriteTexture();

  const sparkleGeometry = new THREE.BufferGeometry();
  const sparkleCount = 900;
  const sparklePositions = new Float32Array(sparkleCount * 3);

  for (let i = 0; i < sparkleCount; i += 1) {
    sparklePositions[i * 3] = (Math.random() - 0.5) * 65;
    sparklePositions[i * 3 + 1] = (Math.random() - 0.5) * 65;
    sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 65;
  }

  sparkleGeometry.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));
  twinkleMaterial = new THREE.PointsMaterial({
    map: heartTexture,
    size: 0.68,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  sparkleField = new THREE.Points(sparkleGeometry, twinkleMaterial);

  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 420;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i += 1) {
    starPositions[i * 3] = (Math.random() - 0.5) * 95;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 95;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 95;
  }

  starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starField = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xffe3f1, size: 0.14, transparent: true, opacity: 0.82 }));

  scene.add(sparkleField);
  scene.add(starField);
}

async function discoverPhotoUrls(folderPath) {
  const normalized = normalizeFolderPath(folderPath);
  const cacheKey = `hvp-photo-list:${normalized}`;

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    }
  } catch {
    // ignore cache read issues
  }

  try {
    const manifestPhotos = await fetchManifest(normalized);
    if (manifestPhotos.length) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(manifestPhotos));
      } catch {
        // ignore cache write issues
      }
      return uniqueStrings(manifestPhotos);
    }
  } catch {
    // fallback
  }

  if (isGithubPagesHost) {
    return [];
  }

  try {
    const crawled = await crawlDirectoryForImages(normalized, 1);
    if (crawled.length) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(crawled));
      } catch {
        // ignore cache write issues
      }
      return uniqueStrings(crawled);
    }
  } catch {
    // fallback
  }

  try {
    const guessed = await probeCommonFileNames(normalized);
    if (guessed.length) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(guessed));
      } catch {
        // ignore cache write issues
      }
      return guessed;
    }
  } catch {
    // fallback
  }

  return [];
}

function preloadTextures(urls) {
  if (!urls?.length) return Promise.resolve([]);
  const loader = new THREE.TextureLoader();
  return Promise.all(urls.map((url) => new Promise((resolve) => {
    loader.load(
      url,
      (texture) => resolve(texture),
      undefined,
      () => resolve(null)
    );
  }))).then((loaded) => loaded.filter(Boolean));
}

function preloadGalleryAssets(folderPath) {
  const normalized = normalizeFolderPath(folderPath);
  if (galleryPreloadPromise && galleryPreloadFolder === normalized) {
    return galleryPreloadPromise;
  }

  galleryPreloadFolder = normalized;
  galleryPreloadPromise = (async () => {
    const urls = await discoverPhotoUrls(normalized);
    const textures = await preloadTextures(urls);
    return { urls, textures };
  })();

  return galleryPreloadPromise;
}

async function initGallery(folderPath) {
  disposeScene();
  window.clearTimeout(coreTapReminderTimer);
  coreTapReminderTimer = 0;
  orbitGreetingShown = false;

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#2a0a1f");

  camera = new THREE.PerspectiveCamera(45, canvasHost.clientWidth / canvasHost.clientHeight, 0.1, 220);
  camera.position.set(0, 0, 29);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  canvasHost.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.14);
  scene.add(ambientLight);

  const hemi = new THREE.HemisphereLight(0xffd9ec, 0x2a0d1f, 0.72);
  scene.add(hemi);

  const pointA = new THREE.PointLight(0xff8bc7, 2.9, 165);
  pointA.position.set(18, 16, 24);
  scene.add(pointA);

  const pointB = new THREE.PointLight(0xffc69a, 2.35, 155);
  pointB.position.set(-20, -14, 10);
  scene.add(pointB);

  const pointC = new THREE.PointLight(0xff72aa, 1.7, 140);
  pointC.position.set(0, 4, -18);
  scene.add(pointC);

  const pointD = new THREE.PointLight(0xfff1f8, 0.95, 160);
  pointD.position.set(0, 14, 14);
  scene.add(pointD);

  galleryGroup = new THREE.Group();
  scene.add(galleryGroup);

  const preload = await preloadGalleryAssets(folderPath);
  const urls = preload?.urls || [];
  let textures = preload?.textures ? [...preload.textures] : [];

  if (!textures.length) {
    textures = [
      buildPlaceholderTexture("Priyee + Krupiee"),
      buildPlaceholderTexture("Sweet Memories"),
      buildPlaceholderTexture("Forever Team")
    ];
  }

  const cards = createPhotoCards(textures, urls);
  cards.forEach((card) => {
    galleryGroup.add(card);
    pickTargets.push(card.userData.pickMesh);
  });

  surpriseCore = createSurpriseCore();
  galleryGroup.add(surpriseCore);
  pickTargets.push(surpriseCore.userData.pickMesh);

  createParticleLayers();
  attachInteraction();

  const clock = new THREE.Clock();
  const animate = () => {
    const elapsed = clock.getElapsedTime();
    const now = performance.now();

    if (!dragging && galleryGroup) {
      if (focusedCard || inviteTransitionStart > 0) {
        galleryGroup.rotation.y += (0 - galleryGroup.rotation.y) * 0.05;
        galleryGroup.rotation.x += (0 - galleryGroup.rotation.x) * 0.05;
      } else {
        galleryGroup.rotation.y += 0.00072 + inertiaX;
        galleryGroup.rotation.x += inertiaY * 0.45;
      }
      galleryGroup.rotation.x = Math.max(-0.35, Math.min(0.35, galleryGroup.rotation.x));

      inertiaX *= 0.86;
      inertiaY *= 0.78;
      if (Math.abs(inertiaX) < 0.00001) inertiaX = 0;
      if (Math.abs(inertiaY) < 0.00001) inertiaY = 0;
    }

    let allHeartsSettled = true;
    cards.forEach((card, i) => {
      const base = card.userData.basePosition;
      const floatY = Math.cos(elapsed * 0.8 + card.userData.floatOffset) * 0.36;
      const floatZ = Math.sin(elapsed * 1.1 + i) * 0.16;
      const entryT = smoothStep(0, 1.25, elapsed - card.userData.entryDelay);

      if (entryT < 1) {
        allHeartsSettled = false;
        const emitCurve = smoothStep(0, 0.62, entryT);
        const settleCurve = smoothStep(0.62, 1, entryT);
        const mid = new THREE.Vector3(base.x * 0.35, base.y * 0.2 + 1.2, 10.8);
        const finalPos = new THREE.Vector3(base.x, base.y + floatY, base.z + floatZ);

        const fromToMid = card.userData.entryFrom.clone().lerp(mid, emitCurve);
        card.position.copy(fromToMid.lerp(finalPos, settleCurve));
        const entryScale = 0.55 + entryT * 0.5;
        card.scale.setScalar(entryScale);
      } else if (focusedCard === card) {
        card.position.lerp(new THREE.Vector3(0, 0.24, 7.35), 0.08);
        card.scale.lerp(new THREE.Vector3(2.62, 2.62, 2.62), 0.09);
      } else {
        card.position.lerp(new THREE.Vector3(base.x, base.y + floatY, base.z + floatZ), 0.05);
        const targetScale = focusedCard ? 0.84 : 1.05;
        card.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.045);
      }

      card.lookAt(camera.position.x * 0.22, camera.position.y * 0.1, camera.position.z);
    });

    if (allHeartsSettled && !orbitGreetingShown) {
      orbitGreetingShown = true;
      showGalleryToast("Happiest Valentine's Day Priye", 4200);
      coreTapReminderTimer = window.setTimeout(() => {
        if (activePanel === 1 && inviteTransitionStart === 0) {
          showGalleryToast("Tap the center heart, my love. Surprise is waiting.", 4200);
        }
      }, 10000);
    }

    if (surpriseCore) {
      if (inviteTransitionStart > 0) {
        const t = Math.min(1, (now - inviteTransitionStart) / inviteTransitionDuration);
        const ease = smoothStep(0, 1, t);
        const targetY = Math.PI;
        const towardFront = ((targetY - inviteStartRotY + Math.PI * 4) % (Math.PI * 2));
        const totalSpinY = towardFront + inviteSpinTurns * Math.PI * 2;
        surpriseCore.rotation.y = inviteStartRotY + totalSpinY * ease;
        surpriseCore.rotation.x = inviteStartRotX * (1 - ease);
        surpriseCore.position.lerp(new THREE.Vector3(0, 0.08, 7.8), 0.095);
        surpriseCore.scale.lerp(new THREE.Vector3(2.85, 2.85, 2.85), 0.1);
      } else {
        surpriseCore.position.y = Math.sin(elapsed * 0.62) * 0.085;
        surpriseCore.rotation.y += 0.0042;
        surpriseCore.scale.setScalar(1.008 + Math.sin(elapsed * 1.05) * 0.018);
      }
    }

    if (sparkleField) sparkleField.rotation.y -= 0.0006;
    if (starField) {
      starField.rotation.y -= 0.00022;
      starField.rotation.x = Math.sin(elapsed * 0.18) * 0.016;
    }
    if (twinkleMaterial) {
      twinkleMaterial.opacity = 0.32 + Math.sin(elapsed * 1.2) * 0.08;
      twinkleMaterial.size = 0.66 + (Math.sin(elapsed * 1.4) + 1) * 0.04;
    }

    if (pendingMemoryCard && now >= pendingMemoryAt && focusedCard === pendingMemoryCard && !memoryLightbox.classList.contains("open")) {
      const centered =
        Math.abs(pendingMemoryCard.position.x) < 0.2 &&
        Math.abs(pendingMemoryCard.position.y - 0.24) < 0.35 &&
        pendingMemoryCard.position.z > 6.7;
      if (centered) {
        openMemoryLightbox(pendingMemoryCard.userData.imageUrl);
        pendingMemoryCard = null;
      } else {
        pendingMemoryAt = now + 140;
      }
    }

    if (inviteTransitionStart > 0 && now - inviteTransitionStart > inviteTransitionDuration + 30) {
      inviteTransitionStart = 0;
      showPanel(2);
    }

    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(animate);
  };

  animate();
}

function spawnHeart() {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = Math.random() > 0.3 ? "\u2764" : "\u2726";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${12 + Math.random() * 16}px`;
  heart.style.setProperty("--drift", `${-25 + Math.random() * 50}px`);
  const duration = 7 + Math.random() * 6;
  heart.style.animationDuration = `${duration}s`;
  particlesRoot.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}

function spawnBurst(count) {
  for (let i = 0; i < count; i += 1) {
    setTimeout(spawnHeart, i * 70);
  }
}

function spawnKissBurst(container, count = 18) {
  const rect = container.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < count; i += 1) {
    const kiss = document.createElement("span");
    kiss.className = "floating-kiss";
    kiss.textContent = i % 3 === 0 ? "\uD83D\uDC8B" : "\uD83D\uDE18";
    kiss.style.left = `${cx}px`;
    kiss.style.top = `${cy}px`;
    kiss.style.setProperty("--dx", `${-120 + Math.random() * 240}px`);
    kiss.style.setProperty("--dy", `${-170 + Math.random() * 160}px`);
    particlesRoot.appendChild(kiss);
    setTimeout(() => kiss.remove(), 1300);
  }
}

setInterval(spawnHeart, 650);
spawnBurst(12);

window.addEventListener("resize", () => {
  if (!renderer || !camera) return;
  const width = canvasHost.clientWidth;
  const height = canvasHost.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

window.addEventListener("keydown", (evt) => {
  if (evt.key === "Escape") {
    if (memoryLightbox.classList.contains("open")) {
      closeMemoryLightbox();
      return;
    }
    if (activePanel === 1) {
      showPanel(0);
    }
  }
});

showPanel(0);
preloadGalleryAssets(defaultGalleryFolder).catch(() => {});
