/* xpong — rl2.js : M3 page 2 — state space + Q-learning agent (live evaluation).
   The left paddle is a tabular Q-learning agent; the right is the random-walker
   baseline from rl1, unchanged. Bulk training (thousands of episodes) runs
   headless for speed. Every EVAL_EVERY episodes, a fresh evaluation number is
   measured headless (for the chart), then ONE evaluation episode is replayed
   live on the court -- greedy policy, real time -- so the numbers on the graph
   have a visible referent. The state-space grid, the six-value state table,
   the beam and the heatmap all read this live episode the same way they read
   free play on earlier pages. There is no free-play mode on this page anymore
   (s22 redesign) -- rl1 already covers "play against the world"; this page is
   only about what the agent has learned to do with it.
   Clone lineage: rl1.js (random-walker agent, no learning) <- xray.js (M2
   telemetry: beam + heatmap + infoboxes). --- original xray.js header below ---
   xpong — xray.js : M2 brick 1 — the trajectory ray (laser).
   Standalone consumer of window.xpong.PongCore (loaded before this file).
   No intelligence in the ray itself: it reveals the rule, it does not predict
   the bounce or anyone's decision — it stops where certainty ends. */
(function () {
  'use strict';

  var Core = window.xpong && window.xpong.PongCore;
  if (!Core) { return; }
  var C = Core.C;
  var W = C.W, H = C.H;

  var canvas, ctx, dpr = 1;
  var chart, chartCtx, cdpr = 1;
  var colors = {};

  var state;
  var rayOn = false;                // X-Ray overlay toggle (off at start)
  var heatOn = false;               // goal heatmap toggle (off at start)
  var HEAT_BANDS = 4;               // horizontal bands per goal line (coarse)
  var goalsLeftWall  = [0,0,0,0];   // goals entering the LEFT wall (right player scored), by band
  var goalsRightWall = [0,0,0,0];   // goals entering the RIGHT wall (left player scored), by band
  var raf = null;

  // Fresh court, ball re-served -- used at load, at the start of each live
  // evaluation episode, and whenever the agent scores and the episode re-serves.
  function newLiveState() {
    state = Core.newState();
    Core.resetBall(state, Math.random() < 0.5 ? 1 : -1);
  }

  // --- x/h toggle keys only -- no paddle input on this page anymore ---
  function onKeyDown(e) {
    var k = e.key;
    if (k === 'x' || k === 'X') { toggleRay(); e.preventDefault(); }
    if (k === 'h' || k === 'H') { toggleHeat(); e.preventDefault(); }
  }

  // --- random-walker agent (right paddle): pick -1/0/+1 each step ---
  function agentAction() { return Math.floor(Math.random() * 3) - 1; }
  function applyAgent(paddle) { paddle.y += agentAction() * C.PADDLE_SPEED * 2; }  // x2: wider random walk

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
    var rgb = toRGB(colors.accent);
    var bandH = H / HEAT_BANDS;
    var bw = 22;                      // band width, hugging the wall (wider: room for count)
    ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.25)';
    ctx.lineWidth = 1;
    for (i = 0; i < HEAT_BANDS; i++) {
      ctx.strokeRect(0.5, i * bandH + 0.5, bw, bandH - 1);
      ctx.strokeRect(W - bw - 0.5, i * bandH + 0.5, bw, bandH - 1);
    }
    if (max === 0) return;
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
    ctx.font = '15px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (i = 0; i < HEAT_BANDS; i++) {
      var cy = i * bandH + bandH / 2;
      if (goalsLeftWall[i] > 0) {
        ctx.fillStyle = colors.bg;
        ctx.beginPath(); ctx.arc(bw / 2, cy, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = colors.fg; ctx.fillText(String(goalsLeftWall[i]), bw / 2, cy);
      }
      if (goalsRightWall[i] > 0) {
        ctx.fillStyle = colors.bg;
        ctx.beginPath(); ctx.arc(W - bw / 2, cy, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = colors.fg; ctx.fillText(String(goalsRightWall[i]), W - bw / 2, cy);
      }
    }
  }

  // Draw the predicted ray: dashed, fading toward the end, marker at contact.
  function drawRay() {
    if (Math.abs(state.ball.x - W / 2) < 1 && Math.abs(state.ball.y - H / 2) < 1) return;
    var ray = Core.castRay(state, 800);
    var pts = ray.points;
    if (pts.length < 2) return;

    var rgb = toRGB(colors.accent);
    var n = pts.length - 1;

    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 9]);
    ctx.lineCap = 'round';
    var dim = liveEval ? 1 : 0.55;             // paler while a live episode isn't playing

    for (var i = 0; i < n; i++) {
      var frac = i / n;
      var alpha = (0.55 * (1 - frac) + 0.06) * dim;
      ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    if (ray.stop === 'wall' || ray.stop === 'paddleL' || ray.stop === 'paddleR') {
      var end = pts[pts.length - 1];
      ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.9 * dim).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(end.x, end.y, C.BALL_R - 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- State-space grid (rl2) --------------------------------------------
  var GRIDS = {
    '300':   { x: 5,  y: 5,  dx: 2, dy: 3, pad: 2 },
    '4000':  { x: 10, y: 8,  dx: 2, dy: 5, pad: 5 },
    '12000': { x: 10, y: 10, dx: 3, dy: 5, pad: 8 }
  };
  var gridKey = '4000';

  function binOf(v, min, max, n) {
    var i = Math.floor((v - min) / (max - min) * n);
    return i < 0 ? 0 : (i >= n ? n - 1 : i);
  }

  function encodeState(g, st) {
    st = st || state;
    var b = st.ball, V = C.BALL_SPEED_MAX;
    var ix  = binOf(b.x, 0, W, g.x);
    var iy  = binOf(b.y, 0, H, g.y);
    var idx = binOf(b.vx, -V, V, g.dx);
    var idy = binOf(b.vy, -V, V, g.dy);
    var ip  = binOf(st.left.y, 0, H - C.PADDLE_H, g.pad);
    return (((ix * g.y + iy) * g.dx + idx) * g.dy + idy) * g.pad + ip;
  }

  function gridTotal(g) { return g.x * g.y * g.dx * g.dy * g.pad; }

  // --- Q-learning core (rl2) ---------------------------------------------
  var Q = null, qN = 0;
  var LR = 0.15, GAMMA = 0.95;
  var eps = 1.0, EPS_MIN = 0.05, EPS_DECAY = 0.9995;

  function qReset(g) {
    qN = gridTotal(g);
    Q = new Float32Array(qN * 3);
    eps = 1.0;
  }

  function qAction(si, explore) {
    if (explore && Math.random() < eps) return (Math.random() * 3) | 0;
    var b = si * 3, a0 = Q[b], a1 = Q[b + 1], a2 = Q[b + 2];
    var mx = a0 > a1 ? (a0 > a2 ? a0 : a2) : (a1 > a2 ? a1 : a2);
    var t = [];
    if (a0 === mx) t.push(0);
    if (a1 === mx) t.push(1);
    if (a2 === mx) t.push(2);
    return t.length === 1 ? t[0] : t[(Math.random() * t.length) | 0];
  }

  function qUpdate(si, a, r, si2) {
    var b = si * 3, b2 = si2 * 3;
    var mx = Q[b2]; if (Q[b2 + 1] > mx) mx = Q[b2 + 1]; if (Q[b2 + 2] > mx) mx = Q[b2 + 2];
    Q[b + a] += LR * (r + GAMMA * mx - Q[b + a]);
  }

  // --- headless episode ---------------------------------------------------
  var EP_MAX_STEPS = 4000;

  function runEpisode(g, learn) {
    var st = Core.newState();
    Core.resetBall(st, Math.random() < 0.5 ? 1 : -1);
    var hits = 0, steps = 0, hit, r, a;
    var si = encodeState(g, st), si2;
    while (steps < EP_MAX_STEPS) {
      a = qAction(si, learn);
      st.left.y += (a - 1) * C.PADDLE_SPEED;
      applyAgent(st.right);
      Core.clampPaddle(st.left); Core.clampPaddle(st.right);
      hit = Core.stepBall(st);
      r = 0;
      if (hit === 'paddleL') { hits++; r = 1; }
      else if (hit === 'goalR') { r = -1; }
      si2 = encodeState(g, st);
      if (learn) qUpdate(si, a, r, si2);
      si = si2;
      steps++;
      if (hit === 'goalR') break;
      if (hit === 'goalL') {
        Core.resetBall(st, Math.random() < 0.5 ? 1 : -1);
        si = encodeState(g, st);
      }
    }
    if (learn && eps > EPS_MIN) eps *= EPS_DECAY;
    return { hits: hits, steps: steps };
  }

  function evaluate(g, n) {
    var savedEps = eps;
    eps = 0;
    var tot = 0;
    for (var i = 0; i < n; i++) tot += runEpisode(g, false).hits;
    eps = savedEps;
    return tot / n;
  }

  // --- live evaluation: one episode replayed on the canvas in real time ---
  // Same rule as runEpisode(): the episode lasts until the AGENT concedes
  // (goalR); a goal the agent scores (goalL) just re-serves. Capped in frames
  // so a good agent (long rallies) cannot stall the training loop forever.
  var liveEval = false;
  var liveEvalFrames = 0;
  var LIVE_EVAL_MAX_FRAMES = 900;   // ~15s at 60fps

  function startLiveEval() {
    liveEval = true;
    liveEvalFrames = 0;
    newLiveState();
    updateHUD();
  }

  function liveStep() {
    var g = GRIDS[gridKey];
    var si = encodeState(g, state);
    var a = qAction(si, false);            // greedy -- the trained policy, no exploration
    state.left.y += (a - 1) * C.PADDLE_SPEED;
    applyAgent(state.right);
    Core.clampPaddle(state.left); Core.clampPaddle(state.right);
    var hit = Core.stepBall(state);
    if (hit === 'goalL' || hit === 'goalR') {
      var band = Math.floor(state.ball.y / (H / HEAT_BANDS));
      if (band < 0) band = 0; if (band > HEAT_BANDS - 1) band = HEAT_BANDS - 1;
      if (hit === 'goalR') goalsLeftWall[band]++; else goalsRightWall[band]++;
    }
    liveEvalFrames++;
    if (hit === 'goalR' || liveEvalFrames >= LIVE_EVAL_MAX_FRAMES) {
      endLiveEval();
      return;
    }
    if (hit === 'goalL') newLiveState();
  }

  function endLiveEval() {
    liveEval = false;
    if (trainEp < TRAIN_EPISODES) {
      trainRun = true;
      updateHUD();
      requestAnimationFrame(trainTick);
    } else {
      setGridControlsEnabled(true);
      if (elBtnTrain) elBtnTrain.disabled = false;
      updateHUD();
    }
  }

  // --- training loop (headless, self-tuning batch) ------------------------
  var TRAIN_EPISODES = 12000, EVAL_EVERY = 500, EVAL_N = 50;
  var trainRun = false, trainEp = 0, batch = 20, stepsPerSec = 0;
  var curves = [], curve = null;

  function setGridControlsEnabled(enabled) {
    var segIn = document.querySelectorAll('input[name="r2-grid"]');
    for (var i = 0; i < segIn.length; i++) segIn[i].disabled = !enabled;
  }

  function trainStart() {
    var g = GRIDS[gridKey];
    qReset(g);
    trainEp = 0; batch = 20;
    curve = []; curves.push(curve);
    trainRun = true; liveEval = false;
    setGridControlsEnabled(false);
    if (elBtnTrain) elBtnTrain.disabled = true;
    updateHUD();
    requestAnimationFrame(trainTick);
  }

  function trainTick() {
    if (!trainRun) return;
    var g = GRIDS[gridKey], t0 = performance.now(), steps = 0, i;
    var hitEval = false;
    for (i = 0; i < batch && trainEp < TRAIN_EPISODES; i++) {
      steps += runEpisode(g, true).steps;
      trainEp++;
      if (trainEp % EVAL_EVERY === 0) {
        curve.push({ ep: trainEp, q: evaluate(g, EVAL_N) });
        hitEval = true;
        break;
      }
    }
    var dt = performance.now() - t0;
    if (dt > 0.5) {
      stepsPerSec = Math.round(steps / dt * 1000);
      batch = Math.max(1, Math.min(400, Math.round(batch * 8 / dt)));
    }
    drawChart();
    renderStats();

    if (trainEp >= TRAIN_EPISODES) {
      trainRun = false;
      setGridControlsEnabled(true);
      if (elBtnTrain) elBtnTrain.disabled = false;
      updateHUD();
      return;
    }
    if (hitEval) {
      trainRun = false;
      startLiveEval();
      return;
    }
    updateHUD();
    requestAnimationFrame(trainTick);
  }

  function resetTraining() {
    trainRun = false; liveEval = false;
    trainEp = 0; batch = 20; stepsPerSec = 0;
    curves = []; curve = null;
    Q = null; qN = 0; eps = 1.0;
    rayOn = false; heatOn = false;
    goalsLeftWall = [0,0,0,0]; goalsRightWall = [0,0,0,0];
    newLiveState();
    setGridControlsEnabled(true);
    if (elBtnTrain) elBtnTrain.disabled = false;
    drawChart();
    renderStats();
    updateHUD();
    draw();
  }

  // --- chart: every run ADDS a curve; the spread IS the reliability --------
  function drawChart() {
    if (!chartCtx) return;
    var cw = chart.width / cdpr, chh = chart.height / cdpr;
    chartCtx.save(); chartCtx.scale(cdpr, cdpr);
    chartCtx.clearRect(0, 0, cw, chh);
    chartCtx.fillStyle = colors.bg; chartCtx.fillRect(0, 0, cw, chh);
    var PAD = 28, maxQ = 6, k;
    for (k = 0; k < curves.length; k++) {
      for (var j = 0; j < curves[k].length; j++) if (curves[k][j].q > maxQ) maxQ = curves[k][j].q;
    }
    maxQ = Math.ceil(maxQ);
    var lc = toRGB(colors.line);
    chartCtx.strokeStyle = 'rgba(' + lc[0] + ',' + lc[1] + ',' + lc[2] + ',0.5)';
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    chartCtx.moveTo(PAD, 6); chartCtx.lineTo(PAD, chh - PAD); chartCtx.lineTo(cw - 6, chh - PAD);
    chartCtx.stroke();
    chartCtx.fillStyle = colors.muted; chartCtx.font = '11px monospace';
    chartCtx.textAlign = 'right'; chartCtx.fillText(String(maxQ), PAD - 4, 12);
    chartCtx.fillText('0', PAD - 4, chh - PAD + 4);
    chartCtx.textAlign = 'center';
    chartCtx.fillText(String(TRAIN_EPISODES), cw - 20, chh - PAD + 14);
    var ac = toRGB(colors.accent);
    for (k = 0; k < curves.length; k++) {
      var c2 = curves[k];
      if (!c2.length) continue;
      var last = (k === curves.length - 1);
      chartCtx.strokeStyle = 'rgba(' + ac[0] + ',' + ac[1] + ',' + ac[2] + ',' + (last ? 0.95 : 0.32) + ')';
      chartCtx.lineWidth = last ? 2 : 1.2;
      chartCtx.beginPath();
      for (var m = 0; m < c2.length; m++) {
        var px = PAD + (cw - PAD - 10) * c2[m].ep / TRAIN_EPISODES;
        var py = (chh - PAD) - (chh - PAD - 8) * Math.min(c2[m].q, maxQ) / maxQ;
        if (m === 0) chartCtx.moveTo(px, py); else chartCtx.lineTo(px, py);
      }
      chartCtx.stroke();
    }
    chartCtx.restore();
  }

  // All five state dimensions as a plain table, plus the sixth value the
  // agent does NOT use (opponent paddle) shown separately for contrast.
  function renderStateTable() {
    var el = document.getElementById('r2-state-table');
    if (!el || !state || !state.ball) return;
    var g = GRIDS[gridKey];
    var b = state.ball, V = C.BALL_SPEED_MAX;
    var ix  = binOf(b.x, 0, W, g.x);
    var iy  = binOf(b.y, 0, H, g.y);
    var idx = binOf(b.vx, -V, V, g.dx);
    var idy = binOf(b.vy, -V, V, g.dy);
    var ip  = binOf(state.left.y, 0, H - C.PADDLE_H, g.pad);
    var irp = binOf(state.right.y, 0, H - C.PADDLE_H, g.pad);
    el.innerHTML =
      '<div class="xp-state-head">state ' + encodeState(g) + ' / ' + gridTotal(g) + '</div>' +
      '<div class="xp-state-row"><span>' + gt('r2_dim_ballx', 'Ball X') + '</span><b>' + ix + '</b></div>' +
      '<div class="xp-state-row"><span>' + gt('r2_dim_bally', 'Ball Y') + '</span><b>' + iy + '</b></div>' +
      '<div class="xp-state-row"><span>' + gt('r2_dim_dir', 'Direction') + '</span><b>' + idx + ' / ' + g.dx + '</b></div>' +
      '<div class="xp-state-row"><span>' + gt('r2_dim_speed', 'Speed') + '</span><b>' + idy + ' / ' + g.dy + '</b></div>' +
      '<div class="xp-state-row"><span>' + gt('r2_dim_leftpad', 'Left paddle') + '</span><b>' + ip + ' / ' + g.pad + '</b></div>' +
      '<div class="xp-state-row xp-state-out"><span>' + gt('r2_dim_rightpad', 'Right paddle') + '</span><b>' + irp + ' / ' + g.pad + '</b></div>';
  }

  // Three indicators, never a composite number: quality, spread, speed.
  function renderStats() {
    var el = document.getElementById('r2-stats');
    if (!el) return;
    var ends = [], k;
    for (k = 0; k < curves.length; k++) {
      var c2 = curves[k];
      if (c2.length) ends.push(c2[c2.length - 1].q);
    }
    var lastQ = ends.length ? ends[ends.length - 1] : 0;
    var spread = null;
    if (ends.length > 1) {
      var mean = 0, v = 0, q;
      for (q = 0; q < ends.length; q++) mean += ends[q];
      mean /= ends.length;
      for (q = 0; q < ends.length; q++) v += (ends[q] - mean) * (ends[q] - mean);
      spread = Math.sqrt(v / ends.length);
    }
    el.innerHTML =
      '<div class="xp-stat"><b>' + lastQ.toFixed(2) + '</b><span>' +
        gt('r2_stat_quality', 'returns / episode') + '</span></div>' +
      '<div class="xp-stat"><b>' + (spread === null ? '--' : spread.toFixed(2)) + '</b><span>' +
        gt('r2_stat_spread', 'spread') + ' (' + ends.length + ')</span></div>' +
      '<div class="xp-stat"><b>' + (stepsPerSec ? Math.round(stepsPerSec / 1000) + 'k' : '--') + '</b><span>' +
        gt('r2_stat_speed', 'steps / s') + '</span></div>';
  }

  function drawGrid() {
    var g = GRIDS[gridKey];
    if (!g) return;
    var cw = W / g.x, ch = H / g.y;

    if (state && state.ball) {
      var a = toRGB(colors.accent);
      ctx.fillStyle = 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',0.12)';
      ctx.fillRect(binOf(state.ball.x, 0, W, g.x) * cw,
                   binOf(state.ball.y, 0, H, g.y) * ch, cw, ch);
    }

    var c = toRGB(colors.line);
    ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 1; i < g.x; i++) {
      var px = Math.round(W * i / g.x) + 0.5;
      ctx.moveTo(px, 0); ctx.lineTo(px, H);
    }
    for (var j = 1; j < g.y; j++) {
      var py = Math.round(H * j / g.y) + 0.5;
      ctx.moveTo(0, py); ctx.lineTo(W, py);
    }
    ctx.stroke();
  }

  function draw() {
    var ball = state.ball, left = state.left, right = state.right;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    drawGrid();
    renderStateTable();

    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 14]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    if (heatOn) drawHeatmap();
    if (rayOn) drawRay();

    ctx.fillStyle = colors.fg;
    ctx.fillRect(C.PADDLE_M, left.y, C.PADDLE_W, C.PADDLE_H);
    ctx.fillRect(W - C.PADDLE_M - C.PADDLE_W, right.y, C.PADDLE_W, C.PADDLE_H);

    ctx.fillStyle = colors.accent;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, C.BALL_R, 0, Math.PI * 2); ctx.fill();

    if (rayOn) {
      var rr = toRGB(colors.accent);
      ctx.strokeStyle = 'rgba(' + rr[0] + ',' + rr[1] + ',' + rr[2] + ',0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ball.x, ball.y, C.BALL_R + 4, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.restore();
  }

  // --- loop: only the live evaluation episode advances the world; bulk
  // headless training leaves the court still (it doesn't touch `state`) ---
  function frame() {
    if (liveEval) liveStep();
    draw();
    raf = requestAnimationFrame(frame);
  }

  // --- HUD wiring (i18n via window.xpong.t with EN fallback) ---
  var elStatus, elTglRay, elTglHeat, elLblRay, elLblHeat, elBtnTrain;
  function gt(key, en) {
    return (window.xpong && window.xpong.t) ? window.xpong.t(key) : en;
  }
  function updateHUD() {
    if (elTglHeat) elTglHeat.checked = heatOn;
    if (elLblHeat) elLblHeat.textContent = (heatOn ? gt('x_heat_on', 'Heatmap: on')
                                                   : gt('x_heat_off', 'Heatmap: off'));
    if (elTglRay) elTglRay.checked = rayOn;
    if (elLblRay) elLblRay.textContent = (rayOn ? gt('x_ray_on', 'X-Ray: on')
                                                : gt('x_ray_off', 'X-Ray: off'));
    if (elStatus) {
      if (liveEval) {
        elStatus.textContent = gt('r2_status_watching', 'Watching the agent play');
      } else if (trainRun) {
        elStatus.textContent = gt('r2_status_training', 'Training\u2026') + ' ' + trainEp + ' / ' + TRAIN_EPISODES;
      } else if (trainEp > 0 && trainEp >= TRAIN_EPISODES) {
        elStatus.textContent = gt('r2_status_done', 'Training complete');
      } else {
        elStatus.textContent = gt('r2_status_idle', 'Press Train to begin');
      }
    }
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
    elStatus   = document.getElementById('xp-game-status');
    elTglRay   = document.getElementById('xp-toggle-ray');
    elTglHeat  = document.getElementById('xp-toggle-heat');
    elLblRay   = document.getElementById('xp-lbl-ray');
    elLblHeat  = document.getElementById('xp-lbl-heat');
    elBtnTrain = document.getElementById('r2-btn-train');

    var btnReset = document.getElementById('xp-btn-reset');
    if (btnReset)  btnReset.addEventListener('click', resetTraining);
    if (elTglRay)  elTglRay.addEventListener('change', function () { rayOn = elTglRay.checked; updateHUD(); draw(); });
    if (elTglHeat) elTglHeat.addEventListener('change', function () { heatOn = elTglHeat.checked; updateHUD(); draw(); });

    chart = document.getElementById('r2-chart');
    if (chart) {
      chartCtx = chart.getContext('2d');
      cdpr = window.devicePixelRatio || 1;
      chart.width = 800 * cdpr; chart.height = 300 * cdpr;
    }

    if (elBtnTrain) elBtnTrain.addEventListener('click', function () {
      if (trainRun || liveEval) return;   // guard; button is also disabled while active
      trainStart();
      var wrap = document.querySelector('.xp-chart-wrap');
      if (wrap && wrap.scrollIntoView) wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    var segIn = document.querySelectorAll('input[name="r2-grid"]');
    for (var si = 0; si < segIn.length; si++) {
      segIn[si].addEventListener('change', function (ev) {
        gridKey = ev.target.value;
        draw();
      });
    }

    readColors();
    newLiveState();
    drawChart();
    renderStats();
    updateHUD();
    resize();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', resize);
    window.addEventListener('xpong:langchange', function () { updateHUD(); renderStats(); renderStateTable(); });

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
