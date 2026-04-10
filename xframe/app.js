const IMPORT_ENDPOINT = "https://krazyykrunal--692ed18e32ba11f1aba742dde27851f2.web.val.run";
const STORAGE_KEY = "xframe-state-v1";

const PRESETS = {
  solar: { accent: "#ff7b54", tint: "#fff3eb" },
  midnight: { accent: "#79a8ff", tint: "#dfe8ff" },
  mint: { accent: "#21b18a", tint: "#ecfff8" },
  berry: { accent: "#d65ca7", tint: "#fff0fa" },
  sand: { accent: "#b48547", tint: "#f8f0df" },
  signal: { accent: "#ff5f45", tint: "#fff4e8" },
  aurora: { accent: "#6ce5b1", tint: "#eafff7" },
  electric: { accent: "#7b7cff", tint: "#edf0ff" },
  ember: { accent: "#ff8f3f", tint: "#fff1e4" },
  orchid: { accent: "#b96cff", tint: "#f5ecff" }
};

const DEMO_DATA = {
  sourceUrl: "https://x.com/buildwithkrunal/status/1909654321234567890",
  authorName: "Krunal Gediya",
  authorHandle: "@buildwithkrunal",
  avatarDataUrl: "",
  headline: "Turn a post into something worth sharing",
  tweetText: "Tiny tools become products when the output feels good enough to post immediately. That last 10% of polish is usually the actual differentiator.",
  replyCount: 84,
  repostCount: 196,
  likeCount: 2800,
  timestamp: "8:12 PM - Apr 8, 2026",
  sourceBadge: "x.com / design-build",
  aspect: "story",
  layout: "signature",
  preset: "solar",
  accent: PRESETS.solar.accent,
  tint: PRESETS.solar.tint,
  darkTheme: true,
  showCoverImage: false,
  showMetrics: false,
  showSource: true,
  showQuoteMarks: true,
  showAvatar: true,
  cardRadius: 30,
  cardOpacity: 86,
  backgroundGraphic: "orbs",
  backgroundGraphicUpload: "",
  uploadedImage: "",
  importedMediaUrl: "",
  importedMediaType: "",
  importedMediaPoster: ""
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
  "cardRadius",
  "cardOpacity",
  "backgroundGraphic",
  "backgroundGraphicUpload",
  "uploadedImage",
  "importedMediaUrl",
  "importedMediaType",
  "importedMediaPoster"
];

const state = {
  ...DEMO_DATA
};

