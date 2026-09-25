/* 카드: 철은 자석에 붙는데 알루미늄은 왜 안 붙을까? — 강자성(자기 구역·이력), 상자성, 반자성 */
(() => {
  const root = document.getElementById("card-phy-magnet");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvA, cvB] = root.querySelectorAll("canvas");
  const hIn = $(".hfield"), hOut = $(".hfield-out"), heat = $(".heat");
  const nChi = $(".n-chi"), nKind = $(".n-kind"), nF = $(".n-f");
  const BLUE = "#2f6fa3";

  const MAT = {
    fe: { name: "철", kind: "강자성", chi: null },
    al: { name: "알루미늄", kind: "상자성", chi: 2.2e-5 },
    cu: { name: "구리", kind: "반자성", chi: -9.6e-6 },
    water: { name: "물", kind: "반자성", chi: -9.0e-6 },
    bi: { name: "비스무트", kind: "반자성", chi: -1.66e-4 },
  };
  let mat = "fe";
  const COLS = 8, ROWS = 5, N = COLS * ROWS;

  // 강자성: 자기 구역 하나하나를 문턱값 두 개(α > β)를 가진 스위치로 본 모식 (프라이자흐 모형)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
  const D = Array.from({ length: N }, () => {
    const c = 22 * gauss(), hc = 8 + 22 * rnd();
    return { a: c + hc, b: c - hc, s: 0, th0: rnd() * Math.PI * 2, th: 0, show: 0, pth: rnd() * Math.PI * 2 };
  });
  D.forEach((d) => { d.th = d.th0; d.show = d.th0; });
  let trail = [];
  const hot = () => mat === "fe" && heat.checked;

  function demag() { D.forEach((d) => { d.s = 0; d.th = d.th0; }); trail = []; }
  function applyH(H) {
    if (mat !== "fe" || hot()) return;
    D.forEach((d) => {
      if (H >= d.a) d.s = 1; else if (H <= d.b) d.s = -1;
      d.th = d.s === 1 ? 0 : d.s === -1 ? Math.PI : d.th0;
    });
  }
  const magFe = () => D.reduce((s, d) => s + Math.cos(d.th), 0) / N;
  // 상자성·가열한 철: 정렬 정도 (크게 과장한 모식)
  const paraM = () => D.reduce((s, d) => s + Math.cos(d.pth), 0) / N;

  const A = fit(cvA, () => drawA()), B = fit(cvB, () => drawB());
  const arrow = (ctx, x, y, ang, L, col, lw = 1.6) => {
    const ux = Math.cos(ang), uy = -Math.sin(ang);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x - ux * L / 2, y - uy * L / 2); ctx.lineTo(x + ux * (L / 2 - 3), y + uy * (L / 2 - 3)); ctx.stroke();
    ctx.save(); ctx.translate(x + ux * L / 2, y + uy * L / 2); ctx.rotate(Math.atan2(uy, ux));
    ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(-5, -3.2); ctx.lineTo(-5, 3.2); ctx.closePath(); ctx.fill(); ctx.restore();
  };

  function drawA() {
    const { ctx, size: { w, h } } = A;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const H = +hIn.value;
    // 자극: 왼쪽은 뾰족(자기장이 더 셈), 오른쪽은 넓은 면
    const pw = w * 0.13, sx0 = w * 0.25, sx1 = w * 0.78, sy0 = h * 0.3, sy1 = h * 0.72, cy = (sy0 + sy1) / 2;
    const lp = H > 0 ? "N" : H < 0 ? "S" : "", rp = H > 0 ? "S" : H < 0 ? "N" : "";
    const pc = (p) => (p === "N" ? C.warn : p === "S" ? BLUE : C.rule);
    ctx.fillStyle = pc(lp);
    ctx.beginPath(); ctx.moveTo(0, cy - h * 0.3); ctx.lineTo(pw * 0.6, cy - h * 0.3); ctx.lineTo(pw * 1.2, cy - 10); ctx.lineTo(pw * 1.2, cy + 10); ctx.lineTo(pw * 0.6, cy + h * 0.3); ctx.lineTo(0, cy + h * 0.3); ctx.fill();
    ctx.fillStyle = pc(rp); ctx.fillRect(w - pw * 0.8, cy - h * 0.34, pw * 0.8, h * 0.68);
    ctx.fillStyle = "#fff"; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center";
    if (lp) { ctx.fillText(lp, pw * 0.45, cy + 5); ctx.fillText(rp, w - pw * 0.4, cy + 5); }
    // 자기장 선 (N → S), 왼쪽에서 모였다가 오른쪽으로 퍼짐
    const nl = Math.round(Math.abs(H) / 100 * 7);
    ctx.strokeStyle = "rgba(35,35,38,.14)"; ctx.lineWidth = 1;
    for (let i = 0; i < nl; i++) {
      const t = nl === 1 ? 0 : (i / (nl - 1) - 0.5);
      ctx.beginPath(); ctx.moveTo(pw * 1.2, cy + t * 18);
      ctx.bezierCurveTo(w * 0.4, cy + t * h * 0.3, w * 0.7, cy + t * h * 0.55, w - pw * 0.8, cy + t * h * 0.6); ctx.stroke();
    }
    // 시료
    ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
    const cw = (sx1 - sx0) / COLS, ch = (sy1 - sy0) / ROWS, L = Math.min(cw, ch) * 0.78;
    D.forEach((d, k) => {
      const i = k % COLS, j = Math.floor(k / COLS), x = sx0 + (i + 0.5) * cw, y = sy0 + (j + 0.5) * ch;
      if (mat === "fe" && !hot()) {
        ctx.strokeStyle = "rgba(35,35,38,.12)"; ctx.strokeRect(sx0 + i * cw, sy0 + j * ch, cw, ch);
        const c = Math.cos(d.show);
        arrow(ctx, x, y, d.show, L, c > 0.7 ? C.warn : c < -0.7 ? BLUE : C.ink2, 2);
      } else if (mat === "al" || hot()) {
        arrow(ctx, x, y, d.pth, L * 0.6, C.ink2, 1.2);
      } else {
        // 반자성: 외부 자기장과 반대 방향의 아주 작은 유도 자화 (크기는 과장)
        ctx.strokeStyle = "rgba(35,35,38,.25)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, L * 0.28, 0, Math.PI * 2); ctx.stroke();
        if (Math.abs(H) > 2) arrow(ctx, x, y, H > 0 ? Math.PI : 0, L * 0.55 * Math.abs(H) / 100 + 6, C.forest, 1.3);
      }
    });
    ctx.fillStyle = C.ink2; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(`${MAT[mat].name}${hot() ? " (800 °C)" : ""}`, (sx0 + sx1) / 2, sy0 - 8);
    // 힘: 자기장이 센 왼쪽(뾰족한 극) 쪽으로 끌리거나 밀림. 길이는 로그 눈금
    const chi = effChi();
    if (Math.abs(H) > 2 && chi !== 0) {
      const L2 = clamp(8 + 7 * (Math.log10(Math.abs(chi)) + 6), 6, 70) * Math.min(1, Math.abs(H) / 60 + 0.3);
      const dir = chi > 0 ? -1 : 1, yA = sy1 + 22, xm = (sx0 + sx1) / 2;
      ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(xm, yA); ctx.lineTo(xm + dir * L2, yA); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xm + dir * (L2 + 7), yA); ctx.lineTo(xm + dir * L2, yA - 5); ctx.lineTo(xm + dir * L2, yA + 5); ctx.fill();
      ctx.font = `11px ${F.sans}`; ctx.fillText(chi > 0 ? "센 쪽으로 끌림" : "센 쪽에서 밀림", xm, yA + 20);
    }
    ctx.textAlign = "left";
  }
  function effChi() {
    if (mat === "fe") return hot() ? 1e-4 : 1e3;
    return MAT[mat].chi;
  }

  function drawB() {
    const { ctx, size: { w, h } } = B;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 30, padR = 8, padT = 22, padB = 30, pw = w - padL - padR, ph = h - padT - padB;
    const X = (H) => padL + (H + 100) / 200 * pw, Y = (m) => padT + (1 - (m + 1) / 2) * ph;
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[-100, "−"], [0, "0"], [100, "+"]], yt: [[-1, "−"], [0, "0"], [1, "+"]],
      ylabel: "자화 M", xlabel: "외부 자기장 H" });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(0) + .5, padT); ctx.lineTo(X(0) + .5, padT + ph); ctx.moveTo(padL, Y(0) + .5); ctx.lineTo(padL + pw, Y(0) + .5); ctx.stroke();
    const H = +hIn.value;
    ctx.font = `10.5px ${F.mono}`;
    if (mat === "fe" && !hot()) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath();
      trail.forEach(([hh, m], i) => (i ? ctx.lineTo(X(hh), Y(m)) : ctx.moveTo(X(hh), Y(m))));
      ctx.stroke();
      ctx.beginPath(); ctx.arc(X(H), Y(magFe()), 5, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
      ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("세로축 끝: 포화 자화", padL + pw - 4, padT + ph - 6); ctx.textAlign = "left";
    } else {
      // 선형: M = χH. 세로축을 확대해서 기울기의 부호만 비교한다
      const chi = effChi(), sgn = Math.sign(chi);
      ctx.strokeStyle = sgn > 0 ? C.warn : BLUE; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(-100), Y(-0.8 * sgn)); ctx.lineTo(X(100), Y(0.8 * sgn)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(H), Y(0.8 * sgn * H / 100), 5, 0, Math.PI * 2); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
      ctx.fillStyle = C.ink3;
      ctx.fillText(hot() ? "세로축 확대 (상자성)" : `세로축 확대: 철의 약 ${Math.abs(chi) > 1e-4 ? "1/10⁷" : "1/10⁸"}`, padL + 4, padT + 12);
      ctx.fillText(sgn > 0 ? "기울기 +" : "기울기 −", padL + 4, padT + 26);
    }
  }

  function update() {
    const H = +hIn.value;
    hOut.textContent = `${H > 0 ? "+" : ""}${H}`;
    applyH(H);
    if (mat === "fe" && !hot()) {
      const last = trail.at(-1);
      if (!last || last[0] !== H) trail.push([H, magFe()]);
      if (trail.length > 900) trail.shift();
    }
    const m = MAT[mat];
    nKind.textContent = hot() ? "상자성 (퀴리 온도 이상)" : m.kind;
    nChi.textContent = mat === "fe" ? (hot() ? "작은 양수" : "수백~수천 이상") : `${m.chi > 0 ? "+" : "−"}${fmtE(Math.abs(m.chi))}`;
    const chi = effChi();
    nF.textContent = Math.abs(H) < 3 ? "없음" : chi > 1 ? "강하게 끌림" : chi > 0 ? "아주 약하게 끌림" : "아주 약하게 밀림";
    root.querySelectorAll("[data-mat]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mat === mat)));
    heat.disabled = mat !== "fe";
    drawA(); drawB();
  }
  const fmtE = (x) => { const e = Math.floor(Math.log10(x)); const sup = (n) => String(n).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d] || "⁻").join(""); return `${(x / 10 ** e).toFixed(2)}×10${sup(e)}`; };

  hIn.addEventListener("input", update);
  heat.addEventListener("change", () => { demag(); update(); });
  $(".demag").addEventListener("click", () => { demag(); hIn.value = 0; update(); });
  root.querySelectorAll("[data-mat]").forEach((b) => b.addEventListener("click", () => { mat = b.dataset.mat; demag(); hIn.value = 0; heat.checked = false; update(); }));

  // 구역 화살표는 부드럽게 돌고, 상자성 화살표는 열운동으로 흔들린다 (정렬 정도는 과장한 모식)
  loop(cvA, (dt) => {
    const H = +hIn.value;
    let moving = false;
    D.forEach((d) => {
      let diff = d.th - d.show; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      if (Math.abs(diff) > 0.01) { d.show += diff * Math.min(1, dt * 10); moving = true; } else d.show = d.th;
      if (!NM.reduce && (mat === "al" || hot())) {
        const bias = hot() ? 1.5 : 3;
        d.pth += -bias * (H / 100) * Math.sin(d.pth) * dt * 2 + Math.sqrt(2 * 2.5 * dt) * gauss();
        moving = true;
      }
    });
    if (moving) drawA();
  });
  demag(); update();
})();
