const API_BASE = "https://krazyykrunal--8eafbe7a255711f1926b42dde27851f2.web.val.run";
const POLL_MS = 1500;
const HEARTBEAT_MS = 12000;
const PLAYER_STALE_MS = 20000;
const STORAGE_KEY = "priye-playroom-session";
const PRESENCE_TYPES = ["player_join", "player_online", "player_leave"];
const DRIFT_SEQUENCE = ["LEFT", "RIGHT", "LEFT", "LEFT", "RIGHT", "RIGHT", "LEFT", "RIGHT"];
const DROP_ROWS = [["heart", "trap", "boost"], ["trap", "heart", "heart"], ["boost", "trap", "heart"], ["heart", "boost", "trap"], ["trap", "heart", "boost"], ["heart", "trap", "heart"]];
const WIN_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const LUDO_TRACK_LENGTH = 18;
const LUDO_SPECIALS = { 4: { type: "boost", delta: 2, label: "+2" }, 7: { type: "trap", delta: -2, label: "-2" }, 10: { type: "boost", delta: 1, label: "+1" }, 13: { type: "trap", delta: -3, label: "-3" }, 16: { type: "boost", delta: 2, label: "+2" } };
const games = {
  "heart-hoops": { title: "Heart Hoops", subtitle: "Tap-Tap shots energy with romantic score duels." },
  "drift-to-you": { title: "Drift To You", subtitle: "One-button drift survival across a glowing love road." },
  "love-drop": { title: "Love Drop", subtitle: "Pick the best lane and build the biggest heart stack." },
  "glow-duel": { title: "Glow Duel", subtitle: "Party-style reaction duel. Grab the spark first." },
  "love-tic-tac-toe": { title: "Love Tic Tac Toe", subtitle: "A full-screen neon love grid with proper turn-based mind games." },
  "ludo-love": { title: "Ludo Love", subtitle: "A compact romantic race with boost tiles, traps, and lucky rolls." },
};
const legacyGameMap = { "moon-match": "heart-hoops", "cupid-cipher": "drift-to-you", "velvet-voltage": "glow-duel", "neon-hearts": "love-drop", "heart-dash": "glow-duel", "love-lock": "drift-to-you", "spark-sync": "glow-duel", "kiss-or-miss": "love-drop", "flirty-roulette": "heart-hoops", "after-dark": "heart-hoops" };

const authView = document.getElementById("auth-view");
const arcadeView = document.getElementById("arcade-view");
const connectionStatus = document.getElementById("connection-status");
const dashboardConnection = document.getElementById("dashboard-connection");
const setupStatus = document.getElementById("setup-status");
const globalStatus = document.getElementById("global-status");
const pairBanner = document.getElementById("pair-banner");
const pairStatusDisplay = document.getElementById("pair-status-display");
const roomCodeDisplay = document.getElementById("room-code-display");
const playerRoleDisplay = document.getElementById("player-role-display");
const hostDisplay = document.getElementById("host-display");
const playerCountDisplay = document.getElementById("player-count-display");
const playersList = document.getElementById("players-list");
const stageTitle = document.getElementById("stage-title");
const stageSubtitle = document.getElementById("stage-subtitle");
const playerNameInput = document.getElementById("player-name");
const joinCodeInput = document.getElementById("join-code");
const createRoomButton = document.getElementById("create-room");
const joinRoomButton = document.getElementById("join-room");
const leaveRoomButton = document.getElementById("leave-room");
const copyRoomButton = document.getElementById("copy-room");
const randomGameButton = document.getElementById("random-game");
const cartridgeButtons = [...document.querySelectorAll(".cartridge")];
const apiDisplay = document.getElementById("api-display");
const resumeRoomButton = document.getElementById("resume-room");
const resumeRoomDisplay = document.getElementById("resume-room-display");

const hoopsStartButton = document.getElementById("hoops-start");
const hoopsShootButton = document.getElementById("hoops-shoot");
const hoopsTurn = document.getElementById("hoops-turn");
const hoopsStatus = document.getElementById("hoops-status");
const hoopsPlayerA = document.getElementById("hoops-player-a");
const hoopsPlayerB = document.getElementById("hoops-player-b");
const hoopsScoreA = document.getElementById("hoops-score-a");
const hoopsScoreB = document.getElementById("hoops-score-b");
const hoopsMeter = document.getElementById("hoops-meter");
const hoopsBall = document.getElementById("hoops-ball");
const driftStartButton = document.getElementById("drift-start");
const driftLeftButton = document.getElementById("drift-left");
const driftRightButton = document.getElementById("drift-right");
const driftTurn = document.getElementById("drift-turn");
const driftStatus = document.getElementById("drift-status");
const driftPlayerA = document.getElementById("drift-player-a");
const driftPlayerB = document.getElementById("drift-player-b");
const driftScoreA = document.getElementById("drift-score-a");
const driftScoreB = document.getElementById("drift-score-b");
const driftArrow = document.getElementById("drift-arrow");
const dropStartButton = document.getElementById("drop-start");
const dropTurn = document.getElementById("drop-turn");
const dropStatus = document.getElementById("drop-status");
const dropPlayerA = document.getElementById("drop-player-a");
const dropPlayerB = document.getElementById("drop-player-b");
const dropScoreA = document.getElementById("drop-score-a");
const dropScoreB = document.getElementById("drop-score-b");
const dropBoard = document.getElementById("drop-board");
const dropLaneButtons = [0, 1, 2].map((index) => document.getElementById(`drop-lane-${index}`));
const glowStartButton = document.getElementById("glow-start");
const glowClaimButton = document.getElementById("glow-claim");
const glowCountdown = document.getElementById("glow-countdown");
const glowStatus = document.getElementById("glow-status");
const tttStartButton = document.getElementById("ttt-start");
const tttTurn = document.getElementById("ttt-turn");
const tttStatus = document.getElementById("ttt-status");
const tttPlayerA = document.getElementById("ttt-player-a");
const tttPlayerB = document.getElementById("ttt-player-b");
const tttMarkA = document.getElementById("ttt-mark-a");
const tttMarkB = document.getElementById("ttt-mark-b");
const tttBoard = document.getElementById("ttt-board");
const ludoStartButton = document.getElementById("ludo-start");
const ludoRollButton = document.getElementById("ludo-roll-button");
const ludoTurn = document.getElementById("ludo-turn");
const ludoStatus = document.getElementById("ludo-status");
const ludoPlayerA = document.getElementById("ludo-player-a");
const ludoPlayerB = document.getElementById("ludo-player-b");
const ludoPosA = document.getElementById("ludo-pos-a");
const ludoPosB = document.getElementById("ludo-pos-b");
const ludoRoll = document.getElementById("ludo-roll");
const ludoGoal = document.getElementById("ludo-goal");
const ludoTrack = document.getElementById("ludo-track");