let fitFrame = 0;
let validatedCoverSource = "";
let validatedCoverOkay = false;
let coverValidationInFlight = "";

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
  cardOpacity: document.getElementById("cardOpacity"),
  mediaUpload: document.getElementById("mediaUpload"),
  backgroundUpload: document.getElementById("backgroundUpload"),
  avatarUpload: document.getElementById("avatarUpload"),
  darkTheme: document.getElementById("darkTheme"),
  showCoverImage: document.getElementById("showCoverImage"),
  showMetrics: document.getElementById("showMetrics"),
  showSource: document.getElementById("showSource"),
  showQuoteMarks: document.getElementById("showQuoteMarks"),
  showAvatar: document.getElementById("showAvatar"),
  cardRadius: document.getElementById("cardRadius"),
  parseUrlBtn: document.getElementById("parseUrlBtn"),
  parseStatus: document.getElementById("parseStatus"),
  randomizeBtn: document.getElementById("randomizeBtn"),
  demoFillBtn: document.getElementById("demoFillBtn"),
  copySpecBtn: document.getElementById("copySpecBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  openImageBtn: document.getElementById("openImageBtn"),
  previewStage: document.getElementById("previewStage"),
  previewViewport: document.getElementById("previewViewport"),
  previewScaleShell: document.getElementById("previewScaleShell"),
  exportRoot: document.getElementById("exportRoot"),
  graphicLayer: document.getElementById("graphicLayer"),
  canvasGrid: document.getElementById("canvasGrid"),
  textCard: document.getElementById("textCard"),
  mediaCard: document.getElementById("mediaCard"),
  mediaShell: document.getElementById("mediaShell"),
  mediaPlaceholder: document.getElementById("mediaPlaceholder"),
  mediaPlaceholderTitle: document.getElementById("mediaPlaceholderTitle"),
  mediaPlaceholderText: document.getElementById("mediaPlaceholderText"),
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
  footerNote: document.getElementById("footerNote"),
  modeLabel: document.getElementById("modeLabel"),
  aspectButtons: Array.from(document.querySelectorAll("[data-aspect]")),
  layoutButtons: Array.from(document.querySelectorAll("[data-layout]")),
  presetButtons: Array.from(document.querySelectorAll("[data-preset]")),
  graphicButtons: Array.from(document.querySelectorAll("[data-graphic]"))
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

function formatMetricValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "0";
  if (!/^\d+(?:\.\d+)?$/.test(raw)) return raw;

  const number = Number(raw);
  if (!Number.isFinite(number)) return raw;
  if (number >= 1000000) return (number / 1000000).toFixed(1).replace(".0", "") + "M";
  if (number >= 1000) return (number / 1000).toFixed(1).replace(".0", "") + "K";
  return raw;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripRenderedAttachmentLinks(text) {
  return String(text || "")
    .replace(/(^|\s)(?:https?:\/\/)?pic\.twitter\.com\/\S+/gim, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderTweetMarkup(text) {
  const source = stripRenderedAttachmentLinks(String(text || "").replace(/\r\n/g, "\n"));
  if (!source.trim()) {
    return escapeHtml("Add your post text here and shape it the way you like.");
  }

  const tokenPattern = /(https?:\/\/\S+|[@#][\p{L}\p{N}_]+)/gu;
  let lastIndex = 0;
  let markup = "";

  source.replace(tokenPattern, (token, _match, offset) => {
    markup += escapeHtml(source.slice(lastIndex, offset));
    const cls = token.startsWith("#")
      ? "tweet-token tweet-token-hash"
      : token.startsWith("@")
        ? "tweet-token tweet-token-mention"
        : "tweet-token tweet-token-link";
    markup += '<span class="' + cls + '">' + escapeHtml(token) + '</span>';
    lastIndex = offset + token.length;
    return token;
  });

  markup += escapeHtml(source.slice(lastIndex));
  return markup.replace(/\n/g, "<br>");
}

function pickImportedMedia(payload) {
  const mediaItems = Array.isArray(payload.media) ? payload.media : [];
  const imageCandidates = [
    payload.mediaUrl,
    payload.imageUrl,
    payload.media_image_url,
    payload.photoUrl,
    ...mediaItems.map((item) => item?.url),
    ...mediaItems.map((item) => item?.mediaUrl),
    ...mediaItems.map((item) => item?.imageUrl)
  ];
  const posterCandidates = [
    payload.videoPosterUrl,
    payload.videoThumbnailUrl,
    payload.mediaPosterUrl,
    payload.mediaThumbnailUrl,
    payload.posterUrl,
    payload.thumbnailUrl,
    ...mediaItems.map((item) => item?.posterUrl),
    ...mediaItems.map((item) => item?.thumbnailUrl),
    ...mediaItems.map((item) => item?.previewImageUrl)
  ];
  const mediaType = String(payload.mediaType || payload.media_kind || payload.type || mediaItems[0]?.type || "").toLowerCase();
  const firstImage = imageCandidates.find((value) => isRenderableImageSource(value));
  const firstPoster = posterCandidates.find((value) => isRenderableImageSource(value));

  if (mediaType.includes("video")) {
    return {
      type: "video",
      url: firstPoster || "",
      poster: firstPoster || ""
    };
  }

  return {
    type: firstImage ? "image" : mediaType,
    url: firstImage || firstPoster || "",
    poster: firstPoster || ""
  };
}

function getActiveMedia() {
  if (isRenderableImageSource(state.uploadedImage)) {
    return { kind: "custom", type: "image", source: state.uploadedImage };
  }

  if (state.importedMediaType === "video" && isRenderableImageSource(state.importedMediaPoster)) {
    return { kind: "post-video", type: "video", source: state.importedMediaPoster };
  }

  if (isRenderableImageSource(state.importedMediaUrl)) {
    return { kind: state.importedMediaType === "video" ? "post-video" : "post-image", type: state.importedMediaType || "image", source: state.importedMediaUrl };
  }

  return null;
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
  DOM.cardOpacity.value = state.cardOpacity;
  DOM.darkTheme.checked = state.darkTheme;
  DOM.showCoverImage.checked = state.showCoverImage;
  DOM.showMetrics.checked = state.showMetrics;
  DOM.showSource.checked = state.showSource;
  DOM.showQuoteMarks.checked = state.showQuoteMarks;
  DOM.showAvatar.checked = state.showAvatar;
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
  DOM.graphicButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.graphic === state.backgroundGraphic);
  });
}

function hexToRgbTriplet(hex) {
  const normalized = (hex || "").replace("#", "").trim();
  if (normalized.length !== 6) return null;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}

function isRenderableImageSource(value) {
  if (typeof value !== "string") return false;
  const source = value.trim();
  if (!source) return false;
  return source.startsWith("data:image/") || source.startsWith("http://") || source.startsWith("https://");
}

function canUseCoverImage(source) {
  return isRenderableImageSource(source) && validatedCoverSource === source && validatedCoverOkay;
}

function validateCoverImage(source) {
  if (!isRenderableImageSource(source)) {
    validatedCoverSource = source || "";
    validatedCoverOkay = false;
    return;
  }

  if (validatedCoverSource === source && validatedCoverOkay) {
    return;
  }

  if (coverValidationInFlight === source) {
    return;
  }

  coverValidationInFlight = source;
  const img = new Image();
  img.onload = () => {
    if (coverValidationInFlight !== source) return;
    validatedCoverSource = source;
    validatedCoverOkay = true;
    coverValidationInFlight = "";
    renderPreview();
  };
  img.onerror = () => {
    if (coverValidationInFlight !== source) return;
    validatedCoverSource = source;
    validatedCoverOkay = false;
    coverValidationInFlight = "";
    renderPreview();
  };
  img.src = source;
}

function updateCssVariables() {
  document.documentElement.style.setProperty("--accent", state.accent);
  document.documentElement.style.setProperty("--canvas-tint", state.tint);
  document.documentElement.style.setProperty("--text-scale", "1");
  document.documentElement.style.setProperty("--card-radius", `${state.cardRadius}px`);
  document.documentElement.style.setProperty("--card-overlay-alpha", (Math.max(0.55, Math.min(1, Number(state.cardOpacity || 86) / 100))).toFixed(2));
  document.documentElement.style.setProperty("--export-card-safe-opacity", (0.72 + (Math.max(55, Math.min(100, Number(state.cardOpacity || 86))) - 55) / 45 * 0.27).toFixed(3));

  const accentRgb = hexToRgbTriplet(state.accent);
  const tintRgb = hexToRgbTriplet(state.tint);
  if (accentRgb) document.documentElement.style.setProperty("--accent-rgb", accentRgb);
  if (tintRgb) document.documentElement.style.setProperty("--tint-rgb", tintRgb);
}

function renderBackgroundGraphics() {
  if (!DOM.graphicLayer) return;
  
  DOM.graphicLayer.innerHTML = "";
  DOM.graphicLayer.style.backgroundImage = "";
  DOM.graphicLayer.style.backgroundColor = "transparent";
  DOM.graphicLayer.style.filter = "none";
  DOM.graphicLayer.classList.remove("graphic-orbs", "graphic-grid", "graphic-waves", "graphic-custom", "graphic-dots", "graphic-gradient", "graphic-stripes", "graphic-blur-mesh");
  
  // Hide ambient elements unless using orbs
  const ambients = DOM.exportRoot.querySelectorAll(".ambient");
  ambients.forEach(el => el.style.display = "none");

  const accentRgb = hexToRgbTriplet(state.accent);
  const tintRgb = hexToRgbTriplet(state.tint);

  if (state.backgroundGraphic === "custom" && state.backgroundGraphicUpload) {
    DOM.graphicLayer.style.backgroundImage = `url(${state.backgroundGraphicUpload})`;
    DOM.graphicLayer.style.backgroundSize = "cover";
    DOM.graphicLayer.style.backgroundPosition = "center";
    DOM.graphicLayer.classList.add("graphic-custom");
  } else if (state.backgroundGraphic === "grid") {
    DOM.graphicLayer.classList.add("graphic-grid");
    DOM.graphicLayer.style.backgroundImage = `linear-gradient(0deg, transparent 24%, rgba(${accentRgb}, 0.08) 25%, rgba(${accentRgb}, 0.08) 26%, transparent 27%, transparent 74%, rgba(${accentRgb}, 0.08) 75%, rgba(${accentRgb}, 0.08) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(${accentRgb}, 0.08) 25%, rgba(${accentRgb}, 0.08) 26%, transparent 27%, transparent 74%, rgba(${accentRgb}, 0.08) 75%, rgba(${accentRgb}, 0.08) 76%, transparent 77%, transparent)`;
    DOM.graphicLayer.style.backgroundSize = "50px 50px";
  } else if (state.backgroundGraphic === "waves") {
    DOM.graphicLayer.classList.add("graphic-waves");
    DOM.graphicLayer.style.backgroundImage = `linear-gradient(90deg, transparent 48%, rgba(${accentRgb}, 0.12) 49%, rgba(${accentRgb}, 0.12) 51%, transparent 52%), linear-gradient(0deg, transparent 48%, rgba(${accentRgb}, 0.08) 49%, rgba(${accentRgb}, 0.08) 51%, transparent 52%), linear-gradient(45deg, transparent 44%, rgba(${accentRgb}, 0.06) 45%, rgba(${accentRgb}, 0.06) 55%, transparent 56%), linear-gradient(-45deg, transparent 44%, rgba(${accentRgb}, 0.06) 45%, rgba(${accentRgb}, 0.06) 55%, transparent 56%)`;
    DOM.graphicLayer.style.backgroundSize = "60px 60px, 60px 60px, 84.84px 84.84px, 84.84px 84.84px";
    DOM.graphicLayer.style.backgroundPosition = "0 0";
  } else if (state.backgroundGraphic === "dots") {
    DOM.graphicLayer.classList.add("graphic-dots");
    DOM.graphicLayer.style.backgroundImage = `radial-gradient(circle, rgba(${accentRgb}, 0.15) 2px, transparent 2px)`;
    DOM.graphicLayer.style.backgroundSize = "40px 40px";
  } else if (state.backgroundGraphic === "gradient") {
    DOM.graphicLayer.classList.add("graphic-gradient");
    DOM.graphicLayer.style.background = `linear-gradient(135deg, rgba(${accentRgb}, 0.08) 0%, rgba(${tintRgb}, 0.04) 50%, rgba(${accentRgb}, 0.06) 100%)`;
  } else if (state.backgroundGraphic === "stripes") {
    DOM.graphicLayer.classList.add("graphic-stripes");
    DOM.graphicLayer.style.backgroundImage = `linear-gradient(45deg, transparent 48%, rgba(${accentRgb}, 0.1) 49%, rgba(${accentRgb}, 0.1) 51%, transparent 52%)`;
    DOM.graphicLayer.style.backgroundSize = "30px 30px";
  } else if (state.backgroundGraphic === "blur-mesh") {
    DOM.graphicLayer.classList.add("graphic-blur-mesh");
    DOM.graphicLayer.style.background = `radial-gradient(at 20% 30%, rgba(${accentRgb}, 0.15) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(${tintRgb}, 0.12) 0px, transparent 50%), radial-gradient(at 40% 80%, rgba(${accentRgb}, 0.1) 0px, transparent 50%)`;
    DOM.graphicLayer.style.filter = "blur(40px)";
  } else {
    // orbs (default) - show ambient elements
    DOM.graphicLayer.classList.add("graphic-orbs");
    ambients.forEach(el => el.style.display = "block");
  }
}

function cardIsOverflowing() {
  return DOM.textCard.scrollHeight - DOM.textCard.clientHeight > 2 || DOM.textCard.scrollWidth - DOM.textCard.clientWidth > 2;
}

function fitTextCard() {
  const text = (state.tweetText || "").trim();
  const tweetLength = text.length;
  const lineBreaks = (text.match(/\n/g) || []).length;
  const isShort = tweetLength > 0 && tweetLength <= 90 && lineBreaks <= 1;
  const isMedium = tweetLength > 90 && tweetLength <= 180 && lineBreaks <= 3;
  const isLongform = tweetLength > 180 || lineBreaks > 3;

  DOM.textCard.classList.remove("is-short", "is-medium", "is-tight", "is-compact", "is-micro", "hide-decor", "is-longform");
  DOM.textCard.style.removeProperty("--fit-scale");
  DOM.textCard.style.removeProperty("--post-quote-gap");
  DOM.textCard.style.removeProperty("--story-quote-gap-top");
  DOM.textCard.style.removeProperty("--story-quote-gap-bottom");
  DOM.textCard.style.removeProperty("--story-line-height");
  DOM.textCard.style.removeProperty("--story-copy-scale");
  DOM.textCard.style.removeProperty("--story-top-gap");
  DOM.textCard.style.removeProperty("--story-meta-pad-top");

  if (isShort) DOM.textCard.classList.add("is-short");
  if (isMedium) DOM.textCard.classList.add("is-medium");
  if (isLongform) DOM.textCard.classList.add("is-longform");

  const isPost = state.aspect === "post";
  const isStory = state.aspect === "story";

  // For post mode, dynamically boost vertical spacing when content is short
  if (isPost && !cardIsOverflowing()) {
    const spare = DOM.textCard.clientHeight - DOM.textCard.scrollHeight;
    if (spare > 160 && isShort) {
      DOM.textCard.style.setProperty("--post-quote-gap", "68px");
    } else if (spare > 120) {
      DOM.textCard.style.setProperty("--post-quote-gap", "56px");
    } else if (spare > 80) {
      DOM.textCard.style.setProperty("--post-quote-gap", "48px");
    } else if (spare > 40) {
      DOM.textCard.style.setProperty("--post-quote-gap", "40px");
    }
  }

  // Story mode: measure actual visual gap between header and footer using getBoundingClientRect().
  // scrollHeight - clientHeight is always ~0 with justify-content:space-between, so we can't use it.
  // Only expand here — the is-tight/is-compact/is-micro + fit-scale chain handles overflow.
  if (isStory) {
    const quoteEl = DOM.textCard.querySelector('.quote-wrap');
    const topEl   = DOM.textCard.querySelector('.text-card-top');
    const metaEl  = DOM.textCard.querySelector('.meta-row') || DOM.textCard.querySelector('.text-card-bottom');
    if (quoteEl && topEl && metaEl) {
      const qR = quoteEl.getBoundingClientRect();
      const tR = topEl.getBoundingClientRect();
      const mR = metaEl.getBoundingClientRect();
      // bandH = visual space between bottom of author block and top of footer row
      const bandH  = mR.top - tR.bottom;
      const quoteH = qR.height;
      if (bandH > 20 && quoteH > 10) {
        const fillRatio = quoteH / bandH;
        const TARGET    = 0.80; // text block should fill ~80% of the band
        if (fillRatio < TARGET - 0.04) {
          // Scale font up proportionally. ch units are font-relative, so wrapping stays intact
          // and height scales approximately linearly with font size.
          const scale = Math.min((bandH * TARGET) / quoteH, 2.8);
          DOM.textCard.style.setProperty("--story-copy-scale", scale.toFixed(3));
          // Gently increase line-height at larger sizes for readability
          const lh = Math.min(0.96 + (scale - 1) * 0.06, 1.12);
          DOM.textCard.style.setProperty("--story-line-height", lh.toFixed(2));
          // Distribute remaining band space as equal top/bottom margins
          const rem  = bandH * (1 - TARGET);
          const gTop = Math.round(Math.max(rem * 0.5, 12));
          const gBot = Math.round(Math.max(rem * 0.5, 10));
          DOM.textCard.style.setProperty("--story-quote-gap-top",    `${gTop}px`);
          DOM.textCard.style.setProperty("--story-quote-gap-bottom", `${gBot}px`);
        }
      }
    }
  }

  const steps = ["is-tight", "is-compact", "is-micro"];
  for (const step of steps) {
    if (!cardIsOverflowing()) {
      return;
    }
    DOM.textCard.classList.add(step);
  }

  if (!cardIsOverflowing()) {
    return;
  }

  DOM.textCard.classList.add("hide-decor");

  let scale = isLongform ? (isPost ? 0.82 : 0.72) : isShort ? (isPost ? 0.94 : 0.88) : (isPost ? 0.88 : 0.8);
  const minScale = isPost ? 0.54 : 0.44;

  while (cardIsOverflowing() && scale >= minScale) {
    DOM.textCard.style.setProperty("--fit-scale", scale.toFixed(2));
    scale -= 0.02;
  }
}

function queueFitTextCard() {
  window.cancelAnimationFrame(fitFrame);
  fitFrame = window.requestAnimationFrame(() => {
    fitTextCard();
  });
}

function updatePreviewScale() {
  const logicalWidth = state.aspect === "story" ? 560 : 860;
  const stageWidth = DOM.previewStage ? DOM.previewStage.clientWidth - 32 : logicalWidth;
  const scale = Math.min(1, Math.max(0.34, stageWidth / logicalWidth));

  DOM.previewViewport.classList.toggle("aspect-story", state.aspect === "story");
  DOM.previewViewport.classList.toggle("aspect-post", state.aspect === "post");
  DOM.previewScaleShell.classList.toggle("aspect-story", state.aspect === "story");
  DOM.previewScaleShell.classList.toggle("aspect-post", state.aspect === "post");
  DOM.previewScaleShell.style.setProperty("--preview-scale", scale.toFixed(4));
  DOM.previewViewport.style.setProperty("--preview-scale", scale.toFixed(4));
}

function renderPreview() {
  updateCssVariables();
  renderBackgroundGraphics();
  syncActiveButtons();

  DOM.previewHeadline.textContent = state.headline || "Untitled post";
  DOM.previewAuthorName.textContent = state.authorName || "Unknown author";
  DOM.previewAuthorHandle.textContent = normalizeHandle(state.authorHandle) || "@unknown";
  DOM.previewTweetText.innerHTML = renderTweetMarkup(state.tweetText);
  DOM.previewTimestamp.textContent = state.timestamp || "No timestamp";
  DOM.previewSourceBadge.textContent = state.sourceBadge || "x.com";
  DOM.previewReplies.textContent = formatMetricValue(state.replyCount);
  DOM.previewReposts.textContent = formatMetricValue(state.repostCount);
  DOM.previewLikes.textContent = formatMetricValue(state.likeCount);

  DOM.exportRoot.classList.toggle("dark-theme", state.darkTheme);
  DOM.avatarBadge.classList.toggle("hidden", !state.showAvatar);
  DOM.avatarBadge.classList.toggle("has-image", Boolean(state.avatarDataUrl));
  DOM.avatarImage.src = state.avatarDataUrl || "";
  DOM.avatarImage.alt = `${state.authorName || "Author"} avatar`;
  const activeMedia = state.showCoverImage ? getActiveMedia() : null;
  validateCoverImage(activeMedia ? activeMedia.source : "");
  const hasRenderableCover = Boolean(activeMedia && canUseCoverImage(activeMedia.source));

  DOM.exportRoot.classList.toggle("aspect-post", state.aspect === "post");
  DOM.exportRoot.classList.toggle("aspect-story", state.aspect === "story");
  DOM.exportRoot.classList.remove("story-cover");
  DOM.previewViewport.classList.toggle("aspect-post", state.aspect === "post");
  DOM.previewViewport.classList.toggle("aspect-story", state.aspect === "story");
  DOM.canvasGrid.classList.toggle("no-cover", !hasRenderableCover);
  DOM.canvasGrid.classList.toggle("has-cover", hasRenderableCover);
  DOM.canvasGrid.classList.remove("story-cover-mode");
  DOM.mediaCard.classList.toggle("hidden", !hasRenderableCover);

  DOM.textCard.classList.remove("layout-signature", "layout-editorial", "layout-spotlight", "layout-minimal", "layout-stacked", "layout-poster", "layout-cinema");
  DOM.textCard.classList.add(`layout-${state.layout}`);
  
  // Apply card background opacity only (not text)
  const opacityRatio = Math.max(0.55, Math.min(1, Number(state.cardOpacity || 86) / 100));
  // Create adjusted background with opacity
  if (state.darkTheme) {
    DOM.textCard.style.background = `
      radial-gradient(circle at top right, rgba(var(--accent-rgb), ${0.16 * opacityRatio}), transparent 30%),
      linear-gradient(180deg, rgba(14, 18, 27, ${0.9 * opacityRatio}), rgba(7, 10, 16, ${0.95 * opacityRatio})),
      linear-gradient(90deg, rgba(var(--tint-rgb), ${0.04 * opacityRatio}), rgba(255,255,255,0))
    `.trim();
  } else {
    DOM.textCard.style.background = `
      radial-gradient(circle at top right, rgba(var(--accent-rgb), ${0.12 * opacityRatio}), transparent 30%),
      linear-gradient(180deg, rgba(255, 253, 250, ${0.66 * opacityRatio}), rgba(255, 247, 240, ${0.78 * opacityRatio})),
      linear-gradient(90deg, rgba(var(--tint-rgb), ${0.3 * opacityRatio}), rgba(39, 24, 14, 0))
    `.trim();
  }
  DOM.textCard.style.color = "inherit";
  
  DOM.previewMetrics.classList.toggle("hidden", !state.showMetrics);
  DOM.previewSourceBadge.classList.toggle("hidden", !state.showSource);
  DOM.quoteMark.classList.toggle("hidden", !state.showQuoteMarks);

  const resolutionLabel = `${state.darkTheme ? "dark" : "light"} / ${state.aspect === "story" ? "1080 x 1920 story" : "1080 x 1350 post"}`;
  DOM.modeLabel.textContent = resolutionLabel;
  DOM.footerNote.textContent = state.sourceUrl
    ? `Made in XFrame from ${parseTweetUrl(state.sourceUrl).ok ? "a post link" : "your own words"}.`
    : "Made in XFrame to help you share a post beautifully.";

  DOM.exportRoot.style.removeProperty("--cover-image");
  if (hasRenderableCover && activeMedia) {
    DOM.mediaShell.classList.add("has-image");
    DOM.mediaShell.style.backgroundImage = `linear-gradient(180deg, rgba(18, 12, 10, 0.08), rgba(18, 12, 10, 0.34)), url(${activeMedia.source})`;
    DOM.mediaPlaceholder.classList.add("hidden");
    DOM.footerNote.textContent = activeMedia.kind === "post-video" ? "Video posts use the post poster image when one is available." : DOM.footerNote.textContent;
  } else {
    DOM.mediaShell.classList.remove("has-image");
    DOM.mediaShell.style.backgroundImage = "";
    DOM.mediaPlaceholder.classList.remove("hidden");
    if (state.importedMediaType === "video") {
      DOM.mediaPlaceholderTitle.textContent = "This post includes video.";
      DOM.mediaPlaceholderText.textContent = "If there is no poster image available yet, add your own image to bring the split layout back.";
    } else {
      DOM.mediaPlaceholderTitle.textContent = "Your image can live here.";
      DOM.mediaPlaceholderText.textContent = "Add a photo or keep it clean and text-first.";
    }
  }

  updatePreviewScale();
  queueFitTextCard();
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
  DOM.parseUrlBtn.textContent = "Bringing it in...";

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
  setStatus(`Found @${parsed.username}. Pulling in the post now...`, "");

  try {
    const data = await importFromValTown(parsed.normalizedUrl);
    state.sourceUrl = data.sourceUrl || parsed.normalizedUrl;
    state.authorName = data.authorName || state.authorName;
    state.authorHandle = data.authorHandle || state.authorHandle;
    state.tweetText = data.tweetText || state.tweetText;
    state.timestamp = data.timestamp || state.timestamp;
    state.sourceBadge = data.sourceBadge || state.sourceBadge;
    state.avatarDataUrl = data.avatarDataUrl || "";
    const importedMedia = pickImportedMedia(data);
    state.importedMediaUrl = importedMedia.url;
    state.importedMediaType = importedMedia.type;
    state.importedMediaPoster = importedMedia.poster;
    if (importedMedia.url || importedMedia.poster) {
      state.showCoverImage = true;
    }
    state.headline = `${state.authorName} on X`;
    persistState();
    syncInputsFromState();
    renderPreview();
    setStatus(state.avatarDataUrl ? "Your post is ready, including the profile image." : "Your post is in. You can add a profile image if you want.", "success");
  } catch (error) {
    console.error(error);
    setStatus("That post needs a lighter import path, so I'm trying a simpler read next.", "error");

    try {
      const fallback = await importViaOEmbed(parsed.normalizedUrl);
      state.authorName = fallback.authorName || state.authorName;
      state.authorHandle = fallback.authorHandle || state.authorHandle;
      state.tweetText = fallback.tweetText || state.tweetText;
      state.timestamp = fallback.timestamp || state.timestamp;
      state.importedMediaUrl = "";
      state.importedMediaType = "";
      state.importedMediaPoster = "";
      state.headline = `${state.authorName} on X`;
      persistState();
      syncInputsFromState();
      renderPreview();
      setStatus("The words came through. If the profile image is missing, you can add one yourself.", "success");
    } catch (fallbackError) {
      console.error(fallbackError);
      persistState();
      syncInputsFromState();
      renderPreview();
      setStatus("That link didn't come through cleanly, but you can still paste the words in and keep going.", "error");
    }
  } finally {
    DOM.parseUrlBtn.disabled = false;
    DOM.parseUrlBtn.textContent = originalLabel;
  }
}

function randomizeLook() {
  const presetNames = Object.keys(PRESETS);
  const layouts = ["signature", "spotlight", "editorial", "minimal", "stacked", "poster", "cinema"];
  state.preset = presetNames[Math.floor(Math.random() * presetNames.length)];
  state.layout = layouts[Math.floor(Math.random() * layouts.length)];
  const preset = PRESETS[state.preset];
  state.accent = preset.accent;
  state.tint = preset.tint;
  persistState();
  syncInputsFromState();
  renderPreview();
  setStatus("Here's a fresh look to build from.", "success");
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
    validatedCoverSource = "";
    validatedCoverOkay = false;
    coverValidationInFlight = "";
    state.showCoverImage = true;
    persistState();
    syncInputsFromState();
    renderPreview();
    setStatus(`Added "${file.name}" to the image area.`, "success");
  } catch {
    setStatus("That image didn't load properly. Try another one.", "error");
  }
}

async function handleBackgroundUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    state.backgroundGraphicUpload = await readImageFile(file);
    state.backgroundGraphic = "custom";
    persistState();
    syncInputsFromState();
    renderPreview();
    setStatus(`Added "${file.name}" as the background graphic.`, "success");
  } catch {
    setStatus("That background graphic didn't load properly. Try another one.", "error");
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
    setStatus(`Added "${file.name}" as the profile image.`, "success");
  } catch {
    setStatus("That profile image didn't load properly. Try another one.", "error");
  }
}

