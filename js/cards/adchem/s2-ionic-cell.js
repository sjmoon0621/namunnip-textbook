/* 카드: NaCl과 CsCl은 왜 결정 구조가 다를까? — 이온 결정·공유 결정 단위세포 3D 모형 */
(() => {
  const root = document.getElementById("card-adchem-ionic-cell");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), cbReal = $(".real"), cbNb = $(".nb"), cbSpin = $(".spin");
  const NA = 6.02214e23;

  /* 자리 목록 */
  const corners = []; for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) corners.push([x, y, z]);
  const faces = [[.5, .5, 0], [.5, .5, 1], [.5, 0, .5], [.5, 1, .5], [0, .5, .5], [1, .5, .5]];
  const edges = []; for (const a of [0, 1]) for (const b of [0, 1]) { edges.push([.5, a, b]); edges.push([a, .5, b]); edges.push([a, b, .5]); }
  const body = [[.5, .5, .5]];
  const tet4 = [[.25, .25, .25], [.75, .75, .25], [.75, .25, .75], [.25, .75, .75]];
  const tet8 = []; for (const x of [.25, .75]) for (const y of [.25, .75]) for (const z of [.25, .75]) tet8.push([x, y, z]);
  const fcc = corners.concat(faces);

  /* r (pm): 섀넌 유효 이온 반지름, a (pm), M (g/mol), 실측 밀도 (g/cm³) */
  const S = {
    nacl: { cat: { n: "Na⁺", r: 102, col: "#8a6fc2", pos: edges.concat(body) }, an: { n: "Cl⁻", r: 181, col: "#3b9b4a", pos: fcc },
      a: 564.0, M: 58.44, Z: 4, rho: 2.17, cn: "6 / 6", nn: Math.sqrt(0.25), center: [.5, .5, .5], f: "NaCl",
      cnt: "Cl⁻: 꼭짓점 8×1/8 + 면 6×1/2 = 4 · Na⁺: 모서리 12×1/4 + 체심 1 = 4" },
    cscl: { cat: { n: "Cs⁺", r: 174, col: "#c26f8a", pos: body }, an: { n: "Cl⁻", r: 181, col: "#3b9b4a", pos: corners },
      a: 412.3, M: 168.36, Z: 1, rho: 3.99, cn: "8 / 8", nn: Math.sqrt(0.75), center: [.5, .5, .5], f: "CsCl",
      cnt: "Cl⁻: 꼭짓점 8×1/8 = 1 · Cs⁺: 체심 1 = 1" },
    zns: { cat: { n: "Zn²⁺", r: 60, col: "#8a8f9a", pos: tet4 }, an: { n: "S²⁻", r: 184, col: "#d6b21e", pos: fcc },
      a: 541.0, M: 97.47, Z: 4, rho: 4.09, cn: "4 / 4", nn: Math.sqrt(3) / 4, center: [.25, .25, .25], f: "ZnS",
      cnt: "S²⁻: 꼭짓점 8×1/8 + 면 6×1/2 = 4 · Zn²⁺: 내부 4 = 4" },
    caf2: { cat: { n: "Ca²⁺", r: 112, col: "#d07a1a", pos: fcc }, an: { n: "F⁻", r: 131, col: "#4f9bd0", pos: tet8 },
      a: 546.3, M: 78.07, Z: 4, rho: 3.18, cn: "8 / 4", nn: Math.sqrt(3) / 4, center: [.25, .25, .25], f: "CaF₂",
      cnt: "Ca²⁺: 꼭짓점 8×1/8 + 면 6×1/2 = 4 · F⁻: 내부 8 = 8 → 1 : 2" },
    dia: { cat: { n: "C", r: 77, col: "#4a4d55", pos: tet4 }, an: { n: "C", r: 77, col: "#4a4d55", pos: fcc },
      a: 356.7, M: 12.011, Z: 8, rho: 3.51, cn: "4 (공유 결합)", nn: Math.sqrt(3) / 4, center: [.25, .25, .25], f: "C",
      cnt: "C: 꼭짓점 8×1/8 + 면 6×1/2 + 내부 4 = 8" },
  };
  let st = "nacl", yaw = 0.6, pitch = 0.42, drag = null;

  const { ctx, size } = fit(cv, () => draw());

  function atoms() {
    const s = S[st], out = [];
    s.an.pos.forEach((p) => out.push({ p, k: "an" }));
    s.cat.pos.forEach((p) => out.push({ p, k: "cat" }));
    return out;
  }
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = S[st], real = cbReal.checked, nb = cbNb.checked;
    const sc = Math.min(w, h) * 0.44, cx = w / 2, cy = h / 2 + 6;
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const proj = (q) => {
      const x = q[0] - .5, y = q[2] - .5, z = q[1] - .5;
      const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw;
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const d = 3.2 / (3.2 + z2);
      return [cx + x1 * sc * d, cy - y2 * sc * d, z2, d];
    };
    /* 세포 모서리 */
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
    const cp8 = corners.map(proj);
    ctx.beginPath(); E.forEach(([i, j]) => { ctx.moveTo(cp8[i][0], cp8[i][1]); ctx.lineTo(cp8[j][0], cp8[j][1]); }); ctx.stroke();
    const A = atoms(), P = A.map((a) => proj(a.p));
    /* 강조할 중심과 이웃 */
    let ci = -1; const hl = new Set();
    if (nb) {
      ci = A.findIndex((a) => a.k === "cat" && dist(a.p, s.center) < 1e-6);
      if (ci < 0) ci = A.findIndex((a) => dist(a.p, s.center) < 1e-6);
      A.forEach((a, i) => { if (i !== ci && Math.abs(dist(a.p, A[ci].p) - s.nn) < 1e-3 && (st === "dia" || a.k !== A[ci].k)) hl.add(i); });
    }
    /* 결합선 (가장 가까운 이웃) */
    if (!real) {
      ctx.lineWidth = 2;
      for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
        if ((st === "dia" || A[i].k !== A[j].k) && Math.abs(dist(A[i].p, A[j].p) - s.nn) < 1e-3) {
          const on = !nb || (i === ci && hl.has(j)) || (j === ci && hl.has(i));
          ctx.strokeStyle = on ? (nb ? C.amber : "rgba(93,93,97,.55)") : "rgba(93,93,97,.12)";
          ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke();
        }
      }
    }
    /* 공 (먼 것부터) */
    const ord = A.map((a, i) => i).sort((i, j) => P[j][2] - P[i][2]);
    for (const i of ord) {
      const a = A[i], ion = s[a.k], [x, y, , d] = P[i];
      const rr = (real ? ion.r / s.a : (a.k === "an" ? 0.075 : 0.055)) * sc * d;
      const dim = nb && i !== ci && !hl.has(i);
      ctx.globalAlpha = dim ? 0.18 : 1;
      const g = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.35, rr * 0.1, x, y, rr);
      g.addColorStop(0, "#ffffff"); g.addColorStop(0.35, ion.col); g.addColorStop(1, "#1d1f22");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
      if (nb && i === ci) { ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    /* 범례 */
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    const items = st === "dia" ? [s.an] : [s.cat, s.an];
    items.forEach((ion, k) => {
      ctx.fillStyle = ion.col; ctx.beginPath(); ctx.arc(14, 16 + k * 17, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.fillText(`${ion.n}  ${ion.r} pm`, 24, 20 + k * 17);
    });
    if (nb) { ctx.fillStyle = "#9a6a10"; ctx.textAlign = "right"; ctx.fillText(`주황 테두리를 둘러싼 이웃: ${hl.size}개`, w - 10, h - 10); }
  }

  function update() {
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === st)));
    const s = S[st];
    $(".n-z").textContent = s.cnt;
    $(".n-c").textContent = s.cn;
    $(".n-r").textContent = st === "dia" ? "— (같은 원자)" : `${s.cat.r} / ${s.an.r} = ${(s.cat.r / s.an.r).toFixed(2)}`;
    $(".n-a").textContent = `${s.a} pm`;
    const rho = s.Z * s.M / (NA * Math.pow(s.a * 1e-10, 3));
    $(".n-d").textContent = `${rho.toFixed(2)} / ${s.rho} g/cm³ (Z = ${s.Z}, ${s.f})`;
    draw();
  }

  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { st = b.dataset.s; update(); }));
  [cbReal, cbNb].forEach((c) => c.addEventListener("change", draw));
  cv.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY, yaw, pitch]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag[2] + (e.clientX - drag[0]) * 0.01;
    pitch = Math.max(-1.4, Math.min(1.4, drag[3] + (e.clientY - drag[1]) * 0.01));
    draw();
  });
  const end = () => { drag = null; };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  loop(cv, (dt) => { if (!cbSpin.checked || drag || NM.reduce || !size.w) return; yaw += dt * 0.35; draw(); });
  if (/[?&]demo\b/.test(location.search)) { cbNb.checked = true; cbSpin.checked = false; }
  update();
})();
