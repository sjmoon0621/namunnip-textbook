/* 카드: (x + h)ⁿ을 전개하면 왜 nxⁿ⁻¹만 남을까? — 이항 전개 → xⁿ 빼기 → h로 나누기 → h → 0 네 단계와 파스칼의 삼각형 */
(() => {
  const root = document.getElementById("card-calc1-power-rule");
  if (!root) return;
  const { C, F, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const sn = $(".sn"), sx = $(".sx"), st = $(".st");
  const ROWS = 6;
  let step = 0;
  const { ctx, size } = fit($("canvas"), () => draw());
  const comb = (N, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (N - i + 1) / i; return Math.round(r); };
  const pw = (v, e) => (e === 0 ? "" : e === 1 ? `<i>${v}</i>` : `<i>${v}</i><sup>${e}</sup>`);
  /* 항 c·x^p·h^q */
  const term = (c, p, q) => { const body = pw("x", p) + pw("h", q); return (c === 1 && body ? "" : String(c)) + body; };
  const sum = (ts) => (ts.length > 5 ? [...ts.slice(0, 3), "…", ts[ts.length - 1]] : ts).join(" + ");

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const N = +sn.value, rh = (h - 20) / (ROWS + 1), cw = Math.min(w / (ROWS + 2), rh * 1.25);
    const fs = Math.max(10, Math.min(15, cw * 0.36));
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let r = 0; r <= ROWS; r++) {
      const y = 12 + rh * (r + 0.5);
      ctx.font = `500 ${fs - 1}px ${F.mono}`; ctx.fillStyle = r === N ? C.ink : C.ink3;
      ctx.textAlign = "left"; ctx.fillText(`n=${r}`, 4, y); ctx.textAlign = "center";
      for (let k = 0; k <= r; k++) {
        const x = w / 2 + (k - r / 2) * cw, on = r === N;
        /* 단계마다 남는 항: 1 전개 = 모두, 2 xⁿ 빼기 = k ≥ 1, 3 나누기 = k ≥ 1, 4 극한 = k = 1 */
        const live = on && step >= 1 && (step === 1 || (step < 4 ? k >= 1 : k === 1));
        const gone = on && step >= 2 && !live;
        if (live) {
          ctx.fillStyle = k === 1 ? C.amber : C.sprout; ctx.globalAlpha = k === 1 ? 0.55 : 0.6;
          ctx.beginPath(); ctx.arc(x, y, Math.min(cw, rh) * 0.42, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        }
        ctx.font = `${on ? 700 : 500} ${fs}px ${F.mono}`;
        ctx.fillStyle = gone ? C.ink3 : on ? C.ink : C.ink2;
        ctx.fillText(String(comb(r, k)), x, y);
        if (gone) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - cw * 0.3, y + rh * 0.25); ctx.lineTo(x + cw * 0.3, y - rh * 0.25); ctx.stroke(); }
      }
    }
  }

  function update() {
    const N = +sn.value, x = +sx.value, hh = Math.pow(10, -st.value);
    $(".n-out").textContent = N; $(".x-out").textContent = n(x, 1); $(".h-out").textContent = n(hh, 4);
    const all = [], rest = [], div = [];
    for (let k = 0; k <= N; k++) all.push(term(comb(N, k), N - k, k));
    for (let k = 1; k <= N; k++) { rest.push(term(comb(N, k), N - k, k)); div.push(term(comb(N, k), N - k, k - 1) || "1"); }
    const lead = term(N, N - 1, 0) || "1";
    const L = [
      "단계 버튼을 눌러 (<i>x</i> + <i>h</i>)<sup><i>n</i></sup>의 평균변화율을 정리해 보세요.",
      `① (<i>x</i> + <i>h</i>)<sup>${N}</sup> = ${sum(all)}`,
      `② (<i>x</i> + <i>h</i>)<sup>${N}</sup> − ${term(1, N, 0)} = ${sum(rest)}`,
      `③ ((<i>x</i> + <i>h</i>)<sup>${N}</sup> − ${term(1, N, 0)})/<i>h</i> = ${sum(div)}`,
      `④ <i>h</i> → 0이면 <i>h</i>가 붙은 항이 모두 0으로 가므로 (${term(1, N, 0)})′ = ${lead}`,
    ];
    $(".eq").innerHTML = L[step];
    $(".go-step").textContent = step < 4 ? `다음 단계 (${step + 1}/4)` : "처음부터";
    const avg = ((x + hh) ** N - x ** N) / hh, ex = N * x ** (N - 1);
    $(".n-avg").textContent = n(avg, 6); $(".n-ex").textContent = n(ex, 6); $(".n-err").textContent = n(avg - ex, 6);
    draw();
  }

  $(".go-step").addEventListener("click", () => { step = step < 4 ? step + 1 : 0; update(); });
  sn.addEventListener("input", () => { step = 0; update(); });
  [sx, st].forEach((el) => el.addEventListener("input", update));
  update();
})();
