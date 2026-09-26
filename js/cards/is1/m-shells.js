/* 카드 2.3.1: 주기율표는 왜 이런 모양일까? — 전자 껍질, 주기율표 자리, 이온화 에너지 */
(() => {
  const root = document.getElementById("card-is1-shells");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), slider = $(".z"), zOut = $(".z-out");
  const oConf = $(".conf"), oVal = $(".val"), oPG = $(".pg");

  const EL = [
    ["H", "수소"], ["He", "헬륨"], ["Li", "리튬"], ["Be", "베릴륨"], ["B", "붕소"], ["C", "탄소"], ["N", "질소"], ["O", "산소"], ["F", "플루오린"], ["Ne", "네온"],
    ["Na", "나트륨"], ["Mg", "마그네슘"], ["Al", "알루미늄"], ["Si", "규소"], ["P", "인"], ["S", "황"], ["Cl", "염소"], ["Ar", "아르곤"], ["K", "칼륨"], ["Ca", "칼슘"],
  ];
  // 첫 번째 이온화 에너지 (kJ/mol, 실측)
  const IE = [1312, 2372, 520, 900, 801, 1086, 1402, 1314, 1681, 2081, 496, 738, 578, 787, 1012, 1000, 1251, 1521, 419, 590];

  const conf = (Z) => { const c = []; let r = Z; for (const cap of [2, 8, 8, 2]) { if (r <= 0) break; c.push(Math.min(cap, r)); r -= cap; } return c; };
  const group = (Z) => { const c = conf(Z), v = c[c.length - 1], p = c.length; if (Z === 2) return 18; if (p === 1) return 1; return v <= 2 ? v : v + 10; };
  const valence = (Z) => group(Z) === 18 ? 0 : conf(Z).at(-1);

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520;
    const Z = +slider.value, c = conf(Z), g = group(Z);
    const split = Math.round(w * 0.38);
    const tx = 18, tw = w - tx - 4, cw = tw / 18, chh = Math.min(cw * 0.9, 24), ty = 20, tb = ty + 4 * chh + 8;

    // ── 전자 껍질 모형
    const cx = split / 2, cy = tb + (h - tb) / 2 + 4, Rmax = Math.min(split / 2 - 6, (h - tb) / 2 - 8);
    const nuc = Math.max(9, Rmax * 0.16);
    for (let i = 0; i < 4; i++) {
      const r = nuc + (Rmax - nuc) * (i + 1) / 4;
      ctx.strokeStyle = i < c.length ? "rgba(35,35,38,.45)" : "rgba(35,35,38,.1)"; ctx.lineWidth = 1;
      ctx.setLineDash(i < c.length ? [] : [2, 3]);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      if (i >= c.length) continue;
      const n = c[i], outer = i === c.length - 1;
      for (let k = 0; k < n; k++) {
        const a = -Math.PI / 2 + k * 2 * Math.PI / n + i * 0.3;
        ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), small ? 3.2 : 4, 0, Math.PI * 2);
        ctx.fillStyle = outer && g !== 18 ? C.amber : C.ink2; ctx.fill();
      }
    }
    ctx.beginPath(); ctx.arc(cx, cy, nuc, 0, Math.PI * 2); ctx.fillStyle = C.apple; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `600 ${small ? 9.5 : 11}px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(`+${Z}`, cx, cy + 4);
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`${EL[Z - 1][1]} ${EL[Z - 1][0]}`, 4, tb + 12);

    // ── 주기율표 (1~20번)
    ctx.font = `${small ? 9 : 11}px ${F.mono}`;
    for (let z = 1; z <= 20; z++) {
      const cz = conf(z), p = cz.length, gz = group(z);
      const x = tx + (gz - 1) * cw, y = ty + (p - 1) * chh;
      const cur = z === Z;
      ctx.fillStyle = cur ? C.ink : z < Z ? "#e6ecdf" : "#f1f1ec";
      ctx.fillRect(x + .5, y + .5, cw - 1, chh - 1);
      ctx.strokeStyle = cur ? C.ink : C.rule; ctx.strokeRect(x + .5, y + .5, cw - 1, chh - 1);
      ctx.fillStyle = cur ? C.paper : z <= Z ? C.ink : C.ink3; ctx.textAlign = "center";
      ctx.fillText(EL[z - 1][0], x + cw / 2, y + chh / 2 + 4);
    }
    // 가운데 빈 칸 (3~12족)
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.rule;
    ctx.strokeRect(tx + 2 * cw + .5, ty + 3 * chh + .5, 10 * cw - 1, chh - 1); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.font = `${small ? 8.5 : 9.5}px ${F.mono}`;
    ctx.fillText("21번부터 채워지는 3~12족", tx + 7 * cw, ty + 3.5 * chh + 3);
    ctx.textAlign = "right";
    for (let p = 1; p <= 4; p++) ctx.fillText(p, tx - 2, ty + (p - .5) * chh + 3);

    // ── 이온화 에너지 그래프
    const gx = split + 34, gy = tb + 22, gw = w - gx - 8, gh = h - gy - 22;
    const X = (z) => gx + (z - 1) / 19 * gw, Y = (v) => gy + (1 - v / 2500) * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [[2, "He"], [10, "Ne"], [18, "Ar"]], yt: [[0, "0"], [1000, "1000"], [2000, "2000"]], ylabel: "이온화 에너지 (kJ/mol) · 주황 점 = 1족" });
    ctx.beginPath();
    for (let z = 1; z <= Z; z++) z === 1 ? ctx.moveTo(X(z), Y(IE[0])) : ctx.lineTo(X(z), Y(IE[z - 1]));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.stroke();
    for (let z = 1; z <= 20; z++) {
      ctx.beginPath(); ctx.arc(X(z), Y(IE[z - 1]), z === Z ? 4.5 : 2.4, 0, Math.PI * 2);
      ctx.fillStyle = z === Z ? C.apple : z < Z ? (group(z) === 1 ? C.amber : C.ink2) : "rgba(141,141,146,.3)";
      ctx.fill();
    }
    ctx.textAlign = "left";
  }

  function update() {
    const Z = +slider.value, c = conf(Z), g = group(Z);
    zOut.textContent = `${Z} (${EL[Z - 1][1]})`;
    oConf.textContent = c.join(", ");
    oVal.textContent = `${valence(Z)}개`;
    oPG.textContent = `${c.length}주기 ${g}족`;
    draw();
  }
  slider.addEventListener("input", update);
  $(".z-prev").addEventListener("click", () => { slider.value = Math.max(1, +slider.value - 1); update(); });
  $(".z-next").addEventListener("click", () => { slider.value = Math.min(20, +slider.value + 1); update(); });
  update();
})();