let selectedGame = "heart-hoops";
let session = loadSession();
let currentRoom = null;
let roomRoster = [];
let currentPlayers = [];
let currentMoves = [];
let pollTimer = null;
let heartbeatTimer = null;
let renderTimer = null;

apiDisplay.textContent = API_BASE.replace(/^https?:\/\//, "");
ludoGoal.textContent = String(LUDO_TRACK_LENGTH);
ensureLocalSessionId();
if (session.nickname) playerNameInput.value = session.nickname;
if (session.roomCode) joinCodeInput.value = session.roomCode;

function loadSession() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {}; } catch { return {}; } }
function saveSession() { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); updateResumeCard(); }
function ensureLocalSessionId() { if (!session.localSessionId) { session.localSessionId = randomId(10); saveSession(); } }
function clearRoomSession() { session = { nickname: playerNameInput.value.trim() || session.nickname || "", localSessionId: session.localSessionId || randomId(10) }; saveSession(); }
function randomId(length = 10) { return Math.random().toString(36).slice(2, 2 + length); }
function randomFrom(items) { return items[Math.floor(Math.random() * items.length)]; }
function normalizeGameId(gameId) { const candidate = legacyGameMap[gameId] || gameId; return games[candidate] ? candidate : "heart-hoops"; }
function roundId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function parseTimestamp(value) { if (!value) return null; const normalized = String(value).includes("T") ? String(value) : String(value).replace(" ", "T") + "Z"; const time = Date.parse(normalized); return Number.isNaN(time) ? null : time; }
function latestPresenceMove(playerId) { return currentMoves.find((move) => move.player_id === playerId && PRESENCE_TYPES.includes(move.move_type)); }
function isPlayerFresh(player) { const lastSeen = player?.last_seen_at || player?.lastSeenAt; const timestamp = parseTimestamp(lastSeen); return timestamp ? (Date.now() - timestamp <= PLAYER_STALE_MS) : true; }
function isPlayerConnected(player) {
  const latest = latestPresenceMove(player.id);
  if (latest?.move_type === "player_leave") return false;
  if (latest?.move_type === "player_join" || latest?.move_type === "player_online") return isPlayerFresh(player);
  return isPlayerFresh(player);
}
function effectiveHostId() {
  if (!currentRoom) return null;
  const serverHostActive = roomRoster.find((player) => player.id === currentRoom.hostPlayerId && player.active);
  return serverHostActive?.id || roomRoster.find((player) => player.active)?.id || currentRoom.hostPlayerId || null;
}
function isHost() { return Boolean(session.playerId && effectiveHostId() === session.playerId); }
function roomState() { return currentRoom?.state || {}; }
function playerById(id) { return roomRoster.find((player) => player.id === id); }
function playerName(id) { return playerById(id)?.nickname || "Player"; }
function pairState() { if (currentPlayers.length === 2) return "ready"; if (currentPlayers.length > 2) return "overfull"; return "waiting"; }
function pairReady() { return pairState() === "ready"; }
function pairMessage() { if (pairState() === "ready") return "Both players connected. Cabinet unlocked."; if (pairState() === "overfull") return "This room supports exactly 2 connected players. Too many are active."; return "Waiting for both players to be connected before any game can start."; }
function currentTurnName(turnPlayerId) { return turnPlayerId ? `${playerName(turnPlayerId)}'s turn` : "Turn: waiting"; }
function otherPlayerId(id) { return currentPlayers.map((player) => player.id).find((playerId) => playerId !== id) || id; }
function getScore(state, playerId) { return Number(state?.scores?.[playerId] || 0); }
function ensurePairReady() { if (!pairReady()) { globalStatus.textContent = pairMessage(); return false; } return true; }
function setConnectionStatus(message) { [connectionStatus, dashboardConnection].forEach((node) => { if (node) node.textContent = message; }); }
function showView(viewName) { authView.classList.toggle("active", viewName === "auth"); arcadeView.classList.toggle("active", viewName === "arcade"); }
function updateResumeCard() { resumeRoomDisplay.textContent = session.roomCode || "None"; resumeRoomButton.disabled = !session.roomCode; }
function baseGameState(gameId) { return { selectedGame: normalizeGameId(gameId), phase: "lobby", roundId: null, scores: {}, turnPlayerId: null, currentBend: null, stepIndex: 0, runIndex: 0, progress: {}, board: null, goAt: null, winnerId: null, phaseStartAt: null, shotsTaken: 0, message: null, marks: {}, winningLine: [], draw: false, positions: {}, lastRoll: null, rowIndex: 0 }; }
function findWinningLine(board) { for (const line of WIN_LINES) { const [a, b, c] = line; if (board[a] && board[a] === board[b] && board[a] === board[c]) return line; } return null; }
function buildRoster(players) {
  return (players || []).map((player) => ({ ...player, active: isPlayerConnected(player) })).sort((a, b) => Number(b.active) - Number(a.active));
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { ok: false, error: text || "Invalid JSON response" }; }
  if (!response.ok || (data && data.ok === false)) throw new Error(data?.error || `Request failed with ${response.status}`);
  return data;
}