function updateStateFromFields() {
  state.sourceUrl = DOM.sourceUrl.value.trim();
  state.authorName = DOM.authorName.value.trim();
  state.authorHandle = DOM.authorHandle.value.trim();
  state.headline = DOM.headline.value.trim();
  state.tweetText = DOM.tweetText.value.replace(/\r\n/g, "\n").trim();
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
  state.cardRadius = Number(DOM.cardRadius.value);
  state.cardOpacity = Number(DOM.cardOpacity.value);
  persistState();
  renderPreview();
}

function waitForImageReady(image) {
  return new Promise((resolve) => {
    if (!image) {
      resolve();
      return;
    }

    const finish = () => resolve();
    if (image.complete && image.naturalWidth > 0) {
      finish();
      return;
    }

    image.addEventListener('load', finish, { once: true });
    image.addEventListener('error', finish, { once: true });

    if (typeof image.decode === 'function') {
      image.decode().then(finish).catch(finish);
    }
  });
}

async function prepareCloneForExport(clone) {
  const cloneAvatar = clone.querySelector('#avatarImage');
  const cloneAvatarBadge = clone.querySelector('#avatarBadge');
  const cloneGraphicLayer = clone.querySelector('#graphicLayer');
  const cloneTextCard = clone.querySelector('#textCard');
  const activeAvatarSrc = DOM.avatarImage.currentSrc || DOM.avatarImage.src || state.avatarDataUrl || '';

  if (cloneAvatar) {
    cloneAvatar.loading = 'eager';
    cloneAvatar.decoding = 'sync';
    cloneAvatar.fetchPriority = 'high';
    if (activeAvatarSrc) {
      cloneAvatar.src = activeAvatarSrc;
    } else {
      cloneAvatar.removeAttribute('src');
    }
  }

  if (cloneAvatarBadge) {
    cloneAvatarBadge.classList.toggle('has-image', Boolean(activeAvatarSrc));
  }

  // Copy graphic layer styles
  if (cloneGraphicLayer && DOM.graphicLayer) {
    cloneGraphicLayer.style.cssText = DOM.graphicLayer.style.cssText;
    cloneGraphicLayer.className = DOM.graphicLayer.className;
  }

  // Recompute text card background with resolved values for export
  if (cloneTextCard) {
    const opacityRatio = Math.max(0.55, Math.min(1, Number(state.cardOpacity || 86) / 100));
    const accentRgb = hexToRgbTriplet(state.accent);
    const tintRgb = hexToRgbTriplet(state.tint);
    
    // Compute opacity-adjusted alpha values
    const radialAlpha = state.darkTheme ? 0.16 * opacityRatio : 0.12 * opacityRatio;
    const linearAlpha1 = state.darkTheme ? 0.9 * opacityRatio : 0.66 * opacityRatio;
    const linearAlpha2 = state.darkTheme ? 0.95 * opacityRatio : 0.78 * opacityRatio;
    const linearAlpha3 = state.darkTheme ? 0.04 * opacityRatio : 0.3 * opacityRatio;
    
    let background = '';
    if (state.darkTheme) {
      background = `radial-gradient(circle at top right, rgba(${accentRgb}, ${radialAlpha.toFixed(3)}), transparent 30%), linear-gradient(180deg, rgba(14, 18, 27, ${linearAlpha1.toFixed(3)}), rgba(7, 10, 16, ${linearAlpha2.toFixed(3)})), linear-gradient(90deg, rgba(${tintRgb}, ${linearAlpha3.toFixed(3)}), rgba(255,255,255,0))`;
    } else {
      background = `radial-gradient(circle at top right, rgba(${accentRgb}, ${radialAlpha.toFixed(3)}), transparent 30%), linear-gradient(180deg, rgba(255, 253, 250, ${linearAlpha1.toFixed(3)}), rgba(255, 247, 240, ${linearAlpha2.toFixed(3)})), linear-gradient(90deg, rgba(${tintRgb}, ${linearAlpha3.toFixed(3)}), rgba(39, 24, 14, 0))`;
    }
    
    // Use setProperty with !important to ensure override of CSS class styles
    cloneTextCard.style.setProperty('background', background, 'important');
    cloneTextCard.style.setProperty('color', 'inherit', 'important');
  }

  const images = Array.from(clone.querySelectorAll('img'));
  await Promise.all(images.map(waitForImageReady));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}
