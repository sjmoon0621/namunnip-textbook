/* 카드: 데이지 세계 — 생물이 행성의 기온을 조절하는 되먹임 (Watson & Lovelock 1983 모형, 가상 행성) */
(() => {
  const root = document.getElementById("card-clim-daisy");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const S = 917, SIG = 5.67e-8, Q = 2.06e9, GAM = 0.3, AW = 0.75, AB = 0.25, AG = 0.5, SEED = 0.01;
  const L0 = 0.6, L1 = 1.7, DL = 0.005, NL = Math.round((L1 - L0) / DL) + 1;
  const beta = (T) => { const x = 1 - 0.003265 * (295.5 - T) ** 2; return x > 0 ? x : 0; };
  const K = 273.15;

  function eq(L, w, b, useW, useB) {
    for (let k = 0; k < 4000; k++) {
      if (useW && w < SEED) w = SEED; if (useB && b < SEED) b = SEED;
      if (!useW) w = 0; if (!useB) b = 0;
      const g = Math.max(0, 1 - w - b), A = g * AG + w * AW + b * AB;
      const Te4 = S * L * (1 - A) / SIG;
      const Tw = Math.pow(Q * (A - AW) + Te4, 0.25), Tb = Math.pow(Q * (A - AB) + Te4, 0.25);
      const dw = w * (g * beta(Tw) - GAM), db = b * (g * beta(Tb) - GAM);
      w += 0.05 * dw; b += 0.05 * db;
      if (Math.abs(dw) + Math.abs(db) < 1e-7 && k > 50) break;
    }
    if (useW && w < SEED) w = SEED; if (useB && b < SEED) b = SEED;
    const g = Math.max(0, 1 - w - b), A = g * AG + w * AW + b * AB;
    return { w, b, A, T: Math.pow(S * L * (1 - A) / SIG, 0.25) - K };
  }
  // 햇빛을 천천히 키우며(평형을 이어 가며) 계산
  function sweep(useW, useB) {
    const out = []; let w = SEED, b = SEED;
    for (let i = 0; i < NL; i++) { const r = eq(L0 + i * DL, w, b, useW, useB); out.push(r); w = r.w; b = r.b; }
    return out;
  }
  const MODES = { both: sweep(true, true), white: sweep(true, false), black: sweep(false, true), none: sweep(false, false) };
  const NAME = { both: "흰·검은 데이지", white: "흰 데이지만", black: "검은 데이지만", none: "생명 없음" };
  let mode = "both";
  const a = fit($(".dw-t"), () => drawT()), c = fit($(".dw-a"), () => drawA());
  const idx = () => Math.round((+$(".lum").value - L0) / DL);
  const COL = { none: "#9a8f7a", life: "#c4462f", w: "#e9e6da", b: "#3a3a3a", g: "#c9b48a" };

  function drawT() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 36, y0: 24, w: w - 46, h: h - 58 }, lo = -30, hi = 80;
    const X = (L) => box.x0 + (L - L0) / (L1 - L0) * box.w, Y = (v) => box.y0 + (hi - v) / (hi - lo) * box.h;
    axes(ctx, { ...box, X, Y, xt: [0.6, 0.8, 1.0, 1.2, 1.4, 1.6].map((v) => [v, v.toFixed(1)]), yt: [-20, 0, 20, 40, 60, 80].map((v) => [v, String(v)]), xlabel: "햇빛의 세기 (지금 = 1)", ylabel: "행성 평균 기온 (°C)" });
    // 데이지가 자랄 수 있는 범위 5–40 °C
    ctx.fillStyle = "rgba(116,171,102,.12)"; ctx.fillRect(box.x0, Y(40), box.w, Y(5) - Y(40));
    ctx.fillStyle = C.forest; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("데이지가 자랄 수 있는 기온 5–40 °C", box.x0 + box.w - 4, Y(5) - 5);
    const line = (arr, col, lw, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath();
      arr.forEach((r, i) => { const p = [X(L0 + i * DL), Y(r.T)]; i ? ctx.lineTo(...p) : ctx.moveTo(...p); }); ctx.stroke(); ctx.setLineDash([]);
    };
    line(MODES.none, COL.none, 1.8, [5, 3]);
    if (mode !== "none") line(MODES[mode], COL.life, 2.6, []);
    const i = idx(), r = MODES[mode][i];
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(L0 + i * DL), Y(r.T), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    const lx = box.x0 + 8, ly = box.y0 + 12;
    ctx.fillStyle = COL.none; ctx.fillRect(lx, ly - 4, 14, 2); ctx.fillStyle = C.ink2; ctx.fillText("생명 없음 (맨땅 알베도 0.5)", lx + 20, ly);
    if (mode !== "none") { ctx.fillStyle = COL.life; ctx.fillRect(lx, ly + 10, 14, 2.6); ctx.fillStyle = C.ink2; ctx.fillText(NAME[mode], lx + 20, ly + 14); }
  }

  function drawA() {
    const { ctx } = c, { w, h } = c.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const i = idx(), r = MODES[mode][i];
    // 왼쪽: 행성 그림 (면적 비율대로 점 색칠, 모식)
    const R = Math.min(h * 0.4, w * 0.16), cx = R + 12, cy = h / 2;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = COL.g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    const n = 900;
    for (let k = 0; k < n; k++) {
      const u = (k * 0.6180339887) % 1, v = ((k * 0.7548776662) % 1);
      const x = cx - R + u * 2 * R, y = cy - R + v * 2 * R;
      const hh = Math.sin(k * 12.9898 + 78.233) * 43758.5453, f = hh - Math.floor(hh);
      if (f < r.w) ctx.fillStyle = COL.w; else if (f < r.w + r.b) ctx.fillStyle = COL.b; else continue;
      ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    // 오른쪽: 덮인 비율
    const box = { x0: cx + R + 46, y0: 22, w: w - (cx + R + 56), h: h - 50 };
    const X = (L) => box.x0 + (L - L0) / (L1 - L0) * box.w, Y = (v) => box.y0 + (1 - v) * box.h;
    axes(ctx, { ...box, X, Y, xt: [0.6, 1.0, 1.4].map((v) => [v, v.toFixed(1)]), yt: [0, 0.5, 1].map((v) => [v, `${v * 100}%`]), ylabel: "덮인 넓이" });
    const arr = MODES[mode];
    const band = (lo, hi, col) => {
      ctx.fillStyle = col; ctx.beginPath();
      arr.forEach((q, k) => { const p = [X(L0 + k * DL), Y(hi(q))]; k ? ctx.lineTo(...p) : ctx.moveTo(...p); });
      for (let k = arr.length - 1; k >= 0; k--) ctx.lineTo(X(L0 + k * DL), Y(lo(arr[k])));
      ctx.closePath(); ctx.fill();
    };
    band(() => 0, (q) => q.b, COL.b);
    band((q) => q.b, (q) => q.b + q.w, "#cfcab8");
    const xl = X(L0 + i * DL); ctx.strokeStyle = C.apple; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xl, box.y0); ctx.lineTo(xl, box.y0 + box.h); ctx.stroke();
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink2;
    ctx.fillText("검은 데이지 ■  흰 데이지 □", box.x0 + box.w, box.y0 - 8);
  }

  function update() {
    const L = +$(".lum").value, i = idx(), r = MODES[mode][i], r0 = MODES.none[i];
    $(".lum-out").textContent = L.toFixed(2);
    $(".n-t").textContent = `${r.T.toFixed(1)} °C`;
    $(".n-0").textContent = `${r0.T.toFixed(1)} °C`;
    $(".n-c").textContent = `흰 ${Math.round(r.w * 100)} % · 검은 ${Math.round(r.b * 100)} %`;
    $(".n-a").textContent = r.A.toFixed(3);
    // 데이지가 사는 햇빛 범위
    const arr = MODES[mode]; let lo = null, hi = null;
    arr.forEach((q, k) => { if (q.w + q.b > 0.05) { if (lo === null) lo = k; hi = k; } });
    const v = $(".verdict");
    v.textContent = mode === "none"
      ? "생명이 없으면 행성의 알베도가 0.5로 고정되어, 햇빛이 세지는 만큼 기온이 그대로 올라갑니다."
      : lo === null ? "이 조건에서는 데이지가 자리 잡지 못합니다."
        : `${NAME[mode]}가 사는 동안(햇빛 ${(L0 + lo * DL).toFixed(2)}–${(L0 + hi * DL).toFixed(2)}) 행성 기온은 ${Math.min(...arr.slice(lo, hi + 1).map((q) => q.T)).toFixed(0)}–${Math.max(...arr.slice(lo, hi + 1).map((q) => q.T)).toFixed(0)} °C에 머뭅니다. 같은 범위에서 생명이 없는 행성은 ${MODES.none[lo].T.toFixed(0)}–${MODES.none[hi].T.toFixed(0)} °C로 변합니다.`;
    drawT(); drawA();
  }

  $(".modes").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-m]"); if (!bt) return;
    mode = bt.dataset.m; root.querySelectorAll(".modes [data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update();
  });
  $(".lum").addEventListener("input", update);
  update();
  if (/[?&]demo\b/.test(location.search)) { $(".lum").value = "1.2"; update(); }
})();
