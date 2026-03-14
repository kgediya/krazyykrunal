const STORAGE_KEY = "genxr_settings_v1";

const providerEl = document.getElementById("provider");
const modelEl = document.getElementById("model");
const engineEl = document.getElementById("engine");
const apiKeyEl = document.getElementById("apiKey");
const getKeyBtn = document.getElementById("getKeyBtn");
const preferDebugKeyEl = document.getElementById("preferDebugKey");
const promptEl = document.getElementById("prompt");
const voiceBtn = document.getElementById("voiceBtn");
const clearPromptBtn = document.getElementById("clearPromptBtn");
const voiceStatusEl = document.getElementById("voiceStatus");
const quickPromptsEl = document.getElementById("quickPrompts");
const generateBtn = document.getElementById("generateBtn");
const applyBtn = document.getElementById("applyBtn");
const exampleBtn = document.getElementById("exampleBtn");
const starterBtn = document.getElementById("starterBtn");
const statusEl = document.getElementById("status");
const previewFrame = document.getElementById("previewFrame");
const openPreviewBtn = document.getElementById("openPreviewBtn");
const advancedPanel = document.getElementById("advancedPanel");
const indexEditor = document.getElementById("indexEditor");
const styleEditor = document.getElementById("styleEditor");
const scriptEditor = document.getElementById("scriptEditor");
const tabEls = [...document.querySelectorAll(".tab")];
let lastProvider = "gemini";
const runtimeConfig = window.GENXR_CONFIG || {};
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;
let voiceMode = "none";
let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];
const MODEL_OPTIONS = {
  gemini: [
    { value: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" }
  ],
  openai: [
    { value: "gpt-5-mini", label: "GPT-5 Mini" },
    { value: "gpt-5", label: "GPT-5" },
    { value: "gpt-5-nano", label: "GPT-5 Nano" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" }
  ]
};
const requiredEls = [
  providerEl,
  modelEl,
  engineEl,
  apiKeyEl,
  getKeyBtn,
  preferDebugKeyEl,
  promptEl,
  voiceBtn,
  clearPromptBtn,
  voiceStatusEl,
  quickPromptsEl,
  generateBtn,
  applyBtn,
  exampleBtn,
  starterBtn,
  statusEl,
  previewFrame,
  openPreviewBtn,
  advancedPanel,
  indexEditor,
  styleEditor,
  scriptEditor
];

const THREE_GHOST_FILES = {
  index_html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Generated WebXR App</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./app.js"></script>
</body>
</html>`,
  style_css: `html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  background: #000;
  color: #fff;
  font-family: system-ui, sans-serif;
}

#app {
  position: fixed;
  inset: 0;
}
`,
  app_js: `import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { VRButton } from "https://unpkg.com/three@0.161.0/examples/jsm/webxr/VRButton.js";

const container = document.getElementById("app");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08101c);
scene.fog = new THREE.Fog(0x08101c, 8, 30);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.5, 3.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

scene.add(new THREE.AmbientLight(0xc7deff, 0.7));
const moon = new THREE.DirectionalLight(0xbad7ff, 1.15);
moon.position.set(4, 6, 2);
scene.add(moon);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(20, 80),
  new THREE.MeshStandardMaterial({ color: 0x122338, roughness: 0.86, metalness: 0.08 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

function createGhost() {
  const ghost = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.78),
    new THREE.MeshStandardMaterial({
      color: 0xe8f5ff,
      transparent: true,
      opacity: 0.86,
      emissive: 0x7ec9ff,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0
    })
  );
  body.position.y = 1.35;
  ghost.add(body);

  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.44, 0.5, 24, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xe8f5ff,
      transparent: true,
      opacity: 0.8,
      emissive: 0x7ec9ff,
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.35
    })
  );
  skirt.position.y = 1.05;
  ghost.add(skirt);

  const eyeGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0d1220 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.1, 1.38, 0.34);
  eyeR.position.set(0.1, 1.38, 0.34);
  ghost.add(eyeL, eyeR);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 24, 18),
    new THREE.MeshBasicMaterial({
      color: 0x8dd8ff,
      transparent: true,
      opacity: 0.16
    })
  );
  glow.position.y = 1.23;
  ghost.add(glow);

  return ghost;
}

const ghost = createGhost();
scene.add(ghost);

