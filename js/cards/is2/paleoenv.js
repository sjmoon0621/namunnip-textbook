/* 카드: 지층 속 화석만 보고 그때 그곳의 모습을 그릴 수 있을까? — 화석 조건의 교집합으로 고환경 추론 */
(() => {
  const root = document.getElementById("card-is2-paleoenv");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  // 조건: 장소 (sea 바다, shore 물가·얕은 호수, land 육지), 깊이(바다일 때), 기후
  const FOS = {
    coral: ["산호", { place: ["sea"], depth: ["shallow"], climate: ["warm"] }],
    clam: ["조개", { place: ["sea", "shore"] }],
    trilo: ["삼엽충", { place: ["sea"] }],
    fern: ["고사리", { place: ["land", "shore"], climate: ["warm"], wet: true }],
    track: ["공룡 발자국", { place: ["shore"] }],
    mammoth: ["매머드", { place: ["land"], climate: ["cold"] }],
    leaf: ["활엽수 잎", { place: ["land", "shore"] }],
    forams: ["심해 유공충", { place: ["sea"], depth: ["deep"] }],
  };
  const LAY = { a: ["coral", "clam", "trilo"], b: ["fern", "track", "leaf"], c: ["coral", "mammoth"] };
  let sel = new Set(["coral", "clam"]);
  $(".fos").insertAdjacentHTML("beforeend", Object.entries(FOS).map(([k, f]) => `<button class="chip" data-f="${k}" aria-pressed="false">${f[0]}</button>`).join(""));
  const { ctx, size } = fit($("canvas"), () => draw());
  function infer() {
    let place = ["sea", "shore", "land"], depth = ["shallow", "deep"], climate = ["warm", "cold"], wet = false;
    sel.forEach((k) => { const c = FOS[k][1]; if (c.place) place = place.filter((p) => c.place.includes(p)); if (c.depth) depth = depth.filter((d) => c.depth.includes(d)); if (c.climate) climate = climate.filter((x) => c.climate.includes(x)); if (c.wet) wet = true; });
    if (place.length && !place.includes("sea")) depth = [];
    return { place, depth, climate, wet, ok: place.length > 0 && climate.length > 0 && (!place.every((p) => p === "sea") || depth.length > 0) };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = infer();
    const warm = r.climate.length === 1 ? r.climate[0] === "warm" : null;
    ctx.fillStyle = warm === null ? "#dfe5ea" : warm ? "#f6e3b5" : "#dbe6f2"; ctx.fillRect(0, 0, w, h * 0.45);
    if (!r.ok) {
      ctx.fillStyle = "#e9e3d6"; ctx.fillRect(0, h * 0.45, w, h * 0.55);
      ctx.fillStyle = C.warn; ctx.font = `600 16px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("조건이 서로 맞지 않습니다", w / 2, h * 0.55); ctx.font = `12px ${F.sans}`; ctx.fillText("운반되었거나, 다른 시대의 화석이 섞였을까요?", w / 2, h * 0.55 + 22);
    } else {
      const sea = r.place.includes("sea"), shore = r.place.includes("shore"), land = r.place.includes("land");
      // 왼쪽 육지 → 오른쪽 바다 단면
      const x1 = land && !sea ? w : shore && !sea ? w * 0.7 : land || shore ? w * 0.35 : 0;
      ctx.fillStyle = warm === false ? "#cfd9c6" : "#a9c98b"; ctx.fillRect(0, h * 0.45, x1, h * 0.55);
      if (x1 < w) { const deep = r.depth.length === 1 && r.depth[0] === "deep"; ctx.fillStyle = deep ? "#3f6fa3" : "#7fb7d8"; ctx.fillRect(x1, h * 0.45, w - x1, h * 0.55); ctx.fillStyle = "#e3d3a8"; ctx.beginPath(); ctx.moveTo(x1, h * 0.45); ctx.lineTo(w, deep ? h * 0.98 : h * 0.75); ctx.lineTo(w, h); ctx.lineTo(x1, h); ctx.fill(); }
      if (shore && x1 < w) { ctx.fillStyle = "#c9b98a"; ctx.fillRect(x1 - 30, h * 0.45, 60, 8); }
      // 화석 아이콘
      let i = 0;
      sel.forEach((k) => { const n = FOS[k][0]; const x = 24 + (i % 4) * (w - 48) / 4 + 30, y = h * 0.62 + Math.floor(i / 4) * 30; ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(x - 34, y - 13, 68, 20); ctx.fillStyle = C.ink; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(n, x, y + 1); i++; });
    }
    const K = { sea: "바다", shore: "물가·얕은 호수", land: "육지", shallow: "얕음", deep: "깊음", warm: "따뜻함", cold: "추움" };
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(r.ok ? `장소: ${r.place.map((p) => K[p]).join(" 또는 ")}` : "추론 불가", 12, 22);
    ctx.font = `12px ${F.sans}`;
    if (r.ok) { ctx.fillText(`기후: ${r.climate.length === 2 ? "알 수 없음" : K[r.climate[0]]}${r.wet ? ", 습함" : ""}${r.depth.length === 1 ? ` · 바다 깊이: ${K[r.depth[0]]}` : ""}`, 12, 42); }
    const v = $(".verdict");
    v.textContent = !r.ok ? "서로 맞지 않는 조건입니다. 한 지층에 함께 있다면 운반·재퇴적을 의심해야 합니다." : r.place.length === 1 && r.climate.length === 1 ? "환경이 하나로 좁혀졌습니다. 범위가 좁은 화석(산호, 매머드, 공룡 발자국)이 결정적인 역할을 했습니다." : "아직 여러 환경이 가능합니다. 사는 환경이 좁은 화석이 하나 더 있으면 좁힐 수 있습니다.";
    v.className = "verdict small " + (!r.ok ? "bad" : r.place.length === 1 && r.climate.length === 1 ? "good" : "");
    root.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(sel.has(b.dataset.f))));
  }
  root.addEventListener("click", (e) => {
    const f = e.target.closest("[data-f]"), l = e.target.closest("[data-l]");
    if (f) { sel.has(f.dataset.f) ? sel.delete(f.dataset.f) : sel.add(f.dataset.f); draw(); }
    if (l) { sel = new Set(LAY[l.dataset.l]); draw(); }
  });
  draw();
})();
