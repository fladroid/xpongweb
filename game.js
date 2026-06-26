/* xpong — game.js : M1 classic Pong (2 players, keyboard + touch)
   Pure vanilla, no deps. Logical coord system 800x500, scaled by CSS.
   Colors read from CSS vars so it follows the site theme (light/dark). */
(function () {
  'use strict';

  var W = 800, H = 500;          // logical play-field
  var canvas, ctx, dpr = 1;
  var colors = {};               // filled from CSS vars

  // --- tunables (candidates for a pre-game settings panel later) ---
  var PADDLE_W = 12, PADDLE_H = 90, PADDLE_M = 24; // width, height, margin from wall
  var BALL_R = 8;
  var PADDLE_SPEED = 7;          // px per frame (logical)
  var BALL_SPEED0 = 5;           // initial ball speed
  var BALL_SPEEDUP = 1.05;       // multiply on paddle hit
  var BALL_SPEED_MAX = 14;
  var WIN_SCORE = 11;

  var left, right, ball, scoreL, scoreR, running, gameOver, winner;
  var keys = {};                 // pressed keys
  var raf = null;

  function resetPaddles() {
    left  = { y: H / 2 - PADDLE_H / 2, vy: 0 };
    right = { y: H / 2 - PADDLE_H / 2, vy: 0 };
  }

  function resetBall(dir) {
    // dir: +1 serves right, -1 serves left; random vertical angle
    var angle = (Math.random() * 0.5 - 0.25) * Math.PI; // -45..+45 deg
    ball = {
      x: W / 2, y: H / 2,
      vx: dir * BALL_SPEED0 * Math.cos(angle),
      vy: BALL_SPEED0 * Math.sin(angle)
    };
  }

  function newGame() {
    scoreL = 0; scoreR = 0;
    gameOver = false; winner = null;
    resetPaddles();
    resetBall(Math.random() < 0.5 ? 1 : -1);
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
  var touchTargets = {};  // identifier -> {side, y}
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
    // move paddle center toward the active touch on its side
    var target = null;
    for (var id in touchTargets) {
      if (touchTargets[id].side === side) { target = touchTargets[id].y; break; }
    }
    if (target === null) return false;
    var center = paddle.y + PADDLE_H / 2;
    var diff = target - center;
    var step = Math.max(-PADDLE_SPEED * 1.6, Math.min(PADDLE_SPEED * 1.6, diff));
    paddle.y += step;
    return true;
  }

  // --- physics ---
  function clampPaddle(p) {
    if (p.y < 0) p.y = 0;
    if (p.y > H - PADDLE_H) p.y = H - PADDLE_H;
  }

  function step() {
    // left paddle: W/S or touch-left
    if (!applyTouch(left, 'L')) {
      if (keys['w']) left.y -= PADDLE_SPEED;
      if (keys['s']) left.y += PADDLE_SPEED;
    }
    // right paddle: arrows or touch-right
    if (!applyTouch(right, 'R')) {
      if (keys['o']) right.y -= PADDLE_SPEED;
      if (keys['l']) right.y += PADDLE_SPEED;
    }
    clampPaddle(left); clampPaddle(right);

    // ball move
    ball.x += ball.vx; ball.y += ball.vy;

    // top/bottom walls
    if (ball.y - BALL_R < 0)     { ball.y = BALL_R; ball.vy = -ball.vy; }
    if (ball.y + BALL_R > H)     { ball.y = H - BALL_R; ball.vy = -ball.vy; }

    // left paddle collision
    if (ball.vx < 0 &&
        ball.x - BALL_R < PADDLE_M + PADDLE_W &&
        ball.x - BALL_R > PADDLE_M &&
        ball.y > left.y && ball.y < left.y + PADDLE_H) {
      bounce(left);
      ball.x = PADDLE_M + PADDLE_W + BALL_R;
    }
    // right paddle collision
    if (ball.vx > 0 &&
        ball.x + BALL_R > W - PADDLE_M - PADDLE_W &&
        ball.x + BALL_R < W - PADDLE_M &&
        ball.y > right.y && ball.y < right.y + PADDLE_H) {
      bounce(right);
      ball.x = W - PADDLE_M - PADDLE_W - BALL_R;
    }

    // goals
    if (ball.x < -BALL_R)    { scoreR++; afterPoint(-1); }
    if (ball.x > W + BALL_R) { scoreL++; afterPoint(1); }
  }

  function bounce(paddle) {
    // reflect x, add english based on where it hit the paddle
    var center = paddle.y + PADDLE_H / 2;
    var rel = (ball.y - center) / (PADDLE_H / 2); // -1..1
    var speed = Math.min(Math.hypot(ball.vx, ball.vy) * BALL_SPEEDUP, BALL_SPEED_MAX);
    var dir = ball.vx < 0 ? 1 : -1;
    var angle = rel * (Math.PI / 3.5); // up to ~51 deg
    ball.vx = dir * speed * Math.cos(angle);
    ball.vy = speed * Math.sin(angle);
  }

  function afterPoint(serveDir) {
    updateHUD();
    if (scoreL >= WIN_SCORE || scoreR >= WIN_SCORE) {
      gameOver = true; running = false;
      winner = scoreL > scoreR ? 'L' : 'R';
      updateHUD();
      return;
    }
    resetBall(serveDir);
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
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // field bg
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    // center dashed line
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 14]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    // paddles
    ctx.fillStyle = colors.fg;
    ctx.fillRect(PADDLE_M, left.y, PADDLE_W, PADDLE_H);
    ctx.fillRect(W - PADDLE_M - PADDLE_W, right.y, PADDLE_W, PADDLE_H);

    // ball
    ctx.fillStyle = colors.accent;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();

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
    if (elScoreL) elScoreL.textContent = scoreL;
    if (elScoreR) elScoreR.textContent = scoreR;
    if (elBtnStart) {
      elBtnStart.textContent = running ? gt('g_pause', 'Pause')
        : (gameOver ? gt('g_again', 'Play again') : gt('g_start', 'Start'));
    }
    if (elStatus) {
      if (gameOver) {
        var who = winner === 'L' ? gt('g_left', 'Left') : gt('g_right', 'Right');
        elStatus.textContent = who + ' ' + gt('g_wins', 'wins!');
      } else if (!running && (scoreL > 0 || scoreR > 0)) {
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

    // re-read colors when theme toggles (observe data-theme on <html>)
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
