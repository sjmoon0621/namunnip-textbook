/* 카드: 전이 원소의 전자 배치는 전형 원소와 무엇이 다를까? — 주기율표(1~54번)에서 원자·이온의 바닥 상태 배치 */
(() => {
  const root = document.getElementById("card-adchem-config");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const SYM = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe".split(" ");
  const KO = "수소 헬륨 리튬 베릴륨 붕소 탄소 질소 산소 플루오린 네온 나트륨 마그네슘 알루미늄 규소 인 황 염소 아르곤 칼륨 칼슘 스칸듐 타이타늄 바나듐 크로뮴 망가니즈 철 코발트 니켈 구리 아연 갈륨 저마늄 비소 셀레늄 브로민 크립톤 루비듐 스트론튬 이트륨 지르코늄 나이오븀 몰리브데넘 테크네튬 루테늄 로듐 팔라듐 은 카드뮴 인듐 주석 안티모니 텔루륨 아이오딘 제논".split(" ");
  const ORDER = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p"];
  const CAP = { s: 2, p: 6, d: 10 }, LV = { s: 0, p: 1, d: 2 };
  const EXC = { 24: { "3d": 5, "4s": 1 }, 29: { "3d": 10, "4s": 1 }, 41: { "4d": 4, "5s": 1 }, 42: { "4d": 5, "5s": 1 }, 44: { "4d": 7, "5s": 1 }, 45: { "4d": 8, "5s": 1 }, 46: { "4d": 10, "5s": 0 }, 47: { "4d": 10, "5s": 1 } };
  const NOBLE = [[2, "He"], [10, "Ne"], [18, "Ar"], [36, "Kr"]];
  let Z = 26, q = 0;

  const pos = (z) => {
    if (z <= 2) return [1, z === 1 ? 1 : 18];
    if (z <= 18) { const p = z <= 10 ? 2 : 3, i = z - (p === 2 ? 2 : 10); return [p, i <= 2 ? i : i + 10]; }
    return z <= 36 ? [4, z - 18] : [5, z - 36];
  };
  const block = (z) => { const g = pos(z)[1]; return g <= 2 || z === 2 ? "s" : g >= 13 ? "p" : "d"; };
  function neutral(z) {
    const c = {}; let e = z;
    for (const o of ORDER) { const k = Math.min(e, CAP[o[1]]); c[o] = k; e -= k; }
    if (EXC[z]) Object.assign(c, EXC[z]);
    return c;
  }
  function ion(z, charge) {
    const c = neutral(z);
    if (charge > 0) {
      for (let k = 0; k < charge; k++) {
        const occ = ORDER.filter((o) => c[o] > 0);
        if (!occ.length) return null;
        occ.sort((a, b) => (+b[0] - +a[0]) || (LV[b[1]] - LV[a[1]]));
        c[occ[0]]--;
      }
    } else if (charge < 0) {
      for (let k = 0; k < -charge; k++) { const o = ORDER.find((x) => c[x] < CAP[x[1]]); if (!o) return null; c[o]++; }
    }
    return c;
  }
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (k) => String(k).split("").map((d) => SUP[+d]).join("");
  const byN = (a, b) => (+a[0] - +b[0]) || (LV[a[1]] - LV[b[1]]);
  function coreOf(c) {
    let best = null;
    for (const [nz, s] of NOBLE) {
      const nc = neutral(nz);
      if (ORDER.every((o) => !nc[o] || c[o] === nc[o])) {
        /* 코어 밖에 전자가 하나라도 있어야 코어 표기 */
        const rest = ORDER.filter((o) => c[o] > 0 && !nc[o]);
        if (rest.length) best = [nz, s, nc];
      }
    }
    return best;
  }
  function cfgString(c, fillOrder) {
    const core = coreOf(c), keys = ORDER.filter((o) => c[o] > 0 && !(core && core[2][o]));
    if (!fillOrder) keys.sort(byN);
    return (core ? `[${core[1]}] ` : "") + keys.map((o) => o + sup(c[o])).join(" ");
  }
  const unpaired = (c) => ORDER.reduce((s, o) => { const m = CAP[o[1]] / 2, k = c[o]; return s + (k <= m ? k : 2 * m - k); }, 0);
  function shown(z, c) {
    const [p] = pos(z), list = [`${p}s`];
    if (p >= 4) list.push(`${p - 1}d`);
    if (p >= 2) list.push(`${p}p`);
    ORDER.forEach((o) => { if (c[o] > 0 && !list.includes(o)) { const core = coreOf(c); if (!core || !core[2][o]) list.push(o); } });
    return list.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  }

  const { ctx, size } = fit(cv, () => draw());
  let cell = 0, tx0 = 0, ty0 = 0;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    cell = Math.min((w - 4) / 18, 28, (h - 104) / 5); tx0 = (w - cell * 18) / 2; ty0 = 4;
    const col = { s: "#f3d9c9", p: "#d8e8cf", d: "#d6e2f0" };
    for (let z = 1; z <= 54; z++) {
      const [p, g] = pos(z), x = tx0 + (g - 1) * cell, y = ty0 + (p - 1) * cell;
      ctx.fillStyle = z === Z ? C.ink : col[block(z)]; ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
      if (EXC[z]) { ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.strokeRect(x + 1.8, y + 1.8, cell - 3.6, cell - 3.6); }
      ctx.fillStyle = z === Z ? "#fff" : C.ink; ctx.font = `${Math.max(8, cell * 0.38)}px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(SYM[z - 1], x + cell / 2, y + cell * 0.66);
    }
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    const ly = ty0 + 5 * cell + 14;
    [["s 구역", col.s], ["d 구역 (전이 원소)", col.d], ["p 구역", col.p]].forEach(([t, c], i) => {
      const x = tx0 + [0, 70, 200][i]; ctx.fillStyle = c; ctx.fillRect(x, ly - 9, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText(t, x + 14, ly);
    });
    /* 오비탈 상자 */
    const c = ion(Z, q), by0 = ly + 22;
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "left";
    const label = `${KO[Z - 1]} ${SYM[Z - 1]}${q ? (Math.abs(q) > 1 ? Math.abs(q) : "") + (q > 0 ? "+" : "−") : ""}  (전자 ${Z - q}개)`;
    ctx.fillText(label, 6, by0);
    if (!c) { ctx.fillStyle = C.warn; ctx.font = `12px ${F.sans}`; ctx.fillText("전자가 부족해 만들 수 없는 이온입니다.", 6, by0 + 24); return; }
    const core = coreOf(c), list = shown(Z, c);
    let x = 6;
    const nbox = list.reduce((s2, o) => s2 + CAP[o[1]] / 2, 0), bw = Math.min(30, (w - 70 - list.length * 12) / nbox), bh = bw * 1.15, yb = by0 + 30;
    if (core) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x + .5, yb + .5, 42, bh);
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`[${core[1]}]`, x + 21, yb + bh / 2 + 4); x += 52;
    }
    list.forEach((o) => {
      const m = CAP[o[1]] / 2, k = c[o] || 0, y = yb;
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(o, x + m * bw / 2, y - 6);
      for (let i = 0; i < m; i++) {
        const bx = x + i * bw; ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, y + .5, bw, bh);
        const up = k > i, dn = k > m + i;
        ctx.lineWidth = 1.8;
        if (up) { ctx.strokeStyle = C.forest; ctx.beginPath(); ctx.moveTo(bx + bw * 0.34, y + bh * 0.82); ctx.lineTo(bx + bw * 0.34, y + bh * 0.18); ctx.lineTo(bx + bw * 0.2, y + bh * 0.36); ctx.stroke(); }
        if (dn) { ctx.strokeStyle = C.apple; ctx.beginPath(); ctx.moveTo(bx + bw * 0.66, y + bh * 0.18); ctx.lineTo(bx + bw * 0.66, y + bh * 0.82); ctx.lineTo(bx + bw * 0.8, y + bh * 0.64); ctx.stroke(); }
      }
      x += m * bw + 12;
    });
  }
  function update() {
    root.querySelectorAll("[data-q]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.q === q)));
    const c = ion(Z, q), bl = block(Z), [p, g] = pos(Z);
    if (!c) { $(".cfg").textContent = "—"; $(".cfg2").textContent = ""; draw(); return; }
    $(".cfg").textContent = cfgString(c, false);
    $(".cfg2").textContent = `채운 순서로 쓰면: ${cfgString(c, true)}${EXC[Z] && !q ? " · 쌓음 순서와 다른 원소" : ""}`;
    $(".n-k").textContent = bl === "d" ? (g === 12 ? "12족 (d¹⁰)" : "전이 원소") : "전형 원소";
    if (bl === "d") $(".n-v").textContent = `${p}s${sup(c[p + "s"] || 0)} ${p - 1}d${sup(c[(p - 1) + "d"] || 0)}`;
    else { const ve = (c[p + "s"] || 0) + (c[p + "p"] || 0); $(".n-v").textContent = Z === 2 ? "1s²" : `${p}s${sup(c[p + "s"] || 0)}${p >= 2 ? " " + p + "p" + sup(c[p + "p"] || 0) : ""} (${ve}개)`; }
    $(".n-u").textContent = `${unpaired(c)}개`;
    draw();
  }
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const g = Math.floor((x - tx0) / cell) + 1, p = Math.floor((y - ty0) / cell) + 1;
    for (let z = 1; z <= 54; z++) { const [pp, gg] = pos(z); if (pp === p && gg === g) { Z = z; update(); return; } }
  });
  root.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => { q = +b.dataset.q; update(); }));
  update();
})();