const stars = new THREE.Group();
const starGeo = new THREE.SphereGeometry(0.02, 10, 10);
for (let i = 0; i < 110; i += 1) {
  const star = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color: 0x7fd4ff }));
  const r = 4 + Math.random() * 10;
  const a = Math.random() * Math.PI * 2;
  const h = 0.6 + Math.random() * 4.8;
  star.position.set(Math.cos(a) * r, h, Math.sin(a) * r);
  stars.add(star);
}
scene.add(stars);

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  ghost.position.y = Math.sin(t * 1.6) * 0.14;
  ghost.rotation.y = t * 0.6;
  stars.rotation.y += 0.0009;
  controls.update();
  renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
`
};

const AFRAME_GHOST_FILES = {
  index_html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ghost WebXR App (A-Frame)</title>
  <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <a-scene renderer="colorManagement:true;" xr-mode-ui="enabled: true">
    <a-entity id="cameraRig" position="0 1.6 3">
      <a-camera wasd-controls-enabled="true"></a-camera>
    </a-entity>

    <a-entity light="type: ambient; intensity: 0.8; color: #cfe8ff"></a-entity>
    <a-entity light="type: directional; intensity: 0.9; color: #9ecfff" position="3 6 2"></a-entity>
    <a-circle position="0 0 0" radius="12" rotation="-90 0 0" color="#13263a"></a-circle>

    <a-entity id="ghost" position="0 1.35 0">
      <a-sphere radius="0.36" color="#eef8ff" opacity="0.86"></a-sphere>
      <a-cylinder position="0 -0.24 0" radius="0.34" height="0.5" color="#eef8ff" opacity="0.78" open-ended="true"></a-cylinder>
      <a-sphere position="-0.09 0.04 0.31" radius="0.03" color="#101624"></a-sphere>
      <a-sphere position="0.09 0.04 0.31" radius="0.03" color="#101624"></a-sphere>
      <a-sphere radius="0.48" color="#8dd8ff" opacity="0.14"></a-sphere>
    </a-entity>

    <a-entity id="stars"></a-entity>
  </a-scene>
  <script src="./app.js"></script>
</body>
</html>`,
  style_css: `html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  background: #07101a;
}

a-scene {
  width: 100vw;
  height: 100vh;
}
`,
  app_js: `const starsRoot = document.querySelector("#stars");
const ghost = document.querySelector("#ghost");

for (let i = 0; i < 90; i += 1) {
  const star = document.createElement("a-sphere");
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 9;
  const y = 0.8 + Math.random() * 4.2;
  star.setAttribute("position", \`\${Math.cos(angle) * radius} \${y} \${Math.sin(angle) * radius}\`);
  star.setAttribute("radius", "0.02");
  star.setAttribute("color", "#7fd4ff");
  starsRoot.appendChild(star);
}

const start = performance.now();
function tick(now) {
  const t = (now - start) * 0.001;
  const bob = 1.35 + Math.sin(t * 1.8) * 0.12;
  ghost.setAttribute("position", \`0 \${bob} 0\`);
  ghost.setAttribute("rotation", \`0 \${(t * 38) % 360} 0\`);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
`
};

