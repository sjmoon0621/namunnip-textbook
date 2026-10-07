/* 카드: 금성의 모양 하나로 우주 모형을 가를 수 있을까? — 프톨레마이오스 / 코페르니쿠스 / 티코 모형의 금성 위상 */
(() => {
  const root = document.getElementById("card-hist-venus");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const sT = $(".t"), btn = $(".play");
  const TE = 365.25, TV = 224.70, SYN = 583.92, AV = 0.723, DV = 12104, AU = 1.496e8;
  /* 프톨레마이오스 모식: 태양 거리 1, 주전원 중심 0.55, 주전원 반지름 0.55·sin46° */
  const PD = 0.55, PR = 0.55 * Math.sin(46 * Math.PI / 180);
  let mode = "pt", playing = false;

  /* 지구 중심 좌표에서 태양 S, 금성 V (AU 또는 모식 단위) */
  function pos(m, t) {
    const aE = 2 * Math.PI * t / TE;
    if (m === "pt") {
      const sun = [Math.cos(aE), Math.sin(aE)];
      const c = [PD * sun[0], PD * sun[1]];
      /* 주전원 위 각: t=0에 태양 너머 쪽(외합에 해당하는 먼 쪽)에서 출발 */
      const b = aE + 2 * Math.PI * t / SYN;
      return { S: sun, V: [c[0] + PR * Math.cos(b), c[1] + PR * Math.sin(b)], C: c };
    }
    return null;
  }
  /* 회전시켜 t=0에 외합이 되도록: 태양 중심 모형은 aV를 aE+π로 시작 */
  function posFix(m, t) {
    if (m === "pt") return pos(m, t);
    const aE = 2 * Math.PI * t / TE, aV = Math.PI + 2 * Math.PI * t / TV;
    const Ee = [Math.cos(aE), Math.sin(aE)], Vh = [AV * Math.cos(aV), AV * Math.sin(aV)];
    return { S: [-Ee[0], -Ee[1]], V: [Vh[0] - Ee[0], Vh[1] - Ee[1]], Vh, Ee };
  }
  function obs(m, t) {
    const p = posFix(m, t), V = p.V, S = p.S;
    const dV = Math.hypot(V[0], V[1]), dS = Math.hypot(S[0], S[1]);
    const el = Math.acos((V[0] * S[0] + V[1] * S[1]) / (dV * dS));
    /* 위상각: 금성에서 본 태양과 지구 사이의 각 */
    const vs = [S[0] - V[0], S[1] - V[1]], ve = [-V[0], -V[1]];
    const al = Math.acos((vs[0] * ve[0] + vs[1] * ve[1]) / (Math.hypot(...vs) * Math.hypot(...ve)));
    const k = (1 + Math.cos(al)) / 2;
    const diam = 206265 * DV / (dV * AU);
    return { p, el, al, k, dV, diam };
  }
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = +sT.value, o = obs(mode, t), p = o.p;
    /* 왼쪽: 궤도 그림 */
    const cx = w * 0.27, cy = h * 0.52, R = Math.min(w * 0.22, h * 0.42) / (mode === "co" ? 1.05 : 1.08);
    ctx.fillStyle = C.ink; ctx.font = `12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(mode === "pt" ? "지구 중심 (주전원)" : mode === "co" ? "태양 중심" : "지구 중심 + 태양 둘레의 행성", 8, 16);
    const P = (v) => [cx + v[0] * R, cy - v[1] * R];
    ctx.lineWidth = 1; ctx.strokeStyle = C.rule;
    let E, S, V;
    if (mode === "co") {
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, AV * R, 0, Math.PI * 2); ctx.stroke();
      S = [cx, cy]; E = P(p.Ee); V = P(p.Vh);
    } else {
      E = [cx, cy]; S = P(p.S); V = P(p.V);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      if (mode === "pt") {
        ctx.beginPath(); ctx.arc(cx, cy, PD * R, 0, Math.PI * 2); ctx.stroke();
        const c = P(p.C); ctx.strokeStyle = "rgba(63,111,163,.6)"; ctx.beginPath(); ctx.arc(c[0], c[1], PR * R, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(S[0], S[1]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(c[0], c[1], 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(63,111,163,.6)"; ctx.beginPath(); ctx.arc(S[0], S[1], AV * R, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.strokeStyle = "rgba(181,83,47,.5)"; ctx.beginPath(); ctx.moveTo(E[0], E[1]); ctx.lineTo(V[0], V[1]); ctx.stroke();
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(S[0], S[1], 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(E[0], E[1], 5, 0, Math.PI * 2); ctx.fill();
    /* 금성: 태양을 향한 반쪽만 밝게 */
    const sa = Math.atan2(S[1] - V[1], S[0] - V[0]);
    ctx.fillStyle = "#3a3a3a"; ctx.beginPath(); ctx.arc(V[0], V[1], 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f2e2b0"; ctx.beginPath(); ctx.arc(V[0], V[1], 5, sa - Math.PI / 2, sa + Math.PI / 2); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("태양", S[0] + 10, S[1] + 4); ctx.fillText("지구", E[0] + 8, E[1] + 14); ctx.fillText("금성", V[0] + 8, V[1] - 6);

    /* 오른쪽 위: 망원경 시야 */
    const vx = w * 0.56, vw = w - vx - 10, vh = h * 0.42, vcx = vx + vw * 0.3, vcy = 10 + vh / 2;
    ctx.fillStyle = "#101418"; ctx.beginPath(); ctx.arc(vcx, vcy, vh / 2, 0, Math.PI * 2); ctx.fill();
    const rr = Math.max(1.5, o.diam * (vh / 2 - 6) / 66);
    const lit = "#f2e2b0", dk = "#101418";
    /* 태양 쪽(오른쪽 또는 왼쪽)을 밝게: 위상각으로 명암 경계 타원 */
    const side = ((p.S[0] * p.V[1] - p.S[1] * p.V[0]) > 0) ? -1 : 1;
    ctx.save(); ctx.translate(vcx, vcy); ctx.scale(side, 1);
    ctx.fillStyle = lit; ctx.beginPath(); ctx.arc(0, 0, rr, -Math.PI / 2, Math.PI / 2); ctx.fill();
    const ex = rr * Math.cos(o.al);
    /* 볼록(ex>0)이면 왼쪽 반에 밝은 타원을 더하고, 초승(ex<0)이면 오른쪽 반에서 어두운 타원을 뺀다 */
    if (ex >= 0) { ctx.fillStyle = lit; ctx.beginPath(); ctx.ellipse(0, 0, ex + 0.01, rr, 0, Math.PI / 2, 3 * Math.PI / 2); ctx.fill(); }
    else { ctx.fillStyle = dk; ctx.beginPath(); ctx.ellipse(0, 0, -ex + 0.01, rr + 0.5, 0, -Math.PI / 2, Math.PI / 2); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("망원경으로 본 금성", vx + vw * 0.62, 24);
    ctx.fillText(mode === "pt" ? "(크기는 상대값)" : "(같은 배율)", vx + vw * 0.62, 40);

    /* 오른쪽 아래: k - 지름 그래프 */
    const gx0 = vx + 30, gx1 = w - 14, gy0 = h * 0.56, gy1 = h - 34;
    const maxD = mode === "pt" ? Math.max(...Array.from({ length: 120 }, (_, i) => obs(mode, i * SYN / 120).diam)) * 1.1 : 70;
    const X = (k) => gx0 + k * (gx1 - gx0), Y = (d) => gy1 - d / maxD * (gy1 - gy0);
    NM.axes(ctx, { x0: gx0, y0: gy0, w: gx1 - gx0, h: gy1 - gy0, X, Y, xt: [[0, "0"], [0.5, "0.5"], [1, "1"]], yt: mode === "pt" ? [] : [[0, "0"], [30, "30″"], [60, "60″"]], xlabel: "밝은 부분의 비율", ylabel: mode === "pt" ? "겉보기 지름 (상대값)" : "겉보기 지름" });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const q = obs(mode, i * SYN / 240); const x = X(q.k), y = Y(q.diam); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(o.k), Y(o.diam), 4.5, 0, Math.PI * 2); ctx.fill();
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    const t = +sT.value, o = obs(mode, t);
    $(".t-out").textContent = t;
    $(".n-e").textContent = `${(o.el * 180 / Math.PI).toFixed(1)}°`;
    $(".n-k").textContent = `${(o.k * 100).toFixed(0)} %`;
    $(".n-d").textContent = mode === "pt" ? `상대값 ${(o.diam / 10).toFixed(1)}` : `${o.diam.toFixed(1)}″`;
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  sT.addEventListener("input", update);
  btn.addEventListener("click", () => { playing = !playing; btn.textContent = playing ? "멈춤" : "재생"; });
  loop(root, (dt) => { if (!playing) return false; sT.value = (+sT.value + dt * 40) % 584; update(); });
  if (window.NMLab && NMLab.demo) { mode = "co"; sT.value = 230; }
  update();
})();
