/* 카드: 키르히호프 법칙 — 전지 두 개, 저항 세 개의 두 고리 회로. 가정한 전류 방향으로 식을 세우고 풀기 */
(() => {
  const root = document.getElementById("card-adphy-kirchhoff");
  if (!root) return;
  const { C: COL, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), eqBox = $(".eq");
  const S = {}; ["e1", "e2", "r1", "r2", "r3"].forEach((k) => { S[k] = $("." + k); S[k + "o"] = $("." + k + "-out"); });
  const nP = $(".n-p"), nH = $(".n-h"), nV = $(".n-v");
  const dir = { 1: 1, 2: 1, 3: -1 }; /* +1 = 위쪽(B→A)으로 가정 */
  const PRE = { same: [12, 6, 4, 6, 8], charge: [12, 3, 2, 4, 20], flip: [12, -6, 4, 6, 8] };
  let t = 0;
  function solve() {
    const e1 = +S.e1.value, e2 = +S.e2.value, R1 = +S.r1.value, R2 = +S.r2.value, R3 = +S.r3.value;
    const V = (e1 / R1 + e2 / R2) / (1 / R1 + 1 / R2 + 1 / R3);
    return { e1, e2, R1, R2, R3, V, u: { 1: (e1 - V) / R1, 2: (e2 - V) / R2, 3: -V / R3 } };
  }
  const { ctx, size } = fit(cv, () => draw());
  /* 각 가지의 경로: 아래 접합점 B(y = yb)에서 위 접합점 A(y = ya)까지 */
  function geo() {
    const { w, h } = size, ya = 34, yb = h - 30;
    return { ya, yb, x: { 1: w * 0.16, 3: w * 0.5, 2: w * 0.84 } };
  }
  const potCol = (v, lo, hi) => { const a = hi > lo ? (v - lo) / (hi - lo) : .5; const c0 = [63, 111, 163], c1 = [212, 73, 58]; return `rgb(${c0.map((c, i) => Math.round(c + (c1[i] - c) * a)).join(",")})`; };
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = solve(), g = geo(), lo = Math.min(0, s.V, -s.u[1] * s.R1, -s.u[2] * s.R2), hi = Math.max(0, s.V, -s.u[1] * s.R1, -s.u[2] * s.R2);
    const seg = (x0, y0, x1, y1, v) => { ctx.strokeStyle = potCol(v, lo, hi); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
    /* 위·아래 도선 */
    seg(g.x[1], g.ya, g.x[2], g.ya, s.V); seg(g.x[1], g.yb, g.x[2], g.yb, 0);
    const mid = (g.ya + g.yb) / 2, rH = 40, bH = 18;
    const resistor = (x, yc, lab) => {
      ctx.fillStyle = COL.card; ctx.fillRect(x - 10, yc - rH / 2, 20, rH); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x - 10, yc - rH / 2, 20, rH);
      ctx.fillStyle = COL.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(lab, x + 15, yc + 4);
    };
    const battery = (x, yc, e, lab) => {
      ctx.fillStyle = COL.card; ctx.fillRect(x - 16, yc - bH / 2, 32, bH);
      const up = e >= 0; /* 긴 판(+)이 위쪽이면 up */
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 15, up ? yc - 5 : yc + 5); ctx.lineTo(x + 15, up ? yc - 5 : yc + 5); ctx.stroke();
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 7, up ? yc + 5 : yc - 5); ctx.lineTo(x + 7, up ? yc + 5 : yc - 5); ctx.stroke();
      ctx.fillStyle = COL.ink; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${lab} ${Math.abs(e)} V`, x + 20, yc + 4);
      ctx.fillStyle = COL.apple; ctx.font = `bold 11px ${F.mono}`; ctx.fillText("+", x - 26, up ? yc - 3 : yc + 11);
    };
    [[1, s.e1, s.R1, "ε₁", "R₁"], [2, s.e2, s.R2, "ε₂", "R₂"]].forEach(([i, e, R, le, lr]) => {
      const x = g.x[i], yr = mid + 46, ybt = mid - 46, vr = -s.u[i] * R;
      seg(x, g.yb, x, yr, 0); seg(x, yr, x, ybt, vr); seg(x, ybt, x, g.ya, s.V);
      resistor(x, yr, `${lr} ${R} Ω`); battery(x, ybt, e, le);
    });
    seg(g.x[3], g.yb, g.x[3], mid, 0); seg(g.x[3], mid, g.x[3], g.ya, s.V); resistor(g.x[3], mid, `R₃ ${s.R3} Ω`);
    /* 실제 전류: 움직이는 점 */
    [1, 2, 3].forEach((i) => {
      const u = s.u[i], x = g.x[i], L = g.yb - g.ya, n = 6;
      for (let k = 0; k < n; k++) {
        let f = ((k / n + t * u * 0.04) % 1 + 1) % 1; const y = g.yb - f * L;
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 2 * Math.PI); ctx.fill();
      }
    });
    /* 가정한 방향 화살표 */
    [1, 2, 3].forEach((i) => {
      const x = g.x[i] + (i === 2 ? -30 : -30), y = i === 3 ? mid - 56 : mid, d = dir[i];
      ctx.strokeStyle = COL.forest; ctx.fillStyle = COL.forest; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y + 14 * d); ctx.lineTo(x, y - 14 * d); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 18 * d); ctx.lineTo(x - 5, y - 9 * d); ctx.lineTo(x + 5, y - 9 * d); ctx.closePath(); ctx.fill();
      ctx.font = `bold 11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`I${"₁₂₃"[i - 1]}`, x - 6, y + 4);
    });
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = COL.ink; ctx.textAlign = "center";
    ctx.fillText(`A  (${s.V.toFixed(2)} V)`, g.x[3], g.ya - 10); ctx.fillText("B  (0 V, 기준)", g.x[3], g.yb + 20);
  }
  const term = (c, txt, first) => { const sgn = c < 0 ? "−" : first ? "" : "+"; return `${first ? sgn : ` ${sgn} `}${txt}`; };
  function update() {
    const s = solve();
    ["e1", "e2", "r1", "r2", "r3"].forEach((k) => { S[k + "o"].textContent = S[k].value; });
    /* 접합점 A: 들어오는 = 나가는 */
    const ins = [1, 2, 3].filter((i) => dir[i] > 0).map((i) => `I${"₁₂₃"[i - 1]}`), outs = [1, 2, 3].filter((i) => dir[i] < 0).map((i) => `I${"₁₂₃"[i - 1]}`);
    const L1 = `${s.e1} ${term(-dir[1], `${s.R1}I₁`)}${term(dir[3], `${s.R3}I₃`)} = 0`;
    const L2 = `${term(-dir[3], `${s.R3}I₃`, true)}${term(-1, `(${s.e2})`)}${term(dir[2], `${s.R2}I₂`)} = 0`;
    const I = (i) => dir[i] * s.u[i];
    const val = (i) => { const v = I(i); return `<b class="${v < 0 ? "neg" : ""}">I${"₁₂₃"[i - 1]} = ${v.toFixed(3)} A</b>`; };
    eqBox.innerHTML =
      `<p><span>접합점 A</span>${ins.length ? ins.join(" + ") : "0"} = ${outs.length ? outs.join(" + ") : "0"}</p>` +
      `<p><span>왼쪽 고리 ↻</span>${L1}</p>` +
      `<p><span>오른쪽 고리 ↻</span>${L2}</p>` +
      `<p><span>풀이</span><i>${val(1)} ${val(2)} ${val(3)}</i></p>`;
    const Pb = s.e1 * s.u[1] + s.e2 * s.u[2], Ph = s.u[1] ** 2 * s.R1 + s.u[2] ** 2 * s.R2 + s.u[3] ** 2 * s.R3;
    nP.textContent = `${Pb.toFixed(2)} W`; nH.textContent = `${Ph.toFixed(2)} W`;
    nV.textContent = s.e2 * s.u[2] < -1e-9 ? "ε₂가 충전됨" : s.e1 * s.u[1] < -1e-9 ? "ε₁이 충전됨" : "둘 다 방전";
    draw();
  }
  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.d; dir[i] *= -1; b.textContent = `I${"₁₂₃"[i - 1]} 가정: ${dir[i] > 0 ? "위로" : "아래로"}`; update(); }));
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { PRE[b.dataset.p].forEach((v, j) => { S[["e1", "e2", "r1", "r2", "r3"][j]].value = v; }); update(); }));
  ["e1", "e2", "r1", "r2", "r3"].forEach((k) => S[k].addEventListener("input", update));
  if (/[?&]demo\b/.test(location.search)) { PRE.charge.forEach((v, j) => { S[["e1", "e2", "r1", "r2", "r3"][j]].value = v; }); t = 3; }
  if (!reduce) loop(cv, (dt) => { t += dt; draw(); });
  update();
})();
