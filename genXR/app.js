const STORAGE_KEY = "genxr_settings_v1";

const providerEl = document.getElementById("provider");
const modelEl = document.getElementById("model");
const engineEl = document.getElementById("engine");
const apiKeyEl = document.getElementById("apiKey");
const getKeyBtn = document.getElementById("getKeyBtn");
const promptEl = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const applyBtn = document.getElementById("applyBtn");
const exampleBtn = document.getElementById("exampleBtn");
const starterBtn = document.getElementById("starterBtn");
const statusEl = document.getElementById("status");
const previewFrame = document.getElementById("previewFrame");
const openPreviewBtn = document.getElementById("openPreviewBtn");
const indexEditor = document.getElementById("indexEditor");
const styleEditor = document.getElementById("styleEditor");
const scriptEditor = document.getElementById("scriptEditor");
const tabEls = [...document.querySelectorAll(".tab")];
let lastProvider = "gemini";
const runtimeConfig = window.GENXR_CONFIG || {};
const requiredEls = [
  providerEl,
  modelEl,
  engineEl,
  apiKeyEl,
  getKeyBtn,
  promptEl,
  generateBtn,
  applyBtn,
  exampleBtn,
  starterBtn,
  statusEl,
  previewFrame,
  openPreviewBtn,
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

if (requiredEls.some((el) => !el)) {
  console.warn("genXR builder UI elements are missing. Skipping boot.");
} else {
  boot();
}
function boot() {
  hydrateSettings();
  wireEvents();
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
  exampleBtn.addEventListener("click", () => {
    promptEl.value = examplePrompt;
  });
  starterBtn.addEventListener("click", () => {
    setGeneratedFiles(getGhostStarterFiles(engineEl.value));
    applyCurrentFiles();
    setStatus(`Loaded ${engineLabel(engineEl.value)} ghost starter app.`);
  });
  getKeyBtn.addEventListener("click", openKeyPortal);
  providerEl.addEventListener("change", onProviderChange);
  engineEl.addEventListener("change", persistSettings);
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
  if (!currentModel || currentModel === previousDefault) {
    modelEl.value = defaultModelFor(providerEl.value);
  }
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
      modelEl.value = saved.model || defaultModelFor(providerEl.value);
      engineEl.value = saved.engine || cfgEngine;
      apiKeyEl.value = saved.apiKey || "";
    } catch {
      providerEl.value = cfgProvider;
      modelEl.value = defaultModelFor(providerEl.value);
      engineEl.value = cfgEngine;
    }
  } else {
    providerEl.value = cfgProvider;
    modelEl.value = defaultModelFor(providerEl.value);
    engineEl.value = cfgEngine;
  }

  if (runtimeConfig.defaultModel) {
    modelEl.value = runtimeConfig.defaultModel;
  }

  if (!modelEl.value.trim()) {
    modelEl.value = defaultModelFor(providerEl.value);
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
      apiKey: apiKeyEl.value.trim()
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

function applyDebugKeyForProvider() {
  const shouldUseDebug = runtimeConfig.preferDebugKey === true;
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

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);

  const bodyContent = bodyMatch ? sanitizeBody(bodyMatch[1]) : `<div id="app"></div>`;
  const headContent = headMatch ? sanitizeHead(headMatch[1]) : "<meta charset=\"utf-8\">";

  return `<!doctype html>
<html lang="en">
<head>
  ${headContent}
  <style>${css}</style>
</head>
<body>
  ${bodyContent}
  <script type="module">${js.replace(/<\/script>/gi, "<\\/script>")}</script>
</body>
</html>`;
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
