/* 카드: 비누 만들기 — 비누화 값과 NaOH 양, 가열 시간, 염석, 수득률·pH, 거품(센물)·유화 시험, 미셀 모식도 */
(() => {
  const root = document.getElementById("card-labchem-soap");
  if (!root || !window.NMOrg) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab, O = NMOrg;
  const $ = (s) => root.querySelector(s);
  /* 비누화 값: 기름 1 g을 비누화하는 데 드는 NaOH 질량(g), 대표값 */
  const OIL = { coco: { name: "코코넛유", sap: 0.183 }, olive: { name: "올리브유", sap: 0.135 }, lard: { name: "돼지기름", sap: 0.138 } };
  const M_OIL = 10, TAU = 7;   // 기름 10 g, 반응의 시간 상수(분, 에탄올 넣고 저으며 80 °C)
  const CN = { soap: "만든 비누", syn: "합성 세제", none: "넣지 않음" }, WN = { soft: "증류수", hard: "센물" };
  const FOAM = { soap: { soft: 45, hard: 4 }, syn: { soft: 52, hard: 47 }, none: { soft: 1, hard: 1 } };      // mm (예시값)
  const EMUL = { soap: { soft: 900, hard: 70 }, syn: { soft: 900, hard: 800 }, none: { soft: 15, hard: 15 } };   // 기름이 다시 뜰 때까지 s (예시값)
  let oil = "coco", cln = "soap", wat = "soft", last = null, t = 0;
  const obs = $(".sp-obs");
  const t1 = L.table($(".t1"), [{ key: "o", label: "기름" }, { key: "na", label: "NaOH (g)", res: 0.1 }, { key: "tm", label: "가열 (분)" }, { key: "m", label: "비누 (g)", res: 0.01 }, { key: "y", label: "수득률 (%)", res: 1 }, { key: "ph", label: "pH", res: 0.1 }]);
  const t2 = L.table($(".t2"), [{ key: "c", label: "세정제" }, { key: "w", label: "물" }, { key: "f", label: "거품 (mm)", res: 1 }, { key: "e", label: "유화" }, { key: "n", label: "관찰" }], () => drawPlot());

  function make() {
    const sap = OIL[oil].sap, need = M_OIL * sap, na = +$(".na").value, tm = +$(".tm").value;
    const ext = 1 - Math.exp(-tm / TAU), reacted = Math.min(na, need) * ext, f = reacted / need;   // 비누화된 기름의 비율
    const soapFull = M_OIL + need - (need / 40 / 3) * 92.09;                                       // 기름이 모두 비누가 될 때의 비누 질량
    const theo = soapFull * Math.min(1, na / need);
    const wet = $(".dry").checked ? 0 : 0.16;
    const truth = (soapFull * f + M_OIL * (1 - f) * 0.4) * 0.93 * (1 + wet);                        // 남은 기름 일부는 비누에 섞여 남음, 거르며 7% 손실
    const m = L.measure(truth, { sd: 0.15, res: 0.01 });
    const freeNa = 0.15 * (na - reacted);                                                          // 염석·거르기 뒤에도 비누에 남은 NaOH (g)
    const oh = (freeNa / Math.max(m, 1)) / 40 / 0.1 + 1e-4;                                         // 1% 용액 속 [OH⁻]
    const ph = L.measure(14 + Math.log10(oh), { sd: 0.1, res: 0.1 });
    const row = { o: OIL[oil].name, na, tm, m, y: (m / theo) * 100, ph };
    t1.add(row);
    last = { kind: "make", f, greasy: f < 0.85 };
    obs.innerHTML = `<b>${OIL[oil].name} + NaOH ${na.toFixed(1)} g, ${tm}분</b>: 포화 NaCl 수용액에 부으니 흰 비누가 엉겨 떴습니다.${f < 0.85 ? " 비누가 미끈거리고 기름 냄새가 납니다." : ""}${ph >= 11 ? " pH가 높아 피부에 자극이 큽니다." : ""}`;
    draw();
  }
  function foamTest() {
    const v = L.measure(FOAM[cln][wat], { rel: 0.1, sd: 0.6, res: 1 }), scum = cln === "soap" && wat === "hard";
    t2.add({ c: CN[cln], w: WN[wat], f: Math.max(0, v), e: "—", n: scum ? "흰 앙금 뜸" : v > 20 ? "거품 많음" : "거품 거의 없음" });
    last = { kind: "foam", h: Math.max(0, v), scum };
    obs.innerHTML = `<b>${CN[cln]} · ${WN[wat]}</b>: 거품 높이 ${Math.max(0, v)} mm${scum ? ". 물이 뿌옇고 흰 앙금(비누 찌꺼기)이 떠오릅니다." : "."}`;
    draw();
  }
  function emulTest() {
    const s = L.measure(EMUL[cln][wat], { rel: 0.15, res: 1 }), long = s > 600;
    t2.add({ c: CN[cln], w: WN[wat], f: "—", e: long ? "10분 넘게 유지" : `${s} s 뒤 분리`, n: long ? "뿌옇게 섞임" : "기름이 다시 뜸" });
    last = { kind: "emul", long };
    obs.innerHTML = `<b>${CN[cln]} · ${WN[wat]} + 식용유</b>: ${long ? "흔든 뒤 10분이 지나도 뿌옇게 섞여 있습니다(유화)." : `${s} s 만에 기름이 다시 위로 떠 층이 나뉩니다.`}`;
    draw();
  }

  const app = fit($(".cv-wide"), () => draw());
  const pl = fit($(".sp-plot"), () => drawPlot());
  function draw() {
    const { ctx, size } = app, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lw = w * 0.4;
    // 왼쪽: 마지막 실험
    if (!last || last.kind === "make") {
      const bx = lw * 0.18, bw = lw * 0.64, by = h * 0.3, bb = h - 22;
      ctx.fillStyle = "rgba(200,225,245,.6)"; ctx.fillRect(bx, by + 28, bw, bb - by - 28);
      if (last) {
        ctx.fillStyle = last.greasy ? "#efe2b0" : "#f7f5ee";
        for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(bx + 12 + i * (bw - 24) / 8, by + 32 + (i % 2) * 4, 13, 8, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.strokeStyle = "rgba(141,141,146,.5)"; ctx.lineWidth = 1;
        for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(bx + 12 + i * (bw - 24) / 8, by + 32 + (i % 2) * 4, 13, 8, 0, 0, Math.PI * 2); ctx.stroke(); }
      }
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, bb); ctx.lineTo(bx + bw, bb); ctx.lineTo(bx + bw, by); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(last ? "엉긴 비누 (위) · 글리세롤과 NaCl 물층 (아래)" : "포화 NaCl 수용액", lw / 2, by - 8);
    } else {
      const tx = lw / 2, top = 26, bot = h - 22, tw = 30, H = bot - top;
      const layers = [{ f: 0.3, col: last.kind === "foam" && last.scum ? "#e7e9ea" : "#e3eef6" }];
      let o = {};
      if (last.kind === "foam") layers.push({ f: Math.min(0.6, last.h / 100), col: "#ffffff" });
      if (last.kind === "emul") { if (last.long) layers[0].col = "#efeadb"; else layers.push({ f: 0.08, col: "#f0d36a" }); }
      if (last.kind === "foam" && last.scum) { o.ppt = "#f4f4f2"; o.pptH = 4; }
      O.tube(ctx, tx, top, bot, tw, layers, o);
      if (last.kind === "foam" && last.scum) { ctx.fillStyle = "#cfd2d4"; for (let i = 0; i < 8; i++) ctx.fillRect(tx - 12 + (i * 5) % 24, bot - H * 0.3 + 2 + (i % 3) * 2, 3, 2); }
      // 자 눈금
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
      const y0 = bot - H * 0.3;
      for (let mm = 0; mm <= 50; mm += 10) { const y = y0 - mm / 100 * H; ctx.fillRect(tx - tw / 2 - 8, y, 5, 1); ctx.fillText(mm, tx - tw / 2 - 10, y + 3); }
    }
    // 오른쪽: 비누 분자와 미셀 (모식)
    const mx = lw + (w - lw) * 0.5, my = h * 0.58, R = Math.min((w - lw) * 0.3, h * 0.3);
    ctx.fillStyle = "#f0d36a"; ctx.beginPath(); ctx.arc(mx, my, R * 0.55, 0, Math.PI * 2); ctx.fill();
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + t * 0.05, hx = mx + Math.cos(a) * R, hy = my + Math.sin(a) * R;
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.3; ctx.beginPath();
      for (let k = 0; k <= 6; k++) { const rr = R - k * R * 0.11, ww = (k % 2 ? 3 : -3); const px = mx + Math.cos(a) * rr - Math.sin(a) * ww, py = my + Math.sin(a) * rr + Math.cos(a) * ww; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      ctx.fillStyle = "#c0392b"; ctx.beginPath(); ctx.arc(hx, hy, 4.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("기름때", mx, my + 4);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.fillText("미셀 (모식)", lw + 6, 18);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = "#c0392b"; ctx.fillText("● −COO⁻ 머리: 물 쪽 (친수성)", lw + 6, 34);
    ctx.fillStyle = C.ink2; ctx.fillText("∿ 탄화수소 꼬리: 기름 쪽 (소수성)", lw + 6, 48);
  }
  function drawPlot() {
    const { ctx, size } = pl, { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const G = [["soap", "soft"], ["soap", "hard"], ["syn", "soft"], ["syn", "hard"], ["none", "soft"]];
    const x0 = 40, y0 = 16, gw = w - 52, gh = h - 46, ymax = 60, n = G.length;
    const X = (i) => x0 + (i + 0.5) / n * gw, Y = (v) => y0 + gh - v / ymax * gh;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [], yt: L.ticks(0, ymax, 4).map((v) => [v, String(v)]), ylabel: "평균 거품 높이 (mm)" });
    ctx.textAlign = "center";
    G.forEach(([c, wv], i) => {
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.fillText(`${CN[c]}·${WN[wv]}`, X(i), y0 + gh + 14);
      const s = L.stats(t2.rows.filter((r) => r.c === CN[c] && r.w === WN[wv] && typeof r.f === "number").map((r) => r.f));
      if (!s.n) return;
      const bw = gw / n * 0.42;
      ctx.fillStyle = wv === "hard" ? "rgba(181,83,47,.5)" : "rgba(59,124,42,.45)"; ctx.fillRect(X(i) - bw / 2, Y(s.mean), bw, Y(0) - Y(s.mean));
      if (s.n > 1) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(i), Y(s.mean - s.sd)); ctx.lineTo(X(i), Y(s.mean + s.sd)); ctx.stroke(); }
      ctx.fillStyle = C.ink; ctx.font = `10px ${F.mono}`; ctx.fillText(`${s.mean.toFixed(0)} (n=${s.n})`, X(i), Y(s.mean + (s.sd || 0)) - 6);
    });
  }
  const bind = (sel, attr, set) => $(sel).addEventListener("click", (e) => { const b = e.target.closest(`[${attr}]`); if (!b) return; set(b.getAttribute(attr)); root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); });
  bind(".oil", "data-o", (v) => { oil = v; });
  bind(".cln", "data-c", (v) => { cln = v; });
  bind(".wat", "data-w", (v) => { wat = v; });
  $(".na").addEventListener("input", () => { $(".na-out").textContent = (+$(".na").value).toFixed(1); });
  $(".tm").addEventListener("input", () => { $(".tm-out").textContent = $(".tm").value; });
  $(".make").addEventListener("click", make);
  $(".foam").addEventListener("click", foamTest);
  $(".emul").addEventListener("click", emulTest);
  $(".clr1").addEventListener("click", () => t1.clear());
  $(".clr2").addEventListener("click", () => t2.clear());
  loop($(".cv-wide"), (dt) => { t += dt; draw(); });
  if (L.demo) {
    const setv = (na, tm) => { $(".na").value = na; $(".tm").value = tm; $(".na").dispatchEvent(new Event("input")); $(".tm").dispatchEvent(new Event("input")); };
    [[1.0, 30], [1.8, 30], [2.6, 30], [1.8, 10]].forEach(([a, b]) => { setv(a, b); make(); });
    oil = "olive"; setv(1.4, 30); make(); oil = "coco"; setv(1.8, 30);
    [["soap", "soft"], ["soap", "hard"], ["syn", "soft"], ["syn", "hard"]].forEach(([c, wv]) => { cln = c; wat = wv; for (let i = 0; i < 3; i++) foamTest(); });
    cln = "soap"; wat = "hard"; emulTest(); cln = "soap"; wat = "soft"; emulTest();
    cln = "soap"; wat = "hard"; foamTest();
    root.querySelector('[data-w="hard"]').click();
  }
  draw();
})();
