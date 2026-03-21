const letterPanel = document.getElementById("letter-panel");
const openLetterButton = document.getElementById("open-letter");
const issuePills = [...document.querySelectorAll(".issue-pill")];
const issueCopy = document.getElementById("issue-copy");
const promiseNotes = [...document.querySelectorAll(".promise-note")];
const meterFill = document.getElementById("meter-fill");
const meterLabel = document.getElementById("meter-label");
const releaseLoveButton = document.getElementById("release-love");
const finalMessage = document.getElementById("final-message");
const floatingHearts = document.getElementById("floating-hearts");

let heartsIntervalId = null;

function ensureLetterOpen() {
  if (!letterPanel.classList.contains("is-open")) {
    letterPanel.classList.add("is-open");
  }
}

openLetterButton.addEventListener("click", () => {
  const isOpen = letterPanel.classList.toggle("is-open");
  openLetterButton.textContent = isOpen ? "Hold My Words Close" : "Open My Heart";

  if (isOpen) {
    letterPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

issuePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    issuePills.forEach((item) => item.classList.remove("active"));
    pill.classList.add("active");
    issueCopy.textContent = pill.dataset.copy || "";
  });
});

promiseNotes.forEach((note, index) => {
  note.addEventListener("click", () => {
    ensureLetterOpen();
    promiseNotes.forEach((item, itemIndex) => {
      item.classList.toggle("active", itemIndex <= index);
    });

    const progress = ((index + 1) / promiseNotes.length) * 100;
    meterFill.style.width = `${progress}%`;
    meterLabel.textContent = `${index + 1} / ${promiseNotes.length} promises opened`;
  });
});

function spawnHeart(burst = false) {
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = burst ? "\u2764" : Math.random() > 0.5 ? "\u2764" : "\u2665";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 140}px`);
  heart.style.animationDuration = `${burst ? 3.2 : 6 + Math.random() * 4}s`;
  heart.style.fontSize = `${burst ? 22 + Math.random() * 20 : 14 + Math.random() * 18}px`;
  floatingHearts.appendChild(heart);

  window.setTimeout(() => {
    heart.remove();
  }, burst ? 3400 : 10000);
}

function startAmbientHearts() {
  if (heartsIntervalId) {
    return;
  }

  heartsIntervalId = window.setInterval(() => {
    spawnHeart(false);
  }, 900);
}

releaseLoveButton.addEventListener("click", () => {
  ensureLetterOpen();
  finalMessage.textContent =
    "I am sorry, Priye. It scares me to think I could hurt you enough to lose you, and that is why I want to be softer, more accountable, and more careful with your heart, because I love you without end.";

  for (let i = 0; i < 18; i += 1) {
    window.setTimeout(() => spawnHeart(true), i * 120);
  }
});

startAmbientHearts();


