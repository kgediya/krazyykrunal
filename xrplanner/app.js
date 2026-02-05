const STORAGE_KEY = "xrPlannerIdeasV2";
const LEGACY_STORAGE_KEY = "xrPlannerIdeasV1";

const templates = [
  {
    name: "AR Product Demo",
    concept: "Scan package to launch an interactive product story with one surprise moment.",
    mode: "AR",
    stage: "Idea",
    impact: 4,
    effort: 2,
    nextAction: "Sketch customer journey in 3 scenes"
  },
  {
    name: "VR Skill Drill",
    concept: "Short training simulation with scoring and replay for measurable progress.",
    mode: "VR",
    stage: "Prototype",
    impact: 5,
    effort: 4,
    nextAction: "Define pass-fail metrics and level flow"
  },
  {
    name: "MR Collab Board",
    concept: "Mixed reality standup board for remote teams with persistent sticky notes.",
    mode: "MR",
    stage: "Testing",
    impact: 4,
    effort: 3,
    nextAction: "Plan persistence model and sync logic"
  }
];

const form = document.getElementById("idea-form");
const board = document.getElementById("board");
const templateWrap = document.getElementById("template-wrap");
const stageFilter = document.getElementById("filter-stage");
const sortBy = document.getElementById("sort-by");
const clearBtn = document.getElementById("clear-all");
const exportBtn = document.getElementById("export-json");
const voiceButtons = document.querySelectorAll(".voice-btn");

let ideas = loadIdeas();
let activeVoiceButton = null;
let activeRecognition = null;

renderTemplates();
renderBoard();
initVoiceInput();
startReminderTicker();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  const entry = {
    id: crypto.randomUUID(),
    name: clean(data.get("name")),
    concept: clean(data.get("concept")),
    mode: clean(data.get("mode")),
    stage: clean(data.get("stage")),
    impact: Number(data.get("impact")),
    effort: Number(data.get("effort")),
    nextAction: clean(data.get("nextAction")),
    deadline: clean(data.get("deadline")),
    reminderAt: clean(data.get("reminderAt")),
    reminderSent: false,
    createdAt: Date.now()
  };

  if (!entry.name || !entry.concept) return;
  if (entry.reminderAt && entry.deadline && entry.reminderAt > `${entry.deadline}T23:59`) {
    alert("Reminder should be before the deadline.");
    return;
  }

  ideas.unshift(entry);
  saveIdeas();
  renderBoard();
  form.reset();
  maybeRequestNotifications();
});

stageFilter.addEventListener("change", renderBoard);
sortBy.addEventListener("change", renderBoard);

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all saved planner items?")) return;
  ideas = [];
  saveIdeas();
  renderBoard();
});

exportBtn.addEventListener("click", async () => {
  const payload = JSON.stringify(ideas, null, 2);

  try {
    await navigator.clipboard.writeText(payload);
    alert("Planner JSON copied to clipboard.");
  } catch {
    alert("Clipboard blocked. Manually copy from browser console: xrPlannerExport()");
    window.xrPlannerExport = () => payload;
  }
});

function initVoiceInput() {
  voiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const target = document.getElementById(targetId);
      if (!target) return;
      startVoiceCapture(button, target);
    });
  });
}

function startVoiceCapture(button, target) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice input is not supported in this browser.");
    return;
  }

  if (activeRecognition) {
    const isSameButton = activeVoiceButton === button;
    activeRecognition.stop();
    clearVoiceState();
    if (isSameButton) return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = navigator.language || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  activeRecognition = recognition;
  activeVoiceButton = button;
  button.classList.add("listening");
  button.textContent = "Stop";

  recognition.onresult = (event) => {
    const transcript = clean(event.results[0][0].transcript);
    if (!transcript) return;
    target.value = target.value ? `${target.value} ${transcript}` : transcript;
    target.dispatchEvent(new Event("input", { bubbles: true }));
  };

  recognition.onerror = () => {
    clearVoiceState();
  };

  recognition.onend = () => {
    clearVoiceState();
  };

  recognition.start();
}

function clearVoiceState() {
  if (activeVoiceButton) {
    activeVoiceButton.classList.remove("listening");
    activeVoiceButton.textContent = "Mic";
  }
  activeVoiceButton = null;
  activeRecognition = null;
}

function startReminderTicker() {
  checkReminders();
  setInterval(checkReminders, 30000);
}

function checkReminders() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  let changed = false;
  const now = Date.now();

  ideas.forEach((idea) => {
    if (!idea.reminderAt || idea.reminderSent) return;
    const remindTime = new Date(idea.reminderAt).getTime();
    if (Number.isNaN(remindTime)) return;
    if (now < remindTime) return;

    new Notification(`XR Planner: ${idea.name}`, {
      body: `Deadline: ${idea.deadline ? formatDate(idea.deadline) : "not set"}. Next: ${idea.nextAction || "No action set"}`
    });

    idea.reminderSent = true;
    changed = true;
  });

  if (changed) {
    saveIdeas();
    renderBoard();
  }
}

