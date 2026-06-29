/* xpong — xray.js : M2 brick 1 — the trajectory ray (laser).
   Standalone consumer of window.xpong.PongCore (loaded before this file).
   Same input/render skeleton as game.js, PLUS an honest predicted-path ray:
   it casts the ball forward by pure physics to the FIRST obstacle
   (wall / paddle / goal), draws a dashed line that fades toward the end,
   and marks the contact point on walls/paddles (not goals).
   No intelligence: the ray reveals the rule, it does not predict the bounce
   or anyone's decision — it stops where certainty ends. */
(function () {
  'use strict';

  var Core = window.xpong && window.xpong.PongCore;
  if (!Core) { return; }
  var C = Core.C;
  var W = C.W, H = C.H;

  var canvas, ctx, dpr = 1;
  var colors = {};

  var state;
  var running, gameOver;
  var rayOn = false;                // X-Ray overlay toggle (off at start)
  var heatOn = false;               // goal heatmap toggle (off at start)
  var HEAT_BANDS = 4;               // horizontal bands per goal line (coarse)
  var goalsLeftWall  = [0,0,0,0];   // goals entering the LEFT wall (right player scored), by band
  var goalsRightWall = [0,0,0,0];   // goals entering the RIGHT wall (left player scored), by band
  var keys = {};
  var raf = null;

  function newGame() {
    state = Core.newState();
    Core.resetBall(state, Math.random() < 0.5 ? 1 : -1);
    gameOver = false;
    running = false;
    rayOn = false; heatOn = false;
    goalsLeftWall = [0,0,0,0]; goalsRightWall = [0,0,0,0];
    updateHUD();
    draw();
  }

  // --- input: keyboard (same scheme as the game) ---
  function onKeyDown(e) {
    var k = e.key;
    if (k === 'w' || k === 'W' || k === 's' || k === 'S' ||
        k === 'o' || k === 'O' || k === 'l' || k === 'L') {
      keys[k.length === 1 ? k.toLowerCase() : k] = true;
      e.preventDefault();
    }
    if (k === ' ') { toggleRun(); e.preventDefault(); }
    if (k === 'x' || k === 'X') { toggleRay(); e.preventDefault(); }
    if (k === 'h' || k === 'H') { toggleHeat(); e.preventDefault(); }
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
      var band = Math.floor(state.ball.y / (H / HEAT_BANDS));
      if (band < 0) band = 0; if (band > HEAT_BANDS - 1) band = HEAT_BANDS - 1;
      if (hit === 'goalR') goalsLeftWall[band]++; else goalsRightWall[band]++;
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
    running = false;
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

  // Parse a CSS color (hex or rgb) into [r,g,b] so we can draw with alpha.
  function toRGB(col) {
    col = (col || '').trim();
    if (col.charAt(0) === '#') {
      var h = col.slice(1);
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    var m = col.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (m) return [+m[1], +m[2], +m[3]];
    return [51, 102, 204]; // fallback accent
  }

  // Draw the goal heatmap: narrow bands hugging each goal line, alpha by frequency.
  function drawHeatmap() {
    var max = 0, i;
    for (i = 0; i < HEAT_BANDS; i++) {
      if (goalsLeftWall[i] > max) max = goalsLeftWall[i];
      if (goalsRightWall[i] > max) max = goalsRightWall[i];
    }
    if (max === 0) return;            // nothing recorded yet
    var rgb = toRGB(colors.accent);
    var bandH = H / HEAT_BANDS;
    var bw = 14;                      // band width, hugging the wall
    for (i = 0; i < HEAT_BANDS; i++) {
      if (goalsLeftWall[i] > 0) {
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.15 + 0.65 * goalsLeftWall[i] / max) + ')';
        ctx.fillRect(0, i * bandH, bw, bandH);
      }
      if (goalsRightWall[i] > 0) {
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.15 + 0.65 * goalsRightWall[i] / max) + ')';
        ctx.fillRect(W - bw, i * bandH, bw, bandH);
      }
    }
  }

  // Draw the predicted ray: dashed, fading toward the end, marker at contact.
  function drawRay() {
    var ray = Core.castRay(state, 800);
    var pts = ray.points;
    if (pts.length < 2) return;

    var rgb = toRGB(colors.accent);
    var n = pts.length - 1;

    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 9]);
    ctx.lineCap = 'round';

    // draw segment-by-segment so alpha can fade along the path
    for (var i = 0; i < n; i++) {
      var frac = i / n;                       // 0 at ball, 1 at obstacle
      var alpha = 0.55 * (1 - frac) + 0.06;   // fade, never fully gone
      ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // contact marker — only on real obstacles (wall/paddle), not goals
    if (ray.stop === 'wall' || ray.stop === 'paddleL' || ray.stop === 'paddleR') {
      var end = pts[pts.length - 1];
      ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(end.x, end.y, C.BALL_R - 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
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

    // heatmap is the deepest layer (shadow of past goals), under everything
    if (heatOn) drawHeatmap();
    // ray sits under the ball/paddles so the play stays legible on top
    if (rayOn) drawRay();

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
  var elScoreL, elScoreR, elBtnStart, elStatus, elBtnRay, elBtnHeat, elWinner;
  function gt(key, en) {
    return (window.xpong && window.xpong.t) ? window.xpong.t(key) : en;
  }
  function updateHUD() {
    if (elScoreL) elScoreL.textContent = state.scoreL;
    if (elScoreR) elScoreR.textContent = state.scoreR;
    if (elWinner) {
      elWinner.textContent = gameOver
        ? (state.winner === 'L' ? gt('g_left', 'Left') : gt('g_right', 'Right')) + ' ' + gt('g_wins', 'wins!')
        : '';
    }
    if (elBtnStart) {
      elBtnStart.textContent = running ? gt('g_pause', 'Pause')
        : (gameOver ? gt('g_again', 'Play again') : gt('g_start', 'Start'));
    }
    if (elBtnHeat) {
      elBtnHeat.textContent = (heatOn ? gt('x_heat_on', 'Heatmap: on')
                                      : gt('x_heat_off', 'Heatmap: off'));
      elBtnHeat.classList.toggle('xp-game-btn-active', heatOn);
    }
    if (elBtnRay) {
      elBtnRay.textContent = (rayOn ? gt('x_ray_on', 'X-Ray: on')
                                    : gt('x_ray_off', 'X-Ray: off'));
      elBtnRay.classList.toggle('xp-game-btn-active', rayOn);
    }
    if (elStatus) {
      if (gameOver) {
        elStatus.textContent = gt('g_new_set', 'Set over \u2014 press the button for a new set');
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

  function toggleRay() {
    rayOn = !rayOn;
    updateHUD();
    draw();
  }

  function toggleHeat() {
    heatOn = !heatOn;
    updateHUD();
    draw();
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
    elBtnRay   = document.getElementById('xp-btn-ray');
    elBtnHeat  = document.getElementById('xp-btn-heat');
    elWinner   = document.getElementById('xp-winner');

    var btnReset = document.getElementById('xp-btn-reset');
    if (elBtnStart) elBtnStart.addEventListener('click', toggleRun);
    if (btnReset)   btnReset.addEventListener('click', function () { newGame(); });
    if (elBtnRay)   elBtnRay.addEventListener('click', toggleRay);
    if (elBtnHeat)  elBtnHeat.addEventListener('click', toggleHeat);

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
