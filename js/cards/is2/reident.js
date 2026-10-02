/* 카드: 이름을 지운 자료로도 나를 찾아낼 수 있을까? — 가상 주민 1만 명, 준식별자 조합의 유일성, 범주화 */
(() => {
  const root = document.getElementById("card-is2-reident");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const BLOOD = ["A", "A", "A", "B", "B", "O", "O", "O", "AB"];
  const P = Array.from({ length: 10000 }, () => ({ sex: rnd() < 0.5 ? 0 : 1, year: 1936 + Math.floor(rnd() * 90), bday: Math.floor(rnd() * 365), dong: Math.floor(rnd() * 20), blood: BLOOD[Math.floor(rnd() * BLOOD.length)] }));
  const on = new Set(["sex", "year", "dong"]);
  const { ctx, size } = fit($("canvas"), () => draw());
  function key(p) {
    const k = [];
    if (on.has("sex")) k.push(p.sex);
    if (on.has("year")) k.push($(".age10").checked ? Math.floor(p.year / 10) : p.year);
    if (on.has("bday")) k.push(p.bday);
    if (on.has("dong")) k.push($(".gu").checked ? Math.floor(p.dong / 5) : p.dong);
    if (on.has("blood")) k.push(p.blood);
    return k.join("|");
  }
  function stats() {
    const m = new Map(); P.forEach((p) => { const k = key(p); m.set(k, (m.get(k) || 0) + 1); });
    let uniq = 0, small = 0; P.forEach((p) => { const n = m.get(key(p)); if (n === 1) uniq++; if (n < 5) small++; });
    // 쓸모: 켠 항목의 세밀함 (log2 조합 수)
    const bits = (on.has("sex") ? 1 : 0) + (on.has("year") ? ($(".age10").checked ? 3.2 : 6.5) : 0) + (on.has("bday") ? 8.5 : 0) + (on.has("dong") ? ($(".gu").checked ? 2 : 4.3) : 0) + (on.has("blood") ? 1.8 : 0);
    return { uniq, small, groups: m.size, sizes: [...m.values()], bits };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = stats();
    // 100 × 100 점: 혼자뿐인 사람은 빨강, 5명 미만 주황, 나머지 회색
    const m = new Map(); P.forEach((p) => { const k = key(p); m.set(k, (m.get(k) || 0) + 1); });
    const cols = 125, rows = 80, cw = Math.min((w * 0.62) / cols, (h - 20) / rows);
    P.forEach((p, i) => { const n = m.get(key(p)); ctx.fillStyle = n === 1 ? "#c8463a" : n < 5 ? "#e8a33a" : "#c9c9cf"; ctx.fillRect(10 + (i % cols) * cw, 10 + Math.floor(i / cols) * cw, cw - 0.4, cw - 0.4); });
    const tx = 10 + cols * cw + 18;
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("주민 10,000명", tx, 26);
    ctx.font = `11.5px ${F.sans}`;
    [["#c8463a", "그 조합에 혼자뿐"], ["#e8a33a", "2~4명"], ["#c9c9cf", "5명 이상"]].forEach(([c, t], i) => { ctx.fillStyle = c; ctx.fillRect(tx, 40 + i * 18, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText(t, tx + 16, 49 + i * 18); });
    ctx.fillStyle = C.ink2; ctx.fillText(`서로 다른 조합 ${s.groups.toLocaleString()}가지`, tx, 110);
    $(".n-u").textContent = `${(s.uniq / 100).toFixed(1)}%`; $(".n-u").className = "n-u " + (s.uniq > 100 ? "bad" : "good");
    $(".n-k").textContent = `${(s.small / 100).toFixed(1)}%`;
    $(".n-v").textContent = s.bits < 6 ? "낮음" : s.bits < 10 ? "보통" : "높음";
  }
  $(".cols").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b) return; const c = b.dataset.c; on.has(c) ? on.delete(c) : on.add(c); b.setAttribute("aria-pressed", String(on.has(c))); draw(); });
  root.querySelectorAll(".age10, .gu").forEach((el) => el.addEventListener("change", draw));
  draw();
})();
