/* 카드: 같은 글자끼리 자리를 바꾸면 새 배열일까? — 번호 붙인 n!개 배열을 번호를 지운 배열별로 묶기, n!/(p!q!…) */
(() => {
  const root = document.getElementById("card-stat-same-perm");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip[data-w]")];
  const cv = $("canvas"), inp = $(".word"), bl = $(".go-label");
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  const fact = (k) => { let v = 1; for (let i = 2; i <= k; i++) v *= i; return v; };
  let word = "AABB", labeled = false, pick = 0, groups = [], cells = [];
  const { ctx, size } = fit(cv, () => draw());

  function perms(a) {
    if (a.length <= 1) return [a.slice()];
    const out = [];
    a.forEach((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).forEach((p) => out.push([x, ...p])));
    return out;
  }
  function counts(ch) { const m = new Map(); ch.forEach((c) => m.set(c, (m.get(c) || 0) + 1)); return m; }
  function rebuild() {
    const ch = Array.from(word), seen = new Map();
    const tokens = ch.map((c) => { const k = (seen.get(c) || 0) + 1; seen.set(c, k); return { c, k }; });
    const map = new Map();
    if (ch.length <= 4) perms(tokens).forEach((p) => {
      const key = p.map((t) => t.c).join("");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p.map((t) => t.c + (counts(ch).get(t.c) > 1 ? SUB[t.k] : "")).join(""));
    });
    groups = [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    pick = Math.min(pick, Math.max(0, groups.length - 1));
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h); cells = [];
    const ch = Array.from(word), n = ch.length;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (!n) { ctx.fillStyle = C.ink3; ctx.font = `13px ${F.sans}`; ctx.fillText("글자를 입력하세요", w / 2, h / 2); return; }
    const cnt = [...counts(ch).values()], den = cnt.reduce((a, k) => a * fact(k), 1), D = fact(n) / den;
    if (n > 4) {
      ctx.fillStyle = C.ink; ctx.font = `600 15px ${F.mono}`;
      ctx.fillText(`${n}! = ${fact(n)}`, w / 2, h * 0.22);
      ctx.fillStyle = C.ink2; ctx.font = `13px ${F.sans}`;
      ctx.fillText(`= (서로 다른 배열 ${D}개) × (한 배열에 겹친 ${den}개)`, w / 2, h * 0.36);
      const bx = 16, bw = w - 32, by = h * 0.5, bh = 34;
      ctx.fillStyle = C.sprout; ctx.fillRect(bx, by, bw, bh);
      if (D <= 120) { ctx.strokeStyle = C.card; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 1; i < D; i++) { const x = bx + i / D * bw; ctx.moveTo(x, by); ctx.lineTo(x, by + bh); } ctx.stroke(); }
      ctx.fillStyle = C.warn; ctx.fillRect(bx, by, bw / D, bh);
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`;
      ctx.fillText(`막대 전체 = 번호를 붙인 ${fact(n)}개 · 한 토막 = 번호를 지우면 같아지는 ${den}개`, w / 2, by + bh + 16);
      const parts = [...counts(ch).entries()].filter(([, k]) => k > 1).map(([c, k]) => `${c} ${k}개 → ${k}!`);
      ctx.fillText(parts.length ? parts.join(" · ") : "같은 글자가 없어 겹침이 없습니다", w / 2, by + bh + 36);
      return;
    }
    const cols = Math.min(groups.length, 5), rows = Math.ceil(groups.length / cols), m = groups[0][1].length;
    const pad = 8, cw = (w - pad * 2) / cols, chH = Math.min((h - pad * 2) / rows, 26 + (labeled ? m * 15 : 0));
    const top = (h - chH * rows) / 2;
    groups.forEach(([key, list], i) => {
      const x = pad + (i % cols) * cw, y = top + Math.floor(i / cols) * chH, on = i === pick;
      cells.push([x, y, cw, chH]);
      ctx.fillStyle = on ? C.sprout : C.card; ctx.fillRect(x + 3, y + 3, cw - 6, chH - 6);
      ctx.strokeStyle = on ? C.forest : C.rule; ctx.lineWidth = on ? 2 : 1; ctx.strokeRect(x + 3, y + 3, cw - 6, chH - 6);
      ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.mono}`; ctx.fillText(key, x + cw / 2, y + 15);
      if (labeled) {
        ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = on ? C.forest : C.ink2;
        list.forEach((s, j) => ctx.fillText(s, x + cw / 2, y + 30 + j * 15));
      }
    });
  }

  function update() {
    const ch = Array.from(word), n = ch.length;
    if (!n) { ["n-all", "n-grp", "n-d"].forEach((c) => ($(`.${c}`).textContent = "—")); draw(); return; }
    const cm = counts(ch), rep = [...cm.values()].filter((k) => k > 1), den = rep.reduce((a, k) => a * fact(k), 1);
    $(".n-all").textContent = `${n}! = ${fact(n)}`;
    $(".n-grp").textContent = rep.length ? `${rep.map((k) => `${k}!`).join("·")} = ${den}` : "1 (같은 글자 없음)";
    $(".n-d").textContent = `${fact(n)} ÷ ${den} = ${fact(n) / den}`;
    draw();
  }
  function setWord(s, fromChip) {
    word = Array.from(s.toUpperCase().replace(/\s/g, "")).slice(0, 8).join("");
    if (fromChip) inp.value = word;
    chips.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.w === word)));
    pick = 0; rebuild(); update();
  }
  chips.forEach((b) => b.addEventListener("click", () => setWord(b.dataset.w, true)));
  inp.addEventListener("input", () => setWord(inp.value, false));
  bl.addEventListener("click", () => { labeled = !labeled; bl.setAttribute("aria-pressed", String(labeled)); draw(); });
  cv.addEventListener("click", (e) => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const i = cells.findIndex(([cx, cy, cw, chh]) => x >= cx && x < cx + cw && y >= cy && y < cy + chh);
    if (i >= 0) { pick = i; draw(); }
  });
  setWord(word, true);
})();