async function sendPresenceSignal(moveType, keepalive = false) {
  if (!session.roomCode || !session.playerId) return;
  const payload = { roomCode: session.roomCode, playerId: session.playerId, moveType, payload: { localSessionId: session.localSessionId, nickname: session.nickname || playerNameInput.value.trim() || "Player" } };
  const body = JSON.stringify(payload);
  if (keepalive) {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(`${API_BASE}/api/move`, blob);
      return;
    }
    fetch(`${API_BASE}/api/move`, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    return;
  }
  await api("/api/move", { method: "POST", body });
}

async function createRoom() {
  const nickname = playerNameInput.value.trim();
  if (!nickname) { setupStatus.textContent = "Enter your name first so your priye knows who created the room."; return; }
  session.nickname = nickname;
  saveSession();
  setupStatus.textContent = "Creating room on Val Town...";
  const data = await api("/api/create-room", { method: "POST", body: JSON.stringify({ nickname, gameType: selectedGame, initialState: baseGameState(selectedGame) }) });
  session.roomCode = data.roomCode;
  session.playerId = data.playerId;
  saveSession();
  joinCodeInput.value = data.roomCode;
  showView("arcade");
  setConnectionStatus("Syncing");
  await refreshState();
  await sendPresenceSignal("player_join");
  await refreshState();
  startHeartbeat();
  startPolling();
}

async function joinRoom() {
  const nickname = playerNameInput.value.trim();
  const roomCode = joinCodeInput.value.trim().toUpperCase();
  if (!nickname || !roomCode) { setupStatus.textContent = "Enter your name and the room code to join."; return; }
  session.nickname = nickname;
  saveSession();
  setupStatus.textContent = "Joining room...";
  const data = await api("/api/join-room", { method: "POST", body: JSON.stringify({ roomCode, nickname }) });
  session.roomCode = data.roomCode;
  session.playerId = data.playerId;
  saveSession();
  showView("arcade");
  setConnectionStatus("Syncing");
  await refreshState();
  await sendPresenceSignal("player_join");
  await refreshState();
  startHeartbeat();
  startPolling();
}

async function resumeRoom() {
  if (!session.roomCode || !session.playerId) return;
  try {
    showView("arcade");
    setConnectionStatus("Syncing");
    await refreshState();
    await sendPresenceSignal("player_online");
    await refreshState();
    startHeartbeat();
    startPolling();
  } catch (error) {
    clearRoomSession();
    showView("auth");
    setConnectionStatus("Resume failed");
    setupStatus.textContent = error.message;
  }
}

async function sendHeartbeat() {
  if (!session.roomCode || !session.playerId || document.visibilityState === "hidden") return;
  try {
    await api("/api/heartbeat", { method: "POST", body: JSON.stringify({ playerId: session.playerId }) });
  } catch {}
}
function startHeartbeat() {
  stopHeartbeat();
  if (!session.roomCode || !session.playerId) return;
  sendHeartbeat();
  heartbeatTimer = window.setInterval(() => {
    sendHeartbeat();
  }, HEARTBEAT_MS);
}
function stopHeartbeat() { if (heartbeatTimer) { window.clearInterval(heartbeatTimer); heartbeatTimer = null; } }
function startPolling() {
  stopPolling();
  pollTimer = window.setInterval(async () => {
    try { await refreshState(); } catch (error) { setConnectionStatus("Sync error"); globalStatus.textContent = error.message; }
  }, POLL_MS);
}
function stopPolling() { if (pollTimer) { window.clearInterval(pollTimer); pollTimer = null; } }
function resetPresenceTimers() { stopPolling(); stopHeartbeat(); }

async function refreshState() {
  if (!session.roomCode) { render(); return; }
  const data = await api(`/api/state?roomCode=${encodeURIComponent(session.roomCode)}`, { method: "GET" });
  currentRoom = data.room;
  currentRoom.state = data.room.state || {};
  currentRoom.hostPlayerId = data.room.hostPlayerId || data.room.host_player_id;
  currentMoves = data.moves || [];
  roomRoster = buildRoster(data.players || []);
  currentPlayers = roomRoster.filter((player) => player.active);
  selectedGame = normalizeGameId(roomState().selectedGame || currentRoom.gameType || selectedGame);
  setConnectionStatus("Connected");
  showView("arcade");
  render();
}

