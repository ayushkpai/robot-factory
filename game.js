/* ─────────────────────────────────────────────────────────────
   ROBOT FACTORY · Game logic
   Vanilla JS, no dependencies. Sound synth lives in audio.js.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  /* ── Data ─────────────────────────────────────────────── */

  const COLORS = [
    { id: "cyan", name: "CYAN", hex: "#2ee6ff", dark: "#0a7f96", glow: "rgba(46,230,255,.45)" },
    { id: "pink", name: "PINK", hex: "#ff4f9a", dark: "#a1144f", glow: "rgba(255,79,154,.45)" },
    { id: "lime", name: "LIME", hex: "#9dff3d", dark: "#4f9c09", glow: "rgba(157,255,61,.4)" },
    { id: "amber", name: "AMBER", hex: "#ffbe2e", dark: "#a87000", glow: "rgba(255,190,46,.42)" },
  ];

  const SHAPES = [
    { id: "circle", name: "CIRCLE" },
    { id: "square", name: "SQUARE" },
    { id: "triangle", name: "TRIANGLE" },
    { id: "diamond", name: "DIAMOND" },
  ];

  const TYPES = [
    { id: "scout", name: "SCOUT", icon: "bolt" },
    { id: "hauler", name: "HAULER", icon: "crate" },
    { id: "welder", name: "WELDER", icon: "flame" },
    { id: "tinker", name: "TINKER", icon: "gear" },
  ];

  const RULES = {
    color: { label: "COLOR", hint: "Match the robot’s body color to a machine.", icon: "droplet" },
    shape: { label: "SHAPE", hint: "Match the robot’s head shape to a machine.", icon: "shapes" },
    type: { label: "TYPE", hint: "Match the robot’s job type to a machine.", icon: "badge" },
  };

  const ICON_PATHS = {
    bolt: '<path fill="currentColor" d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
    crate:
      '<path fill="currentColor" fill-rule="evenodd" d="M3 6h18v13H3V6Zm2 2v9h14V8H5Zm2 2h3v2H7v-2Zm0 4h3v2H7v-2Zm5-4h5v6h-5v-6Z"/>',
    flame:
      '<path fill="currentColor" d="M12 2c1 4-4 5.5-4 10a4 4 0 0 0 8 0c0-2-.9-3.2-1.4-5 2 1 3.4 3.2 3.4 5.6a6 6 0 0 1-12 0C6 7.4 10 6.3 12 2Z"/>',
    gear:
      '<path fill="currentColor" fill-rule="evenodd" d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L15 3.5h-4L10.7 6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/>',
    droplet:
      '<path fill="currentColor" d="M12 2S5 10.2 5 14.4a7 7 0 0 0 14 0C19 10.2 12 2 12 2Zm0 17a4.5 4.5 0 0 1-4.5-4.5c0-2.1 2.8-6.7 4.5-9 1.7 2.3 4.5 6.9 4.5 9A4.5 4.5 0 0 1 12 19Z"/>',
    shapes:
      '<path fill="currentColor" d="M8 3a5.5 5.5 0 1 0 0 11A5.5 5.5 0 0 0 8 3Zm0 2.4a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2Zm8.2 4.5L22 19.6H10.4l5.8-9.7Zm0 4.1-1.7 2.8h3.4l-1.7-2.8Z"/>',
    badge:
      '<path fill="currentColor" fill-rule="evenodd" d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4h10v2H7V7Zm2 4h2v2H9v-2Zm4 0h2v2h-2v-2Zm-4 4h2v2H9v-2Zm4 0h2v2h-2v-2Z"/>',
  };

  const CONFIG = {
    duration: 45000,
    ruleEvery: 10000,
    maxBots: 5,
    baseCrossTime: 5.6,
    fastCrossTime: 2.75,
    spawnSpacing: 0.46,
  };

  const STORE_HIGH = "robotFactory.highScore.v1";
  const STORE_MUTE = "robotFactory.muted.v1";

  /* ── DOM ──────────────────────────────────────────────── */

  const $ = (selector, root = document) => root.querySelector(selector);

  const dom = {
    app: $("#app"),
    score: $("#score"),
    best: $("#best"),
    time: $("#time"),
    timerStat: $("#timerStat"),
    timerBar: $("#timerBar"),
    ruleBarSection: $("#ruleBar"),
    ruleIcon: $("#ruleIcon"),
    ruleName: $("#ruleName"),
    ruleHint: $("#ruleHint"),
    ruleClockLabel: $("#ruleClockLabel"),
    ruleClock: $("#ruleClock"),
    ruleFill: $("#ruleBarFill"),
    stage: $("#stage"),
    objectLayer: $("#objectLayer"),
    beltSurface: $("#beltSurface"),
    scanBeam: $("#scanBeam"),
    dropChute: $(".drop-chute"),
    comboPill: $("#comboPill"),
    comboText: $("#comboText"),
    comboPips: $("#comboPips"),
    stagePrompt: $("#stagePrompt"),
    announceLayer: $("#announceLayer"),
    effectLayer: $("#effectLayer"),
    screenFlash: $("#screenFlash"),
    machineRow: $("#machineRow"),
    muteBtn: $("#muteBtn"),
    startScreen: $("#startScreen"),
    gameOverScreen: $("#gameOverScreen"),
    startBtn: $("#startBtn"),
    replayBtn: $("#replayBtn"),
    menuBtn: $("#menuBtn"),
    menuBest: $("#menuBest"),
    finalScore: $("#finalScore"),
    finalCombo: $("#finalCombo"),
    finalAccuracy: $("#finalAccuracy"),
    finalSorted: $("#finalSorted"),
    finalMissed: $("#finalMissed"),
    newBest: $("#newBest"),
    finalBest: $("#finalBest"),
    overEyebrow: $("#overEyebrow"),
    overTitle: $("#overTitle"),
  };

  const sound = new SoundEngine();
  const machineButtons = [];
  const machineTimers = new WeakMap();

  const state = {
    phase: "menu",
    score: 0,
    highScore: readNumber(STORE_HIGH, 0),
    streak: 0,
    bestStreak: 0,
    multiplier: 1,
    sorted: 0,
    wrong: 0,
    missed: 0,
    elapsed: 0,
    duration: CONFIG.duration,
    rule: "color",
    rulePhase: 0,
    objects: [],
    nextId: 0,
    raf: 0,
    lastTs: 0,
    spawnTimer: 0,
    crossTime: CONFIG.baseCrossTime,
    beltDuration: "",
    activeId: null,
    lastSecond: -1,
    overlayTimer: 0,
    recordTimer: 0,
    muted: readNumber(STORE_MUTE, 0) === 1,
  };

  let metrics = { botW: 80, startX: 16, range: 400 };

  /* ── Boot ─────────────────────────────────────────────── */

  init();

  function init() {
    buildMachines();
    buildComboPips();
    updateMuteUI();
    state.muted = readNumber(STORE_MUTE, 0) === 1;
    sound.setMuted(state.muted);
    setRule("color", false, false);
    resetGame();
    dom.gameOverScreen.classList.add("is-hidden");
    dom.gameOverScreen.setAttribute("aria-hidden", "true");
    dom.menuBest.textContent = String(state.highScore);
    bindEvents();
    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measure();
        layoutBots();
      });
    }
    if ("ResizeObserver" in window) {
      new ResizeObserver(() => {
        measure();
        if (state.objects.length) layoutBots();
      }).observe(dom.stage);
    }
    window.addEventListener("resize", () => {
      measure();
      layoutBots();
    });
  }

  function bindEvents() {
    dom.startBtn.addEventListener("click", startGame);
    dom.replayBtn.addEventListener("click", startGame);
    dom.menuBtn.addEventListener("click", goMenu);
    dom.muteBtn.addEventListener("click", toggleMute);

    window.addEventListener("keydown", (event) => {
      if (event.repeat) return;
      if (event.key >= "1" && event.key <= "4") {
        if (state.phase === "playing") {
          event.preventDefault();
          pickMachine(Number(event.key) - 1);
        }
        return;
      }
      if (event.key === "Enter") {
        if (state.phase === "menu" || state.phase === "gameover") {
          event.preventDefault();
          startGame();
        }
        return;
      }
      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMute();
      }
    });
  }

  /* ── Build UI ─────────────────────────────────────────── */

  function buildMachines() {
    dom.machineRow.innerHTML = COLORS.map((color, index) => {
      const shape = SHAPES[index];
      const type = TYPES[index];
      return `
        <button type="button" class="machine" data-index="${index}"
          style="--mc:${color.hex};--mcd:${color.dark};--mglow:${color.glow}"
          aria-label="Sort into ${color.name} ${shape.name} ${type.name} machine">
          <span class="m-key">${index + 1}</span>
          <span class="m-antenna" aria-hidden="true"></span>
          <span class="m-face" aria-hidden="true"><i class="m-eye"></i><i class="m-eye"></i></span>
          <span class="m-hopper" aria-hidden="true">${shapeSvg(shape.id, "m-shape")}</span>
          <span class="m-name">${type.name}</span>
          <span class="m-color">${color.name}</span>
          <span class="m-glow" aria-hidden="true"></span>
        </button>`;
    }).join("");

    dom.machineRow.querySelectorAll(".machine").forEach((button) => {
      machineButtons.push(button);
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        pickMachine(Number(button.dataset.index));
      });
    });
  }

  function buildComboPips() {
    dom.comboPips.innerHTML = Array.from({ length: 5 }, () => "<i></i>").join("");
  }

  function iconSvg(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name] || ""}</svg>`;
  }

  function shapeSvg(shape, className = "") {
    const shapes = {
      circle: '<circle cx="24" cy="24" r="18"/>',
      square: '<rect x="7" y="7" width="34" height="34" rx="6"/>',
      triangle: '<path d="M24 4 45 42H3Z"/>',
      diamond: '<path d="M24 3 45 24 24 45 3 24Z"/>',
    };
    return `<svg class="${className}" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">${shapes[shape] || shapes.circle}</svg>`;
  }

  function botHeadSvg(shape) {
    const configs = {
      circle: {
        body: '<circle class="head-body" cx="50" cy="50" r="36"/>',
        shade: '<ellipse class="head-shade" cx="50" cy="32" rx="24" ry="13"/>',
        eyes: [[37, 46], [63, 46]],
        mouth: [43, 60],
        cheeks: [[19, 59], [81, 59]],
      },
      square: {
        body: '<rect class="head-body" x="14" y="13" width="72" height="72" rx="16"/>',
        shade: '<rect class="head-shade" x="22" y="20" width="56" height="18" rx="8"/>',
        eyes: [[38, 45], [62, 45]],
        mouth: [43, 58],
        cheeks: [[23, 72], [77, 72]],
      },
      triangle: {
        body: '<path class="head-body" d="M50 7 94 90H6Z"/>',
        shade: '<path class="head-shade" d="M50 7 68 38H32Z"/>',
        eyes: [[38, 59], [62, 59]],
        mouth: [43, 71],
        cheeks: [[36, 82], [64, 82]],
      },
      diamond: {
        body: '<path class="head-body" d="M50 5 95 50 50 95 5 50Z"/>',
        shade: '<path class="head-shade" d="M50 16 76 41H24Z"/>',
        eyes: [[37, 46], [63, 46]],
        mouth: [43, 59],
        cheeks: [[22, 61], [78, 61]],
      },
    };

    const config = configs[shape] || configs.circle;
    const eyes = config.eyes
      .map(
        ([x, y]) =>
          `<rect class="eye" x="${x - 4.5}" y="${y - 6}" width="9" height="12" rx="3"/>` +
          `<circle class="eye-glint" cx="${x - 1.5}" cy="${y - 2}" r="1.4"/>`
      )
      .join("");
    const cheeks = config.cheeks
      .map(([x, y]) => `<circle class="head-mark" cx="${x}" cy="${y}" r="2.7"/>`)
      .join("");

    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      ${config.body}${config.shade}${eyes}
      <rect class="mouth" x="${config.mouth[0]}" y="${config.mouth[1]}" width="14" height="4" rx="2"/>
      ${cheeks}
    </svg>`;
  }

  /* ── Game flow ────────────────────────────────────────── */

  function startGame() {
    if (state.phase === "playing") return;
    cancelAnimationFrame(state.raf);
    clearTimeout(state.overlayTimer);
    clearTimeout(state.recordTimer);
    state.overlayTimer = 0;
    state.recordTimer = 0;

    sound.ensure();
    resetGame();
    state.phase = "playing";
    state.lastTs = 0;
    state.elapsed = 0;
    state.lastSecond = -1;

    dom.startScreen.classList.add("is-hidden");
    dom.startScreen.setAttribute("aria-hidden", "true");
    dom.gameOverScreen.classList.add("is-hidden");
    dom.gameOverScreen.setAttribute("aria-hidden", "true");
    dom.stagePrompt.classList.remove("is-hidden");

    setRule("color", false, false);
    updateHUD();
    updateCombo();
    updateTimerDisplay();
    updateRuleClock();

    sound.start();
    announce("SHIFT START", "KEEP THE LINE MOVING", "start");
    spawnBot();
    state.spawnTimer = state.crossTime * CONFIG.spawnSpacing;
    state.raf = requestAnimationFrame(loop);
  }

  function resetGame() {
    cancelAnimationFrame(state.raf);
    state.raf = 0;
    state.phase = "menu";
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.multiplier = 1;
    state.sorted = 0;
    state.wrong = 0;
    state.missed = 0;
    state.elapsed = 0;
    state.rule = "color";
    state.rulePhase = 0;
    state.lastSecond = -1;
    state.activeId = null;
    state.spawnTimer = 0;
    state.crossTime = CONFIG.baseCrossTime;
    state.lastTs = 0;

    state.objects.forEach((bot) => bot.el.remove());
    state.objects = [];
    dom.objectLayer.replaceChildren();
    dom.effectLayer.replaceChildren();
    dom.announceLayer.replaceChildren();
    dom.scanBeam.classList.remove("is-live");
    dom.stagePrompt.classList.remove("is-hidden");
    dom.timerStat.classList.remove("urgent", "critical");
    machineButtons.forEach((button) => button.classList.remove("accept", "reject", "show-correct"));
    dom.beltSurface.style.setProperty("--belt-duration", "0.9s");
    state.beltDuration = "";

    updateHUD();
    updateCombo();
    updateTimerDisplay();
    updateRuleClock();
    dom.time.textContent = "45";
    dom.timerBar.style.width = "100%";
    dom.menuBest.textContent = String(state.highScore);
  }

  function goMenu() {
    clearTimeout(state.overlayTimer);
    clearTimeout(state.recordTimer);
    state.overlayTimer = 0;
    state.recordTimer = 0;
    sound.stopHum();
    resetGame();
    state.phase = "menu";
    dom.gameOverScreen.classList.add("is-hidden");
    dom.gameOverScreen.setAttribute("aria-hidden", "true");
    dom.startScreen.classList.remove("is-hidden");
    dom.startScreen.setAttribute("aria-hidden", "false");
    updateHUD();
  }

  function endGame() {
    if (state.phase !== "playing") return;
    state.phase = "gameover";
    cancelAnimationFrame(state.raf);
    state.raf = 0;
    state.lastTs = 0;

    dom.time.textContent = "0";
    dom.timerBar.style.width = "0%";
    dom.timerStat.classList.add("critical");
    dom.scanBeam.classList.remove("is-live");
    hideStagePrompt();
    state.objects.forEach((bot) => bot.el.classList.remove("is-active"));

    sound.gameOver();

    const isRecord = state.score > state.highScore;
    if (isRecord) {
      state.highScore = state.score;
      storeNumber(STORE_HIGH, state.highScore);
      state.recordTimer = setTimeout(() => sound.record(), 850);
    }
    updateHUD();
    dom.menuBest.textContent = String(state.highScore);
    dom.best.textContent = String(state.highScore);

    announce("SHIFT COMPLETE", "TIME IS UP", "bad");
    state.overlayTimer = setTimeout(() => showGameOver(isRecord), 650);
  }

  function showGameOver(isRecord) {
    state.overlayTimer = 0;
    const attempts = state.sorted + state.wrong + state.missed;
    const accuracy = attempts ? Math.round((state.sorted / attempts) * 100) : 0;

    dom.overEyebrow.textContent = isRecord ? "NEW FACTORY RECORD" : "SHIFT COMPLETE";
    dom.overTitle.textContent = isRecord ? "LINE RECORD!" : "LINE HALTED";
    dom.finalCombo.textContent = `×${multiplierFor(state.bestStreak)}`;
    dom.finalAccuracy.textContent = `${accuracy}%`;
    dom.finalSorted.textContent = String(state.sorted);
    dom.finalMissed.textContent = String(state.missed);
    dom.finalBest.textContent = String(state.highScore);
    dom.newBest.hidden = !isRecord;

    dom.gameOverScreen.classList.remove("is-hidden");
    dom.gameOverScreen.setAttribute("aria-hidden", "false");
    animateFinalScore();
  }

  function animateFinalScore() {
    const target = state.score;
    const startTime = performance.now();
    dom.finalScore.textContent = "0";
    function step(now) {
      if (state.phase !== "gameover") return;
      const t = Math.min(1, (now - startTime) / 720);
      const eased = 1 - Math.pow(1 - t, 3);
      dom.finalScore.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
      else dom.finalScore.textContent = String(target);
    }
    requestAnimationFrame(step);
  }

  /* ── Main loop ────────────────────────────────────────── */

  function loop(timestamp) {
    if (state.phase !== "playing") return;
    if (!state.lastTs) state.lastTs = timestamp;

    let dt = (timestamp - state.lastTs) / 1000;
    state.lastTs = timestamp;
    if (!Number.isFinite(dt) || dt <= 0) dt = 1 / 60;
    dt = Math.min(dt, 0.1);

    state.elapsed = Math.min(state.duration, state.elapsed + dt * 1000);
    const difficulty = state.elapsed / state.duration;
    state.crossTime =
      CONFIG.baseCrossTime -
      (CONFIG.baseCrossTime - CONFIG.fastCrossTime) * Math.pow(difficulty, 0.8);

    const phase = Math.min(4, Math.floor(state.elapsed / CONFIG.ruleEvery));
    if (phase > state.rulePhase) {
      state.rulePhase = phase;
      setRule(nextRule(), true, phase === 4);
    }

    updateTimerDisplay();
    updateRuleClock();

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      if (state.objects.length < CONFIG.maxBots) {
        spawnBot();
        state.spawnTimer = state.crossTime * CONFIG.spawnSpacing;
      } else {
        state.spawnTimer = 0.18;
      }
    }
    if (state.objects.length === 0 && state.spawnTimer > 0.18) {
      state.spawnTimer = 0.18;
    }

    for (const bot of [...state.objects]) {
      bot.p += dt / state.crossTime;
      if (bot.p >= 1) missBot(bot);
    }

    layoutBots();
    updateBelt();

    if (state.elapsed >= state.duration) {
      endGame();
      return;
    }
    state.raf = requestAnimationFrame(loop);
  }

  /* ── Spawning & movement ──────────────────────────────── */

  function spawnBot() {
    const colorIndex = randomInt(COLORS.length);
    const shapeIndex = randomInt(SHAPES.length);
    const typeIndex = randomInt(TYPES.length);

    const bot = {
      id: ++state.nextId,
      colorIndex,
      shapeIndex,
      typeIndex,
      color: COLORS[colorIndex],
      shape: SHAPES[shapeIndex],
      type: TYPES[typeIndex],
      p: 0,
      x: metrics.startX,
      el: null,
    };

    const el = document.createElement("div");
    el.className = "bot spawned";
    el.style.setProperty("--mc", bot.color.hex);
    el.style.setProperty("--mcd", bot.color.dark);
    el.style.setProperty("--mglow", bot.color.glow);
    el.dataset.id = String(bot.id);
    el.innerHTML = `
      <span class="bot-tag">SORT</span>
      <span class="bot-scan-ring" aria-hidden="true"></span>
      <div class="bot-rig">
        <span class="bot-antenna" aria-hidden="true"></span>
        <div class="bot-head">${botHeadSvg(bot.shape.id)}</div>
        <div class="bot-torso">
          <span class="bot-chest">${iconSvg(bot.type.icon)}<b>${bot.type.name}</b></span>
          <i class="bot-arm left" aria-hidden="true"></i>
          <i class="bot-arm right" aria-hidden="true"></i>
        </div>
        <div class="bot-legs" aria-hidden="true"><i></i><i></i></div>
      </div>`;

    bot.el = el;
    dom.objectLayer.appendChild(el);
    state.objects.push(bot);
    measure();
    el.style.transform = `translate3d(${metrics.startX}px, 0, 0)`;
  }

  function measure() {
    const layerWidth = dom.objectLayer.clientWidth;
    if (!layerWidth) return;
    const firstBot = dom.objectLayer.querySelector(".bot");
    const botWidth = firstBot ? firstBot.getBoundingClientRect().width : 80;
    const chuteWidth = dom.dropChute ? dom.dropChute.getBoundingClientRect().width : 50;
    const startX = Math.max(10, layerWidth * 0.015);
    const endX = layerWidth - chuteWidth - botWidth - Math.max(8, layerWidth * 0.012);
    metrics = {
      botW: botWidth,
      startX,
      range: Math.max(30, endX - startX),
    };
  }

  function layoutBots() {
    const active = getActiveBot();
    for (const bot of state.objects) {
      const x = metrics.startX + bot.p * metrics.range;
      bot.x = x;
      bot.el.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      bot.el.classList.toggle("is-active", bot === active);
    }
    state.activeId = active ? active.id : null;

    if (active) {
      dom.scanBeam.style.left = `${(active.x + metrics.botW / 2).toFixed(1)}px`;
      dom.scanBeam.classList.add("is-live");
    } else {
      dom.scanBeam.classList.remove("is-live");
    }
  }

  function updateBelt() {
    const next = Math.max(0.32, state.crossTime * 0.13).toFixed(2);
    if (next !== state.beltDuration) {
      state.beltDuration = next;
      dom.beltSurface.style.setProperty("--belt-duration", `${next}s`);
    }
  }

  function getActiveBot() {
    let active = null;
    for (const bot of state.objects) {
      if (!active || bot.p > active.p) active = bot;
    }
    return active;
  }

  /* ── Player action ────────────────────────────────────── */

  function pickMachine(index) {
    if (state.phase !== "playing") return;
    const active = getActiveBot();
    if (!active) {
      sound.click();
      return;
    }

    const expected = expectedMachine(active);
    if (expected === index) {
      const previousMultiplier = state.multiplier;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.multiplier = multiplierFor(state.streak);
      const gain = 10 * state.multiplier;
      state.score += gain;
      state.sorted += 1;

      updateHUD(true);
      updateCombo();
      finishCorrect(active, index, gain, previousMultiplier);
      sound.correct(state.multiplier);

      if (state.multiplier > previousMultiplier) {
        bumpComboPill();
        sound.comboUp(state.multiplier);
      }
    } else {
      state.streak = 0;
      state.multiplier = 1;
      state.wrong += 1;
      state.score = Math.max(0, state.score - 5);
      updateHUD(false);
      updateCombo();
      finishWrong(active, index, expected);
      sound.wrong();
      shakeStage();
      flashScreen();
    }

    hideStagePrompt();
  }

  function expectedMachine(bot) {
    if (state.rule === "color") return bot.colorIndex;
    if (state.rule === "shape") return bot.shapeIndex;
    return bot.typeIndex;
  }

  function removeFromField(bot) {
    const index = state.objects.indexOf(bot);
    if (index !== -1) state.objects.splice(index, 1);
    if (state.activeId === bot.id) state.activeId = null;
  }

  function finishCorrect(bot, machineIndex, gain, previousMultiplier) {
    const rect = bot.el.getBoundingClientRect();
    removeFromField(bot);
    createFlyClone(bot, rect, machineIndex);
    bot.el.remove();

    floatTextAtRect(rect, `+${gain}`, "good");
    if (state.multiplier > previousMultiplier) {
      floatTextAtRect(rect, `COMBO ×${state.multiplier}`, "combo", -44);
    }
    spawnSparks(rect.left + rect.width / 2, rect.top + rect.height * 0.45, bot.color.hex, 13);
    flashMachine(machineIndex, "accept");
  }

  function finishWrong(bot, chosenIndex, expectedIndex) {
    const rect = bot.el.getBoundingClientRect();
    removeFromField(bot);

    floatTextAtRect(rect, "−5", "bad");
    spawnSparks(rect.left + rect.width / 2, rect.top + rect.height * 0.45, "#ff4b57", 8);
    bot.el.classList.remove("is-active");
    bot.el.classList.add("is-wrong");
    setTimeout(() => bot.el.remove(), 540);

    flashMachine(chosenIndex, "reject");
    flashMachine(expectedIndex, "show-correct");
  }

  function missBot(bot) {
    if (state.phase !== "playing") return;
    removeFromField(bot);

    state.missed += 1;
    state.streak = 0;
    state.multiplier = 1;
    state.score = Math.max(0, state.score - 5);
    updateHUD(false);
    updateCombo();

    const rect = bot.el.getBoundingClientRect();
    floatTextAtRect(rect, "−5", "bad");
    spawnSparks(rect.left + rect.width / 2, rect.top + rect.height * 0.45, "#ff4b57", 6);
    bot.el.classList.remove("is-active");
    bot.el.classList.add("is-miss");
    setTimeout(() => bot.el.remove(), 640);

    sound.miss();
    shakeStage();
    flashScreen();
    hideStagePrompt();
  }

  /* ── Rules & HUD ──────────────────────────────────────── */

  function nextRule() {
    const options = Object.keys(RULES).filter((rule) => rule !== state.rule);
    return options[randomInt(options.length)];
  }

  function setRule(rule, changed, isFinal) {
    state.rule = rule;
    const config = RULES[rule];

    dom.app.dataset.rule = rule;
    dom.ruleIcon.innerHTML = iconSvg(config.icon);
    dom.ruleName.textContent = config.label;
    dom.ruleHint.textContent = config.hint;

    if (changed) {
      dom.ruleBarSection.classList.remove("flash");
      void dom.ruleBarSection.offsetWidth;
      dom.ruleBarSection.classList.add("flash");
      sound.ruleChange(isFinal);
      announce(isFinal ? "FINAL ORDER" : "NEW ORDER", `SORT BY ${config.label}`, "rules");
    }
  }

  function multiplierFor(streak) {
    return Math.min(5, 1 + Math.floor(streak / 3));
  }

  function updateHUD(popScore = false) {
    dom.score.textContent = String(state.score);
    dom.best.textContent = String(Math.max(state.highScore, state.score));
    if (popScore) popElement(dom.score);
  }

  function updateCombo() {
    dom.comboText.textContent = `×${state.multiplier}`;
    dom.comboPill.classList.toggle("hot", state.multiplier > 1);
    const pips = dom.comboPips.children;
    for (let i = 0; i < pips.length; i += 1) {
      pips[i].classList.toggle("on", i < state.multiplier);
    }
  }

  function updateTimerDisplay() {
    const seconds = Math.max(0, Math.ceil((state.duration - state.elapsed) / 1000));
    if (seconds !== state.lastSecond) {
      state.lastSecond = seconds;
      dom.time.textContent = String(seconds);
      if (state.phase === "playing" && seconds <= 5 && seconds > 0) {
        sound.tick(seconds <= 3);
      }
    }
    const ratio = Math.max(0, state.duration - state.elapsed) / state.duration;
    dom.timerBar.style.width = `${ratio * 100}%`;
    dom.timerStat.classList.toggle("urgent", seconds <= 10 && seconds > 5);
    dom.timerStat.classList.toggle("critical", seconds <= 5);
  }

  function updateRuleClock() {
    if (state.elapsed >= 40000) {
      const remain = Math.max(0, state.duration - state.elapsed);
      dom.ruleClockLabel.textContent = "FINAL ORDER";
      dom.ruleClock.textContent = `${Math.ceil(remain / 1000)}s`;
      dom.ruleFill.style.width = `${(remain / (state.duration - 40000)) * 100}%`;
      return;
    }
    const phaseElapsed = state.elapsed % CONFIG.ruleEvery;
    const remain = CONFIG.ruleEvery - phaseElapsed;
    dom.ruleClockLabel.textContent = "NEXT ORDER";
    dom.ruleClock.textContent = `${Math.ceil(remain / 1000)}s`;
    dom.ruleFill.style.width = `${(remain / CONFIG.ruleEvery) * 100}%`;
  }

  /* ── Effects ──────────────────────────────────────────── */

  function announce(kicker, text, variant) {
    const el = document.createElement("div");
    el.className = `announce ${variant || "rules"}`;
    el.innerHTML = `<span>${kicker}</span><strong>${text}</strong>`;
    dom.announceLayer.replaceChildren(el);
    const remove = () => el.remove();
    el.addEventListener("animationend", remove, { once: true });
    setTimeout(remove, 1700);
  }

  function createFlyClone(bot, rect, machineIndex) {
    const machine = machineButtons[machineIndex];
    if (!machine) return;
    const machineRect = machine.getBoundingClientRect();
    const clone = bot.el.cloneNode(true);
    clone.classList.remove("is-active", "spawned");
    clone.classList.add("bot-clone");
    clone.style.cssText += `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;bottom:auto;transform:none;`;
    document.body.appendChild(clone);

    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endX = machineRect.left + machineRect.width / 2;
    const endY = machineRect.top + machineRect.height * 0.36;
    const dx = endX - startX;
    const dy = endY - startY;

    const anim = clone.animate(
      [
        { transform: "translate3d(0,0,0) scale(1) rotate(0deg)", opacity: 1 },
        {
          transform: `translate3d(${dx * 0.35}px, ${dy * 0.4 - 70}px, 0) scale(.92) rotate(70deg)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate3d(${dx}px, ${dy}px, 0) scale(.08) rotate(220deg)`,
          opacity: 0.1,
        },
      ],
      { duration: 470, easing: "cubic-bezier(.35,.05,.65,1)" }
    );
    anim.onfinish = () => clone.remove();
    setTimeout(() => clone.remove(), 900);
  }

  function floatTextAtRect(rect, text, kind, offsetY = 0) {
    const stageRect = dom.stage.getBoundingClientRect();
    const el = document.createElement("div");
    el.className = `float-text ${kind}`;
    el.textContent = text;
    el.style.left = `${rect.left - stageRect.left + rect.width / 2}px`;
    el.style.top = `${rect.top - stageRect.top + rect.height * 0.2 + offsetY}px`;
    dom.effectLayer.appendChild(el);
    el.animate(
      [
        { transform: "translate(-50%,-50%) scale(.82)", opacity: 0 },
        { transform: "translate(-50%,-85%) scale(1.06)", opacity: 1, offset: 0.22 },
        { transform: "translate(-50%,-220%) scale(1)", opacity: 0 },
      ],
      { duration: 920, easing: "cubic-bezier(.2,.7,.3,1)" }
    ).onfinish = () => el.remove();
  }

  function spawnSparks(x, y, color, count) {
    const stageRect = dom.stage.getBoundingClientRect();
    for (let i = 0; i < count; i += 1) {
      const spark = document.createElement("i");
      spark.className = "spark";
      const angle = Math.random() * Math.PI * 2;
      const distance = 26 + Math.random() * 78;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 12;
      spark.style.left = `${x - stageRect.left}px`;
      spark.style.top = `${y - stageRect.top}px`;
      spark.style.setProperty("--spark", i % 4 === 0 ? "#ffffff" : color);
      dom.effectLayer.appendChild(spark);
      const anim = spark.animate(
        [
          { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.2)`,
            opacity: 0,
          },
        ],
        { duration: 380 + Math.random() * 420, easing: "cubic-bezier(.1,.7,.3,1)" }
      );
      anim.onfinish = () => spark.remove();
      setTimeout(() => spark.remove(), 1000);
    }
  }

  function flashMachine(index, className) {
    const button = machineButtons[index];
    if (!button) return;
    const previous = machineTimers.get(button);
    if (previous) clearTimeout(previous);
    button.classList.remove("accept", "reject", "show-correct");
    void button.offsetWidth;
    button.classList.add(className);
    const timeout = setTimeout(
      () => {
        button.classList.remove(className);
        machineTimers.delete(button);
      },
      className === "show-correct" ? 900 : 520
    );
    machineTimers.set(button, timeout);
  }

  function bumpComboPill() {
    dom.comboPill.classList.remove("level-up");
    void dom.comboPill.offsetWidth;
    dom.comboPill.classList.add("level-up");
    setTimeout(() => dom.comboPill.classList.remove("level-up"), 560);
  }

  function popElement(el) {
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
    setTimeout(() => el.classList.remove("pop"), 360);
  }

  function shakeStage() {
    dom.stage.classList.remove("shake");
    void dom.stage.offsetWidth;
    dom.stage.classList.add("shake");
    setTimeout(() => dom.stage.classList.remove("shake"), 420);
  }

  function flashScreen() {
    dom.screenFlash.classList.remove("flash");
    void dom.screenFlash.offsetWidth;
    dom.screenFlash.classList.add("flash");
    setTimeout(() => dom.screenFlash.classList.remove("flash"), 480);
  }

  function hideStagePrompt() {
    dom.stagePrompt.classList.add("is-hidden");
  }

  /* ── Sound toggle ─────────────────────────────────────── */

  function toggleMute() {
    state.muted = !state.muted;
    sound.ensure();
    sound.setMuted(state.muted);
    storeNumber(STORE_MUTE, state.muted ? 1 : 0);
    updateMuteUI();
    if (!state.muted) sound.click();
  }

  function updateMuteUI() {
    dom.muteBtn.classList.toggle("is-muted", state.muted);
    dom.muteBtn.setAttribute("aria-pressed", String(state.muted));
    dom.muteBtn.setAttribute("aria-label", state.muted ? "Unmute sound" : "Mute sound");
    dom.muteBtn.innerHTML = state.muted
      ? `<svg viewBox="0 0 24 24" aria-hidden="true">
           <path d="M4 9h4l5-4v14l-5-4H4V9Z"/>
           <path d="m16 9 4 6m0-6-4 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
         </svg>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true">
           <path d="M4 9h4l5-4v14l-5-4H4V9Z"/>
           <path d="M16 8.5c1.2 1.1 1.2 5.9 0 7M18.5 6c2.6 2.6 2.6 9.4 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
         </svg>`;
  }

  /* ── Helpers ──────────────────────────────────────────── */

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function readNumber(key, fallback) {
    try {
      const value = Number.parseInt(localStorage.getItem(key), 10);
      return Number.isFinite(value) ? Math.max(0, value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function storeNumber(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      /* Storage can be unavailable (private mode / file protocol). */
    }
  }

  /* Expose a tiny debug surface for manual testing. */
  window.RobotFactory = {
    get state() {
      return state;
    },
    start: startGame,
    menu: goMenu,
    pickMachine,
  };
})();
