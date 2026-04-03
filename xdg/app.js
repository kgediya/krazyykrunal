import { addFirestoreDoc, initializeFirebase } from "./firebase.js";

const STORAGE_KEY = "xdg-association-submissions";

const state = {
  site: null,
  families: [],
  leaders: [],
  events: [],
  queue: [],
  backend: {
    enabled: false,
    db: null,
    collections: null
  }
};

const el = {
  heroKicker: document.getElementById("hero-kicker"),
  heroTitle: document.getElementById("hero-title"),
  heroDescription: document.getElementById("hero-description"),
  heroTags: document.getElementById("hero-tags"),
  statsGrid: document.getElementById("stats-grid"),
  familyGrid: document.getElementById("family-grid"),
  leaderboardGrid: document.getElementById("leaderboard-grid"),
  upcomingEvents: document.getElementById("upcoming-events"),
  pastEvents: document.getElementById("past-events"),
  memberFamily: document.getElementById("member-family"),
  eventSelect: document.getElementById("event-select"),
  eventFamily: document.getElementById("event-family"),
  memberForm: document.getElementById("member-form"),
  eventForm: document.getElementById("event-form"),
  memberFeedback: document.getElementById("member-feedback"),
  eventFeedback: document.getElementById("event-feedback"),
  backendMode: document.getElementById("backend-mode"),
  adminNote: document.getElementById("admin-note"),
  dataSources: document.getElementById("data-sources"),
  queueBlock: document.getElementById("fallback-queue"),
  queueCount: document.getElementById("queue-count"),
  queuePreview: document.getElementById("queue-preview"),
  exportQueue: document.getElementById("export-queue"),
  clearQueue: document.getElementById("clear-queue"),
  footerCopy: document.getElementById("footer-copy")
};

init().catch((error) => {
  console.error(error);
  document.body.innerHTML = `
    <main style="padding: 32px; font-family: Segoe UI, Arial, sans-serif;">
      <h1>Unable to load XDG Association</h1>
      <p>Please make sure the JSON files inside <code>xdg/data</code> are available.</p>
    </main>
  `;
});

async function init() {
  const [site, families, leaders, events, backend] = await Promise.all([
    fetchJson("./data/site.json"),
    fetchJson("./data/families.json"),
    fetchJson("./data/leaders.json"),
    fetchJson("./data/events.json"),
    initializeFirebase()
  ]);

  state.site = site;
  state.families = families;
  state.leaders = leaders;
  state.events = events;
  state.backend = backend;
  state.queue = readQueue();

  renderSite();
  renderStats();
  renderFamilies();
  renderLeaderboards();
  renderEvents();
  renderDataSources();
  hydrateForms();
  wireForms();
  wireQueueActions();
  renderQueue();
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json();
}