async function sendMove(moveType, payload = {}, nextState = null) {
  if (!session.roomCode || !session.playerId) throw new Error("Join a room first.");
  await api("/api/move", { method: "POST", body: JSON.stringify({ roomCode: session.roomCode, playerId: session.playerId, moveType, payload, ...(nextState ? { nextState } : {}) }) });
  await refreshState();
}
async function setRoomState(nextState, moveType = "state_update", payload = {}) { await sendMove(moveType, payload, nextState); }

async function leaveRoom(manual = true) {
  if (session.roomCode && session.playerId) sendPresenceSignal("player_leave", manual).catch(() => {});
  resetPresenceTimers();
  currentRoom = null;
  roomRoster = [];
  currentPlayers = [];
  currentMoves = [];
  clearRoomSession();
  setConnectionStatus("Not connected");
  showView("auth");
  render();
}

function renderPlayers() {
  if (!roomRoster.length) { playersList.innerHTML = '<p class="empty-copy">No room joined yet.</p>'; return; }
  const hostId = effectiveHostId();
  playersList.innerHTML = roomRoster.map((player) => {
    const status = player.active ? "Connected" : "Offline";
    const role = player.id === hostId ? "Host" : "Player";
    return `<div class="player-chip ${player.active ? "" : "offline"}"><span>${player.nickname}<small> ${status}</small></span><em>${role}</em></div>`;
  }).join("");
}

function updateCartridgeSelection() {
  selectedGame = normalizeGameId(selectedGame);
  cartridgeButtons.forEach((button) => button.classList.toggle("active", button.dataset.game === selectedGame));
  const game = games[selectedGame];
  stageTitle.textContent = game.title;
  stageSubtitle.textContent = game.subtitle;
  document.querySelectorAll(".game-screen").forEach((screen) => screen.classList.toggle("active", screen.id === `game-${selectedGame}`));
}

function renderRoomHud() {
  roomCodeDisplay.textContent = session.roomCode || "-----";
  playerRoleDisplay.textContent = isHost() ? "Host" : session.roomCode ? "Player" : "Guest";
  hostDisplay.textContent = effectiveHostId() ? playerName(effectiveHostId()) : "Unknown";
  playerCountDisplay.textContent = String(currentPlayers.length || 0);
  pairStatusDisplay.textContent = pairState() === "ready" ? "Ready" : pairState() === "overfull" ? "Overfull" : "Waiting";
  setupStatus.textContent = session.roomCode ? `Session ${session.roomCode} is ready to resume.` : "Start by creating a room or entering your priye's room code.";
}
function renderPairBanner() { pairBanner.textContent = pairMessage(); pairBanner.className = `pair-banner ${pairState()}`; }
function renderHostControls() { document.querySelectorAll(".host-actions").forEach((group) => { group.style.display = isHost() ? "grid" : "none"; }); }

function renderHeartHoops() {
  const state = roomState();
  const [a, b] = currentPlayers;
  hoopsPlayerA.textContent = a?.nickname || "Player A";
  hoopsPlayerB.textContent = b?.nickname || "Player B";
  hoopsScoreA.textContent = String(getScore(state, a?.id));
  hoopsScoreB.textContent = String(getScore(state, b?.id));
  hoopsTurn.textContent = currentTurnName(state.turnPlayerId);
  if (!pairReady()) { hoopsStatus.textContent = pairMessage(); hoopsStartButton.disabled = !isHost(); hoopsShootButton.disabled = true; hoopsMeter.style.width = "0%"; hoopsBall.style.transform = "translate3d(0, 0, 0)"; return; }
  const phaseStartAt = state.phaseStartAt || Date.now();
  const cycle = ((Date.now() - phaseStartAt) % 1400) / 1400;
  const meter = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
  hoopsMeter.style.width = `${Math.round(meter * 100)}%`;
  hoopsBall.style.transform = `translate3d(${meter * 180}px, ${-Math.sin(meter * Math.PI) * 24}px, 0)`;
  if (!state.roundId) hoopsStatus.textContent = "Host starts the shootout. Each player gets 5 shots.";
  else if (state.phase === "finished") { const aScore = getScore(state, a?.id); const bScore = getScore(state, b?.id); hoopsStatus.textContent = aScore === bScore ? "Tie game. Both hearts shoot smooth." : `${aScore > bScore ? a?.nickname : b?.nickname} wins the shootout.`; }
  else hoopsStatus.textContent = state.message || "Tap near the sweet spot for a clean bucket.";
  hoopsStartButton.disabled = !isHost() || !pairReady();
  hoopsShootButton.disabled = !pairReady() || state.turnPlayerId !== session.playerId || state.phase === "finished" || !state.roundId;
}

