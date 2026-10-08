/* 카드: 자유투 10번 중 몇 번 들어갈까? — B(n, p)의 막대그래프, P(X = r) 계산식, 평균 np와 σ = √npq */
(() => {
  const root = document.getElementById("card-stat-binom-shape");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const S = NMStat;
  const $ = (s) => root.querySelector(s), sn = $(".n"), sp = $(".p"), sr = $(".r");
  const { ctx, size } = fit($("canvas"), () => draw());
  const niceMax = (m) => { for (const t of [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1]) if (m <= t) return t; return 1; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, p = +sp.value, r = +sr.value, d = S.binom(n, p);
    const ym = niceMax(Math.max(...d) * 1.12), x0 = 40, y0 = 26, gw = w - x0 - 12, gh = h - y0 - 30;
    const X = (k) => x0 + (k + 0.5) / (n + 1) * gw, Y = (v) => y0 + (ym - v) / ym * gh;
    const step = n <= 12 ? 1 : n <= 30 ? 5 : 10, xt = [];
    for (let k = 0; k <= n; k += step) xt.push([k, String(k)]);
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt, yt: [0, ym / 2, ym].map((v) => [v, S.short(v, 3)]) });
    const bw = Math.max(1.5, gw / (n + 1) * 0.72);
    d.forEach((v, k) => { ctx.fillStyle = k === r ? C.warn : C.sprout; ctx.fillRect(X(k) - bw / 2, Y(v), bw, Y(0) - Y(v)); if (k !== r && bw > 5) { ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.strokeRect(X(k) - bw / 2 + 0.5, Y(v) + 0.5, bw - 1, Math.max(0, Y(0) - Y(v) - 1)); } });
    const m = n * p, s = Math.sqrt(n * p * (1 - p)), Xc = (x) => x0 + (x + 0.5) / (n + 1) * gw;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(Xc(m), y0 + 8); ctx.lineTo(Xc(m), Y(0)); ctx.stroke(); ctx.setLineDash([]);
    const by = y0 - 10;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(Xc(m - s), by); ctx.lineTo(Xc(m + s), by); ctx.moveTo(Xc(m - s), by - 5); ctx.lineTo(Xc(m - s), by + 5); ctx.moveTo(Xc(m + s), by - 5); ctx.lineTo(Xc(m + s), by + 5); ctx.stroke();
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textBaseline = "middle";
    const lab = `np ± σ`, tw = ctx.measureText(lab).width, right = Xc(m + s) + 8 + tw < w - 4;
    ctx.textAlign = right ? "left" : "right"; ctx.fillText(lab, right ? Xc(m + s) + 8 : Xc(m - s) - 8, by);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic"; ctx.fillText("성공 횟수 r", x0 + gw, h - 2);
  }

  function update() {
    const n = +sn.value, p = +sp.value;
    sr.max = n; if (+sr.value > n) sr.value = n;
    const r = +sr.value, q = 1 - p, d = S.binom(n, p);
    $(".n-out").textContent = n; $(".p-out").textContent = p.toFixed(2); $(".r-out").textContent = r;
    $(".eq").innerHTML = `P(<i>X</i> = ${r}) = <sub>${n}</sub>C<sub>${r}</sub> × ${p.toFixed(2)}<sup>${r}</sup> × ${q.toFixed(2)}<sup>${n - r}</sup> ≈ <b>${S.fmt(d[r], 4)}</b>`;
    $(".n-e").textContent = S.short(n * p, 2); $(".n-v").textContent = S.short(n * p * q, 4); $(".n-s").textContent = S.fmt(Math.sqrt(n * p * q), 3);
    draw();
  }
  [sn, sp, sr].forEach((s) => s.addEventListener("input", update));
  update();
})();
