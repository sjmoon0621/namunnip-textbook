/* 카드: 같은 손님, 같은 계산원인데 줄 서는 방식만 바꾸면? — 따로 줄과 한 줄의 모의 실험 */
(() => {
  const root = document.getElementById("card-extra-queue");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = root.querySelector("canvas");
  const sL = $(".lam"), oL = $(".lam-out"), bRun = $("[data-act=run]");
  const dWs = $(".w-sep"), dWo = $(".w-one"), dMs = $(".m-sep"), dPass = $(".pass");
  const K = 3, SPEED = 2.5; // 화면 1초 = 2.5분
  const expo = (m) => -Math.log(1 - Math.random()) * m;
  let t, nextArr, id, running = true;
  let sep, one, stat;

  function reset() {
    t = 0; nextArr = expo(1 / +sL.value); id = 0;
    sep = { q: [[], [], []], busy: [null, null, null] };
    one = { q: [], busy: [null, null, null] };
    stat = { sep: [], one: [], pass: 0, served: 0 };
  }
  // 따로 줄: 손님 수가 가장 적은 줄(계산 중인 사람 포함)에 선다
  function arrive() {
    const c = { id: id++, at: t, svc: expo(1) };
    let best = 0, bl = Infinity;
    for (let k = 0; k < K; k++) { const l = sep.q[k].length + (sep.busy[k] ? 1 : 0); if (l < bl) { bl = l; best = k; } }
    sep.q[best].push({ ...c });
    one.q.push({ ...c });
  }
  function serve(sys, key) {
    for (let k = 0; k < K; k++) {
      const b = sys.busy[k];
      if (b && t >= b.end) sys.busy[k] = null;
      if (!sys.busy[k]) {
        const q = key === "sep" ? sys.q[k] : sys.q;
        if (q.length) {
          const c = q.shift();
          c.end = t + c.svc; sys.busy[k] = c;
          stat[key].push(t - c.at);
          if (key === "sep") {
            stat.served++;
            // 이 손님보다 먼저 온 사람이 다른 줄에서 아직 기다리면 '늦게 와서 먼저 계산'
            if (sep.q.some((qq) => qq.some((o) => o.at < c.at))) stat.pass++;
          }
        }
      }
    }
  }
  function step(dtMin) {
    const end = t + dtMin;
    while (t < end) {
      const h = Math.min(0.02, end - t); t += h;
      while (t >= nextArr) { arrive(); nextArr += expo(1 / +sL.value); }
      serve(sep, "sep"); serve(one, "one");
    }
  }
  const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

  const V = fit(cv, () => draw());
  function person(ctx, x, y, c, r) {
    const hue = (c.id * 47) % 360;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue} 55% 55%)`; ctx.fill();
  }
  function draw() {
    const { ctx, size: { w, h } } = V; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = Math.max(3, Math.min(6, h / 40)), gap = r * 2.6;
    const half = h / 2, regX = w - 46;
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("계산대마다 따로 줄", 6, 13); ctx.fillText("한 줄로 서서 빈 곳으로", 6, half + 13);
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(0, half); ctx.lineTo(w, half); ctx.stroke();
    for (let k = 0; k < K; k++) {
      // 위: 따로 줄
      const y = 30 + k * (half - 40) / 2;
      ctx.fillStyle = C.paper; ctx.fillRect(regX, y - 9, 30, 18); ctx.strokeStyle = C.ink2; ctx.strokeRect(regX, y - 9, 30, 18);
      if (sep.busy[k]) person(ctx, regX + 15, y, sep.busy[k], r);
      sep.q[k].forEach((c, i) => { const x = regX - 14 - i * gap; if (x > 8) person(ctx, x, y, c, r); });
      // 아래: 계산대 셋
      const y2 = half + 30 + k * (half - 40) / 2;
      ctx.fillStyle = C.paper; ctx.fillRect(regX, y2 - 9, 30, 18); ctx.strokeStyle = C.ink2; ctx.strokeRect(regX, y2 - 9, 30, 18);
      if (one.busy[k]) person(ctx, regX + 15, y2, one.busy[k], r);
    }
    const ym = half + 30 + (half - 40) / 2;
    one.q.forEach((c, i) => { const x = regX - 24 - i * gap; if (x > 8) person(ctx, x, ym, c, r); });
    ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText(`${t.toFixed(0)}분`, w - 6, h - 6);
  }
  function show() {
    const ws = mean(stat.sep), wo = mean(stat.one);
    dWs.textContent = `${ws.toFixed(1)}분`; dWo.textContent = `${wo.toFixed(1)}분`;
    dWs.classList.toggle("bad", ws > wo * 1.5 && stat.sep.length > 20);
    dMs.textContent = stat.sep.length ? `${Math.max(...stat.sep).toFixed(1)}분` : "—";
    dPass.textContent = stat.served ? `${Math.round(100 * stat.pass / stat.served)}%` : "—";
  }
  loop(cv, (dt) => {
    if (!running) return false;
    step(dt * SPEED); draw(); show();
    if (t > 600) { running = false; bRun.textContent = "계속"; bRun.setAttribute("aria-pressed", "false"); }
  });
  sL.addEventListener("input", () => { oL.textContent = (+sL.value).toFixed(1); });
  sL.addEventListener("change", () => { reset(); draw(); show(); });
  bRun.addEventListener("click", () => {
    running = !running;
    bRun.textContent = running ? "멈춤" : "계속";
    bRun.setAttribute("aria-pressed", running ? "true" : "false");
  });
  $("[data-act=reset]").addEventListener("click", () => { reset(); draw(); show(); });
  reset();
  if (NM.reduce) { running = false; bRun.textContent = "계속"; step(120); draw(); show(); }
})();