function renderDriftToYou() {
  const state = roomState();
  const [a, b] = currentPlayers;
  driftPlayerA.textContent = a?.nickname || "Player A";
  driftPlayerB.textContent = b?.nickname || "Player B";
  driftScoreA.textContent = String(getScore(state, a?.id));
  driftScoreB.textContent = String(getScore(state, b?.id));
  driftTurn.textContent = currentTurnName(state.turnPlayerId);
  driftArrow.textContent = state.currentBend || "?";
  if (!pairReady()) { driftStatus.textContent = pairMessage(); driftStartButton.disabled = !isHost(); driftLeftButton.disabled = true; driftRightButton.disabled = true; return; }
  if (!state.roundId) driftStatus.textContent = "Host starts the drift run. Correct bends grow your distance.";
  else if (state.phase === "finished") { const aScore = getScore(state, a?.id); const bScore = getScore(state, b?.id); driftStatus.textContent = aScore === bScore ? "Tie run. Both drivers stayed cool." : `${aScore > bScore ? a?.nickname : b?.nickname} drifted farther.`; }
  else driftStatus.textContent = state.message || "Choose the correct bend before the run ends.";
  const canChoose = pairReady() && state.turnPlayerId === session.playerId && state.phase === "live" && state.roundId;
  driftStartButton.disabled = !isHost() || !pairReady();
  driftLeftButton.disabled = !canChoose;
  driftRightButton.disabled = !canChoose;
}

function renderLoveDrop() {
  const state = roomState();
  const [a, b] = currentPlayers;
  dropPlayerA.textContent = a?.nickname || "Player A";
  dropPlayerB.textContent = b?.nickname || "Player B";
  dropScoreA.textContent = String(getScore(state, a?.id));
  dropScoreB.textContent = String(getScore(state, b?.id));
  dropTurn.textContent = currentTurnName(state.turnPlayerId);
  if (!pairReady()) { dropStatus.textContent = pairMessage(); dropStartButton.disabled = !isHost(); dropLaneButtons.forEach((button) => { button.disabled = true; }); dropBoard.innerHTML = ""; return; }
  if (!state.roundId) dropStatus.textContent = "Host drops both players into the lane board.";
  else if (state.phase === "finished") { const aScore = getScore(state, a?.id); const bScore = getScore(state, b?.id); dropStatus.textContent = aScore === bScore ? "Tie stack. Both runs stayed balanced." : `${aScore > bScore ? a?.nickname : b?.nickname} built the better stack.`; }
  else dropStatus.textContent = state.message || "Choose the best lane on each row.";
  dropBoard.innerHTML = "";
  const rows = state.board || [];
  const progress = state.progress || {};
  rows.forEach((row, rowIndex) => {
    const rowElement = document.createElement("div");
    rowElement.className = "drop-row";
    row.forEach((cell) => {
      const tile = document.createElement("div");
      const revealedRow = rowIndex < Number(progress[session.playerId] || 0);
      tile.className = `drop-cell ${revealedRow ? `revealed ${cell}` : ""}`;
      tile.textContent = revealedRow ? cell.toUpperCase() : "?";
      rowElement.appendChild(tile);
    });
    dropBoard.appendChild(rowElement);
  });
  const canPick = pairReady() && state.turnPlayerId === session.playerId && state.phase === "live" && state.roundId;
  dropStartButton.disabled = !isHost() || !pairReady();
  dropLaneButtons.forEach((button) => { button.disabled = !canPick; });
}

function renderGlowDuel() {
  const state = roomState();
  const winnerId = state.winnerId || null;
  const msUntilGo = state.goAt ? state.goAt - Date.now() : null;
  if (!pairReady()) { glowCountdown.textContent = "WAIT"; glowStatus.textContent = pairMessage(); glowStartButton.disabled = !isHost(); glowClaimButton.disabled = true; return; }
  glowStartButton.disabled = !isHost() || !pairReady();
  if (!state.goAt) { glowCountdown.textContent = "READY"; glowStatus.textContent = "Charge the duel and wait for GO."; glowClaimButton.disabled = true; return; }
  if (winnerId) { glowCountdown.textContent = "WIN"; glowStatus.textContent = `${playerName(winnerId)} grabbed the glow first.`; glowClaimButton.disabled = true; return; }
  if (msUntilGo > 0) { glowCountdown.textContent = String(Math.ceil(msUntilGo / 1000)); glowStatus.textContent = "Hold steady. The first valid tap wins."; glowClaimButton.disabled = true; return; }
  glowCountdown.textContent = "GO";
  glowStatus.textContent = "Tap now. Fastest move reaches the room first.";
  glowClaimButton.disabled = !pairReady() || state.phase === "finished";
}

function renderLoveTicTacToe() {
  const state = roomState();
  const [a, b] = currentPlayers;
  const marks = state.marks || {};
  const winningLine = state.winningLine || [];
  const board = Array.isArray(state.board) ? state.board : Array(9).fill("");
  tttPlayerA.textContent = a?.nickname || "Player A";
  tttPlayerB.textContent = b?.nickname || "Player B";
  tttMarkA.textContent = a?.id ? (marks[a.id] || "X") : "X";
  tttMarkB.textContent = b?.id ? (marks[b.id] || "O") : "O";
  tttTurn.textContent = currentTurnName(state.turnPlayerId);
  if (!pairReady()) { tttStatus.textContent = pairMessage(); tttStartButton.disabled = !isHost(); tttBoard.innerHTML = ""; return; }
  if (!state.roundId) tttStatus.textContent = "Host starts the grid. Three in a row wins the round.";
  else if (state.winnerId) tttStatus.textContent = `${playerName(state.winnerId)} took the grid.`;
  else if (state.draw) tttStatus.textContent = "Draw round. Hit start to run it back.";
  else tttStatus.textContent = state.message || "Choose an empty tile and set up the winning line.";
  tttStartButton.disabled = !isHost() || !pairReady();
  tttBoard.innerHTML = "";
  board.forEach((value, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `ttt-cell ${value ? `mark-${value.toLowerCase()}` : ""} ${winningLine.includes(index) ? "win" : ""}`.trim();
    button.textContent = value || "";
    button.disabled = !(pairReady() && state.roundId && state.phase === "live" && !state.winnerId && !state.draw && state.turnPlayerId === session.playerId && !value);
    button.addEventListener("click", () => handleTttMove(index));
    tttBoard.appendChild(button);
  });
}

