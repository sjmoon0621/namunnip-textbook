/* 카드: 항생제는 왜 감기 바이러스에 듣지 않을까? — 병원체의 구조와 약의 표적 (선택 독성, 모식 그림) */
(() => {
  const root = document.getElementById("card-bio-pathogen");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const msg = $(".pa-msg"), res = [...root.querySelectorAll(".pa-res dd")];
  const HIT = C.warn;

  // 약의 표적: wall(펩티도글리칸 세포벽), r70(세균 리보솜), na(인플루엔자 뉴라미니데이스), erg(에르고스테롤)
  const DRUG = {
    pen: { target: "wall", name: "페니실린", text: "페니실린은 세균 세포벽(펩티도글리칸)을 만드는 효소를 막습니다. 세포벽이 없는 사람 세포, 진균, 바이러스에는 표적이 없습니다." },
    tet: { target: "r70", name: "테트라사이클린", text: "테트라사이클린은 세균의 리보솜에 붙어 단백질 합성을 막습니다. 사람 리보솜은 모양이 달라 잘 붙지 않습니다. 다만 사람 미토콘드리아의 리보솜은 세균과 비슷해서 부작용이 생길 수 있습니다." },
    osel: { target: "na", name: "오셀타미비르", text: "오셀타미비르는 인플루엔자 바이러스의 뉴라미니데이스를 막아, 새로 만들어진 바이러스가 세포에서 떨어져 나가지 못하게 합니다. 이 효소가 없는 감기 바이러스나 세균에는 듣지 않습니다." },
    azole: { target: "erg", name: "아졸계 항진균제", text: "아졸계 약은 진균 세포막의 에르고스테롤 합성을 막습니다. 사람 세포막은 콜레스테롤을 쓰지만 합성 과정이 비슷해, 세균에 쓰는 약보다 부작용을 더 조심해야 합니다." },
  };
  const HAS = { bact: ["wall", "r70"], virus: ["na"], fungus: ["erg"], human: [] };
  let drug = "pen", flu = true;

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const cols = 2, rows = 2, pw = w / cols, ph = h / rows;
    const panels = [["bact", "세균", "약 1–5 μm"], ["virus", flu ? "바이러스 (인플루엔자)" : "바이러스 (감기, 리노바이러스)", "약 0.02–0.3 μm"], ["fungus", "진균 (효모)", "약 3–5 μm"], ["human", "사람 세포", "약 10–30 μm"]];
    const tgt = DRUG[drug].target;
    panels.forEach(([k, name, sz], i) => {
      const x = (i % cols) * pw, y = Math.floor(i / cols) * ph;
      ctx.fillStyle = i % 3 === 0 ? "#f6f1e4" : "#f1ede0"; ctx.fillRect(x + 2, y + 2, pw - 4, ph - 4);
      const cx = x + pw / 2, cy = y + ph * 0.52, r = Math.min(pw, ph) * 0.3;
      ctx.save();
      const on = (part) => part === tgt && (part !== "na" || flu);
      if (k === "bact") bact(cx, cy, r, on);
      if (k === "virus") virus(cx, cy, r, on);
      if (k === "fungus") fungus(cx, cy, r, on);
      if (k === "human") human(cx, cy, r, on);
      ctx.restore();
      const hit = HAS[k].includes(tgt) && (tgt !== "na" || flu);
      ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(name, x + 10, y + 18);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.fillText(sz, x + 10, y + 32);
      ctx.textAlign = "right"; ctx.font = `600 11px ${F.sans}`; ctx.fillStyle = hit ? HIT : C.ink3;
      ctx.fillText(hit ? "표적 있음 → 증식 억제" : "표적 없음", x + pw - 10, y + ph - 10);
    });
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("크기는 같은 비율이 아님", 10, h - 8);
  }

  const X = (cx, cy, s) => { ctx.strokeStyle = HIT; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s); ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s); ctx.stroke(); };
  const ribos = (cx, cy, r, n, big, col) => { ctx.fillStyle = col; for (let i = 0; i < n; i++) { const a = i * 2.4, d = r * (0.35 + 0.5 * ((i * 37) % 10) / 10); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, big ? 2.6 : 1.9, 0, Math.PI * 2); ctx.fill(); } };

  function bact(cx, cy, r, on) {
    const rw = r * 1.3, rh = r * 0.65;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx + rw, cy); ctx.bezierCurveTo(cx + rw + 20, cy - 10, cx + rw + 30, cy + 14, cx + rw + 44, cy + 2); ctx.stroke(); // 편모
    ctx.fillStyle = "#e9eee3"; ctx.strokeStyle = on("wall") ? HIT : "#6e8a5f"; ctx.lineWidth = on("wall") ? 5 : 4;
    ctx.beginPath(); ctx.roundRect(cx - rw, cy - rh, rw * 2, rh * 2, rh); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(cx - rw + 5, cy - rh + 5, rw * 2 - 10, rh * 2 - 10, rh - 5); ctx.stroke();
    ctx.strokeStyle = "#8a6b3a"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(cx - rw * 0.2, cy, rw * 0.35, rh * 0.35, 0.3, 0, Math.PI * 2); ctx.stroke(); // 원형 DNA
    ribos(cx + rw * 0.3, cy, rh * 0.9, 12, false, on("r70") ? HIT : C.ink2);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("세포벽", cx, cy - rh - 7);
    ctx.fillText("리보솜(작은 것)", cx + rw * 0.3, cy + rh + 14);
    if (on("wall")) X(cx - rw, cy - rh * 0.3, 6);
    if (on("r70")) X(cx + rw * 0.45, cy, 6);
  }
  function virus(cx, cy, r, on) {
    const rr = r * 0.62;
    ctx.fillStyle = "#efe7f3"; ctx.strokeStyle = "#7a5aa6"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 표면 단백질
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2, x0 = cx + Math.cos(a) * rr, y0 = cy + Math.sin(a) * rr;
      const na = flu && i % 3 === 0;
      ctx.strokeStyle = na ? (on("na") ? HIT : "#b0853a") : "#7a5aa6"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(a) * 9, y0 + Math.sin(a) * 9); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(x0 + Math.cos(a) * 10, y0 + Math.sin(a) * 10, na ? 3 : 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = "#8a6b3a"; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const t = i / 40; const x = cx - rr * 0.55 + t * rr * 1.1, y = cy + Math.sin(t * 12) * rr * 0.2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("유전 물질 + 단백질 껍질", cx, cy + rr + 24);
    ctx.fillText("세포벽·리보솜 없음", cx, cy + rr + 37);
    if (flu && on("na")) X(cx + rr + 10, cy, 6);
  }
  function fungus(cx, cy, r, on) {
    const rr = r * 0.85;
    ctx.fillStyle = "#f3ecd9"; ctx.strokeStyle = "#b09a50"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = on("erg") ? HIT : C.ink2; ctx.lineWidth = on("erg") ? 2.5 : 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, rr - 5, rr * 0.8 - 5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#d8cfe6"; ctx.beginPath(); ctx.arc(cx - rr * 0.25, cy, rr * 0.28, 0, Math.PI * 2); ctx.fill();
    ribos(cx + rr * 0.3, cy, rr * 0.45, 10, true, C.ink2);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = on("erg") ? HIT : C.ink2; ctx.textAlign = "center";
    ctx.fillText("세포막: 에르고스테롤", cx, cy + rr * 0.8 + 14);
    ctx.fillStyle = C.ink2; ctx.fillText("핵", cx - rr * 0.25, cy + 4);
    if (on("erg")) X(cx + rr - 3, cy - rr * 0.4, 6);
  }
  function human(cx, cy, r, on) {
    const rr = r * 0.95;
    ctx.fillStyle = "#f7e9e2"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, d = rr * (1 + 0.06 * Math.sin(a * 5)); const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#d8cfe6"; ctx.beginPath(); ctx.arc(cx - rr * 0.2, cy, rr * 0.3, 0, Math.PI * 2); ctx.fill();
    ribos(cx + rr * 0.35, cy, rr * 0.45, 12, true, C.ink2);
    ctx.fillStyle = "#e8b27a"; ctx.beginPath(); ctx.ellipse(cx + rr * 0.1, cy - rr * 0.45, 8, 4, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("세포벽 없음 · 세포막: 콜레스테롤", cx, cy + rr * 0.8 + 16);
    ctx.fillText("핵", cx - rr * 0.2, cy + 4);
    ctx.fillText("미토콘드리아", cx + rr * 0.1, cy - rr * 0.45 - 8);
    void on;
  }

  function update() {
    const d = DRUG[drug];
    const tgt = d.target;
    ["bact", "virus", "fungus", "human"].forEach((k, i) => {
      const hit = HAS[k].includes(tgt) && (tgt !== "na" || flu);
      res[i].textContent = hit ? "듣는다" : "안 듣는다";
      res[i].className = hit ? "good" : "";
    });
    msg.textContent = (drug === "osel" && !flu) ? "감기 바이러스에는 뉴라미니데이스가 없습니다. 같은 ‘항바이러스제’라도 표적이 있는 바이러스에만 듣습니다." : d.text;
    draw();
  }
  root.querySelectorAll("[data-drug]").forEach((b) => b.addEventListener("click", () => {
    drug = b.dataset.drug;
    root.querySelectorAll("[data-drug]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  root.querySelectorAll("[data-flu]").forEach((b) => b.addEventListener("click", () => {
    flu = b.dataset.flu === "1";
    root.querySelectorAll("[data-flu]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  update();
})();
