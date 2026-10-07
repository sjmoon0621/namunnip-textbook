/* 카드: 돌아가는 원판 위로 굴린 공은 정말 휘어서 갈까? — 관성계와 회전계에서 본 경로, 휘어짐 s = ΩR²/v, 위도별 전향 인자 */
(() => {
  const root = document.getElementById("card-labearth-coriolis");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sW = $(".w"), sV = $(".v"), sPhi = $(".phi"), bias = $(".bias");
  const R = 0.25, OMEGA_E = 7.2921e-5, SIDEREAL = 23.9345;
  let mode = "c", cw = false, run = null, rot = 0, last = null;

  const omegaTrue = () => (+sW.value * 2 * Math.PI / 60) * (bias.checked ? 1.1 : 1) * (cw ? -1 : 1);
  /* 시각 t에서 관성계 위치와 원판 회전각 */
  function setup() {
    const v = +sV.value, W = omegaTrue();
    if (mode === "c") return { p0: [0, 0], u: [v, 0], W };
    return { p0: [-R, 0], u: [v, -W * R], W };   // 가장자리 점은 원판과 함께 ΩR로 움직이고 있다
  }
  const posIn = (S, t) => [S.p0[0] + S.u[0] * t, S.p0[1] + S.u[1] * t];
  const toRot = (p, ang) => [p[0] * Math.cos(-ang) - p[1] * Math.sin(-ang), p[0] * Math.sin(-ang) + p[1] * Math.cos(-ang)];
  function tEnd(S) {
    /* |p0 + u t| = R 의 양의 근 (중심 모드), 가장자리 모드는 반대편 가장자리 */
    const a = S.u[0] ** 2 + S.u[1] ** 2, b = 2 * (S.p0[0] * S.u[0] + S.p0[1] * S.u[1]), c = S.p0[0] ** 2 + S.p0[1] ** 2 - R * R;
    return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  }

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "rpm", label: "표시 회전 (rpm)", res: 1 }, { key: "v", label: "v (m/s)", res: 0.01 },
    { key: "pred", label: "ΩR²/v (cm)", res: 0.1 }, { key: "s", label: "잰 휘어짐 s (cm)", res: 0.5 }, { key: "side", label: "방향" },
  ], () => drawPlot());

  function disk(ctx, cx, cy, rr, ang, title) {
    ctx.fillStyle = "#eef0e8"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let k = 0; k < 8; k++) {
      const a = ang + k * Math.PI / 4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * rr, cy - Math.sin(a) * rr); ctx.stroke();
    }
    /* 겨눈 표시점 (원판에 붙어 있음) */
    const tx = mode === "c" ? 1 : 0, aim = [cx + Math.cos(ang) * rr * tx, cy - Math.sin(ang) * rr * tx];
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(aim[0], aim[1], 5, 0, Math.PI * 2); ctx.fill();
    if (mode === "e") {
      const st = [cx - Math.cos(ang) * rr, cy + Math.sin(ang) * rr];
      ctx.fillStyle = C.ink3; ctx.beginPath(); ctx.arc(st[0], st[1], 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText(title, cx, cy - rr - 10);
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rr = Math.min(w * 0.21, (h - 50) / 2), cy = h / 2 + 8, c1 = w * 0.25, c2 = w * 0.75, sc = rr / R;
    const S = run ? run.S : setup(), t = run ? Math.min(run.t, run.T) : 0, ang = run ? S.W * t : rot;
    disk(ctx, c1, cy, rr, ang, "밖에서 본 모습 (관성계)");
    disk(ctx, c2, cy, rr, 0, "원판 위 종이 (회전계)");
    /* 회전 방향 화살표 */
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(c1, cy, rr + 6, cw ? -0.3 : 0.3, cw ? -1.1 : 1.1, cw); ctx.stroke();
    if (run || last) {
      const RS = run || last, TT = run ? t : RS.T, n = 60;
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.warn; ctx.beginPath();
      for (let i = 0; i <= n; i++) { const p = posIn(RS.S, TT * i / n); const x = c1 + p[0] * sc, y = cy - p[1] * sc; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.strokeStyle = C.forest; ctx.beginPath();
      for (let i = 0; i <= n; i++) { const tt = TT * i / n, q = toRot(posIn(RS.S, tt), RS.S.W * tt); const x = c2 + q[0] * sc, y = cy - q[1] * sc; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      const p = posIn(RS.S, TT), q = toRot(p, RS.S.W * TT);
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.arc(c1 + p[0] * sc, cy - p[1] * sc, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c2 + q[0] * sc, cy - q[1] * sc, 4.5, 0, Math.PI * 2); ctx.fill();
    }
    /* 겨눈 방향 점선 (회전계) */
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mode === "c" ? c2 : c2 - rr, cy); ctx.lineTo(mode === "c" ? c2 + rr : c2, cy); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(cw ? "시계 방향 회전" : "반시계 방향 회전", 6, h - 6);
    ctx.textAlign = "right"; ctx.fillText("겨눈 점", w - 6, h - 6);
    ctx.fillStyle = C.amber; ctx.fillText("●", w - 50, h - 6);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.pred, y: r.s }));
    const f = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    const mx = Math.max(10, ...pts.map((p) => Math.max(p.x, p.y))) * 1.1;
    L.plot(ctx, { x0: 44, y0: 22, w: w - 58, h: h - 56 }, { pts, fit: f, model: (x) => x, xr: [0, mx], yr: [0, mx], xlabel: "표시값으로 계산한 ΩR²/v (cm)", ylabel: "잰 휘어짐 s (cm)" });
    if (f) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`기울기 ${f.a.toFixed(3)} ± ${f.sa.toFixed(3)}   (점선: 기울기 1)`, 50, 36); }
  }

  function finish(S, T) {
    last = { S, T };
    if (mode !== "c") return;
    const arc = -S.W * T * R * 100;   // 겨눈 점에서 가장자리를 따라 잰 호 길이 cm, 음수 = 오른쪽 (한 바퀴를 넘어도 이어서 잼)
    const rpm = +sW.value, v = +sV.value;
    tbl.add({ rpm, v, pred: rpm * 2 * Math.PI / 60 * R * R / v * 100, s: L.measure(Math.abs(arc), { sd: 0.4, res: 0.5 }), side: Math.abs(arc) < 0.25 ? "—" : arc < 0 ? "오른쪽" : "왼쪽" });
  }

  function latNums() {
    const phi = +sPhi.value, f = 2 * OMEGA_E * Math.sin(phi * Math.PI / 180);
    $(".p-out").textContent = phi.toFixed(1);
    $(".n-f").textContent = (f * 1e4).toFixed(3) + "×10⁻⁴ /s";
    const s = Math.abs(Math.sin(phi * Math.PI / 180));
    $(".n-i").textContent = s < 0.01 ? "없음 (적도)" : (2 * Math.PI / Math.abs(f) / 3600).toFixed(1) + " 시간";
    $(".n-fp").textContent = s < 0.01 ? "돌지 않음" : (SIDEREAL / s).toFixed(1) + " 시간" + (phi < 0 ? " (반시계)" : phi > 0 ? " (시계)" : "");
  }

  loop($(".cv-wide"), (dt) => {
    if (run) {
      run.t += dt * 0.6;   // 0.6배 느린 화면
      if (run.t >= run.T) { const r = run; run = null; finish(r.S, r.T); }
    } else rot += omegaTrue() * dt * 0.6;
    drawApp();
  });

  const upd = () => { $(".w-out").textContent = sW.value; $(".v-out").textContent = (+sV.value).toFixed(2); last = null; drawApp(); };
  [sW, sV].forEach((el) => el.addEventListener("input", upd));
  bias.addEventListener("change", upd);
  sPhi.addEventListener("input", () => { latNums(); root.querySelectorAll("[data-lat]").forEach((x) => x.setAttribute("aria-pressed", "false")); });
  $(".launch").addEventListener("click", () => { if (run) return; rot = 0; const S = setup(); run = { S, t: 0, T: tEnd(S) }; });
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; });
  $(".mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]");
    if (b) { mode = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }
    else if (e.target.closest(".dir")) { cw = !cw; $(".dir").setAttribute("aria-pressed", String(cw)); }
    else return;
    run = null; last = null; rot = 0; drawApp();
  });
  $(".places").addEventListener("click", (e) => {
    const b = e.target.closest("[data-lat]"); if (!b) return;
    sPhi.value = b.dataset.lat; latNums();
    root.querySelectorAll("[data-lat]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
  upd(); latNums();
  if (L.demo) {
    const go = (rpm, v) => { sW.value = rpm; sV.value = v; const S = setup(); finish(S, tEnd(S)); };
    [[5, 0.5], [10, 0.5], [15, 0.5], [20, 0.5], [10, 0.3], [10, 0.8], [10, 1.0]].forEach(([a, b]) => go(a, b));
    sW.value = 10; sV.value = 0.5; $(".w-out").textContent = "10"; $(".v-out").textContent = "0.50";
    const S = setup(); last = { S, T: tEnd(S) };
  }
})();