const EIGHTHWALL_STYLE_GHOST_FILES = {
  index_html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ghost WebXR App (8th Wall-style)</title>
  <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <a-scene xrweb xrextras-almost-there xrextras-loading xrextras-runtime-error renderer="colorManagement:true;">
    <a-entity id="camera" camera look-controls wasd-controls position="0 1.6 3"></a-entity>
    <a-entity light="type: ambient; intensity: 0.8; color: #d7ecff"></a-entity>
    <a-entity light="type: directional; intensity: 1.0; color: #a5d4ff" position="3 6 2"></a-entity>
    <a-circle radius="14" rotation="-90 0 0" color="#102638"></a-circle>
    <a-entity id="ghostAnchor" position="0 1.3 -1.5">
      <a-sphere radius="0.34" color="#edf8ff" opacity="0.85"></a-sphere>
      <a-cylinder position="0 -0.23 0" radius="0.32" height="0.45" color="#edf8ff" opacity="0.76" open-ended="true"></a-cylinder>
    </a-entity>
  </a-scene>
  <script src="./app.js"></script>
</body>
</html>`,
  style_css: AFRAME_GHOST_FILES.style_css,
  app_js: `const ghostAnchor = document.querySelector("#ghostAnchor");
const start = performance.now();
function loop(now) {
  const t = (now - start) * 0.001;
  const y = 1.3 + Math.sin(t * 1.7) * 0.13;
  ghostAnchor.setAttribute("position", \`0 \${y} -1.5\`);
  ghostAnchor.setAttribute("rotation", \`0 \${(t * 34) % 360} 0\`);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
`
};

function getGhostStarterFiles(engine) {
  if (engine === "aframe") {
    return AFRAME_GHOST_FILES;
  }
  if (engine === "8thwall") {
    return EIGHTHWALL_STYLE_GHOST_FILES;
  }
  return THREE_GHOST_FILES;
}

const examplePrompt = "Create a simple Snap Spectacles compatible WebXR app: a stylized ghost floating around with smooth idle animation, subtle particles, desktop touch/mouse fallback, and lightweight performance. Return complete code files.";
const quickPrompts = [
  "Simple ghost floating in a dark moonlit room with subtle particles.",
  "Hand-tracking mini lab with floating cubes and tap-to-change color.",
  "MR sci-fi portal in front of the user with light fog and ambient sound controls.",
  "A-Frame lightweight haunted hall with one ghost and one interaction button.",
  "Simple AR tabletop solar system with labels and smooth orbit motion."
];

if (requiredEls.some((el) => !el)) {
  console.warn("genXR builder UI elements are missing. Skipping boot.");
} else {
  boot();
}
function boot() {
  hydrateSettings();
  syncModelOptions(providerEl.value, modelEl.value);
  wireEvents();
  renderQuickPrompts();
  setupVoiceInput();
  initHoverEffects();
  initPlayfulCursor();
  advancedPanel.open = false;
  if (!promptEl.value.trim()) {
    promptEl.value = examplePrompt;
  }
  setGeneratedFiles(getGhostStarterFiles(engineEl.value));
  applyCurrentFiles();
  setStatus("Ghost starter app loaded.");
}

function wireEvents() {
  generateBtn.addEventListener("click", generateApp);
  applyBtn.addEventListener("click", applyCurrentFiles);
  voiceBtn.addEventListener("click", toggleVoiceInput);
  clearPromptBtn.addEventListener("click", () => {
    promptEl.value = "";
    setVoiceStatus("Voice: idle.");
  });
  exampleBtn.addEventListener("click", () => {
    promptEl.value = examplePrompt;
  });
  starterBtn.addEventListener("click", () => {
    setGeneratedFiles(getGhostStarterFiles(engineEl.value));
    applyCurrentFiles();
    setStatus(`Loaded ${engineLabel(engineEl.value)} ghost starter app.`);
  });
  preferDebugKeyEl.addEventListener("change", () => {
    applyDebugKeyForProvider();
    persistSettings();
  });
  getKeyBtn.addEventListener("click", openKeyPortal);
  providerEl.addEventListener("change", onProviderChange);
  engineEl.addEventListener("change", () => {
    persistSettings();
    setGeneratedFiles(getGhostStarterFiles(engineEl.value));
    applyCurrentFiles();
    setStatus(`Switched starter to ${engineLabel(engineEl.value)}.`);
  });
  openPreviewBtn.addEventListener("click", openPreviewTab);

  [providerEl, modelEl, engineEl, apiKeyEl].forEach((el) => {
    el.addEventListener("input", persistSettings);
  });

  for (const tab of tabEls) {
    tab.addEventListener("click", () => setActiveTab(tab));
  }
}

function onProviderChange() {
  const currentModel = modelEl.value.trim();
  const previousDefault = defaultModelFor(lastProvider);
  const nextModel =
    !currentModel || currentModel === previousDefault
      ? defaultModelFor(providerEl.value)
      : currentModel;
  syncModelOptions(providerEl.value, nextModel);
  lastProvider = providerEl.value;
  applyDebugKeyForProvider();
  persistSettings();
}

function setActiveTab(tab) {
  for (const t of tabEls) {
    t.classList.remove("active");
  }
  tab.classList.add("active");

  const target = tab.dataset.target;
  for (const editor of [indexEditor, styleEditor, scriptEditor]) {
    editor.classList.toggle("hidden", editor.id !== target);
  }
}

function hydrateSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const cfgProvider = runtimeConfig.defaultProvider || "gemini";
  const cfgEngine = runtimeConfig.defaultEngine || "three";

  if (raw) {
    try {
      const saved = JSON.parse(raw);
      providerEl.value = saved.provider || cfgProvider;
      syncModelOptions(providerEl.value, saved.model || defaultModelFor(providerEl.value));
      engineEl.value = saved.engine || cfgEngine;
      apiKeyEl.value = saved.apiKey || "";
      preferDebugKeyEl.checked =
        typeof saved.preferDebugKey === "boolean"
          ? saved.preferDebugKey
          : runtimeConfig.preferDebugKey === true;
    } catch {
      providerEl.value = cfgProvider;
      syncModelOptions(providerEl.value, defaultModelFor(providerEl.value));
      engineEl.value = cfgEngine;
      preferDebugKeyEl.checked = runtimeConfig.preferDebugKey === true;
    }
  } else {
    providerEl.value = cfgProvider;
    syncModelOptions(providerEl.value, defaultModelFor(providerEl.value));
    engineEl.value = cfgEngine;
    preferDebugKeyEl.checked = runtimeConfig.preferDebugKey === true;
  }

  if (runtimeConfig.defaultModel) {
    syncModelOptions(providerEl.value, runtimeConfig.defaultModel);
  }

  if (!modelEl.value.trim()) {
    syncModelOptions(providerEl.value, defaultModelFor(providerEl.value));
  }
  applyDebugKeyForProvider();
  lastProvider = providerEl.value;
}

function persistSettings() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      provider: providerEl.value,
      model: modelEl.value.trim(),
      engine: engineEl.value,
      apiKey: apiKeyEl.value.trim(),
      preferDebugKey: preferDebugKeyEl.checked
    })
  );
}

