/* 카드: 주사 전자 현미경 — 진공·코팅, 가속 전압, WD, 스폿, 초점, 비점 보정, 밝기·대비로 선명한 상 찾기 */
(() => {
  const root = document.getElementById("card-labbio-sem");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const TAU = Math.PI * 2;
  const NAME = { pollen: "꽃가루", eye: "겹눈", stoma: "기공" };
  const OFF = { pollen: -0.04, eye: -0.12, stoma: -0.01 };   // 시료 두께 때문에 실제 초점이 WD 눈금에서 벗어나는 양 (mm)
  let smp = "pollen", vac = false, coat = false, pumping = false;
  const ast0 = { x: 0.3 + 0.3 * Math.random(), y: -(0.25 + 0.3 * Math.random()) };   // 숨은 비점 수차
  const v = (c) => +$(c).value;
  const tbl = L.table($(".tbl-host"), [{ key: "s", label: "시료" }, { key: "m", label: "배율" }, { key: "kv", label: "kV" }, { key: "wd", label: "WD (mm)" }, { key: "sp", label: "스폿" }, { key: "co", label: "코팅" }, { key: "f", label: "초점 (mm)", res: 0.005 }, { key: "q", label: "선명도", res: 1 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const off = document.createElement("canvas"), noise = document.createElement("canvas");
  let offKey = "";

  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const mag = () => Math.round(10 ** v(".mag") / 10) * 10;

  /* 현재 조건에서 상의 질 */
  function optics(S) {
    const M = mag(), kV = v(".kv"), WD = v(".wd"), sp = v(".spot");
    const fset = v(".fc") + v(".ff"), df = fset - (WD + OFF[smp]);
    const ppu = S / (1e5 / M);                         // 화면 px / 시료 μm
    const alpha = 0.015 / WD;
    const bf = Math.abs(df) * 2 * alpha * 1000 * ppu;  // 초점 흐림 원 지름
    const d = 2.5 * 1.55 ** (sp - 1) * (1 + WD / 20) * (1 + 4 / kV);   // 탐침 지름 nm
    const bp = d / 1000 * ppu;
    const rx = v(".sx") - ast0.x, ry = v(".sy") - ast0.y, a = Math.hypot(rx, ry) * 0.4 * ppu;
    const pk = 0.3 * (kV / 30) ** 2 * ppu;
    const iso = Math.sqrt(bf * bf + bp * bp + pk * pk + (0.5 * a) ** 2);
    const streak = a * clamp(Math.abs(df) / 0.03, 0, 2), th = Math.atan2(ry, rx) / 2 + (df > 0 ? Math.PI / 2 : 0);
    const sig = 0.5 * 1.55 ** -(sp - 1) * (kV < 3 ? 1.6 : 1);
    const q = coat ? 0 : clamp((kV - 1.5) / 6, 0, 1);
    const B = v(".br"), Cc = v(".ct");
    const sharp = 100 * Math.exp(-(iso + 0.5 * streak) / 2.5) * (1 - 0.7 * q) * (1 - clamp(sig - 0.1, 0, 1)) * (1 - Math.abs(B - 50) / 110) * (1 - Math.abs(Cc - 50) / 110);
    const dof = 0.1 / (alpha * M) * 1000;               // μm, 화면에서 0.1 mm 흐림을 허용
    return { M, kV, WD, sp, fset, df, ppu, iso, streak, th, sig, q, B, Cc, sharp, d, pix: 1e5 / M / S * 1000, dof };
  }

  /* 시료 그리기 (오프스크린) */
  function render(S, dpr, ppu) {
    const key = `${smp}|${S}|${dpr}|${ppu.toFixed(4)}`; if (key === offKey) return; offKey = key;
    off.width = Math.round(S * dpr); off.height = off.width;
    const c = off.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = rng(7), cx = S / 2, cy = S / 2, half = S / 2 / ppu;
    if (smp === "pollen") {
      c.fillStyle = "#262626"; c.fillRect(0, 0, S, S);
      for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(255,255,255,${0.05 * R()})`; c.fillRect(R() * S, R() * S, 2, 2); }
      const Rs = 15 * ppu, g = c.createRadialGradient(cx - Rs * 0.2, cy - Rs * 0.25, Rs * 0.1, cx, cy, Rs);
      g.addColorStop(0, "#8c8c8c"); g.addColorStop(0.75, "#a3a3a3"); g.addColorStop(1, "#ececec");
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, Rs, 0, TAU); c.fill();
      for (let i = 0; i < 260; i++) { const u = R() * 2 - 1, ph = R() * TAU, s2 = Math.sqrt(1 - u * u), x = s2 * Math.cos(ph), y = s2 * Math.sin(ph); if (u < 0.1) continue; c.fillStyle = "rgba(40,40,40,.45)"; c.beginPath(); c.ellipse(cx + x * Rs, cy + y * Rs, 0.35 * ppu, 0.35 * ppu * Math.max(0.2, u), Math.atan2(y, x), 0, TAU); c.fill(); }
      const N = 120, pts = [];
      for (let i = 0; i < N; i++) { const z = 1 - (i + 0.5) / N * 2, r = Math.sqrt(1 - z * z), a = i * 2.39996; pts.push([r * Math.cos(a), r * Math.sin(a), z]); }
      pts.filter((p) => p[2] > -0.15).sort((a, b) => a[2] - b[2]).forEach(([x, y, z]) => {
        const bx = cx + x * Rs, by = cy + y * Rs, ln = 3.5 * ppu, nx = x, ny = y, tx = bx + nx * ln, ty = by + ny * ln + (1 - Math.abs(z)) * 0;
        const tipx = z > 0.98 ? bx + 0.6 * ppu : tx, tipy = z > 0.98 ? by - 0.6 * ppu : ty;
        const pw = 1.1 * ppu, ang = Math.atan2(ny, nx) + Math.PI / 2;
        const lum = 150 + 100 * (1 - z);
        c.fillStyle = `rgb(${lum},${lum},${lum})`;
        c.beginPath(); c.moveTo(bx + Math.cos(ang) * pw, by + Math.sin(ang) * pw); c.lineTo(tipx, tipy); c.lineTo(bx - Math.cos(ang) * pw, by - Math.sin(ang) * pw); c.closePath(); c.fill();
        c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = Math.max(0.5, 0.15 * ppu); c.stroke();
      });
    } else if (smp === "eye") {
      c.fillStyle = "#1e1e1e"; c.fillRect(0, 0, S, S);
      const Rd = 220, d = 16, rowh = d * Math.sqrt(3) / 2, amax = Rd * Math.PI / 2;
      for (let j = -Math.ceil(amax / rowh); j <= Math.ceil(amax / rowh); j++) for (let i = -Math.ceil(amax / d); i <= Math.ceil(amax / d); i++) {
        const u = i * d + (j % 2 ? d / 2 : 0), w = j * rowh, arc = Math.hypot(u, w); if (arc > amax * 0.98) continue;
        const th = arc / Rd, pr = Rd * Math.sin(th), ca = arc ? u / arc : 1, sa = arc ? w / arc : 0;
        const X = pr * ca, Y = pr * sa; if (Math.abs(X) > half + d || Math.abs(Y) > half + d) continue;
        const px = cx + X * ppu, py = cy + Y * ppu, rr = d / 2 * 0.93 * ppu, cs = Math.max(0.12, Math.cos(th));
        const g = c.createRadialGradient(px - rr * 0.3, py - rr * 0.3, rr * 0.05, px, py, rr);
        g.addColorStop(0, "#d8d8d8"); g.addColorStop(0.7, "#9a9a9a"); g.addColorStop(1, "#5a5a5a");
        c.fillStyle = g; c.beginPath(); c.ellipse(px, py, rr * cs, rr, Math.atan2(sa, ca), 0, TAU); c.fill();
        if (((i * 7 + j * 3) & 7) === 0) { c.strokeStyle = "#e6e6e6"; c.lineWidth = Math.max(0.6, 0.6 * ppu); c.beginPath(); c.moveTo(px + rr * cs, py + rr * 0.9); c.lineTo(px + rr * cs + 9 * ppu * ca, py + rr * 0.9 + 9 * ppu * sa); c.stroke(); }
      }
      const g2 = c.createRadialGradient(cx, cy, Rd * ppu * 0.9, cx, cy, Rd * ppu * 1.02);
      g2.addColorStop(0, "rgba(255,255,255,0)"); g2.addColorStop(1, "rgba(255,255,255,.25)"); c.fillStyle = g2; c.beginPath(); c.arc(cx, cy, Rd * ppu * 1.02, 0, TAU); c.fill();
    } else {
      c.fillStyle = "#8f8f8f"; c.fillRect(0, 0, S, S);
      const sp = 45, n = Math.ceil(half / sp) + 1;
      c.strokeStyle = "#5c5c5c"; c.lineWidth = Math.max(1, 1.5 * ppu);
      for (let k = -n; k <= n; k++) for (const vert of [0, 1]) {
        c.beginPath();
        for (let t = -half - sp; t <= half + sp; t += Math.max(1, 30 / ppu) / 10) {
          const base = k * sp + 8 * Math.sin(k * 1.7), wav = 4 * Math.sin(t / 7 + k * 2.1) + 2.5 * Math.sin(t / 3.1 + k);
          const X = vert ? base + wav : t, Y = vert ? t : base + wav;
          const px = cx + X * ppu, py = cy + Y * ppu; t === -half - sp ? c.moveTo(px, py) : c.lineTo(px, py);
        }
        c.stroke();
      }
      c.strokeStyle = "rgba(230,230,230,.35)"; c.lineWidth = Math.max(0.6, 0.5 * ppu);
      for (let i = 0; i < 300; i++) { const x = R() * S, y = R() * S, a = R() * Math.PI; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 4 * ppu, y + Math.sin(a) * 4 * ppu); c.stroke(); }
      const st = [[0, 0, 0.3]]; for (let i = 0; i < 40; i++) st.push([(R() - 0.5) * 900, (R() - 0.5) * 900, R() * Math.PI]);
      st.forEach(([X, Y, a]) => {
        if (Math.abs(X) > half + 30 || Math.abs(Y) > half + 30) return;
        c.save(); c.translate(cx + X * ppu, cy + Y * ppu); c.rotate(a);
        const Lg = 14 * ppu, Wg = 4.2 * ppu;
        c.fillStyle = "#7a7a7a"; c.beginPath(); c.ellipse(0, 0, Lg * 1.3, Wg * 3.2, 0, 0, TAU); c.fill();
        [-1, 1].forEach((s) => { const g = c.createLinearGradient(0, s * Wg * 0.2, 0, s * Wg * 2.4); g.addColorStop(0, "#e0e0e0"); g.addColorStop(1, "#a8a8a8"); c.fillStyle = g; c.beginPath(); c.ellipse(0, s * Wg * 1.25, Lg, Wg * 1.1, 0, 0, TAU); c.fill(); });
        c.fillStyle = "#1a1a1a"; c.beginPath(); c.ellipse(0, 0, Lg * 0.55, Math.max(0.6, 0.9 * ppu), 0, 0, TAU); c.fill();
        c.restore();
      });
    }
  }

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = h, ix = w - S, dpr = Math.min(devicePixelRatio || 1, 2), o = optics(S);
    /* 경통 모식도 */
    const lw = ix - 10, colx = Math.min(46, lw * 0.3), lx = colx + 34;
    ctx.fillStyle = vac ? "rgba(116,171,102,.10)" : "rgba(181,83,47,.08)"; ctx.fillRect(colx - 22, 6, 44, h - 12);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(colx - 22, 6, 44, h - 12);
    const yGun = 22, yC = h * 0.3, yScan = h * 0.47, yObj = h * 0.6, ySmp = Math.min(h - 26, yObj + 12 + o.WD * (h * 0.012));
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(colx - 6, yGun - 6); ctx.lineTo(colx, yGun + 4); ctx.lineTo(colx + 6, yGun - 6); ctx.fill();
    const lens = (y) => { ctx.fillStyle = "#b9a37a"; ctx.fillRect(colx - 20, y - 5, 12, 10); ctx.fillRect(colx + 8, y - 5, 12, 10); };
    lens(yC); lens(yObj);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1; ctx.strokeRect(colx - 16, yScan - 4, 7, 8); ctx.strokeRect(colx + 9, yScan - 4, 7, 8);
    const yFoc = clamp(yObj + 12 + (o.fset) * (h * 0.012), yObj + 4, h - 8);
    if (vac) {
      ctx.strokeStyle = "rgba(224,160,42,.9)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(colx, yGun + 4); ctx.lineTo(colx - 5, yC); ctx.lineTo(colx - 1, yC + 18); ctx.lineTo(colx - 6, yObj); ctx.lineTo(colx, yFoc);
      ctx.moveTo(colx, yGun + 4); ctx.lineTo(colx + 5, yC); ctx.lineTo(colx + 1, yC + 18); ctx.lineTo(colx + 6, yObj); ctx.lineTo(colx, yFoc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(colx, yFoc); ctx.lineTo(colx - (yFoc < ySmp ? 6 : -6) * (ySmp - yFoc) / Math.max(1, yFoc - yObj), ySmp); ctx.moveTo(colx, yFoc); ctx.lineTo(colx + (yFoc < ySmp ? 6 : -6) * (ySmp - yFoc) / Math.max(1, yFoc - yObj), ySmp); ctx.stroke();
    }
    ctx.fillStyle = coat ? "#c9a640" : "#777"; ctx.fillRect(colx - 12, ySmp, 24, 4); ctx.fillStyle = C.ink3; ctx.fillRect(colx - 3, ySmp + 4, 6, h - 10 - ySmp - 4);
    ctx.fillStyle = "#666"; ctx.fillRect(colx + 14, ySmp - 16, 7, 9);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    [["전자총", yGun], ["집속 렌즈", yC], ["주사 코일", yScan], ["대물렌즈", yObj], ["검출기", ySmp - 12], [coat ? "시료 (금 코팅)" : "시료", ySmp + 4]].forEach(([t, y]) => { if (lx < ix - 30) ctx.fillText(t, lx, y + 3); });
    ctx.fillStyle = vac ? C.forest : C.warn; ctx.fillText(pumping ? "배기 중…" : vac ? "진공" : "대기압", lx, h - 10);
    /* 모니터 */
    ctx.save(); ctx.beginPath(); ctx.rect(ix, 0, S, S); ctx.clip();
    ctx.fillStyle = "#000"; ctx.fillRect(ix, 0, S, S);
    if (vac) {
      render(S, dpr, o.ppu);
      ctx.filter = `blur(${Math.min(30, o.iso / 2).toFixed(2)}px) brightness(${(0.35 + o.B / 50 * 0.65).toFixed(2)}) contrast(${(0.3 + o.Cc / 50 * 0.7).toFixed(2)})`;
      if (o.streak > 0.6) {
        const n = 9; ctx.globalAlpha = 1 / n * 1.6;
        for (let i = 0; i < n; i++) { const k = (i / (n - 1) - 0.5) * o.streak; ctx.drawImage(off, ix + Math.cos(o.th) * k, Math.sin(o.th) * k, S, S); }
        ctx.globalAlpha = 1;
      } else ctx.drawImage(off, ix, 0, S, S);
      ctx.filter = "none";
      if (o.q > 0) {
        const g = ctx.createRadialGradient(ix + S / 2, S / 2, 0, ix + S / 2, S / 2, S * 0.4); g.addColorStop(0, `rgba(255,255,255,${0.75 * o.q})`); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.fillRect(ix, 0, S, S);
        ctx.fillStyle = `rgba(255,255,255,${0.5 * o.q})`; for (let i = 0; i < 6; i++) ctx.fillRect(ix, Math.random() * S, S, 1 + Math.random() * 3 * o.q);
      }
      const ns = Math.max(1, Math.round(S / 2)); noise.width = ns; noise.height = ns;
      const nc = noise.getContext("2d"), id = nc.createImageData(ns, ns);
      for (let i = 0; i < id.data.length; i += 4) { const g = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = g; id.data[i + 3] = 255; }
      nc.putImageData(id, 0, 0);
      ctx.globalAlpha = clamp(o.sig * 0.8, 0, 0.7); ctx.imageSmoothingEnabled = false; ctx.drawImage(noise, ix, 0, S, S); ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = "#666"; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(pumping ? "진공 배기 중…" : "빔 꺼짐", ix + S / 2, S / 2);
    }
    ctx.fillStyle = "rgba(0,0,0,.85)"; ctx.fillRect(ix, S - 18, S, 18);
    ctx.fillStyle = "#e8e8e8"; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText(`${o.kV} kV  WD ${o.fset.toFixed(1)} mm  ×${o.M}`, ix + 6, S - 5);
    const fieldUm = 1e5 / o.M, nice = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500].filter((x) => x <= fieldUm / 4).pop() || 0.1, bl = nice * o.ppu;
    ctx.fillRect(ix + S - 10 - bl, S - 12, bl, 3); ctx.textAlign = "right"; ctx.fillText(`${nice} μm`, ix + S - 14 - bl, S - 5);
    ctx.restore();
    /* 수치 */
    $(".n-p").textContent = `${o.d.toFixed(o.d < 10 ? 1 : 0)} nm`;
    $(".n-x").textContent = `${o.pix >= 1000 ? (o.pix / 1000).toFixed(2) + " μm" : o.pix.toFixed(0) + " nm"}`;
    $(".n-d").textContent = `${o.dof >= 1000 ? (o.dof / 1000).toFixed(1) + " mm" : o.dof.toFixed(0) + " μm"}`;
    const st = $(".state"); st.classList.remove("good", "bad");
    if (!vac) st.textContent = pumping ? "배기 중입니다…" : coat ? "코팅을 마쳤습니다. 진공을 만든 뒤 빔을 켜세요." : "시료실에 공기가 들어 있습니다. 생물 시료는 코팅부터 하고, 진공을 만든 뒤 빔을 켜세요.";
    else if (o.q > 0.15) { st.textContent = "대전: 코팅하지 않은 시료에 전자가 쌓여 하얗게 번쩍입니다."; st.classList.add("bad"); }
    else if (o.sharp > 75) { st.textContent = `선명합니다. (선명도 지수 약 ${Math.round(o.sharp)})`; st.classList.add("good"); }
    else st.textContent = `아직 흐립니다. 배율을 올려 초점과 비점 보정을 번갈아 맞추고, 밝기·대비를 조절하세요.`;
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.f - r.wd, y: r.q }));
    const res = L.plot(ctx, { x0: 46, y0: 18, w: w - 60, h: h - 52 }, { pts, yr: [0, 100], xlabel: "초점 − WD 눈금 (mm)", ylabel: "선명도 지수" });
    const wds = [...new Set(tbl.rows.map((r) => r.wd))], cols = [C.forest, C.amber, C.warn, "#3f6fa3", C.ink2];
    tbl.rows.forEach((r) => { const k = wds.indexOf(r.wd); if (!k) return; ctx.fillStyle = cols[k % cols.length]; ctx.beginPath(); ctx.arc(res.X(r.f - r.wd), res.Y(r.q), 3.4, 0, TAU); ctx.fill(); });
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    wds.slice(0, 5).forEach((wd, k) => { ctx.fillStyle = cols[k]; ctx.fillText(`● WD ${wd} mm`, w - 16, 32 + k * 14); });
  }

  const outs = () => {
    $(".kv-out").textContent = v(".kv"); $(".m-out").textContent = mag(); $(".wd-out").textContent = v(".wd"); $(".sp-out").textContent = v(".spot");
    $(".fc-out").textContent = v(".fc").toFixed(1); $(".ff-out").textContent = (v(".ff") >= 0 ? "+" : "") + v(".ff").toFixed(3);
    $(".sx-out").textContent = v(".sx").toFixed(2); $(".sy-out").textContent = v(".sy").toFixed(2); $(".b-out").textContent = v(".br"); $(".c-out").textContent = v(".ct");
  };
  root.querySelectorAll("input[type=range]").forEach((el) => el.addEventListener("input", () => { outs(); draw(); }));
  $(".smp").addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (!b) return; if (vac) { $(".state").textContent = "시료를 바꾸려면 먼저 공기를 넣고 시료를 꺼내야 합니다."; $(".state").classList.add("bad"); return; } smp = b.dataset.s; coat = false; $(".mag").value = Math.log10({ pollen: 1500, eye: 300, stoma: 800 }[smp]).toFixed(2); outs(); $(".coat").setAttribute("aria-pressed", "false"); root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); offKey = ""; draw(); });
  $(".coat").addEventListener("click", (e) => { if (vac || pumping) { $(".state").textContent = "코팅은 시료를 꺼내 스퍼터 장치에서 합니다. 먼저 공기를 넣으세요."; $(".state").classList.add("bad"); return; } coat = !coat; e.currentTarget.setAttribute("aria-pressed", String(coat)); draw(); });
  $(".pump").addEventListener("click", () => { if (vac || pumping) return; pumping = true; draw(); setTimeout(() => { pumping = false; vac = true; draw(); }, 1500); });
  $(".vent").addEventListener("click", () => { vac = false; pumping = false; draw(); });
  $(".shot").addEventListener("click", () => {
    if (!vac) { $(".state").textContent = "빔이 꺼져 있어 사진을 찍을 수 없습니다."; return; }
    const o = optics(app.size.h);
    tbl.add({ s: NAME[smp], m: `×${o.M}`, kv: o.kV, wd: o.WD, sp: o.sp, co: coat ? "예" : "아니요", f: o.fset, q: clamp(L.measure(o.sharp, { rel: 0.03, sd: 0.8, res: 1 }), 0, 100) });
  });
  $(".clear").addEventListener("click", () => tbl.clear());
  outs(); draw();

  if (L.demo) {
    const set = (c, x) => { $(c).value = x; };
    coat = true; $(".coat").setAttribute("aria-pressed", "true"); vac = true;
    set(".kv", 10); set(".spot", 3); set(".br", 50); set(".ct", 52); set(".sx", ast0.x.toFixed(2)); set(".sy", ast0.y.toFixed(2)); set(".mag", 3.18);
    [[10, OFF.pollen + 10], [25, OFF.pollen + 25]].forEach(([wd, best]) => {
      set(".wd", wd); set(".fc", best.toFixed(1));
      for (let k = -3; k <= 3; k++) { set(".ff", (best - (+(+best).toFixed(1)) + k * 0.1).toFixed(3)); $(".shot").click(); }
    });
    set(".wd", 10); set(".fc", (10 + OFF.pollen).toFixed(1)); set(".ff", ((10 + OFF.pollen) - (+(10 + OFF.pollen).toFixed(1))).toFixed(3));
    outs(); draw();
  }
})();
