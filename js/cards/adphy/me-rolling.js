/* 카드: 같은 비탈에서 굴렸는데 왜 도착 순서가 다를까? — a = g sinθ/(1 + I/mR²)로 다섯 물체의 경주와 회전 에너지 비율 */
(() => {
  const root = document.getElementById("card-adphy-rolling");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA = $(".ang"), sK = $(".k"), oA = $(".a-out"), oK = $(".k-out"), bGo = $(".go");
  const nG = $(".n-g"), nA = $(".n-a"), nT = $(".n-t"), nR = $(".n-r");
  const g = 9.8, L = 2.0, SLOW = 0.5;
  const OBJ = [
    { name: "상자 (미끄러짐)", b: 0, kind: "box", col: "#8d8d92" },
    { name: "속 찬 공", b: 0.4, kind: "ball", col: "#3f6fa3" },
    { name: "원판", b: 0.5, kind: "disk", col: "#3b7c2a" },
    { name: "고리", b: 1, kind: "ring", col: "#b5532f" },
    { name: "내 바퀴", b: 0.3, kind: "mine", col: "#e0a02a" },
  ];
  let t = 0;
  const acc = (b) => g * Math.sin(+sA.value * Math.PI / 180) / (1 + b);
  const tEnd = (b) => Math.sqrt(2 * L / acc(b));

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    OBJ[4].b = +sK.value;
    const lx = 74, tx0 = lx + 12, tx1 = w * 0.7, bx0 = w * 0.75, bx1 = w - 8;
    const top = 44, rowH = (h - top - 10) / OBJ.length, r = Math.min(10, rowH * 0.32);
    /* 비탈 아이콘 */
    const th = +sA.value * Math.PI / 180, ix = 8, iy = 32, iw = 52;
    ctx.fillStyle = "#e7e9e1"; ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + iw, iy); ctx.lineTo(ix, iy - iw * Math.tan(th) * 0.6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("비탈을 따라 편 트랙 (2.0 m)", tx0, 16);
    ctx.fillText("운동 에너지: 병진 | 회전", bx0, 16);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText(`t = ${t.toFixed(2)} s`, tx0, 32);
    const order = OBJ.map((o, i) => [tEnd(o.b), i]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
    OBJ.forEach((o, i) => {
      const cy = top + rowH * (i + 0.5);
      ctx.fillStyle = C.ink; ctx.font = `11.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(o.name, lx, cy + 4);
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx0, cy + r + 1); ctx.lineTo(tx1, cy + r + 1); ctx.stroke();
      const te = tEnd(o.b), s = Math.min(L, 0.5 * acc(o.b) * t * t), x = tx0 + r + s / L * (tx1 - tx0 - 2 * r);
      const phi = (x - tx0 - r) / r;
      ctx.save(); ctx.translate(x, cy);
      if (o.kind === "box") { ctx.fillStyle = o.col; ctx.fillRect(-r, -r, 2 * r, 2 * r); }
      else {
        ctx.rotate(phi);
        if (o.kind === "ring") { ctx.strokeStyle = o.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r - 1.5, 0, Math.PI * 2); ctx.stroke(); }
        else if (o.kind === "ball") { ctx.fillStyle = o.col; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); }
        else if (o.kind === "disk") { ctx.fillStyle = o.col; ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
        else {
          ctx.strokeStyle = o.col; ctx.lineWidth = 1 + 3 * o.b; ctx.beginPath(); ctx.arc(0, 0, r - 1.5, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = o.col; ctx.globalAlpha = 0.25 + 0.6 * (1 - o.b); ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r - 2, 0); ctx.stroke();
        if (o.kind === "ring" || o.kind === "mine") { ctx.strokeStyle = o.col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r - 2, 0); ctx.stroke(); }
      }
      ctx.restore();
      if (t >= te) { ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`${order.indexOf(i) + 1}등 ${te.toFixed(2)} s`, tx1, cy - r - 3); }
      /* 에너지 막대 */
      const fr = o.b / (1 + o.b), bw = bx1 - bx0, bh = Math.min(12, rowH * 0.45);
      ctx.fillStyle = "#c9d8e8"; ctx.fillRect(bx0, cy - bh / 2, bw * (1 - fr), bh);
      ctx.fillStyle = o.col; ctx.fillRect(bx0 + bw * (1 - fr), cy - bh / 2, bw * fr, bh);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`회전 ${(fr * 100).toFixed(0)}%`, bx1, cy + bh / 2 + 11);
    });
    ctx.strokeStyle = C.warn; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(tx1, top - 4); ctx.lineTo(tx1, h - 8); ctx.stroke(); ctx.setLineDash([]);
  }
  function update() {
    const b = +sK.value; OBJ[4].b = b;
    oA.textContent = sA.value; oK.textContent = b.toFixed(2);
    nG.textContent = `${(g * Math.sin(+sA.value * Math.PI / 180)).toFixed(2)} m/s²`;
    nA.textContent = `${acc(b).toFixed(2)} m/s²`;
    nT.textContent = `${tEnd(b).toFixed(2)} s`;
    nR.textContent = `${(b / (1 + b) * 100).toFixed(0)} %`;
    draw();
  }
  loop(cv, (dt) => {
    const tmax = Math.max(...OBJ.map((o) => tEnd(o.b)));
    if (t >= tmax) return;
    t = Math.min(tmax, t + dt * SLOW); draw();
  });
  bGo.addEventListener("click", () => { t = 0; draw(); });
  sA.addEventListener("input", () => { t = 0; update(); });
  sK.addEventListener("input", () => { t = 0; update(); });
  update();
})();
