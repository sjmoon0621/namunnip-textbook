/* 카드: 상자 한 변의 길이만 재면 금속의 밀도를 알 수 있을까? — 단위세포 3D 모형과 밀도 계산 */
(() => {
  const root = document.getElementById("card-labchem-unit-cell");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const NA = 6.02214e23, S3 = Math.sqrt(3), S2 = Math.sqrt(2);

  /* 구조 정보. r은 a 단위의 원자 반지름(맞닿을 때) */
  const ST = {
    sc: { name: "단순 입방", Z: 1, cn: 6, pe: Math.PI / 6, r: 0.5, rtxt: "2r = a", ztxt: "꼭짓점 8 × 1/8 = 1" },
    bcc: { name: "체심 입방", Z: 2, cn: 8, pe: S3 * Math.PI / 8, r: S3 / 4, rtxt: "4r = √3 a", ztxt: "꼭짓점 8 × 1/8 + 가운데 1 = 2" },
    fcc: { name: "면심 입방", Z: 4, cn: 12, pe: Math.PI / (3 * S2), r: S2 / 4, rtxt: "4r = √2 a", ztxt: "꼭짓점 8 × 1/8 + 면 6 × 1/2 = 4" },
    hcp: { name: "육방 밀집", Z: 6, cn: 12, pe: Math.PI / (3 * S2), r: 0.5, rtxt: "2r = a", ztxt: "꼭짓점 12 × 1/6 + 윗·아랫면 2 × 1/2 + 안쪽 3 = 6 (육각기둥)" },
  };
  /* 금속: 실제 구조, 격자 상수(pm, 상온), 몰질량, 문헌 밀도(g/cm³) */
  const MET = {
    Po: { s: "sc", a: 335.9, M: 208.98, rho: 9.20 },
    Na: { s: "bcc", a: 429.1, M: 22.990, rho: 0.968 },
    Fe: { s: "bcc", a: 286.65, M: 55.845, rho: 7.874 },
    Al: { s: "fcc", a: 404.95, M: 26.982, rho: 2.70 },
    Cu: { s: "fcc", a: 361.49, M: 63.546, rho: 8.96 },
    Mg: { s: "hcp", a: 320.94, c: 521.08, M: 24.305, rho: 1.738 },
    Zn: { s: "hcp", a: 266.49, c: 494.68, M: 65.38, rho: 7.14 },
  };
  let st = "bcc", met = "Fe", yaw = 0.55, pitch = 0.32, drag = null, idle = true;

  /* 원자 좌표 만들기: 단위세포 안(가중치 포함) + 바깥 이웃(배위수 보기용) */
  function build(s) {
    const pts = [], out = [];
    const ca = 1.633;
    if (s === "hcp") {
      const a1 = [1, 0], a2 = [-0.5, S3 / 2];
      const basis = [[0, 0, 0], [1 / 3, 2 / 3, 0.5]];
      const inHex = (x, y) => {
        for (let k = 0; k < 6; k++) {
          const t = Math.PI / 6 + k * Math.PI / 3;
          if (x * Math.cos(t) + y * Math.sin(t) > S3 / 2 + 1e-6) return false;
        }
        return true;
      };
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) for (let k = -1; k <= 1; k++) for (const b of basis) {
        const u = i + b[0], v = j + b[1];
        const x = u * a1[0] + v * a2[0], y = u * a1[1] + v * a2[1], z = (k + b[2]) * ca;
        const p = { x, y, z: z - ca / 2 };
        if (inHex(x, y) && z > -1e-6 && z < ca + 1e-6) {
          const onV = Math.abs(Math.hypot(x, y) - 1) < 1e-6, onZ = Math.abs(z) < 1e-6 || Math.abs(z - ca) < 1e-6;
          p.w = (onZ ? 0.5 : 1) * (onV ? 1 / 3 : 1);
          pts.push(p);
        } else out.push(p);
      }
      return { pts, out, ref: { x: 0, y: 0, z: ca / 2 }, nn: 1, ext: ca };
    }
    const basis = { sc: [[0, 0, 0]], bcc: [[0, 0, 0], [0.5, 0.5, 0.5]], fcc: [[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]] }[s];
    for (let i = -1; i <= 2; i++) for (let j = -1; j <= 2; j++) for (let k = -1; k <= 2; k++) for (const b of basis) {
      const x = i + b[0], y = j + b[1], z = k + b[2];
      const p = { x: x - 0.5, y: y - 0.5, z: z - 0.5 };
      const inC = [x, y, z].every((q) => q > -1e-6 && q < 1 + 1e-6);
      if (inC) {
        p.w = [x, y, z].reduce((m, q) => m * (Math.abs(q) < 1e-6 || Math.abs(q - 1) < 1e-6 ? 0.5 : 1), 1);
        pts.push(p);
      } else out.push(p);
    }
    const ref = { sc: { x: 0.5, y: 0.5, z: 0.5 }, bcc: { x: 0, y: 0, z: 0 }, fcc: { x: 0, y: 0, z: 0.5 } }[s];
    const nn = { sc: 1, bcc: S3 / 2, fcc: S2 / 2 }[s];
    return { pts, out, ref, nn, ext: 1 };
  }
  const wColor = (w) => (w > 0.99 ? C.warn : w > 0.4 ? C.amber : w > 0.2 ? C.apple : C.leaf);
  const wName = (w) => (w > 0.99 ? "안쪽 (1)" : w > 0.4 ? "면 (1/2)" : w > 0.2 ? "모서리 (1/4)" : w > 0.15 ? "꼭짓점 (1/6)" : "꼭짓점 (1/8)");

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "m", label: "금속" }, { key: "s", label: "가정 구조" }, { key: "Z", label: "Z", res: 1 },
    { key: "a", label: "a (pm)", res: 0.1 }, { key: "c", label: "c (pm)", res: 0.1 },
    { key: "rc", label: "ρ계산", res: 0.01 }, { key: "rl", label: "ρ문헌", res: 0.01 },
  ], () => drawPlot());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const g = build(st), fill = $(".fill").checked, cn = $(".cn").checked;
    const cx = w * 0.5, cy = h * 0.54, sc = h * (st === "hcp" ? 0.23 : 0.36);
    const cy0 = Math.cos(yaw), sy0 = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const P = (p) => {
      const x1 = p.x * cy0 - p.y * sy0, y1 = p.x * sy0 + p.y * cy0;
      const y2 = y1 * cp - p.z * sp, z2 = y1 * sp + p.z * cp;
      const f = 6 / (6 + y2);
      return { X: cx + x1 * sc * f, Y: cy - z2 * sc * f, d: y2, f };
    };
    /* 세포 모서리 */
    let edges = [];
    if (st === "hcp") {
      const ca = 1.633, hx = [...Array(6)].map((_, k) => [Math.cos(k * Math.PI / 3), Math.sin(k * Math.PI / 3)]);
      for (let k = 0; k < 6; k++) {
        const [x, y] = hx[k], [x2, y2] = hx[(k + 1) % 6];
        for (const z of [-ca / 2, ca / 2]) edges.push([{ x, y, z }, { x: x2, y: y2, z }]);
        edges.push([{ x, y, z: -ca / 2 }, { x, y, z: ca / 2 }]);
      }
    } else {
      const v = [-0.5, 0.5];
      for (const a of v) for (const b of v) {
        edges.push([{ x: -0.5, y: a, z: b }, { x: 0.5, y: a, z: b }]);
        edges.push([{ x: a, y: -0.5, z: b }, { x: a, y: 0.5, z: b }]);
        edges.push([{ x: a, y: b, z: -0.5 }, { x: a, y: b, z: 0.5 }]);
      }
    }
    const rr = fill ? ST[st].r : 0.11;
    const items = [];
    g.pts.forEach((p) => items.push({ p, ghost: false }));
    let nbr = [];
    if (cn) {
      const all = g.pts.concat(g.out);
      nbr = all.filter((q) => Math.abs(Math.hypot(q.x - g.ref.x, q.y - g.ref.y, q.z - g.ref.z) - g.nn) < 1e-4);
      g.out.forEach((q) => { if (nbr.includes(q)) items.push({ p: q, ghost: true }); });
    }
    const isRef = (p) => Math.hypot(p.x - g.ref.x, p.y - g.ref.y, p.z - g.ref.z) < 1e-6;
    /* 뒤쪽 모서리 먼저 */
    ctx.lineWidth = 1;
    const drawEdges = (back) => {
      edges.forEach(([a, b]) => {
        const A = P(a), B = P(b);
        if ((A.d + B.d > 0) !== back) return;
        ctx.strokeStyle = back ? C.rule : C.ink2; ctx.setLineDash(back ? [3, 3] : []);
        ctx.beginPath(); ctx.moveTo(A.X, A.Y); ctx.lineTo(B.X, B.Y); ctx.stroke();
      });
      ctx.setLineDash([]);
    };
    drawEdges(true);
    items.forEach((it) => { it.q = P(it.p); });
    items.sort((a, b) => b.q.d - a.q.d);
    if (cn) {
      const R = P(g.ref);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      nbr.forEach((q) => { const Q = P(q); ctx.beginPath(); ctx.moveTo(R.X, R.Y); ctx.lineTo(Q.X, Q.Y); ctx.stroke(); });
    }
    for (const it of items) {
      const { X, Y, f } = it.q, r = Math.max(2.5, rr * sc * f);
      const nb = cn && (nbr.includes(it.p) || isRef(it.p));
      ctx.globalAlpha = it.ghost ? 0.45 : cn && !nb ? 0.3 : fill ? 0.92 : 1;
      const col = it.ghost ? "#9a9aa0" : wColor(it.p.w);
      const gr = ctx.createRadialGradient(X - r * 0.35, Y - r * 0.35, r * 0.1, X, Y, r);
      gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.35, col); gr.addColorStop(1, col);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(X, Y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(35,35,38,.45)"; ctx.lineWidth = 0.8; ctx.stroke();
      if (cn && isRef(it.p)) { ctx.globalAlpha = 1; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(X, Y, r + 3, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    drawEdges(false);
    /* 범례 */
    const kinds = [...new Set(g.pts.map((p) => +p.w.toFixed(3)))].sort((a, b) => a - b);
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    kinds.forEach((wv, i) => {
      const y = 16 + i * 17;
      ctx.fillStyle = wColor(wv); ctx.beginPath(); ctx.arc(14, y - 4, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.fillText(wName(wv), 24, y);
    });
    ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText(cn ? `굵은 테 원자의 이웃 ${nbr.length}개` : "끌어서 돌리기", w - 10, 16);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.rl, y: r.rc }));
    const res = L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, model: (x) => x, xr: [0, 10], yr: [0, 16], xlabel: "문헌 밀도 (g/cm³)", ylabel: "계산 밀도 (g/cm³)" });
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    tbl.rows.forEach((r, i) => {
      const off = Math.abs(r.rc / r.rl - 1) > 0.1;
      ctx.fillStyle = off ? C.warn : C.ink2;
      ctx.textAlign = i % 2 ? "left" : "right";
      ctx.fillText(r.m + (off ? "?" : ""), res.X(r.rl) + (i % 2 ? 6 : -6), res.Y(r.rc) + (i % 2 ? -5 : 12));
    });
  }

  function measure() {
    const m = MET[met], s = ST[st];
    const a = L.measure(m.a, { sd: 0.3, res: 0.1 });
    let c = null, V;
    if (st === "hcp") {
      c = L.measure(m.c || m.a * 1.633, { sd: 0.3, res: 0.1 });
      V = 1.5 * S3 * a * a * c * 1e-30;
    } else V = a ** 3 * 1e-30;
    const rc = s.Z * m.M / (NA * V);
    tbl.add({ m: met, s: s.name, Z: s.Z, a, c: c ?? "—", rc, rl: m.rho });
  }

  function upd() {
    const s = ST[st];
    $(".o-z").textContent = s.Z; $(".o-cn").textContent = s.cn;
    $(".o-pe").textContent = (s.pe * 100).toFixed(0) + "%"; $(".o-r").textContent = s.rtxt;
    $(".uc-z").textContent = "Z = " + s.ztxt;
    draw();
  }

  const c = $(".cv-wide");
  c.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; idle = false; c.setPointerCapture(e.pointerId); });
  c.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag.yaw - (e.clientX - drag.x) * 0.01;
    pitch = NM.clamp(drag.pitch + (e.clientY - drag.y) * 0.01, -1.4, 1.4);
    draw();
  });
  const end = () => { drag = null; };
  c.addEventListener("pointerup", end); c.addEventListener("pointercancel", end);
  loop(c, (dt) => { if (!idle || NM.reduce) return false; yaw += dt * 0.25; draw(); });

  $(".st").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    st = b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  $(".mt").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    met = b.dataset.m; root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
  [".fill", ".cn"].forEach((s) => $(s).addEventListener("change", draw));
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  upd();
  if (L.demo) {
    [["Po", "sc"], ["Na", "bcc"], ["Fe", "bcc"], ["Al", "fcc"], ["Cu", "fcc"], ["Mg", "hcp"], ["Zn", "hcp"], ["Fe", "fcc"]]
      .forEach(([m, s]) => { met = m; st = s; measure(); });
    root.querySelector('[data-m="Mg"]').click();
    root.querySelector('[data-s="hcp"]').click();
    $(".cn").checked = true; idle = false; draw();
  }
})();