function renderSite() {
  const { site, backend } = state;

  document.title = site.associationName;
  el.heroKicker.textContent = site.kicker;
  el.heroTitle.textContent = site.title;
  el.heroDescription.textContent = site.description;
  el.footerCopy.textContent = site.footerCopy;
  el.adminNote.textContent = site.adminNote;

  el.heroTags.innerHTML = site.heroTags
    .map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`)
    .join("");

  if (backend.enabled) {
    el.backendMode.textContent = "Firebase is enabled. New registrations will be written to Cloud Firestore.";
    el.queueBlock.hidden = true;
  } else {
    el.backendMode.textContent = "Firebase is not configured yet. Forms will fall back to a local browser queue until it is enabled.";
    el.queueBlock.hidden = false;
  }
}

function renderStats() {
  el.statsGrid.innerHTML = state.site.stats
    .map(
      (item) => `
        <article class="stats-card">
          <p class="eyebrow">${escapeHtml(item.label)}</p>
          <strong>${escapeHtml(item.value)}</strong>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `
    )
    .join("");
}

function renderFamilies() {
  el.familyGrid.innerHTML = state.families
    .map(
      (family) => `
        <article class="family-card" style="--family-color:${family.color}">
          <div class="family-head">
            <div>
              <h3>${escapeHtml(family.name)}</h3>
              <p class="family-copy">${escapeHtml(family.focus)}</p>
            </div>
            <div class="family-token">${escapeHtml(family.token)}</div>
          </div>
          <div class="family-meta">
            <span class="pill">${escapeHtml(family.scope)}</span>
            <span class="pill">${formatNumber(family.members)} members</span>
            <span class="pill">${escapeHtml(family.cadence)}</span>
          </div>
          <div class="family-meta">
            <span class="pill">Heads: ${escapeHtml(family.heads.join(", "))}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderLeaderboards() {
  const familiesById = Object.fromEntries(state.families.map((family) => [family.id, family]));

  el.leaderboardGrid.innerHTML = state.leaders
    .map((entry) => {
      const family = familiesById[entry.familyId];

      return `
        <article class="leaderboard-card" style="--family-color:${family.color}">
          <div class="leader-head">
            <div>
              <h3>${escapeHtml(entry.city)}</h3>
              <p class="family-copy">Top attendees in this family based on participation points.</p>
            </div>
            <div class="leader-token">${escapeHtml(family.token)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Points</th>
                <th>Attended</th>
              </tr>
            </thead>
            <tbody>
              ${entry.leaders
                .map(
                  (leader) => `
                    <tr>
                      <td>
                        <span class="leader-name">${escapeHtml(leader.name)}</span>
                        <span class="leader-role">${escapeHtml(leader.role)} • ${escapeHtml(leader.streak)}</span>
                      </td>
                      <td>${formatNumber(leader.points)}</td>
                      <td>${formatNumber(leader.attended)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </article>
      `;
    })
    .join("");
}

function renderEvents() {
  const familiesById = Object.fromEntries(state.families.map((family) => [family.id, family]));
  const upcoming = state.events
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = state.events
    .filter((event) => event.status === "past")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  el.upcomingEvents.innerHTML = upcoming
    .map((event) => {
      const family = familiesById[event.familyId];

      return `
        <article class="event-card" style="--family-color:${family.color}">
          <div class="event-head">
            <div>
              <h3>${escapeHtml(event.title)}</h3>
              <p class="event-copy">${escapeHtml(event.description)}</p>
            </div>
            <span class="event-status">${escapeHtml(event.city)}</span>
          </div>
          <div class="event-meta">
            <span class="pill">${formatDate(event.date)}</span>
            <span class="pill">${escapeHtml(event.venue)}</span>
            <span class="pill">${escapeHtml(event.format)}</span>
            <span class="pill">${escapeHtml(event.theme)}</span>
            <span class="pill">${event.seatsLeft} / ${event.capacity} seats left</span>
          </div>
          <button class="event-action" type="button" data-register-event="${escapeHtml(event.id)}">Register</button>
        </article>
      `;
    })
    .join("");

  el.pastEvents.innerHTML = past
    .map((event) => {
      const family = familiesById[event.familyId];
      const summary = event.summary || {};

      return `
        <article class="summary-card" style="--family-color:${family.color}">
          <div class="summary-head">
            <div>
              <h3>${escapeHtml(event.title)}</h3>
              <p class="summary-copy">${escapeHtml(summary.highlight || event.description)}</p>
            </div>
            <span class="summary-status">${escapeHtml(event.city)}</span>
          </div>
          <div class="summary-metrics">
            <span class="pill">${formatDate(event.date)}</span>
            <span class="pill">${summary.attendees || 0} attendees</span>
            <span class="pill">${summary.speakers || 0} speakers</span>
            <span class="pill">${summary.projects || 0} projects</span>
          </div>
          ${renderGallery(event.gallery)}
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-register-event]").forEach((button) => {
    button.addEventListener("click", () => {
      const eventId = button.getAttribute("data-register-event");
      const event = state.events.find((item) => item.id === eventId);

      if (!event) {
        return;
      }

      el.eventSelect.value = event.id;
      el.eventFamily.value = familyLabel(event.familyId);
      document.getElementById("register").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderGallery(gallery) {
  if (!gallery) {
    return "";
  }

  if (gallery.mode === "images" && Array.isArray(gallery.items) && gallery.items.length) {
    return `
      <div class="summary-gallery">
        ${gallery.items
          .slice(0, 3)
          .map((item, index) => `<img src="${escapeHtml(item)}" alt="Event recap image ${index + 1}" loading="lazy" />`)
          .join("")}
      </div>
    `;
  }

  if (gallery.mode === "google-photos-link" && gallery.url) {
    return `<a class="gallery-link" href="${escapeHtml(gallery.url)}" target="_blank" rel="noreferrer">${escapeHtml(
      gallery.label || "Open recap gallery"
    )}</a>`;
  }

  return "";
}

function renderDataSources() {
  el.dataSources.innerHTML = state.site.dataSources
    .map(
      (source) => `
        <article class="source-card">
          <div class="source-head">
            <div>
              <h3>${escapeHtml(source.title)}</h3>
            </div>
            <div class="source-token">JSON</div>
          </div>
          <div class="source-meta">
            <span class="pill">${escapeHtml(source.path)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function hydrateForms() {
  const familyOptions = state.families
    .map((family) => `<option value="${escapeHtml(familyLabel(family.id))}">${escapeHtml(familyLabel(family.id))}</option>`)
    .join("");

  el.memberFamily.innerHTML = `<option value="">Select a family</option>${familyOptions}`;
  el.eventFamily.innerHTML = `<option value="">Select a family</option>${familyOptions}`;

  const eventOptions = state.events
    .filter((event) => event.status === "upcoming" && event.registrationOpen)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(
      (event) => `
        <option value="${escapeHtml(event.id)}">
          ${escapeHtml(event.title)} • ${escapeHtml(event.city)} • ${formatDate(event.date)}
        </option>
      `
    )
    .join("");

  el.eventSelect.innerHTML = `<option value="">Select an event</option>${eventOptions}`;
}

function wireForms() {
  el.memberForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(el.memberForm);
    const payload = {
      type: "association-membership",
      name: formData.get("name"),
      email: formData.get("email"),
      family: formData.get("family"),
      role: formData.get("role"),
      submittedAt: new Date().toISOString()
    };

    await submitPayload(payload, "member");
    el.memberForm.reset();
  });

  el.eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(el.eventForm);
    const selectedEvent = state.events.find((item) => item.id === formData.get("eventId"));
    const payload = {
      type: "event-registration",
      name: formData.get("name"),
      email: formData.get("email"),
      family: formData.get("family"),
      eventId: formData.get("eventId"),
      eventTitle: selectedEvent ? selectedEvent.title : "",
      notes: formData.get("notes"),
      submittedAt: new Date().toISOString()
    };

    await submitPayload(payload, "event");
    el.eventForm.reset();
  });
}

async function submitPayload(payload, kind) {
  const feedbackEl = kind === "member" ? el.memberFeedback : el.eventFeedback;
  feedbackEl.textContent = "Submitting...";

  try {
    if (state.backend.enabled) {
      const collectionName =
        kind === "member"
          ? state.backend.collections.memberRegistrations
          : state.backend.collections.eventRegistrations;

      await addFirestoreDoc(state.backend.db, collectionName, payload);
      feedbackEl.textContent = "Submitted to Firebase successfully.";
      return;
    }

    state.queue = [payload, ...state.queue];
    persistQueue();
    renderQueue();
    feedbackEl.textContent = "Saved to local queue. Enable Firebase to send it live.";
  } catch (error) {
    console.error(error);
    feedbackEl.textContent = "Submission failed. Please check your Firebase setup.";
  }
}

function wireQueueActions() {
  el.exportQueue.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.queue, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "xdg-fallback-queue.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  el.clearQueue.addEventListener("click", () => {
    state.queue = [];
    persistQueue();
    renderQueue();
    el.memberFeedback.textContent = "";
    el.eventFeedback.textContent = "";
  });
}

function renderQueue() {
  el.queueCount.textContent = String(state.queue.length);
  el.queuePreview.textContent = JSON.stringify(state.queue, null, 2);
}

function persistQueue() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.queue));
}

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function familyLabel(familyId) {
  const family = state.families.find((item) => item.id === familyId);
  return family ? family.name : "";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
