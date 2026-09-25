/* 카드: 형제는 왜 서로 다르게 생길까? — 감수 1분열 중기의 독립적 배열과 생식세포 조합 수 */
(() => {
  const root = document.getElementById("card-bio-assort");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sN = $(".npair"), oN = $(".npair-out");
  const nAll = $(".n-all"), nMade = $(".n-made"), nUniq = $(".n-uniq"), nSib = $(".n-sib"), msg = $(".as-msg");
  const MOM = "#c8554a", DAD = "#3f6f9c";

  let n = 3, gametes = [], seen = new Map();
  const { ctx, size } = fit(cv, () => draw());

  const sup = (k) => String(k).split("").map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");
  const sci = (x) => { const e = Math.floor(Math.log10(x)); return `${(x / 10 ** e).toFixed(1)}×10${sup(e)}`; };
  const big = (x) => x < 1e7 ? Math.round(x).toLocaleString() : `약 ${sci(x)}`;

  function make(k) {
    for (let j = 0; j < k; j++) {
      const g = Array.from({ length: n }, () => Math.random() < .5 ? 0 : 1);
      const key = g.join("");
      const dup = seen.has(key);
      seen.set(key, (seen.get(key) || 0) + 1);
      gametes.unshift({ g, dup });
    }
    if (gametes.length > 400) gametes.length = 400;
    update();
  }
  function reset() { gametes = []; seen = new Map(); update(); }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const split = Math.round(w * .42);
    // ── 왼쪽: 감수 1분열 중기
    ctx.font = `600 12.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText("감수 1분열 중기 (마지막 배열)", 4, 14);
    const top = 30, bot = h - 22, ph = bot - top;
    const rowH = Math.min(26, ph / n), cx = split * .55;
    const g = gametes[0] ? gametes[0].g : null;
    const bw = Math.min(28, split * .16), bh = Math.max(2.5, rowH * .56);
    ctx.strokeStyle = "rgba(224,160,42,.9)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx, top - 4); ctx.lineTo(cx, top + rowH * n + 4); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < n; i++) {
      const y = top + rowH * i + rowH / 2;
      const left = g ? g[i] : 0; // 0: 어머니 쪽이 왼쪽(생식세포로 가는 쪽)
      const cols = left === 0 ? [MOM, DAD] : [DAD, MOM];
      ctx.globalAlpha = g ? 1 : .4;
      ctx.fillStyle = cols[0]; ctx.fillRect(cx - 3 - bw, y - bh / 2, bw, bh);
      ctx.fillStyle = cols[1]; ctx.globalAlpha *= .45; ctx.fillRect(cx + 3, y - bh / 2, bw, bh);
      ctx.globalAlpha = 1;
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
    ctx.fillText("← 이 세포로", cx - 5, bot + 14);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText("다른 세포 →", cx + 5, bot + 14);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    if (rowH >= 12) for (let i = 0; i < n; i++) ctx.fillText(`${i + 1}`, cx - bw - 8, top + rowH * i + rowH / 2 + 4);

    // ── 오른쪽: 만든 생식세포 목록
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(split + .5, 6); ctx.lineTo(split + .5, h - 6); ctx.stroke();
    const x0 = split + 12, gw = w - x0 - 6;
    ctx.font = `600 12.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText("만든 생식세포 (최근 것이 위)", x0, 14);
    const lh = Math.max(8, Math.min(18, (h - 30) / 16)), rows = Math.floor((h - 30) / lh);
    const cw = Math.min(16, (gw - 70) / n);
    for (let r = 0; r < Math.min(rows, gametes.length); r++) {
      const { g: gg, dup } = gametes[r], y = 26 + r * lh;
      for (let i = 0; i < n; i++) { ctx.fillStyle = gg[i] ? DAD : MOM; ctx.fillRect(x0 + i * cw, y, Math.max(1, cw - 1), lh - 2); }
      if (dup) {
        ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.strokeRect(x0 - 1, y - 1, cw * n + 1, lh);
        ctx.fillStyle = C.warn; ctx.font = `10px ${F.mono}`; ctx.fillText("중복", x0 + cw * n + 6, y + lh - 5);
      }
    }
    if (!gametes.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.fillText("‘생식세포 1개’를 눌러 보세요.", x0, 40); }
  }

  function update() {
    oN.textContent = n;
    const all = 2 ** n;
    nAll.textContent = big(all);
    nMade.textContent = gametes.length >= 400 ? `${[...seen.values()].reduce((a, b) => a + b, 0)}` : `${gametes.length}`;
    nUniq.textContent = `${seen.size}`;
    nSib.textContent = `1 / ${big(all * all).replace("약 ", "")}`;
    const total = [...seen.values()].reduce((a, b) => a + b, 0);
    const dups = total - seen.size;
    msg.textContent = !total ? "" : dups
      ? `${total}개를 만들었는데 서로 다른 조합은 ${seen.size}가지입니다. ${dups}번은 이미 나온 조합이 또 나왔습니다.`
      : `${total}개를 만드는 동안 같은 조합이 한 번도 나오지 않았습니다.`;
    draw();
  }
  sN.addEventListener("input", () => { n = +sN.value; reset(); });
  $(".mk1").addEventListener("click", () => make(1));
  $(".mk100").addEventListener("click", () => make(100));
  $(".rst").addEventListener("click", reset);
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { sN.value = b.dataset.n; n = +b.dataset.n; reset(); }));
  update();
})();
