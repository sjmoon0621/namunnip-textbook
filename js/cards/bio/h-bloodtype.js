/* 카드: ABO식 혈액형은 어떻게 판정할까? — 가상 판정 키트와 수혈 궁합표 (모식) */
(() => {
  const root = document.getElementById("card-bio-blood");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const msg = $(".bt-msg"), nNo = $(".bt-no");
  const RBC = "#c9463d", RBC2 = "#a8322b";
  const TYPES = ["A", "B", "AB", "O"];
  const ANTIGEN = { A: ["A"], B: ["B"], AB: ["A", "B"], O: [] };      // 적혈구 막의 응집원
  const ANTIBODY = { A: ["β"], B: ["α"], AB: [], O: ["α", "β"] };     // 혈장의 응집소

  let sample = null, no = 0, drops = {}, t0 = {}, clock = 0;
  let pickT = null, pickR = null;
  const tested = {}; // "donor>recipient" → true/false(응집)
  let sel = null;    // 지금 궁합표에서 고른 칸

  function newSample() {
    no++;
    sample = { abo: TYPES[Math.floor(Math.random() * 4)], rh: Math.random() < 0.75 };
    drops = {}; t0 = {}; pickT = pickR = null;
    root.querySelectorAll("[data-ans],[data-rh]").forEach((b) => b.setAttribute("aria-pressed", "false"));
    nNo.textContent = `혈액 시료 ${no}번`;
    msg.textContent = "세 우물에 차례로 혈액을 떨어뜨려 응집 여부를 보고, 혈액형을 골라 보세요.";
  }
  const agg = (well) => well === "A" ? ANTIGEN[sample.abo].includes("A") : well === "B" ? ANTIGEN[sample.abo].includes("B") : sample.rh;

  // 우물마다 적혈구 위치를 미리 만들어 둔다
  const dots = Array.from({ length: 46 }, (_, i) => {
    const a = i * 2.39996, r = Math.sqrt((i + 0.5) / 46);
    const cl = i % 5, ca = cl / 5 * Math.PI * 2 + 0.4;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, cx: Math.cos(ca) * 0.5 + (Math.random() - .5) * 0.2, cy: Math.sin(ca) * 0.5 + (Math.random() - .5) * 0.2 };
  });

  const { ctx, size } = fit(cv, () => draw());

  function well(cx, cy, r, label, sub, key) {
    ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 혈청 색
    ctx.fillStyle = key === "A" ? "rgba(90,140,200,.18)" : key === "B" ? "rgba(224,190,60,.22)" : "rgba(160,160,160,.14)";
    ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, Math.PI * 2); ctx.fill();
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(label, cx, cy + r + 17);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText(sub, cx, cy + r + 31);
    if (!drops[key]) { ctx.fillStyle = C.ink3; ctx.fillText("눌러서 떨어뜨리기", cx, cy + 4); return; }
    const p = clamp((clock - t0[key]) / 1.6, 0, 1), k = agg(key) ? NM.ease(p) : 0;
    const spread = clamp((clock - t0[key]) / 0.5, 0, 1);
    if (!agg(key) || p < 1) { ctx.fillStyle = `rgba(201,70,61,${0.25 * spread * (1 - k)})`; ctx.beginPath(); ctx.arc(cx, cy, (r - 6) * spread, 0, Math.PI * 2); ctx.fill(); }
    for (const d of dots) {
      const x = d.x * (1 - k) + d.cx * k, y = d.y * (1 - k) + d.cy * k;
      ctx.fillStyle = k > 0.5 ? RBC2 : RBC;
      ctx.beginPath(); ctx.arc(cx + x * (r - 9) * spread, cy + y * (r - 9) * spread, 3.2, 0, Math.PI * 2); ctx.fill();
    }
    if (p >= 1) { ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = agg(key) ? C.warn : C.forest; ctx.fillText(agg(key) ? "응집함" : "응집 안 함", cx, cy - r - 8); }
  }

  function draw() {
    const { w, h } = size;
    if (!w || !sample) return;
    ctx.clearRect(0, 0, w, h);
    const kitH = h * 0.44;
    ctx.fillStyle = "#eef1ee"; ctx.fillRect(4, 4, w - 8, kitH - 8);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`판정 키트 · ${nNo.textContent}`, 12, 20);
    const r = Math.min(w / 8.5, kitH * 0.26);
    const xs = [w * 0.2, w * 0.5, w * 0.8], cy = kitH * 0.46;
    well(xs[0], cy, r, "항 A 혈청", "응집소 α", "A");
    well(xs[1], cy, r, "항 B 혈청", "응집소 β", "B");
    well(xs[2], cy, r, "항 D 혈청", "Rh 판정", "D");
    drawTable({ x: 4, y: kitH + 6, w: w - 8, h: h - kitH - 10 });
  }

  /* 수혈 궁합표: 가로 = 주는 사람(적혈구), 세로 = 받는 사람(혈장) */
  let cells = [];
  function drawTable(b) {
    const { x, y, w, h } = b;
    ctx.fillStyle = "#f6f1e4"; ctx.fillRect(x, y, w, h);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("수혈 궁합표 · 칸을 눌러 섞어 보기", x + 8, y + 16);
    const tw = Math.min(w * 0.58, h * 1.05), th = h - 40, cw = tw / 5, chh = th / 5;
    const tx = x + 8, ty = y + 26;
    cells = [];
    ctx.textAlign = "center";
    ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`;
    ctx.fillText("받는↓ 주는→", tx + cw / 2, ty + chh / 2 + 3);
    TYPES.forEach((d, i) => { ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.fillText(d, tx + cw * (i + 1.5), ty + chh / 2 + 4); });
    TYPES.forEach((rcp, j) => {
      ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.fillText(rcp, tx + cw / 2, ty + chh * (j + 1.5) + 4);
      TYPES.forEach((d, i) => {
        const cx0 = tx + cw * (i + 1), cy0 = ty + chh * (j + 1), key = `${d}>${rcp}`;
        cells.push({ x: cx0, y: cy0, w: cw, h: chh, d, rcp });
        const isSel = sel && sel.d === d && sel.rcp === rcp;
        ctx.fillStyle = isSel ? "#fff" : "#fbfbf8"; ctx.strokeStyle = isSel ? C.ink : C.rule; ctx.lineWidth = isSel ? 2 : 1;
        ctx.fillRect(cx0 + 1, cy0 + 1, cw - 2, chh - 2); ctx.strokeRect(cx0 + 1.5, cy0 + 1.5, cw - 3, chh - 3);
        if (key in tested) { ctx.font = `600 14px ${F.sans}`; ctx.fillStyle = tested[key] ? C.warn : C.forest; ctx.fillText(tested[key] ? "✕" : "○", cx0 + cw / 2, cy0 + chh / 2 + 5); }
      });
    });
    // 오른쪽: 고른 칸의 섞임
    const mx = tx + tw + 14, mw = x + w - mx - 8;
    if (mw < 80) return;
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`;
    if (!sel) { ctx.fillStyle = C.ink3; wrap("왼쪽 표의 칸을 누르면 주는 사람의 적혈구를 받는 사람의 혈장에 섞어 봅니다.", mx, ty + 14, mw, 15); return; }
    const clump = ANTIGEN[sel.d].some((a) => ANTIBODY[sel.rcp].includes(a === "A" ? "α" : "β"));
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`;
    ctx.fillText(`${sel.d}형 → ${sel.rcp}형`, mx, ty + 14);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2;
    ctx.fillText(`적혈구 응집원: ${ANTIGEN[sel.d].join(", ") || "없음"}`, mx, ty + 32);
    ctx.fillText(`혈장 응집소: ${ANTIBODY[sel.rcp].join(", ") || "없음"}`, mx, ty + 48);
    const rr = Math.min(mw * 0.35, (th - 70) * 0.45), cx = mx + mw / 2, cy = ty + 62 + rr;
    ctx.fillStyle = "rgba(224,200,120,.25)"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const k = clump ? NM.ease(clamp((clock - sel.t) / 1.4, 0, 1)) : 0;
    for (const d of dots.slice(0, 30)) { ctx.fillStyle = RBC; ctx.beginPath(); ctx.arc(cx + (d.x * (1 - k) + d.cx * k) * (rr - 6), cy + (d.y * (1 - k) + d.cy * k) * (rr - 6), 2.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.textAlign = "center"; ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = clump ? C.warn : C.forest;
    ctx.fillText(clump ? "응집 → 수혈 불가" : "응집 없음", cx, cy + rr + 16);
  }
  function wrap(text, x, y, mw, lh) {
    let line = "", yy = y;
    for (const ch of text.split(" ")) { const t = line ? line + " " + ch : ch; if (ctx.measureText(t).width > mw && line) { ctx.fillText(line, x, yy); line = ch; yy += lh; } else line = t; }
    if (line) ctx.fillText(line, x, yy);
  }

  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, { w, h } = size;
    const kitH = h * 0.44;
    if (py < kitH) {
      const k = px < w * 0.35 ? "A" : px < w * 0.65 ? "B" : "D";
      if (!drops[k]) { drops[k] = true; t0[k] = clock; }
      return;
    }
    const c = cells.find((c) => px >= c.x && px < c.x + c.w && py >= c.y && py < c.y + c.h);
    if (c) {
      sel = { d: c.d, rcp: c.rcp, t: clock };
      tested[`${c.d}>${c.rcp}`] = ANTIGEN[c.d].some((a) => ANTIBODY[c.rcp].includes(a === "A" ? "α" : "β"));
    }
  });
  $(".drop-all").addEventListener("click", () => { for (const k of ["A", "B", "D"]) if (!drops[k]) { drops[k] = true; t0[k] = clock; } });
  $(".new").addEventListener("click", newSample);
  const check = () => {
    if (!pickT || pickR == null) return;
    const ok = pickT === sample.abo && pickR === sample.rh;
    const all = drops.A && drops.B && drops.D;
    msg.textContent = !all ? "아직 떨어뜨리지 않은 우물이 있습니다. 세 우물을 모두 확인한 뒤 판정하세요."
      : ok ? `맞습니다. ${sample.abo}형 Rh${sample.rh ? "+" : "−"}입니다. 적혈구에 응집원 ${ANTIGEN[sample.abo].join("·") || "없음"}${sample.rh ? ", D 항원" : ""}이 있어 그에 맞는 혈청에서만 응집했습니다.`
      : `다시 보세요. 항 A 혈청에서 응집하면 응집원 A가, 항 B 혈청에서 응집하면 응집원 B가 있다는 뜻입니다. 항 D 혈청에서 응집하면 Rh+입니다.`;
  };
  root.querySelectorAll("[data-ans]").forEach((b) => b.addEventListener("click", () => {
    pickT = b.dataset.ans; root.querySelectorAll("[data-ans]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false")); check();
  }));
  root.querySelectorAll("[data-rh]").forEach((b) => b.addEventListener("click", () => {
    pickR = b.dataset.rh === "1"; root.querySelectorAll("[data-rh]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false")); check();
  }));
  newSample();
  loop(cv, (dt) => { clock += dt; draw(); });
})();
