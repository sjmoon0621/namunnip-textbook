/* 카드: 광합성과 호흡은 왜 산화 환원 반응일까? — 원자가 어디로 가는지 추적 (모식) */
(() => {
  const root = document.getElementById("card-is2-redox-life");
  if (!root) return;
  const { C, F, clamp, ease, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), pS = $(".prog"), trT = $(".trace"), playB = $(".play");
  const nOx = $(".ox"), nRed = $(".red"), nE = $(".en"), eqL = $(".eq"), msg = $(".msg");

  // 분자 모양 (단위 u 기준 상대 좌표)
  const SHAPE = {
    CO2: { r: 1.5, at: [["C", 0, 0], ["O", -1, 0], ["O", 1, 0]] },
    H2O: { r: 1.1, at: [["O", 0, -0.2], ["H", -0.75, 0.45], ["H", 0.75, 0.45]] },
    O2: { r: 0.95, at: [["O", -0.45, 0], ["O", 0.45, 0]] },
    CH4: { r: 1.2, at: [["C", 0, 0], ["H", -0.7, -0.7], ["H", 0.7, -0.7], ["H", -0.7, 0.7], ["H", 0.7, 0.7]] },
    CO: { r: 0.95, at: [["C", -0.45, 0], ["O", 0.45, 0]] },
    Fe2O3: { r: 1.7, at: [["Fe", -0.6, -0.45], ["Fe", 0.6, -0.45], ["O", -1.2, 0.55], ["O", 0, 0.6], ["O", 1.2, 0.55]] },
    Fe: { r: 0.7, at: [["Fe", 0, 0]] },
    GLU: { r: 2.9, at: (() => {
      const a = [];
      for (let i = 0; i < 6; i++) { const t = i / 6 * Math.PI * 2; a.push(["C", Math.cos(t) * 1.15, Math.sin(t) * 1.15]); }
      for (let i = 0; i < 6; i++) { const t = (i + .5) / 6 * Math.PI * 2; a.push(["O", Math.cos(t) * 2.0, Math.sin(t) * 2.0]); }
      for (let i = 0; i < 12; i++) { const t = (i + .25) / 12 * Math.PI * 2; a.push(["H", Math.cos(t) * 2.65, Math.sin(t) * 2.65]); }
      return a;
    })() },
  };
  // 반응 정의: 반응물·생성물 분자 목록과 원자 대응 규칙.
  // map(reactAtoms) → 생성물 원자 자리 순서대로 반응물 원자 번호를 돌려준다.
  const RX = {
    photo: {
      L: [["CO2", 6], ["H2O", 12]], R: [["GLU", 1], ["O2", 6], ["H2O", 6]],
      eqL: "6CO₂ + 12H₂O", eqR: "C₆H₁₂O₆ + 6O₂ + 6H₂O",
      ox: "H₂O (수소를 잃고 O₂가 됨)", red: "CO₂ (수소를 얻어 포도당이 됨)", en: "빛 에너지 흡수 · 포도당 1 mol당 약 2800 kJ",
      tr: { blue: "H2O", names: ["물의 산소", "CO₂의 산소"] },
      msg: "물의 산소(파랑)는 모두 산소 기체로 나가고, CO₂의 산소(빨강)는 포도당과 새로 생긴 물로 갑니다. 1941년 루벤과 카멘은 무거운 산소 동위 원소 ¹⁸O를 표지로 붙여 이것을 확인했습니다.",
    },
    resp: {
      L: [["GLU", 1], ["O2", 6], ["H2O", 6]], R: [["CO2", 6], ["H2O", 12]],
      eqL: "C₆H₁₂O₆ + 6O₂ + 6H₂O", eqR: "6CO₂ + 12H₂O",
      ox: "포도당 (수소를 잃고 CO₂가 됨)", red: "O₂ (수소를 얻어 물이 됨)", en: "에너지 방출 · 포도당 1 mol당 약 2800 kJ",
      tr: { blue: "O2", names: ["들이마신 O₂의 산소", "포도당·물의 산소"] },
      msg: "들이마신 산소(파랑)는 모두 물이 되고, 내쉬는 CO₂의 산소는 포도당과 물에서 옵니다. 광합성과 방향이 거꾸로입니다.",
    },
    ch4: {
      L: [["CH4", 1], ["O2", 2]], R: [["CO2", 1], ["H2O", 2]],
      eqL: "CH₄ + 2O₂", eqR: "CO₂ + 2H₂O",
      ox: "CH₄ (산소를 얻고 수소를 잃음)", red: "O₂ (수소를 얻어 물이 됨)", en: "에너지 방출 · 메테인 1 mol당 약 890 kJ",
      tr: { blue: "O2", names: ["O₂의 산소"] },
      msg: "연소는 빠르게 일어나는 산화 환원 반응입니다. 호흡과 같은 방향이지만, 호흡은 여러 단계로 나누어 에너지를 조금씩 꺼냅니다.",
    },
    iron: {
      L: [["Fe2O3", 1], ["CO", 3]], R: [["Fe", 2], ["CO2", 3]],
      eqL: "Fe₂O₃ + 3CO", eqR: "2Fe + 3CO₂",
      ox: "CO (산소를 얻어 CO₂가 됨)", red: "Fe₂O₃ (산소를 잃고 철이 됨)", en: "용광로에서 · 반응 자체의 열 출입은 작음 (약 −25 kJ)",
      tr: { blue: "Fe2O3", names: ["산화 철의 산소", "CO의 산소"] },
      msg: "산화 철(Ⅲ)이 잃은 산소(파랑)가 일산화 탄소에 붙어 CO₂가 됩니다. 한쪽이 산화되면 다른 쪽은 반드시 환원됩니다.",
    },
  };
  // 원자 대응 규칙
  function build(k) {
    const rx = RX[k];
    const L = [], Rt = [];
    rx.L.forEach(([m, n]) => { for (let i = 0; i < n; i++) SHAPE[m].at.forEach(([el], j) => L.push({ el, mol: m, mi: i, aj: j })); });
    rx.R.forEach(([m, n]) => { for (let i = 0; i < n; i++) SHAPE[m].at.forEach(([el], j) => Rt.push({ el, mol: m, mi: i, aj: j })); });
    // 반응물 원자를 종류·출처별 줄에 세운다
    const pick = (el, mol, filt) => { const i = L.findIndex((a) => !a.used && a.el === el && a.mol === mol && (!filt || filt(a))); if (i < 0) throw new Error(`${k}: ${el} from ${mol}`); L[i].used = true; return i; };
    const rule = {
      photo: (t) => t.mol === "GLU" ? (t.el === "C" ? pick("C", "CO2") : t.el === "O" ? pick("O", "CO2", (a) => a.aj === 1) : pick("H", "H2O", (a) => a.mi < 6))
        : t.mol === "O2" ? pick("O", "H2O")
        : t.el === "O" ? pick("O", "CO2", (a) => a.aj === 2) : pick("H", "H2O"),
      resp: (t) => t.mol === "CO2" ? (t.el === "C" ? pick("C", "GLU") : t.aj === 1 ? pick("O", "GLU") : pick("O", "H2O"))
        : t.el === "O" ? pick("O", "O2") : (L.some((a) => !a.used && a.el === "H" && a.mol === "GLU") ? pick("H", "GLU") : pick("H", "H2O")),
      ch4: (t) => t.mol === "CO2" ? (t.el === "C" ? pick("C", "CH4") : pick("O", "O2", (a) => a.mi === 0))
        : t.el === "O" ? pick("O", "O2") : pick("H", "CH4"),
      iron: (t) => t.mol === "Fe" ? pick("Fe", "Fe2O3")
        : t.el === "C" ? pick("C", "CO") : t.aj === 2 ? pick("O", "CO") : pick("O", "Fe2O3"),
    }[k];
    const map = Rt.map((t) => rule(t));
    return { L, Rt, map };
  }

  // 분자를 영역 안에 흐름 배치
  function layout(list, x0, x1, y0, y1) {
    for (let u = 16; u > 3; u -= 0.25) {
      const pos = []; let x = x0, y = y0, rowH = 0, ok = true;
      for (const [m, n] of list) for (let i = 0; i < n; i++) {
        const d = SHAPE[m].r * 2 * u + u * .6;
        if (x + d > x1 && x > x0) { x = x0; y += rowH; rowH = 0; }
        pos.push({ m, i, cx: x + d / 2, cy: y + d / 2 }); x += d; rowH = Math.max(rowH, d);
      }
      if (y + rowH > y1) ok = false;
      if (ok) { const off = (y1 - (y + rowH)) / 2; pos.forEach((p) => p.cy += off); return { u, pos }; }
    }
    return null;
  }

  let key = "photo", B = build(key), playing = false;
  const { ctx, size } = fit(cv, () => draw());
  const EL = { C: ["#3a3a3c", 0.42], O: ["#d4493a", 0.42], H: ["#f3f3ef", 0.28], Fe: ["#9a6a4a", 0.55] };
  const TR = ["#d4493a", "#3f7fc4"];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rx = RX[key], p = ease(+pS.value / 100);
    const top = 16, bot = h - 30, mid = w / 2;
    const LL = layout(rx.L, 8, mid - 14, top, bot), RR = layout(rx.R, mid + 14, w - 8, top, bot);
    const u = Math.min(LL.u, RR.u);
    const place = (lay, mol, mi, aj) => { const m = lay.pos.find((q) => q.m === mol && q.i === mi); const [, dx, dy] = SHAPE[mol].at[aj]; return [m.cx + dx * u, m.cy + dy * u]; };
    ctx.strokeStyle = C.rule; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(mid + .5, top); ctx.lineTo(mid + .5, bot); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `14px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("→", mid, (top + bot) / 2 + 4);
    const tr = trT.checked;
    const colOf = (a) => {
      if (tr && a.el === "O") return a.mol === rx.tr.blue ? TR[1] : TR[0];
      return EL[a.el][0];
    };
    // 반응물 원자 → 생성물 자리
    const order = [];
    B.map.forEach((li, ri) => {
      const a = B.L[li], t = B.Rt[ri];
      const [sx, sy] = place(LL, a.mol, a.mi, a.aj), [ex, ey] = place(RR, t.mol, t.mi, t.aj);
      order.push({ a, x: sx + (ex - sx) * p, y: sy + (ey - sy) * p - Math.sin(p * Math.PI) * 10 });
    });
    order.sort((q, r) => (q.a.el === "H") - (r.a.el === "H"));
    for (const o of order) {
      ctx.beginPath(); ctx.arc(o.x, o.y, EL[o.a.el][1] * u, 0, Math.PI * 2);
      ctx.fillStyle = colOf(o.a); ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = .8; ctx.stroke();
    }
    ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(rx.eqL, mid / 2, h - 10); ctx.fillText(rx.eqR, mid + mid / 2, h - 10);
    if (tr) {
      ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`;
      [[TR[1], rx.tr.names[0]], [TR[0], rx.tr.names[1]]].filter((q) => q[1]).forEach(([c, t], i) => {
        ctx.beginPath(); ctx.arc(14, top + 6 + i * 16, 5, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
        ctx.fillStyle = C.ink2; ctx.fillText(t, 24, top + 10 + i * 16);
      });
    }
  }

  function update() {
    const rx = RX[key];
    nOx.textContent = rx.ox; nRed.textContent = rx.red; nE.textContent = rx.en;
    eqL.textContent = `${rx.eqL} → ${rx.eqR}`;
    msg.textContent = rx.msg;
    root.querySelectorAll("[data-rx]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rx === key)));
    draw();
  }
  root.querySelectorAll("[data-rx]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.rx; B = build(key); pS.value = 0; playing = !NM.reduce; update(); }));
  pS.addEventListener("input", () => { playing = false; draw(); });
  trT.addEventListener("change", draw);
  playB.addEventListener("click", () => { pS.value = 0; playing = true; });
  update();
  loop(cv, (dt) => { if (!playing) return; pS.value = Math.min(100, +pS.value + dt * 30); if (+pS.value >= 100) playing = false; draw(); });
})();
