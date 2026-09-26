/* 카드 2.4.1: 원자는 왜 전자를 주고받거나 함께 쓸까? — 옮기는 전자 수·공유 전자쌍 수를 맞춰 보기 */
(() => {
  const root = document.getElementById("card-is1-bond");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), slider = $(".k"), kOut = $(".k-out"), kLab = $(".k-lab");
  const oA = $(".a"), oB = $(".b"), oV = $(".v"), lA = $(".a-lab"), lB = $(".b-lab");

  // 이온 결합: 금속 M(원자가 전자 mv, 개수 mc), 비금속 X(원자가 전자 xv, 개수 xc)
  const IONIC = {
    NaCl: { M: "Na", mv: 1, mc: 1, X: "Cl", xv: 7, xc: 1, f: "NaCl" },
    MgO: { M: "Mg", mv: 2, mc: 1, X: "O", xv: 6, xc: 1, f: "MgO" },
    MgCl2: { M: "Mg", mv: 2, mc: 1, X: "Cl", xv: 7, xc: 2, f: "MgCl₂" },
    Na2O: { M: "Na", mv: 1, mc: 2, X: "O", xv: 6, xc: 1, f: "Na₂O" },
  };
  // 공유 결합: 원자, 결합(원자 번호 쌍), 원자가 전자, 채워야 할 수
  const COV = {
    H2: { at: ["H", "H"], bonds: [[0, 1]], f: "H₂", lay: "two" },
    H2O: { at: ["O", "H", "H"], bonds: [[0, 1], [0, 2]], f: "H₂O", lay: "bent" },
    CO2: { at: ["O", "C", "O"], bonds: [[1, 0], [1, 2]], f: "CO₂", lay: "line" },
    O2: { at: ["O", "O"], bonds: [[0, 1]], f: "O₂", lay: "two" },
    N2: { at: ["N", "N"], bonds: [[0, 1]], f: "N₂", lay: "two" },
  };
  const VAL = { H: 1, C: 4, N: 5, O: 6, Cl: 7, Na: 1, Mg: 2 };
  const FULL = (s) => s === "H" ? 2 : 8;
  let pair = "NaCl";

  const ionic = () => IONIC[pair], cov = () => COV[pair];

  function stateIonic(k) {
    const P = ionic();
    const g = P.mc * k / P.xc;
    const m = k < P.mv ? { n: P.mv - k, ok: false, note: "" } : k === P.mv ? { n: 8, ok: true, note: "안쪽 껍질이 바깥이 됨" } : { n: null, ok: false, note: "안쪽 껍질까지 떼어야 함" };
    const x = !Number.isInteger(g) ? { n: null, ok: false, note: "똑같이 나눌 수 없음" } : { n: P.xv + g, ok: P.xv + g === 8, note: P.xv + g > 8 ? "넘침" : "" };
    return { P, g, m, x };
  }
  function stateCov(b) {
    const P = cov();
    const nb = P.at.map((_, i) => P.bonds.filter((bd) => bd.includes(i)).length);
    const res = P.at.map((s, i) => {
      const own = VAL[s] - b * nb[i];
      if (own < 0) return { n: null, own, ok: false };
      const n = VAL[s] + b * nb[i];
      return { n, own, ok: n === FULL(s) };
    });
    return { P, nb, res };
  }

  const { ctx, size } = fit(cv, () => draw());

  // 원 둘레에 전자 점 찍기: Lewis 식으로 네 방향에 하나씩, 그다음 짝
  const SLOT = [-90, 0, 90, 180].map((d) => d * Math.PI / 180);
  function dots(cx, cy, r, list) { // list: 색 배열
    list.forEach((col, i) => {
      const side = i % 4, second = i >= 4;
      const a = SLOT[side] + (second ? 0.2 : -0.2) * (list.length > 4 || i >= 4 ? 1 : 0);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 3.4, 0, Math.PI * 2); ctx.fill();
    });
  }
  function atom(cx, cy, r, sym, charge) {
    ctx.fillStyle = "rgba(35,35,38,.04)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(35,35,38,.35)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 ${Math.round(r * 0.5)}px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(sym, cx, cy + r * 0.18);
    if (charge) { ctx.font = `600 ${Math.round(r * 0.34)}px ${F.mono}`; ctx.fillStyle = charge.includes("+") ? C.apple : "#3f78b5"; ctx.fillText(charge, cx + r * 0.85, cy - r * 0.8); }
    ctx.textAlign = "left";
  }
  const sup = (n, s) => `${n > 1 ? n : ""}${s}`;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = +slider.value;
    if (IONIC[pair]) {
      const S = stateIonic(k), P = S.P;
      const n = Math.max(P.mc, P.xc), r = Math.min(h / (2 * n + 1.2), w * 0.12);
      const ys = (c, i) => h / 2 + (i - (c - 1) / 2) * (2.2 * r);
      const xm = w * 0.27, xx = w * 0.7;
      for (let i = 0; i < P.mc; i++) {
        const y = ys(P.mc, i);
        const ch = S.m.ok ? sup(P.mv, "+") : "";
        atom(xm, y, r, P.M, ch);
        if (S.m.n != null) dots(xm, y, r, Array(S.m.n).fill(S.m.ok ? "rgba(93,93,97,.55)" : C.ink));
      }
      for (let j = 0; j < P.xc; j++) {
        const y = ys(P.xc, j);
        const ch = S.x.ok ? sup(8 - P.xv, "−") : "";
        atom(xx, y, r, P.X, ch);
        const g = Number.isInteger(S.g) ? S.g : 0;
        dots(xx, y, r, [...Array(P.xv).fill(C.ink), ...Array(g).fill(C.amber)]);
      }
      if (k > 0) for (let i = 0; i < P.mc; i++) for (let j = 0; j < P.xc; j++) {
        const y1 = ys(P.mc, i), y2 = ys(P.xc, j);
        ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(xm + r * 1.15, y1); ctx.lineTo(xx - r * 1.2, y2); ctx.stroke(); ctx.setLineDash([]);
        const ax = xx - r * 1.2, ang = Math.atan2(y2 - y1, ax - xm - r * 1.15);
        ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(ax, y2);
        ctx.lineTo(ax - 8 * Math.cos(ang - .4), y2 - 8 * Math.sin(ang - .4)); ctx.lineTo(ax - 8 * Math.cos(ang + .4), y2 - 8 * Math.sin(ang + .4)); ctx.fill();
      }
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
      ctx.fillText("금속", xm, 14); ctx.fillText("비금속", xx, 14);
      if (S.m.note) { ctx.fillStyle = S.m.ok ? C.ink3 : C.warn; ctx.fillText(S.m.note, xm, h - 6); }
      if (S.x.note) { ctx.fillStyle = C.warn; ctx.fillText(S.x.note, xx, h - 6); }
      ctx.textAlign = "left";
    } else {
      const S = stateCov(k), P = S.P;
      const r = Math.min(h * 0.2, w * 0.1), d = r * 1.55;
      const cx = w / 2, cy = h / 2 + 4;
      let pos;
      if (P.lay === "two") pos = [[cx - d / 2, cy], [cx + d / 2, cy]];
      else if (P.lay === "line") pos = [[cx - d, cy], [cx, cy], [cx + d, cy]];
      else { const a = 52 * Math.PI / 180; pos = [[cx, cy - r * .5], [cx - d * Math.sin(a), cy - r * .5 + d * Math.cos(a)], [cx + d * Math.sin(a), cy - r * .5 + d * Math.cos(a)]]; }
      const rad = P.at.map((s) => s === "H" ? r * 0.72 : r);
      P.at.forEach((s, i) => atom(pos[i][0], pos[i][1], rad[i], s, ""));
      // 공유 전자쌍
      for (const [i, j] of P.bonds) {
        if (k === 0) continue;
        const [x1, y1] = pos[i], [x2, y2] = pos[j];
        const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
        const t = (rad[i] - (rad[i] + rad[j] - L) / 2) / L, mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
        for (let p = 0; p < k; p++) {
          const off = (p - (k - 1) / 2) * 10;
          for (const sgn of [-1, 1]) {
            ctx.fillStyle = sgn < 0 ? C.ink : C.amber;
            ctx.beginPath(); ctx.arc(mx - uy * off + ux * 3.6 * sgn, my + ux * off + uy * 3.6 * sgn, 3.2, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      // 나머지(비공유) 전자: 결합 방향에서 먼 쪽에 짝지어 배치
      P.at.forEach((s, i) => {
        const own = S.res[i].own; if (own <= 0) return;
        const dirs = P.bonds.filter((b) => b.includes(i)).map((b) => { const j = b[0] === i ? b[1] : b[0]; return Math.atan2(pos[j][1] - pos[i][1], pos[j][0] - pos[i][0]); });
        const cand = [...Array(12).keys()].map((q) => q * Math.PI / 6 - Math.PI / 2)
          .map((a) => ({ a, s: Math.min(...dirs.map((b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))))) }))
          .sort((p, q) => q.s - p.s);
        const slots = [];
        for (const c of cand) if (slots.every((a) => Math.abs(Math.atan2(Math.sin(a - c.a), Math.cos(a - c.a))) > 1.2)) slots.push(c.a);
        // 결합이 없으면 네 방향에 하나씩 먼저, 결합이 있으면 전자쌍으로 묶는다
        const per = [];
        if (!dirs.length) { const nS = slots.length; for (let q = 0; q < nS; q++) per.push(own <= nS ? (q < own ? 1 : 0) : (q < own - nS ? 2 : 1)); }
        else { let left = own; for (let q = 0; q < slots.length && left > 0; q++) { per.push(Math.min(2, left)); left -= 2; } }
        per.forEach((nIn, q) => {
          for (let e = 0; e < nIn; e++) {
            const a = slots[q] + (nIn === 2 ? (e ? .2 : -.2) : 0);
            ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(pos[i][0] + rad[i] * Math.cos(a), pos[i][1] + rad[i] * Math.sin(a), 3.2, 0, Math.PI * 2); ctx.fill();
          }
        });
      });
      if (S.res.some((x) => x.n == null)) P.at.forEach((s, i) => { if (S.res[i].n == null) { ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "center"; ctx.fillText("내놓을 전자가 모자람", pos[i][0], pos[i][1] + rad[i] + 16); ctx.textAlign = "left"; } });
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
      ctx.fillText(k ? `결합마다 전자쌍 ${k}개 (${["", "단일", "2중", "3중"][k]} 결합)` : "아직 공유하지 않음", cx, 14);
      ctx.textAlign = "left";
    }
  }

  function update() {
    const k = +slider.value;
    kOut.textContent = k;
    if (IONIC[pair]) {
      kLab.textContent = "금속 원자 하나가 내주는 전자";
      const S = stateIonic(k), P = S.P;
      lA.textContent = `${P.M}${P.mc > 1 ? " (각각)" : ""} · 바깥 전자`;
      lB.textContent = `${P.X}${P.xc > 1 ? " (각각)" : ""} · 바깥 전자`;
      oA.textContent = S.m.n == null ? "불가능" : `${S.m.n}개${S.m.ok ? " ✓" : ""}`;
      oB.textContent = S.x.n == null ? "불가능" : `${S.x.n}개${S.x.ok ? " ✓" : ""}`;
      const ok = S.m.ok && S.x.ok;
      oV.textContent = ok ? `${P.f} (이온 결합)` : "아직 불안정"; oV.className = "v " + (ok ? "good" : "bad");
      oA.className = "a" + (S.m.ok ? " good" : ""); oB.className = "b" + (S.x.ok ? " good" : "");
    } else {
      kLab.textContent = "결합 하나에 함께 쓰는 전자쌍";
      const S = stateCov(k), P = S.P;
      const ci = P.at.length === 3 ? (P.lay === "line" ? 1 : 0) : 0, oi = P.at.findIndex((s, i) => i !== ci);
      const lab = (i, many) => `${P.at[i]}${P.lay === "two" ? " (각각)" : many ? " (각각)" : " (가운데)"} · 바깥 전자`;
      lA.textContent = lab(ci, false); lB.textContent = lab(oi, true);
      const t = (x) => x.n == null ? "불가능" : `${x.n}개${x.ok ? " ✓" : ""}`;
      oA.textContent = t(S.res[ci]); oB.textContent = t(S.res[oi]);
      if (P.lay === "two") { lA.textContent = `${P.at[0]} · 바깥 전자`; lB.textContent = `${P.at[1]} · 바깥 전자`; }
      const ok = S.res.every((x) => x.ok);
      oV.textContent = ok ? `${P.f} (공유 결합)` : "아직 불안정"; oV.className = "v " + (ok ? "good" : "bad");
      oA.className = "a" + (S.res[ci].ok ? " good" : ""); oB.className = "b" + (S.res[oi].ok ? " good" : "");
    }
    draw();
  }

  slider.addEventListener("input", update);
  root.querySelectorAll(".pairs .chip").forEach((b) => b.addEventListener("click", () => {
    pair = b.dataset.p; slider.value = 0;
    root.querySelectorAll(".pairs .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  update();
})();