function maybeRequestNotifications() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function renderTemplates() {
  templateWrap.innerHTML = "";

  templates.forEach((template) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "template-btn";
    button.innerHTML = `<strong>${escapeHTML(template.name)}</strong><span>${escapeHTML(template.concept)}</span>`;
    button.addEventListener("click", () => {
      setField("name", template.name);
      setField("concept", template.concept);
      setField("mode", template.mode);
      setField("stage", template.stage);
      setField("impact", String(template.impact));
      setField("effort", String(template.effort));
      setField("nextAction", template.nextAction);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    templateWrap.append(button);
  });
}

function renderBoard() {
  let view = ideas.slice();
  const selectedStage = stageFilter.value;

  if (selectedStage !== "All") {
    view = view.filter((item) => item.stage === selectedStage);
  }

  const sortMode = sortBy.value;

  if (sortMode === "impact") {
    view.sort((a, b) => b.impact - a.impact || b.createdAt - a.createdAt);
  } else if (sortMode === "quick-win") {
    view.sort((a, b) => (b.impact - b.effort) - (a.impact - a.effort));
  } else if (sortMode === "deadline") {
    view.sort((a, b) => safeDateValue(a.deadline) - safeDateValue(b.deadline) || b.createdAt - a.createdAt);
  } else {
    view.sort((a, b) => b.createdAt - a.createdAt);
  }

  board.innerHTML = "";

  if (!view.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No planner cards yet. Save your first idea above.";
    board.append(empty);
    return;
  }

  view.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";

    const quickWin = item.impact - item.effort >= 1;
    const urgencyTag = getUrgencyTag(item.deadline);
    const reminderLabel = item.reminderAt ? formatDateTime(item.reminderAt) : "Not set";

    card.innerHTML = `
      <h3>${escapeHTML(item.name)}</h3>
      <p class="meta">${escapeHTML(item.mode)} | ${escapeHTML(item.stage)} | ${formatDateTime(item.createdAt)}</p>
      <p class="pitch">${escapeHTML(item.concept)}</p>
      <div class="meters">
        <span class="tag">Impact ${item.impact}/5</span>
        <span class="tag">Effort ${item.effort}/5</span>
        ${quickWin ? '<span class="tag ok">Potential quick win</span>' : ""}
        ${urgencyTag}
      </div>
      <div class="next-action">Next: ${escapeHTML(item.nextAction || "Define immediate next step")}</div>
      <div class="dates">
        <div>Deadline: ${item.deadline ? formatDate(item.deadline) : "Not set"}</div>
        <div>Reminder: ${escapeHTML(reminderLabel)}${item.reminderSent ? " (done)" : ""}</div>
      </div>
      <div class="card-actions">
        <button type="button" class="link" data-action="promote">Move stage</button>
        <button type="button" class="link" data-action="delete">Delete</button>
      </div>
    `;

    card.querySelector('[data-action="promote"]').addEventListener("click", () => {
      item.stage = nextStage(item.stage);
      saveIdeas();
      renderBoard();
    });

    card.querySelector('[data-action="delete"]').addEventListener("click", () => {
      ideas = ideas.filter((entry) => entry.id !== item.id);
      saveIdeas();
      renderBoard();
    });

    board.append(card);
  });
}

function getUrgencyTag(deadline) {
  if (!deadline) return "";
  const now = new Date();
  const due = new Date(`${deadline}T23:59:59`);
  const days = Math.ceil((due - now) / 86400000);

  if (days < 0) return '<span class="tag alert">Overdue</span>';
  if (days <= 2) return '<span class="tag warn">Due soon</span>';
  return "";
}

function nextStage(current) {
  const steps = ["Idea", "Prototype", "Testing", "Live"];
  const idx = steps.indexOf(current);
  return idx === -1 || idx === steps.length - 1 ? steps[0] : steps[idx + 1];
}

function saveIdeas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

function loadIdeas() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(withDefaults) : [];
  } catch {
    return [];
  }
}

function withDefaults(item) {
  return {
    reminderSent: false,
    deadline: "",
    reminderAt: "",
    ...item
  };
}

function clean(value) {
  return String(value || "").trim();
}

function setField(id, value) {
  const node = document.getElementById(id);
  if (node) node.value = value;
}

function safeDateValue(dateText) {
  if (!dateText) return Number.MAX_SAFE_INTEGER;
  const ts = new Date(`${dateText}T00:00:00`).getTime();
  return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts;
}

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