function createExportClone(options = {}) {
  const { exportSafe = false } = options;
  const exportShell = document.createElement("div");
  exportShell.style.position = "fixed";
  exportShell.style.left = "-10000px";
  exportShell.style.top = "0";
  exportShell.style.pointerEvents = "none";
  exportShell.style.zIndex = "-1";
  exportShell.style.padding = "0";
  exportShell.style.margin = "0";
  exportShell.style.background = "transparent";

  const clone = DOM.exportRoot.cloneNode(true);
  clone.id = "exportRootClone";
  if (exportSafe) {
    clone.classList.add("export-render");
  }
  clone.style.transform = "none";
  clone.style.width = state.aspect === "story" ? "560px" : "860px";
  clone.style.maxWidth = "none";
  clone.style.margin = "0";
  clone.style.left = "auto";
  clone.style.top = "auto";
  clone.style.position = "relative";

  exportShell.appendChild(clone);
  document.body.appendChild(exportShell);
  return { exportShell, clone };
}

async function renderExportBlob() {
  await document.fonts.ready;
  const width = state.aspect === "story" ? 560 : 860;
  const height = state.aspect === "story" ? Math.round((560 * 16) / 9) : Math.round((860 * 5) / 4);
  const htmlToImageApi = window.html2image;

  if (htmlToImageApi && typeof htmlToImageApi.toBlob === "function") {
    const { exportShell, clone } = createExportClone();
    try {
      await prepareCloneForExport(clone);
      const fontEmbedCSS = await getExportFontEmbedCss();
      const blob = await htmlToImageApi.toBlob(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: null,
        width,
        height,
        canvasWidth: width * 2,
        canvasHeight: height * 2,
        fontEmbedCSS,
        preferredFontFormat: "woff2",
        style: {
          transform: "none",
          margin: "0"
        }
      });

      if (blob) {
        return blob;
      }
    } finally {
      exportShell.remove();
    }
  }

  if (typeof window.html2canvas !== "function") {
    throw new Error("No supported export renderer is available");
  }

  const { exportShell, clone } = createExportClone({ exportSafe: true });
  try {
    await prepareCloneForExport(clone);
    const canvas = await window.html2canvas(clone, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: false,
      imageTimeout: 15000,
      logging: false
    });

    return await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error("Canvas blob generation failed"));
      }, "image/png");
    });
  } finally {
    exportShell.remove();
  }
}

