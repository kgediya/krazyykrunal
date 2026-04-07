const IMPORT_ENDPOINT = "https://krazyykrunal--692ed18e32ba11f1aba742dde27851f2.web.val.run";
const STORAGE_KEY = "xframe-state-v1";

const PRESETS = {
  solar: { accent: "#ff7b54", tint: "#fff3eb" },
  midnight: { accent: "#79a8ff", tint: "#dfe8ff" },
  mint: { accent: "#21b18a", tint: "#ecfff8" },
  berry: { accent: "#d65ca7", tint: "#fff0fa" },
  sand: { accent: "#b48547", tint: "#f8f0df" },
  signal: { accent: "#ff5f45", tint: "#fff4e8" }
};

const DEMO_DATA = {
  sourceUrl: "https://x.com/buildwithkrunal/status/1909654321234567890",
  authorName: "Krunal Gediya",
  authorHandle: "@buildwithkrunal",
  avatarDataUrl: "",
  headline: "From X post to polished frame",
  tweetText: "Tiny tools become products when the output feels good enough to post immediately. That last 10% of polish is usually the actual differentiator.",
  replyCount: 84,
  repostCount: 196,
  likeCount: 2800,
  timestamp: "8:12 PM - Apr 8, 2026",
  sourceBadge: "x.com / design-build",
  aspect: "story",
  layout: "stacked",
  preset: "solar",
  accent: PRESETS.solar.accent,
  tint: PRESETS.solar.tint,
  darkTheme: true,
  showCoverImage: false,
  showMetrics: false,
  showSource: true,
  showQuoteMarks: true,
  showAvatar: true,
  showWatermark: false,
  watermarkText: "Made with love by krazyykrunal",
  textScale: 100,
  cardRadius: 30,
  uploadedImage: ""
};

const PERSISTED_KEYS = [
  "sourceUrl",
  "authorName",
  "authorHandle",
  "avatarDataUrl",
  "headline",
  "tweetText",
  "replyCount",
  "repostCount",
  "likeCount",
  "timestamp",
  "sourceBadge",
  "aspect",
  "layout",
  "preset",
  "accent",
  "tint",
  "darkTheme",
  "showCoverImage",
  "showMetrics",
  "showSource",
  "showQuoteMarks",
  "showAvatar",
  "showWatermark",
  "watermarkText",
  "textScale",
  "cardRadius",
  "uploadedImage"
];

const state = {
  ...DEMO_DATA
};

