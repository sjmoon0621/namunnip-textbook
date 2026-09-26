/* 카드 2.6.2: 반도체에 불순물을 넣으면 왜 전기가 잘 통할까? — 규소 격자에 인·붕소 넣기 (2차원 모식) */
(() => {
  const root = document.getElementById("card-is1-doping");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), volt = $(".volt"), dS = $(".d"), dOut = $(".d-out");
  const oPer = $(".per"), oCar = $(".car"), oX = $(".x");

  const COLS = 9, ROWS = 5, NSI = 5.0e22, NI = 1.0e10;
  let grid = Array(COLS * ROWS).fill("Si"), carriers = [];
  const E_COL = "#3f78b5", P_COL = "#e0a02a", B_COL = "#9fc3a0";

  const SUPD = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sci = (v) => { const e = Math.floor(Math.log10(v) + 1e-9), m = v / 10 ** e; return `${m.toFixed(m < 9.95 ? 1 : 0)}×10${String(e).split("").map((d) => SUPD[d]).join("")}`; };

  function rebuildCarriers() {
    carriers = [];
    grid.forEach((t, i) => {
      if (t === "Si") return;
      const c = i % COLS, r = Math.floor(i / COLS);
      carriers.push({ kind: t === "P" ? "e" : "h", x: c + (t === "P" ? 0.3 : 0.5), y: r + (t === "P" ? 0.3 : 0), home: i });
    });
  }

  const { ctx, size } = fit(cv, () => draw());
  function geo() {
    const { w, h } = size;
    const padX = 34, padY = 22;
    const gx = (w - 2 * padX) / (COLS - 1), gy = (h - padY - 34) / (ROWS - 1);
    return { w, h, padX, padY, gx, gy, X: (c) => padX + c * gx, Y: (r) => padY + r * gy };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const G = geo(), r = Math.min(G.gx, G.gy) * 0.26;
    // 결합 (전자쌍)
    for (let rr = 0; rr < ROWS; rr++) for (let c = 0; c < COLS; c++) {
      for (const [dc, dr] of [[1, 0], [0, 1]]) {
        const c2 = c + dc, r2 = rr + dr; if (c2 >= COLS || r2 >= ROWS) continue;
        const x1 = G.X(c), y1 = G.Y(rr), x2 = G.X(c2), y2 = G.Y(r2);
        ctx.strokeStyle = "rgba(35,35,38,.2)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ox = dr ? 3.5 : 0, oy = dc ? 3.5 : 0;
        ctx.fillStyle = C.ink2;
        ctx.beginPath(); ctx.arc(mx - ox, my - oy, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(mx + ox, my + oy, 2.4, 0, Math.PI * 2); ctx.fill();
      }
    }
    // 원자
    grid.forEach((t, i) => {
      const x = G.X(i % COLS), y = G.Y(Math.floor(i / COLS));
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = t === "Si" ? "#d9dad2" : t === "P" ? P_COL : B_COL; ctx.fill();
      ctx.strokeStyle = "rgba(35,35,38,.45)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `600 ${Math.max(9, Math.round(r * 0.72))}px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(t, x, y + r * 0.28);
      if (t !== "Si") { ctx.font = `600 ${Math.max(9, Math.round(r * 0.6))}px ${F.mono}`; ctx.fillStyle = t === "P" ? C.apple : "#3f78b5"; ctx.fillText(t === "P" ? "+" : "−", x + r * 0.95, y - r * 0.7); }
    });
    // 전하 운반자
    for (const p of carriers) {
      const x = G.X(p.x), y = G.Y(p.y);
      if (p.kind === "e") { ctx.fillStyle = E_COL; ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.arc(x + 3.5, y, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x - 3.5, y, 4, 0, Math.PI * 2); ctx.stroke(); }
    }
    // 전극 표시
    ctx.font = `600 14px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillStyle = volt.checked ? "#3f78b5" : C.ink3; ctx.fillText("−", 12, h / 2 + 5);
    ctx.fillStyle = volt.checked ? C.apple : C.ink3; ctx.fillText("+", w - 12, h / 2 + 5);
    if (!carriers.length) {
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
      const msg = "모든 전자가 결합에 묶여 있음 · 원자를 눌러 불순물을 넣어 보세요";
      const tw = ctx.measureText(msg).width;
      ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(w / 2 - tw / 2 - 6, h - 16, tw + 12, 15);
      ctx.fillStyle = C.ink2; ctx.fillText(msg, w / 2, h - 5);
    }
    ctx.textAlign = "left";
  }

  function update() {
    const lg = +dS.value, N = 10 ** lg;
    dOut.textContent = `${sci(N)} 개/cm³`;
    const hasP = grid.includes("P"), hasB = grid.includes("B");
    if (!hasP && !hasB) {
      oPer.textContent = "넣지 않음"; oCar.textContent = `약 ${sci(NI)}`; oX.textContent = "1배";
    } else if (hasP && hasB) {
      oPer.textContent = "인과 붕소가 섞임"; oCar.textContent = "서로 상쇄"; oX.textContent = "—";
    } else {
      const per = NSI / N;
      oPer.textContent = per >= 1e4 ? `약 ${sci(per)}` : `약 ${Math.round(per).toLocaleString("ko-KR")}`;
      const n = N / 2 + Math.sqrt((N / 2) ** 2 + NI * NI);
      oCar.textContent = `${sci(n)} (${hasP ? "전자" : "양공"})`;
      oX.textContent = `${sci(n / NI)}배`;
    }
    draw();
  }

  root.querySelectorAll(".kinds .chip").forEach((b) => b.addEventListener("click", () => {
    grid = Array(COLS * ROWS).fill("Si");
    if (b.dataset.k !== "pure") for (const i of [COLS + 2, 3 * COLS + 6]) grid[i] = b.dataset.k === "n" ? "P" : "B";
    root.querySelectorAll(".kinds .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    rebuildCarriers(); update();
  }));
  cv.addEventListener("click", (e) => {
    const rc = cv.getBoundingClientRect(), G = geo();
    const c = Math.round((e.clientX - rc.left - G.padX) / G.gx), r = Math.round((e.clientY - rc.top - G.padY) / G.gy);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
    const i = r * COLS + c;
    grid[i] = grid[i] === "Si" ? "P" : grid[i] === "P" ? "B" : "Si";
    root.querySelectorAll(".kinds .chip").forEach((x) => x.setAttribute("aria-pressed", "false"));
    rebuildCarriers(); update();
  });
  dS.addEventListener("input", update);
  volt.addEventListener("change", draw);

  let tt = 0;
  loop(cv, (dt) => {
    if (!carriers.length || NM.reduce) return;
    tt += dt;
    for (const p of carriers) {
      if (p.kind === "e") {
        // 자유 전자: 결정 속을 떠돌며, 전압이 걸리면 (+)극 쪽으로 이동
        p.x += (volt.checked ? 0.9 : 0) * dt + Math.sin(tt * 3 + p.home) * 0.4 * dt;
        p.y += Math.cos(tt * 2.3 + p.home * 1.7) * 0.5 * dt;
        p.y = clamp(p.y, 0.15, ROWS - 1.15);
        if (p.x > COLS - 1) p.x -= COLS - 1; if (p.x < 0) p.x += COLS - 1;
      } else {
        // 양공: 이웃 결합의 전자가 빈자리로 옮겨 가며 결합 자리를 따라 한 칸씩 (−)극 쪽으로
        p.t = (p.t || 0) + dt * (volt.checked ? 1.6 : 0.5);
        if (p.t > 1) {
          p.t = 0;
          const dir = volt.checked ? -1 : (Math.random() < .5 ? -1 : 1);
          p.x += dir;
          if (p.x < 0) p.x += COLS - 1; if (p.x > COLS - 1) p.x -= COLS - 1;
        }
      }
    }
    draw();
  });
  rebuildCarriers(); update();
})();
