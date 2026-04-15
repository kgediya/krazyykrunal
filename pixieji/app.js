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
const heroSecondaryCta = document.getElementById("hero-secondary-cta");

const signalOneLabel = document.getElementById("signal-one-label");
const signalOneTitle = document.getElementById("signal-one-title");
const signalOneText = document.getElementById("signal-one-text");
const signalTwoLabel = document.getElementById("signal-two-label");
const signalTwoTitle = document.getElementById("signal-two-title");
const signalTwoText = document.getElementById("signal-two-text");
const signalThreeLabel = document.getElementById("signal-three-label");
const signalThreeTitle = document.getElementById("signal-three-title");
const signalThreeText = document.getElementById("signal-three-text");

const arcTag = document.getElementById("arc-tag");
const arcTitle = document.getElementById("arc-title");
const fearTag = document.getElementById("fear-tag");
const fearTitle = document.getElementById("fear-title");
const fearText = document.getElementById("fear-text");
const centerTag = document.getElementById("center-tag");
const centerTitle = document.getElementById("center-title");
const centerText = document.getElementById("center-text");
const loveTag = document.getElementById("love-tag");
const loveTitle = document.getElementById("love-title");
const loveText = document.getElementById("love-text");

const memoryTag = document.getElementById("memory-tag");
const memoryTitle = document.getElementById("memory-title");
const letterTag = document.getElementById("letter-tag");
const letterTitle = document.getElementById("letter-title");
const promiseTag = document.getElementById("promise-tag");
const timelineTag = document.getElementById("timeline-tag");
const timelineTitle = document.getElementById("timeline-title");
const notesTag = document.getElementById("notes-tag");
const notesTitle = document.getElementById("notes-title");
const finalTag = document.getElementById("final-tag");
const finalTitle = document.getElementById("final-title");
const finalText = document.getElementById("final-text");
const reelTag = document.getElementById("reel-tag");
const reelTitle = document.getElementById("reel-title");
const reelText = document.getElementById("reel-text");
const reelLink = document.getElementById("reel-link");
const reelCover = document.getElementById("reel-cover");

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
    const posterAttr = memory.poster ? ` poster="${memory.poster}"` : "";
    return `<video src="${memory.image}" muted autoplay loop playsinline preload="metadata"${posterAttr} aria-label="${memory.title}"></video>`;
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
      <p>${memory.tag}</p>
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

function createPlaceholderPolaroid(card, index) {
  const article = document.createElement("article");
  article.className = "polaroid polaroid-placeholder";
  article.style.transform = `rotate(${index % 2 === 0 ? "1.8deg" : "-1.8deg"})`;
  article.innerHTML = `
    <div class="polaroid-photo polaroid-photo-placeholder">
      <span>${card.tag}</span>
    </div>
    <div class="polaroid-caption">
      <h3>${card.title}</h3>
      <p>${card.tag}</p>
    </div>
  `;
  article.setAttribute("aria-hidden", "true");
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
  article.style.transform = `rotate(${index % 2 === 0 ? -2.2 : 2.2}deg)`;
  article.innerHTML = `
    <p class="mini-label">Keep this close</p>
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
    modalVideo.poster = memory.poster || "";
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
  } else {
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.removeAttribute("poster");
    modalVideo.load();
    modalVideo.style.display = "none";
    modalImage.style.display = "block";
    modalImage.src = memory.image;
    modalImage.alt = memory.title;
  }

  modalTitle.textContent = memory.title;
  modalCaption.textContent = memory.caption;
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
  heroSecondaryCta.textContent = scrapbookData.hero.secondaryCta;

  signalOneLabel.textContent = scrapbookData.heroSignals[0].label;
  signalOneTitle.textContent = scrapbookData.heroSignals[0].title;
  signalOneText.textContent = scrapbookData.heroSignals[0].text;
  signalTwoLabel.textContent = scrapbookData.heroSignals[1].label;
  signalTwoTitle.textContent = scrapbookData.heroSignals[1].title;
  signalTwoText.textContent = scrapbookData.heroSignals[1].text;
  signalThreeLabel.textContent = scrapbookData.heroSignals[2].label;
  signalThreeTitle.textContent = scrapbookData.heroSignals[2].title;
  signalThreeText.textContent = scrapbookData.heroSignals[2].text;

  arcTag.textContent = scrapbookData.sections.arc.tag;
  arcTitle.textContent = scrapbookData.sections.arc.title;
  fearTag.textContent = scrapbookData.sections.fear.tag;
  fearTitle.textContent = scrapbookData.sections.fear.title;
  fearText.textContent = scrapbookData.sections.fear.text;
  centerTag.textContent = scrapbookData.sections.center.tag;
  centerTitle.textContent = scrapbookData.sections.center.title;
  centerText.textContent = scrapbookData.sections.center.text;
  loveTag.textContent = scrapbookData.sections.love.tag;
  loveTitle.textContent = scrapbookData.sections.love.title;
  loveText.textContent = scrapbookData.sections.love.text;

  memoryTag.textContent = scrapbookData.sections.memory.tag;
  memoryTitle.textContent = scrapbookData.sections.memory.title;
  letterTag.textContent = scrapbookData.sections.letter.tag;
  letterTitle.textContent = scrapbookData.sections.letter.title;
  promiseTag.textContent = scrapbookData.sections.promises.tag;
  timelineTag.textContent = scrapbookData.sections.timeline.tag;
  timelineTitle.textContent = scrapbookData.sections.timeline.title;
  notesTag.textContent = scrapbookData.sections.notes.tag;
  notesTitle.textContent = scrapbookData.sections.notes.title;
  finalTag.textContent = scrapbookData.sections.final.tag;
  finalTitle.textContent = scrapbookData.sections.final.title;
  finalText.textContent = scrapbookData.sections.final.text;
  reelTag.textContent = scrapbookData.sections.reel.tag;
  reelTitle.textContent = scrapbookData.sections.reel.title;
  reelText.textContent = scrapbookData.sections.reel.text;

  loveLetterBody.textContent = scrapbookData.letter;
  reelLink.href = scrapbookData.reelLink || reelLink.href;
  reelCover.src = scrapbookData.reelCover || reelCover.src;
  reelCover.alt = `${scrapbookData.sections.reel.title} - open on Instagram`;
}

function render() {
  applyTextContent();

  polaroidGrid.innerHTML = "";
  scrapbookData.memories.forEach((memory, index) => {
    polaroidGrid.appendChild(createPolaroid(memory, index));
  });
  (scrapbookData.placeholderCards || []).forEach((card, index) => {
    polaroidGrid.appendChild(createPlaceholderPolaroid(card, index));
  });

  timelineRoot.innerHTML = "";
  scrapbookData.timelineEvents.forEach((event) => {
    timelineRoot.appendChild(createTimelineItem(event));
  });

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
  modalVideo.removeAttribute("poster");
  modalVideo.load();
  modalVideo.style.display = "none";
});

render();