function defaultModelFor(provider) {
  if (runtimeConfig.defaultModel) {
    return runtimeConfig.defaultModel;
  }
  if (provider === "openai") {
    return "gpt-5-mini";
  }
  return "gemini-3.1-flash-lite-preview";
}

function syncModelOptions(provider, selectedValue) {
  const options = runtimeConfig.modelOptions?.[provider] || MODEL_OPTIONS[provider] || [];
  modelEl.innerHTML = "";

  for (const option of options) {
    const node = document.createElement("option");
    if (typeof option === "string") {
      node.value = option;
      node.textContent = option;
    } else {
      node.value = option.value;
      node.textContent = option.label || option.value;
    }
    modelEl.appendChild(node);
  }

  const values = [...modelEl.options].map((option) => option.value);
  const fallback = defaultModelFor(provider);
  const nextValue = values.includes(selectedValue) ? selectedValue : (values.includes(fallback) ? fallback : values[0] || "");
  modelEl.value = nextValue;
}

function applyDebugKeyForProvider() {
  const shouldUseDebug = preferDebugKeyEl.checked;
  if (!shouldUseDebug) {
    return;
  }
  const debugKeys = runtimeConfig.apiKeys || {};
  const provider = providerEl.value;
  const key = provider === "openai" ? debugKeys.openai : debugKeys.gemini;
  if (typeof key === "string" && key.trim()) {
    apiKeyEl.value = key.trim();
  }
}

function renderQuickPrompts() {
  quickPromptsEl.innerHTML = "";
  for (const text of quickPrompts) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip is-hover-target";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      promptEl.value = text;
      setVoiceStatus("Voice: idle.");
    });
    quickPromptsEl.appendChild(btn);
  }
  initHoverEffects();
}

function initHoverEffects() {
  const selectors = [
    "button",
    "input",
    "select",
    "textarea",
    ".chip",
    ".tab"
  ];
  for (const node of document.querySelectorAll(selectors.join(","))) {
    node.classList.add("is-hover-target");
  }
}

function initPlayfulCursor() {
  const supportsPointer = "onpointermove" in window;
  if (!supportsPointer) {
    return;
  }

  document.body.classList.add("has-playful-cursor");
  const cursor = document.createElement("div");
  cursor.className = "playful-cursor";
  document.body.appendChild(cursor);

  window.addEventListener("pointermove", (event) => {
    cursor.classList.add("visible");
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  window.addEventListener("pointerleave", () => {
    cursor.classList.remove("visible");
  });

  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest(".is-hover-target");
    if (!target) {
      return;
    }
    cursor.classList.add("pulse");
    target.classList.add("mr-hover");
  });

  document.addEventListener("pointerout", (event) => {
    const target = event.target.closest(".is-hover-target");
    if (!target) {
      return;
    }
    cursor.classList.remove("pulse");
    target.classList.remove("mr-hover");
  });
}

