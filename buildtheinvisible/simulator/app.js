/**
 * RAY-BAN DISPLAY 600×600 OPTICAL SIMULATOR ENGINE
 */

document.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('hudScreenFrame');
  const frameScale = document.getElementById('hudFrameScale');
  const backdrop = document.getElementById('sceneBackdrop');
  const webcamVideo = document.getElementById('webcamVideo');
  const lensViewport = document.getElementById('lensViewport');
  let blendMode = 'additive';

  // Additive mode emulates the waveguide: black pixels reveal the environment.
  document.querySelectorAll('.blend-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.blend-btn').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      blendMode = button.dataset.blend;
      applyHudMode();
    });
  });

  // Scene Background Presets
  const scenes = {
    black: '#000000',
    tokyo: "url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80') center/cover",
    cafe: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80') center/cover",
    subway: "url('https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80') center/cover",
    lab: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80') center/cover"
  };

  function makeHudCanvasTransparent() {
    try {
      const doc = iframe.contentDocument;
      if (!doc || doc.getElementById('simulator-transparency')) return;
      const style = doc.createElement('style');
      style.id = 'simulator-transparency';
      style.textContent = '#simulator-transparency, html, body { background: transparent !important; }';
      doc.head.appendChild(style);
      applyHudMode();
    } catch (error) {
      console.warn('Could not prepare transparent HUD canvas', error);
    }
  }
  function applyHudMode() {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;
      let style = doc.getElementById('simulator-blend-mode');
      if (!style) { style = doc.createElement('style'); style.id = 'simulator-blend-mode'; doc.head.appendChild(style); }
      style.textContent = blendMode === 'additive'
        ? `html, body { background: transparent !important; }
           body { color: #ffffff !important; filter: brightness(1.35) saturate(1.15); }
           .hud-card, .turn-box, .nav-compass, .hud-reticle, .card { background: rgba(12, 24, 42, .48) !important; }
           .hud-card, .turn-box, .card { box-shadow: 0 0 24px rgba(0, 212, 255, .24) !important; }
           p, .desc { color: #f1f7ff !important; }`
        : 'html, body { background: transparent !important; }';
      iframe.classList.toggle('is-additive', blendMode === 'additive');
      iframe.classList.toggle('is-opaque', blendMode === 'opaque');
    } catch (error) { console.warn('Could not apply HUD blend mode', error); }
  }
  iframe.addEventListener('load', makeHudCanvasTransparent);

  // 1. Template Switcher
  const appButtons = document.querySelectorAll('.app-select-btn');
  appButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      appButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const template = btn.getAttribute('data-template');
      if (template) {
        iframe.src = `./templates/${template}`;
      }
    });
  });

  // 2. Scene Switcher
  const envButtons = document.querySelectorAll('.env-btn:not(#btnWebcam)');
  envButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.env-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Stop webcam stream if running
      if (webcamVideo.srcObject) {
        webcamVideo.srcObject.getTracks().forEach(track => track.stop());
        webcamVideo.srcObject = null;
      }
      webcamVideo.style.display = 'none';

      const sceneKey = btn.getAttribute('data-scene');
      backdrop.style.background = scenes[sceneKey] || '#000000';
      backdrop.dataset.scene = sceneKey;
      lensViewport.dataset.scene = sceneKey;
    });
  });

  // 3. Live Webcam Mode
  const btnWebcam = document.getElementById('btnWebcam');
  if (btnWebcam) {
    btnWebcam.addEventListener('click', () => {
      document.querySelectorAll('.env-btn').forEach(b => b.classList.remove('active'));
      btnWebcam.classList.add('active');

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            webcamVideo.srcObject = stream;
            webcamVideo.style.display = 'block';
            backdrop.style.background = 'none';
            backdrop.dataset.scene = 'webcam';
            lensViewport.dataset.scene = 'webcam';
          })
          .catch(err => {
            console.warn('Webcam permission denied or unavailable:', err);
            alert('Webcam permission was not granted.');
            btnWebcam.classList.remove('active');
          });
      }
    });
  }

  // 4. Global Keyboard Forwarder into Iframe
  window.addEventListener('keydown', (e) => {
    // Only intercept navigation keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
      dispatchLensKey(e.key);
    }
  });

  function fitHudFrame() {
    const lens = document.getElementById('lensViewport');
    if (!lens || !frameScale) return;
    const scale = Math.min(lens.clientWidth, lens.clientHeight) / 600;
    frameScale.style.transform = `scale(${scale})`;
    frameScale.style.width = '600px';
    frameScale.style.height = '600px';
  }
  new ResizeObserver(fitHudFrame).observe(document.getElementById('lensViewport'));
  iframe.addEventListener('load', fitHudFrame);
  iframe.addEventListener('load', applyHudMode);
  window.addEventListener('resize', fitHudFrame);
  fitHudFrame();
  makeHudCanvasTransparent();
});

/**
 * Dispatches simulated hardware events into the optical HUD iframe
 * @param {string} key - e.g. 'ArrowUp', 'ArrowDown', 'Enter'
 */
function dispatchLensKey(key) {
  const iframe = document.getElementById('hudScreenFrame');
  if (!iframe || !iframe.contentWindow) return;

  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const evt = new KeyboardEvent('keydown', {
      key: key,
      code: key,
      keyCode: key === 'Enter' ? 13 : 0,
      bubbles: true,
      cancelable: true
    });

    const activeEl = doc.activeElement || doc.body;
    activeEl.dispatchEvent(evt);
    doc.dispatchEvent(evt);
  } catch (err) {
    console.error('Error forwarding key event to HUD iframe:', err);
  }
}
