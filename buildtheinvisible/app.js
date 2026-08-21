const slides = [...document.querySelectorAll('.slide')];
const slideList = document.querySelector('#slideList');
const slideCounter = document.querySelector('#slideCounter');
const progressBar = document.querySelector('#progressBar');
let currentSlide = 0;
const mediaVideos = [...document.querySelectorAll('.media-slide video')];
const mediaFadeTimers = new WeakMap();
function fadeMediaVolume(video, targetVolume) { const startVolume = video.volume || 0; const duration = 900; const startedAt = performance.now(); clearInterval(mediaFadeTimers.get(video)); if (targetVolume > 0) { video.volume = startVolume; video.muted = false; video.play?.().catch(() => {}); } const timer = setInterval(() => { const progress = Math.min(1, (performance.now() - startedAt) / duration); video.volume = startVolume + (targetVolume - startVolume) * progress; if (progress === 1) { clearInterval(timer); mediaFadeTimers.delete(video); if (targetVolume === 0) video.muted = true; } }, 16); mediaFadeTimers.set(video, timer); }
function syncMediaAudio() { const shouldUnmute = currentSlide === 6 && document.querySelector('#deck').classList.contains('is-visible'); mediaVideos.forEach(video => { if (video.classList.contains('is-audible')) { fadeMediaVolume(video, shouldUnmute ? 1 : 0); return; } clearInterval(mediaFadeTimers.get(video)); mediaFadeTimers.delete(video); video.volume = 0; video.muted = true; }); }
const slideNames = ['The new interface', 'XR 101', 'The glasses ladder', 'Design for a glance', "The builder's loop", 'Neural band gestures', 'MRBD app compilations', 'Your first build'];
slideNames.forEach((name, index) => { const button = document.createElement('button'); button.className = `slide-nav ${index === 0 ? 'is-active' : ''}`; button.innerHTML = `<span>0${index + 1}</span><strong>${name}</strong>`; button.addEventListener('click', () => showSlide(index)); slideList.appendChild(button); });
function showSlide(index) { currentSlide = (index + slides.length) % slides.length; slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === currentSlide)); [...document.querySelectorAll('.slide-nav')].forEach((button, buttonIndex) => button.classList.toggle('is-active', buttonIndex === currentSlide)); slideCounter.textContent = `0${currentSlide + 1} / 0${slides.length}`; progressBar.style.width = `${((currentSlide + 1) / slides.length) * 100}%`; syncMediaAudio(); }
document.querySelector('#prevSlide').addEventListener('click', () => showSlide(currentSlide - 1));
document.querySelector('#nextSlide').addEventListener('click', () => showSlide(currentSlide + 1));
document.addEventListener('keydown', event => { if (document.querySelector('#deck').classList.contains('is-visible') && ['ArrowLeft', 'ArrowRight'].includes(event.key)) showSlide(currentSlide + (event.key === 'ArrowRight' ? 1 : -1)); });
function showView(view) { document.querySelectorAll('[data-view-panel]').forEach(panel => panel.classList.toggle('is-visible', panel.dataset.viewPanel === view)); document.querySelectorAll('.mode-btn').forEach(button => button.classList.toggle('is-active', button.dataset.view === view)); window.location.hash = view; syncMediaAudio(); if (view === 'lab') refitActiveLabPreview(); }
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));

const spectrumCopy = {
  real: {
    kicker: 'PHYSICAL REALITY',
    title: 'The world as it is',
    body: 'No overlay, no mediation. People, places, objects, light, sound, and context are already doing most of the work.',
    examples: 'Walking into a room, reading a sign, talking to someone, picking up an object',
    devices: 'Normal eyewear, phone in pocket, the unaided human senses'
  },
  assisted: {
    kicker: 'ASSISTED REALITY',
    title: 'Glanceable help, not spatial AR',
    body: 'A lightweight display or head-mounted layer gives context while the real world stays primary. It usually does not spatially register 3D content to the room.',
    examples: 'Messages, captions, translation, navigation cue, camera preview, checklist',
    devices: 'Meta Ray-Ban Display, Google Glass, display smart glasses'
  },
  ar: {
    kicker: 'AUGMENTED REALITY',
    title: 'Reality with computed layers',
    body: 'Digital information and spatial experiences are layered into the real world, from simple overlays to room-aware interaction.',
    examples: 'Google Maps Live View walking arrows, IKEA furniture preview, Snapchat Lenses, museum labels, appliance repair guides, shared tabletop games',
    devices: 'Optical: Snap Spectacles, Project Orion, XREAL Project Aura. Passthrough: Meta Quest 3, Apple Vision Pro, Samsung Galaxy XR. Phone: iPhone ARKit and Android ARCore phones.',
    deviceGroups: [
      { label: 'Optical', devices: ['Snap Spectacles', 'Project Orion', 'XREAL Project Aura'] },
      { label: 'Passthrough', devices: ['Meta Quest 3', 'Apple Vision Pro', 'Samsung Galaxy XR'] },
      { label: 'Phone', devices: ['iPhone / ARKit', 'Android / ARCore', 'Galaxy phones'] }
    ]
  },
  vr: {
    kicker: 'VIRTUAL REALITY',
    title: 'A fully simulated environment',
    body: 'The real world recedes and the user enters a complete digital scene for immersion, training, play, or presence.',
    examples: 'VR games, training simulations, immersive cinema, virtual meetings, design walkthroughs',
    devices: 'Meta Quest, PlayStation VR, Valve Index, HTC Vive'
  }
};
function setSpectrumPoint(key) {
  const copy = spectrumCopy[key];
  if (!copy) return;
  document.querySelectorAll('.spectrum-point').forEach(point => {
    const isActive = point.dataset.spectrum === key;
    point.classList.toggle('is-active', isActive);
    point.setAttribute('aria-selected', isActive);
  });
  const spectrum = document.querySelector('.spectrum');
  if (spectrum) spectrum.dataset.activeSpectrum = key;
  document.querySelector('#spectrumKicker').textContent = copy.kicker;
  document.querySelector('#spectrumTitle').textContent = copy.title;
  document.querySelector('#spectrumBody').textContent = copy.body;
  document.querySelector('#spectrumExamples').textContent = copy.examples;
  const devices = document.querySelector('#spectrumDevices');
  if (copy.deviceGroups) {
    devices.innerHTML = `<div class="spectrum-device-groups">${copy.deviceGroups.map(group => `<section><b>${group.label}</b><span>${group.devices.join('</span><span>')}</span></section>`).join('')}</div>`;
  } else {
    devices.textContent = copy.devices;
  }
}
document.querySelectorAll('.spectrum-point').forEach(point => {
  point.addEventListener('click', () => setSpectrumPoint(point.dataset.spectrum));
  point.addEventListener('focus', () => setSpectrumPoint(point.dataset.spectrum));
});

