/* 카드: 소화 효소는 어떤 영양소를 분해할까? — 기질 특이성, 대조군, 최적 pH·온도, 열 변성, 쓸개즙의 유화 */
(() => {
  const root = document.getElementById("card-bio-digest");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  const SUB = { starch: "녹말", protein: "단백질", fat: "지방" };
  const ENZ = {
    amy: { name: "아밀레이스", short: "침", sub: "starch", opt: 7, sd: 1.6, k: 0.2 },
    pep: { name: "펩신", short: "펩신", sub: "protein", opt: 2, sd: 1.2, k: 0.16 },
    lip: { name: "라이페이스", short: "라이페이스", sub: "fat", opt: 8, sd: 1.4, k: 0.05, kb: 0.16 },
    water: { name: "증류수", short: "증류수", sub: null },
  };
  const FT = { 5: 0.12, 37: 1, 80: 0 };   /* 온도 인자: 5 °C 느림, 80 °C 변성 */
  const st = { s: "starch", e: "amy", T: 37, p: 7, bile: false, g: null };
  let tube = null;
  const rack = [];

  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "기질" }, { key: "e", label: "효소" }, { key: "c", label: "조건" },
    { key: "g", label: "예상" }, { key: "o", label: "관찰" }, { key: "j", label: "판정" },
  ]);
  const { ctx, size } = fit($("canvas"), () => draw());

  /* 20분 뒤 실제로 분해된 비율 (참값, 화면에 숫자로 보이지 않음) */
  function truth(c) {
    const E = ENZ[c.e];
    if (!E.sub || E.sub !== c.s) return 0;
    const fp = Math.exp(-0.5 * ((c.p - E.opt) / E.sd) ** 2);
    const k = (c.e === "lip" && c.bile ? E.kb : E.k) * fp * FT[c.T];
    return 1 - Math.exp(-k * 20);
  }
  const mix = (a, b, t) => {
    const h = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
    const A = h(a), B = h(b); t = clamp(t, 0, 1);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
  };
  function btb(pH) {
    if (pH >= 7) return mix("#4f9a5a", "#3a6fb0", (pH - 7) / 0.8);
    return mix("#d8c23a", "#4f9a5a", (pH - 6) / 1);
  }
  /* 관찰 결과: 시약 색, 짧은 관찰 문장, 판정 */
  function observe(c, f) {
    if (c.s === "starch") {
      const r = 1 - f;
      return { col: mix("#d9a441", "#25306b", r * 1.3), o: r > 0.6 ? "청람색" : r > 0.25 ? "옅은 청보라색" : "노란 갈색", j: r > 0.6 ? "녹말 남음" : r > 0.25 ? "일부 분해" : "분해됨" };
    }
    if (c.s === "protein") {
      const r = 1 - f;
      return { col: "#8a5cc0", cloud: r, o: (r > 0.6 ? "뿌옇다" : r > 0.25 ? "조금 맑아짐" : "맑아짐") + "·보라", j: r > 0.6 ? "분해 안 됨" : r > 0.25 ? "일부 분해" : "분해됨" };
    }
    if (c.p === 2) return { col: btb(2), o: "노랑 (처음부터)", j: "판단 불가" };
    const pH = c.p - 2 * f;
    const o = pH > 7.5 ? "파랑 그대로" : pH > 6.9 ? (c.p === 7 ? "초록 그대로" : "초록") : pH > 6.4 ? "연두" : "노랑";
    return { col: btb(pH), o, j: f > 0.5 ? "분해됨" : f > 0.15 ? "일부 분해" : "분해 안 됨" };
  }
  const cond = (c) => `${c.T}°C pH${c.p}${c.bile ? " +쓸개즙" : ""}`;

  function why(c, f) {
    const E = ENZ[c.e];
    if (c.e === "water") return c.s === "fat" && c.bile ? "대조군입니다. 쓸개즙이 기름을 작은 방울로 흩었지만(유화) 분해하지는 않았습니다. 쓸개즙은 효소가 아닙니다." : "대조군입니다. 효소가 없으니 20분이 지나도 기질이 그대로 남았습니다.";
    if (E.sub !== c.s) return `${E.name}의 활성 부위는 ${SUB[c.s]}에 맞지 않습니다(기질 특이성). 조건이 좋아도 분해되지 않습니다.`;
    if (c.s === "fat" && c.p === 2) return "BTB가 처음부터 노란색이라 색으로는 지방 분해를 판단할 수 없습니다. 검출 방법이 조건에 맞아야 합니다.";
    if (c.T === 80) return "80 °C에서 효소 단백질이 변성되어 활성 부위가 망가졌습니다. 식혀도 되돌아오지 않습니다.";
    const fp = Math.exp(-0.5 * ((c.p - E.opt) / E.sd) ** 2);
    if (fp < 0.1) return `pH ${c.p}은 ${E.name}의 최적 pH(약 ${E.opt})에서 너무 멉니다. 활성이 거의 없습니다.`;
    if (c.T === 5) return "5 °C에서는 분자 운동이 느려 반응이 느립니다. 변성된 것은 아니어서 데우면 다시 빨라집니다.";
    if (c.e === "lip" && !c.bile) return "라이페이스가 기름층의 표면에서만 작용해 분해가 더딥니다. 쓸개즙을 넣어 비교해 보세요.";
    if (c.e === "lip") return "쓸개즙이 기름을 작은 방울로 유화해 표면적이 넓어지자 라이페이스가 빠르게 분해했습니다. 지방산이 생겨 pH가 낮아졌습니다.";
    if (c.s === "protein") return "펩신이 단백질을 폴리펩타이드로 잘라 뿌연 흰자 액이 맑아졌습니다. 펩타이드 결합은 남아 있어 뷰렛 반응은 여전히 보라색입니다.";
    return f > 0.5 ? "효소와 기질이 짝이 맞고 조건도 알맞아 기질이 거의 다 분해되었습니다." : "분해가 일부만 일어났습니다.";
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = tube ? tube.c : st;
    const tx = Math.max(48, w * 0.12), tw = 40, top = 22, bot = h - 34, liq = top + (bot - top) * 0.32;
    const f = tube ? tube.f : 0, done = tube && tube.phase === "done";
    const ob = observe(c, tube ? tube.f : 0);
    /* 물중탕 */
    ctx.fillStyle = c.T === 80 ? "rgba(230,120,90,.16)" : c.T === 5 ? "rgba(120,170,230,.18)" : "rgba(240,190,90,.16)";
    ctx.fillRect(tx - 40, liq + 30, 80, bot - liq - 14);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`물중탕 ${c.T} °C`, tx, bot + 28);
    /* 내용물 */
    ctx.save();
    ctx.beginPath(); ctx.moveTo(tx - tw / 2, liq); ctx.lineTo(tx - tw / 2, bot - 8); ctx.quadraticCurveTo(tx, bot + 10, tx + tw / 2, bot - 8); ctx.lineTo(tx + tw / 2, liq); ctx.closePath(); ctx.clip();
    let base;
    if (c.s === "starch") base = done ? ob.col : "rgb(236,236,228)";
    else if (c.s === "protein") base = done ? ob.col : "rgb(226,230,236)";
    else base = observe(c, f).col;
    ctx.fillStyle = base; ctx.fillRect(tx - tw, liq, tw * 2, bot - liq + 20);
    if (c.s === "protein") { ctx.fillStyle = `rgba(250,250,248,${0.75 * (1 - f)})`; ctx.fillRect(tx - tw, liq, tw * 2, bot - liq + 20); }
    if (c.s === "starch" && !done) { ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - f)})`; ctx.fillRect(tx - tw, liq, tw * 2, bot - liq + 20); }
    if (c.s === "fat") {
      const emul = c.bile;
      const oil = (emul ? 4 : 14) * (1 - 0.6 * f);
      ctx.fillStyle = "rgba(240,205,90,.95)"; ctx.fillRect(tx - tw, liq, tw * 2, oil);
      if (emul) { ctx.fillStyle = "rgba(245,215,110,.9)"; for (let i = 0; i < 34 * (1 - 0.7 * f); i++) { ctx.beginPath(); ctx.arc(tx - tw / 2 + 4 + ((i * 13) % (tw - 8)), liq + 10 + ((i * 29) % (bot - liq - 20)), 2, 0, Math.PI * 2); ctx.fill(); } }
    }
    ctx.restore();
    /* 시약 방울 */
    if (tube && tube.phase === "drop") {
      ctx.fillStyle = c.s === "starch" ? "#b0702a" : c.s === "protein" ? "#5aa0d0" : "#3a6fb0";
      for (let i = 0; i < 3; i++) { const yy = top - 6 + ((tube.dt * 140 + i * 30) % (liq - top + 10)); ctx.beginPath(); ctx.arc(tx, yy, 3.2, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx - tw / 2, top); ctx.lineTo(tx - tw / 2, bot - 8); ctx.quadraticCurveTo(tx, bot + 10, tx + tw / 2, bot - 8); ctx.lineTo(tx + tw / 2, top); ctx.stroke();

    /* 정보 */
    const ix = tx + 58;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`;
    ctx.fillText(`${SUB[c.s]} + ${ENZ[c.e].name}${c.e === "amy" ? " (침)" : ""}`, ix, 30);
    ctx.font = `11.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`${c.T} °C · pH ${c.p}${c.bile ? " · 쓸개즙" : ""}`, ix, 50);
    const reag = c.s === "starch" ? "아이오딘 용액" : c.s === "protein" ? "흰자 액의 탁도 + 뷰렛 용액" : "BTB 용액 (처음부터 넣음)";
    ctx.fillText(`검출: ${reag}`, ix, 70);
    if (tube) {
      const m = Math.min(20, tube.t);
      ctx.fillText(`경과 ${m.toFixed(0)} / 20 min`, ix, 90);
      const bw = Math.min(170, w - ix - 16); ctx.fillStyle = C.rule; ctx.fillRect(ix, 97, bw, 5); ctx.fillStyle = C.forest; ctx.fillRect(ix, 97, bw * m / 20, 5);
      if (done) { ctx.fillStyle = C.ink; ctx.font = `600 12.5px ${F.sans}`; ctx.fillText(`관찰: ${tube.ob.o}`, ix, 122); }
    } else { ctx.fillStyle = C.ink3; ctx.fillText("준비됨 — 예상을 고른 뒤 실행하세요", ix, 90); }

    /* 지금까지 실험한 시험관 */
    const ry = h * 0.56, rh = bot - ry - 8, n = 8, gap = (w - ix - 10) / n;
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText("시험관대 (최근 8개)", ix, ry - 10);
    rack.slice(-n).forEach((r, i) => {
      const x = ix + gap * i + gap / 2, mw = 13;
      ctx.fillStyle = r.col; ctx.fillRect(x - mw / 2, ry + rh * 0.35, mw, rh * 0.65 - 4);
      if (r.cloud) { ctx.fillStyle = `rgba(250,250,248,${0.75 * r.cloud})`; ctx.fillRect(x - mw / 2, ry + rh * 0.35, mw, rh * 0.65 - 4); }
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x - mw / 2 + .5, ry + .5, mw - 1, rh - 1);
      ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.font = `9.5px ${F.sans}`;
      ctx.fillText(SUB[r.c.s], x, ry + rh + 13); ctx.fillText(ENZ[r.c.e].short, x, ry + rh + 25);
      ctx.textAlign = "left";
    });
    if (!rack.length) { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.fillText("아직 비어 있습니다", ix, ry + rh / 2); }
  }

  function finish(t) {
    const ob = observe(t.c, t.f);
    t.ob = ob; t.phase = "done";
    rack.push({ c: t.c, col: ob.col, cloud: t.c.s === "protein" ? ob.cloud : 0 });
    const real = t.f > 0.15;
    const gtxt = t.c.g ? (t.c.g === "yes" ? "분해" : "안 됨") : "—";
    tbl.add({ s: SUB[t.c.s], e: ENZ[t.c.e].short, c: cond(t.c), g: gtxt, o: ob.o, j: ob.j });
    const v = $(".verdict");
    let head = "";
    if (t.c.g && ob.j !== "판단 불가") head = (t.c.g === "yes") === real ? "예상과 같습니다. " : "예상과 다릅니다. ";
    v.textContent = head + why(t.c, t.f);
    v.className = "verdict small " + (ob.j === "판단 불가" ? "bad" : t.c.g ? ((t.c.g === "yes") === real ? "good" : "bad") : "");
  }
  function run() {
    const c = { ...st };
    tube = { c, t: 0, dt: 0, target: clamp(L.measure(truth(c), { rel: 0.06, sd: 0.02 }), 0, 1), f: 0, phase: "react" };
    $(".verdict").textContent = ""; $(".verdict").className = "verdict small";
  }
  loop($("canvas"), (dt) => {
    if (!tube || tube.phase === "done") return false;
    if (tube.phase === "react") {
      tube.t += dt * 8;
      tube.f = tube.target * Math.pow(Math.min(1, tube.t / 20), 0.7);
      if (tube.t >= 20) { tube.t = 20; tube.f = tube.target; tube.phase = "drop"; tube.dt = 0; }
    } else if (tube.phase === "drop") {
      tube.dt += dt;
      if (tube.dt > 0.9) finish(tube);
    }
    draw();
  });

  const pick = (sel, attr, key, conv) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    st[key] = conv ? conv(b.dataset[attr]) : b.dataset[attr];
    $(sel).querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    tube = null; draw();
  });
  pick(".sub", "s", "s"); pick(".enz", "e", "e"); pick(".tmp", "t", "T", Number); pick(".ph", "p", "p", Number); pick(".guess", "g", "g");
  $(".bile").addEventListener("change", () => { st.bile = $(".bile").checked; tube = null; draw(); });
  $(".run").addEventListener("click", () => { run(); draw(); });
  $(".clear").addEventListener("click", () => { tbl.clear(); rack.length = 0; draw(); });
  draw();

  if (L.demo) {
    const set = (o) => Object.assign(st, { bile: false, g: null }, o);
    const quick = (o) => { set(o); run(); tube.f = tube.target; tube.t = 20; finish(tube); };
    quick({ s: "starch", e: "amy", T: 37, p: 7, g: "yes" });
    quick({ s: "starch", e: "water", T: 37, p: 7, g: "no" });
    quick({ s: "protein", e: "amy", T: 37, p: 7, g: "no" });
    quick({ s: "protein", e: "pep", T: 37, p: 2, g: "yes" });
    quick({ s: "protein", e: "pep", T: 37, p: 7, g: "yes" });
    quick({ s: "fat", e: "lip", T: 37, p: 8, g: "yes" });
    quick({ s: "starch", e: "amy", T: 5, p: 7, g: "yes" });
    quick({ s: "fat", e: "lip", T: 37, p: 8, bile: true, g: "yes" });
    const ui = { s: "fat", e: "lip", T: "37", p: "8", g: "yes" };
    [[".sub", "s"], [".enz", "e"], [".tmp", "t", "T"], [".ph", "p"], [".guess", "g"]].forEach(([sel, a, k]) => $(sel).querySelectorAll(`[data-${a}]`).forEach((x) => x.setAttribute("aria-pressed", String(x.dataset[a] === String(ui[k || a])))));
    $(".bile").checked = true;
    draw();
  }
})();