function renderLudoLove() {
  const state = roomState();
  const [a, b] = currentPlayers;
  const positions = state.positions || {};
  ludoPlayerA.textContent = a?.nickname || "Player A";
  ludoPlayerB.textContent = b?.nickname || "Player B";
  ludoPosA.textContent = String(Number(positions[a?.id] || 0));
  ludoPosB.textContent = String(Number(positions[b?.id] || 0));
  ludoRoll.textContent = state.lastRoll ? String(state.lastRoll) : "-";
  ludoTurn.textContent = currentTurnName(state.turnPlayerId);
  if (!pairReady()) { ludoStatus.textContent = pairMessage(); ludoStartButton.disabled = !isHost(); ludoRollButton.disabled = true; ludoTrack.innerHTML = ""; return; }
  if (!state.roundId) ludoStatus.textContent = "Host starts the race. First to tile 18 wins.";
  else if (state.winnerId) ludoStatus.textContent = `${playerName(state.winnerId)} reached the final heart tile.`;
  else ludoStatus.textContent = state.message || "Roll and move. Boost tiles help, trap tiles hurt.";
  ludoStartButton.disabled = !isHost() || !pairReady();
  ludoRollButton.disabled = !pairReady() || state.turnPlayerId !== session.playerId || state.phase !== "live" || !state.roundId || Boolean(state.winnerId);
  ludoTrack.innerHTML = "";
  for (let index = 1; index <= LUDO_TRACK_LENGTH; index += 1) {
    const special = LUDO_SPECIALS[index];
    const cell = document.createElement("div");
    cell.className = `ludo-cell ${special?.type || ""} ${index === LUDO_TRACK_LENGTH ? "goal" : ""}`.trim();
    const tokens = [];
    if (a?.id && Number(positions[a.id] || 0) === index) tokens.push('<span class="ludo-token a"></span>');
    if (b?.id && Number(positions[b.id] || 0) === index) tokens.push('<span class="ludo-token b"></span>');
    cell.innerHTML = `<span class="ludo-cell-index">${index}</span><span class="ludo-cell-tag">${index === LUDO_TRACK_LENGTH ? "goal" : (special?.label || "run")}</span><div class="ludo-token-stack">${tokens.join("")}</div>`;
    ludoTrack.appendChild(cell);
  }
}

function render() {
  updateResumeCard();
  renderRoomHud();
  renderPairBanner();
  renderPlayers();
  renderHostControls();
  globalStatus.textContent = session.roomCode ? `Room ${session.roomCode} is live. ${pairMessage()}` : "Create or join a room to start a proper multiplayer session.";
  updateCartridgeSelection();
  renderHeartHoops();
  renderDriftToYou();
  renderLoveDrop();
  renderGlowDuel();
  renderLoveTicTacToe();
  renderLudoLove();
  if (!session.roomCode) showView("auth");
}

function switchGame(gameId) {
  selectedGame = normalizeGameId(gameId);
  updateCartridgeSelection();
  if (session.roomCode && isHost()) setRoomState(baseGameState(selectedGame), "select_game", { gameId: selectedGame }).catch((error) => { globalStatus.textContent = error.message; });
}

cartridgeButtons.forEach((button) => button.addEventListener("click", () => switchGame(button.dataset.game)));
randomGameButton.addEventListener("click", () => switchGame(randomFrom(Object.keys(games))));
createRoomButton.addEventListener("click", async () => { try { await createRoom(); } catch (error) { setConnectionStatus("Create failed"); setupStatus.textContent = error.message; showView("auth"); } });
joinRoomButton.addEventListener("click", async () => { try { await joinRoom(); } catch (error) { setConnectionStatus("Join failed"); setupStatus.textContent = error.message; showView("auth"); } });
resumeRoomButton.addEventListener("click", () => { resumeRoom(); });
leaveRoomButton.addEventListener("click", () => { leaveRoom(true); });
copyRoomButton.addEventListener("click", async () => {
  if (!session.roomCode) return;
  try { await navigator.clipboard.writeText(session.roomCode); globalStatus.textContent = `Room code ${session.roomCode} copied.`; } catch { globalStatus.textContent = `Room code: ${session.roomCode}`; }
});

