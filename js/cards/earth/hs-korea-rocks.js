/* 카드: 한반도의 암석은 언제 만들어졌을까? — 장소를 지질 시대 위에 놓아 보기 */
(() => {
  const root = document.getElementById("card-earth-korea-rocks");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), fb = $(".feedback"), score = $(".score");

  // 눈금: 대마다 폭을 따로 준다 (실제 비율 아님)
  const ERA = [
    { k: "pc", name: "선캄브리아 시대", a: 4600, b: 538.8, w: 0.18, col: "#c9c4d9" },
    { k: "pz", name: "고생대", a: 538.8, b: 251.9, w: 0.3, col: "#b5d1c2" },
    { k: "mz", name: "중생대", a: 251.9, b: 66, w: 0.3, col: "#bcd6e6" },
    { k: "cz", name: "신생대", a: 66, b: 0, w: 0.22, col: "#efe1a0" },
  ];
  // 한반도의 주요 지층·암석 (시기는 대략값)
  const UNIT = [
    { k: "gn", name: "편마암·편암 (육괴)", a: 2500, b: 1700, row: 0 },
    { k: "js", name: "조선 누층군 (바다, 석회암)", a: 520, b: 460, row: 0 },
    { k: "gap", name: "퇴적층 거의 없음", a: 460, b: 330, row: 1, gap: true },
    { k: "py", name: "평안 누층군 (석탄층)", a: 320, b: 245, row: 0 },
    { k: "dd", name: "대동 누층군", a: 200, b: 165, row: 0 },
    { k: "db", name: "대보 화강암", a: 190, b: 160, row: 1 },
    { k: "gs", name: "경상 누층군 등 백악기 퇴적층", a: 140, b: 70, row: 0 },
    { k: "cv", name: "백악기 화산암", a: 100, b: 66, row: 1 },
    { k: "bg", name: "불국사 화강암", a: 90, b: 60, row: 2 },
    { k: "q", name: "제4기 화산암", a: 2.58, b: 0, row: 0 },
  ];
  const SITE = [
    { k: "gumunso", name: "태백 구문소", era: "pz", unit: "js", why: "석회암 속에 삼엽충 화석이 있습니다. 고생대 초 얕은 바다에서 쌓인 조선 누층군입니다." },
    { k: "bukhan", name: "서울 북한산 봉우리", era: "mz", unit: "db", why: "중생대 쥐라기에 지하에서 굳은 대보 화강암이 오랜 침식으로 드러난 것입니다." },
    { k: "cheongsong", name: "청송 신성리 공룡 발자국", era: "mz", unit: "gs", why: "공룡 발자국이 찍힌 퇴적층입니다. 공룡은 중생대에 살았고, 이 지층은 백악기 호수 가장자리에서 쌓였습니다." },
    { k: "chaeseok", name: "부안 채석강 해안 절벽", era: "mz", unit: "gs", why: "책을 쌓은 듯한 층리가 보이는 중생대 백악기 퇴적암입니다." },
    { k: "maisan", name: "진안 마이산", era: "mz", unit: "gs", why: "자갈이 굳은 역암으로 된 산입니다. 중생대 백악기 호수에 쌓인 퇴적층입니다." },
    { k: "mudeung", name: "무등산 입석대·서석대", era: "mz", unit: "cv", why: "중생대 백악기 화산 활동으로 쌓인 암석이 식으며 갈라진 주상 절리입니다." },
    { k: "hantan", name: "한탄강 현무암 협곡", era: "cz", unit: "q", why: "신생대 제4기에 분출한 현무암 용암이 옛 골짜기를 메웠고, 그 뒤 강이 다시 깎아 협곡이 되었습니다." },
    { k: "seongsan", name: "제주 성산일출봉", era: "cz", unit: "q", why: "신생대 제4기에 마그마가 얕은 바닷물과 만나 격렬하게 분출해 만든 화산체입니다." },
  ];
  let sel = null; const placed = {};

  const { ctx, size } = fit(cv, () => draw());
  let geo = null;
  function layout(w) {
    const L = 10, W = w - 20; let x = L; const seg = {};
    ERA.forEach((e) => { seg[e.k] = { x0: x, x1: x + e.w * W }; x += e.w * W; });
    const X = (t) => { const e = ERA.find((q) => t <= q.a && t >= q.b) || ERA[3]; const s = seg[e.k]; return s.x0 + (e.a - t) / (e.a - e.b) * (s.x1 - s.x0); };
    return { seg, X };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    geo = layout(w); const { seg, X } = geo;
    const ey = 30, eh = 34;
    ERA.forEach((e) => {
      const s = seg[e.k], on = sel && placed[sel.k] === undefined;
      ctx.fillStyle = e.col; ctx.fillRect(s.x0, ey, s.x1 - s.x0 - 2, eh);
      ctx.font = `600 12.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.fillText(e.name, (s.x0 + s.x1) / 2, ey + eh / 2 + 5);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
      ctx.fillText(e.a >= 1000 ? `${e.a / 100}억` : `${(e.a / 100).toFixed(e.a < 100 ? 2 : 1)}억`, s.x0 + 14, ey + eh + 12);
    });
    ctx.fillText("현재", w - 22, ey + eh + 12);
    ctx.textAlign = "left";
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText(sel && placed[sel.k] === undefined ? `‘${sel.name}’을(를) 놓을 시대를 누르세요` : "장소를 고른 뒤 시대 띠를 누르세요", 10, 16);
    // 한반도 지층 막대
    const uy = ey + eh + 26;
    ctx.fillText("한반도의 주요 지층·암석 (시기는 대략값, 대마다 눈금이 다름)", 10, uy);
    UNIT.forEach((u) => {
      const x0 = X(u.a), x1 = Math.max(X(u.b), x0 + 4), y = uy + 10 + u.row * 42;
      const hit = SITE.some((s) => placed[s.k] === true && s.unit === u.k);
      ctx.fillStyle = u.gap ? "transparent" : hit ? C.forest : "#8d8d92";
      if (u.gap) { ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.strokeRect(x0 + .5, y + .5, x1 - x0, 9); ctx.setLineDash([]); }
      else ctx.fillRect(x0, y, x1 - x0, 10);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = u.gap ? C.ink3 : C.ink2;
      const tw = ctx.measureText(u.name).width;
      let tx = (x0 + x1) / 2 - tw / 2; tx = clamp(tx, 4, w - tw - 4);
      ctx.fillText(u.name, tx, y + 24);
    });
    // 놓은 장소 표시
    const my = uy + 10 + 3 * 42 + 6;
    const byUnit = {};
    SITE.forEach((s) => {
      if (placed[s.k] !== true) return;
      const u = UNIT.find((q) => q.k === s.unit), x = (X(u.a) + Math.max(X(u.b), X(u.a) + 4)) / 2;
      const n = byUnit[s.unit] = (byUnit[s.unit] || 0) + 1;
      const y = my + (n - 1) * 17;
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink;
      const tw = ctx.measureText(s.name).width, right = x + 8 + tw > w - 4;
      ctx.textAlign = right ? "right" : "left"; ctx.fillText(s.name, x + (right ? -8 : 8), y + 4); ctx.textAlign = "left";
    });
  }
  function syncChips() {
    root.querySelectorAll("[data-site]").forEach((b) => {
      const k = b.dataset.site;
      b.setAttribute("aria-pressed", sel && sel.k === k ? "true" : "false");
      b.classList.toggle("done", placed[k] === true);
    });
    score.textContent = `${Object.values(placed).filter((v) => v === true).length} / ${SITE.length}곳`;
  }
  root.querySelectorAll("[data-site]").forEach((b) => b.addEventListener("click", () => {
    sel = SITE.find((s) => s.k === b.dataset.site);
    if (placed[sel.k] === true) { fb.className = "feedback small good"; fb.textContent = sel.why; }
    else { delete placed[sel.k]; fb.className = "feedback small"; fb.textContent = "이 장소의 암석이 만들어진 시대를 위 띠에서 누르세요."; }
    syncChips(); draw();
  }));
  cv.addEventListener("click", (e) => {
    if (!sel || !geo || placed[sel.k] === true) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (y > 80) return;
    const era = ERA.find((q) => x >= geo.seg[q.k].x0 && x <= geo.seg[q.k].x1);
    if (!era) return;
    if (era.k === sel.era) { placed[sel.k] = true; fb.className = "feedback small good"; fb.innerHTML = `<b>맞습니다.</b> ${sel.why}`; }
    else {
      fb.className = "feedback small bad";
      const hint = sel.era === "cz" ? "화산 지형이 아직 뚜렷하게 남아 있다는 점을 생각해 보세요." : sel.unit === "gs" ? "공룡이 살던 시대의 호수와 강에서 쌓인 지층입니다." : sel.unit === "js" ? "삼엽충은 어느 시대의 바다에 살았나요?" : sel.unit === "db" ? "화강암은 지하 깊은 곳에서 굳습니다. 한반도에는 중생대에 큰 화강암이 두 차례 들어왔습니다." : "이 암석이 쌓이거나 굳은 시기를 다시 생각해 보세요.";
      fb.textContent = `${era.name}가 아닙니다. ${hint}`;
    }
    syncChips(); draw();
  });
  syncChips();
})();
