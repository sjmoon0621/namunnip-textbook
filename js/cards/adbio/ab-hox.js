/* 카드: 초파리 Hox 유전자의 공선성과 마디 정체성(뒤쪽 우선 규칙, 모식), 생쥐 HoxA–D 무리와의 상동 관계 */
(() => {
  const root = document.getElementById("card-adbio-hox");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const G = ["lab", "pb", "Dfd", "Scr", "Antp", "Ubx", "abdA", "AbdB"];
  const NAME = { lab: "lab", pb: "pb", Dfd: "Dfd", Scr: "Scr", Antp: "Antp", Ubx: "Ubx", abdA: "abd-A", AbdB: "Abd-B" };
  const COL = { lab: "#c06c84", pb: "#e07a5f", Dfd: "#e0a02a", Scr: "#9bc53d", Antp: "#3b7c2a", Ubx: "#2a9d8f", abdA: "#3f6fa3", AbdB: "#6d5aa6" };
  /* 생쥐 상동군 번호 → 초파리 대응 유전자 (3번은 초파리에서 Hox 기능을 잃은 zen에 대응) */
  const PAR = { 1: "lab", 2: "pb", 3: null, 4: "Dfd", 5: "Scr", 6: "Antp", 7: "Ubx", 8: "abdA", 9: "AbdB", 10: "AbdB", 11: "AbdB", 12: "AbdB", 13: "AbdB" };
  const MOUSE = { A: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13], B: [1, 2, 3, 4, 5, 6, 7, 8, 9, 13], C: [4, 5, 6, 8, 9, 10, 11, 12, 13], D: [1, 3, 4, 8, 9, 10, 11, 12, 13] };
  const SEG = ["H", "T1", "T2", "T3", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"];
  /* 모식 발현 영역: Antp는 몸통 전체에서 켜질 수 있으나 뒤쪽 유전자가 이긴다(뒤쪽 우선) */
  const EXPR = (i) => {
    if (i === 0) return ["lab", "pb", "Dfd"];
    const e = ["Antp"];
    if (i === 1) e.push("Scr");
    if (i >= 3) e.push("Ubx");
    if (i >= 5) e.push("abdA");
    if (i >= 8) e.push("AbdB");
    return e;
  };
  const on = Object.fromEntries(G.map((g) => [g, true]));
  let antpHead = false, preset = "wt";
  const dom = (i) => {
    /* T1에서는 Scr가 Antp를 누른다(교차 억제). Scr가 없을 때만 Antp가 T1의 정체성을 정한다 */
    const e = EXPR(i).filter((g) => on[g] && !(i === 1 && g === "Antp" && on.Scr));
    let best = null; e.forEach((g) => { if (best === null || G.indexOf(g) > G.indexOf(best)) best = g; });
    return best;
  };
  const NORMAL = SEG.map((_, i) => (i === 1 ? "Scr" : EXPR(i).reduce((a, g) => (G.indexOf(g) > G.indexOf(a) ? g : a))));
  const LOOK = (g, i) => {
    if (!g) return "Hox 없음";
    if (g === "lab" || g === "pb" || g === "Dfd") return "머리";
    if (g === "Scr") return "T1";
    if (g === "Antp") return "T2";
    if (g === "Ubx") return i <= 3 ? "T3" : "A1";
    if (g === "abdA") return "A2–A4";
    return "A5–A8";
  };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const gx0 = 62, cw = (w - gx0 - 12) / 13, CX = (k) => gx0 + (k - 0.5) * cw;
    /* 초파리 Hox 유전자 순서 */
    ctx.fillStyle = C.ink2; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("초파리", 8, 31);
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText("3′ (앞) ← 염색체 → 5′ (뒤)", gx0, 12);
    const fpos = { lab: [1, 1], pb: [2, 2], Dfd: [4, 4], Scr: [5, 5], Antp: [6, 6], Ubx: [7, 7], abdA: [8, 8], AbdB: [9, 13] };
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, 27); ctx.lineTo(w - 12, 27); ctx.stroke();
    G.forEach((g) => {
      const [a, b] = fpos[g], x = gx0 + (a - 1) * cw + 2, ww = (b - a + 1) * cw - 4;
      ctx.fillStyle = on[g] ? COL[g] : "#e9ebe4"; ctx.fillRect(x, 19, ww, 16);
      ctx.fillStyle = on[g] ? "#fff" : C.warn; ctx.font = `600 ${cw < 34 ? 9 : 10}px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(NAME[g], x + ww / 2, 31);
      if (!on[g]) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, 19); ctx.lineTo(x + ww, 35); ctx.stroke(); }
    });
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("ANT-C", (CX(1) + CX(6)) / 2, 46); ctx.fillText("BX-C", (CX(7) + CX(13)) / 2, 46);
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(gx0 + 6 * cw, 16); ctx.lineTo(gx0 + 6 * cw, 49); ctx.stroke();
    /* 초파리 몸 (옆모습 모식) */
    const yb = 118;
    const xs = [], rs = [];
    let x = 34;
    SEG.forEach((s, i) => {
      const r = i === 0 ? 17 : i <= 3 ? 19 : Math.max(9, 15 - (i - 4) * 0.8);
      const step = i === 0 ? 0 : i <= 3 ? 34 : 26;
      x += step + (i === 1 ? 4 : 0); xs.push(x); rs.push(r);
    });
    const sc = Math.min(1, (w - 30) / (xs[xs.length - 1] + rs[rs.length - 1]));
    const X = (v) => v * sc + 6;
    let wings = 0, halt = 0;
    SEG.forEach((s, i) => {
      const d = dom(i), cx = X(xs[i]), r = rs[i] * sc, changed = d !== NORMAL[i];
      if (i >= 1 && i <= 3) {
        ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.moveTo(cx, yb + r * 0.8); ctx.lineTo(cx - 6, yb + r + 14); ctx.lineTo(cx + 2, yb + r + 30); ctx.stroke();
        if (d === "Antp") {
          wings += 2; ctx.fillStyle = "rgba(160,190,220,.45)"; ctx.strokeStyle = "#5a7fa3"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(cx + 12, yb - r - 16, 24, 7, -0.9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else if (d === "Ubx") {
          halt += 2; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, yb - r); ctx.lineTo(cx + 4, yb - r - 10); ctx.stroke();
          ctx.fillStyle = COL.Ubx; ctx.beginPath(); ctx.arc(cx + 5, yb - r - 13, 4, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = d ? COL[d] : "#d9dad2"; ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.ellipse(cx, yb, r, i === 0 ? r : r * 1.05, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = changed ? C.warn : "rgba(0,0,0,.25)"; ctx.lineWidth = changed ? 2.5 : 1; ctx.stroke();
      ctx.fillStyle = changed ? C.warn : C.ink3; ctx.font = `${changed ? "600 " : ""}9.5px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(s, cx, yb + (i >= 1 && i <= 3 ? r + 44 : r + 14));
    });
    /* 머리 부속지 */
    const hx = X(xs[0]) - rs[0] * sc;
    ctx.strokeStyle = antpHead ? COL.Antp : C.ink2; ctx.lineWidth = antpHead ? 2.5 : 1.5; ctx.beginPath();
    if (antpHead) { ctx.moveTo(hx + 4, yb - 10); ctx.lineTo(hx - 10, yb - 22); ctx.lineTo(hx - 6, yb - 40); ctx.lineTo(hx - 16, yb - 50); }
    else { ctx.moveTo(hx + 4, yb - 10); ctx.lineTo(hx - 6, yb - 24); ctx.lineTo(hx - 2, yb - 30); }
    ctx.stroke();
    ctx.fillStyle = antpHead ? COL.Antp : C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(antpHead ? "다리" : "더듬이", Math.max(2, hx - 16), yb - 54);
    S.wings = wings; S.halt = halt;
    /* 생쥐 Hox 무리 */
    const ym = 200;
    ctx.fillStyle = C.ink2; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("생쥐·사람", 8, ym - 4);
    ctx.font = `9.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let k = 1; k <= 13; k++) ctx.fillText(String(k), CX(k), ym - 4);
    Object.keys(MOUSE).forEach((c, j) => {
      const y = ym + 4 + j * 19;
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `10px ${F.mono}`; ctx.fillText(`Hox${c}`, 8, y + 12);
      ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(gx0, y + 8); ctx.lineTo(w - 12, y + 8); ctx.stroke();
      MOUSE[c].forEach((k) => {
        const g = PAR[k]; ctx.fillStyle = g ? COL[g] : "#b9bab2"; ctx.fillRect(gx0 + (k - 1) * cw + 3, y + 1, cw - 6, 14);
      });
    });
    /* 앞뒤 축 발현 영역 (모식) */
    const ya = ym + 4 + 4 * 19 + 26, ax0 = gx0, ax1 = w - 12, L = ax1 - ax0;
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("배아의 앞뒤 축에서 발현 영역 (앞쪽 경계만 나타낸 상대값)", ax0, ya - 8);
    for (let k = 1; k <= 13; k++) {
      const g = PAR[k], y = ya + (k - 1) * 5.2, xb = ax0 + (k - 1) / 13 * L * 0.8;
      ctx.fillStyle = g ? COL[g] : "#b9bab2"; ctx.globalAlpha = 0.8; ctx.fillRect(xb, y, ax1 - xb, 4); ctx.globalAlpha = 1;
    }
    const yl = ya + 13 * 5.2 + 12;
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("머리 쪽", ax0, yl);
    ctx.textAlign = "right"; ctx.fillText("꼬리 쪽", ax1, yl);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText("1 → 13", 8, ya + 30);
  }
  const S = { wings: 2, halt: 2 };
  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === preset)));
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", String(on[b.dataset.g])));
    draw();
    $(".n-w").textContent = `${S.wings}장 / ${S.halt}개`;
    $(".n-w").className = S.wings !== 2 ? "n-w bad" : "n-w";
    const ch = SEG.filter((_, i) => dom(i) !== NORMAL[i]);
    const nc = $(".n-c");
    if (!ch.length) { nc.textContent = "없음"; nc.className = "n-c"; }
    else {
      const groups = {};
      ch.forEach((s) => { const i = SEG.indexOf(s), t = LOOK(dom(i), i); (groups[t] = groups[t] || []).push(s); });
      nc.textContent = Object.entries(groups).map(([t, ss]) => `${ss.length > 2 ? ss[0] + "–" + ss[ss.length - 1] : ss.join(", ")} → ${t === "Hox 없음" ? t : t + "처럼"}`).join(" · ");
      nc.className = "n-c bad";
    }
    $(".n-a").textContent = antpHead ? "다리 (더듬이 자리)" : "더듬이";
    $(".n-a").className = antpHead ? "n-a bad" : "n-a";
  }
  function setPreset(p) {
    preset = p; G.forEach((g) => { on[g] = true; }); antpHead = false;
    if (p === "bx") on.Ubx = false;
    if (p === "antp") antpHead = true;
    if (p === "bxc") { on.Ubx = false; on.abdA = false; on.AbdB = false; }
    update();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => setPreset(b.dataset.p)));
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { on[b.dataset.g] = !on[b.dataset.g]; preset = ""; update(); }));
  if (/[?&]demo/.test(location.search)) setPreset("bx"); else update();
})();
