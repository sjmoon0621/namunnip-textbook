/* 카드: 속도–시간 그래프 한 장에서 무엇을 읽을 수 있을까? — 구간별 등가속도, 기울기와 넓이 */
(() => {
  const root = document.getElementById("card-phy-vt");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), s0 = $(".v0"), o0 = $(".v0-out"), sa = [$(".a1"), $(".a2"), $(".a3")], oa = [$(".a1-out"), $(".a2-out"), $(".a3-out")], sT = $(".t"), oT = $(".t-out"), nV = $(".n-v"), nA = $(".n-a"), nX = $(".n-x"), nD = $(".n-d");
  const T = 12, DT = 0.02;
  function sim() { const a = sa.map((s) => +s.value); let v = +s0.value, x = 0, d = 0; const out = [[0, v, 0, 0, a[0]]]; for (let t = DT; t <= T + 1e-9; t += DT) { const ai = a[Math.min(2, Math.floor((t - DT / 2) / 4))], vn = v + ai * DT; x += (v + vn) / 2 * DT; d += Math.abs((v + vn) / 2) * DT; v = vn; out.push([t, v, x, d, ai]); } return out; }
  const { ctx, size } = fit(cv, () => draw());
  function panel(data, idx, x0, x1, y0, y1, label, col, tNow, fillArea) {
    const vals = data.map((p) => p[idx]), mx = Math.max(1, ...vals.map(Math.abs)) * 1.15, X = (t) => x0 + t / T * (x1 - x0), Y = (v) => (y0 + y1) / 2 - v / mx * (y1 - y0) / 2 * -1;
    const Yc = (v) => (y0 + y1) / 2 - v / mx * (y0 - y1) / 2;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Yc(0)); ctx.lineTo(x1, Yc(0)); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.stroke();
    [4, 8].forEach((t) => { ctx.strokeStyle = "rgba(141,141,146,.25)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(t), y0); ctx.lineTo(X(t), y1); ctx.stroke(); ctx.setLineDash([]); });
    if (fillArea) { data.forEach((p) => { if (p[0] > tNow) return; ctx.fillStyle = p[idx] >= 0 ? "rgba(63,111,163,.22)" : "rgba(181,83,47,.25)"; ctx.fillRect(X(p[0]) - 0.5, Math.min(Yc(0), Yc(p[idx])), (x1 - x0) * DT / T + 1, Math.abs(Yc(p[idx]) - Yc(0))); }); }
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); data.forEach((p, i) => (i ? ctx.lineTo(X(p[0]), Yc(p[idx])) : ctx.moveTo(X(p[0]), Yc(p[idx])))); ctx.stroke();
    const cur = data[Math.round(tNow / DT)]; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(tNow), Yc(cur[idx]), 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.font = `600 10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(label, x1 - 4, y1 + 11);
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(mx.toFixed(0), x0 - 3, y1 + 8); ctx.fillText((-mx).toFixed(0), x0 - 3, y0);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const d = sim(), t = +sT.value, x0 = 34, x1 = w - 12, gap = 8, ph = (h - 30 - gap) / 2;
    panel(d, 1, x0, x1, 12 + ph, 12, "속도 v (m/s) — 기울기 = 가속도, 넓이 = 변위", "#3f6fa3", t, true);
    panel(d, 2, x0, x1, 12 + 2 * ph + gap, 12 + ph + gap, "위치 x (m) — 기울기 = 속도", C.warn, t, false);
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center"; [0, 4, 8, 12].forEach((s) => ctx.fillText(`${s} s`, x0 + s / T * (x1 - x0), h - 6));
  }
  function update() {
    o0.textContent = s0.value; sa.forEach((s, i) => (oa[i].textContent = s.value)); const t = +sT.value; oT.textContent = t.toFixed(1);
    const d = sim(), p = d[Math.round(t / DT)]; nV.textContent = `${p[1].toFixed(1)} m/s ${p[1] < -0.05 ? "(왼쪽으로)" : ""}`; nA.textContent = `${p[4]} m/s²`; nX.textContent = `${p[2].toFixed(1)} m`; nD.textContent = `${p[3].toFixed(1)} m`;
    draw();
  }
  [s0, ...sa, sT].forEach((s) => s.addEventListener("input", update)); update();
})();