function setupVoiceInput() {
  if (SpeechRecognition) {
    voiceMode = "webspeech";
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      isListening = true;
      updateVoiceButton();
      setVoiceStatus("Voice: listening...");
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        promptEl.value = transcript.trim();
      }
      setVoiceStatus("Voice: transcribing...");
    };

    recognition.onerror = (event) => {
      setVoiceStatus(`Voice error: ${event.error || "unknown"}.`);
      stopVoiceInput();
    };

    recognition.onend = () => {
      isListening = false;
      updateVoiceButton();
      if (!voiceStatusEl.textContent.startsWith("Voice error")) {
        setVoiceStatus("Voice: idle.");
      }
    };
    return;
  }

  if (hasAudioCaptureSupport() && window.MediaRecorder) {
    voiceMode = "recorder";
    voiceBtn.disabled = false;
    setVoiceStatus("Voice: record and transcribe.");
    updateVoiceButton();
    return;
  }

  voiceBtn.disabled = true;
  setVoiceStatus("Voice not supported in this browser.");
}

function toggleVoiceInput() {
  if (voiceMode === "webspeech") {
    if (!recognition) {
      setVoiceStatus("Voice not supported in this browser.");
      return;
    }
    if (isListening) {
      stopVoiceInput();
      return;
    }
    recognition.start();
    return;
  }

  if (voiceMode === "recorder") {
    if (isListening) {
      stopVoiceInput();
      return;
    }
    startRecordedVoiceInput();
    return;
  }

  if (!recognition) {
    setVoiceStatus("Voice not supported in this browser.");
    return;
  }
}

function stopVoiceInput() {
  if (voiceMode === "webspeech" && recognition && isListening) {
    recognition.stop();
  }
  if (voiceMode === "recorder" && mediaRecorder && isListening) {
    mediaRecorder.stop();
  }
}

async function startRecordedVoiceInput() {
  const apiKey = apiKeyEl.value.trim();
  if (!apiKey) {
    setVoiceStatus("Voice transcription needs an API key.");
    return;
  }

  try {
    mediaStream = await requestMicrophoneStream();
    audioChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream, pickRecorderOptions());
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });
    mediaRecorder.addEventListener("stop", handleRecordedVoiceStop);
    mediaRecorder.start();
    isListening = true;
    updateVoiceButton();
    setVoiceStatus("Voice: recording...");
  } catch (error) {
    setVoiceStatus(`Voice error: ${humanizeVoiceError(error)}.`);
  }
}

function hasAudioCaptureSupport() {
  return Boolean(
    navigator.mediaDevices?.getUserMedia ||
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia
  );
}

async function requestMicrophoneStream() {
  const constraintsToTry = runtimeConfig.voiceConstraints?.length
    ? runtimeConfig.voiceConstraints
    : [
        { audio: true },
        { audio: {} },
        { audio: { channelCount: 1 } },
        {
          audio: {
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        }
      ];

  let lastError = null;
  for (const constraints of constraintsToTry) {
    try {
      return await getUserMediaCompat(constraints);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("microphone unavailable");
}

function getUserMediaCompat(constraints) {
  if (navigator.mediaDevices?.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  const legacyGetUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  return new Promise((resolve, reject) => {
    if (!legacyGetUserMedia) {
      reject(new Error("browser does not support microphone capture"));
      return;
    }
    legacyGetUserMedia.call(navigator, constraints, resolve, reject);
  });
}

function humanizeVoiceError(error) {
  const message = String(error?.message || error?.name || "microphone unavailable").toLowerCase();
  if (message.includes("constraint")) {
    return "Spectacles rejected microphone constraints. Use HTTPS and try a simpler mic permission flow";
  }
  if (message.includes("permission") || message.includes("denied") || message.includes("notallowed")) {
    return "microphone permission denied";
  }
  if (message.includes("secure") || message.includes("https")) {
    return "microphone capture requires HTTPS";
  }
  if (message.includes("notfound") || message.includes("device")) {
    return "no microphone device available";
  }
  return error?.message || error?.name || "microphone unavailable";
}

function pickRecorderOptions() {
  const mimeTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus"
  ];
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported?.(mimeType)) {
      return { mimeType };
    }
  }
  return undefined;
}

async function handleRecordedVoiceStop() {
  const chunks = audioChunks.slice();
  audioChunks = [];
  isListening = false;
  updateVoiceButton();

  if (mediaStream) {
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
    mediaStream = null;
  }

  if (!chunks.length) {
    setVoiceStatus("Voice error: no audio captured.");
    return;
  }

  try {
    setVoiceStatus("Voice: uploading for transcription...");
    const blob = new Blob(chunks, {
      type: mediaRecorder?.mimeType || chunks[0].type || "audio/webm"
    });
    const transcript = await transcribeAudioBlob(blob);
    if (!transcript.trim()) {
      throw new Error("empty transcript");
    }
    promptEl.value = transcript.trim();
    setVoiceStatus("Voice: transcript ready.");
  } catch (error) {
    setVoiceStatus(`Voice error: ${error.message || "transcription failed"}.`);
  } finally {
    mediaRecorder = null;
  }
}

async function transcribeAudioBlob(blob) {
  const provider = providerEl.value;
  const apiKey = apiKeyEl.value.trim();
  if (provider === "openai") {
    return transcribeWithOpenAI(blob, apiKey);
  }
  return transcribeWithGemini(blob, apiKey);
}

async function transcribeWithOpenAI(blob, apiKey) {
  const form = new FormData();
  const voiceModel = runtimeConfig.voiceModels?.openai || "gpt-4o-mini-transcribe";
  form.append("model", voiceModel);
  form.append("file", blob, `voice.${pickFileExtension(blob.type)}`);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: form
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "OpenAI transcription failed.");
  }
  return data?.text || "";
}

