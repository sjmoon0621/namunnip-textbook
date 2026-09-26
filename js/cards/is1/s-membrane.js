/* 카드: 세포막은 무엇을 통과시키고 무엇을 막을까? — 지질 2중층, 막단백질, 능동 수송 (입자 모식) */
(() => {
  const root = document.getElementById("card-is1-membrane");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const chips = [...root.querySelectorAll("[data-mol]")];
  const tProt = $(".prot"), tPump = $(".pump"), reset = $(".reset"), protName = $(".prot-name");
  const nOut = $(".m-out"), nIn = $(".m-in"), nPath = $(".m-path"), nAtp = $(".m-atp");

  // 막을 만났을 때 지나갈 확률 (상대값, 모식). lipid: 지질 부분, prot: 해당 막단백질 자리
  const MOL = {
    o2: { name: "산소 O₂", lipid: 0.55, prot: null, color: "#4f7fa8", r: 3, pname: "필요 없음 (지질층을 바로 통과)" },
    water: { name: "물 H₂O", lipid: 0.02, prot: 0.9, color: "#6fb0d8", r: 3, pname: "통로 단백질 (아쿠아포린)" },
    glucose: { name: "포도당", lipid: 0, prot: 0.45, color: C.amber, r: 4.5, pname: "운반체 단백질 (포도당 수송체)" },
    na: { name: "나트륨 이온 Na⁺", lipid: 0, prot: 0.9, color: C.apple, r: 3.5, pname: "통로 단백질 (나트륨 통로)" },
  };
  const SITES = [0.2, 0.5, 0.8], SITE_H = 0.07, PUMP_Y = 0.92;
  const N = 40;
  let mol = "o2", P = [], stats, hist = [], clock = 0;

  const rnd = Math.random;
  function init() {
    P = []; for (let i = 0; i < N; i++) P.push({ x: 0.05 + rnd() * 0.38, y: 0.05 + rnd() * 0.9, vx: 0, vy: 0, t: 0 });
    stats = { lipid: 0, prot: 0, pump: 0 }; hist = []; clock = 0;
  }
  const { ctx, size } = fit(cv, () => draw());

  function step(dt) {
    const m = MOL[mol], prot = tProt.checked && m.prot != null, pump = tPump.checked && mol === "na";
    const L = 0.47, R = 0.53; // 막의 왼쪽·오른쪽 경계 (가로 비율)
    for (const p of P) {
      p.vx += (rnd() - .5) * 2.4 * dt * 4; p.vy += (rnd() - .5) * 2.4 * dt * 4;
      const sp = Math.hypot(p.vx, p.vy), mx = 0.32;
      if (sp > mx) { p.vx *= mx / sp; p.vy *= mx / sp; }
      let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      if (ny < 0.03 || ny > 0.97) { p.vy *= -1; ny = p.y; }
      if (nx < 0.02 || nx > 0.98) { p.vx *= -1; nx = p.x; }
      const side = p.x < 0.5 ? -1 : 1;
      const hits = side < 0 ? nx > L : nx < R;
      if (hits && p.t <= 0) {
        const atSite = SITES.some((s) => Math.abs(ny - s) < SITE_H);
        const atPump = Math.abs(ny - PUMP_Y) < SITE_H * 0.8;
        let pass = false, how = null;
        if (pump && atPump && side > 0 && rnd() < 0.8) { pass = true; how = "pump"; }
        else if (prot && atSite && rnd() < m.prot) { pass = true; how = "prot"; }
        else if (!atPump && rnd() < m.lipid * 0.5) { pass = true; how = "lipid"; }
        if (pass) { nx = side < 0 ? R + 0.01 : L - 0.01; stats[how]++; p.vx = -side * Math.abs(p.vx); p.t = 0.15; }
        else { p.vx *= -1; nx = p.x; }
      }
      p.t -= dt; p.x = nx; p.y = ny;
    }
    clock += dt;
    if (!hist.length || clock - hist[hist.length - 1][0] > 0.2) { hist.push([clock, P.filter((p) => p.x > 0.5).length]); if (hist.length > 300) hist.shift(); }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bh = h * 0.78; // 입자 상자 높이, 아래는 시간 그래프
    const m = MOL[mol], prot = tProt.checked && m.prot != null, pump = tPump.checked && mol === "na";
    ctx.fillStyle = "#f1f4ee"; ctx.fillRect(0, 0, w / 2, bh);
    ctx.fillStyle = "#f7f1e8"; ctx.fillRect(w / 2, 0, w / 2, bh);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText("세포 밖", 8, 16); ctx.textAlign = "right"; ctx.fillText("세포 안", w - 8, 16); ctx.textAlign = "left";
    // 인지질 2중층
    const L = w * 0.47, R = w * 0.53, hr = Math.max(2.4, (R - L) * 0.16);
    ctx.fillStyle = "#e9dcc0"; ctx.fillRect(L + hr, 0, R - L - 2 * hr, bh);
    for (let y = hr; y < bh; y += hr * 2.2) {
      ctx.fillStyle = "#c9a15a";
      ctx.beginPath(); ctx.arc(L + hr, y, hr, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(R - hr, y, hr, 0, Math.PI * 2); ctx.fill();
    }
    // 막단백질
    const protDraw = (yc, kind) => {
      const y = yc * bh, hh = SITE_H * bh;
      ctx.fillStyle = kind === "pump" ? "#8f6bb0" : kind === "carrier" ? "#5f8f4e" : "#4f7fa8";
      if (kind === "carrier") { ctx.beginPath(); ctx.ellipse((L + R) / 2, y, (R - L) * 0.75, hh * 1.1, 0, 0, Math.PI * 2); ctx.fill(); }
      else {
        ctx.fillRect(L - 3, y - hh - 3, (R - L) + 6, hh * 0.6);
        ctx.fillRect(L - 3, y + hh * 0.4 + 3, (R - L) + 6, hh * 0.6);
        if (kind === "pump") ctx.fillRect(L - 3, y - hh * 0.4 - 3, (R - L) + 6, hh * 0.8 + 6);
      }
    };
    if (prot) SITES.forEach((s) => protDraw(s, mol === "glucose" ? "carrier" : "channel"));
    if (pump) {
      protDraw(PUMP_Y, "pump");
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = "#6f4f90"; ctx.textAlign = "right";
      ctx.fillText("펌프 · ATP →", L - 6, PUMP_Y * bh + 3); ctx.textAlign = "left";
    }
    // 입자
    for (const p of P) {
      ctx.beginPath(); ctx.arc(p.x * w, p.y * bh, m.r, 0, Math.PI * 2); ctx.fillStyle = m.color; ctx.fill();
    }
    // 시간 그래프: 세포 안의 입자 수
    const gy0 = bh + 8, gh = h - gy0 - 4;
    ctx.strokeStyle = C.rule; ctx.strokeRect(.5, gy0 + .5, w - 1, gh - 1);
    ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(0, gy0 + gh / 2); ctx.lineTo(w, gy0 + gh / 2); ctx.stroke(); ctx.setLineDash([]);
    if (hist.length > 1) {
      const t0 = hist[0][0], t1 = Math.max(t0 + 20, hist[hist.length - 1][0]);
      ctx.beginPath();
      hist.forEach(([t, n], i) => { const x = (t - t0) / (t1 - t0) * w, y = gy0 + gh - n / N * gh; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.strokeStyle = m.color; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("세포 안의 입자 수 (점선 = 절반)", 6, gy0 + 12);
  }

  function update() {
    const m = MOL[mol];
    chips.forEach((c) => c.setAttribute("aria-pressed", c.dataset.mol === mol ? "true" : "false"));
    protName.textContent = m.pname;
    tPump.disabled = mol !== "na"; tPump.closest("label").style.opacity = mol === "na" ? 1 : .45;
    tProt.disabled = m.prot == null; tProt.closest("label").style.opacity = m.prot == null ? .45 : 1;
    counts();
  }
  function counts() {
    const inside = P.filter((p) => p.x > 0.5).length;
    nOut.textContent = N - inside; nIn.textContent = inside;
    nPath.textContent = `${stats.lipid} / ${stats.prot}`;
    nAtp.textContent = stats.pump;
  }
  chips.forEach((c) => c.addEventListener("click", () => { mol = c.dataset.mol; init(); update(); draw(); }));
  [tProt, tPump].forEach((t) => t.addEventListener("change", update));
  reset.addEventListener("click", () => { init(); update(); draw(); });
  init(); update();
  let acc = 0;
  loop(cv, (dt) => {
    step(dt);
    draw(); acc += dt; if (acc > 0.2) { acc = 0; counts(); }
  });
})();
