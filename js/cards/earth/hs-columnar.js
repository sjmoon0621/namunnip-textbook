/* 카드: 용암은 어떻게 육각기둥이 될까? — 주상 절리의 균열 무늬 (모식) */
(() => {
  const root = document.getElementById("card-earth-columnar");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sIt = $(".iter"), sN = $(".rate"), oIt = $(".iter-out"), oN = $(".rate-out");
  const nHex = $(".nhex"), nMean = $(".nmean"), nLen = $(".nlen");

  const G = 150; // 계산 격자 (위아래·좌우가 이어진 판)
  let cache = null, cacheN = 0, label = null, sides = [];
  let seed = 3;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const wrap = (d) => d > G / 2 ? d - G : d < -G / 2 ? d + G : d;

  function assign(pts) {
    const lab = new Int16Array(G * G), n = pts.length;
    const sx = new Float64Array(n), sy = new Float64Array(n), cnt = new Int32Array(n);
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
      let b = 0, bd = 1e9;
      for (let i = 0; i < n; i++) {
        const dx = wrap(x + .5 - pts[i][0]), dy = wrap(y + .5 - pts[i][1]), d = dx * dx + dy * dy;
        if (d < bd) { bd = d; b = i; }
      }
      lab[y * G + x] = b; sx[b] += wrap(x + .5 - pts[b][0]); sy[b] += wrap(y + .5 - pts[b][1]); cnt[b]++;
    }
    const next = pts.map((p, i) => cnt[i] ? [(p[0] + sx[i] / cnt[i] + G) % G, (p[1] + sy[i] / cnt[i] + G) % G] : p);
    return { lab, next };
  }
  function build() {
    const n = +sN.value;
    if (cache && cacheN === n) return;
    seed = 3 + n; cacheN = n;
    let pts = Array.from({ length: n }, () => [rnd() * G, rnd() * G]);
    cache = [];
    for (let k = 0; k <= 12; k++) { const r = assign(pts); cache.push({ pts, lab: r.lab }); pts = r.next; }
  }
  function countSides(lab, n) {
    const nb = Array.from({ length: n }, () => new Set());
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
      const a = lab[y * G + x], r = lab[y * G + (x + 1) % G], d = lab[((y + 1) % G) * G + x], dr = lab[((y + 1) % G) * G + (x + 1) % G];
      if (a !== r) { nb[a].add(r); nb[r].add(a); }
      if (a !== d) { nb[a].add(d); nb[d].add(a); }
      if (a !== dr && r !== d) { nb[a].add(dr); nb[dr].add(a); }
    }
    return nb.map((s) => s.size);
  }

  const off = document.createElement("canvas"); off.width = G; off.height = G;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w || !label) return;
    ctx.clearRect(0, 0, w, h);
    const sq = Math.min(h - 28, w * 0.56), sx = 6, sy = 20;
    const oc = off.getContext("2d"), img = oc.createImageData(G, G), d = img.data;
    const tint = { 4: [150, 146, 136], 5: [118, 116, 110], 6: [86, 88, 86], 7: [64, 70, 78], 8: [52, 58, 70] };
    for (let i = 0; i < G * G; i++) {
      const a = label[i], x = i % G, y = (i / G) | 0;
      const edge = a !== label[y * G + (x + 1) % G] || a !== label[((y + 1) % G) * G + x];
      const c = edge ? [236, 232, 220] : tint[Math.max(4, Math.min(8, sides[a]))];
      d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255;
    }
    oc.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, sx, sy, sq, sq);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(sx + .5, sy + .5, sq, sq);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("위에서 본 기둥 단면 (모식)", sx, 12);
    // 변의 수 막대그래프
    const tx = sx + sq + 30, tw = w - tx - 10, by = sy + sq - 22, bh = sq - 60;
    const hist = [4, 5, 6, 7, 8].map((k) => sides.filter((s) => (k === 4 ? s <= 4 : k === 8 ? s >= 8 : s === k)).length / sides.length);
    ctx.fillText("기둥 단면의 변 수", tx, sy + 8);
    const bw = tw / 5;
    hist.forEach((v, i) => {
      const k = i + 4, x = tx + i * bw, hh = v * bh;
      ctx.fillStyle = `rgb(${tint[k]})`; ctx.fillRect(x + 4, by - hh, bw - 8, hh);
      ctx.fillStyle = C.ink2; ctx.textAlign = "center";
      ctx.fillText(k === 4 ? "≤4" : k === 8 ? "≥8" : String(k), x + bw / 2, by + 14);
      ctx.fillText(`${Math.round(v * 100)}%`, x + bw / 2, by - hh - 5);
    });
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(tx, by + .5); ctx.lineTo(tx + tw, by + .5); ctx.stroke();
    ctx.textAlign = "left";
  }

  function update() {
    build();
    const k = +sIt.value, st = cache[k];
    label = st.lab; sides = countSides(label, st.pts.length);
    oIt.textContent = k === 0 ? "갓 생긴 균열" : k < 4 ? "조금 자람" : k < 9 ? "많이 자람" : "충분히 자람";
    oN.textContent = +sN.value < 60 ? "느림 · 굵은 기둥" : +sN.value < 110 ? "중간" : "빠름 · 가는 기둥";
    const six = sides.filter((s) => s === 6).length / sides.length, mean = sides.reduce((a, b) => a + b, 0) / sides.length;
    nHex.textContent = `${Math.round(six * 100)}%`;
    nMean.textContent = mean.toFixed(2);
    // 같은 넓이일 때 균열 길이: 격자 무늬별 (둘레 / 2 / 넓이) — 정육각형 대비
    const per = { tri: 3 * Math.sqrt(4 / Math.sqrt(3)) / 2, sq: 2, hex: 6 * Math.sqrt(2 / (3 * Math.sqrt(3))) / 2 };
    const act = root.querySelector("[data-tile][aria-pressed='true']");
    const t = act ? act.dataset.tile : "hex";
    nLen.textContent = `${(per[t] / per.hex).toFixed(3)} 배`;
    draw();
  }
  root.querySelectorAll("[data-tile]").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll("[data-tile]").forEach((q) => q.setAttribute("aria-pressed", q === b ? "true" : "false")); update();
  }));
  sIt.addEventListener("input", update);
  sN.addEventListener("change", update);
  sN.addEventListener("input", () => { oN.textContent = +sN.value < 60 ? "느림 · 굵은 기둥" : +sN.value < 110 ? "중간" : "빠름 · 가는 기둥"; });
  update();
})();
