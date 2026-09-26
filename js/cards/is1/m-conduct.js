/* 카드 2.4.2: 소금물은 전기가 통하는데 설탕물은 왜 안 통할까? — 움직이는 이온과 전류 (입자 모식) */
(() => {
  const root = document.getElementById("card-is1-conduct");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), conc = $(".c"), cOut = $(".c-out"), power = $(".power");
  const oI = $(".ions"), oC = $(".cur"), oB = $(".bulb");

  // kind: lattice(고정된 이온) | ions(움직이는 이온) | mol(분자) | none
  const S = {
    solid: { name: "소금 결정 NaCl(s)", kind: "lattice", conc: false, plus: "Na⁺", minus: "Cl⁻" },
    brine: { name: "소금물 NaCl(aq)", kind: "ions", conc: true, plus: "Na⁺", minus: "Cl⁻" },
    melt: { name: "녹은 소금 NaCl(l) · 801 °C 이상", kind: "ions", conc: false, fixed: 1.6, plus: "Na⁺", minus: "Cl⁻", hot: true },
    sugar: { name: "설탕물 C₁₂H₂₂O₁₁(aq)", kind: "mol", conc: true },
    water: { name: "증류수", kind: "none", conc: false },
    hcl: { name: "염화 수소 수용액 HCl(aq)", kind: "ions", conc: true, plus: "H⁺", minus: "Cl⁻" },
  };
  let s = "brine", parts = [];
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const amount = () => { const P = S[s]; return P.kind === "none" ? 0 : P.fixed || (P.conc ? +conc.value : 1); };
  const mobile = () => { const P = S[s]; return P.kind === "ions" ? amount() : 0; };

  function build() {
    parts = [];
    const P = S[s];
    if (P.kind === "lattice") {
      for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) parts.push({ lx: i, ly: j, q: (i + j) % 2 ? -1 : 1, fixed: true });
    } else if (P.kind !== "none") {
      const n = Math.round((P.kind === "mol" ? 18 : 24) * amount());
      for (let i = 0; i < n; i++) {
        if (P.kind === "mol") parts.push({ x: rnd(), y: rnd(), q: 0, a: rnd() * 6 });
        else { parts.push({ x: rnd(), y: rnd(), q: 1 }); parts.push({ x: rnd(), y: rnd(), q: -1 }); }
      }
    }
  }

  const { ctx, size } = fit(cv, () => draw());
  function geo() {
    const { w, h } = size;
    const bx = 16, by = 62, bw = w * 0.62 - 16, bh = h - by - 10;
    return { w, h, bx, by, bw, bh, ex1: bx + bw * 0.12, ex2: bx + bw * 0.88 };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const G = geo(), P = S[s], on = power.checked;
    ctx.clearRect(0, 0, w, h);
    // 용기
    ctx.fillStyle = P.hot ? "rgba(224,160,42,.16)" : P.kind === "lattice" ? "rgba(0,0,0,0)" : "rgba(160,200,230,.2)";
    ctx.fillRect(G.bx, G.by + 10, G.bw, G.bh - 10);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(G.bx, G.by); ctx.lineTo(G.bx, G.by + G.bh); ctx.lineTo(G.bx + G.bw, G.by + G.bh); ctx.lineTo(G.bx + G.bw, G.by); ctx.stroke();
    // 전극
    ctx.fillStyle = "#6b6f73";
    ctx.fillRect(G.ex1 - 4, G.by - 16, 8, G.bh * 0.85 + 16); ctx.fillRect(G.ex2 - 4, G.by - 16, 8, G.bh * 0.85 + 16);
    ctx.font = `600 14px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillStyle = "#3f78b5"; ctx.fillText("−", G.ex1 - 13, G.by - 2);
    ctx.fillStyle = C.apple; ctx.fillText("+", G.ex2 + 13, G.by - 2);
    // 입자
    const r = Math.max(4, Math.min(G.bw, G.bh) * 0.028);
    for (const p of parts) {
      let x, y;
      if (p.fixed) {
        const cw = (G.ex2 - G.ex1 - 30) / 8, ch = (G.bh - 30) / 6;
        x = G.ex1 + 15 + (p.lx + .5) * cw + Math.sin(performance.now() / 90 + p.lx * 3 + p.ly) * 1.2;
        y = G.by + 18 + (p.ly + .5) * ch + Math.cos(performance.now() / 80 + p.ly * 2 + p.lx) * 1.2;
      } else { x = G.ex1 + 8 + p.x * (G.ex2 - G.ex1 - 16); y = G.by + 16 + p.y * (G.bh - 26); }
      if (p.q === 0) {
        ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) { const a = p.a + k * Math.PI / 3; k ? ctx.lineTo(x + r * 1.5 * Math.cos(a), y + r * 1.5 * Math.sin(a)) : ctx.moveTo(x + r * 1.5 * Math.cos(a), y + r * 1.5 * Math.sin(a)); }
        ctx.closePath(); ctx.stroke();
      } else {
        ctx.fillStyle = p.q > 0 ? C.apple : "#3f78b5";
        ctx.beginPath(); ctx.arc(x, y, p.q > 0 ? r * 0.85 : r * 1.1, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(P.name, G.bx, 13);
    if (P.kind === "ions" || P.kind === "lattice") {
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
      ctx.fillText(`${P.plus} → (−)극 · ${P.minus} → (+)극${P.kind === "lattice" ? " … 움직이지 못함" : ""}`, G.bx, 28);
    }

    // 전구와 전류계
    const I = on ? mobile() : 0;
    const lx = w * 0.62 + (w * 0.38) / 2, ly = h * 0.48, lr = Math.min(w * 0.08, h * 0.16);
    if (I > 0) {
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr * (1.6 + I));
      g.addColorStop(0, `rgba(255,214,110,${clamp(0.35 + 0.4 * I, 0, 0.95)})`); g.addColorStop(1, "rgba(255,214,110,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, lr * (1.6 + I), 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = I > 0 ? `rgba(255,${Math.round(230 - 30 * clamp(I, 0, 1))},120,1)` : "#eeeeea";
    ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(lx - lr * .45, ly + lr * .9, lr * .9, lr * .55);
    // 전류 막대
    const mx = lx - lr * 1.6, my = h * 0.8, mw = lr * 3.2;
    ctx.fillStyle = C.rule; ctx.fillRect(mx, my, mw, 8);
    ctx.fillStyle = C.forest; ctx.fillRect(mx, my, mw * clamp(I / 1.6, 0, 1), 8);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("전류 (상대값)", lx, my + 22);
    if (!on) ctx.fillText("전원 꺼짐", lx, ly - lr - 10);
    ctx.textAlign = "left";
    // 도선
    ctx.strokeStyle = "rgba(35,35,38,.5)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(G.ex1, G.by - 16); ctx.lineTo(G.ex1, 36); ctx.lineTo(lx - lr * .3, 36); ctx.lineTo(lx - lr * .3, ly - lr); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(G.ex2, G.by - 16); ctx.lineTo(G.ex2, 44); ctx.lineTo(lx + lr * .3, 44); ctx.lineTo(lx + lr * .3, ly - lr); ctx.stroke();
  }

  function update(rebuild = true) {
    const P = S[s];
    conc.disabled = !P.conc;
    cOut.textContent = P.conc ? `${Math.round(+conc.value * 100)}% (상대값)` : "해당 없음";
    if (rebuild) build();
    const m = mobile(), I = power.checked ? m : 0;
    oI.textContent = P.kind === "lattice" ? "0 (묶여 있음)" : P.kind === "ions" ? `${Math.round(m * 100)}` : P.kind === "mol" ? "0 (분자뿐)" : "거의 0";
    oC.textContent = `${Math.round(I * 100)}`;
    oB.textContent = I > 0.9 ? "밝게 켜짐" : I > 0.25 ? "켜짐" : I > 0 ? "희미함" : "꺼짐";
    oB.className = "bulb" + (I > 0 ? " good" : "");
    draw();
  }

  root.querySelectorAll(".samples .chip").forEach((b) => b.addEventListener("click", () => {
    s = b.dataset.s;
    root.querySelectorAll(".samples .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  conc.addEventListener("input", () => update());
  power.addEventListener("change", () => update(false));

  loop(cv, (dt) => {
    const P = S[s], on = power.checked;
    if (NM.reduce && P.kind !== "ions") return;
    for (const p of parts) {
      if (p.fixed) continue;
      const jig = P.kind === "mol" ? 0.10 : 0.12;
      p.x += (rnd() - .5) * jig * dt * 4; p.y += (rnd() - .5) * jig * dt * 4;
      if (on && p.q) p.x += -p.q * dt * 0.12;
      if (p.a != null) p.a += dt;
      // 전극에 닿은 이온은 반대쪽에서 새로 들어오는 것으로 처리 (전체 수는 일정)
      if (p.x < 0) p.x = p.q ? 1 : 0; if (p.x > 1) p.x = p.q ? 0 : 1;
      p.y = clamp(p.y, 0, 1);
    }
    draw();
  });
  update();
})();
