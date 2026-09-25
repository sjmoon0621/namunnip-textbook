/* 카드: 숲이 우거지면 숲 바닥의 식물은 어떻게 달라질까? — 잎층의 빛 감쇠와 양지·음지 식물 (모식) */
(() => {
  const root = document.getElementById("card-is2-forest-light");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sL = $(".lai"), oL = $(".lai-out");
  const nF = $(".floor"), nSun = $(".sun"), nShade = $(".shade"), msg = $(".f-msg");

  const I0 = 2000, K = 0.6;               // 맑은 날 한낮 빛 (μmol/m²·s), 잎층 흡수 계수 (모식)
  const floor = (L) => I0 * Math.exp(-K * L);
  // 순광합성 모식 곡선 (상대값): 양지 식물은 최대값·호흡이 크고, 음지 식물은 둘 다 작다
  const sun = (I) => 30 * I / (I + 400) - 3;
  const shade = (I) => 8 * I / (I + 60) - 0.5;

  const { ctx, size } = fit(cv, () => draw());
  // 나무 잎 위치 (고정 난수)
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const LEAVES = Array.from({ length: 260 }, () => [rnd(), rnd(), rnd()]);

  function plant(x, y, s, kind, vigor) {
    // vigor: -1..1 → 크기와 색
    const g = clamp(vigor, -1, 1), sc = s * (0.55 + 0.45 * Math.max(0, g));
    const col = g < 0 ? "#b0a27a" : kind === "sun" ? C.forest : "#2f6b4a";
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - sc * 1.3); ctx.stroke();
    if (kind === "sun") { // 좁고 위로 선 잎
      for (let i = 0; i < 3; i++) { const yy = y - sc * (0.45 + i * 0.35);
        ctx.beginPath(); ctx.ellipse(x - sc * 0.22, yy, sc * 0.26, sc * 0.08, -0.7, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + sc * 0.22, yy - 3, sc * 0.26, sc * 0.08, 0.7, 0, 7); ctx.fill(); }
    } else { // 넓고 옆으로 퍼진 잎
      for (let i = 0; i < 2; i++) { const yy = y - sc * (0.6 + i * 0.5);
        ctx.beginPath(); ctx.ellipse(x - sc * 0.42, yy, sc * 0.42, sc * 0.16, -0.12, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + sc * 0.42, yy - 2, sc * 0.42, sc * 0.16, 0.12, 0, 7); ctx.fill(); }
    }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const L = +sL.value, If = floor(L);
    const stack = w / h < 1.3;
    const sw = stack ? w : w * 0.46, sh = stack ? h * 0.48 : h;
    // ── 숲 단면
    const gy = sh - 26, cTop = sh * 0.14, cBot = sh * 0.46;
    ctx.fillStyle = "#e9efe3"; ctx.fillRect(0, 0, sw, gy);
    // 빛줄기: 잎층을 지나며 약해진다
    for (let x = 10; x < sw; x += 14) {
      const g = ctx.createLinearGradient(0, 0, 0, gy);
      const a = 0.55;
      g.addColorStop(0, `rgba(224,160,42,${a})`); g.addColorStop(cTop / gy, `rgba(224,160,42,${a})`);
      g.addColorStop(cBot / gy, `rgba(224,160,42,${a * If / I0})`); g.addColorStop(1, `rgba(224,160,42,${a * If / I0})`);
      ctx.fillStyle = g; ctx.fillRect(x, 0, 3, gy);
    }
    // 줄기
    ctx.fillStyle = "#6b5a45";
    [0.18, 0.5, 0.82].forEach((f) => ctx.fillRect(sw * f - 4, cBot - 10, 8, gy - cBot + 10));
    // 잎: 잎면적지수만큼
    const n = Math.round(L / 8 * LEAVES.length);
    for (let i = 0; i < n; i++) {
      const [u, v, t] = LEAVES[i];
      ctx.fillStyle = t < .5 ? "rgba(59,124,42,.55)" : "rgba(116,171,102,.55)";
      ctx.beginPath(); ctx.ellipse(u * sw, cTop + v * (cBot - cTop), 9, 4, t * 3, 0, 7); ctx.fill();
    }
    // 땅
    ctx.fillStyle = "#cdbf9f"; ctx.fillRect(0, gy, sw, sh - gy);
    const vig = (p) => p / 3;
    plant(sw * 0.33, gy, 26, "sun", vig(sun(If)));
    plant(sw * 0.67, gy, 26, "shade", vig(shade(If)));
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("양지 식물", sw * 0.33, sh - 8); ctx.fillText("음지 식물", sw * 0.67, sh - 8);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink;
    ctx.fillText(`숲 위 ${I0}`, 6, 13);
    ctx.fillStyle = "rgba(251,251,248,.85)"; const ft = `바닥 ${Math.round(If)} (${(If / I0 * 100).toFixed(If / I0 < 0.1 ? 1 : 0)}%)`;
    ctx.fillRect(3, (cBot + gy) / 2 - 12, ctx.measureText(ft).width + 6, 16); ctx.fillStyle = C.ink; ctx.fillText(ft, 6, (cBot + gy) / 2);
    ctx.fillStyle = C.ink3; ctx.fillText("잎층", sw - 6 - ctx.measureText("잎층").width, (cTop + cBot) / 2 + 4);

    // ── 광합성 곡선 (로그 빛 축)
    const gx = stack ? 44 : sw + 48, gy0 = stack ? sh + 26 : 22, gw = (stack ? w : w - sw) - (stack ? 56 : 60), gh = (stack ? h - sh : h) - (stack ? 60 : 56);
    const LX0 = Math.log10(10), LX1 = Math.log10(2000), YMIN = -4, YMAX = 24;
    const X = (I) => gx + (Math.log10(I) - LX0) / (LX1 - LX0) * gw;
    const Y = (v) => gy0 + (1 - (v - YMIN) / (YMAX - YMIN)) * gh;
    NM.axes(ctx, { x0: gx, y0: gy0, w: gw, h: gh, X, Y,
      xt: [[10, "10"], [30, "30"], [100, "100"], [300, "300"], [1000, "1000"], [2000, ""]],
      yt: [[0, "0"], [10, "10"], [20, "20"]],
      ylabel: "순광합성 (상대값)", xlabel: "빛의 세기 (로그 눈금)" });
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(gx, Y(0) + .5); ctx.lineTo(gx + gw, Y(0) + .5); ctx.stroke();
    const curve = (f, col) => { ctx.beginPath(); for (let e = LX0; e <= LX1 + 1e-9; e += 0.01) { const I = 10 ** e; e === LX0 ? ctx.moveTo(X(I), Y(f(I))) : ctx.lineTo(X(I), Y(f(I))); } ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.stroke(); };
    curve(sun, C.forest); ctx.setLineDash([6, 3]); curve(shade, "#2f6b4a");
    ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`;
    // 범례
    const lg = (y, dash, col, t) => { ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx + 8, y); ctx.lineTo(gx + 26, y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = col; ctx.fillText(t, gx + 31, y + 4); };
    lg(gy0 + 10, [], C.forest, "양지 식물"); lg(gy0 + 25, [5, 3], "#2f6b4a", "음지 식물");
    // 바닥 빛 표시
    const x = X(clamp(If, 10, 2000));
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(x, gy0); ctx.lineTo(x, gy0 + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#a8781c"; const fr = x > gx + gw - 50; ctx.textAlign = fr ? "right" : "left"; ctx.fillText("숲 바닥", x + (fr ? -4 : 4), gy0 + gh - 5); ctx.textAlign = "left";
    [[sun, C.forest], [shade, "#2f6b4a"]].forEach(([f, col]) => {
      ctx.beginPath(); ctx.arc(x, Y(f(If)), 4.5, 0, 7); ctx.fillStyle = col; ctx.fill();
    });
  }

  function update() {
    const L = +sL.value, If = floor(L), a = sun(If), b = shade(If);
    oL.textContent = L.toFixed(1);
    nF.textContent = `${Math.round(If)} (${(If / I0 * 100).toFixed(If / I0 < 0.1 ? 1 : 0)}%)`;
    nSun.textContent = a.toFixed(1); nShade.textContent = b.toFixed(1);
    nSun.classList.toggle("bad", a < 0); nShade.classList.toggle("bad", b < 0);
    msg.textContent = a < 0 ? "양지 식물은 호흡으로 쓰는 양이 더 많아 이 그늘에서 버티지 못합니다. 음지 식물은 적은 빛으로도 순광합성을 합니다."
      : a > b ? "빛이 넉넉합니다. 광합성 능력이 큰 양지 식물이 더 빨리 자랍니다."
      : "빛이 줄자 순서가 뒤집혔습니다. 호흡량이 적은 음지 식물이 더 유리합니다.";
    root.querySelectorAll("[data-lai]").forEach((btn) => btn.setAttribute("aria-pressed", btn.dataset.lai === sL.value));
    draw();
  }
  sL.addEventListener("input", update);
  root.querySelectorAll("[data-lai]").forEach((b) => b.addEventListener("click", () => { sL.value = b.dataset.lai; update(); }));
  update();
})();