const DOM = {
  sourceUrl: document.getElementById("sourceUrl"),
  authorName: document.getElementById("authorName"),
  authorHandle: document.getElementById("authorHandle"),
  headline: document.getElementById("headline"),
  tweetText: document.getElementById("tweetText"),
  replyCount: document.getElementById("replyCount"),
  repostCount: document.getElementById("repostCount"),
  likeCount: document.getElementById("likeCount"),
  timestamp: document.getElementById("timestamp"),
  sourceBadge: document.getElementById("sourceBadge"),
  accentColor: document.getElementById("accentColor"),
  canvasTint: document.getElementById("canvasTint"),
  mediaUpload: document.getElementById("mediaUpload"),
  avatarUpload: document.getElementById("avatarUpload"),
  darkTheme: document.getElementById("darkTheme"),
  showCoverImage: document.getElementById("showCoverImage"),
  showMetrics: document.getElementById("showMetrics"),
  showSource: document.getElementById("showSource"),
  showQuoteMarks: document.getElementById("showQuoteMarks"),
  showAvatar: document.getElementById("showAvatar"),
  showWatermark: document.getElementById("showWatermark"),
  watermarkField: document.getElementById("watermarkField"),
  watermarkText: document.getElementById("watermarkText"),
  textScale: document.getElementById("textScale"),
  cardRadius: document.getElementById("cardRadius"),
  parseUrlBtn: document.getElementById("parseUrlBtn"),
  parseStatus: document.getElementById("parseStatus"),
  randomizeBtn: document.getElementById("randomizeBtn"),
  demoFillBtn: document.getElementById("demoFillBtn"),
  copySpecBtn: document.getElementById("copySpecBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  openImageBtn: document.getElementById("openImageBtn"),
  exportRoot: document.getElementById("exportRoot"),
  canvasGrid: document.getElementById("canvasGrid"),
  textCard: document.getElementById("textCard"),
  mediaCard: document.getElementById("mediaCard"),
  mediaShell: document.getElementById("mediaShell"),
  mediaPlaceholder: document.getElementById("mediaPlaceholder"),
  quoteMark: document.getElementById("quoteMark"),
  avatarBadge: document.getElementById("avatarBadge"),
  avatarImage: document.getElementById("avatarImage"),
  previewHeadline: document.getElementById("previewHeadline"),
  previewAuthorName: document.getElementById("previewAuthorName"),
  previewAuthorHandle: document.getElementById("previewAuthorHandle"),
  previewTweetText: document.getElementById("previewTweetText"),
  previewTimestamp: document.getElementById("previewTimestamp"),
  previewSourceBadge: document.getElementById("previewSourceBadge"),
  previewMetrics: document.getElementById("previewMetrics"),
  previewReplies: document.getElementById("previewReplies"),
  previewReposts: document.getElementById("previewReposts"),
  previewLikes: document.getElementById("previewLikes"),
  previewWatermark: document.getElementById("previewWatermark"),
  footerNote: document.getElementById("footerNote"),
  modeLabel: document.getElementById("modeLabel"),
  aspectButtons: Array.from(document.querySelectorAll("[data-aspect]")),
  layoutButtons: Array.from(document.querySelectorAll("[data-layout]")),
  presetButtons: Array.from(document.querySelectorAll("[data-preset]"))
};

function setStatus(message, tone = "") {
  DOM.parseStatus.textContent = message;
  DOM.parseStatus.dataset.tone = tone;
}

function persistState() {
  try {
    const payload = {};
    PERSISTED_KEYS.forEach((key) => {
      payload[key] = state[key];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Could not persist state", error);
  }
}

function hydratePersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    Object.keys(parsed).forEach((key) => {
      if (PERSISTED_KEYS.includes(key)) {
        state[key] = parsed[key];
      }
    });
    return true;
  } catch (error) {
    console.warn("Could not restore persisted state", error);
    return false;
  }
}

function formatCompactNumber(value) {
  const number = Number(value) || 0;
  if (number >= 1000000) return `${(number / 1000000).toFixed(1).replace(".0", "")}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1).replace(".0", "")}K`;
  return `${number}`;
}

function normalizeHandle(handle) {
  const raw = (handle || "").trim().replace(/^@+/, "");
  return raw ? `@${raw}` : "";
}

function titleCaseHandle(handle) {
  return (handle || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseTweetUrl(raw) {
  const candidate = (raw || "").trim();
  if (!candidate) {
    return { ok: false, reason: "Paste an X/Twitter URL first." };
  }

  try {
    const url = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
    const host = url.hostname.replace(/^www\./, "");
    if (!["x.com", "twitter.com"].includes(host)) {
      return { ok: false, reason: "Use an x.com or twitter.com link." };
    }

    const match = url.pathname.match(/^\/([^/]+)\/status\/(\d+)/i);
    if (!match) {
      return { ok: false, reason: "Could not find a valid status URL." };
    }

    const [, username, statusId] = match;
    return {
      ok: true,
      username,
      statusId,
      normalizedUrl: `https://x.com/${username}/status/${statusId}`
    };
  } catch {
    return { ok: false, reason: "That URL does not look valid." };
  }
}

async function importFromValTown(url) {
  const endpoint = `${IMPORT_ENDPOINT}?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" }
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Val Town returned non-JSON: ${text.slice(0, 180)}`);
  }

  if (!response.ok) {
    throw new Error(data?.error || `Import endpoint failed with status ${response.status}`);
  }

  if (!data?.ok) {
    throw new Error(data?.error || "Import endpoint returned ok=false");
  }

  return data;
}

async function importViaOEmbed(url) {
  const endpoint = `https://publish.twitter.com/oembed?omit_script=1&dnt=true&url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`oEmbed failed with status ${response.status}`);
  }

  const data = await response.json();
  const parser = new DOMParser();
  const doc = parser.parseFromString(data.html || "", "text/html");
  const tweetParagraph = doc.querySelector("blockquote.twitter-tweet p") || doc.querySelector("p");
  const rawText = tweetParagraph ? tweetParagraph.textContent || "" : "";
  const links = Array.from(doc.querySelectorAll("a"));
  const timeLink = links.find((link) => /\/status\/\d+/.test(link.getAttribute("href") || ""));

  return {
    authorName: data.author_name || "",
    authorHandle: data.author_url
      ? normalizeHandle(new URL(data.author_url).pathname.split("/").filter(Boolean)[0] || "")
      : "",
    tweetText: rawText.replace(/https:\/\/t\.co\/\S+/g, "").replace(/\s+/g, " ").trim(),
    timestamp: timeLink?.textContent?.trim() || ""
  };
}

function syncInputsFromState() {
  DOM.sourceUrl.value = state.sourceUrl;
  DOM.authorName.value = state.authorName;
  DOM.authorHandle.value = state.authorHandle;
  DOM.headline.value = state.headline;
  DOM.tweetText.value = state.tweetText;
  DOM.replyCount.value = state.replyCount;
  DOM.repostCount.value = state.repostCount;
  DOM.likeCount.value = state.likeCount;
  DOM.timestamp.value = state.timestamp;
  DOM.sourceBadge.value = state.sourceBadge;
  DOM.accentColor.value = state.accent;
  DOM.canvasTint.value = state.tint;
  DOM.darkTheme.checked = state.darkTheme;
  DOM.showCoverImage.checked = state.showCoverImage;
  DOM.showMetrics.checked = state.showMetrics;
  DOM.showSource.checked = state.showSource;
  DOM.showQuoteMarks.checked = state.showQuoteMarks;
  DOM.showAvatar.checked = state.showAvatar;
  DOM.showWatermark.checked = state.showWatermark;
  DOM.watermarkText.value = state.watermarkText;
  DOM.textScale.value = state.textScale;
  DOM.cardRadius.value = state.cardRadius;
}

function syncActiveButtons() {
  DOM.aspectButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.aspect === state.aspect);
  });
  DOM.layoutButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.layout === state.layout);
  });
  DOM.presetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.preset === state.preset);
  });
}

function hexToRgbTriplet(hex) {
  const normalized = (hex || "").replace("#", "").trim();
  if (normalized.length !== 6) return null;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}

function updateCssVariables() {
  document.documentElement.style.setProperty("--accent", state.accent);
  document.documentElement.style.setProperty("--canvas-tint", state.tint);
  document.documentElement.style.setProperty("--text-scale", `${state.textScale / 100}`);
  document.documentElement.style.setProperty("--card-radius", `${state.cardRadius}px`);

  const accentRgb = hexToRgbTriplet(state.accent);
  const tintRgb = hexToRgbTriplet(state.tint);
  if (accentRgb) document.documentElement.style.setProperty("--accent-rgb", accentRgb);
  if (tintRgb) document.documentElement.style.setProperty("--tint-rgb", tintRgb);
}

function renderPreview() {
  updateCssVariables();
  syncActiveButtons();

  DOM.previewHeadline.textContent = state.headline || "Untitled post";
  DOM.previewAuthorName.textContent = state.authorName || "Unknown author";
  DOM.previewAuthorHandle.textContent = normalizeHandle(state.authorHandle) || "@unknown";
  DOM.previewTweetText.textContent = state.tweetText || "Add tweet text to start designing your Instagram frame.";
  DOM.previewTimestamp.textContent = state.timestamp || "No timestamp";
  DOM.previewSourceBadge.textContent = state.sourceBadge || "x.com";
  DOM.previewReplies.textContent = formatCompactNumber(state.replyCount);
  DOM.previewReposts.textContent = formatCompactNumber(state.repostCount);
  DOM.previewLikes.textContent = formatCompactNumber(state.likeCount);
  DOM.previewWatermark.textContent = state.watermarkText || DEMO_DATA.watermarkText;

  DOM.exportRoot.classList.toggle("dark-theme", state.darkTheme);
  DOM.avatarBadge.classList.toggle("hidden", !state.showAvatar);
  DOM.avatarBadge.classList.toggle("has-image", Boolean(state.avatarDataUrl));
  DOM.avatarImage.src = state.avatarDataUrl || "";
  DOM.avatarImage.alt = `${state.authorName || "Author"} avatar`;
  DOM.exportRoot.classList.toggle("aspect-post", state.aspect === "post");
  DOM.exportRoot.classList.toggle("aspect-story", state.aspect === "story");
  DOM.canvasGrid.classList.toggle("no-cover", !state.showCoverImage);
  DOM.canvasGrid.classList.toggle("has-cover", state.showCoverImage);
  DOM.mediaCard.classList.toggle("hidden", !state.showCoverImage);
  DOM.watermarkField.classList.toggle("hidden", !state.showWatermark);
  DOM.previewWatermark.classList.toggle("hidden", !state.showWatermark);

  DOM.textCard.classList.remove("layout-editorial", "layout-spotlight", "layout-minimal", "layout-stacked");
  DOM.textCard.classList.add(`layout-${state.layout}`);
  DOM.previewMetrics.classList.toggle("hidden", !state.showMetrics);
  DOM.previewSourceBadge.classList.toggle("hidden", !state.showSource);
  DOM.quoteMark.classList.toggle("hidden", !state.showQuoteMarks);

  const resolutionLabel = `${state.darkTheme ? "dark" : "light"} � ${state.aspect === "story" ? "1080 x 1920 story" : "1080 x 1350 post"}`;
  DOM.modeLabel.textContent = resolutionLabel;
  DOM.footerNote.textContent = state.sourceUrl
    ? `Crafted in XFrame from ${parseTweetUrl(state.sourceUrl).ok ? "a pasted X link" : "custom source text"}.`
    : "Crafted in XFrame for shareable X-to-Instagram compositions.";

  if (state.uploadedImage && state.showCoverImage) {
    DOM.mediaShell.classList.add("has-image");
    DOM.mediaShell.style.backgroundImage = `linear-gradient(180deg, rgba(18, 12, 10, 0.10), rgba(18, 12, 10, 0.40)), url(${state.uploadedImage})`;
    DOM.mediaPlaceholder.classList.add("hidden");
  } else {
    DOM.mediaShell.classList.remove("has-image");
    DOM.mediaShell.style.backgroundImage = "";
    DOM.mediaPlaceholder.classList.remove("hidden");
  }
}

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  state.preset = name;
  state.accent = preset.accent;
  state.tint = preset.tint;
  persistState();
  syncInputsFromState();
  renderPreview();
}

async function hydrateFromUrl() {
  const parsed = parseTweetUrl(DOM.sourceUrl.value);
  if (!parsed.ok) {
    setStatus(parsed.reason, "error");
    return;
  }

  const originalLabel = DOM.parseUrlBtn.textContent;
  DOM.parseUrlBtn.disabled = true;
  DOM.parseUrlBtn.textContent = "Importing...";

  state.sourceUrl = parsed.normalizedUrl;
  state.authorHandle = `@${parsed.username}`;
  state.authorName = titleCaseHandle(parsed.username);
  state.sourceBadge = `x.com / ${parsed.username}`;
  state.avatarDataUrl = "";
  if (!state.headline || state.headline === DEMO_DATA.headline) {
    state.headline = `${state.authorName} on X`;
  }
  persistState();
  syncInputsFromState();
  renderPreview();
  setStatus(`Parsed @${parsed.username}. Trying Val Town import...`, "");

  try {
    const data = await importFromValTown(parsed.normalizedUrl);
    state.sourceUrl = data.sourceUrl || parsed.normalizedUrl;
    state.authorName = data.authorName || state.authorName;
    state.authorHandle = data.authorHandle || state.authorHandle;
    state.tweetText = data.tweetText || state.tweetText;
    state.timestamp = data.timestamp || state.timestamp;
    state.sourceBadge = data.sourceBadge || state.sourceBadge;
    state.avatarDataUrl = data.avatarDataUrl || "";
    state.headline = `${state.authorName} on X`;
    persistState();
    syncInputsFromState();
    renderPreview();
    setStatus(`Val Town import succeeded.${state.avatarDataUrl ? ' Avatar loaded too.' : ' Avatar was empty in the response.'}`, "success");
  } catch (error) {
    console.error(error);
    setStatus(`Val Town failed: ${error instanceof Error ? error.message : 'Unknown error'}. Falling back to public text import...`, "error");

    try {
      const fallback = await importViaOEmbed(parsed.normalizedUrl);
      state.authorName = fallback.authorName || state.authorName;
      state.authorHandle = fallback.authorHandle || state.authorHandle;
      state.tweetText = fallback.tweetText || state.tweetText;
      state.timestamp = fallback.timestamp || state.timestamp;
      state.headline = `${state.authorName} on X`;
      persistState();
      syncInputsFromState();
      renderPreview();
      setStatus("Text import succeeded via public oEmbed. Avatar still needs Val Town or manual upload.", "success");
    } catch (fallbackError) {
      console.error(fallbackError);
      persistState();
      syncInputsFromState();
      renderPreview();
      setStatus("Both Val Town and public fallback failed. You can still edit manually and upload an avatar.", "error");
    }
  } finally {
    DOM.parseUrlBtn.disabled = false;
    DOM.parseUrlBtn.textContent = originalLabel;
  }
}

function randomizeLook() {
  const presetNames = Object.keys(PRESETS);
  const layouts = ["spotlight", "editorial", "minimal", "stacked"];
  const aspects = ["post", "story"];
  state.preset = presetNames[Math.floor(Math.random() * presetNames.length)];
  state.layout = layouts[Math.floor(Math.random() * layouts.length)];
  state.aspect = aspects[Math.floor(Math.random() * aspects.length)];
  state.textScale = 92 + Math.floor(Math.random() * 27);
  state.cardRadius = 22 + Math.floor(Math.random() * 17);
  state.showCoverImage = Math.random() > 0.28;
  state.darkTheme = Math.random() > 0.5;
  const preset = PRESETS[state.preset];
  state.accent = preset.accent;
  state.tint = preset.tint;
  persistState();
  syncInputsFromState();
  renderPreview();
  setStatus("Style randomized. Keep tweaking from here.", "success");
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleMediaUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    state.uploadedImage = await readImageFile(file);
    state.showCoverImage = true;
    persistState();
    syncInputsFromState();
    renderPreview();
    setStatus(`Loaded "${file.name}" into the cover panel.`, "success");
  } catch {
    setStatus("Could not read that image file.", "error");
  }
}

async function handleAvatarUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    state.avatarDataUrl = await readImageFile(file);
    state.showAvatar = true;
    persistState();
    syncInputsFromState();
    renderPreview();
    setStatus(`Loaded "${file.name}" as the avatar.`, "success");
  } catch {
    setStatus("Could not read that avatar file.", "error");
  }
}

function updateStateFromFields() {
  state.sourceUrl = DOM.sourceUrl.value.trim();
  state.authorName = DOM.authorName.value.trim();
  state.authorHandle = DOM.authorHandle.value.trim();
  state.headline = DOM.headline.value.trim();
  state.tweetText = DOM.tweetText.value.trim();
  state.replyCount = DOM.replyCount.value;
  state.repostCount = DOM.repostCount.value;
  state.likeCount = DOM.likeCount.value;
  state.timestamp = DOM.timestamp.value.trim();
  state.sourceBadge = DOM.sourceBadge.value.trim();
  state.accent = DOM.accentColor.value;
  state.tint = DOM.canvasTint.value;
  state.darkTheme = DOM.darkTheme.checked;
  state.showCoverImage = DOM.showCoverImage.checked;
  state.showMetrics = DOM.showMetrics.checked;
  state.showSource = DOM.showSource.checked;
  state.showQuoteMarks = DOM.showQuoteMarks.checked;
  state.showAvatar = DOM.showAvatar.checked;
  state.showWatermark = DOM.showWatermark.checked;
  state.watermarkText = DOM.watermarkText.value.trim() || DEMO_DATA.watermarkText;
  state.textScale = Number(DOM.textScale.value);
  state.cardRadius = Number(DOM.cardRadius.value);
  persistState();
  renderPreview();
}

function attachFieldSync() {
  [
    DOM.sourceUrl,
    DOM.authorName,
    DOM.authorHandle,
    DOM.headline,
    DOM.tweetText,
    DOM.replyCount,
    DOM.repostCount,
    DOM.likeCount,
    DOM.timestamp,
    DOM.sourceBadge,
    DOM.accentColor,
    DOM.canvasTint,
    DOM.darkTheme,
    DOM.showCoverImage,
    DOM.showMetrics,
    DOM.showSource,
    DOM.showQuoteMarks,
    DOM.showAvatar,
    DOM.showWatermark,
    DOM.watermarkText,
    DOM.textScale,
    DOM.cardRadius
  ].forEach((element) => {
    element.addEventListener("input", updateStateFromFields);
    element.addEventListener("change", updateStateFromFields);
  });
}

async function exportPng(openInNewTab = false) {
  const originalStatus = DOM.parseStatus.textContent;
  const filename = `xframe-${state.aspect}-${state.darkTheme ? "dark" : "light"}.png`;
  const popup = openInNewTab ? window.open("", "_blank") : null;

  if (openInNewTab && !popup) {
    setStatus("The preview popup was blocked by the browser. Allow popups and try again.", "error");
    return;
  }

  if (popup) {
    popup.document.write('<title>XFrame Export</title><p style="font-family:Arial,sans-serif;padding:24px;background:#111;color:#fff;">Rendering export preview...</p>');
    popup.document.close();
  }

  try {
    DOM.downloadBtn.disabled = true;
    DOM.openImageBtn.disabled = true;
    setStatus("Rendering export...", "");

    if (typeof html2canvas !== "function") {
      throw new Error("html2canvas is not available");
    }

    await document.fonts.ready;
    const canvas = await html2canvas(DOM.exportRoot, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: false,
      imageTimeout: 15000,
      logging: false
    });

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error("Canvas blob generation failed"));
      }, "image/png");
    });

    const objectUrl = URL.createObjectURL(blob);

    if (popup) {
      popup.location.href = objectUrl;
      setStatus("Opened export preview.", "success");
      return;
    }

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    setStatus("PNG downloaded successfully.", "success");
  } catch (error) {
    console.error(error);
    if (popup && !popup.closed) {
      popup.close();
    }
    setStatus("Export failed. Refresh once and try again. If it still fails, disable browser extensions on this page.", "error");
  } finally {
    DOM.downloadBtn.disabled = false;
    DOM.openImageBtn.disabled = false;
    if (!DOM.parseStatus.dataset.tone) {
      setStatus(originalStatus, "");
    }
  }
}

async function copySpec() {
  const spec = {
    sourceUrl: state.sourceUrl,
    authorName: state.authorName,
    authorHandle: normalizeHandle(state.authorHandle),
    avatarImported: Boolean(state.avatarDataUrl),
    tweetText: state.tweetText,
    headline: state.headline,
    darkTheme: state.darkTheme,
    coverEnabled: state.showCoverImage,
    watermark: {
      enabled: state.showWatermark,
      text: state.watermarkText
    },
    metrics: {
      replies: Number(state.replyCount) || 0,
      reposts: Number(state.repostCount) || 0,
      likes: Number(state.likeCount) || 0
    },
    style: {
      aspect: state.aspect,
      layout: state.layout,
      preset: state.preset,
      accent: state.accent,
      tint: state.tint,
      textScale: state.textScale,
      cardRadius: state.cardRadius
    }
  };

  try {
    await navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setStatus("Current composition spec copied to clipboard.", "success");
  } catch {
    setStatus("Clipboard copy failed in this browser.", "error");
  }
}

function loadDemo() {
  Object.assign(state, DEMO_DATA, PRESETS[DEMO_DATA.preset]);
  persistState();
  syncInputsFromState();
  renderPreview();
  setStatus("Sample composition loaded.", "success");
}

function attachModeButtons() {
  DOM.aspectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.aspect = button.dataset.aspect;
      persistState();
      renderPreview();
    });
  });

  DOM.layoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.layout = button.dataset.layout;
      persistState();
      renderPreview();
    });
  });

  DOM.presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyPreset(button.dataset.preset);
    });
  });
}

function init() {
  if (!hydratePersistedState()) {
    Object.assign(state, PRESETS[state.preset]);
  }
  syncInputsFromState();
  attachFieldSync();
  attachModeButtons();

  DOM.parseUrlBtn.addEventListener("click", hydrateFromUrl);
  DOM.randomizeBtn.addEventListener("click", randomizeLook);
  DOM.demoFillBtn.addEventListener("click", loadDemo);
  DOM.copySpecBtn.addEventListener("click", copySpec);
  DOM.downloadBtn.addEventListener("click", () => exportPng(false));
  DOM.openImageBtn.addEventListener("click", () => exportPng(true));
  DOM.mediaUpload.addEventListener("change", handleMediaUpload);
  DOM.avatarUpload.addEventListener("change", handleAvatarUpload);

  renderPreview();
  setStatus("XFrame is ready. Your latest setup will persist on refresh.", "success");
}

init();

