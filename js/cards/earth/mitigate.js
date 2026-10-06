/* 카드: 탄소 제거와 태양 복사 조절, 어떤 기술에 기대야 할까? — 감축·탄소 제거(CDR)·태양 복사 조절(SRM)·적응 포트폴리오 설계
   탄소 제거 잠재량·비용·기술 준비도: IPCC AR6 WGIII (2022) 정책결정자용 요약·기술 요약의 범위를 그대로 옮김 (대략값).
   감축 수단의 한도: 현재 부문별 CO₂ 배출(대략)을 바탕으로 이 카드가 놓은 가정. */
(() => {
  const root = document.getElementById("card-earth-mitigate");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const NOW = 40;   // 현재 CO₂ 순배출, GtCO₂/년 (화석 연료·산업 약 37 + 토지 이용 변화 약 4, 2020년대 중반 대략)
  // g: red 감축, cdr 탄소 제거, srm 태양 복사 조절, ad 적응. r: 잠재량 범위(GtCO₂/년), max: 고를 수 있는 최댓값
  const O = [
    { id: "ren", g: "red", n: "재생 에너지·전기화", r: [0, 20], max: 20, ct: "낮음 (상당 부분 20달러/tCO₂ 이하, 일부는 화석 연료보다 쌈)", col: "#3b7c2a",
      pot: "0–20 (발전·열 약 15와 수송·건물의 전기화 일부, 카드 가정)", per: "영구 (처음부터 배출하지 않음)", risk: "광물(리튬·구리) 수요, 전력망과 저장 장치 확충 필요", trl: "상용" },
    { id: "eff", g: "red", n: "에너지 효율·수요 감축", r: [0, 7], max: 7, ct: "낮음 (돈이 절약되는 경우가 많음)", col: "#5c9a48",
      pot: "0–7 (건물·산업·수송의 효율, 카드 가정)", per: "영구", risk: "효율이 좋아진 만큼 더 쓰는 반동 효과", trl: "상용" },
    { id: "ind", g: "red", n: "산업 공정 전환", r: [0, 5], max: 5, ct: "중간~높음", col: "#86b86e",
      pot: "0–5 (수소 제철, 시멘트 공정의 탄소 포집, 재활용, 카드 가정)", per: "영구 (포집한 탄소는 지층 저장)", risk: "비용이 높고 설비 교체에 수십 년", trl: "실증~초기 상용" },
    { id: "def", g: "red", n: "산림 파괴 줄이기", r: [0, 3.5], max: 3.5, ct: "낮음~중간", col: "#a9cf8f",
      pot: "0–3.5 (토지 이용 변화 배출 약 4, 카드 가정)", per: "되돌려질 수 있음 (불법 벌채, 산불)", risk: "감시와 제도, 원주민·농민 생계 문제", trl: "상용 (기술보다 정책의 문제)" },
    { id: "ar", g: "cdr", n: "조림·재조림", r: [0.5, 10], max: 10, cost: [0, 240], col: "#2f7f8f", land: 1, rev: 1,
      pot: "0.5–10", per: "수십~수백 년, 산불·가뭄·병충해로 되돌려질 수 있음", risk: "식량과 땅 경쟁, 단일 수종이면 생물 다양성 감소", trl: "TRL 8–9 (상용)" },
    { id: "soil", g: "cdr", n: "토양 탄소 저장", r: [0.6, 9.3], max: 9.3, cost: [45, 100], col: "#4a93a6", rev: 1,
      pot: "0.6–9.3", per: "수십 년, 몇십 년 뒤 포화되고 경작 방식을 되돌리면 다시 배출", risk: "측정·검증이 어려움", trl: "TRL 8–9 (상용)" },
    { id: "beccs", g: "cdr", n: "바이오에너지+CCS", r: [0.5, 11], max: 11, cost: [15, 400], col: "#3f6fa3", land: 1, imm: 1,
      pot: "0.5–11", per: "수천 년 이상 (지층 저장)", risk: "넓은 땅·물·비료가 필요해 식량과 경쟁, 생태계 훼손", trl: "TRL 5–6 (실증)" },
    { id: "dac", g: "cdr", n: "직접 공기 포집(DAC)", r: [5, 40], max: 20, cost: [100, 300], col: "#5b62b5", imm: 1,
      pot: "5–40 (기술적 잠재량, 에너지와 비용이 제약)", per: "수천 년 이상 (지층 저장)", risk: "에너지를 많이 씀(저탄소 전기 필요), 비쌈. 2020년대 초 실제 포집량은 연 1만 톤 수준", trl: "TRL 6 (실증)" },
    { id: "oae", g: "cdr", n: "해양 알칼리화", r: [1, 100], max: 20, cost: [40, 260], col: "#7c59a8", imm: 1,
      pot: "1–100 (불확실성이 매우 큼)", per: "1만 년 이상", risk: "해양 생태계 영향이 거의 연구되지 않음, 효과 검증 어려움", trl: "TRL 1–2 (기초 연구)" },
    { id: "srm", g: "srm", n: "성층권 에어로졸 주입", max: 1.5, unit: "°C", col: "#b5532f",
      pot: "CO₂ 제거 0. 가리는 온난화 0–1.5 °C (이 카드의 범위)", per: "1~2년마다 계속 뿌려야 유지", risk: "해양 산성화는 그대로, 강수 패턴 변화(몬순 약화 가능), 오존 감소, 중단하면 가려진 온난화가 빠르게 돌아오는 종료 충격, 누가 결정할지 국제 규칙 없음", trl: "연구 단계 (실제 배치 없음)" },
    { id: "ad", g: "ad", n: "해안 방재·적응", max: 100, unit: "%", col: "#8d8d92",
      pot: "CO₂ 제거 0. 피해 줄이기 (방파제, 습지 복원, 조기 경보, 내열 작물)", per: "기후가 계속 변하면 계속 높여야 함", risk: "온난화가 클수록 적응의 한계(산호초, 저지대 섬)에 부딪힘", trl: "상용" },
  ];
  const V = {}; O.forEach((o) => (V[o.id] = 0));
  let sel = "dac";
  const cv = $("canvas"), S = fit(cv, () => draw());
  const ROWH = 23, TOP = 92;
  const rowY = (i) => TOP + i * ROWH + (i >= 4 ? 20 : 0) + (i >= 9 ? 20 : 0);
  const fmt = (x) => (Math.abs(x) < 0.05 ? "0" : x.toFixed(1));

  function totals() {
    const sum = (g) => O.filter((o) => o.g === g).reduce((s, o) => s + V[o.id], 0);
    const red = sum("red"), cdr = sum("cdr");
    const cost = O.filter((o) => o.g === "cdr").reduce((s, o) => s + V[o.id] * (o.cost[0] + o.cost[1]) / 2, 0);   // 10억 t × 달러/t = 10억 달러
    return { red, cdr, net: NOW - red - cdr, cost };
  }

  function draw() {
    const { ctx } = S, { w, h } = S.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const t = totals(), L = 8, R = w - 8;
    // 위: 배출 막대
    const sc = (R - L) / 46, bx = (v) => L + v * sc;
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText("현재 CO₂ 순배출 약 40 Gt/년을 무엇으로 채울까", L, 14);
    let x = 0;
    O.forEach((o) => { if (o.g !== "red" && o.g !== "cdr") return; const v = V[o.id]; if (!v) return; ctx.fillStyle = o.col; ctx.fillRect(bx(x), 24, v * sc, 22); x += v; });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(bx(0) + 0.5, 24.5, NOW * sc, 21);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx(NOW), 18); ctx.lineTo(bx(NOW), 52); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    [0, 10, 20, 30].forEach((v) => ctx.fillText(String(v), bx(v) + 2, 62));
    ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText("40 = 순배출 0", bx(NOW) - 3, 62);
    ctx.fillStyle = t.net > 0.5 ? C.warn : C.forest; ctx.textAlign = "left"; ctx.font = `600 10.5px ${F.sans}`;
    if (t.red + t.cdr < 43) ctx.fillText(`남은 배출 ${fmt(t.net)}`, bx(NOW) + 4, 39);
    // 줄마다 슬라이더
    const lx = L, tx0 = 122, tx1 = w - 42;
    const heads = [[0, "배출 줄이기 (감축)"], [4, "공기에서 빼내기 (탄소 제거, 띠 = AR6 잠재량)"], [9, "CO₂를 줄이지 않는 수단"]];
    ctx.font = `600 10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    heads.forEach(([i, s]) => ctx.fillText(s, lx, rowY(i) - 8));
    O.forEach((o, i) => {
      const y = rowY(i) + 8, gmax = o.g === "srm" ? 1.5 : o.g === "ad" ? 100 : 20, X = (v) => tx0 + v / gmax * (tx1 - tx0);
      o._y = y; o._X = X; o._gmax = gmax;
      if (o.id === sel) { ctx.fillStyle = "rgba(116,171,102,.14)"; ctx.fillRect(0, y - 11, w, 22); }
      ctx.font = `${o.id === sel ? 600 : 400} 11px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(o.n, lx, y + 4);
      ctx.fillStyle = "#e4e5de"; ctx.fillRect(tx0, y - 2, tx1 - tx0, 4);
      if (o.r) { ctx.fillStyle = o.g === "cdr" ? "rgba(63,111,163,.22)" : "rgba(59,124,42,.18)"; const r1 = Math.min(o.r[1], gmax); ctx.fillRect(X(o.r[0]), y - 6, X(r1) - X(o.r[0]), 12); if (o.r[1] > gmax) { ctx.fillStyle = "rgba(63,111,163,.5)"; ctx.beginPath(); ctx.moveTo(X(gmax) + 1, y - 6); ctx.lineTo(X(gmax) + 6, y); ctx.lineTo(X(gmax) + 1, y + 6); ctx.fill(); } }
      const v = V[o.id];
      ctx.fillStyle = o.col; ctx.fillRect(tx0, y - 2, X(v) - tx0, 4);
      ctx.beginPath(); ctx.arc(X(v), y, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = v ? C.ink : C.ink3; ctx.textAlign = "right";
      ctx.fillText(o.unit === "°C" ? `${v.toFixed(1)}°C` : o.unit === "%" ? `${Math.round(v)}%` : fmt(v), w - 4, y + 4);
    });
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("0–20 Gt/년", w - 4, rowY(0) - 8);
  }

  function info() {
    const o = O.find((o) => o.id === sel);
    $(".mi-info").innerHTML = `<b>${o.n}</b> · 잠재량 ${o.pot}${o.g === "red" || o.g === "cdr" ? " GtCO₂/년" : ""}` +
      (o.cost ? ` · 비용 ${o.cost[0]}–${o.cost[1]} 달러/tCO₂` : o.ct ? ` · 비용 ${o.ct}` : "") +
      `<br><b>지속성</b> ${o.per} · <b>준비 단계</b> ${o.trl}<br><b>위험·부작용</b> ${o.risk}`;
    const sl = $(".amt"); sl.max = o.max; sl.step = o.g === "ad" ? 5 : o.g === "srm" ? 0.1 : 0.5; sl.value = V[o.id];
    $(".amt-l").textContent = o.n; $(".amt-o").textContent = o.unit === "°C" ? `${V[o.id].toFixed(1)} °C` : o.unit === "%" ? `${Math.round(V[o.id])} %` : `${fmt(V[o.id])} GtCO₂/년`;
  }

  function update() {
    draw(); info();
    const t = totals();
    $(".n-r").textContent = `${fmt(t.red)} Gt`; $(".n-c").textContent = `${fmt(t.cdr)} Gt`;
    $(".n-n").textContent = `${t.net > 0 ? "+" : ""}${fmt(t.net)} Gt`; $(".n-n").className = "n-n " + (Math.abs(t.net) <= 0.5 ? "good" : t.net > 0 ? "bad" : "");
    $(".n-k").textContent = t.cdr ? `약 ${Math.round(t.cost / 100) / 10}조 달러` : "—";
    const f = [];
    if (t.net > 0.5) f.push(`순배출 0까지 ${fmt(t.net)} Gt가 모자랍니다.`);
    else if (t.net < -0.5) f.push(`순배출이 ${fmt(-t.net)} Gt만큼 음수입니다. 대기 중 CO₂를 줄이는 단계로, 대개 순배출 0 이후의 목표입니다.`);
    else f.push("순배출 0에 도달했습니다.");
    const share = t.red + t.cdr ? t.cdr / (t.red + t.cdr) : 0;
    if (share > 0.25) f.push(`줄일 양의 ${Math.round(share * 100)}%를 탄소 제거에 맡겼습니다. 감축을 미루고 아직 대규모로 검증되지 않은 제거에 기대는 계획은 실패하면 되돌리기 어렵습니다.`);
    if (t.red >= 30 && t.cdr > 0 && share <= 0.25) f.push("감축이 중심이고 탄소 제거는 줄이기 어려운 나머지 배출을 상쇄합니다. IPCC 경로와 같은 짜임입니다.");
    const land = O.filter((o) => o.land).reduce((s, o) => s + V[o.id], 0);
    if (land > 6) f.push(`조림과 바이오에너지에 ${fmt(land)} Gt를 맡기면 아주 넓은 땅과 물이 필요해 식량 생산·생태계와 경쟁합니다.`);
    const imm = O.filter((o) => o.imm).reduce((s, o) => s + V[o.id], 0);
    if (imm > 4) f.push(`준비 단계가 실증 이하인 기술에 ${fmt(imm)} Gt를 기대고 있습니다.`);
    const rev = O.filter((o) => o.rev).reduce((s, o) => s + V[o.id], 0);
    if (rev > 4) f.push(`숲·흙에 저장한 ${fmt(rev)} Gt는 산불·가뭄·경작 변화로 다시 나올 수 있습니다.`);
    const hiO = O.filter((o) => o.g === "cdr" && V[o.id] > o.r[0] + (Math.min(o.r[1], o.max) - o.r[0]) / 2 + 0.01).map((o) => o.n);
    if (hiO.length) f.push(`${hiO.join(", ")}은(는) 잠재량 범위의 위쪽을 골랐습니다. 낙관적인 가정입니다.`);
    if (V.srm > 0) f.push(`성층권 에어로졸이 ${V.srm.toFixed(1)} °C를 가려도 CO₂는 그대로라 바다의 산성화는 계속되고, 뿌리기를 멈추면 가려진 온난화가 몇 년~십여 년 사이에 빠르게 돌아옵니다(종료 충격).`);
    if (V.ad > 0) f.push("적응은 이미 피할 수 없는 피해를 줄이지만 온난화 자체를 멈추지는 못합니다.");
    const v = $(".verdict");
    v.className = "verdict small " + (Math.abs(t.net) <= 0.5 && share <= 0.25 && !V.srm ? "good" : "bad");
    v.textContent = f.join(" ");
  }

  // 캔버스: 줄을 누르거나 끌어서 양을 정함
  let drag = null;
  const at = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const setFrom = (o, px) => { const raw = (px - 122) / (S.size.w - 42 - 122) * o._gmax, st = o.g === "ad" ? 5 : o.g === "srm" ? 0.1 : 0.5; V[o.id] = NM.clamp(Math.round(raw / st) * st, 0, o.max); };
  cv.addEventListener("pointerdown", (e) => {
    const [px, py] = at(e), o = O.find((o) => Math.abs(py - o._y) <= 11); if (!o) return;
    sel = o.id; if (px >= 112) { drag = o; setFrom(o, px); cv.setPointerCapture(e.pointerId); } presetOff(); update();
  });
  cv.addEventListener("pointermove", (e) => { if (!drag) return; setFrom(drag, at(e)[0]); update(); });
  cv.addEventListener("pointerup", () => { drag = null; });
  $(".amt").addEventListener("input", () => { V[sel] = +$(".amt").value; presetOff(); update(); });
  const presetOff = () => root.querySelectorAll(".mix [data-p]").forEach((x) => x.setAttribute("aria-pressed", "false"));
  const P = {
    red: { ren: 19, eff: 6.5, ind: 4.5, def: 3, ar: 2.5, soil: 1.5, beccs: 1.5, dac: 1.5 },
    cdr: { ren: 8, eff: 2, ind: 1, def: 1, ar: 8, soil: 6, beccs: 8, dac: 6 },
    srm: { ren: 8, eff: 2, srm: 1, ad: 50 },
    zero: {},
  };
  $(".mix").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    O.forEach((o) => (V[o.id] = P[b.dataset.p][o.id] || 0));
    root.querySelectorAll(".mix [data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  });
  update();
  if (/[?&]demo\b/.test(location.search)) { root.querySelector('[data-p="red"]').click(); sel = "dac"; update(); }
})();