async function transcribeWithGemini(blob, apiKey) {
  const model = runtimeConfig.voiceModels?.gemini || modelEl.value.trim() || "gemini-2.0-flash";
  const audioBase64 = await blobToBase64(blob);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Transcribe this audio exactly. Return plain text only."
            },
            {
              inlineData: {
                mimeType: blob.type || "audio/webm",
                data: audioBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0
      }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Gemini transcription failed.");
  }
  return (data?.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("\n").trim();
}

function pickFileExtension(mimeType) {
  if (mimeType.includes("mp4")) {
    return "m4a";
  }
  if (mimeType.includes("ogg")) {
    return "ogg";
  }
  return "webm";
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("audio encoding failed"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("audio read failed"));
    reader.readAsDataURL(blob);
  });
}

async function generateApp() {
  const provider = providerEl.value;
  const model = modelEl.value.trim();
  const engine = engineEl.value;
  const apiKey = apiKeyEl.value.trim();
  const prompt = promptEl.value.trim();

  if (!apiKey) {
    setStatus("Add API key first.");
    return;
  }
  if (!prompt) {
    setStatus("Add a WebXR app prompt first.");
    return;
  }
  if (!model) {
    setStatus("Choose a model.");
    return;
  }

  persistSettings();
  setLoading(true);
  setStatus(`Generating with ${provider} / ${model} (${engineLabel(engine)})...`);

  try {
    const systemPrompt = buildSystemPrompt(engine);
    const userPrompt = buildUserPrompt(prompt, engine);
    let rawText = "";

    if (provider === "openai") {
      rawText = await callOpenAI({ apiKey, model, systemPrompt, userPrompt });
    } else {
      rawText = await callGemini({ apiKey, model, systemPrompt, userPrompt });
    }

    const files = parseGeneratedFiles(rawText);
    setGeneratedFiles(files);
    applyCurrentFiles();
    setStatus("Generated and applied app files.");
  } catch (err) {
    setStatus(`Generation failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
}

function engineLabel(engine) {
  if (engine === "aframe") {
    return "A-Frame";
  }
  if (engine === "8thwall") {
    return "8th Wall-style";
  }
  return "Three.js";
}

function setLoading(loading) {
  generateBtn.disabled = loading;
  generateBtn.textContent = loading ? "Generating..." : "Generate App Files";
}

function setGeneratedFiles(files) {
  const fallback = getGhostStarterFiles(engineEl.value);
  indexEditor.value = files.index_html || fallback.index_html;
  styleEditor.value = files.style_css || fallback.style_css;
  scriptEditor.value = files.app_js || fallback.app_js;
}

function applyCurrentFiles() {
  const files = {
    index_html: indexEditor.value,
    style_css: styleEditor.value,
    app_js: scriptEditor.value
  };
  previewFrame.srcdoc = composeSrcDoc(files);
}

function openPreviewTab() {
  const html = composeSrcDoc({
    index_html: indexEditor.value,
    style_css: styleEditor.value,
    app_js: scriptEditor.value
  });
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 20000);
}

function openKeyPortal() {
  const provider = providerEl.value;
  const url =
    provider === "openai"
      ? "https://platform.openai.com/api-keys"
      : "https://aistudio.google.com/app/apikey";

  window.open(url, "_blank", "noopener,noreferrer");
  setStatus(`Opened ${provider === "openai" ? "OpenAI" : "Gemini"} API key portal.`);
}

function composeSrcDoc(files) {
  const html = String(files.index_html || "");
  const css = String(files.style_css || "");
  const js = normalizeAppJsImports(String(files.app_js || ""));
  const portalUrl = JSON.stringify(window.location.href);

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);

  const bodyContent = bodyMatch ? sanitizeBody(bodyMatch[1]) : `<div id="app"></div>`;
  const headContent = headMatch ? sanitizeHead(headMatch[1]) : "<meta charset=\"utf-8\">";

  return `<!doctype html>
<html lang="en">
<head>
  ${headContent}
  <style>${css}</style>
  <style>${buildPortalReturnStyles()}</style>
</head>
<body>
  ${bodyContent}
  ${buildPortalReturnButton()}
  <script type="module">${js.replace(/<\/script>/gi, "<\\/script>")}</script>
  <script>${buildPortalReturnScript(portalUrl).replace(/<\/script>/gi, "<\\/script>")}</script>
</body>
</html>`;
}

function buildPortalReturnStyles() {
  return `
    .genxr-return {
      position: fixed;
      left: 16px;
      top: 16px;
      z-index: 2147483647;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      padding: 10px 14px;
      border: 2px solid rgba(255,255,255,0.88);
      border-radius: 999px;
      background: rgba(7, 16, 30, 0.76);
      color: #ffffff;
      font: 700 14px/1 "Space Grotesk", system-ui, sans-serif;
      letter-spacing: 0.01em;
      box-shadow: 0 10px 24px rgba(0,0,0,0.28);
      backdrop-filter: blur(8px);
      cursor: pointer;
    }
    .genxr-return::before {
      content: "";
      width: 10px;
      height: 10px;
      border-left: 3px solid currentColor;
      border-bottom: 3px solid currentColor;
      transform: rotate(45deg);
      margin-left: 2px;
    }
    .genxr-return:hover,
    .genxr-return:focus-visible {
      outline: none;
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(0,0,0,0.34), 0 0 0 4px rgba(255,255,255,0.16);
    }
    @media (max-width: 640px) {
      .genxr-return {
        left: 12px;
        top: 12px;
        min-height: 40px;
        padding: 9px 12px;
        font-size: 13px;
      }
    }
  `;
}

function buildPortalReturnButton() {
  return `<button class="genxr-return" id="genxrReturnBtn" type="button" aria-label="Back to genXR">Back to genXR</button>`;
}

function buildPortalReturnScript(portalUrl) {
  return `
    (() => {
      const portalUrl = ${portalUrl};
      const btn = document.getElementById("genxrReturnBtn");
      if (!btn) return;
      btn.addEventListener("click", () => {
        if (window.top && window.top !== window.self) {
          window.top.location.href = portalUrl;
          return;
        }
        window.location.href = portalUrl;
      });
    })();
  `;
}

function sanitizeHead(headContent) {
  return headContent
    .replace(/<link[^>]*href=["'][^"']*style\.css[^"']*["'][^>]*>/gi, "")
    .replace(/<script[^>]*src=["'][^"']*app\.js[^"']*["'][^>]*>\s*<\/script>/gi, "")
    .replace(/<script(?![^>]*src=["'][^"']*(?:aframe|8thwall|xr8)[^"']*["'])[^>]*>[\s\S]*?<\/script>/gi, "");
}

function sanitizeBody(bodyContent) {
  return bodyContent
    .replace(/<script[^>]*src=["'][^"']*app\.js[^"']*["'][^>]*>\s*<\/script>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<link[^>]*href=["'][^"']*style\.css[^"']*["'][^>]*>/gi, "");
}

function normalizeAppJsImports(js) {
  return js
    .replace(
      /import\s+["']three["'];?/g,
      'import "https://unpkg.com/three@0.161.0/build/three.module.js";'
    )
    .replace(
      /from\s+["']three["']/g,
      'from "https://unpkg.com/three@0.161.0/build/three.module.js"'
    )
    .replace(
      /from\s+["']three\/examples\/jsm\/([^"']+)["']/g,
      'from "https://unpkg.com/three@0.161.0/examples/jsm/$1"'
    )
    .replace(
      /from\s+["']three\/addons\/([^"']+)["']/g,
      'from "https://unpkg.com/three@0.161.0/examples/jsm/$1"'
    )
    .replace(
      /import\(\s*["']three["']\s*\)/g,
      'import("https://unpkg.com/three@0.161.0/build/three.module.js")'
    );
}

async function callOpenAI({ apiKey, model, systemPrompt, userPrompt }) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }]
        }
      ],
      temperature: 0.2,
      max_output_tokens: 8000
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "OpenAI request failed.");
  }

  const text = extractOpenAIText(data);
  if (!text.trim()) {
    throw new Error("OpenAI returned empty output.");
  }
  return text;
}

function extractOpenAIText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  const output = Array.isArray(data.output) ? data.output : [];
  const chunks = [];
  for (const item of output) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const c of content) {
      if (typeof c.text === "string") {
        chunks.push(c.text);
      } else if (typeof c.output_text === "string") {
        chunks.push(c.output_text);
      }
    }
  }
  return chunks.join("\n");
}

async function callGemini({ apiKey, model, systemPrompt, userPrompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Gemini request failed.");
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join("\n").trim();
  if (!text) {
    throw new Error("Gemini returned empty output.");
  }
  return text;
}

function parseGeneratedFiles(raw) {
  const parsed = parseJsonLenient(raw);
  const files = {
    index_html: parsed.index_html || parsed.indexHtml || parsed.html || "",
    style_css: parsed.style_css || parsed.styleCss || parsed.css || "",
    app_js: parsed.app_js || parsed.appJs || parsed.js || ""
  };

  if (!files.index_html || !files.style_css || !files.app_js) {
    throw new Error("Model output missing required keys: index_html, style_css, app_js.");
  }
  return files;
}

function parseJsonLenient(text) {
  const clean = String(text).trim();
  try {
    return JSON.parse(clean);
  } catch {
    const fenced = clean.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      return JSON.parse(fenced[1]);
    }
    const first = clean.indexOf("{");
    const last = clean.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      return JSON.parse(clean.slice(first, last + 1));
    }
  }
  throw new Error("Could not parse model output as JSON.");
}

function buildSystemPrompt(engine) {
  const engineTarget =
    engine === "aframe"
      ? "A-Frame"
      : engine === "8thwall"
        ? "8th Wall-style WebXR (browser-compatible fallback when 8th Wall runtime is unavailable)"
        : "Three.js";
  return [
    "You generate complete WebXR web apps from prompts.",
    `Preferred engine target: ${engineTarget}.`,
    "Return only JSON object with keys: index_html, style_css, app_js, summary.",
    "No markdown fences and no prose outside JSON.",
    "Code quality requirements:",
    "- Full runnable app with desktop fallback controls.",
    "- WebXR support with Three.js and VRButton.",
    "- Keep compatibility-friendly for mobile and browser-based XR viewers such as Snap Spectacles browser environments.",
    "- Mobile responsive and performance-conscious.",
    "- Include concise comments only when needed.",
    "- Keep external assets optional or generated procedurally."
  ].join("\n");
}

function buildUserPrompt(prompt, engine) {
  const engineHint =
    engine === "aframe"
      ? "Use A-Frame scene/entity patterns."
      : engine === "8thwall"
        ? "Use 8th Wall-style compatible structure, but ensure browser fallback works without proprietary runtime."
        : "Use Three.js ESM modules.";
  return [
    `Build a complete WebXR app based on this prompt: ${prompt}`,
    "Output strict JSON with the exact keys index_html, style_css, app_js, summary.",
    "The HTML must include a root element and script tag for app.js.",
    "Use ESM imports from CDN (three.module.js, OrbitControls, VRButton) when needed.",
    engineHint
  ].join("\n");
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setVoiceStatus(text) {
  voiceStatusEl.textContent = text;
}

function updateVoiceButton() {
  if (voiceMode === "recorder") {
    voiceBtn.textContent = isListening ? "Stop Recording" : "Record Voice Prompt";
    return;
  }
  if (voiceMode === "webspeech") {
    voiceBtn.textContent = isListening ? "Stop Voice Input" : "Start Voice Input";
    return;
  }
  voiceBtn.textContent = "Voice Unsupported";
}
