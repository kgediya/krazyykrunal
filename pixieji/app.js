const scrapbookData = window.scrapbookData;

const polaroidGrid = document.getElementById("polaroid-grid");
const timelineRoot = document.getElementById("timeline");
const noteGrid = document.getElementById("note-grid");
const promiseList = document.getElementById("promise-list");
const loveLetterBody = document.getElementById("love-letter-body");
const heroEyebrow = document.getElementById("hero-eyebrow");
const heroTitle = document.getElementById("hero-title");
const heroText = document.getElementById("hero-text");
const heroCta = document.getElementById("hero-cta");
const noteOneLabel = document.getElementById("note-one-label");
const noteOneTitle = document.getElementById("note-one-title");
const noteOneText = document.getElementById("note-one-text");
const noteTwoLabel = document.getElementById("note-two-label");
const noteTwoTitle = document.getElementById("note-two-title");
const noteTwoText = document.getElementById("note-two-text");
const memoryTag = document.getElementById("memory-tag");
const memoryTitle = document.getElementById("memory-title");
const letterTag = document.getElementById("letter-tag");
const letterTitle = document.getElementById("letter-title");
const promiseTag = document.getElementById("promise-tag");
const timelineTag = document.getElementById("timeline-tag");
const timelineTitle = document.getElementById("timeline-title");
const notesTag = document.getElementById("notes-tag");
const notesTitle = document.getElementById("notes-title");

const modal = document.getElementById("memory-modal");
const modalImage = document.getElementById("modal-image");
const modalVideo = document.getElementById("modal-video");
const modalTitle = document.getElementById("modal-title");
const modalCaption = document.getElementById("modal-caption");
const modalTag = document.getElementById("modal-tag");

function isVideo(path) {
  return /\.(mp4|mov|webm)$/i.test(path);
}

function createMediaMarkup(memory) {
  if (isVideo(memory.image)) {
    return `<video src="${memory.image}" muted autoplay loop playsinline preload="metadata" aria-label="${memory.title}"></video>`;
  }

  return `<img src="${memory.image}" alt="${memory.title}" loading="lazy" />`;
}

function createPolaroid(memory, index) {
  const article = document.createElement("article");
  article.className = "polaroid";
  article.style.transform = `rotate(${memory.tilt})`;
  article.innerHTML = `
    <div class="polaroid-photo">
      ${createMediaMarkup(memory)}
    </div>
    <div class="polaroid-caption">
      <h3>${memory.title}</h3>
    </div>
  `;

  article.addEventListener("click", () => openMemory(memory));
  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMemory(memory);
    }
  });

  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute("aria-label", `Open memory ${index + 1}: ${memory.title}`);
  return article;
}

function createTimelineItem(event) {
  const article = document.createElement("article");
  article.className = "timeline-item";
  article.innerHTML = `
    <span class="timeline-pill">${event.label}</span>
    <div class="timeline-copy">
      <strong>${event.title}</strong>
      <p>${event.copy}</p>
    </div>
  `;
  return article;
}

function createNote(note, index) {
  const article = document.createElement("article");
  article.className = "memory-note";
  article.style.transform = `rotate(${index % 2 === 0 ? -2.5 : 2.5}deg)`;
  article.innerHTML = `
    <p class="mini-label">Note ${String(index + 1).padStart(2, "0")}</p>
    <h3>${note}</h3>
  `;
  return article;
}

function openMemory(memory) {
  if (isVideo(memory.image)) {
    modalImage.style.display = "none";
    modalImage.src = "";
    modalImage.alt = "";
    modalVideo.style.display = "block";
    modalVideo.src = memory.image;
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
  } else {
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    modalVideo.style.display = "none";
    modalImage.style.display = "block";
    modalImage.src = memory.image;
    modalImage.alt = memory.title;
  }

  modalTitle.textContent = memory.title;
  modalCaption.textContent = "";
  modalTag.textContent = memory.tag;
  modal.showModal();
}

function shuffleNotes() {
  const shuffled = [...scrapbookData.pocketNotes].sort(() => Math.random() - 0.5);
  noteGrid.innerHTML = "";
  shuffled.forEach((note, index) => noteGrid.appendChild(createNote(note, index)));
}

function applyTextContent() {
  document.title = scrapbookData.pageTitle;
  heroEyebrow.textContent = scrapbookData.hero.eyebrow;
  heroTitle.textContent = scrapbookData.hero.title;
  heroText.textContent = scrapbookData.hero.text;
  heroCta.textContent = scrapbookData.hero.cta;

  noteOneLabel.textContent = scrapbookData.heroNotes[0].label;
  noteOneTitle.textContent = scrapbookData.heroNotes[0].title;
  noteOneText.textContent = scrapbookData.heroNotes[0].text;
  noteTwoLabel.textContent = scrapbookData.heroNotes[1].label;
  noteTwoTitle.textContent = scrapbookData.heroNotes[1].title;
  noteTwoText.textContent = scrapbookData.heroNotes[1].text;

  memoryTag.textContent = scrapbookData.sections.memory.tag;
  memoryTitle.textContent = scrapbookData.sections.memory.title;
  letterTag.textContent = scrapbookData.sections.letter.tag;
  letterTitle.textContent = scrapbookData.sections.letter.title;
  promiseTag.textContent = scrapbookData.sections.promises.tag;
  timelineTag.textContent = scrapbookData.sections.timeline.tag;
  timelineTitle.textContent = scrapbookData.sections.timeline.title;
  notesTag.textContent = scrapbookData.sections.notes.tag;
  notesTitle.textContent = scrapbookData.sections.notes.title;
  loveLetterBody.textContent = scrapbookData.letter;
}

function render() {
  applyTextContent();

  polaroidGrid.innerHTML = "";
  scrapbookData.memories.forEach((memory, index) => polaroidGrid.appendChild(createPolaroid(memory, index)));

  timelineRoot.innerHTML = "";
  scrapbookData.timelineEvents.forEach((event) => timelineRoot.appendChild(createTimelineItem(event)));

  promiseList.innerHTML = "";
  scrapbookData.promises.forEach((promise) => {
    const item = document.createElement("li");
    item.textContent = promise;
    promiseList.appendChild(item);
  });

  shuffleNotes();
}

modal.addEventListener("click", (event) => {
  const surface = modal.querySelector(".modal-surface");
  const rect = surface.getBoundingClientRect();
  const clickedInside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (!clickedInside) {
    modal.close();
  }
});

modal.addEventListener("close", () => {
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
  modalVideo.style.display = "none";
});

render();
