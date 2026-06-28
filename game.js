/* xpong — game.js : M1 classic Pong (2 players, keyboard + touch).
   Presentation + input only. Physics comes from window.xpong.PongCore
   (pong-core.js, loaded before this file). Colors read from CSS vars so
   it follows the site theme (light/dark). */
(function () {
  'use strict';

  var Core = window.xpong && window.xpong.PongCore;
  if (!Core) { return; }            // core must load first
  var C = Core.C;
  var W = C.W, H = C.H;

  var canvas, ctx, dpr = 1;
  var colors = {};

  var state;                        // PongCore state (ball, paddles, scores, winner)
  var running, gameOver;
  var keys = {};
  var raf = null;

  function newGame() {
    state = Core.newState();
    Core.resetBall(state, Math.random() < 0.5 ? 1 : -1);
    gameOver = false;
    running = false;
    updateHUD();
    draw();
  }

  // --- input: keyboard ---
  function onKeyDown(e) {
    var k = e.key;
    if (k === 'w' || k === 'W' || k === 's' || k === 'S' ||
        k === 'o' || k === 'O' || k === 'l' || k === 'L') {
      keys[k.length === 1 ? k.toLowerCase() : k] = true;
      e.preventDefault();
    }
    if (k === ' ') { toggleRun(); e.preventDefault(); }
  }
  function onKeyUp(e) {
    var k = e.key;
    keys[k.length === 1 ? k.toLowerCase() : k] = false;
  }

  // --- input: touch (each half controls its paddle) ---
  var touchTargets = {};
  function touchToLogical(clientY) {
    var r = canvas.getBoundingClientRect();
    return (clientY - r.top) / r.height * H;
  }
  function onTouchStart(e) {
    var r = canvas.getBoundingClientRect();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var side = (t.clientX - r.left) < r.width / 2 ? 'L' : 'R';
      touchTargets[t.identifier] = { side: side, y: touchToLogical(t.clientY) };
    }
    if (!running && !gameOver) toggleRun();
    e.preventDefault();
  }
  function onTouchMove(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (touchTargets[t.identifier]) touchTargets[t.identifier].y = touchToLogical(t.clientY);
    }
    e.preventDefault();
  }
  function onTouchEnd(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      delete touchTargets[e.changedTouches[i].identifier];
    }
    e.preventDefault();
  }

  function applyTouch(paddle, side) {
    var target = null;
    for (var id in touchTargets) {
      if (touchTargets[id].side === side) { target = touchTargets[id].y; break; }
    }
    if (target === null) return false;
    var center = paddle.y + C.PADDLE_H / 2;
    var diff = target - center;
    var step = Math.max(-C.PADDLE_SPEED * 1.6, Math.min(C.PADDLE_SPEED * 1.6, diff));
    paddle.y += step;
    return true;
  }

  // --- one simulation step: move paddles from input, then ball via core ---
  function step() {
    var left = state.left, right = state.right;
    if (!applyTouch(left, 'L')) {
      if (keys['w']) left.y -= C.PADDLE_SPEED;
      if (keys['s']) left.y += C.PADDLE_SPEED;
    }
    if (!applyTouch(right, 'R')) {
      if (keys['o']) right.y -= C.PADDLE_SPEED;
      if (keys['l']) right.y += C.PADDLE_SPEED;
    }
    Core.clampPaddle(left); Core.clampPaddle(right);

    var hit = Core.stepBall(state);
    if (hit === 'goalL' || hit === 'goalR') {
      afterPoint(hit === 'goalR' ? -1 : 1);
    }
  }

  function afterPoint(serveDir) {
    updateHUD();
    if (state.scoreL >= C.WIN_SCORE || state.scoreR >= C.WIN_SCORE) {
      gameOver = true; running = false;
      state.winner = state.scoreL > state.scoreR ? 'L' : 'R';
      updateHUD();
      return;
    }
    Core.resetBall(state, serveDir);
    running = false; // brief pause; press space/tap to serve
    updateHUD();
  }

  // --- render ---
  function readColors() {
    var cs = getComputedStyle(document.body);
    colors.fg     = cs.getPropertyValue('--text').trim()        || '#202122';
    colors.muted  = cs.getPropertyValue('--text-muted').trim()  || '#54595d';
    colors.accent = cs.getPropertyValue('--accent').trim()      || '#3366cc';
    colors.line   = cs.getPropertyValue('--border').trim()      || '#a2a9b1';
    colors.bg     = cs.getPropertyValue('--surface').trim()     || '#ffffff';
  }

  function draw() {
    var ball = state.ball, left = state.left, right = state.right;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 14]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = colors.fg;
    ctx.fillRect(C.PADDLE_M, left.y, C.PADDLE_W, C.PADDLE_H);
    ctx.fillRect(W - C.PADDLE_M - C.PADDLE_W, right.y, C.PADDLE_W, C.PADDLE_H);

    ctx.fillStyle = colors.accent;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, C.BALL_R, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // --- loop ---
  function frame() {
    if (running && !gameOver) step();
    draw();
    raf = requestAnimationFrame(frame);
  }

  // --- HUD wiring (i18n via window.xpong.t with EN fallback) ---
  var elScoreL, elScoreR, elBtnStart, elStatus;
  function gt(key, en) {
    return (window.xpong && window.xpong.t) ? window.xpong.t(key) : en;
  }
  function updateHUD() {
    if (elScoreL) elScoreL.textContent = state.scoreL;
    if (elScoreR) elScoreR.textContent = state.scoreR;
    if (elBtnStart) {
      elBtnStart.textContent = running ? gt('g_pause', 'Pause')
        : (gameOver ? gt('g_again', 'Play again') : gt('g_start', 'Start'));
    }
    if (elStatus) {
      if (gameOver) {
        var who = state.winner === 'L' ? gt('g_left', 'Left') : gt('g_right', 'Right');
        elStatus.textContent = who + ' ' + gt('g_wins', 'wins!');
      } else if (!running && (state.scoreL > 0 || state.scoreR > 0)) {
        elStatus.textContent = gt('g_serve_hint', 'Press Space or tap to serve');
      } else if (!running) {
        elStatus.textContent = gt('g_start_hint', 'Press Space or tap to start');
      } else {
        elStatus.textContent = '';
      }
    }
  }

  function toggleRun() {
    if (gameOver) { newGame(); running = true; updateHUD(); return; }
    running = !running;
    updateHUD();
  }

  // --- responsive canvas sizing ---
  function resize() {
    var maxW = Math.min(canvas.parentNode.clientWidth, 900);
    var cssW = maxW;
    var cssH = cssW * (H / W);
    dpr = window.devicePixelRatio || 1;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    draw();
  }

  function init() {
    canvas = document.getElementById('xp-game');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    elScoreL   = document.getElementById('xp-score-l');
    elScoreR   = document.getElementById('xp-score-r');
    elBtnStart = document.getElementById('xp-btn-start');
    elStatus   = document.getElementById('xp-game-status');

    var btnReset = document.getElementById('xp-btn-reset');
    if (elBtnStart) elBtnStart.addEventListener('click', toggleRun);
    if (btnReset)   btnReset.addEventListener('click', function () { newGame(); });

    readColors();
    newGame();
    resize();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: false });
    canvas.addEventListener('touchcancel', onTouchEnd,  { passive: false });
    window.addEventListener('resize', resize);

    var obs = new MutationObserver(function () { readColors(); draw(); updateHUD(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang'] });

    raf = requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