let exportFontEmbedCssPromise = null;

async function getExportFontEmbedCss() {
  if (exportFontEmbedCssPromise) {
    return exportFontEmbedCssPromise;
  }

  exportFontEmbedCssPromise = (async () => {
    const fontLink = document.querySelector('link[href*="fonts.googleapis.com/css2"]');
    if (!fontLink) {
      return "";
    }

    try {
      const response = await fetch(fontLink.href, { mode: "cors" });
      if (!response.ok) {
        return "";
      }
      return await response.text();
    } catch (error) {
      console.warn("Could not fetch export font CSS", error);
      return "";
    }
  })();

  return exportFontEmbedCssPromise;
}

function slugifyFilenamePart(value, fallback = "xframe") {
  const cleaned = String(value || "")
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return cleaned || fallback;
}

function buildExportFilename() {
  const handle = slugifyFilenamePart(normalizeHandle(state.authorHandle).replace(/^@/, ""), "post");
  const textSeed = slugifyFilenamePart(state.tweetText || state.headline, "story");
  const mode = state.aspect === "story" ? "story" : "post";
  return "xframe-" + handle + "-" + textSeed + "-" + mode + ".png";
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
    DOM.cardOpacity,
    DOM.darkTheme,
    DOM.showCoverImage,
    DOM.showMetrics,
    DOM.showSource,
    DOM.showQuoteMarks,
    DOM.showAvatar,
    DOM.cardRadius
  ].forEach((element) => {
    element.addEventListener("input", updateStateFromFields);
    element.addEventListener("change", updateStateFromFields);
  });
}

