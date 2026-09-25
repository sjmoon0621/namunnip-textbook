/* 카드 1.3.1: 여러 번 재면 오차가 사라질까? — 스톱워치 측정의 우연 오차와 계통 오차 (모식) */
(() => {
  const root = document.getElementById("card-is1-error");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), ten = $(".ten"), late = $(".late");
  const dN = $(".n"), dMean = $(".mean"), dSd = $(".sd"), dSe = $(".se");

  const TRUE = 2 * Math.PI * Math.sqrt(1 / 9.81); // 2.006 s
  const SIG = 0.06, BIAS = 0.1;                   // 한 번 누를 때의 흔들림, 늦게 누르는 버릇
  const X0 = 1.80, X1 = 2.30, BW = 0.01;          // 막대그래프 범위와 칸 폭
  let data = [];

  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const one = () => {
    const n = ten.checked ? 10 : 1;               // 한 번 잰 시간 = n주기 + 누르는 오차 (+ 버릇)
    const t = n * TRUE + SIG * gauss() + (late.checked ? BIAS : 0);
    return t / n;
  };
  function add(k) { for (let i = 0; i < k; i++) data.push(one()); update(); }

  function stats() {
    const n = data.length; if (!n) return null;
    const m = data.reduce((a, b) => a + b, 0) / n;
    const sd = n > 1 ? Math.sqrt(data.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1)) : 0;
    return { n, m, sd, se: n > 1 ? sd / Math.sqrt(n) : NaN };
  }

  const { ctx, size } = fit(cv, () => draw());

  function update() {
    const s = stats();
    dN.textContent = s ? s.n : 0;
    dMean.textContent = s ? s.m.toFixed(3) : "—";
    dSd.textContent = s && s.n > 1 ? s.sd.toFixed(3) : "—";
    dSe.textContent = s && s.n > 1 ? "±" + s.se.toFixed(3) : "—";
    draw();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 34, padR = 10, padT = 26, padB = 34, pw = w - padL - padR, ph = h - padT - padB;
    const nb = Math.round((X1 - X0) / BW), bins = new Array(nb).fill(0);
    let out = 0;
    for (const v of data) { const i = Math.floor((v - X0) / BW); if (i >= 0 && i < nb) bins[i]++; else out++; }
    const top = Math.max(5, ...bins);
    const X = (v) => padL + (v - X0) / (X1 - X0) * pw, Y = (c) => padT + (1 - c / top) * ph;
    const yStep = top <= 10 ? 2 : top <= 25 ? 5 : top <= 60 ? 10 : top <= 150 ? 25 : 50;
    const yt = []; for (let c = 0; c <= top; c += yStep) yt.push([c, String(c)]);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [1.8, 1.9, 2.0, 2.1, 2.2, 2.3].map((v) => [v, v.toFixed(1)]), yt, ylabel: "횟수", xlabel: "잰 주기 (s)" });
    // 막대
    ctx.fillStyle = "rgba(35,35,38,.72)";
    bins.forEach((c, i) => { if (!c) return; const x = X(X0 + i * BW); ctx.fillRect(x + .5, Y(c), Math.max(1, pw / nb - 1), padT + ph - Y(c)); });
    // 참값
    const xt = X(TRUE);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(xt, padT - 4); ctx.lineTo(xt, padT + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.forest;
    const tl = "참값 2.006 s (실제로는 모름)", tw = ctx.measureText(tl).width;
    ctx.textAlign = "left"; void tw;
    ctx.fillText(tl, xt + 5, padT - 8);
    // 평균과 불확도 띠
    const s = stats();
    if (s) {
      const xm = X(s.m);
      if (s.n > 1) {
        ctx.fillStyle = "rgba(181,83,47,.18)";
        const a = X(s.m - s.se), b = X(s.m + s.se);
        ctx.fillRect(a, padT, Math.max(2, b - a), ph);
      }
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xm, padT); ctx.lineTo(xm, padT + ph); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.font = `600 11px ${F.sans}`;
      ctx.fillText(`평균 ${s.m.toFixed(3)} s`, xm + 5, padT + 14);
    } else {
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.font = `12.5px ${F.sans}`;
      ctx.fillText("‘1번 재기’나 ‘10번 재기’를 눌러 보세요", padL + pw / 2, padT + ph / 2);
    }
    if (out) { ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.font = `10.5px ${F.mono}`; ctx.fillText(`범위 밖 ${out}개`, padL + pw, padT + 14); }
  }

  $(".m1").addEventListener("click", () => add(1));
  $(".m10").addEventListener("click", () => add(10));
  $(".clear").addEventListener("click", () => { data = []; update(); });
  [ten, late].forEach((el) => el.addEventListener("change", () => { data = []; add(20); }));
  add(20);
})();
