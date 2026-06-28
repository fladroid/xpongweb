/* xpong — pong-core.js : pure Pong physics, no DOM, no rendering.
   Single source of truth for the rules. Consumed by game.js (play)
   and xray.js (overlay). Exposes window.xpong.PongCore.

   Design: rules are separated from presentation. Paddle movement from
   input lives in the consumer (game.js); this core only moves the ball
   and resolves collisions. stepBall() returns the collision type of the
   step so an overlay can know where a predicted ray must stop. */
(function () {
  'use strict';

  // --- field + tunables (candidates for a pre-game settings panel later) ---
  var C = {
    W: 800, H: 500,                 // logical play-field
    PADDLE_W: 12, PADDLE_H: 90, PADDLE_M: 24,
    BALL_R: 8,
    PADDLE_SPEED: 7,
    BALL_SPEED0: 5,
    BALL_SPEEDUP: 1.05,
    BALL_SPEED_MAX: 14,
    WIN_SCORE: 11
  };

  // --- factory: a fresh game state object ---
  function newState() {
    return {
      left:  { y: C.H / 2 - C.PADDLE_H / 2, vy: 0 },
      right: { y: C.H / 2 - C.PADDLE_H / 2, vy: 0 },
      ball:  { x: C.W / 2, y: C.H / 2, vx: 0, vy: 0 },
      scoreL: 0, scoreR: 0,
      winner: null
    };
  }

  // --- serve: random vertical angle, dir +1 serves right, -1 serves left ---
  function resetBall(state, dir) {
    var angle = (Math.random() * 0.5 - 0.25) * Math.PI; // -45..+45 deg
    state.ball.x = C.W / 2;
    state.ball.y = C.H / 2;
    state.ball.vx = dir * C.BALL_SPEED0 * Math.cos(angle);
    state.ball.vy = C.BALL_SPEED0 * Math.sin(angle);
  }

  function clampPaddle(p) {
    if (p.y < 0) p.y = 0;
    if (p.y > C.H - C.PADDLE_H) p.y = C.H - C.PADDLE_H;
  }

  // --- paddle bounce: reflect x, add english from hit position ---
  function bounce(ball, paddle) {
    var center = paddle.y + C.PADDLE_H / 2;
    var rel = (ball.y - center) / (C.PADDLE_H / 2);   // -1..1
    var speed = Math.min(Math.hypot(ball.vx, ball.vy) * C.BALL_SPEEDUP, C.BALL_SPEED_MAX);
    var dir = ball.vx < 0 ? 1 : -1;
    var angle = rel * (Math.PI / 3.5);                // up to ~51 deg
    ball.vx = dir * speed * Math.cos(angle);
    ball.vy = speed * Math.sin(angle);
  }

  /* Advance the ball ONE step on the given state. Pure: no input, no DOM.
     Mutates state.ball (and scores on a goal). Returns the collision type
     resolved this step, or null:
       'wall' | 'paddleL' | 'paddleR' | 'goalL' | 'goalR' | null
     A goal also sets state.scoreL/scoreR. The caller decides what to do
     next (serve, end game); the ray-caster uses the return value to stop. */
  function stepBall(state) {
    var ball = state.ball, left = state.left, right = state.right;
    var hit = null;

    ball.x += ball.vx;
    ball.y += ball.vy;

    // top/bottom walls
    if (ball.y - C.BALL_R < 0)      { ball.y = C.BALL_R;       ball.vy = -ball.vy; hit = 'wall'; }
    else if (ball.y + C.BALL_R > C.H) { ball.y = C.H - C.BALL_R; ball.vy = -ball.vy; hit = 'wall'; }

    // left paddle
    if (ball.vx < 0 &&
        ball.x - C.BALL_R < C.PADDLE_M + C.PADDLE_W &&
        ball.x - C.BALL_R > C.PADDLE_M &&
        ball.y > left.y && ball.y < left.y + C.PADDLE_H) {
      bounce(ball, left);
      ball.x = C.PADDLE_M + C.PADDLE_W + C.BALL_R;
      hit = 'paddleL';
    }
    // right paddle
    if (ball.vx > 0 &&
        ball.x + C.BALL_R > C.W - C.PADDLE_M - C.PADDLE_W &&
        ball.x + C.BALL_R < C.W - C.PADDLE_M &&
        ball.y > right.y && ball.y < right.y + C.PADDLE_H) {
      bounce(ball, right);
      ball.x = C.W - C.PADDLE_M - C.PADDLE_W - C.BALL_R;
      hit = 'paddleR';
    }

    // goals (override: a goal this step is the meaningful event)
    if (ball.x < -C.BALL_R)        { state.scoreR++; hit = 'goalR'; }
    else if (ball.x > C.W + C.BALL_R) { state.scoreL++; hit = 'goalL'; }

    return hit;
  }

  /* Cast a ray from the current ball state: clone the ball, advance it by
     pure physics until the FIRST obstacle (wall / paddle / goal) or maxSteps,
     collecting the points it passes through. Paddles are read from `state`
     at their CURRENT positions (no future input is assumed). Returns
       { points: [{x,y}...], stop: 'wall'|'paddleL'|'paddleR'|'goalL'|'goalR'|null }
     The ray stops at (and includes) the first collision point, then fades. */
  function castRay(state, maxSteps) {
    maxSteps = maxSteps || 600;
    // shallow clone: ball is advanced, paddles/scores are read-only here
    var sim = {
      ball:  { x: state.ball.x, y: state.ball.y, vx: state.ball.vx, vy: state.ball.vy },
      left:  state.left,
      right: state.right,
      scoreL: state.scoreL, scoreR: state.scoreR
    };
    var points = [{ x: sim.ball.x, y: sim.ball.y }];
    var stop = null;
    for (var i = 0; i < maxSteps; i++) {
      var hit = stepBall(sim);
      points.push({ x: sim.ball.x, y: sim.ball.y });
      if (hit) { stop = hit; break; }
    }
    return { points: points, stop: stop };
  }

  window.xpong = window.xpong || {};
  window.xpong.PongCore = {
    C: C,
    newState: newState,
    resetBall: resetBall,
    clampPaddle: clampPaddle,
    bounce: bounce,
    stepBall: stepBall,
    castRay: castRay
  };
})();
