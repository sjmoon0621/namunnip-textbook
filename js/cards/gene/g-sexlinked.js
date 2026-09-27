/* 카드: 색맹은 왜 남자에게 더 많을까? — 퍼넷 사각형, 상염색체 vs X 연관 */
(() => {
  const root = document.getElementById("card-gene-sexlinked");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), bm = $(".mom"), bd = $(".dad"), nD = $(".n-d"), nS = $(".n-s");
  // 유전자형: 생식세포 목록. 표기용 문자열
  const G = {
    auto: { mom: [["AA", ["A", "A"]], ["Aa (보인자)", ["A", "a"]], ["aa (알비노)", ["a", "a"]]], dad: [["AA", ["A", "A"]], ["Aa (보인자)", ["A", "a"]], ["aa (알비노)", ["a", "a"]]] },
    x: { mom: [["XᴿXᴿ", ["Xᴿ", "Xᴿ"]], ["XᴿXʳ (보인자)", ["Xᴿ", "Xʳ"]], ["XʳXʳ (색맹)", ["Xʳ", "Xʳ"]]], dad: [["XᴿY", ["Xᴿ", "Y"]], ["XʳY (색맹)", ["Xʳ", "Y"]]] },
  };
  let t = "x", mi = 1, di = 0;
  function child(e, s) { // 난자 e, 정자 s → [표기, 성별, 형질 있음?, 보인자?]
    if (t === "auto") { const g = [e, s].sort().join(""), sex = null; return [g, sex, g === "aa", g === "Aa"]; }
    const male = s === "Y", g = male ? `${e}Y` : (e === "Xᴿ" ? e + s : s + e), rec = male ? e === "Xʳ" : e === "Xʳ" && s === "Xʳ";
    return [g, male ? "M" : "F", rec, !male && (e === "Xʳ") !== (s === "Xʳ")];
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const eggs = G[t].mom[mi][1], sperm = G[t].dad[di][1], cs = Math.min((w * 0.5) / 3, (h - 30) / 3), ox = 16 + cs, oy = 14 + cs * 0.6;
    ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillStyle = "#3f6fa3"; sperm.forEach((s, j) => ctx.fillText(s, ox + cs * (j + 0.5), oy - 8)); ctx.font = `10px ${F.sans}`; ctx.fillText("아버지의 정자", ox + cs, oy - 26);
    ctx.fillStyle = "#c0392b"; ctx.font = `600 13px ${F.sans}`; eggs.forEach((e, i) => ctx.fillText(e, ox - cs * 0.35, oy + cs * (i + 0.55))); ctx.save(); ctx.translate(12, oy + cs); ctx.rotate(-Math.PI / 2); ctx.font = `10px ${F.sans}`; ctx.fillText("어머니의 난자", 0, 0); ctx.restore();
    const tally = { F: [0, 0, 0], M: [0, 0, 0], A: [0, 0, 0] };
    eggs.forEach((e, i) => sperm.forEach((s, j) => {
      const [g, sex, aff, car] = child(e, s), x = ox + cs * j, y = oy + cs * i;
      ctx.fillStyle = aff ? "rgba(181,83,47,.3)" : car ? "rgba(224,160,42,.2)" : "#fff"; ctx.fillRect(x, y, cs, cs); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.strokeRect(x, y, cs, cs);
      ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(g, x + cs / 2, y + cs / 2 - 2);
      ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText(`${sex === "M" ? "아들 · " : sex === "F" ? "딸 · " : ""}${aff ? (t === "x" ? "색맹" : "알비노") : car ? "보인자" : "정상"}`, x + cs / 2, y + cs / 2 + 14);
      const k = sex || "A"; tally[k][aff ? 2 : car ? 1 : 0]++;
    }));
    // 막대
    const bx = ox + cs * 2 + 30, bw = w - bx - 14, groups = t === "x" ? [["딸", "F"], ["아들", "M"]] : [["딸", "A"], ["아들", "A"]];
    groups.forEach(([lab, k], gi) => {
      const y = oy + 10 + gi * 60, tot = tally[k].reduce((a, b) => a + b, 0) || 1; let x = bx;
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, bx, y - 6);
      [["#e7efe3", "정상"], ["rgba(224,160,42,.5)", "보인자"], ["rgba(181,83,47,.7)", t === "x" ? "색맹" : "알비노"]].forEach(([col, nm], q) => { const f = tally[k][q] / tot, ww = f * bw; if (ww <= 0) return; ctx.fillStyle = col; ctx.fillRect(x, y, ww, 22); ctx.fillStyle = C.ink; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; if (ww > 34) ctx.fillText(`${nm} ${Math.round(f * 100)}%`, x + ww / 2, y + 15); x += ww; });
    });
  }
  function chips() {
    bm.innerHTML = `<span class="mono small" style="align-self:center">어머니</span>` + G[t].mom.map(([l], i) => `<button type="button" class="chip" data-m="${i}" aria-pressed="${i === mi}">${l}</button>`).join("");
    bd.innerHTML = `<span class="mono small" style="align-self:center">아버지</span>` + G[t].dad.map(([l], i) => `<button type="button" class="chip" data-f="${i}" aria-pressed="${i === di}">${l}</button>`).join("");
    bm.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mi = +b.dataset.m; update(); }));
    bd.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { di = +b.dataset.f; update(); }));
  }
  function update() {
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === t))); chips();
    const eggs = G[t].mom[mi][1], sperm = G[t].dad[di][1], d = [0, 0, 0], s = [0, 0, 0], name = t === "x" ? "색맹" : "알비노";
    eggs.forEach((e) => sperm.forEach((q) => { const [, sex, aff, car] = child(e, q); const arr = t === "x" ? (sex === "M" ? s : d) : null; if (arr) arr[aff ? 2 : car ? 1 : 0]++; else { d[aff ? 2 : car ? 1 : 0]++; s[aff ? 2 : car ? 1 : 0]++; } }));
    const fmt = (a) => { const tot = a.reduce((x, y) => x + y, 0); return [["정상", a[0]], ["보인자", a[1]], [name, a[2]]].filter(([, v]) => v).map(([n, v]) => `${n} ${Math.round(v / tot * 100)}%`).join(" · "); };
    nD.textContent = fmt(d); nS.textContent = fmt(s); draw();
  }
  root.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { t = b.dataset.t; mi = 1; di = t === "x" ? 0 : 1; update(); }));
  update();
})();
