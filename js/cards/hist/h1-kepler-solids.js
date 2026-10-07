/* 카드: 정다면체 다섯 개로 행성의 거리를 설명할 수 있을까? — 케플러의 정다면체 우주 모형과 실제 궤도 비교 */
(() => {
  const root = document.getElementById("card-hist-kepler-solids");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const SOL = { oct: ["정팔면체", Math.sqrt(3)], ico: ["정이십면체", 1.2584086], dod: ["정십이면체", 1.2584086], tet: ["정사면체", 3], cube: ["정육면체", Math.sqrt(3)] };
  const KEYS = Object.keys(SOL);
  const KEPLER = ["oct", "ico", "dod", "tet", "cube"];
  const PL = ["수성", "금성", "지구", "화성", "목성", "토성"], A = [0.3871, 0.7233, 1.0, 1.5237, 5.2026, 9.5549];
  const ACT = A.slice(1).map((a, i) => a / A[i]);
  const sels = [...root.querySelectorAll("select.g")];
  sels.forEach((s) => { s.innerHTML = KEYS.map((k) => `<option value="${k}">${SOL[k][0]}</option>`).join(""); });
  let order = KEPLER.slice(), hist = null;
  const err = (o) => o.reduce((s, k, i) => s + Math.abs(Math.log(SOL[k][1] / ACT[i])), 0) / 5;
  function perms(a) { if (a.length <= 1) return [a]; const out = []; a.forEach((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).forEach((p) => out.push([x, ...p]))); return out; }
  const ALL = perms(KEYS).map(err).sort((x, y) => x - y);
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pred = [A[0]]; order.forEach((k, i) => pred.push(pred[i] * SOL[k][1]));
    /* 왼쪽: 로그 눈금 동심원 */
    const cx = w * 0.24, cy = h * 0.52, R = Math.min(w * 0.22, h * 0.46), lo = Math.log(0.25), hi = Math.log(14);
    const rr = (a) => R * (Math.log(a) - lo) / (hi - lo);
    ctx.lineWidth = 1;
    A.forEach((a, i) => {
      ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(cx, cy, rr(a), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, rr(Math.min(pred[i], 13.9)), 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1;
    });
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.textAlign = "center";
    A.forEach((a, i) => { const r = rr(a); ctx.fillStyle = "rgba(251,251,248,.85)"; const y = i % 2 ? cy + r + 4 : cy - r - 4; ctx.fillRect(cx - 13, y - 7, 26, 12); ctx.fillStyle = C.ink2; ctx.fillText(PL[i], cx, y + 3); });
    ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.fillText("— 정다면체 예측", 6, h - 22); ctx.fillStyle = C.ink3; ctx.fillText("- - 실제 궤도", 6, h - 8);

    /* 오른쪽: 거리 비 막대 */
    const x0 = w * 0.54, x1 = w - 12, y0 = 22, y1 = hist ? h * 0.48 : h - 40, ymax = 3.6;
    const bw = (x1 - x0) / 5, Y = (v) => y1 - v / ymax * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X: (v) => v, Y, yt: [[1, "1"], [2, "2"], [3, "3"]], ylabel: "바깥 궤도 ÷ 안쪽 궤도" });
    order.forEach((k, i) => {
      const xc = x0 + bw * (i + 0.5);
      ctx.fillStyle = "#c9ccc4"; ctx.fillRect(xc - bw * 0.28, Y(ACT[i]), bw * 0.56, y1 - Y(ACT[i]));
      ctx.strokeStyle = C.forest; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xc - bw * 0.36, Y(SOL[k][1])); ctx.lineTo(xc + bw * 0.36, Y(SOL[k][1])); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(`${PL[i]}–${PL[i + 1]}`, xc, y1 + 13);
      ctx.fillStyle = C.forest; ctx.fillText(SOL[k][0], xc, y1 + 26);
    });
    ctx.textAlign = "right"; ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("회색: 실제   초록 선: 예측", x1, y0 - 7);
    /* 120가지 순서의 어긋남 분포 */
    if (hist) {
      const hy0 = h * 0.72, hy1 = h - 22, bins = 16, emax = 0.5, cnt = new Array(bins).fill(0);
      ALL.forEach((e) => { cnt[Math.min(bins - 1, Math.floor(e / emax * bins))]++; });
      const m = Math.max(...cnt), bwid = (x1 - x0) / bins;
      cnt.forEach((c, i) => { ctx.fillStyle = "#b9c7b2"; const hh = c / m * (hy1 - hy0); ctx.fillRect(x0 + i * bwid + 1, hy1 - hh, bwid - 2, hh); });
      const e = err(order), xe = x0 + Math.min(e, emax) / emax * (x1 - x0);
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xe, hy0 - 6); ctx.lineTo(xe, hy1); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
      [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach((v) => ctx.fillText(`${Math.round(v * 100)}%${v === 0.5 ? "+" : ""}`, x0 + v / emax * (x1 - x0), hy1 + 12));
      ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillText("120가지 순서의 평균 어긋남 분포 (빨간 선: 지금 순서)", x0, hy0 - 10);
    }
  }
  function update() {
    sels.forEach((s, i) => { s.value = order[i]; });
    const e = err(order), rank = 1 + ALL.filter((x) => x < e - 1e-9).length, ties = ALL.filter((x) => Math.abs(x - e) < 1e-9).length;
    $(".n-err").textContent = `약 ${(e * 100).toFixed(0)} %`;
    $(".n-rank").textContent = `${rank}번째` + (ties > 1 ? ` (같은 값 ${ties}개)` : "");
    const used = new Set(order).size;
    const pred = order.reduce((p, k) => p * SOL[k][1], A[0]);
    $(".n-sat").textContent = `${pred.toFixed(2)} / ${A[5].toFixed(2)} AU` + (used < 5 ? " · 같은 입체를 두 번 썼습니다" : "");
    draw();
  }
  sels.forEach((s) => s.addEventListener("change", () => { order[+s.dataset.i] = s.value; update(); }));
  $(".kep").addEventListener("click", () => { order = KEPLER.slice(); update(); });
  $(".shuf").addEventListener("click", () => { order = KEYS.slice().sort(() => Math.random() - 0.5); update(); });
  $(".all").addEventListener("click", () => { hist = true; update(); });
  if (window.NMLab && NMLab.demo) hist = true;
  update();
})();