hoopsStartButton.addEventListener("click", async () => {
  if (!isHost() || !ensurePairReady()) return;
  const [firstPlayer] = currentPlayers;
  await setRoomState({ ...baseGameState("heart-hoops"), phase: "live", roundId: roundId(), turnPlayerId: firstPlayer?.id || null, phaseStartAt: Date.now(), message: `${playerName(firstPlayer?.id)} shoots first.` }, "hoops_start");
});
hoopsShootButton.addEventListener("click", async () => {
  const state = roomState();
  if (!ensurePairReady() || state.turnPlayerId !== session.playerId || !state.roundId || state.phase === "finished") return;
  const cycle = ((Date.now() - state.phaseStartAt) % 1400) / 1400;
  const meter = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
  const success = meter >= 0.42 && meter <= 0.58;
  const scores = { ...(state.scores || {}) };
  scores[session.playerId] = Number(scores[session.playerId] || 0) + (success ? 1 : 0);
  const shotsTaken = Number(state.shotsTaken || 0) + 1;
  const nextTurnPlayerId = otherPlayerId(session.playerId);
  const finished = shotsTaken >= 10;
  await setRoomState({ ...state, scores, shotsTaken, turnPlayerId: finished ? null : nextTurnPlayerId, phaseStartAt: Date.now(), phase: finished ? "finished" : "live", message: success ? `${playerName(session.playerId)} scored clean.` : `${playerName(session.playerId)} missed. ${playerName(nextTurnPlayerId)} is up.` }, "hoops_shot", { success });
});

driftStartButton.addEventListener("click", async () => {
  if (!isHost() || !ensurePairReady()) return;
  const [firstPlayer] = currentPlayers;
  await setRoomState({ ...baseGameState("drift-to-you"), phase: "live", roundId: roundId(), turnPlayerId: firstPlayer?.id || null, currentBend: DRIFT_SEQUENCE[0], message: `${playerName(firstPlayer?.id)} starts the run.` }, "drift_start");
});
async function handleDriftChoice(choice) {
  const state = roomState();
  if (!ensurePairReady() || state.turnPlayerId !== session.playerId || !state.roundId || state.phase === "finished") return;
  const expected = DRIFT_SEQUENCE[state.stepIndex] || DRIFT_SEQUENCE[0];
  const scores = { ...(state.scores || {}) };
  scores[session.playerId] = Number(scores[session.playerId] || 0);
  let nextState = { ...state };
  if (choice === expected) {
    scores[session.playerId] += 1;
    const nextStep = state.stepIndex + 1;
    if (nextStep >= DRIFT_SEQUENCE.length) {
      if (state.runIndex >= 1) nextState = { ...state, scores, phase: "finished", turnPlayerId: null, currentBend: null, message: `${playerName(session.playerId)} completed the final bend.` };
      else { const nextPlayerId = otherPlayerId(session.playerId); nextState = { ...state, scores, turnPlayerId: nextPlayerId, runIndex: 1, stepIndex: 0, currentBend: DRIFT_SEQUENCE[0], message: `${playerName(session.playerId)} finished the run. ${playerName(nextPlayerId)} now drifts.` }; }
    } else nextState = { ...state, scores, stepIndex: nextStep, currentBend: DRIFT_SEQUENCE[nextStep], message: `${playerName(session.playerId)} nailed the bend.` };
  } else if (state.runIndex >= 1) nextState = { ...state, scores, phase: "finished", turnPlayerId: null, message: `${playerName(session.playerId)} crashed out.` };
  else { const nextPlayerId = otherPlayerId(session.playerId); nextState = { ...state, scores, turnPlayerId: nextPlayerId, runIndex: 1, stepIndex: 0, currentBend: DRIFT_SEQUENCE[0], message: `${playerName(session.playerId)} crashed. ${playerName(nextPlayerId)} now drifts.` }; }
  await setRoomState(nextState, "drift_choice", { choice });
}
driftLeftButton.addEventListener("click", () => handleDriftChoice("LEFT"));
driftRightButton.addEventListener("click", () => handleDriftChoice("RIGHT"));

dropStartButton.addEventListener("click", async () => {
  if (!isHost() || !ensurePairReady()) return;
  const [firstPlayer] = currentPlayers;
  await setRoomState({ ...baseGameState("love-drop"), phase: "live", roundId: roundId(), turnPlayerId: firstPlayer?.id || null, board: DROP_ROWS, message: `${playerName(firstPlayer?.id)} chooses the first lane.` }, "drop_start");
});
async function handleDropLane(laneIndex) {
  const state = roomState();
  if (!ensurePairReady() || state.turnPlayerId !== session.playerId || !state.roundId || state.phase === "finished") return;
  const rowIndex = Number(state.rowIndex || 0);
  const board = state.board || DROP_ROWS;
  const tile = board[rowIndex][laneIndex];
  const scores = { ...(state.scores || {}) };
  const progress = { ...(state.progress || {}) };
  scores[session.playerId] = Number(scores[session.playerId] || 0);
  if (tile === "heart") scores[session.playerId] += 1;
  if (tile === "boost") scores[session.playerId] += 2;
  if (tile === "trap") scores[session.playerId] -= 1;
  progress[session.playerId] = rowIndex + 1;
  const nextRow = rowIndex + 1;
  let nextState = { ...state, board, scores, progress };
  if (nextRow >= board.length) {
    if (state.runIndex >= 1) nextState = { ...nextState, phase: "finished", turnPlayerId: null, rowIndex: nextRow, message: `${playerName(session.playerId)} completed the final drop.` };
    else { const nextPlayerId = otherPlayerId(session.playerId); nextState = { ...nextState, turnPlayerId: nextPlayerId, rowIndex: 0, runIndex: 1, message: `${playerName(session.playerId)} finished the board. ${playerName(nextPlayerId)} drops next.` }; }
  } else nextState = { ...nextState, rowIndex: nextRow, message: `${playerName(session.playerId)} picked ${tile.toUpperCase()}.` };
  await setRoomState(nextState, "drop_pick", { laneIndex, tile });
}
dropLaneButtons.forEach((button, index) => button.addEventListener("click", () => handleDropLane(index)));

