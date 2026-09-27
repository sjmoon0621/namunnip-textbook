/* 카드: 가계도만 보고 유전 방식을 가려낼 수 있을까? — 가능한 유전자형을 대입하는 제약 풀이 */
(() => {
  const root = document.getElementById("card-gene-pedigree");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nV = $(".n-v"), nW = $(".n-w"), nA = $(".n-a");
  // 사람: [id, 성(M/F), 형질?, x, 세대]; 가족: [아버지, 어머니, [자녀]]
  const PED = [
    { p: [["I1", "M", 0, 0.35, 0], ["I2", "F", 0, 0.65, 0], ["II1", "M", 0, 0.25, 1], ["II2", "F", 1, 0.5, 1], ["II3", "M", 0, 0.75, 1]], f: [["I1", "I2", ["II1", "II2", "II3"]]] },
    { p: [["I1", "M", 0, 0.3, 0], ["I2", "F", 0, 0.5, 0], ["II1", "M", 1, 0.2, 1], ["II2", "F", 0, 0.5, 1], ["II3", "M", 0, 0.7, 1], ["III1", "M", 1, 0.4, 2], ["III2", "F", 0, 0.6, 2], ["III3", "M", 0, 0.8, 2]], f: [["I1", "I2", ["II1", "II2"]], ["II3", "II2", ["III1", "III2", "III3"]]] },
    { p: [["I1", "M", 1, 0.3, 0], ["I2", "F", 1, 0.6, 0], ["II1", "F", 0, 0.15, 1], ["II2", "M", 1, 0.4, 1], ["II3", "M", 0, 0.62, 1], ["II4", "F", 0, 0.85, 1], ["III1", "F", 1, 0.3, 2], ["III2", "M", 0, 0.5, 2]], f: [["I1", "I2", ["II1", "II2", "II3"]], ["II2", "II4", []], ["II2", "II4", ["III1", "III2"]]] },
  ];
  PED[2].f = [["I1", "I2", ["II1", "II2", "II3"]], ["II2", "II4", ["III1", "III2"]]];
  PED[2].p[5][3] = 0.2; PED[2].p[4][3] = 0.8; PED[2].p[2][3] = 0.6; // 배치 조정: II4(배우자)를 II2 옆에
  const HN = { AD: "상염색체 우성", AR: "상염색체 열성", XD: "X 연관 우성", XR: "X 연관 열성" };
  // 유전자형: 상염색체 ["AA","Aa","aa"], X 남 ["A","a"](X 하나), X 여 ["AA","Aa","aa"]. 질병 대립유전자: 우성 가설은 A, 열성 가설은 a
  function options(h, sex, aff) {
    const X = h[0] === "X", dom = h[1] === "D", male = X && sex === "M";
    const all = male ? ["A", "a"] : ["AA", "Aa", "aa"];
    return all.filter((g) => { const nA = [...g].filter((c) => c === "A").length; const sick = dom ? nA > 0 : nA === 0; return sick === !!aff; });
  }
  function canChild(h, fa, mo, ch, sex) {
    if (h[0] === "A") { for (const a of fa) for (const b of mo) if ([a, b].sort().join("") === [...ch].sort().join("")) return true; return false; }
    if (sex === "M") return mo.includes(ch);                       // 아들: 어머니의 X 하나
    for (const b of mo) if ([fa, b].sort().join("") === [...ch].sort().join("")) return true; return false; // 딸: 아버지 X + 어머니 X
  }
  function solve(ped, h) {
    const P = Object.fromEntries(ped.p.map(([id, sex, aff]) => [id, { sex, opts: options(h, sex, aff) }])), ids = ped.p.map((p) => p[0]), asg = {};
    const famOk = (fm) => { const [fa, mo, kids] = fm; if (!(fa in asg) || !(mo in asg)) return true; return kids.every((k) => !(k in asg) || canChild(h, asg[fa], asg[mo], asg[k], P[k].sex)); };
    const bt = (i) => { if (i === ids.length) return true; for (const g of P[ids[i]].opts) { asg[ids[i]] = g; if (ped.f.every(famOk) && bt(i + 1)) return true; } delete asg[ids[i]]; return false; };
    if (bt(0)) return { ok: true };
    // 모순 가족 찾기: 그 가족만 따로 풀었을 때 불가능한 가족
    const bad = ped.f.filter((fm) => { const sub = { p: ped.p.filter((p) => fm[0] === p[0] || fm[1] === p[0] || fm[2].includes(p[0])), f: [fm] }; return !solveLocal(sub, h); });
    return { ok: false, bad };
  }
  function solveLocal(ped, h) { const P = Object.fromEntries(ped.p.map(([id, sex, aff]) => [id, { sex, opts: options(h, sex, aff) }])); const [fa, mo, kids] = ped.f[0]; for (const a of P[fa].opts) for (const b of P[mo].opts) if (kids.every((k) => P[k].opts.some((c) => canChild(h, a, b, c, P[k].sex)))) return true; return false; }
  function reason(ped, h, res) {
    if (res.ok) return "모든 사람에게 모순 없는 유전자형을 줄 수 있습니다.";
    if (!res.bad.length) return "가족 하나씩은 괜찮지만, 여러 가족을 함께 보면 모순이 생깁니다.";
    const [fa, mo, kids] = res.bad[0], A = (id) => ped.p.find((p) => p[0] === id);
    const pa = A(fa)[2], pm = A(mo)[2], kidsA = kids.map(A);
    if (h === "AD" && !pa && !pm && kidsA.some((k) => k[2])) return "형질이 없는 부모(둘 다 aa)에게서 형질이 있는 자녀가 나올 수 없습니다.";
    if (h === "AR" && pa && pm && kidsA.some((k) => !k[2])) return "형질이 있는 부모(둘 다 aa)에게서 형질이 없는 자녀가 나올 수 없습니다.";
    if (h === "XD" && pa && kidsA.some((k) => k[1] === "F" && !k[2])) return "형질이 있는 아버지의 딸은 모두 형질이 있어야 합니다.";
    if (h === "XD" && !pm && kidsA.some((k) => k[1] === "M" && k[2])) return "아들은 X를 어머니에게서 받는데, 어머니에게 우성 대립유전자가 없습니다.";
    if (h === "XR" && pm && kidsA.some((k) => k[1] === "M" && !k[2])) return "형질이 있는 어머니(XᵃXᵃ)의 아들은 모두 형질이 있어야 합니다.";
    if (h === "XR" && !pa && kidsA.some((k) => k[1] === "F" && k[2])) return "형질이 있는 딸은 아버지에게서도 열성 X를 받아야 하는데, 아버지는 형질이 없습니다.";
    return "표시한 가족에서 모순이 생깁니다.";
  }
  let pi = 0, h = "AR";
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h: H } = size; if (!w) return;
    ctx.clearRect(0, 0, w, H);
    const ped = PED[pi], res = solve(ped, h), lab = {}; [0, 1, 2].forEach((g) => ped.p.filter((q) => q[4] === g).sort((a, b) => a[3] - b[3]).forEach((q, i) => (lab[q[0]] = `${["I", "II", "III"][g]}-${i + 1}`))); const gens = Math.max(...ped.p.map((p) => p[4])) + 1, Y = (g) => 36 + g * (H - 70) / Math.max(1, gens - 1 || 1) * (gens > 2 ? 1 : 0.8), X = (x) => 20 + x * (w - 40), pos = Object.fromEntries(ped.p.map((p) => [p[0], [X(p[3]), Y(p[4])]])), r = 13;
    ped.f.forEach(([fa, mo, kids], i) => {
      const bad = !res.ok && res.bad.includes(ped.f[i]), [x1, y1] = pos[fa], [x2] = pos[mo], mx = (x1 + x2) / 2;
      ctx.strokeStyle = bad ? C.warn : C.ink2; ctx.lineWidth = bad ? 2.5 : 1.5; ctx.beginPath(); ctx.moveTo(Math.min(x1, x2) + r, y1); ctx.lineTo(Math.max(x1, x2) - r, y1); ctx.stroke();
      if (kids.length) { const ky = pos[kids[0]][1], sy = (y1 + ky) / 2; ctx.beginPath(); ctx.moveTo(mx, y1); ctx.lineTo(mx, sy); ctx.stroke(); const xs = kids.map((k) => pos[k][0]); ctx.beginPath(); ctx.moveTo(Math.min(...xs, mx), sy); ctx.lineTo(Math.max(...xs, mx), sy); ctx.stroke(); kids.forEach((k) => { ctx.beginPath(); ctx.moveTo(pos[k][0], sy); ctx.lineTo(pos[k][0], pos[k][1] - r); ctx.stroke(); }); }
    });
    ped.p.forEach(([id, sex, aff]) => { const [x, y] = pos[id]; ctx.fillStyle = aff ? C.ink : "#fff"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.beginPath(); if (sex === "M") ctx.rect(x - r, y - r, 2 * r, 2 * r); else ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab[id], x, y + r + 11); });
    ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = res.ok ? C.forest : C.warn; ctx.fillText(`${HN[h]}: ${res.ok ? "가능" : "불가능"}`, w - 10, 18);
  }
  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.p === pi)));
    root.querySelectorAll("[data-h]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.h === h)));
    const ped = PED[pi], res = solve(ped, h); nV.textContent = res.ok ? "가능 (모순 없음)" : "불가능"; nW.textContent = reason(ped, h, res);
    const ok = Object.keys(HN).filter((k) => solve(ped, k).ok).map((k) => HN[k]); nA.textContent = ok.length === 1 ? `${ok[0]}만 가능 → 결론을 낼 수 있음` : ok.length ? `${ok.join(", ")} 가능 → 이 가계도만으로는 결정할 수 없음` : "모두 불가능";
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { pi = +b.dataset.p; update(); }));
  root.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => { h = b.dataset.h; update(); }));
  update();
})();
