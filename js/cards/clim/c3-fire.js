/* 카드: 숲이 조금 더 마르면 산불은 왜 훨씬 크게 번질까? — 확률적 산불 확산 격자 모형 (모식) */
(() => {
  const root = document.getElementById("card-clim-wildfire");
  if (!root) return;
  const { C, F, fit, axes, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const NX = 64, NY = 36, DENS = 0.8, BRK = [40, 41, 42];
  // 칸: 0 빈 땅, 1 침엽수, 2 활엽수, 3 타는 중, 4 탄 침엽수, 5 탄 활엽수, 6 방화선
  let g = new Uint8Array(NX * NY), kind = new Uint8Array(NX * NY), fire = [], steps = 0, running = false, sweepRes = null;
  const P = () => ({ dry: +$(".dry").value, wind: +$(".wind").value, conif: +$(".conif").value / 100, brk: $(".brk").checked });

  function grow(p, rnd = Math.random) {
    const a = new Uint8Array(NX * NY);
    for (let i = 0; i < NX * NY; i++) a[i] = rnd() < DENS ? (rnd() < p.conif ? 1 : 2) : 0;
    if (p.brk) for (let y = 0; y < NY; y++) for (const x of BRK) a[y * NX + x] = 6;
    return a;
  }
  // 한 단계: 타는 칸이 이웃에 불을 옮긴 뒤 다 탄다
  function step(a, front, p, rnd = Math.random) {
    const base = 0.2 + 0.9 * p.dry, next = [];
    const dirs = [[1, 0, 1 + 1.5 * p.wind], [-1, 0, 1 - 0.8 * p.wind], [0, 1, 1], [0, -1, 1]];
    for (const i of front) {
      const x = i % NX, y = (i / NX) | 0, k = kindArr[i];
      for (const [dx, dy, wf] of dirs) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= NX || yy >= NY) continue;
        const j = yy * NX + xx, c = a[j];
        if (c !== 1 && c !== 2) continue;
        if (rnd() < Math.min(1, base * (c === 1 ? 1 : 0.55) * wf)) { kindArr[j] = c; a[j] = 3; next.push(j); }
      }
      if (k === 1 && p.wind > 0.5 && rnd() < 0.06 * (p.wind - 0.5) * 2 * (0.5 + p.dry)) {
        const xx = x + 3 + Math.floor(rnd() * 5), yy = y + Math.floor(rnd() * 3) - 1;
        if (xx < NX && yy >= 0 && yy < NY) { const j = yy * NX + xx, c = a[j]; if (c === 1 || c === 2) { kindArr[j] = c; a[j] = 3; next.push(j); } }
      }
      a[i] = k === 1 ? 4 : 5;
    }
    return next;
  }
  let kindArr = kind;
  function ignite(a, i) { if (a[i] === 1 || a[i] === 2) { kindArr[i] = a[i]; a[i] = 3; return [i]; } return []; }
  const leftFront = (a) => { const f = []; for (let y = 0; y < NY; y++) { const i = y * NX; f.push(...ignite(a, i)); } return f; };
  function burnedFrac(a) { let t = 0, b = 0; for (let i = 0; i < NX * NY; i++) { const c = a[i]; if (c >= 1 && c <= 5) { t++; if (c >= 3) b++; } } return t ? b / t : 0; }

  // 화면
  const A = fit($(".fi-map"), () => drawMap()), S = fit($(".fi-sweep"), () => drawSweep());
  const COL = ["#e7e1cf", "#2f6b3a", "#8fbf62", "#e5532a", "#3a3532", "#6b625a", "#c9b48a"];
  function drawMap() {
    const { ctx } = A, { w, h } = A.size; if (!w) return;
    const cw = w / NX, ch = h / NY;
    for (let i = 0; i < NX * NY; i++) {
      const x = i % NX, y = (i / NX) | 0;
      ctx.fillStyle = COL[g[i]]; ctx.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw), Math.ceil(ch));
    }
    // 범례
    const L = [[1, "침엽수"], [2, "활엽수"], [3, "타는 중"], [4, "탄 곳"]];
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    const bx = w - 230, by = h - 24;
    ctx.fillStyle = "rgba(251,251,248,.88)"; ctx.fillRect(bx - 6, by - 13, 232, 22);
    L.forEach(([c, t], k) => { const x = bx + k * 57; ctx.fillStyle = COL[c]; ctx.fillRect(x, by - 7, 10, 10); ctx.fillStyle = C.ink; ctx.fillText(t, x + 13, by + 2); });
    if (P().wind > 0) {
      ctx.fillStyle = "rgba(251,251,248,.88)"; ctx.fillRect(6, 6, 96, 22);
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.sans}`; ctx.fillText("바람 → 동쪽", 12, 21);
    }
  }
  function drawSweep() {
    const { ctx } = S, { w, h } = S.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 36, y0: 22, w: w - 48, h: h - 52 }, X = (d) => box.x0 + d * box.w, Y = (v) => box.y0 + (1 - v) * box.h;
    axes(ctx, { ...box, X, Y, xt: [0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => [v, v.toFixed(1)]), yt: [0, 0.25, 0.5, 0.75, 1].map((v) => [v, Math.round(v * 100) + "%"]), xlabel: "연료 건조도", ylabel: "평균적으로 탄 나무 비율 (불씨: 왼쪽 끝)" });
    const p = P();
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(p.dry) + .5, box.y0); ctx.lineTo(X(p.dry) + .5, box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
    if (!sweepRes) {
      ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText("“건조도별로 40번씩 시험”을 누르면 지금 설정의 곡선이 그려집니다", box.x0 + box.w / 2, box.y0 + box.h / 2);
      return;
    }
    const { pts, label } = sweepRes;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
    pts.forEach(([d, v], k) => { k ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v)); }); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = C.warn; pts.forEach(([d, v]) => { ctx.beginPath(); ctx.arc(X(d), Y(v), 2.4, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(label, box.x0 + 6, box.y0 + 12);
  }

  function stats() {
    const f = burnedFrac(g);
    $(".n-b").textContent = (f * 100).toFixed(0) + " %";
    $(".n-t").textContent = steps + " 단계";
    const s = $(".n-s");
    s.textContent = running ? "번지는 중" : steps ? (f > 0.5 ? "대형 산불" : f > 0.1 ? "중간 규모" : "작게 꺼짐") : "불씨를 기다림";
    s.className = "n-s" + (!running && steps && f > 0.5 ? " bad" : "");
  }
  function reset() { kindArr = kind = new Uint8Array(NX * NY); g = grow(P()); fire = []; steps = 0; running = false; drawMap(); stats(); }
  function start(front) { if (!front.length) return; fire = front; steps = 0; running = true; stats(); }

  let acc = 0;
  loop($(".fi-map"), (dt) => {
    if (!running) return;
    acc += dt; if (acc < 0.045) return; acc = 0;
    fire = step(g, fire, P()); steps++;
    if (!fire.length) running = false;
    drawMap(); stats();
  });

  function sweep() {
    const p = P(), pts = [];
    const saveKind = kindArr;
    for (let d = 0; d <= 1.0001; d += 0.05) {
      let s = 0;
      for (let r = 0; r < 40; r++) {
        const q = { ...p, dry: d }; kindArr = new Uint8Array(NX * NY);
        const a = grow(q); let f = leftFront(a), n = 0;
        while (f.length && n < 400) { f = step(a, f, q); n++; }
        s += burnedFrac(a);
      }
      pts.push([d, s / 40]);
    }
    kindArr = saveKind;
    sweepRes = { pts, label: `침엽수 ${Math.round(p.conif * 100)}% · 바람 ${p.wind.toFixed(2)} · 방화선 ${p.brk ? "있음" : "없음"}` };
    drawSweep();
  }

  const outs = () => {
    const p = P();
    $(".dr-out").textContent = p.dry.toFixed(2); $(".wd-out").textContent = p.wind.toFixed(2); $(".cf-out").textContent = Math.round(p.conif * 100);
    drawSweep();
  };
  $(".dry").addEventListener("input", outs);
  $(".wind").addEventListener("input", () => { outs(); drawMap(); });
  $(".conif").addEventListener("input", () => { outs(); reset(); });
  $(".brk").addEventListener("change", reset);
  $(".regrow").addEventListener("click", reset);
  $(".fire").addEventListener("click", () => { if (steps || running) reset(); start(leftFront(g)); });
  $(".sweep").addEventListener("click", sweep);
  $(".fi-map").addEventListener("click", (e) => {
    const rc = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rc.left) / rc.width * NX), y = Math.floor((e.clientY - rc.top) / rc.height * NY);
    if (running) return;
    start(ignite(g, y * NX + x));
  });

  outs(); reset();
  if (/[?&]demo\b/.test(location.search)) {
    $(".dry").value = 0.68; outs(); reset();
    let f = leftFront(g); while (f.length) { f = step(g, f, P()); steps++; }
    drawMap(); stats(); sweep();
  }
})();
