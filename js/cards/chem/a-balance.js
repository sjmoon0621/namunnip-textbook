/* 카드: 화학 반응식의 계수는 무엇을 뜻할까? — 원자 보존 퍼즐 */
(() => {
  const root = document.getElementById("card-chem-balance");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), eqBox = $(".eq"), msg = $(".bal-msg");

  // 원자: 반지름(상대), 색
  const AT = {
    H: { r: .5, c: "#f4f4f0" }, C: { r: .78, c: "#4a4a4f" }, O: { r: .74, c: C.apple }, N: { r: .76, c: "#3f6fb5" },
    Cl: { r: .88, c: "#5ea35a" }, Fe: { r: .92, c: "#b0683a" }, Al: { r: .92, c: "#a8a3b8" },
  };
  // 분자 모식: [원소, x, y]
  const MOL = {
    H2: { f: "H₂", a: [["H", -.45, 0], ["H", .45, 0]] },
    O2: { f: "O₂", a: [["O", -.62, 0], ["O", .62, 0]] },
    N2: { f: "N₂", a: [["N", -.62, 0], ["N", .62, 0]] },
    H2O: { f: "H₂O", a: [["H", -.72, .5], ["H", .72, .5], ["O", 0, 0]] },
    CH4: { f: "CH₄", a: [["H", -.72, -.62], ["H", .72, -.62], ["H", -.72, .62], ["H", .72, .62], ["C", 0, 0]] },
    CO2: { f: "CO₂", a: [["O", -1.25, 0], ["O", 1.25, 0], ["C", 0, 0]] },
    NH3: { f: "NH₃", a: [["H", 0, -.86], ["H", -.8, .46], ["H", .8, .46], ["N", 0, 0]] },
    C3H8: { f: "C₃H₈", a: [["H", -1.95, 0], ["H", 1.95, 0], ["H", -1.1, -.8], ["H", -1.1, .8], ["H", 0, -.8], ["H", 0, .8], ["H", 1.1, -.8], ["H", 1.1, .8], ["C", -1.1, 0], ["C", 0, 0], ["C", 1.1, 0]] },
    Fe: { f: "Fe", a: [["Fe", 0, 0]] },
    Fe2O3: { f: "Fe₂O₃", a: [["O", 0, -.85], ["O", 0, .85], ["O", 1.75, 0], ["Fe", -.7, 0], ["Fe", .8, 0]] },
    Al: { f: "Al", a: [["Al", 0, 0]] },
    HCl: { f: "HCl", a: [["H", -.62, 0], ["Cl", .42, 0]] },
    AlCl3: { f: "AlCl₃", a: [["Cl", 0, -1.2], ["Cl", 1.04, .6], ["Cl", -1.04, .6], ["Al", 0, 0]] },
  };
  Object.values(MOL).forEach((m) => {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    m.count = {};
    for (const [e, x, y] of m.a) {
      const r = AT[e].r; x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r); y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r);
      m.count[e] = (m.count[e] || 0) + 1;
    }
    m.bw = x1 - x0; m.bh = y1 - y0; m.cx = (x0 + x1) / 2; m.cy = (y0 + y1) / 2;
  });
  const RX = {
    water: { L: ["H2", "O2"], R: ["H2O"], ans: [2, 1, 2] },
    ammonia: { L: ["N2", "H2"], R: ["NH3"], ans: [1, 3, 2] },
    methane: { L: ["CH4", "O2"], R: ["CO2", "H2O"], ans: [1, 2, 1, 2] },
    propane: { L: ["C3H8", "O2"], R: ["CO2", "H2O"], ans: [1, 5, 3, 4] },
    iron: { L: ["Fe", "O2"], R: ["Fe2O3"], ans: [4, 3, 2] },
    alum: { L: ["Al", "HCl"], R: ["AlCl3", "H2"], ans: [2, 6, 2, 3] },
  };
  let rx = "water", co = [];

  function build() {
    const r = RX[rx], sp = r.L.concat(r.R);
    co = sp.map(() => 1);
    eqBox.innerHTML = "";
    sp.forEach((k, i) => {
      if (i > 0) eqBox.insertAdjacentHTML("beforeend", `<span class="op">${i === r.L.length ? "→" : "+"}</span>`);
      eqBox.insertAdjacentHTML("beforeend",
        `<span class="sp"><button type="button" class="st" data-i="${i}" data-d="-1" aria-label="${MOL[k].f} 계수 줄이기">−</button><b class="co" aria-live="polite">1</b><button type="button" class="st" data-i="${i}" data-d="1" aria-label="${MOL[k].f} 계수 늘리기">+</button><span class="f">${MOL[k].f}</span></span>`);
    });
    eqBox.querySelectorAll(".st").forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.i; co[i] = Math.max(1, Math.min(9, co[i] + +b.dataset.d)); update();
    }));
    update();
  }

  const tally = () => {
    const r = RX[rx], L = {}, R = {};
    r.L.forEach((k, i) => { for (const [e, n] of Object.entries(MOL[k].count)) L[e] = (L[e] || 0) + n * co[i]; });
    r.R.forEach((k, j) => { const i = r.L.length + j; for (const [e, n] of Object.entries(MOL[k].count)) R[e] = (R[e] || 0) + n * co[i]; });
    const els = Object.keys(AT).filter((e) => L[e] || R[e]);
    return { L, R, els };
  };
  const gcd = (a, b) => b ? gcd(b, a % b) : a;

  const { ctx, size } = fit(cv, () => draw());

  function atom(e, x, y, r) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = AT[e].c; ctx.fill();
    ctx.strokeStyle = e === "H" ? C.ink3 : "rgba(0,0,0,.25)"; ctx.lineWidth = 0.8; ctx.stroke();
  }
  function mol(m, x, y, u) {
    for (const [e, ax, ay] of m.a) atom(e, x + (ax - m.cx) * u, y + (ay - m.cy) * u, AT[e].r * u);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = RX[rx], sp = r.L.concat(r.R), small = w < 520;
    // ── 위: 분자 그림. 칸마다 필요한 크기를 재서, 모두에 같은 배율(u)을 쓴다
    const top = 8, areaH = h * 0.56, sym = small ? 16 : 26;
    const colW = (w - 16 - sym * (sp.length - 1)) / sp.length;
    const grid = sp.map((k, i) => {
      const n = co[i], m = MOL[k];
      let best = null;
      for (let c = 1; c <= n; c++) {
        const rows = Math.ceil(n / c), u = Math.min(colW / (c * (m.bw + .35)), (areaH - 18) / (rows * (m.bh + .35)));
        if (!best || u > best.u) best = { c, rows, u };
      }
      return best;
    });
    const u = Math.min(small ? 20 : 26, ...grid.map((g) => g.u));
    let x = 8;
    sp.forEach((k, i) => {
      const m = MOL[k], g = grid[i], n = co[i];
      const cw = m.bw + .35, ch = m.bh + .35;
      const gx = x + (colW - g.c * cw * u) / 2, gy = top + (areaH - 18 - g.rows * ch * u) / 2;
      for (let q = 0; q < n; q++) {
        const cc = q % g.c, rr = Math.floor(q / g.c);
        mol(m, gx + (cc + .5) * cw * u, gy + (rr + .5) * ch * u, u);
      }
      ctx.fillStyle = C.ink2; ctx.font = `${small ? 11 : 12.5}px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(`${n > 1 ? n + " " : ""}${m.f}`, x + colW / 2, top + areaH - 2);
      x += colW;
      if (i < sp.length - 1) {
        ctx.fillStyle = C.ink; ctx.font = `${small ? 15 : 20}px ${F.sans}`;
        ctx.fillText(i === r.L.length - 1 ? "→" : "+", x + sym / 2, top + (areaH - 18) / 2 + 6);
        x += sym;
      }
    });
    // ── 아래: 원소별 원자 수. 왼쪽(반응물)과 오른쪽(생성물)이 가운데에서 같은 길이가 되어야 한다
    const { L, R, els } = tally();
    const y0 = top + areaH + 14, rowH = Math.min(24, (h - y0 - 6) / els.length), mid = w / 2;
    const maxN = Math.max(...els.map((e) => Math.max(L[e] || 0, R[e] || 0)));
    const cell = Math.min(rowH - 4, (mid - 64) / maxN);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mid + .5, y0 - 6); ctx.lineTo(mid + .5, y0 + rowH * els.length - 2); ctx.stroke();
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.textAlign = "right"; ctx.fillText("반응물 쪽 원자 수", mid - 8, y0 - 4);
    ctx.textAlign = "left"; ctx.fillText("생성물 쪽 원자 수", mid + 8, y0 - 4);
    els.forEach((e, j) => {
      const yc = y0 + (j + .5) * rowH + 4, l = L[e] || 0, rr = R[e] || 0, ok = l === rr;
      for (let q = 0; q < l; q++) atom(e, mid - 6 - (q + .5) * cell, yc, cell * 0.42);
      for (let q = 0; q < rr; q++) atom(e, mid + 6 + (q + .5) * cell, yc, cell * 0.42);
      ctx.font = `600 ${small ? 11 : 12}px ${F.mono}`; ctx.fillStyle = ok ? C.forest : C.warn;
      ctx.textAlign = "left"; ctx.fillText(`${e} ${l}`, 6, yc + 4);
      ctx.textAlign = "right"; ctx.fillText(`${rr} ${e}`, w - 6, yc + 4);
    });
  }

  function update() {
    eqBox.querySelectorAll(".co").forEach((b, i) => { b.textContent = co[i]; });
    const { L, R, els } = tally();
    const bad = els.filter((e) => (L[e] || 0) !== (R[e] || 0));
    const g = co.reduce(gcd);
    if (bad.length) {
      msg.className = "fig-note bal-msg";
      msg.textContent = `아직 맞지 않는 원소: ${bad.map((e) => `${e} (${L[e] || 0} → ${R[e] || 0})`).join(", ")}`;
    } else if (g > 1) {
      msg.className = "fig-note bal-msg ok";
      msg.textContent = `원자 수는 모두 같습니다. 다만 계수가 모두 ${g}로 나누어떨어지니, 가장 간단한 정수비로 줄여 쓰는 것이 약속입니다.`;
    } else {
      msg.className = "fig-note bal-msg ok";
      msg.textContent = "모든 원소의 원자 수가 양쪽에서 같습니다. 원자는 새로 생기거나 없어지지 않고 짝만 바뀌었습니다.";
    }
    draw();
  }

  root.querySelectorAll("[data-rx]").forEach((b) => b.addEventListener("click", () => {
    rx = b.dataset.rx;
    root.querySelectorAll("[data-rx]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    build();
  }));
  $(".reset").addEventListener("click", build);
  build();
})();
