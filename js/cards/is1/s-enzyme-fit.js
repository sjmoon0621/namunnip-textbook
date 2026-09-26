/* 카드: 효소는 왜 특정 물질에만 작용할까? — 활성 부위와 기질의 모양 (탄수화물 분해 효소, 모식) */
(() => {
  const root = document.getElementById("card-is1-enzyme-fit");
  if (!root) return;
  const { C, F, clamp, ease, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const eChips = [...root.querySelectorAll("[data-enz]")], sChips = [...root.querySelectorAll("[data-sub]")];
  const go = $(".meet"), grid = $(".fit-grid"), note = $(".fit-note");

  // 단위: g 포도당, f 과당, l 갈락토스 / 결합: a (α, 꺾인 모양), b (β, 곧은 모양·뒤집힘)
  const SUB = {
    starch: { name: "녹말", units: ["g", "g"], bond: "a", prod: "엿당 (포도당 2개)", note: "포도당이 α 결합으로 길게 이어진 사슬. 두 단위만 그림." },
    cellulose: { name: "셀룰로스", units: ["g", "g"], bond: "b", prod: "셀로비오스 (포도당 2개)", note: "포도당이 β 결합으로 곧게 이어진 사슬. 두 단위만 그림." },
    lactose: { name: "젖당", units: ["l", "g"], bond: "b", prod: "갈락토스 + 포도당", note: "갈락토스와 포도당이 β 결합." },
    sucrose: { name: "설탕", units: ["g", "f"], bond: "a", prod: "포도당 + 과당", note: "포도당과 과당이 결합." },
  };
  const ENZ = {
    amylase: { name: "아밀레이스", fits: "starch", where: "침·이자액" },
    cellulase: { name: "셀룰레이스", fits: "cellulose", where: "사람에게는 없음 (소의 위 속 미생물 등)" },
    lactase: { name: "락테이스", fits: "lactose", where: "소장" },
    sucrase: { name: "수크레이스", fits: "sucrose", where: "소장" },
  };
  const COL = { g: "#74ab66", f: C.amber, l: "#8f6bb0" };
  const UNAME = { g: "포도당", f: "과당", l: "갈락토스" };
  let enz = "amylase", sub = "starch", t = -1; // t: 애니메이션 시간 (-1 = 대기)
  const tried = {};

  const { ctx, size } = fit(cv, () => draw());

  // 기질 모양의 기하: 단위 A 중심 기준 B의 위치
  const geom = (s, u) => {
    const S = SUB[s];
    return { dx: 2.3 * u, dy: S.bond === "a" ? 1.0 * u : 0, flip: S.bond === "b", units: S.units };
  };
  function unitPath(kind, x, y, u, rot) {
    const n = kind === "f" ? 5 : 6;
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const a = rot + Math.PI * 2 * i / n; const px = x + u * Math.cos(a), py = y + u * Math.sin(a); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath();
  }
  function drawSub(s, x, y, u, split, alpha) {
    const G = geom(s, u);
    ctx.save(); ctx.globalAlpha = alpha;
    const bx = x + G.dx + split, by = y + G.dy + split * 0.3, ax = x - split * 0.6, ay = y - split * 0.2;
    if (split < 1) { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax + u * 0.8, ay + (G.dy ? u * 0.35 : 0)); ctx.lineTo(bx - u * 0.8, by - (G.dy ? u * 0.35 : 0)); ctx.stroke(); }
    [[G.units[0], ax, ay, false], [G.units[1], bx, by, G.flip]].forEach(([k, px, py, fl]) => {
      unitPath(k, px, py, u, k === "f" ? -Math.PI / 2 : 0);
      ctx.fillStyle = COL[k]; ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1; ctx.stroke();
      // 방향 표시 (β 결합이면 둘째 단위가 뒤집혀 있음)
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px, py + (fl ? u * 0.55 : -u * 0.55), u * 0.18, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }
  // 활성 부위: 맞는 기질의 윤곽을 효소에서 파낸다
  function drawEnzyme(x, y, u, w, h) {
    const E = ENZ[enz], G = geom(E.fits, u);
    ctx.save();
    ctx.fillStyle = "#c9d9e6";
    ctx.beginPath(); ctx.ellipse(x - u * 1.2, y + u * 0.4, u * 4.2, u * 3.4, 0, 0, Math.PI * 2); ctx.fill();
    // 파내기
    ctx.globalCompositeOperation = "destination-out";
    const pad = u * 0.12;
    const cut = (k, px, py) => { unitPath(k, px, py, u + pad, k === "f" ? -Math.PI / 2 : 0); ctx.fill(); };
    cut(G.units[0], x, y); cut(G.units[1], x + G.dx, y + G.dy);
    ctx.lineWidth = u * 0.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + G.dx, y + G.dy); ctx.stroke();
    ctx.fillRect(x + G.dx, y + G.dy - u - pad, w, 2 * (u + pad));
    ctx.restore();
    // 활성 부위 속 표시: 뒤집힌 방향 맞춤 홈
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.beginPath(); ctx.arc(x, y - u * 0.55, u * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + G.dx, y + G.dy + (G.flip ? u * 0.55 : -u * 0.55), u * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 13px ${F.sans}`; ctx.fillStyle = "#2f5372"; ctx.textAlign = "center";
    ctx.fillText(E.name, x - u * 2.2, y + u * 3.2); ctx.textAlign = "left";
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const u = Math.min(w * 0.05, h * 0.09);
    const dock = { x: w * 0.3, y: h * 0.45 };
    drawEnzyme(dock.x, dock.y, u, w, h);
    const ok = ENZ[enz].fits === sub;
    const start = { x: w * 0.68, y: h * 0.45 - (SUB[sub].bond === "a" ? u * 0.5 : 0) };
    let x = start.x, y = start.y, split = 0, alpha = 1, msg = "";
    if (t >= 0) {
      const a = ease(clamp(t / 1.1, 0, 1));
      const stopX = ok ? dock.x : dock.x + u * 3.2;       // 맞지 않으면 입구에서 걸림
      const stopY = ok ? dock.y : dock.y;
      x = start.x + (stopX - start.x) * a; y = start.y + (stopY - start.y) * a;
      if (ok && t > 1.3) { split = ease(clamp((t - 1.3) / 1.0, 0, 1)) * u * 3; msg = `분해됨 → ${SUB[sub].prod} (물 분자 1개가 쓰임)`; }
      if (!ok && t > 1.1) { const b = ease(clamp((t - 1.3) / 0.9, 0, 1)); x = stopX + (start.x - stopX) * b; msg = "활성 부위에 맞지 않아 반응하지 않음"; }
      if (ok && t > 1.1 && t < 1.5) { ctx.fillStyle = "rgba(224,160,42,.35)"; ctx.beginPath(); ctx.arc(dock.x + u * 1.15, dock.y + (SUB[sub].bond === "a" ? u * 0.5 : 0), u * 0.9, 0, Math.PI * 2); ctx.fill(); }
    }
    drawSub(sub, x, y, u, split, alpha);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    if (t < 0) ctx.fillText(SUB[sub].name, start.x + u * 1.15, start.y + u * 2.6);
    if (msg) { ctx.fillStyle = ok ? C.forest : C.warn; ctx.fillText(msg, w / 2, h - 12); }
    ctx.textAlign = "left";
    // 범례
    ctx.font = `10.5px ${F.mono}`; let lx = 8;
    for (const k of ["g", "f", "l"]) {
      unitPath(k, lx + 6, 14, 6, k === "f" ? -Math.PI / 2 : 0); ctx.fillStyle = COL[k]; ctx.fill();
      ctx.fillStyle = C.ink2; ctx.fillText(UNAME[k], lx + 16, 18); lx += 16 + ctx.measureText(UNAME[k]).width + 12;
    }
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("흰 점: 분자의 방향 · 모식", w - 8, 18); ctx.textAlign = "left";
  }

  function renderGrid() {
    const E = Object.keys(ENZ), S = Object.keys(SUB);
    let html = `<table><thead><tr><th></th>${S.map((s) => `<th>${SUB[s].name}</th>`).join("")}</tr></thead><tbody>`;
    for (const e of E) {
      html += `<tr><th>${ENZ[e].name}</th>`;
      for (const s of S) { const k = e + "|" + s; html += `<td class="${k in tried ? (tried[k] ? "y" : "n") : ""}">${k in tried ? (tried[k] ? "분해" : "×") : "?"}</td>`; }
      html += "</tr>";
    }
    grid.innerHTML = html + "</tbody></table>";
  }
  function update() {
    eChips.forEach((c) => c.setAttribute("aria-pressed", c.dataset.enz === enz ? "true" : "false"));
    sChips.forEach((c) => c.setAttribute("aria-pressed", c.dataset.sub === sub ? "true" : "false"));
    note.textContent = `${SUB[sub].name}: ${SUB[sub].note} ${ENZ[enz].name}가 있는 곳: ${ENZ[enz].where}.`;
    t = -1; draw();
  }
  eChips.forEach((c) => c.addEventListener("click", () => { enz = c.dataset.enz; update(); }));
  sChips.forEach((c) => c.addEventListener("click", () => { sub = c.dataset.sub; update(); }));
  go.addEventListener("click", () => { t = 0; tried[enz + "|" + sub] = ENZ[enz].fits === sub; renderGrid(); });
  renderGrid(); update();
  loop(cv, (dt) => { if (t < 0) return; t += dt; if (t > 3) { t = 3; } draw(); });
})();