async function exportPng(openInNewTab = false) {
  const originalStatus = DOM.parseStatus.textContent;
  const filename = buildExportFilename();
  const popup = openInNewTab ? window.open("", "_blank") : null;

  if (openInNewTab && !popup) {
    setStatus("Your browser blocked the preview window. Please allow pop-ups and try again.", "error");
    return;
  }

  if (popup) {
    popup.document.write('<title>XFrame Export</title><p style="font-family:Arial,sans-serif;padding:24px;background:#111;color:#fff;">Getting your image ready...</p>');
    popup.document.close();
  }

  try {
    DOM.downloadBtn.disabled = true;
    DOM.openImageBtn.disabled = true;
    setStatus("Getting your image ready...", "");

    const blob = await renderExportBlob();
    const objectUrl = URL.createObjectURL(blob);

    if (popup) {
      // Ensure popup is properly set up before showing the image
      try {
        popup.document.open();
        popup.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>XFrame Export</title>
            <style>
              body { margin: 0; padding: 0; background: #000; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
              img { max-width: 100%; max-height: 100vh; display: block; }
            </style>
          </head>
          <body>
            <img src="${objectUrl}" alt="XFrame Export" />
          </body>
          </html>
        `);
        popup.document.close();
        setStatus("Your image preview is open.", "success");
      } catch (popupError) {
        console.error("Popup display error:", popupError);
        // Fallback: download instead
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
        setStatus("Your image is saved (preview failed, downloading instead).", "success");
      }
      return;
    }

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    setStatus("Your image is saved.", "success");
  } catch (error) {
    console.error(error);
    if (popup && !popup.closed) {
      popup.close();
    }
    setStatus("Saving didn't work this time. Refresh once and try again.", "error");
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
    importedMedia: {
      type: state.importedMediaType || null,
      available: Boolean(state.importedMediaUrl || state.importedMediaPoster)
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
      cardRadius: state.cardRadius
    }
  };

  try {
    await navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setStatus("Your current setup is copied.", "success");
  } catch {
    setStatus("Copying didn't work in this browser.", "error");
  }
}

function loadDemo() {
  Object.assign(state, DEMO_DATA, PRESETS[DEMO_DATA.preset]);
  persistState();
  syncInputsFromState();
  renderPreview();
  setStatus("Demo look loaded.", "success");
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

  DOM.graphicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.backgroundGraphic = button.dataset.graphic;
      state.backgroundGraphicUpload = "";
      persistState();
      renderPreview();
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
  if (DOM.demoFillBtn) DOM.demoFillBtn.addEventListener("click", loadDemo);
  DOM.copySpecBtn.addEventListener("click", copySpec);
  DOM.downloadBtn.addEventListener("click", () => exportPng(false));
  DOM.openImageBtn.addEventListener("click", () => exportPng(true));
  DOM.mediaUpload.addEventListener("change", handleMediaUpload);
  DOM.backgroundUpload.addEventListener("change", handleBackgroundUpload);
  DOM.avatarUpload.addEventListener("change", handleAvatarUpload);
  window.addEventListener("resize", queueFitTextCard);

  renderPreview();
}

init();









