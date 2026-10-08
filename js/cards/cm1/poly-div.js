/* 카드: 다항식의 나눗셈은 언제 멈출까? — 차수 칸에 맞춘 긴 나눗셈을 한 단계씩 */
(() => {
  const root = document.getElementById("card-cm1-poly-div");
  if (!root) return;
  const { C, F, fit } = NM;
  const P = NMPoly;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const sa = [$(".a0"), $(".a1"), $(".a2"), $(".a3")], sp = $(".p"), sq = $(".q"), dvBtns = $$(".dv .chip");
  let dB = 1, step = Infinity;
  const { ctx, size } = fit($("canvas"), () => draw());
  const one = (c, k) => { const a = new Array(k + 1).fill(0); a[k] = c; return a; };

  function plan() {
    const A = sa.map((s) => +s.value), B = dB === 1 ? [+sq.value, 1] : [+sq.value, +sp.value, 1];
    const N = 3 - dB + 1, steps = [], Q = new Array(N).fill(0);
    let r = A.slice();
    for (let s = 0; s < N; s++) {
      const top = 3 - s, qd = top - dB, c = r[top], prod = [0, 0, 0, 0];
      for (let j = 0; j <= dB; j++) prod[qd + j] = c * B[j];
      const before = r; r = r.map((v, i) => v - prod[i]); Q[qd] = c;
      steps.push({ top, qd, c, prod, rem: r, before });
    }
    return { A, B, Q, R: r.slice(0, dB), steps, N };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pl = plan(), fs = w < 380 ? 11.5 : 13, done = Math.min(step, pl.N);
    ctx.font = `${fs}px ${F.mono}`;
    const bText = P.fmt(pl.B), LW = ctx.measureText(bText).width + 26, colW = (w - LW - 6) / 4;
    const rows = 2 + 2 * pl.N, rh = Math.min(34, (h - 10) / rows), y = (i) => 6 + (i + 0.5) * rh;
    const cx = (d) => LW + (3 - d + 0.5) * colW;
    const row = (p, i, lo, hi, col, weight = 400) => {
      ctx.fillStyle = col; ctx.font = `${weight} ${fs}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      let first = true;
      for (let d = hi; d >= lo; d--) {
        const c = p[d] || 0;
        if (Math.abs(c) < 1e-9) continue;
        ctx.fillText(first ? P.term(c, d) : (c < 0 ? "− " : "+ ") + P.mono(c, d), cx(d), y(i)); first = false;
      }
      if (first) ctx.fillText("0", cx(lo), y(i));
    };
    for (let d = 3; d >= 0; d--) { ctx.fillStyle = "rgba(141,141,146,.08)"; if (d % 2) ctx.fillRect(LW + (3 - d) * colW, 0, colW, h); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ["x³", "x²", "x", "상수"].forEach((s, j) => ctx.fillText(s, LW + (j + 0.5) * colW, h - 3));
    pl.steps.forEach((s, i) => { if (i < done) { const q = one(s.c, s.qd); row(q, 0, s.qd, s.qd, i === done - 1 && step <= pl.N ? C.warn : C.forest, 600); } });
    if (!done) { ctx.fillStyle = C.ink3; ctx.font = `${fs}px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("몫", LW + 4, y(0)); }
    row(pl.A, 1, 0, 3, C.ink, 600);
    ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${F.mono}`; ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText(bText, LW - 14, y(1));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(LW - 8, y(1) + rh / 2); ctx.quadraticCurveTo(LW - 2, y(1), LW - 8, y(1) - rh / 2 + 2); ctx.lineTo(w - 6, y(1) - rh / 2 + 2); ctx.stroke();
    for (let i = 0; i < done; i++) {
      const s = pl.steps[i], cur = i === done - 1 && step <= pl.N, col = cur ? C.warn : C.ink2;
      row(s.prod, 2 + 2 * i, s.qd, s.top, col);
      ctx.fillStyle = col; ctx.font = `${fs}px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText("−)", cx(s.top) - colW / 2 + 4, y(2 + 2 * i));
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx(s.top) - colW / 2, y(2 + 2 * i) + rh / 2); ctx.lineTo(w - 6, y(2 + 2 * i) + rh / 2); ctx.stroke();
      const last = i === pl.N - 1;
      row(s.rem, 3 + 2 * i, 0, s.top - 1, last ? C.forest : C.ink, last ? 600 : 400);
      if (last) { ctx.fillStyle = C.forest; ctx.font = `600 ${fs - 1}px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("나머지", LW - 14, y(3 + 2 * i)); }
    }
  }

  function update() {
    ["a0", "a1", "a2", "a3", "p", "q"].forEach((n) => { $(`.${n}-out`).textContent = $(`.${n}`).value; });
    sp.hidden = dB === 1; $(".p-lab").hidden = dB === 1;
    const pl = plan(); if (step > pl.N) step = pl.N;
    const BQR = P.add(P.mul(pl.B, pl.Q), pl.R);
    $(".n-q").innerHTML = step === pl.N ? P.fmt(pl.Q, true) : "…";
    $(".n-r").innerHTML = step === pl.N ? P.fmt(pl.R, true) : "…";
    const H = (p) => P.fmt(p, true);
    let msg;
    if (step === 0) msg = `나누어지는 식 A = ${H(pl.A)}, 나누는 식 B = ${H(pl.B)}. 차수 칸에 맞추어 썼습니다. '다음 단계'를 누르세요.`;
    else {
      const s = pl.steps[step - 1], q = one(s.c, s.qd);
      msg = `${step}단계 · 최고차항끼리 나누기: ${H(one(s.before[s.top], s.top))} ÷ ${H(one(1, dB))} = <b>${H(q)}</b> (몫에 씀). 빼기: B × (${H(q)}) = ${H(s.prod)}, 남은 식 = ${H(P.trim(s.rem))}.`;
      if (step === pl.N) msg += ` 남은 식의 차수가 B의 차수(${dB})보다 작으므로 멈춥니다.`;
    }
    $(".msg").innerHTML = msg;
    $(".chk").innerHTML = step === pl.N
      ? `검산: B × Q + R = ${H(BQR)} ${P.sub(BQR, pl.A).every((v) => Math.abs(v) < 1e-9) ? "= A" : "≠ A"}`
      : "끝까지 나누면 B × Q + R이 A와 같은지 검산합니다.";
    draw();
  }
  $(".go-next").addEventListener("click", () => { step = Math.min(step + 1, 3); update(); });
  $(".go-all").addEventListener("click", () => { step = Infinity; update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  dvBtns.forEach((b) => b.addEventListener("click", () => { dB = +b.dataset.d; dvBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [...sa, sp, sq].forEach((s) => s.addEventListener("input", update));
  update();
})();
