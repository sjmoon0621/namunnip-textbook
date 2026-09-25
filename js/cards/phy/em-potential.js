/* 카드: 전위차는 '전기의 높이'일까? — 평행판 사이 균일한 전기장에서 전위·퍼텐셜 에너지·일 */
(() => {
  const root = document.getElementById("card-phy-potential");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const vIn = $(".volt"), vOut = $(".volt-out"), dIn = $(".gap"), dOut = $(".gap-out");
  const nV = $(".n-v"), nU = $(".n-u"), nL = $(".n-len"), nW = $(".n-w"), nE = $(".n-e");
  const BLUE = "#2f6fa3";
  const PART = { p: { q: 1, name: "양성자" }, e: { q: -1, name: "전자" }, a: { q: 2, name: "알파 입자" } };
  let kind = "p", ref = "neg";
  let px = 1.0, py = 2.2;      // 입자 위치 (cm, + 판에서의 거리 / 판 위쪽에서의 거리)
  let W = 0, len = 0, vx = 0, moving = false;
  const PH = 3.6;               // 판 높이 (cm)

  const V0 = () => +vIn.value, D = () => +dIn.value;
  // + 판 = V0, − 판 = 0 V 에서 기준을 옮기면 모든 전위가 같은 값만큼 바뀐다
  const Vat = (x) => V0() * (1 - x / D()) - (ref === "pos" ? V0() : 0);
  const q = () => PART[kind].q;

  const P = fit(cv, () => draw());
  let geo = null;

  function draw() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 520;
    // 왼쪽: 판 그림 / 오른쪽: 그래프
    const lw = narrow ? w * 0.54 : w * 0.56;
    const s = Math.min((lw - 56) / 4, (h - 60) / PH);
    const d = D(), x0 = 30 + (lw - 56 - d * s) / 2, x1 = x0 + d * s, y0 = (h - PH * s) / 2 + 4, y1 = y0 + PH * s;
    geo = { s, x0, y0 };

    // 등전위선 (판 사이를 6등분)
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let i = 0; i <= 6; i++) {
      const x = x0 + (x1 - x0) * i / 6;
      ctx.strokeStyle = "rgba(47,111,163,.35)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      if (i > 0 && i < 6) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.fillStyle = C.ink3;
      const v = Vat(d * i / 6);
      if (i % 2 === 0 || !narrow) ctx.fillText(`${+v.toFixed(1)}`, x, y1 + 14);
    }
    ctx.fillText("V", x1 + 14, y1 + 14);
    // 전기장 화살표
    ctx.strokeStyle = "rgba(35,35,38,.28)"; ctx.fillStyle = "rgba(35,35,38,.28)"; ctx.lineWidth = 1.2;
    if (V0() > 0) for (let j = 0; j < 5; j++) {
      const y = y0 + (j + 0.5) * (y1 - y0) / 5;
      ctx.beginPath(); ctx.moveTo(x0 + 6, y); ctx.lineTo(x1 - 8, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1 - 6, y); ctx.lineTo(x1 - 12, y - 3.5); ctx.lineTo(x1 - 12, y + 3.5); ctx.fill();
    }
    // 판
    ctx.fillStyle = C.warn; ctx.fillRect(x0 - 6, y0 - 6, 6, y1 - y0 + 12);
    ctx.fillStyle = BLUE; ctx.fillRect(x1, y0 - 6, 6, y1 - y0 + 12);
    ctx.font = `600 13px ${F.mono}`;
    ctx.fillStyle = C.warn; ctx.fillText("+", x0 - 3, y0 - 12);
    ctx.fillStyle = BLUE; ctx.fillText("−", x1 + 3, y0 - 12);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(`E = ${Math.round(V0() / (d / 100))} V/m →`, x0, y0 - 24 < 12 ? 12 : y0 - 24);
    // 입자
    const cx = x0 + px * s, cy = y0 + py * s, qq = q();
    ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fillStyle = qq > 0 ? C.warn : BLUE; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(qq > 0 ? (qq === 2 ? "+2" : "+") : "−", cx, cy + 4);
    // 힘 화살표
    if (V0() > 0) {
      const dir = qq > 0 ? 1 : -1, L = 12 + 4 * Math.abs(qq) * V0() / d / 3;
      ctx.strokeStyle = C.forest; ctx.fillStyle = C.forest; ctx.lineWidth = 2;
      const sx = cx + dir * 13, ex = sx + dir * L;
      ctx.beginPath(); ctx.moveTo(sx, cy); ctx.lineTo(ex, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + dir * 5, cy); ctx.lineTo(ex - dir * 2, cy - 4.5); ctx.lineTo(ex - dir * 2, cy + 4.5); ctx.fill();
      ctx.font = `10.5px ${F.mono}`; ctx.fillText("F", ex, cy - 9);
    }
    ctx.textAlign = "left";

    // 그래프: 위치에 따른 퍼텐셜 에너지 U = qV
    const gx = lw + (narrow ? 24 : 36), gw = w - gx - 10, gy = 26, gh = h - gy - 36;
    const Umax = 24;
    const X = (x) => gx + x / d * gw, Y = (u) => gy + (1 - (u + Umax) / (2 * Umax)) * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y,
      xt: [[0, "+판"], [d, "−판"]], yt: [[-24, "−24"], [-12, "−12"], [0, "0"], [12, "12"], [24, "24"]],
      ylabel: `U = qV (eV) · ${PART[kind].name}`, xlabel: "" });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, Y(0) + .5); ctx.lineTo(gx + gw, Y(0) + .5); ctx.stroke();
    ctx.strokeStyle = qq > 0 ? C.warn : BLUE; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(X(0), Y(qq * Vat(0))); ctx.lineTo(X(d), Y(qq * Vat(d))); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(px), Y(qq * Vat(px)), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText("위치", gx + gw / 2, gy + gh + 14);
    ctx.textAlign = "left";
  }

  function update() {
    vOut.textContent = vIn.value; dOut.textContent = dIn.value;
    px = clamp(px, 0.15, D() - 0.15);
    const v = Vat(px), qq = q();
    nV.textContent = `${v.toFixed(2)} V`;
    nU.textContent = `${(qq * v).toFixed(2)} eV`;
    nL.textContent = `${len.toFixed(1)} cm`;
    nW.textContent = `${(W >= 0 ? "+" : "−")}${Math.abs(W).toFixed(2)} eV`;
    nE.textContent = `${Math.round(V0() / (D() / 100))} V/m`;
    root.querySelectorAll("[data-kind]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.kind === kind)));
    root.querySelectorAll("[data-ref]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ref === ref)));
    draw();
  }

  // 옮긴 만큼 전기장이 한 일: W = qE·Δx (eV 단위: 전하 e × 전기장 V/cm × cm)
  function moveTo(nx, ny) {
    nx = clamp(nx, 0.15, D() - 0.15); ny = clamp(ny, 0.3, PH - 0.3);
    W += q() * (V0() / D()) * (nx - px);
    len += Math.hypot(nx - px, ny - py);
    px = nx; py = ny;
  }
  const reset = () => { W = 0; len = 0; moving = false; vx = 0; };

  let drag = false;
  const toCm = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - geo.x0) / geo.s, y: (e.clientY - r.top - geo.y0) / geo.s }; };
  cv.addEventListener("pointerdown", (e) => {
    if (!geo) return;
    const p = toCm(e);
    if (Math.hypot(p.x - px, p.y - py) * geo.s < 26) { drag = true; moving = false; cv.setPointerCapture(e.pointerId); }
  });
  cv.addEventListener("pointermove", (e) => { if (drag) { const p = toCm(e); moveTo(p.x, p.y); update(); } });
  const up = () => { drag = false; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);

  vIn.addEventListener("input", () => { reset(); update(); });
  dIn.addEventListener("input", () => { reset(); update(); });
  root.querySelectorAll("[data-kind]").forEach((b) => b.addEventListener("click", () => { kind = b.dataset.kind; reset(); update(); }));
  root.querySelectorAll("[data-ref]").forEach((b) => b.addEventListener("click", () => { ref = b.dataset.ref; update(); }));
  $(".zero").addEventListener("click", () => { reset(); update(); });
  $(".release").addEventListener("click", () => { if (V0() > 0) { moving = true; vx = 0; } });

  // 놓으면: 힘의 방향으로 가속 (시간은 느리게 보여 준다)
  loop(cv, (dt) => {
    if (!moving) return;
    const dir = q() > 0 ? 1 : -1;
    vx += dir * 6 * dt;
    const nx = px + vx * dt;
    if (nx <= 0.15 || nx >= D() - 0.15) { moveTo(nx, py); moving = false; }
    else moveTo(nx, py);
    update();
  });
  update();
})();
