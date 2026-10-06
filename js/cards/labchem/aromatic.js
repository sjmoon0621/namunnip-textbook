/* 카드: 방향족 탄화수소 — 케쿨레 가설 vs 실제 벤젠의 결합 길이, 수소화 엔탈피, 첨가/치환, 나프탈렌 (분자 모형 실험) */
(() => {
  const root = document.getElementById("card-labchem-aromatic");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const r3 = Math.sqrt(3) / 2;
  const hex = [0, 1, 2, 3, 4, 5].map((k) => { const a = (-90 + 60 * k) * Math.PI / 180; return [Math.cos(a), Math.sin(a)]; });
  const ring6 = (lens, ord, names) => ({ at: hex, b: lens.map((l, i) => [i, (i + 1) % 6, l, ord[i], names[i]]) });
  /* 결합 길이(pm): 사이클로헥센·나프탈렌은 문헌값을 반올림한 대략값 */
  const NAP_AT = [[0, -0.5], [r3, -1], [2 * r3, -0.5], [2 * r3, 0.5], [r3, 1], [0, 0.5], [-r3, 1], [-2 * r3, 0.5], [-2 * r3, -0.5], [-r3, -1]];
  //               8a        1         2             3            4        4a        5          6              7              8
  const M = {
    chx: { name: "사이클로헥센", f: "C₆H₁₀", tp: "−104 °C · 83 °C", st: "무색 액체", mol: ring6([134, 150, 152, 153, 152, 150], [2, 1, 1, 1, 1, 1], ["C1=C2", "C2−C3", "C3−C4", "C4−C5", "C5−C6", "C6−C1"]), col: C.apple },
    kek: { name: "케쿨레 가설", f: "C₆H₆", tp: "(가상 분자)", st: "—", mol: ring6([134, 154, 134, 154, 134, 154], [2, 1, 2, 1, 2, 1], ["C1=C2", "C2−C3", "C3=C4", "C4−C5", "C5=C6", "C6−C1"]), col: C.amber },
    bz: { name: "벤젠", f: "C₆H₆", tp: "5.5 °C · 80 °C", st: "무색 액체 (휘발성)", mol: ring6([139, 139, 139, 139, 139, 139], [1, 1, 1, 1, 1, 1], ["C1−C2", "C2−C3", "C3−C4", "C4−C5", "C5−C6", "C6−C1"]), circles: [[0, 0]], col: C.forest },
    nap: { name: "나프탈렌", f: "C₁₀H₈", tp: "80 °C · 218 °C", st: "흰 결정 (승화함)", mol: { at: NAP_AT, b: [[0, 1, 142, 1, "C8a−C1"], [1, 2, 137, 1, "C1−C2"], [2, 3, 141, 1, "C2−C3"], [3, 4, 137, 1, "C3−C4"], [4, 5, 142, 1, "C4−C4a"], [5, 0, 142, 1, "C4a−C8a"], [5, 6, 142, 1, "C4a−C5"], [6, 7, 137, 1, "C5−C6"], [7, 8, 141, 1, "C6−C7"], [8, 9, 137, 1, "C7−C8"], [9, 0, 142, 1, "C8−C8a"]] }, circles: [[r3, 0], [-r3, 0]], col: "#3f6fa3" },
  };
  const DH = [["사이클로헥센 (C=C 1개)", -120, "chx"], ["1,3-사이클로헥사다이엔 (C=C 2개)", -232, null], ["케쿨레 가설 예상 (C=C 3개)", -360, "kek"], ["벤젠 실측", -208, "bz"]];
  let key = "kek", cur = null;
  const done = { chx: 0, kek: 0, bz: 0, nap: 0 };
  const obs = $(".ar-obs");
  const tbl = L.table($(".tbl-host"), [{ key: "m", label: "모형" }, { key: "b", label: "결합" }, { key: "l", label: "길이 (pm)", res: 1 }], () => drawPlot());

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  function draw() {
    const { ctx, size } = app, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = M[key], lw = w * 0.52, s = key === "nap" ? Math.min(lw / 4.6, h / 3.6) : Math.min(lw / 3.2, h / 3.4);
    const cx = lw / 2, cy = h * 0.55, P = (i) => [cx + m.mol.at[i][0] * s, cy + m.mol.at[i][1] * s];
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`${m.name}  ${m.f}`, 10, 20);
    m.mol.b.forEach(([i, j, len, ord], bi) => {
      const [x1, y1] = P(i), [x2, y2] = P(j), hl = cur && cur.k === key && cur.i === bi;
      ctx.strokeStyle = hl ? C.warn : C.ink; ctx.lineWidth = hl ? 3.2 : 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      if (ord === 2) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = cx - mx, dy = cy - my, d = Math.hypot(dx, dy), ox = dx / d * 6, oy = dy / d * 6, sh = 0.18;
        ctx.beginPath(); ctx.moveTo(x1 + (x2 - x1) * sh + ox, y1 + (y2 - y1) * sh + oy); ctx.lineTo(x2 - (x2 - x1) * sh + ox, y2 - (y2 - y1) * sh + oy); ctx.stroke();
      }
      if (hl) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ccx = key === "nap" ? cx + (m.mol.at[i][0] + m.mol.at[j][0] > 0 ? r3 : -r3) * s : cx, dx = mx - ccx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
        ctx.fillStyle = C.warn; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${cur.v} pm`, mx + dx / d * 20, my + dy / d * 20 + 4);
      }
    });
    (m.circles || []).forEach(([a, b]) => { ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx + a * s, cy + b * s, s * 0.55, 0, Math.PI * 2); ctx.stroke(); });
    m.mol.at.forEach((_, i) => { const [x, y] = P(i); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill(); });
    if (key === "nap") { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("고리 속 원은 비편재 전자를 나타낸 모식", cx, h - 8); }
    // 수소화 엔탈피
    const x0 = lw + 8, x1 = w - 12, rh = (h - 44) / DH.length, sc = (x1 - x0) / 380;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.fillText("수소화 엔탈피 (kJ/mol)", x0, 20);
    DH.forEach(([lab, v, k], i) => {
      const y = 34 + i * rh, on = k === key;
      ctx.fillStyle = on ? C.ink : C.ink2; ctx.font = `${on ? "600 " : ""}10.5px ${F.sans}`; ctx.fillText(lab, x0, y + 10);
      ctx.fillStyle = k === "kek" ? "rgba(224,160,42,.35)" : on ? C.warn : "rgba(63,111,163,.45)";
      if (k === "kek") { ctx.setLineDash([4, 3]); ctx.strokeStyle = C.amber; ctx.strokeRect(x0 + 0.5, y + 16.5, -v * sc, rh * 0.32); ctx.setLineDash([]); }
      ctx.fillRect(x0, y + 16, -v * sc, rh * 0.32);
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; const tx = x0 - v * sc + 4;
      ctx.textAlign = tx > x1 - 30 ? "right" : "left"; ctx.fillText(String(v), tx > x1 - 30 ? x0 - v * sc - 4 : tx, y + 16 + rh * 0.24); ctx.textAlign = "left";
    });
    ctx.fillStyle = C.forest; ctx.font = `600 10.5px ${F.sans}`; ctx.fillText("예상 − 실측 ≈ 150 kJ/mol 더 안정", x0, h - 8);
  }
  function drawPlot() {
    const { ctx, size } = pl, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx = { x0: 44, y0: 18, w: w - 60, h: h - 52 };
    const r = { X: (v) => bx.x0 + (v - 0.5) / 11 * bx.w, Y: (v) => bx.y0 + bx.h - (v - 128) / 30 * bx.h };
    NM.axes(ctx, { ...bx, X: r.X, Y: r.Y, xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((v) => [v, String(v)]), yt: [130, 135, 140, 145, 150, 155].map((v) => [v, String(v)]), xlabel: "결합 번호", ylabel: "C−C 결합 길이 (pm)" });
    [[154, "C−C 단일 (에테인) 154"], [134, "C=C 이중 (에텐) 134"]].forEach(([v, lab]) => {
      ctx.strokeStyle = C.ink3; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.X(0.5), r.Y(v)); ctx.lineTo(r.X(11.5), r.Y(v)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(lab, r.X(11.5) - 2, r.Y(v) - 4);
    });
    const off = { chx: -0.24, kek: -0.08, bz: 0.08, nap: 0.24 };
    tbl.rows.forEach((row) => { const m = M[row.k]; ctx.fillStyle = m.col; ctx.beginPath(); ctx.arc(r.X(row.i + 1 + off[row.k]), r.Y(row.l), 3.4, 0, Math.PI * 2); ctx.fill(); });
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    const ks = Object.keys(M).filter((k) => tbl.rows.some((x) => x.k === k));
    let lx = w - 16 - ks.reduce((a, k) => a + ctx.measureText(M[k].name).width + 22, 0);
    ks.forEach((k) => { ctx.fillStyle = M[k].col; ctx.beginPath(); ctx.arc(lx + 4, 9, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText(M[k].name, lx + 11, 13); lx += ctx.measureText(M[k].name).width + 22; });
  }
  function measure() {
    const m = M[key], n = m.mol.b.length;
    if (done[key] >= n) { obs.innerHTML = `<b>${m.name}</b>: 결합 ${n}개를 모두 쟀습니다.`; return false; }
    const i = done[key]++, [, , len, , nm] = m.mol.b[i], v = L.measure(len, { sd: 1, res: 1 });
    tbl.add({ k: key, i, m: m.name, b: nm, l: v }); cur = { k: key, i, v };
    obs.innerHTML = `<b>${m.name}</b> ${nm}: ${v} pm`;
    draw(); return true;
  }
  const BR = {
    chx: ["흔들자마자 두 층 모두 색이 사라집니다. 이중 결합에 브로민이 첨가되었습니다.", "촉매가 없어도 바로 첨가 반응이 일어나 색이 사라집니다."],
    kek: ["가상 분자라 실험할 수 없습니다. 케쿨레 구조가 맞다면 사이클로헥센처럼 색이 바로 사라져야 합니다.", "가상 분자라 실험할 수 없습니다."],
    bz: ["위층(벤젠)이 주황색으로 물들고 아래 물층은 옅어집니다. 브로민이 벤젠 층으로 옮겨 녹았을 뿐, 첨가 반응은 일어나지 않습니다.", "적갈색이 천천히 옅어지고 HBr 기체가 나와 젖은 푸른 리트머스 종이가 붉게 변합니다. 브로모벤젠이 생기는 치환 반응입니다."],
    nap: ["흰 결정을 넣고 흔들어도 브로민수의 색이 사라지지 않습니다.", "벤젠보다 쉽게 치환 반응이 일어나 1-브로모나프탈렌이 생기고 HBr 기체가 나옵니다."],
  };
  function upd() {
    const m = M[key];
    root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.m === key)));
    $(".n-f").textContent = m.f; $(".n-t").textContent = m.tp; $(".n-s").textContent = m.st; draw();
  }
  $(".mdl").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (!b) return; key = b.dataset.m; cur = null; obs.textContent = "결합 길이를 재거나 시험을 하세요."; upd(); });
  $(".meas").addEventListener("click", measure);
  $(".all").addEventListener("click", () => { while (measure()); });
  $(".brw").addEventListener("click", () => { obs.innerHTML = `<b>${M[key].name} + 브로민수</b>: ${BR[key][0]}`; });
  $(".febr").addEventListener("click", () => { obs.innerHTML = `<b>${M[key].name} + Br₂ / FeBr₃</b>: ${BR[key][1]}`; });
  $(".clear").addEventListener("click", () => { tbl.clear(); Object.keys(done).forEach((k) => { done[k] = 0; }); cur = null; draw(); });
  if (L.demo) {
    ["chx", "kek", "bz", "nap"].forEach((k) => { key = k; while (measure()); });
    key = "bz"; cur = { k: "bz", i: 2, v: tbl.rows.find((r) => r.k === "bz" && r.i === 2).l };
    upd(); $(".febr").click();
    return;
  }
  upd();
})();