glowStartButton.addEventListener("click", async () => {
  if (!isHost() || !ensurePairReady()) return;
  await setRoomState({ ...baseGameState("glow-duel"), phase: "live", roundId: roundId(), goAt: Date.now() + 3500, message: "Reactor charging." }, "glow_start");
});
glowClaimButton.addEventListener("click", async () => {
  const state = roomState();
  if (!ensurePairReady() || !state.goAt || Date.now() < state.goAt || state.phase === "finished") return;
  await setRoomState({ ...state, winnerId: session.playerId, phase: "finished", message: `${playerName(session.playerId)} grabbed the glow first.` }, "glow_claim");
});

tttStartButton.addEventListener("click", async () => {
  if (!isHost() || !ensurePairReady()) return;
  const [firstPlayer, secondPlayer] = currentPlayers;
  await setRoomState({ ...baseGameState("love-tic-tac-toe"), phase: "live", roundId: roundId(), board: Array(9).fill(""), marks: { [firstPlayer?.id || "a"]: "X", [secondPlayer?.id || "b"]: "O" }, turnPlayerId: firstPlayer?.id || null, message: `${playerName(firstPlayer?.id)} opens the love grid.` }, "ttt_start");
});
async function handleTttMove(index) {
  const state = roomState();
  const board = Array.isArray(state.board) ? [...state.board] : Array(9).fill("");
  const marks = state.marks || {};
  if (!ensurePairReady() || state.turnPlayerId !== session.playerId || !state.roundId || state.phase !== "live" || board[index]) return;
  const mark = marks[session.playerId] || (state.turnPlayerId === currentPlayers[0]?.id ? "X" : "O");
  board[index] = mark;
  const winningLine = findWinningLine(board);
  if (winningLine) { await setRoomState({ ...state, board, winningLine, winnerId: session.playerId, turnPlayerId: null, phase: "finished", message: `${playerName(session.playerId)} completed the winning line.` }, "ttt_move", { index, mark }); return; }
  if (board.every(Boolean)) { await setRoomState({ ...state, board, draw: true, turnPlayerId: null, phase: "finished", message: "The grid is full. Draw round." }, "ttt_move", { index, mark }); return; }
  const nextPlayerId = otherPlayerId(session.playerId);
  await setRoomState({ ...state, board, turnPlayerId: nextPlayerId, message: `${playerName(session.playerId)} placed ${mark}. ${playerName(nextPlayerId)} is up.` }, "ttt_move", { index, mark });
}

ludoStartButton.addEventListener("click", async () => {
  if (!isHost() || !ensurePairReady()) return;
  const [firstPlayer, secondPlayer] = currentPlayers;
  await setRoomState({ ...baseGameState("ludo-love"), phase: "live", roundId: roundId(), turnPlayerId: firstPlayer?.id || null, positions: { [firstPlayer?.id || "a"]: 0, [secondPlayer?.id || "b"]: 0 }, message: `${playerName(firstPlayer?.id)} rolls first.` }, "ludo_start");
});
ludoRollButton.addEventListener("click", async () => {
  const state = roomState();
  if (!ensurePairReady() || state.turnPlayerId !== session.playerId || !state.roundId || state.phase !== "live" || state.winnerId) return;
  const roll = Math.floor(Math.random() * 6) + 1;
  const positions = { ...(state.positions || {}) };
  let nextPosition = Math.min(LUDO_TRACK_LENGTH, Number(positions[session.playerId] || 0) + roll);
  const special = LUDO_SPECIALS[nextPosition];
  let message = `${playerName(session.playerId)} rolled ${roll}.`;
  if (special && nextPosition < LUDO_TRACK_LENGTH) { nextPosition = Math.max(0, Math.min(LUDO_TRACK_LENGTH, nextPosition + special.delta)); message = `${playerName(session.playerId)} rolled ${roll} and hit a ${special.type} tile ${special.label}.`; }
  positions[session.playerId] = nextPosition;
  if (nextPosition >= LUDO_TRACK_LENGTH) { await setRoomState({ ...state, positions, lastRoll: roll, winnerId: session.playerId, turnPlayerId: null, phase: "finished", message: `${playerName(session.playerId)} crossed the finish tile.` }, "ludo_roll", { roll, position: nextPosition }); return; }
  const nextPlayerId = otherPlayerId(session.playerId);
  await setRoomState({ ...state, positions, lastRoll: roll, turnPlayerId: nextPlayerId, message: `${message} ${playerName(nextPlayerId)} rolls next.` }, "ludo_roll", { roll, position: nextPosition });
});

renderTimer = window.setInterval(() => { renderHeartHoops(); renderGlowDuel(); }, 120);
window.addEventListener("beforeunload", () => { sendPresenceSignal("player_leave", true); resetPresenceTimers(); if (renderTimer) window.clearInterval(renderTimer); });
window.addEventListener("pagehide", () => { sendPresenceSignal("player_leave", true); resetPresenceTimers(); });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && session.roomCode) {
    startHeartbeat();
    sendPresenceSignal("player_online").catch(() => {});
    refreshState().catch(() => {});
  } else if (document.visibilityState === "hidden") {
    stopHeartbeat();
  }
});

render();
updateResumeCard();
if (session.roomCode) resumeRoom();
else showView("auth");
