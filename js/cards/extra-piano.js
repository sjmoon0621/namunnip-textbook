/* 카드: 평균율의 화음과 순정한 화음은 귀로 구별될까? — 건반, 소리, 센트 차이 */
(() => {
  const root = document.getElementById("card-extra-piano");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = root.querySelector("canvas");
  const dNote = $(".note"), dFreq = $(".freq"), dCent = $(".cent");
  const NAMES = ["도", "도♯", "레", "레♯", "미", "파", "파♯", "솔", "솔♯", "라", "라♯", "시", "도"];
  const JUST = [1, 16 / 15, 9 / 8, 6 / 5, 5 / 4, 4 / 3, 45 / 32, 3 / 2, 8 / 5, 5 / 3, 9 / 5, 15 / 8, 2];
  const BLACK = [1, 3, 6, 8, 10];
  const C4 = 261.63;
  let tune = "eq", last = null, actx = null;
  const freq = (k) => C4 * (tune === "eq" ? 2 ** (k / 12) : JUST[k]);
  const cents = (k) => 1200 * Math.log2(2 ** (k / 12) / JUST[k]);

  function play(ks) {
    if (!actx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; actx = new A(); }
    const now = actx.currentTime, dur = ks.length > 1 ? 2.6 : 1.2;
    for (const k of ks) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "triangle"; o.frequency.value = freq(k);
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.18 / ks.length, now + 0.02);
      g.gain.setValueAtTime(0.18 / ks.length, now + dur - 0.3); g.gain.linearRampToValueAtTime(0, now + dur);
      o.connect(g).connect(actx.destination); o.start(now); o.stop(now + dur + 0.05);
    }
  }
  // 건반 배치 (흰 건반 8개: 도~높은 도)
  const WHITE = [0, 2, 4, 5, 7, 9, 11, 12];
  function keyRects(w, h) {
    const kh = h * 0.52, ww = (w - 12) / WHITE.length, out = [];
    WHITE.forEach((k, i) => out.push({ k, x: 6 + i * ww, y: 6, w: ww, h: kh, black: false }));
    BLACK.forEach((k) => {
      const i = WHITE.indexOf(k - 1);
      out.push({ k, x: 6 + (i + 1) * ww - ww * 0.3, y: 6, w: ww * 0.6, h: kh * 0.6, black: true });
    });
    return out;
  }
  const V = fit(cv, () => draw());
  function draw() {
    const { ctx, size: { w, h } } = V; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const keys = keyRects(w, h);
    for (const r of keys.filter((q) => !q.black)) {
      ctx.fillStyle = r.k === last ? C.sprout : "#fff"; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = C.ink2; ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(NAMES[r.k], r.x + r.w / 2, r.y + r.h - 8);
    }
    for (const r of keys.filter((q) => q.black)) {
      ctx.fillStyle = r.k === last ? C.forest : C.ink; ctx.fillRect(r.x, r.y, r.w, r.h);
    }
    // 센트 막대: 평균율이 순정보다 얼마나 넓은가
    const top = h * 0.52 + 22, bh = h - top - 18, mid = top + bh / 2, sc = bh / 2 / 20;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(6, mid + .5); ctx.lineTo(w - 6, mid + .5); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("평균율 − 순정 (센트, ±20)", 6, top - 6);
    const bw = (w - 12) / 13;
    for (let k = 1; k <= 12; k++) {
      const c = cents(k), x = 6 + k * bw;
      ctx.fillStyle = Math.abs(c) > 10 ? C.warn : C.forest;
      ctx.fillRect(x - bw * 0.3, c > 0 ? mid - c * sc : mid, bw * 0.6, Math.abs(c) * sc);
      ctx.fillStyle = C.ink3; ctx.textAlign = "center";
      ctx.fillText(NAMES[k].replace("♯", "#"), x, h - 4);
    }
  }
  function show(k) {
    last = k;
    dNote.textContent = NAMES[k];
    dFreq.textContent = `${freq(k).toFixed(2)} Hz`;
    const c = tune === "eq" ? cents(k) : 0;
    dCent.textContent = `${c >= 0 ? "+" : ""}${c.toFixed(1)}센트`;
    draw();
  }
  cv.addEventListener("click", (e) => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const keys = keyRects(b.width, b.height);
    const hit = keys.filter((r) => r.black).find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h)
      || keys.filter((r) => !r.black).find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    if (hit) { show(hit.k); play([hit.k]); }
  });
  root.querySelectorAll("[data-tune]").forEach((b) => b.addEventListener("click", () => {
    tune = b.dataset.tune;
    root.querySelectorAll("[data-tune]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    if (last !== null) show(last);
  }));
  root.querySelectorAll("[data-chord]").forEach((b) => b.addEventListener("click", () => {
    const ks = b.dataset.chord.split(",").map(Number);
    show(ks[ks.length - 1]); play(ks);
  }));
  draw();
})();