const glanceCursor = document.querySelector('.glance-cursor');
if (glanceCursor && matchMedia('(pointer:fine)').matches) {
  document.body.classList.add('has-glance-cursor');
  window.addEventListener('pointermove', event => {
    glanceCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    glanceCursor.classList.add('is-visible');
  });
  window.addEventListener('pointerdown', () => glanceCursor.classList.add('is-pinching'));
  window.addEventListener('pointerup', () => glanceCursor.classList.remove('is-pinching'));
  window.addEventListener('pointerleave', () => glanceCursor.classList.remove('is-visible'));
}

const gestureSignal = document.querySelector('.signal-visualizer');
const gestureSignalLabel = document.querySelector('#gestureSignalLabel');
const gestureSignalIntent = document.querySelector('#gestureSignalIntent');
document.querySelectorAll('.gesture-list button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.gesture-list button').forEach(item => item.classList.toggle('is-active', item === button));
    if (!gestureSignal) return;
    gestureSignal.dataset.gesture = button.dataset.gesture;
    gestureSignalLabel.textContent = button.dataset.label;
    gestureSignalIntent.textContent = button.dataset.intent;
  });
});

const xdgMumbaiTemplate = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="mrbd-web-app-capable" content="yes">
  <meta name="viewport" content="width=600, height=600, initial-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#000000">
  <title>XDG Mumbai HUD</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: 600px;
      height: 600px;
      margin: 0;
      overflow: hidden;
      background: #000;
      color: #fff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    body {
      display: grid;
      place-items: center;
      padding: 42px;
    }
    .hud {
      width: 100%;
      height: 100%;
      border: 2px solid #17d4e4;
      border-radius: 28px;
      padding: 34px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      outline: none;
      box-shadow: 0 0 34px rgba(23, 212, 228, 0.22);
    }
    .hud:focus {
      border-color: #e5f46b;
      box-shadow: 0 0 38px rgba(229, 244, 107, 0.32);
    }
    .meta, .controls {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: #17d4e4;
      font: 14px ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: 68px;
      line-height: .92;
      letter-spacing: -.06em;
    }
    .accent { color: #0878f9; }
    p {
      max-width: 390px;
      margin: 18px 0 0;
      color: #c7d3e3;
      font-size: 22px;
      line-height: 1.28;
    }
    .state {
      color: #e5f46b;
      font: 16px ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: .08em;
    }
  </style>
</head>
<body>
  <main class="hud" id="hud" tabindex="0">
    <div class="meta"><span>XDG</span><span>मुंBAI</span></div>
    <section>
      <h1>Welcome to<br><span class="accent">XDG मुंBAI</span></h1>
      <p id="message">A tiny MRBD Web App that teaches itself one glance at a time.</p>
    </section>
    <div class="controls"><span id="state">Ready</span><span>← → Enter Esc</span></div>
  </main>
  <script>
    const messages = [
      'A tiny MRBD Web App that teaches itself one glance at a time.',
      'Black stays transparent. Bright pixels become the interface.',
      'Arrow keys move the moment. Enter confirms. Escape resets.'
    ];
    let index = 0;
    let selected = false;
    const hud = document.getElementById('hud');
    const message = document.getElementById('message');
    const state = document.getElementById('state');

    function render() {
      message.textContent = messages[index];
      state.textContent = selected ? 'Selected' : 'Cue ' + String(index + 1).padStart(2, '0');
    }

    hud.focus();
    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { index = (index + 1) % messages.length; selected = false; }
      if (event.key === 'ArrowLeft') { index = (index + messages.length - 1) % messages.length; selected = false; }
      if (event.key === 'Enter') selected = true;
      if (event.key === 'Escape') { index = 0; selected = false; }
      render();
    });
    render();
  </script>
