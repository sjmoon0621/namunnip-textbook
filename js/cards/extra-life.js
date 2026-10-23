/* 카드: 어떤 무늬는 멈추고, 어떤 무늬는 걸어가고, 어떤 무늬는 새끼를 칠까? — 생명 게임 */
(() => {
  const root = document.getElementById("card-extra-life");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = root.querySelector("canvas");
  const sV = $(".v"), oV = $(".v-out"), bRun = $("[data-act=run]");
  const dGen = $(".d-gen"), dPop = $(".d-pop"), dState = $(".d-state");
  // 보이는 판 64×36 둘레에 보이지 않는 여유 칸을 두고, 맨 바깥 줄은 늘 비워 둔다
  const VW = 64, VH = 36, M = 10, W = VW + 2 * M, H = VH + 2 * M;
  let cur = new Uint8Array(W * H), nxt = new Uint8Array(W * H);
  let gen = 0, running = false, acc = 0, seen = new Map();

  const P = {
    glider: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
    r: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]],
    gun: [[24, 0], [22, 1], [24, 1], [12, 2], [13, 2], [20, 2], [21, 2], [34, 2], [35, 2], [11, 3], [15, 3], [20, 3], [21, 3], [34, 3], [35, 3],
      [0, 4], [1, 4], [10, 4], [16, 4], [20, 4], [21, 4], [0, 5], [1, 5], [10, 5], [14, 5], [16, 5], [17, 5], [22, 5], [24, 5],
      [10, 6], [16, 6], [24, 6], [11, 7], [15, 7], [12, 8], [13, 8]],
  };
  const idx = (x, y) => (y + M) * W + (x + M);
  function put(cells, ox, oy) { for (const [x, y] of cells) cur[idx(ox + x, oy + y)] = 1; }
  function load(name) {
    cur.fill(0); gen = 0; seen = new Map();
    if (name === "glider") { put(P.glider, 4, 4); put(P.glider, 20, 4); put(P.glider, 4, 18); }
    else if (name === "osc") {
      put([[0, 0], [1, 0], [2, 0]], 8, 8);                                  // 가로 셋
      put([[0, 0], [1, 0], [0, 1], [1, 1]], 20, 8);                        // 블록
      put([[1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1]], 32, 8);        // 두꺼비
      put([[0, 0], [1, 0], [0, 1], [3, 2], [2, 3], [3, 3]], 46, 7);        // 등대
      put([[1, 0], [0, 1], [2, 1], [1, 2]], 14, 22);                       // 통 모양 정물
      put([[0, 0], [1, 0], [0, 1], [2, 1], [1, 2]], 30, 22);               // 배 모양 정물
    }
    else if (name === "r") put(P.r, 31, 16);
    else if (name === "gun") put(P.gun, 2, 2);
    else if (name === "rand") { for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) cur[idx(x, y)] = Math.random() < 0.28 ? 1 : 0; }
    show();
  }
  function step() {
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const n = cur[i - W - 1] + cur[i - W] + cur[i - W + 1] + cur[i - 1] + cur[i + 1] + cur[i + W - 1] + cur[i + W] + cur[i + W + 1];
      nxt[i] = n === 3 || (n === 2 && cur[i]) ? 1 : 0;
    }
    [cur, nxt] = [nxt, cur]; gen++;
  }
  // 판의 상태를 짧은 지문으로 줄여, 같은 상태가 다시 나오면 주기를 알아낸다
  function hash() {
    let h = 2166136261 >>> 0, c = 0;
    for (let i = 0; i < cur.length; i++) if (cur[i]) { h = Math.imul(h ^ i, 16777619) >>> 0; c++; }
    return `${h}:${c}`;
  }

  const V = fit(cv, () => draw());
  function geom() {
    const { size: { w, h } } = V;
    const s = Math.min(w / VW, h / VH);
    return { s, ox: (w - s * VW) / 2, oy: (h - s * VH) / 2 };
  }
  function draw() {
    const { ctx, size: { w, h } } = V; if (!w) return;
    const { s, ox, oy } = geom();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.paper; ctx.fillRect(ox, oy, s * VW, s * VH);
    if (s >= 6) {
      ctx.strokeStyle = C.rule; ctx.lineWidth = 0.5; ctx.beginPath();
      for (let x = 0; x <= VW; x++) { ctx.moveTo(ox + x * s, oy); ctx.lineTo(ox + x * s, oy + VH * s); }
      for (let y = 0; y <= VH; y++) { ctx.moveTo(ox, oy + y * s); ctx.lineTo(ox + VW * s, oy + y * s); }
      ctx.stroke(); ctx.lineWidth = 1;
    }
    ctx.fillStyle = C.forest;
    for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) if (cur[idx(x, y)]) ctx.fillRect(ox + x * s + .5, oy + y * s + .5, s - 1, s - 1);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText(`${gen}세대`, w - 6, h - 4);
  }
  function show() {
    let pop = 0; for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) pop += cur[idx(x, y)];
    dGen.textContent = String(gen); dPop.textContent = String(pop);
    const k = hash();
    if (pop === 0) dState.textContent = "모두 사라짐";
    else if (seen.has(k)) { const p = gen - seen.get(k); dState.textContent = p === 1 ? "멈춰 있음" : `주기 ${p}로 되풀이`; }
    else dState.textContent = "변하는 중";
    if (!seen.has(k)) seen.set(k, gen);
    if (seen.size > 400) seen = new Map([[k, gen]]);
    draw();
  }
  function setRun(on) { running = on; bRun.textContent = on ? "멈춤" : "시작"; bRun.setAttribute("aria-pressed", String(on)); }

  loop(root, (dt) => {
    if (!running) return;
    acc += dt * +sV.value;
    let k = 0;
    while (acc >= 1 && k < 4) { step(); acc -= 1; k++; }
    if (k) show();
  });
  // 칸 누르기와 끌기: 처음 누른 칸의 반대 상태로 칠해 간다
  let paint = -1;
  function cellAt(e) {
    const r = cv.getBoundingClientRect(), { s, ox, oy } = geom();
    const x = Math.floor((e.clientX - r.left - ox) / s), y = Math.floor((e.clientY - r.top - oy) / s);
    return x >= 0 && x < VW && y >= 0 && y < VH ? [x, y] : null;
  }
  cv.addEventListener("pointerdown", (e) => {
    const c = cellAt(e); if (!c) return;
    cv.setPointerCapture(e.pointerId);
    paint = cur[idx(...c)] ? 0 : 1; cur[idx(...c)] = paint; seen = new Map(); show();
  });
  cv.addEventListener("pointermove", (e) => {
    if (paint < 0) return;
    const c = cellAt(e); if (c && cur[idx(...c)] !== paint) { cur[idx(...c)] = paint; show(); }
  });
  const end = () => { paint = -1; };
  cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
  cv.style.touchAction = "none"; cv.style.cursor = "pointer";

  sV.addEventListener("input", () => { oV.textContent = sV.value; });
  bRun.addEventListener("click", () => setRun(!running));
  $("[data-act=step]").addEventListener("click", () => { setRun(false); step(); show(); });
  $("[data-act=clear]").addEventListener("click", () => { setRun(false); cur.fill(0); gen = 0; seen = new Map(); show(); });
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll("[data-p]").forEach((z) => z.setAttribute("aria-pressed", String(z === b)));
    load(b.dataset.p);
  }));
  load("glider");
})();
