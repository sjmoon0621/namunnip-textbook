/* 카드: 기린은 필요해서 목이 길어졌을까? — 두 가설을 나란히 돌려 보기 (모식) */
(() => {
  const root = document.getElementById("card-is2-lamarck");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const acqT = $(".acq"), varT = $(".var"), stepB = $(".step"), resetB = $(".reset");
  const nGen = $(".gen"), nL = $(".ml"), nD = $(".md"), msg = $(".msg");

  const N = 10, STRETCH = 3; // 한평생 목을 뻗어 늘어나는 길이 (상대값, 가정)
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };

  let gen = 0, L = [], D = [], Dalive = [], histL = [], histD = [];
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  function reset() {
    seed = 11; gen = 0;
    L = Array.from({ length: N }, () => 100);                         // 가설 1: 차이가 없어도 된다
    D = Array.from({ length: N }, () => varT.checked ? 100 + 6 * gauss() : 100); // 가설 2: 태어날 때부터 차이
    Dalive = D.map(() => true);
    histL = [100]; histD = [mean(D)];
    update();
  }
  function step() {
    // 가설 1: 모두 목을 뻗어 늘어나고, 그 결과가 자식에게 전해진다(획득 형질 유전을 가정할 때)
    L = L.map((b) => acqT.checked ? b : b + STRETCH);
    // 가설 2: 높은 잎에 닿는 개체가 더 많이 살아남아 번식
    const thr = mean(D) + 2;
    Dalive = D.map((b) => rnd() < 1 / (1 + Math.exp(-(b - thr) / 2.5)));
    if (!Dalive.some(Boolean)) Dalive[D.indexOf(Math.max(...D))] = true;
    const parents = D.filter((_, i) => Dalive[i]);
    D = Array.from({ length: N }, () => { const p = parents[Math.floor(rnd() * parents.length)]; return varT.checked ? p + 2.5 * gauss() : p; });
    gen++; histL.push(mean(L)); histD.push(mean(D));
    update(true);
  }

  const { ctx, size } = fit(cv, () => draw());
  let showSurv = false;

  function giraffe(x, base, neck, stretch, sc, faded) {
    ctx.save(); ctx.globalAlpha = faded ? 0.25 : 1;
    const bw = 16, bh = 10, leg = 14;
    ctx.strokeStyle = "#8a5a2b"; ctx.lineWidth = 2;
    for (const dx of [-bw * .35, bw * .35]) { ctx.beginPath(); ctx.moveTo(x + dx, base); ctx.lineTo(x + dx, base - leg); ctx.stroke(); }
    ctx.fillStyle = "#d9a441"; ctx.beginPath(); ctx.ellipse(x, base - leg - bh / 2, bw / 2, bh / 2, 0, 0, Math.PI * 2); ctx.fill();
    const nx = x + bw * .35, ny = base - leg - bh * .6, top = ny - (neck - 70) * sc;
    ctx.strokeStyle = "#d9a441"; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx, top); ctx.stroke();
    if (stretch > 0) { ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(nx, top + stretch * sc); ctx.lineTo(nx, top); ctx.stroke(); }
    ctx.fillStyle = "#c48f33"; ctx.beginPath(); ctx.ellipse(nx + 4, top, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 480;
    const laneH = narrow ? h * 0.36 : h * 0.62;
    const lanes = narrow
      ? [{ x: 0, y: 0, w, h: laneH }, { x: 0, y: laneH, w, h: laneH }]
      : [{ x: 0, y: 0, w: w / 2 - 6, h: laneH }, { x: w / 2 + 6, y: 0, w: w / 2 - 6, h: laneH }];
    const titles = ["가설 1 · 쓰면 늘어나고, 늘어난 채로 물려준다", "가설 2 · 타고난 차이 중 살아남은 쪽이 물려준다"];
    const allMax = Math.max(130, ...L.map((v) => v + STRETCH), ...D);
    lanes.forEach((ln, k) => {
      ctx.fillStyle = k ? "#eef4ea" : "#f6efe7"; ctx.fillRect(ln.x, ln.y + 18, ln.w, ln.h - 20);
      ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(titles[k], ln.x + 4, ln.y + 13);
      const base = ln.y + ln.h - 8, sc = (ln.h - 88) / (allMax - 70);
      const arr = k ? D : L, gap = ln.w / (N + 0.5);
      arr.forEach((v, i) => {
        const x = ln.x + gap * (i + .75);
        if (k === 0) giraffe(x, base, v + STRETCH, STRETCH, sc, false);
        else giraffe(x, base, v, 0, sc, false);
      });
      if (k === 0) {
        ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "left";
        ctx.fillText(acqT.checked ? "빨간 부분: 살면서 늘어난 목 (자식에게 안 전해짐)" : "빨간 부분: 살면서 늘어난 목 (자식에게 전해진다고 가정)", ln.x + 6, ln.y + 32);
      }
      if (k === 1 && showSurv) { ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText(`지난 세대 ${N}마리 중 ${Dalive.filter(Boolean).length}마리만 높은 잎에 닿아 번식`, ln.x + 6, ln.y + 32); }
    });
    // 아래: 평균 목 길이의 변화
    const gy = narrow ? laneH * 2 + 24 : laneH + 26, gx = 40, gw = w - gx - 12, gh = h - gy - 24;
    const G = Math.max(10, gen);
    const vmin = 95, vmax = Math.max(130, ...histL, ...histD) + 5;
    const X = (g) => gx + g / G * gw, Y = (v) => gy + (1 - (v - vmin) / (vmax - vmin)) * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [[0, "0"], [G, `${G}세대`]], yt: [[100, "100"], [Math.round((vmax - 5) / 10) * 10, `${Math.round((vmax - 5) / 10) * 10}`]], ylabel: "평균 목 길이 (상대값)" });
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("위 그림의 목은 길이 차이가 잘 보이도록 70부터 그림", gx + 110, gy - 7);
    for (const [hs, col] of [[histL, C.warn], [histD, C.forest]]) {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); hs.forEach((v, g) => g ? ctx.lineTo(X(g), Y(v)) : ctx.moveTo(X(g), Y(v))); ctx.stroke();
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillStyle = C.warn; ctx.fillText("가설 1", gx + gw, gy + 10); ctx.fillStyle = C.forest; ctx.fillText("가설 2", gx + gw, gy + 24);
  }

  function update(stepped) {
    showSurv = !!stepped;
    nGen.textContent = gen;
    nL.textContent = mean(L).toFixed(1); nD.textContent = mean(D).toFixed(1);
    const a = acqT.checked, v = varT.checked;
    msg.textContent = a && !v ? "두 가설 모두 목이 길어지지 않습니다. 쓰임새만으로도, 차이 없는 선택으로도 바뀔 것이 없습니다."
      : a ? "부모가 살면서 얻은 변화가 전해지지 않으면 가설 1로는 목이 길어지지 않습니다. 가설 2는 여전히 길어집니다."
      : !v ? "개체 사이에 차이가 없으면 골라낼 것이 없어 가설 2는 멈춥니다."
      : "두 가설 모두 목이 길어지는 결과를 냅니다. 결과만 봐서는 어느 쪽이 옳은지 가릴 수 없습니다.";
    draw();
  }
  stepB.addEventListener("click", step);
  resetB.addEventListener("click", reset);
  [acqT, varT].forEach((el) => el.addEventListener("change", reset));
  reset();
})();