</body>
</html>`;

const labData = [
  { kicker: 'STEP 01 / IDEA', title: 'Start with one greeting.', text: 'We will build one tiny HUD: Welcome to XDG मुंBAI. The display begins with the useful moment, not platform boilerplate.', phase: 'idea', preview: { label: 'MINIMAL HUD', title: 'Welcome to XDG मुंBAI', detail: 'One clear glance for people entering the room.', badges: ['XDG', 'मुंBAI'] }, items: [{ label: 'Name the moment', inject: 'The app greets attendees at XDG Mumbai with one readable HUD.', badge: 'MOMENT' }, { label: 'Keep one idea visible', inject: 'The first screen should only say Welcome to XDG मुंBAI and one short supporting line.', badge: 'ONE GLANCE' }, { label: 'Use black as absence', inject: 'The HUD should sit on a black additive-display background.', badge: 'BLACK' }, { label: 'Make it copy-ready', inject: 'Keep the first version as a single HTML file that can move into Studio.', badge: 'HTML' }], code: '<main class="hud" tabindex="0">\n  <span>XDG / मुंBAI</span>\n  <h1>Welcome to XDG मुंBAI</h1>\n  <p>A tiny HUD for the first glance.</p>\n</main>', callout: 'Start with hospitality, not features. A wearable app should feel like it noticed the room and knew exactly what to say.' },
  { kicker: 'STEP 02 / MRBD SHELL', title: 'Wrap it for the display.', text: 'Now the same greeting gets the platform contract: MRBD capability, fixed 600 x 600 viewport, and a black canvas.', phase: 'shell', preview: { label: 'MRBD SHELL', title: 'Welcome to XDG मुंBAI', detail: 'Capability tag and viewport are now locked.', badges: ['MRBD', '600 x 600'] }, items: [{ label: 'Add MRBD capable meta', inject: 'Add <meta name="mrbd-web-app-capable" content="yes"> to the head.', badge: 'CAPABLE' }, { label: 'Lock 600 x 600 viewport', inject: 'Set viewport width=600, height=600, initial-scale=1.0, user-scalable=no.', badge: 'VIEWPORT' }, { label: 'Use public HTTPS later', inject: 'Plan to host the app on a public HTTPS URL before loading it on glasses.', badge: 'HTTPS' }, { label: 'Use PNG favicon', inject: 'Use a PNG favicon because SVG favicons are not supported.', badge: 'PNG' }], code: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="mrbd-web-app-capable" content="yes">\n  <meta name="viewport" content="width=600, height=600, initial-scale=1.0, user-scalable=no">\n  <meta name="theme-color" content="#000000">\n  <link rel="icon" type="image/png" href="/favicon.png">\n  <title>XDG Mumbai HUD</title>\n</head>\n<body>\n  <main class="hud" tabindex="0">Welcome to XDG मुंBAI</main>\n</body>\n</html>', callout: 'This is the moment the idea learns where it lives. The shell is not bureaucracy; it is the shape of the stage.' },
  { kicker: 'STEP 03 / DISPLAY STYLE', title: 'Make it glanceable.', text: 'The app gets its 600 x 600 visual design: big type, bright borders, black background, and no scroll dependency.', phase: 'style', preview: { label: 'DISPLAY STYLE', title: 'Welcome to XDG मुंBAI', detail: 'Big type, bright pixels, no scrolling.', badges: ['BIG TYPE', 'NO SCROLL'] }, items: [{ label: 'Set body to 600 x 600', inject: 'Make html and body exactly 600px by 600px with overflow hidden.', badge: 'SIZE' }, { label: 'Center the HUD', inject: 'Use grid centering and generous padding so the HUD reads quickly.', badge: 'CENTER' }, { label: 'Create a focus ring', inject: 'Use a visible focus state for the HUD container.', badge: 'FOCUS' }, { label: 'Avoid tiny UI', inject: 'Use large display text and short supporting copy.', badge: 'READABLE' }], code: 'html, body {\n  width: 600px;\n  height: 600px;\n  margin: 0;\n  overflow: hidden;\n  background: #000;\n  color: #fff;\n}\nbody {\n  display: grid;\n  place-items: center;\n  padding: 42px;\n}\n.hud {\n  width: 100%;\n  height: 100%;\n  border: 2px solid #17d4e4;\n  border-radius: 28px;\n  padding: 34px;\n}\nh1 {\n  font-size: 68px;\n  line-height: .92;\n}', callout: 'On glasses, design is less about filling space and more about earning a glance. If someone has to study it, it is already too heavy.' },
  { kicker: 'STEP 04 / INTERACTION', title: 'Teach it input.', text: 'The greeting becomes interactive. Arrow keys cycle teaching cues, Enter confirms, and Escape resets the HUD.', phase: 'input', preview: { label: 'INPUT PASS', title: 'Welcome to XDG मुंBAI', detail: 'Arrow keys cycle cues. Enter confirms.', badges: ['ARROWS', 'ENTER', 'ESC'] }, items: [{ label: 'ArrowRight advances', inject: 'ArrowRight should advance to the next teaching cue.', badge: 'NEXT' }, { label: 'ArrowLeft goes back', inject: 'ArrowLeft should return to the previous teaching cue.', badge: 'BACK' }, { label: 'Enter confirms', inject: 'Enter should update the state label to Selected.', badge: 'SELECT' }, { label: 'Escape resets', inject: 'Escape should return to the first welcome cue.', badge: 'RESET' }], code: "const messages = [\n  'A tiny MRBD Web App that teaches itself one glance at a time.',\n  'Black stays transparent. Bright pixels become the interface.',\n  'Arrow keys move the moment. Enter confirms. Escape resets.'\n];\nlet index = 0;\nlet selected = false;\n\nfunction render() {\n  message.textContent = messages[index];\n  state.textContent = selected ? 'Selected' : 'Cue ' + String(index + 1).padStart(2, '0');\n}\n\ndocument.addEventListener('keydown', event => {\n  if (event.key === 'ArrowRight') { index = (index + 1) % messages.length; selected = false; }\n  if (event.key === 'ArrowLeft') { index = (index + messages.length - 1) % messages.length; selected = false; }\n  if (event.key === 'Enter') selected = true;\n  if (event.key === 'Escape') { index = 0; selected = false; }\n  render();\n});", callout: 'Interaction should feel like a nod in conversation: small, reversible, and obvious enough that the user never has to remember a manual.' },
  { kicker: 'STEP 05 / SETUP CHECK', title: 'Prepare to load it.', text: 'Before the final code, the lab folds in the practical setup checks from the docs so the app can actually reach glasses.', phase: 'setup', preview: { label: 'DEVICE READY', title: 'Welcome to XDG मुंBAI', detail: 'Hardware, app version, Developer Mode, HTTPS.', badges: ['v125+', 'v272+'] }, items: [{ label: 'MRBD glasses v125+', inject: 'Confirm the glasses software is v125 or newer.', badge: 'GLASSES' }, { label: 'Meta AI app v272+', inject: 'Confirm the Meta AI app is v272 or newer.', badge: 'APP' }, { label: 'Enable Developer Mode', inject: 'Tap the Meta AI app version five times and enable Developer Mode.', badge: 'DEV MODE' }, { label: 'Host on HTTPS', inject: 'Deploy the HTML to a public HTTPS host before connecting it.', badge: 'HOST' }], code: 'Setup checklist for the XDG Mumbai HUD:\n- MRBD glasses software v125+\n- Meta AI app v272+\n- Developer Mode enabled from Settings > App Info\n- Public HTTPS hosting URL\n- Browser test at 600 x 600 before device reload\n\nAI prompt:\nUse the Web Apps setup docs and search_webapps_docs from the Wearables MCP endpoint before changing code.', callout: 'The last mile is rarely glamorous, but it is where the demo becomes real. Treat setup as part of the experience, not an errand after it.' },
  { kicker: 'STEP 06 / FULL TEMPLATE', title: 'Copy the finished HUD.', text: 'The final step reveals the full template used by Studio. It is the completed Welcome to XDG मुंBAI Web App.', phase: 'final', preview: { label: 'FULL TEMPLATE', title: 'Welcome to XDG मुंBAI', detail: 'Ready to open in Studio and iterate.', badges: ['COMPLETE', 'STUDIO'] }, items: [{ label: 'Full HTML document', inject: 'The final output is a complete HTML document.', badge: 'HTML' }, { label: 'MRBD metadata included', inject: 'The final output includes mrbd-web-app-capable and fixed viewport metadata.', badge: 'META' }, { label: 'Input behavior included', inject: 'The final output includes Arrow, Enter, and Escape behavior.', badge: 'INPUT' }, { label: 'Ready for Studio', inject: 'Open Studio to edit the same template live.', badge: 'EDIT' }], code: xdgMumbaiTemplate, callout: 'Now the room has a seed app: small enough to understand, complete enough to remix, and personal enough to feel made for this moment.' }
];
let labStep = 0; const labSteps = document.querySelector('#labSteps'); const labContent = document.querySelector('#labContent');
labData.forEach((step, index) => { const button = document.createElement('button'); button.innerHTML = `<span>0${index + 1}</span>${step.title}`; button.addEventListener('click', () => renderLab(index)); labSteps.appendChild(button); });
let labTypingTimer;
function hasLabSignal(activeItems, label) { return activeItems.some(item => item.label === label); }
function getPriorLabItems(index) { return labData.slice(0, index).flatMap(step => step.items); }
function hasAllLabSignals(activeItems, labels) { return labels.every(label => hasLabSignal(activeItems, label)); }
function buildMixedPrompt(step, activeItems) {
  const has = label => hasLabSignal(activeItems, label);
  if (step.phase === 'final' && hasAllLabSignals(activeItems, step.items.map(item => item.label))) return xdgMumbaiTemplate;
  if (step.phase === 'final') return `// Select the cards below to reveal the finished XDG Mumbai HUD template.\n${activeItems.map(item => `// ${item.label}: ${item.inject}`).join('\n') || '// Nothing selected yet.'}`;
  if (step.phase === 'idea') {
    const body = [
      '<main class="hud" tabindex="0">',
      has('Name the moment') ? '  <span>XDG / मुंBAI</span>' : '  <span>UNTITLED MOMENT</span>',
      has('Name the moment') ? '  <h1>Welcome to XDG मुंBAI</h1>' : '  <h1>Your useful glance</h1>',
      has('Keep one idea visible') ? '  <p>A tiny HUD for the first glance.</p>' : null,
      '</main>'
    ].filter(Boolean).join('\n');
    if (!has('Use black as absence') && !has('Make it copy-ready')) return body;
    const style = has('Use black as absence') ? '<style>\n  body { background:#000; color:#fff; }\n</style>\n' : '';
    if (!has('Make it copy-ready')) return `${style}${body}`;
    return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>XDG Mumbai HUD</title>\n  ${style.trim()}\n</head>\n<body>\n${body}\n</body>\n</html>`;
  }
  if (step.phase === 'shell') {
    const style = has('Use black as absence') ? '  <style>\n    body { background:#000; color:#fff; }\n  </style>\n' : '';
    return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n${has('Add MRBD capable meta') ? '  <meta name="mrbd-web-app-capable" content="yes">\n' : ''}${has('Lock 600 x 600 viewport') ? '  <meta name="viewport" content="width=600, height=600, initial-scale=1.0, user-scalable=no">\n  <meta name="theme-color" content="#000000">\n' : ''}${has('Use PNG favicon') ? '  <link rel="icon" type="image/png" href="/favicon.png">\n' : ''}  <title>XDG Mumbai HUD</title>\n${style}</head>\n<body>\n  <main class="hud" tabindex="0">\n    <span>${has('Name the moment') ? 'XDG / मुंBAI' : 'UNTITLED MOMENT'}</span>\n    <h1>${has('Name the moment') ? 'Welcome to XDG मुंBAI' : 'Your useful glance'}</h1>\n${has('Keep one idea visible') ? '    <p>A tiny HUD for the first glance.</p>\n' : ''}  </main>\n</body>\n</html>${has('Use public HTTPS later') ? '\n\n// Deploy this file to a public HTTPS URL before loading it on glasses.' : ''}`;
  }
  if (step.phase === 'style') {
    return `html, body {\n${has('Set body to 600 x 600') ? '  width: 600px;\n  height: 600px;\n  margin: 0;\n  overflow: hidden;\n' : ''}  background: #000;\n  color: #fff;\n}\n${has('Center the HUD') ? '\nbody {\n  display: grid;\n  place-items: center;\n  padding: 42px;\n}\n' : ''}${has('Create a focus ring') ? '\n.hud {\n  border: 2px solid #17d4e4;\n  border-radius: 28px;\n  outline: none;\n}\n.hud:focus {\n  border-color: #e5f46b;\n  box-shadow: 0 0 38px rgba(229,244,107,.32);\n}\n' : ''}${has('Avoid tiny UI') ? '\nh1 {\n  font-size: 68px;\n  line-height: .92;\n}\np {\n  max-width: 390px;\n  font-size: 22px;\n}\n' : ''}`;
  }
  if (step.phase === 'input') {
    return `const messages = [\n  'A tiny MRBD Web App that teaches itself one glance at a time.',\n  'Black stays transparent. Bright pixels become the interface.',\n  'Arrow keys move the moment. Enter confirms. Escape resets.'\n];\nlet index = 0;\nlet selected = false;\n\nfunction render() {\n  message.textContent = messages[index];\n  state.textContent = selected ? 'Selected' : 'Cue ' + String(index + 1).padStart(2, '0');\n}\n\ndocument.addEventListener('keydown', event => {\n${has('ArrowRight advances') ? "  if (event.key === 'ArrowRight') { index = (index + 1) % messages.length; selected = false; }\n" : ''}${has('ArrowLeft goes back') ? "  if (event.key === 'ArrowLeft') { index = (index + messages.length - 1) % messages.length; selected = false; }\n" : ''}${has('Enter confirms') ? "  if (event.key === 'Enter') selected = true;\n" : ''}${has('Escape resets') ? "  if (event.key === 'Escape') { index = 0; selected = false; }\n" : ''}  render();\n});`;
  }
  if (step.phase === 'setup') {
    return `Setup checklist for the XDG Mumbai HUD:\n${has('MRBD glasses v125+') ? '- MRBD glasses software v125+\n' : ''}${has('Meta AI app v272+') ? '- Meta AI app v272+\n' : ''}${has('Enable Developer Mode') ? '- Developer Mode enabled from Settings > App Info\n' : ''}${has('Host on HTTPS') ? '- Public HTTPS hosting URL\n' : ''}\nAI prompt:\nUse the Web Apps setup docs and search_webapps_docs from the Wearables MCP endpoint before changing code.`;
  }
  return activeItems.length ? `${step.code}\n\nLive additions:\n${activeItems.map(item => `- ${item.inject}`).join('\n')}` : step.code;
}
function buildAiPrompt(step, activeItems, priorItems = []) {
  const priorLines = priorItems.map(item => `- ${item.inject}`).join('\n') || '- Nothing from earlier steps yet.';
  const selectedLines = activeItems.map(item => `- ${item.inject}`).join('\n') || '- No new build signals selected on this step yet.';
  const finalTemplate = step.phase === 'final' ? `

Build request:
Create the full working app now. Return one complete single-file HTML document in a fenced html code block, with no extra explanation before or after the code.

The app to generate:
- A Meta Ray-Ban Display Web App called "XDG Mumbai HUD".
- It must run directly if saved as index.html and opened in a desktop browser.
- It must be designed for a 600 x 600 display canvas.
- It must feel like a polished minimal HUD that says "Welcome to XDG मुंBAI".
- It must use a black additive-display base so black disappears on the display.
- Use large readable typography, white primary text, Meta blue accent text, cyan HUD frame/focus treatment, muted supporting text, and a small monospace status/control row.
- Do not use external libraries, build tools, images, or network assets.

Required head metadata:
- <meta charset="utf-8">
- <meta name="mrbd-web-app-capable" content="yes">
- <meta name="viewport" content="width=600, height=600, initial-scale=1.0, user-scalable=no">
- <meta name="theme-color" content="#000000">
- A PNG favicon reference, for example <link rel="icon" type="image/png" href="/favicon.png">

Required behavior:
- Focus the HUD on load so keyboard testing works immediately.
- ArrowRight cycles forward through three short teaching cues.
- ArrowLeft cycles backward through those cues.
- Enter changes the state label to "Selected".
- Escape resets to the first cue and clears selection.
- The state row should show "Cue 01", "Cue 02", "Cue 03", or "Selected".
- Include a visible control hint like "← → Enter Esc".

Content:
- Top meta row: "XDG" on the left and "मुंBAI" on the right.
- Main headline: "Welcome to" and "XDG मुंBAI" with the second line styled in blue.
- Teaching cues:
  1. "A tiny MRBD Web App that teaches itself one glance at a time."
  2. "Black stays transparent. Bright pixels become the interface."
  3. "Arrow keys move the moment. Enter confirms. Escape resets."

Quality bar:
- Keep all content inside 600 x 600 with no scrolling.
- Use plain HTML, CSS, and JavaScript only.
- Make the code readable, compact, and ready to paste into a live HTML editor.
- The visual result should approximate the lab preview: centered rounded HUD, cyan border, large greeting, blue accent, status row at the bottom.` : '';
  const base = {
    idea: 'Help me define the smallest useful moment for a Meta Ray-Ban Display Web App.',
    shell: 'Add the required Meta Ray-Ban Display Web App document shell without changing the app idea.',
    style: 'Style this HUD for the 600 x 600 MRBD display using additive-display design constraints.',
    input: 'Add keyboard-driven MRBD interaction to this HUD using Arrow keys, Enter, and Escape.',
    setup: 'Prepare a setup and deployment checklist for loading this Web App on MRBD glasses.',
    final: 'Generate a complete single-file Meta Ray-Ban Display Web App that matches the finished XDG Mumbai HUD.'
  }[step.phase] || 'Help me build this MRBD Web App step by step.';
  return `${base}

Keep these decisions:
${priorLines}

Apply these selected changes:
${selectedLines}

Constraints:
- Keep the app inside a 600 x 600 display.
- Use black as the additive-display base when styling is active.
- Preserve Arrow / Enter / Escape behavior when interaction is active.
${step.phase === 'final' ? '- Return only the requested complete HTML document in one fenced html code block.' : '- Explain any MRBD-specific assumption before adding extra code.'}${finalTemplate}`;
}
function highlightLabCode(value) { return escapeCode(value).replace(/(Welcome to XDG मुंBAI|XDG मुंBAI|mrbd-web-app-capable|width=600|height=600|v125\+|v272\+|Developer Mode|HTTPS|search_webapps_docs|ArrowRight|ArrowLeft|Enter|Escape|favicon\.png|600 x 600|PNG favicon)/g, '<mark>$1</mark>').replace(/(&lt;\/?)([a-z0-9-]+)/gi, '$1<span class="code-tag">$2</span>').replace(/([a-z-]+)=(&quot;.*?&quot;)/gi, '<span class="code-attr">$1</span>=<span class="code-value">$2</span>'); }
function typeLabCode(codeBlock, value) { clearInterval(labTypingTimer); let index = 0; codeBlock.innerHTML = ''; labTypingTimer = setInterval(() => { index += Math.max(2, Math.ceil(value.length / 90)); codeBlock.innerHTML = highlightLabCode(value.slice(0, index)); if (index >= value.length) { clearInterval(labTypingTimer); codeBlock.innerHTML = highlightLabCode(value); } }, 18); }
function buildXdgHudPreview(step, activeItems) {
  const has = label => hasLabSignal(activeItems, label);
  if (step.phase === 'final') return hasAllLabSignals(activeItems, step.items.map(item => item.label)) ? xdgMumbaiTemplate : buildXdgHudPreview({ ...step, phase: 'setup', preview: { ...step.preview, label: 'TEMPLATE LOCKED' } }, activeItems);
  const named = has('Name the moment');
  const hasCopy = step.phase !== 'idea' || has('Make it copy-ready');
  const black = has('Use black as absence') || has('Set body to 600 x 600');
  const sized = has('Set body to 600 x 600') || has('Lock 600 x 600 viewport');
  const capable = ['style', 'input', 'setup'].includes(step.phase) || has('Add MRBD capable meta');
  const centered = has('Center the HUD');
  const focused = has('Create a focus ring');
  const readable = has('Avoid tiny UI');
  const hasInput = has('ArrowRight advances') || has('ArrowLeft goes back') || has('Enter confirms') || has('Escape resets');
  const activeBadges = activeItems.map(item => item.badge).join(' · ');
  const support = activeBadges || 'click cards to build';
  const title = named ? 'Welcome to<br><span class="accent">XDG मुंBAI</span>' : 'Your useful<br><span class="accent">glance</span>';
  const message = has('Keep one idea visible') || step.phase !== 'idea' ? step.phase === 'setup' ? 'Ready for v125+, v272+, Developer Mode, and public HTTPS.' : step.phase === 'input' ? 'Arrow keys move the moment. Enter confirms. Escape resets.' : step.phase === 'style' ? 'Black stays transparent. Bright pixels become the interface.' : step.phase === 'shell' ? 'MRBD metadata and viewport are now in place.' : 'A tiny HUD for the first glance.' : 'Select "Keep one idea visible" to add supporting copy.';
  const bg = black ? '#000' : '#eef3f8';
  const fg = black ? '#fff' : '#101522';
  const muted = black ? '#c7d3e3' : '#56657a';
  const hudBorder = focused ? '2px solid #17d4e4' : '1px solid rgba(23,212,228,.42)';
  const hudHeight = centered || sized ? 'height:100%;' : '';
  const hudDisplay = centered || readable ? 'display:flex;flex-direction:column;justify-content:space-between;' : '';
  const headingSize = readable ? '68px' : '48px';
  const supportLine = hasInput ? '← → Enter Esc' : support;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  ${capable ? '<meta name="mrbd-web-app-capable" content="yes">' : ''}
  ${sized ? '<meta name="viewport" content="width=600, height=600, initial-scale=1.0, user-scalable=no">' : ''}
  ${black ? '<meta name="theme-color" content="#000000">' : ''}
  <title>XDG Mumbai HUD</title>
  <style>
    * { box-sizing: border-box; }
    html, body { ${sized ? 'width:600px;height:600px;' : ''} margin:0; overflow:hidden; background:${bg}; color:${fg}; font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    body { ${centered ? 'display:grid;place-items:center;' : ''} padding:${centered ? '42px' : '28px'}; }
    .hud { width:100%; ${hudHeight} border:${hudBorder}; border-radius:${focused ? '28px' : '12px'}; padding:${readable ? '34px' : '24px'}; ${hudDisplay} outline:none; box-shadow:${focused ? '0 0 34px rgba(23,212,228,.22)' : 'none'}; }
    .hud:focus { border-color: #e5f46b; box-shadow: 0 0 38px rgba(229, 244, 107, 0.32); }
    .meta, .controls { display:flex; justify-content:space-between; gap:12px; color:#17d4e4; font:14px ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.12em; text-transform:uppercase; }
    h1 { margin:${readable ? '0' : '24px 0 12px'}; font-size:${headingSize}; line-height:.92; letter-spacing:-.06em; }
    .accent { color: #0878f9; }
    p { max-width:390px; margin:18px 0 0; color:${muted}; font-size:${readable ? '22px' : '18px'}; line-height:1.28; }
    .state { color: #e5f46b; font: 16px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; }
  </style>
</head>
<body>
  <main class="hud" id="hud" tabindex="0">
    <div class="meta"><span>${named ? 'XDG' : 'MOMENT'}</span><span>${named ? 'मुंBAI' : 'TBD'}</span></div>
    <section>
      <h1>${title}</h1>
      <p id="message">${message}</p>
    </section>
    <div class="controls"><span id="state">${hasInput ? 'Cue 01' : hasCopy ? 'HTML ready' : step.preview.label}</span><span>${supportLine}</span></div>
  </main>
  ${hasInput ? `<script>
    const messages = [
      'A tiny MRBD Web App that teaches itself one glance at a time.',
      'Black stays transparent. Bright pixels become the interface.',
      'Arrow keys move the moment. Enter confirms. Escape resets.'
    ];
    let index = 0;
    let selected = false;
    const hud = document.getElementById('hud');
    const message = document.getElementById('message');
    const state = document.getElementById('state');
    function render() {
      message.textContent = messages[index];
      state.textContent = selected ? 'Selected' : 'Cue ' + String(index + 1).padStart(2, '0');
    }
    hud.focus();
    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { index = (index + 1) % messages.length; selected = false; }
      if (event.key === 'ArrowLeft') { index = (index + messages.length - 1) % messages.length; selected = false; }
      if (event.key === 'Enter') selected = true;
      if (event.key === 'Escape') { index = 0; selected = false; }
      render();
    });
    render();
  </script>` : ''}
</body>
</html>`;
}
function fitLabPreviewFrame(viewport, frame) {
  if (!viewport || !frame || viewport.clientWidth <= 0) return;
  const scale = viewport.clientWidth / 600;
  frame.style.transform = `scale(${scale})`;
}
function refitActiveLabPreview() {
  requestAnimationFrame(() => {
    const viewport = labContent?.querySelector('.lab-preview-viewport');
    const frame = labContent?.querySelector('.lab-preview-frame');
    fitLabPreviewFrame(viewport, frame);
  });
}
function renderLab(index) {
  labStep = Math.max(0, Math.min(index, labData.length - 1));
  const step = labData[labStep];
  const priorItems = getPriorLabItems(labStep);
  let mixedPrompt = buildMixedPrompt(step, priorItems);
  let aiPrompt = buildAiPrompt(step, [], priorItems);
  document.querySelector('#labKicker').textContent = step.kicker;
  labContent.innerHTML = `<h1>${step.title}</h1><p class="lab-lede">${step.text}</p><div class="lab-workbench"><div class="lab-code-panel"><div class="lab-code-head"><span>SAMPLE APP / ${step.phase.toUpperCase()}<i class="panel-chevron" aria-hidden="true"></i></span><button class="copy-step-code" type="button">COPY CODE</button></div><pre class="lab-code"><code></code></pre><div class="ai-prompt-panel"><div class="ai-prompt-head"><span>AI PROMPT<i class="panel-chevron" aria-hidden="true"></i></span><button class="copy-ai-prompt" type="button">COPY PROMPT</button></div><pre class="ai-prompt"><code></code></pre></div></div><div class="sample-display" data-phase="${step.phase}"><div class="lab-preview-meta"><span>600 x 600 LIVE OUTPUT</span><strong class="sample-count">0/${step.items.length}</strong></div><div class="lab-preview-viewport"><iframe class="lab-preview-frame" title="Progressive XDG Mumbai HUD preview" srcdoc="${escapeCode(buildXdgHudPreview(step, priorItems))}"></iframe></div></div></div><div class="flow-board"><div class="flow-meter"><span><b>PROMPT MIXER</b><em class="flow-status">0 SIGNALS MIXED</em></span><i style="--flow-progress:0%"></i></div>${step.items.map((item, itemIndex) => `<button class="flow-card" type="button" aria-pressed="false" data-index="${itemIndex}"><b>${String(itemIndex + 1).padStart(2, '0')}</b><span>${item.label}</span><em>inject</em></button>`).join('')}</div><div class="lab-callout"><span>FIELD NOTE</span><strong>${step.callout}</strong></div>`;
  const codeBlock = labContent.querySelector('.lab-code code');
  const copyButton = labContent.querySelector('.copy-step-code');
  const aiPromptBlock = labContent.querySelector('.ai-prompt code');
  const copyPromptButton = labContent.querySelector('.copy-ai-prompt');
  const flowCards = [...labContent.querySelectorAll('.flow-card')];
  const flowMeter = labContent.querySelector('.flow-meter i');
  const flowStatus = labContent.querySelector('.flow-status');
  const sampleCount = labContent.querySelector('.sample-count');
  const previewFrame = labContent.querySelector('.lab-preview-frame');
  const previewViewport = labContent.querySelector('.lab-preview-viewport');
  const labCodePanel = labContent.querySelector('.lab-code-panel');
  const codeHead = labContent.querySelector('.lab-code-head');
  const promptPanel = labContent.querySelector('.ai-prompt-panel');
  const promptHead = labContent.querySelector('.ai-prompt-head');
  const setExpandedPanel = panel => {
    const nextPanel = labCodePanel.dataset.expanded === panel ? 'split' : panel;
    labCodePanel.dataset.expanded = nextPanel;
    codeHead.setAttribute('aria-expanded', nextPanel === 'code');
    promptHead.setAttribute('aria-expanded', nextPanel === 'prompt');
  };
  codeHead.setAttribute('role', 'button');
  codeHead.setAttribute('tabindex', '0');
  promptHead.setAttribute('role', 'button');
  promptHead.setAttribute('tabindex', '0');
  labCodePanel.dataset.expanded = 'split';
  codeHead.setAttribute('aria-expanded', 'false');
  promptHead.setAttribute('aria-expanded', 'false');
  codeHead.addEventListener('click', () => setExpandedPanel('code'));
  promptHead.addEventListener('click', () => setExpandedPanel('prompt'));
  codeHead.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setExpandedPanel('code'); } });
  promptHead.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setExpandedPanel('prompt'); } });
  requestAnimationFrame(() => fitLabPreviewFrame(previewViewport, previewFrame));
  typeLabCode(codeBlock, mixedPrompt);
  aiPromptBlock.textContent = aiPrompt;
  const updateMixer = () => {
    clearInterval(labTypingTimer);
    const activeItems = flowCards.filter(item => item.classList.contains('is-active')).map(item => step.items[Number(item.dataset.index)]);
    const cumulativeItems = [...priorItems, ...activeItems];
    mixedPrompt = buildMixedPrompt(step, cumulativeItems);
    aiPrompt = buildAiPrompt(step, activeItems, priorItems);
    codeBlock.innerHTML = highlightLabCode(mixedPrompt);
    aiPromptBlock.textContent = aiPrompt;
    flowMeter.style.setProperty('--flow-progress', `${(activeItems.length / flowCards.length) * 100}%`);
    flowStatus.textContent = `${activeItems.length} SIGNAL${activeItems.length === 1 ? '' : 'S'} MIXED`;
    sampleCount.textContent = `${activeItems.length}/${step.items.length}`;
    previewFrame.srcdoc = buildXdgHudPreview(step, cumulativeItems);
    requestAnimationFrame(() => fitLabPreviewFrame(previewViewport, previewFrame));
    flowCards.forEach(card => { card.querySelector('em').textContent = card.classList.contains('is-active') ? 'in sample' : 'inject'; });
  };
  copyButton.addEventListener('click', event => {
    event.stopPropagation();
    const button = event.currentTarget;
    navigator.clipboard?.writeText(mixedPrompt);
    button.textContent = 'COPIED';
    setTimeout(() => { button.textContent = 'COPY CODE'; }, 1200);
  });
  copyPromptButton.addEventListener('click', event => {
    event.stopPropagation();
    const button = event.currentTarget;
    navigator.clipboard?.writeText(aiPrompt);
    button.textContent = 'COPIED';
    setTimeout(() => { button.textContent = 'COPY PROMPT'; }, 1200);
  });
  flowCards.forEach(card => card.addEventListener('click', () => {
    card.classList.toggle('is-active');
    card.setAttribute('aria-pressed', card.classList.contains('is-active'));
    updateMixer();
  }));
  [...labSteps.children].forEach((button, buttonIndex) => button.classList.toggle('is-active', buttonIndex === labStep));
  document.querySelector('#labPrev').disabled = labStep === 0;
  document.querySelector('#labNext').textContent = labStep === labData.length - 1 ? 'OPEN STUDIO →' : 'NEXT STEP →';
}
document.querySelector('#labPrev').addEventListener('click', () => renderLab(labStep - 1)); document.querySelector('#labNext').addEventListener('click', () => labStep === labData.length - 1 ? showView('studio') : renderLab(labStep + 1)); renderLab(0);

const starterCode = xdgMumbaiTemplate;
const boilerplates = {
  minimal: starterCode,
  spatial: `<main class="glance-card" data-focus="0">\n  <span class="eyebrow">SPATIAL INPUT / D-PAD</span>\n  <h1 id="status">Ready.</h1>\n  <p>Swipe left or right. Pinch to select.</p>\n  <button class="focusable" id="select">SELECT</button>\n</main>\n<script>\nlet focus = 0;\ndocument.addEventListener('keydown', (event) => {\n  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {\n    focus = focus === 0 ? 1 : 0;\n    document.querySelector('#status').textContent = focus ? 'Next.' : 'Ready.';\n  }\n  if (event.key === 'Enter') document.querySelector('#status').textContent = 'Selected!';\n});\n</script>`,
  frosted: `<main class="glance-card frosted-card">\n  <span class="eyebrow">FROSTED CARD / GLANCEABLE</span>\n  <h1>Panadería Carmen</h1>\n  <p>7 min · 520 m</p>\n  <button class="focusable">OPEN ROUTE</button>\n</main>`,
  location: `<main class="glance-card location-card">\n  <span class="eyebrow">LOCATION / PAIRED PHONE GPS</span>\n  <h1>YOUR LOCATION</h1>\n  <strong id="coords">19.0760° N 72.8777° E</strong>\n  <p>Tap Select to ping · <b id="pings">0</b></p>\n  <button id="ping" class="focusable">PING LOCATION</button>\n</main>\n<script>\nlet pings = 0;\ndocument.addEventListener('keydown', (event) => {\n  if (event.key === 'Enter') document.querySelector('#pings').textContent = ++pings;\n});\n</script>`,
  react: `<!-- Browser adaptation of MRBD-Apps/mrbd-app-template -->\n<!-- Source uses React + Vite + TypeScript + mrbd-ui-kit. -->\n<main class="glance-card frosted-card">\n  <span class="eyebrow">MRBD APP TEMPLATE</span>\n  <h1>MRBD App</h1>\n  <p>600×600 · additive display · spatial navigation.</p>\n  <button class="focusable" id="counter">ADD ITEM · <b id="count">0</b></button>\n</main>\n<script>\nlet count = 0;\ndocument.addEventListener('keydown', (event) => {\n  if (event.key === 'Enter') document.querySelector('#count').textContent = ++count;\n});\n</script>`
};
const editor = document.querySelector('#codeEditor'); const simScreen = document.querySelector('#simScreen'); editor.value = starterCode;
const editorWrap = document.createElement('div'); const codeHighlight = document.createElement('pre'); editorWrap.className = 'editor-wrap'; codeHighlight.className = 'code-highlight'; editorWrap.style.cssText = 'position:relative;height:433px;overflow:hidden'; codeHighlight.style.cssText = 'position:absolute;inset:0;margin:0;padding:25px;overflow:auto;white-space:pre-wrap;pointer-events:none;font:14px/1.7 var(--mono);color:#d6e4f4'; editor.style.position = 'absolute'; editor.style.inset = '0'; editor.parentNode.insertBefore(editorWrap, editor); editorWrap.append(codeHighlight, editor); editor.classList.add('editor-input'); editor.style.background = 'transparent'; editor.style.color = 'transparent'; editor.style.caretColor = '#fff';
function escapeCode(value) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function highlightCode(value) { return escapeCode(value).replace(/(&lt;!--.*?--&gt;)/gs, '<span style="color:#718096">$1</span>').replace(/(&lt;\/?)([a-z0-9-]+)/gi, '$1<span style="color:#54b5ff">$2</span>').replace(/([a-z-]+)=(&quot;.*?&quot;)/gi, '<span style="color:#e5f46b">$1</span>=<span style="color:#8be9a6">$2</span>'); }
function updateSimulator() { codeHighlight.innerHTML = `${highlightCode(editor.value)}\n`; simScreen.srcdoc = editor.value; }
editor.addEventListener('input', updateSimulator); document.querySelectorAll('.sim-controls button').forEach(button => button.addEventListener('click', () => { simScreen.classList.remove('pulse'); void simScreen.offsetWidth; simScreen.classList.add('pulse'); }));
editor.addEventListener('scroll', () => { codeHighlight.scrollTop = editor.scrollTop; codeHighlight.scrollLeft = editor.scrollLeft; });
document.querySelector('#resetCode').addEventListener('click', () => { editor.value = starterCode; updateSimulator(); });
async function loadTemplate(template) { try { const response = await fetch(`./simulator/templates/${template}`); if (!response.ok) throw new Error('Template unavailable'); editor.value = await response.text(); updateSimulator(); document.querySelectorAll('[data-template]').forEach(item => item.classList.toggle('is-active', item.dataset.template === template)); } catch (error) { console.warn('Template could not load', error); } }
document.querySelectorAll('.template-card').forEach(button => button.addEventListener('click', () => loadTemplate(button.dataset.template)));
document.querySelector('#exportCode').addEventListener('click', () => { const html = /^\s*<!doctype|^\s*<html/i.test(editor.value) ? editor.value : `<!doctype html><html><head><meta name="mrbd-web-app-capable" content="yes"><meta name="viewport" content="width=600,height=600"><style>body{background:#000;color:#fff;font:16px system-ui;padding:24px}.glance-card{padding:24px;border:1px solid #0081fb;border-radius:16px}</style></head><body>${editor.value}</body></html>`; const blob = new Blob([html], { type: 'text/html' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'xdg-mumbai-hud.html'; link.click(); URL.revokeObjectURL(link.href); });
updateSimulator(); const initialView = window.location.hash.slice(1); if (['deck', 'lab', 'studio'].includes(initialView)) showView(initialView);

const simWrap = document.querySelector('#simWrap');
const lensBackground = document.querySelector('#lensBackground');
const webcamVideo = document.querySelector('#webcamVideo');
let webcamStream;
document.querySelectorAll('.display-mode').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.display-mode').forEach(item => item.classList.remove('is-active')); button.classList.add('is-active'); lensBackground.classList.toggle('is-opaque', button.dataset.mode === 'opaque'); }));
document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => { lensBackground.dataset.scene = button.dataset.scene; document.querySelectorAll('[data-scene]').forEach(item => item.classList.toggle('is-active', item === button)); }));
document.querySelector('#brightnessControl').addEventListener('input', event => { document.querySelector('#simScreen').style.filter = `brightness(${event.target.value}%)`; });
document.querySelector('#webcamToggle').addEventListener('click', async event => { if (webcamStream) { webcamStream.getTracks().forEach(track => track.stop()); webcamStream = null; webcamVideo.classList.remove('is-visible'); event.currentTarget.textContent = 'USE WEBCAM'; return; } if (!navigator.mediaDevices?.getUserMedia) { event.currentTarget.textContent = 'CAMERA UNAVAILABLE'; return; } try { webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); webcamVideo.srcObject = webcamStream; webcamVideo.classList.add('is-visible'); lensBackground.dataset.scene = 'webcam'; event.currentTarget.textContent = 'STOP WEBCAM'; } catch (error) { event.currentTarget.textContent = 'CAMERA BLOCKED'; } });
document.querySelectorAll('.sim-controls button').forEach(button => button.addEventListener('click', () => { try { simScreen.contentWindow?.postMessage({ type: 'mrbd-key', key: button.dataset.key }, '*'); simScreen.contentDocument?.dispatchEvent(new KeyboardEvent('keydown', { key: button.dataset.key, bubbles: true })); } catch (error) { console.warn('Lens input unavailable', error); } simScreen.classList.remove('pulse'); void simScreen.offsetWidth; simScreen.classList.add('pulse'); }));
loadTemplate('1_minimal_hello.html');
function fitLensToFrame() { const frame = document.querySelector('.glasses-frame'); if (!frame || !simScreen) return; const available = frame.clientWidth - 30; const scale = Math.min(available, frame.clientHeight - 30) / 600; simScreen.style.transform = `scale(${scale})`; simScreen.style.transformOrigin = 'top left'; simScreen.style.width = '600px'; simScreen.style.height = '600px'; }
new ResizeObserver(fitLensToFrame).observe(document.querySelector('.glasses-frame'));
window.addEventListener('resize', fitLensToFrame);
window.addEventListener('resize', refitActiveLabPreview);
fitLensToFrame();
