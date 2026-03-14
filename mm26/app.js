const flowPills = [...document.querySelectorAll(".flow-pill")];
const sections = [...document.querySelectorAll(".section")];
const conceptTabs = [...document.querySelectorAll(".concept-tab")];
const conceptPanels = [...document.querySelectorAll(".concept-panel")];
const backToTopBtn = document.getElementById("backToTop");
const assistantSelect = document.getElementById("assistantSelect");
const assistantCallout = document.getElementById("assistantCallout");
const assistantStackLabel = document.getElementById("assistantStackLabel");
const canvas = document.getElementById("sparkCanvas");
const context = canvas.getContext("2d");

const sparks = [];
let animationFrame = null;

function boot() {
  initReveal();
  initFlowSpy();
  initConceptTabs();
  initAssistantSelect();
  initBackToTop();
  initSparks();
  wireActions();
}

function wireActions() {
  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.addEventListener("click", (event) => {
    const interactive = event.target.closest(".cta, .ghost, .concept-tab, .flow-pill");
    if (!interactive) {
      return;
    }

    const rect = interactive.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
  });
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      }
    },
    { threshold: 0.18 }
  );

  for (const section of sections) {
    section.classList.add("reveal");
    observer.observe(section);
  }
}

function initFlowSpy() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        const targetId = `#${entry.target.id}`;
        for (const pill of flowPills) {
          pill.classList.toggle("active", pill.getAttribute("href") === targetId);
        }
      }
    },
    {
      rootMargin: "-35% 0px -45% 0px",
      threshold: 0.1
    }
  );

  for (const section of sections) {
    observer.observe(section);
  }
}

function initConceptTabs() {
  for (const tab of conceptTabs) {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;
      for (const node of conceptTabs) {
        node.classList.toggle("active", node === tab);
      }
      for (const panel of conceptPanels) {
        panel.classList.toggle("active", panel.id === target);
      }
    });
  }
}

function initBackToTop() {
  const toggle = () => {
    backToTopBtn?.classList.toggle("visible", window.scrollY > 520);
  };

  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

function initAssistantSelect() {
  if (!assistantSelect || !assistantCallout || !assistantStackLabel) {
    return;
  }

  const syncAssistant = () => {
    if (assistantSelect.value === "claude") {
      assistantCallout.textContent =
        "With Claude Code, you can use the same vibe-coding workflow: keep notebooks, docs, exported models, and implementation notes close to your build loop.";
      assistantStackLabel.textContent = "Claude Code";
      return;
    }

    assistantCallout.textContent =
      "With Codex Environment, you can keep notebooks, docs, exported models, and implementation work in one workspace.";
    assistantStackLabel.textContent = "Codex environment";
  };

  syncAssistant();
  assistantSelect.addEventListener("change", syncAssistant);
}

function initSparks() {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  burst(window.innerWidth * 0.2, 140, 24);
  burst(window.innerWidth * 0.76, 220, 24);
  tick();
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function burst(x, y, count) {
  const colors = ["#67f6ff", "#ff4fd8", "#8a7dff", "#d3ff62", "#ffd36d"];

  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.6 + Math.random() * 2.1;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      life: 36 + Math.random() * 24,
      radius: 1 + Math.random() * 2.6,
      color: colors[index % colors.length]
    });
  }
}

function tick() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let index = sparks.length - 1; index >= 0; index -= 1) {
    const spark = sparks[index];
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.015;
    spark.life -= 1;

    if (spark.life <= 0) {
      sparks.splice(index, 1);
      continue;
    }

    const alpha = Math.max(spark.life / 60, 0);
    context.beginPath();
    context.fillStyle = hexToRgba(spark.color, alpha);
    context.shadowBlur = 14;
    context.shadowColor = spark.color;
    context.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
    context.fill();
  }

  context.shadowBlur = 0;

  if (sparks.length < 14 && Math.random() > 0.92) {
    burst(Math.random() * window.innerWidth, 80 + Math.random() * 260, 4);
  }

  animationFrame = window.requestAnimationFrame(tick);
}

function hexToRgba(hex, alpha) {
  const safe = hex.replace("#", "");
  const value = parseInt(safe, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

window.addEventListener("beforeunload", () => {
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }
});

boot();
