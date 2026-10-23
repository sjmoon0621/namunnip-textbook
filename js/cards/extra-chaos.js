/* 카드: 꼭짓점과 옮기는 비율을 바꾸면 어떤 무늬가 나올까? — 카오스 게임 */
(() => {
  const root = document.getElementById("card-extra-chaos");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = root.querySelector("canvas");
  const sT = $(".t"), oT = $(".t-out"), bRun = $("[data-act=run]");
  const dN = $(".d-n"), dCopy = $(".d-copy"), dDim = $(".d-dim");
  const MAX = 40000, COLS = [C.forest, C.amber, C.warn, "#4a78b0", "#8a5bb0", C.ink2, "#2f9c9c", "#b0567d"];
  const PRE = {
    tri: { t: 0.5 }, sq: { t: 0.5 }, sqx: { t: 0.5, norep: true }, carpet: { t: 2 / 3 }, pent: { t: 0.618 },
  };
  let preset = "tri", verts = [], norep = false;
  let pts = new Float32Array(MAX * 2), col = new Uint8Array(MAX), n = 0;
  let px = 0, py = 0, last = -1, running = !reduce, slow = 0, slowAcc = 0, trace = null;

  function shape(name) {
    const reg = (k, a0) => Array.from({ length: k }, (_, i) => [Math.cos(a0 + 2 * Math.PI * i / k), Math.sin(a0 + 2 * Math.PI * i / k)]);
    if (name === "tri") return reg(3, Math.PI / 2).map(([x, y]) => [x, y - 0.22]);
    if (name === "pent") return reg(5, Math.PI / 2).map(([x, y]) => [x, y - 0.08]);
    const s = 0.9, sq = [[-s, -s], [s, -s], [s, s], [-s, s]];
    if (name === "carpet") return [...sq, [0, -s], [s, 0], [0, s], [-s, 0]];
    return sq;
  }
  function reset() {
    n = 0; last = -1; trace = null;
    px = (Math.random() - 0.5) * 1.4; py = (Math.random() - 0.5) * 1.4;
  }
  function pick() {
    let k;
    do { k = Math.floor(Math.random() * verts.length); } while (norep && k === last);
    return k;
  }
  function move() {
    const k = pick(), t = +sT.value, [vx, vy] = verts[k];
    const ox = px, oy = py;
    px += (vx - px) * t; py += (vy - py) * t; last = k;
    if (n < MAX) { pts[2 * n] = px; pts[2 * n + 1] = py; col[n] = k; n++; }
    return { ox, oy, vx, vy, k };
  }

  const V = fit(cv, () => drawAll());
  function tf() {
    const { size: { w, h } } = V, S = Math.min(w, h) / 2 - 16;
    return { X: (x) => w / 2 + x * S, Y: (y) => h / 2 - y * S };
  }
  function base() {
    const { ctx, size: { w, h } } = V;
    const { X, Y } = tf();
    ctx.clearRect(0, 0, w, h);
    ctx.font = `12px ${F.mono}`; ctx.textAlign = "center";
    verts.forEach(([x, y], k) => {
      ctx.fillStyle = COLS[k % COLS.length];
      ctx.beginPath(); ctx.arc(X(x), Y(y), 5, 0, Math.PI * 2); ctx.fill();
    });
  }
  function dots(from) {
    const { ctx } = V, { X, Y } = tf();
    for (let i = Math.max(from, 0); i < n; i++) {
      // 처음 몇 점은 아직 무늬로 다가가는 중이라 그리지 않는다
      if (i < 8 && slow === 0 && !trace) continue;
      ctx.fillStyle = COLS[col[i] % COLS.length];
      ctx.fillRect(X(pts[2 * i]) - 0.6, Y(pts[2 * i + 1]) - 0.6, 1.2, 1.2);
    }
  }
  function drawAll() {
    const { ctx, size: { w } } = V; if (!w) return;
    base(); dots(0);
    if (trace) {
      const { X, Y } = tf();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3;
      ctx.beginPath(); ctx.moveTo(X(trace.ox), Y(trace.oy)); ctx.lineTo(X(trace.vx), Y(trace.vy)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(trace.ox), Y(trace.oy), 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLS[trace.k % COLS.length]; ctx.beginPath(); ctx.arc(X(px), Y(py), 4.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  function nums() {
    const t = +sT.value, s = 1 - t, k = verts.length;
    dN.textContent = n.toLocaleString("ko-KR");
    dCopy.textContent = `${k}개, ${s.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}배`;
    if (norep) dDim.textContent = "공식으로는 구할 수 없음";
    else {
      const d = Math.log(k) / Math.log(1 / s);
      dDim.textContent = d > 2 ? "2 (복사본이 겹침)" : d.toFixed(3);
    }
  }
  function setRun(on) { running = on; bRun.textContent = on ? "멈춤" : "계속"; bRun.setAttribute("aria-pressed", String(on)); }
  function load(name) {
    preset = name; verts = shape(name); norep = !!PRE[name].norep;
    sT.value = PRE[name].t; oT.textContent = (+sT.value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === name)));
    reset(); slow = 0; nums(); drawAll();
  }

  loop(root, (dt) => {
    if (!running) return;
    if (slow > 0) {
      slowAcc += dt;
      if (slowAcc >= 0.7) { slowAcc = 0; trace = move(); slow--; drawAll(); nums(); }
      return;
    }
    if (trace) { trace = null; drawAll(); }
    if (n >= MAX) return;
    const from = n;
    for (let i = 0; i < 400 && n < MAX; i++) move();
    dots(from); nums();
  });
  sT.addEventListener("input", () => {
    oT.textContent = (+sT.value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
    reset(); nums(); drawAll();
  });
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => load(b.dataset.p)));
  $("[data-act=slow]").addEventListener("click", () => { reset(); slow = 12; slowAcc = 0.7; setRun(true); drawAll(); });
  bRun.addEventListener("click", () => setRun(!running));
  load("tri");
  // 움직임을 줄인 설정이면 점을 한꺼번에 찍어 완성된 무늬를 보여 준다
  if (reduce) { for (let i = 0; i < 20000; i++) move(); nums(); drawAll(); }
})();
