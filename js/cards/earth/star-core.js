/* 카드: 무거운 별과 가벼운 별은 속에서 핵융합하는 방식이 다를까? — 질량에 따른 중심 온도, p–p 연쇄와 CNO 순환의 비율, 내부 구조, 반응 그림 */
(() => {
  const root = document.getElementById("card-earth-star-core");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  /* 영년 주계열(막 주계열에 들어선) 별의 중심 온도, 백만 K. 별 모형 계산의 대략값 */
  const TC = [[0.3, 7.5], [0.5, 9.3], [0.8, 12.2], [1, 13.7], [1.3, 16.8], [1.5, 18.5], [2, 21], [3, 24], [5, 27.5], [10, 31.5], [15, 34], [20, 35.5]];
  function tcore(m) {
    const lm = Math.log(m);
    for (let i = 1; i < TC.length; i++) {
      if (m <= TC[i][0]) { const a = TC[i - 1], b = TC[i], t = (lm - Math.log(a[0])) / (Math.log(b[0]) - Math.log(a[0])); return a[1] + (b[1] - a[1]) * t; }
    }
    return TC[TC.length - 1][1];
  }
  /* 에너지 생성률의 온도 의존 (밀도·조성은 같다고 둔 어림). ε ∝ T^(-2/3) exp(-b / T^(1/3)), T는 백만 K.
     p–p: b = 33.8, CNO: b = 152.28. CNO 쪽 상수는 두 곡선이 1.75×10⁷ K에서 만나도록 맞췄다 */
  const TX = 17.5;
  const lpp = (T) => -2 / 3 * Math.log(T) - 33.8 / Math.cbrt(T);
  const lcno = (T) => -2 / 3 * Math.log(T) - 152.28 / Math.cbrt(T) + (152.28 - 33.8) / Math.cbrt(TX);
  const ratio = (T) => Math.exp(lcno(T) - lpp(T));
  const nu = (b, T) => -2 / 3 + b / 3 / Math.cbrt(T);
  /* 내부 구조 (모식): 대류 중심핵 반지름 비율 rc, 대류층 바닥 rb (1이면 대류층 없음) */
  const lerpT = (pts, x) => { if (x <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return pts[pts.length - 1][1]; };
  function structure(m) {
    if (m < 0.35) return { rc: 1, rb: 0, kind: "전체 대류" };
    if (m < 1.2) return { rc: 0, rb: lerpT([[0.35, 0.25], [0.6, 0.55], [1, 0.71], [1.2, 0.86]], m), kind: "복사 중심 + 대류 바깥층" };
    return { rc: lerpT([[1.2, 0.05], [2, 0.12], [5, 0.18], [10, 0.22], [20, 0.25]], m), rb: m < 1.6 ? lerpT([[1.2, 0.9], [1.6, 0.98]], m) : 1, kind: "대류 중심핵 + 복사 바깥층" };
  }
  let M = 1, rx = "auto", stepI = -1;
  const fig = fit($(".sc-main"), () => draw()), rxn = fit($(".sc-rxn"), () => drawRxn());
  const pp = "#3a62b0", cno = "#c0392b", convC = "#f0c48a", radC = "#f8ecd2";
  function convLoops(ctx, cx, cy, r0, r1, n) {
    const rm = (r0 + r1) / 2, rr = Math.max(3, (r1 - r0) / 2 - 3);
    ctx.strokeStyle = "#b5532f"; ctx.lineWidth = 1.1;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + 0.3, x = cx + Math.cos(a) * rm, y = cy + Math.sin(a) * rm;
      ctx.beginPath(); ctx.arc(x, y, rr, 0.3, Math.PI * 1.75); ctx.stroke();
      const e = Math.PI * 1.75, ex = x + Math.cos(e) * rr, ey = y + Math.sin(e) * rr, tx = -Math.sin(e), ty = Math.cos(e);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - tx * 4 + ty * 3, ey - ty * 4 - tx * 3); ctx.moveTo(ex, ey); ctx.lineTo(ex - tx * 4 - ty * 3, ey - ty * 4 + tx * 3); ctx.stroke();
    }
  }
  function radArrows(ctx, cx, cy, r0, r1, n) {
    ctx.strokeStyle = "#c79a3a"; ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + 0.1, c = Math.cos(a), s = Math.sin(a);
      ctx.beginPath();
      const steps = 8;
      for (let j = 0; j <= steps; j++) { const r = r0 + (r1 - r0) * (0.15 + 0.7 * j / steps), off = (j % 2 ? 2.5 : -2.5); const x = cx + c * r - s * off, y = cy + s * r + c * off; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
  }
  function draw() {
    const { ctx } = fig, { w, h } = fig.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = tcore(M), r = ratio(T), fC = r / (1 + r), st = structure(M);
    /* 왼쪽: 별의 단면 */
    const R = Math.min(w * 0.2, h * 0.4), cx = R + 14, cy = h / 2 + 8;
    ctx.fillStyle = radC; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    if (st.rb < 1) { ctx.fillStyle = convC; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.arc(cx, cy, R * st.rb, 0, Math.PI * 2, true); ctx.fill("evenodd"); }
    if (st.rc > 0) { ctx.fillStyle = convC; ctx.beginPath(); ctx.arc(cx, cy, R * Math.min(st.rc, 1), 0, Math.PI * 2); ctx.fill(); }
    if (st.rc >= 1) convLoops(ctx, cx, cy, R * 0.2, R * 0.95, 7);
    else {
      if (st.rb < 1 && R * (1 - st.rb) > 9) convLoops(ctx, cx, cy, R * st.rb, R, Math.round(10 + 6 * st.rb));
      if (st.rc > 0 && R * st.rc > 9) convLoops(ctx, cx, cy, R * 0.02, R * st.rc, 4);
      radArrows(ctx, cx, cy, R * Math.max(st.rc, 0.12), R * Math.min(st.rb || 1, 1), 12);
    }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, R * 0.18, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(st.kind, 10, 18);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText("점선 안: 핵융합이 일어나는 중심부", 10, h - 24);
    ctx.fillStyle = convC; ctx.fillRect(10, h - 14, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText("대류", 24, h - 5);
    ctx.fillStyle = radC; ctx.fillRect(58, h - 14, 10, 10); ctx.strokeStyle = C.rule; ctx.strokeRect(58.5, h - 13.5, 9, 9); ctx.fillStyle = C.ink2; ctx.fillText("복사", 72, h - 5);
    /* 오른쪽: 온도에 따른 에너지 생성률 */
    const box = { x0: R * 2 + 70, y0: 26, w: w - (R * 2 + 70) - 12, h: h - 86 };
    const T0 = 5, T1 = 40, L0 = -6, L1 = 6;
    const X = (t) => box.x0 + (t - T0) / (T1 - T0) * box.w, Y = (l) => box.y0 + box.h - (l - L0) / (L1 - L0) * box.h;
    const ref = lpp(15), lg = (v) => (v - ref) / Math.LN10;
    axes(ctx, { ...box, X, Y, xt: [5, 10, 15, 20, 25, 30, 35, 40].map((t) => [t, String(t)]), yt: [[-6, "10⁻⁶"], [-3, "10⁻³"], [0, "1"], [3, "10³"], [6, "10⁶"]], xlabel: "중심 온도 (백만 K)", ylabel: "에너지 생성률 (상대값, 로그)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    [[lpp, pp], [lcno, cno]].forEach(([f, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const t = T0 + (T1 - T0) * i / 120, x = X(t), y = Y(lg(f(t))); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(TX), box.y0); ctx.lineTo(X(TX), box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(T), box.y0); ctx.lineTo(X(T), box.y0 + box.h); ctx.stroke();
    [[lpp, pp], [lcno, cno]].forEach(([f, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(T), Y(lg(f(T))), 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = pp; ctx.fillText("p–p 연쇄", X(6), Y(lg(lpp(6))) - 8 < box.y0 + 12 ? box.y0 + 12 : Y(lg(lpp(6))) - 8);
    ctx.fillStyle = cno; ctx.textAlign = "right"; ctx.fillText("CNO 순환", X(39), Y(4.7));
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("교차 ≈ 1.75×10⁷ K", X(TX) + 4, box.y0 + box.h - 6);
    /* 비율 막대 */
    const by = h - 26, bw = box.w;
    ctx.fillStyle = pp; ctx.fillRect(box.x0, by, bw * (1 - fC), 10);
    ctx.fillStyle = cno; ctx.fillRect(box.x0 + bw * (1 - fC), by, bw * fC, 10);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("에너지 비율: 왼쪽 p–p, 오른쪽 CNO", box.x0, by + 22);
    /* 수치 */
    const L = M ** 3.5, life = 1e10 * M ** -2.5;
    $(".m-out").textContent = M.toFixed(M < 1 ? 2 : 1);
    $(".tc").textContent = `${(T / 10).toFixed(2)}×10⁷ K`;
    $(".frac").textContent = `${Math.round((1 - fC) * 100)} : ${Math.round(fC * 100)}`;
    $(".lum").textContent = L < 10 ? L.toPrecision(2) : Math.round(L).toLocaleString("ko-KR");
    $(".life").textContent = life >= 1e9 ? `${(life / 1e8).toPrecision(2) * 1}억 년` : life >= 1e8 ? `${Math.round(life / 1e8)}억 년` : `${Math.round(life / 1e4) * 1}만 년`;
    $(".nu").textContent = `p–p 연쇄 ε ∝ T^${nu(33.8, T).toFixed(1)}, CNO 순환 ε ∝ T^${nu(152.28, T).toFixed(1)} (이 온도 부근의 어림)`;
    const v = $(".verdict");
    v.textContent = M < 0.35 ? "별 전체가 대류합니다. 중심의 수소가 별 전체와 섞이므로, 이 별은 수소 대부분을 태울 수 있습니다."
      : fC < 0.5 ? (st.rc > 0 ? "아직 p–p 연쇄가 더 많지만, 중심핵에 대류가 생기기 시작하는 경계 부근입니다." : "p–p 연쇄가 주된 에너지원입니다. 중심부는 복사로 에너지를 옮기고, 차가운 바깥층이 대류합니다.")
      : "CNO 순환이 주된 에너지원입니다. 온도에 매우 민감해 에너지가 중심 가까이 몰리므로, 중심핵이 대류합니다.";
    v.className = "verdict small " + (fC >= 0.5 ? "bad" : "good");
    if (rx === "auto") root.querySelectorAll("[data-rx]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rx === (fC >= 0.5 ? "cno" : "pp"))));
    drawRxn();
  }
  function nucl(ctx, x, y, t, col) {
    ctx.font = `600 12px ${F.sans}`; const tw = Math.max(30, ctx.measureText(t).width + 12);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = col; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - tw / 2, y - 11, tw, 22, 11) : ctx.rect(x - tw / 2, y - 11, tw, 22); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(t, x, y + 4);
  }
  function arrow(ctx, x0, y0, x1, y1, col, lw = 1.4) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 7 * Math.cos(a - 0.4), y1 - 7 * Math.sin(a - 0.4)); ctx.lineTo(x1 - 7 * Math.cos(a + 0.4), y1 - 7 * Math.sin(a + 0.4)); ctx.fill();
  }
  function curRx() { if (rx !== "auto") return rx; const r = ratio(tcore(M)); return r >= 1 ? "cno" : "pp"; }
  function drawRxn() {
    const { ctx } = rxn, { w, h } = rxn.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, w, h);
    const k = curRx();
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`;
    ctx.fillText(k === "pp" ? "p–p 연쇄 (주된 갈래)" : "CNO 순환", 12, 20);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText("알짜: 4 ¹H → ⁴He + 2e⁺ + 2ν + 에너지 (약 26.7 MeV)", 12, h - 10);
    if (k === "pp") {
      const rows = [
        [["¹H", "¹H"], ["²H", "e⁺", "ν"], "두 번 일어남 · 가장 느린 단계(약한 상호작용)"],
        [["²H", "¹H"], ["³He", "γ"], "두 번 일어남"],
        [["³He", "³He"], ["⁴He", "¹H", "¹H"], "양성자 2개는 돌려줌"],
      ];
      const y0 = 54, dy = Math.min(52, (h - 90) / 3);
      rows.forEach(([a, b, note], i) => {
        const y = y0 + i * dy, on = stepI < 0 || stepI % 3 === i, col = on ? pp : C.rule;
        ctx.globalAlpha = on ? 1 : 0.35;
        let x = 30;
        a.forEach((t, j) => { nucl(ctx, x, y, t, col); x += 38; if (j < a.length - 1) { ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.font = `12px ${F.sans}`; ctx.fillText("+", x - 19, y + 4); } });
        arrow(ctx, x - 10, y, x + 18, y, col);
        x += 44;
        b.forEach((t, j) => { nucl(ctx, x, y, t, col); x += 38; if (j < b.length - 1) { ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.font = `12px ${F.sans}`; ctx.fillText("+", x - 19, y + 4); } });
        ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(note, 14, y + 22);
        ctx.globalAlpha = 1;
      });
    } else {
      const cx = w * 0.36, cy = h / 2 + 2, R = Math.min(w * 0.22, h * 0.34);
      const N = ["¹²C", "¹³N", "¹³C", "¹⁴N", "¹⁵O", "¹⁵N"];
      const E = ["+ ¹H → γ", "β⁺ 붕괴: e⁺, ν", "+ ¹H → γ", "+ ¹H → γ (가장 느림)", "β⁺ 붕괴: e⁺, ν", "+ ¹H → ⁴He 나옴"];
      const P = N.map((_, i) => { const a = -Math.PI / 2 + i / 6 * Math.PI * 2; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R, a]; });
      P.forEach(([x, y], i) => {
        const [x2, y2] = P[(i + 1) % 6], on = stepI < 0 || stepI % 6 === i, col = on ? cno : C.rule;
        const dx = x2 - x, dy = y2 - y, L = Math.hypot(dx, dy);
        ctx.globalAlpha = on ? 1 : 0.35;
        arrow(ctx, x + dx / L * 20, y + dy / L * 14, x2 - dx / L * 20, y2 - dy / L * 14, col);
        const mx = (x + x2) / 2, my = (y + y2) / 2, a = Math.atan2(my - cy, mx - cx);
        ctx.fillStyle = on ? C.ink2 : C.ink3; ctx.font = `10.5px ${F.sans}`;
        ctx.textAlign = Math.cos(a) > 0.2 ? "left" : Math.cos(a) < -0.2 ? "right" : "center";
        ctx.fillText(E[i], mx + Math.cos(a) * 10, my + Math.sin(a) * 12 + 4);
        ctx.globalAlpha = 1;
      });
      P.forEach(([x, y], i) => nucl(ctx, x, y, N[i], i === 0 ? C.ink : cno));
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("탄소는 촉매:", cx, cy - 4); ctx.fillText("한 바퀴 돌면 그대로", cx, cy + 12);
      ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
      const tx = Math.min(w - 150, cx + R + 70);
      ["탄소·질소·산소는", "없어지지 않고", "수소 4개가", "헬륨 1개로 바뀜"].forEach((t, i) => ctx.fillText(t, tx, 46 + i * 15));
    }
  }
  const sl = $(".mass");
  sl.addEventListener("input", () => { M = 10 ** +sl.value; root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", "false")); draw(); });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"), r = e.target.closest("[data-rx]"), s = e.target.closest(".step");
    if (b) { M = +b.dataset.m; sl.value = Math.log10(M); root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw(); }
    if (r) { rx = r.dataset.rx; stepI = -1; root.querySelectorAll("[data-rx]").forEach((x) => x.setAttribute("aria-pressed", String(x === r))); drawRxn(); }
    if (s) { stepI = (stepI + 1) % 6; drawRxn(); }
  });
  draw();
  if (/[?&]demo\b/.test(location.search)) root.querySelector('[data-m="5"]').click();
})();
