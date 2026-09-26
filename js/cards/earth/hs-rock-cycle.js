/* 카드: 암석은 어떻게 다른 암석이 될까? — 암석의 순환 경로 만들기 */
(() => {
  const root = document.getElementById("card-earth-rock-cycle");
  if (!root) return;
  const { C, F, fit, clamp, ease } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), logEl = $(".log"), fb = $(".feedback");

  const NODE = {
    ign: { name: "화성암", x: 0.14, y: 0.42 },
    sed: { name: "퇴적물", x: 0.5, y: 0.12 },
    sdr: { name: "퇴적암", x: 0.86, y: 0.42 },
    met: { name: "변성암", x: 0.68, y: 0.86 },
    mag: { name: "마그마", x: 0.32, y: 0.86 },
  };
  const PROC = {
    erode: { name: "풍화·침식·운반", where: "지표로 드러난 암석이 비, 바람, 강물에 부서져 옮겨집니다." },
    lithify: { name: "퇴적·다짐·굳음", where: "바다나 호수 바닥에 쌓인 퇴적물이 눌리고 붙어 굳습니다(속성 작용)." },
    meta: { name: "열·압력 (변성)", where: "조산대의 깊은 곳이나 마그마 주변에서, 녹지 않은 채로 광물과 조직이 바뀝니다." },
    melt: { name: "용융", where: "섭입대나 대륙 지각 아래처럼 온도가 충분히 높은 곳에서 녹습니다." },
    cool: { name: "냉각·고결", where: "지하 깊은 곳에서 천천히, 또는 지표에서 빨리 식어 굳습니다." },
  };
  const EDGE = [
    ["ign", "sed", "erode"], ["sdr", "sed", "erode"], ["met", "sed", "erode"],
    ["sed", "sdr", "lithify"],
    ["ign", "met", "meta"], ["sdr", "met", "meta"],
    ["met", "mag", "melt"], ["sdr", "mag", "melt"], ["ign", "mag", "melt"],
    ["mag", "ign", "cool"],
  ];
  const MISSION = [
    { start: "ign", label: "화강암", goal: (p) => p.at(-1) === "met" && p.includes("sdr"), text: "화강암 속 석영 알갱이가 규암이 되게 하세요." },
    { start: "sdr", label: "석회암", goal: (p) => p.at(-1) === "sed" && p.includes("met"), text: "석회암이 대리암을 거쳐 다시 부스러기가 되게 하세요." },
    { start: "ign", label: "현무암", goal: (p) => p.at(-1) === "ign" && p.includes("met") && p.includes("mag"), text: "해양 지각의 현무암이 변성되고 녹아 다시 화성암이 되게 하세요." },
  ];
  let M = 0, path = [], hist = [], anim = null;

  // 경로에 따라 구체적인 암석 이름
  function rockName(p) {
    const cur = p.at(-1), prev = p.at(-2);
    const m = MISSION[M];
    if (p.length === 1) return m.label;
    if (cur === "sed") return prev === "ign" && p[0] === "ign" && m.label === "화강암" ? "모래 (석영·장석 알갱이)" : "퇴적물 (자갈·모래·진흙)";
    if (cur === "sdr") return m.label === "화강암" ? "사암" : "퇴적암";
    if (cur === "met") {
      if (prev === "sdr") return m.label === "화강암" ? "규암" : m.label === "석회암" && p.length === 2 ? "대리암" : "변성암";
      if (prev === "ign") return m.label === "화강암" && p.length === 2 ? "편마암" : m.label === "현무암" && p.length === 2 ? "변성된 현무암 (각섬암 등)" : "변성암";
      return "변성암";
    }
    if (cur === "mag") return "마그마";
    if (cur === "ign") return "화성암 (식은 곳에 따라 화산암·심성암)";
    return NODE[cur].name;
  }

  const { ctx, size } = fit(cv, () => draw());
  const P = (k) => [NODE[k].x * size.w, NODE[k].y * size.h];
  function ctrl(a, b) {
    // 두 노드 사이를 바깥쪽으로 조금 휘게
    const [x0, y0] = P(a), [x1, y1] = P(b), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const cx = size.w * 0.5, cy = size.h * 0.5, dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
    const bend = (a === "ign" && b === "mag") || (a === "mag" && b === "ign") ? (a === "ign" ? -1 : 1) * 26 : 18;
    return [mx + dx / d * bend, my + dy / d * bend];
  }
  function edgePoint(a, b, t) {
    const [x0, y0] = P(a), [x1, y1] = P(b), [cx, cy] = ctrl(a, b);
    const u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cur = path.at(-1);
    // 화살표
    EDGE.forEach(([a, b, pr]) => {
      const active = a === cur;
      const used = hist.some((q) => q[0] === a && q[1] === b);
      ctx.strokeStyle = used ? C.forest : active ? C.ink2 : C.rule; ctx.lineWidth = used ? 2.4 : active ? 1.6 : 1.2;
      ctx.beginPath();
      for (let t = 0.2; t <= 0.8; t += 0.02) { const [x, y] = edgePoint(a, b, t); t === 0.2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
      const [xe, ye] = edgePoint(a, b, 0.8), [xp, yp] = edgePoint(a, b, 0.76), an = Math.atan2(ye - yp, xe - xp);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath(); ctx.moveTo(xe, ye); ctx.lineTo(xe - 8 * Math.cos(an - .45), ye - 8 * Math.sin(an - .45)); ctx.lineTo(xe - 8 * Math.cos(an + .45), ye - 8 * Math.sin(an + .45)); ctx.closePath(); ctx.fill();
      if (active) {
        const [lx, ly] = edgePoint(a, b, 0.5);
        ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
        const t = PROC[pr].name, tw = ctx.measureText(t).width + 8;
        ctx.fillStyle = "rgba(251,251,248,.9)"; ctx.fillRect(lx - tw / 2, ly - 9, tw, 15);
        ctx.fillStyle = C.ink2; ctx.fillText(t, lx, ly + 2);
      }
    });
    // 노드
    Object.entries(NODE).forEach(([k, n]) => {
      const [x, y] = P(k), on = k === cur;
      ctx.fillStyle = on ? C.ink : C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      const bw = 74, bh = 30;
      ctx.fillRect(x - bw / 2, y - bh / 2, bw, bh); ctx.strokeRect(x - bw / 2 + .5, y - bh / 2 + .5, bw - 1, bh - 1);
      ctx.font = `700 13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = on ? C.paper : C.ink;
      ctx.fillText(n.name, x, y + 5);
    });
    // 움직이는 알갱이
    let tok;
    if (anim) { const q = ease(clamp((performance.now() - anim.t0) / 700, 0, 1)); tok = edgePoint(anim.a, anim.b, 0.08 + 0.84 * q); }
    else { const [x, y] = P(cur); tok = [x + 42, y - 16]; }
    ctx.beginPath(); ctx.arc(tok[0], tok[1], 6, 0, Math.PI * 2); ctx.fillStyle = C.amber; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
    ctx.textAlign = "left";
  }

  function logUI() {
    logEl.innerHTML = path.map((k, i) => `<span>${i ? `<i>${PROC[hist[i - 1][2]].name}</i> → ` : ""}<b>${rockName(path.slice(0, i + 1))}</b></span>`).join(" ");
  }
  function go(pr) {
    if (anim) return;
    const cur = path.at(-1), e = EDGE.find(([a, , p]) => a === cur && p === pr);
    if (!e) {
      fb.className = "feedback small bad";
      fb.textContent = cur === "sed" && pr === "meta" ? "흩어진 퇴적물은 먼저 굳어 퇴적암이 되어야 합니다."
        : cur === "mag" && pr !== "cool" ? "마그마는 먼저 식어 굳어야 다른 과정을 겪을 수 있습니다."
        : pr === "lithify" ? "퇴적·다짐·굳음은 부스러기(퇴적물)에 일어나는 과정입니다."
        : pr === "cool" ? "냉각·고결은 녹아 있는 마그마에 일어나는 과정입니다."
        : `${NODE[cur].name}에는 이 과정이 바로 일어나지 않습니다.`;
      return;
    }
    fb.className = "feedback small"; fb.textContent = PROC[pr].where;
    if (NM.reduce) { path.push(e[1]); hist.push(e); after(); return; }
    anim = { a: e[0], b: e[1], t0: performance.now() };
    const step = () => { draw(); if (performance.now() - anim.t0 < 720) requestAnimationFrame(step); else { anim = null; path.push(e[1]); hist.push(e); after(); } };
    requestAnimationFrame(step);
  }
  function after() {
    logUI(); draw();
    const m = MISSION[M];
    if (m.goal(path)) { fb.className = "feedback small good"; fb.textContent = `성공했습니다. ${path.length - 1}단계를 거쳤습니다. 다른 길도 있는지 찾아보세요.`; }
    else if (M === 0 && path.at(-1) === "met" && !path.includes("sdr")) { fb.className = "feedback small bad"; fb.textContent = "화강암이 바로 변성되면 편마암이 됩니다. 규암은 어떤 암석이 변성된 것일까요?"; }
  }
  function load(k) {
    M = k; path = [MISSION[k].start]; hist = []; anim = null;
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.m === k ? "true" : "false"));
    $(".mission").textContent = MISSION[k].text;
    fb.className = "feedback small"; fb.textContent = "";
    logUI(); draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => go(b.dataset.p)));
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => load(+b.dataset.m)));
  $(".reset").addEventListener("click", () => load(M));
  load(0);
})();
