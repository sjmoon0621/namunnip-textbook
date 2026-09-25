/* 카드 2.3.3: 할로젠끼리는 누가 누구를 밀어낼까? — 치환 반응 가상 실험 (헥세인 층의 색으로 판정) */
(() => {
  const root = document.getElementById("card-is1-halogen");
  if (!root) return;
  const { C, F, clamp, fit, loop, ease } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), res = $(".result");
  const btns = [...root.querySelectorAll(".grid3 button")];

  const RANK = { Cl: 0, Br: 1, I: 2 };            // 위쪽일수록 전자를 세게 끌어당긴다
  const NAME = { Cl: "염소", Br: "브로민", I: "아이오딘" };
  const GA = { Cl: "염소가", Br: "브로민이", I: "아이오딘이" }, NEUN = { Cl: "염소는", Br: "브로민은", I: "아이오딘은" };
  const SUB = { Cl: "Cl₂", Br: "Br₂", I: "I₂" };
  const ION = { Cl: "Cl⁻", Br: "Br⁻", I: "I⁻" };
  const WATER = { Cl: [220, 232, 170, .45], Br: [230, 150, 60, .55], I: [170, 110, 50, .5] };  // 할로젠 수용액의 색
  const HEX = { Cl: [226, 236, 196, .55], Br: [224, 118, 40, .85], I: [128, 58, 150, .85] };    // 헥세인 층에 녹았을 때의 색
  const rgba = (c, k = 1) => `rgba(${c[0]},${c[1]},${c[2]},${c[3] * k})`;

  let sel = null, t = 0;

  const { ctx, size } = fit(cv, () => draw());

  function outcome(x, y) {
    if (x === y) return { kind: "same", free: x };
    return RANK[x] < RANK[y] ? { kind: "yes", free: y } : { kind: "no", free: x };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520;
    // ── 시험관
    const tx = small ? w * 0.2 : w * 0.18, tw = small ? 46 : 58, top = 26, bot = h - 24;
    const liq = top + (bot - top) * 0.3, split = top + (bot - top) * 0.55;
    let wob = 0;
    const o = sel ? outcome(sel.x, sel.y) : null;
    const ph = sel ? t : 0;
    if (sel && ph > 1 && ph < 2.2 && !NM.reduce) wob = Math.sin(ph * 30) * 4 * (1 - Math.abs(ph - 1.6) / .6);
    ctx.save(); ctx.translate(tx, (top + bot) / 2); ctx.rotate(wob * 0.02); ctx.translate(-tx, -(top + bot) / 2);
    const L = tx - tw / 2, R = tx + tw / 2;
    // 액체
    if (sel) {
      const pour = clamp(ph, 0, 1), mix = clamp((ph - 1) / 1.2, 0, 1), settle = clamp((ph - 2.2) / 0.8, 0, 1);
      // 아래층: 물 (넣은 할로젠 수용액의 색이 섞였다가, 흔든 뒤 옅어짐)
      const wc = WATER[sel.x];
      ctx.fillStyle = "rgba(200,220,235,.35)"; ctx.fillRect(L, split, tw, bot - split - tw / 2);
      ctx.beginPath(); ctx.arc(tx, bot - tw / 2, tw / 2, 0, Math.PI); ctx.fill();
      ctx.fillStyle = rgba(wc, pour * (1 - 0.7 * settle));
      ctx.fillRect(L, split, tw, bot - split - tw / 2); ctx.beginPath(); ctx.arc(tx, bot - tw / 2, tw / 2, 0, Math.PI); ctx.fill();
      // 위층: 헥세인
      ctx.fillStyle = "rgba(245,245,240,.9)"; ctx.fillRect(L, liq, tw, split - liq);
      if (mix < 1) { ctx.fillStyle = rgba(wc, 0.4 * pour * (1 - mix)); ctx.fillRect(L, liq, tw, split - liq); }
      ctx.fillStyle = rgba(HEX[o.free], Math.max(mix * (ph < 2.2 ? .6 : 1), 0) * (0.4 + 0.6 * settle));
      ctx.fillRect(L, liq, tw, split - liq);
      ctx.strokeStyle = "rgba(35,35,38,.3)"; ctx.beginPath(); ctx.moveTo(L, split); ctx.lineTo(R, split); ctx.stroke();
      if (ph < 1) { // 떨어지는 방울
        ctx.fillStyle = rgba(wc, 1.6);
        for (let k = 0; k < 3; k++) { const yy = top - 10 + ((ph * 3 + k / 3) % 1) * (liq - top + 10); ctx.beginPath(); ctx.arc(tx, yy, 3, 0, Math.PI * 2); ctx.fill(); }
      }
    } else {
      ctx.fillStyle = "rgba(200,220,235,.35)"; ctx.fillRect(L, split, tw, bot - split - tw / 2);
      ctx.beginPath(); ctx.arc(tx, bot - tw / 2, tw / 2, 0, Math.PI); ctx.fill();
      ctx.fillStyle = "rgba(245,245,240,.9)"; ctx.fillRect(L, liq, tw, split - liq);
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(L, top); ctx.lineTo(L, bot - tw / 2); ctx.arc(tx, bot - tw / 2, tw / 2, Math.PI, 0, true); ctx.lineTo(R, top); ctx.stroke();
    ctx.restore();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("헥세인", L - 6, (liq + split) / 2 + 4);
    ctx.fillText(sel ? `K${sel.y} 수용액` : "수용액", L - 6, (split + bot) / 2 + 4);

    // ── 오른쪽: 입자 수준 설명
    const ox = tx + tw / 2 + (small ? 16 : 40), ow = w - ox - 8;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`;
    if (!sel) {
      ctx.fillText("표에서 칸을 골라 섞어 보세요.", ox, 30);
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
      ["헥세인 층의 색으로 어떤 X₂가 있는지 봅니다.", "염소: 거의 무색", "브로민: 주황색", "아이오딘: 보라색"].forEach((s, i) => ctx.fillText(s, ox, 54 + i * 20));
      [["Cl", 94], ["Br", 114], ["I", 134]].forEach(([k, y]) => { ctx.fillStyle = rgba(HEX[k], 1.2); ctx.fillRect(ox + ow - 22, y - 10, 16, 12); });
      return;
    }
    const x = sel.x, y = sel.y, show = clamp((t - 2.4) / .6, 0, 1);
    ctx.fillText(`${SUB[x]} 수용액 + K${y} 수용액`, ox, 22);
    // 입자
    const cy = h * 0.42, r = small ? 11 : 14;
    const atom = (cx, cy, k, charge, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = k === "Cl" ? "#b6d38a" : k === "Br" ? "#d98a46" : "#8a5aa6";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `600 ${small ? 9.5 : 11}px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(k, cx, cy + 4);
      if (charge) { ctx.font = `10px ${F.mono}`; ctx.fillText("−", cx + r * .8, cy - r * .7); }
      ctx.globalAlpha = 1; ctx.textAlign = "left";
    };
    const o2 = outcome(x, y), done = o2.kind === "yes" ? ease(show) : 0;
    const a1 = ox + r, a2 = ox + r * 2.9;
    const b1 = ox + ow * 0.55, b2 = ox + ow * 0.55 + r * 3.2;
    // 전: X₂ 분자 + Y⁻ 이온 두 개 → 후: X⁻ 두 개 + Y₂
    const lerp = (p, q, k) => p + (q - p) * k;
    atom(lerp(a1, a1 - 2, done), lerp(cy, cy + r * 2.6, done), x, done > .5);
    atom(lerp(a2, a2 + r * 2, done), lerp(cy, cy + r * 2.6, done), x, done > .5);
    atom(lerp(b1, b1 + r * .6, done), lerp(cy, cy - r * 1.4, done), y, done < .5);
    atom(lerp(b2, b1 + r * 2.4, done), lerp(cy, cy - r * 1.4, done), y, done < .5);
    if (done > .5) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b1 + r * 1.6, cy - r * 1.4); ctx.lineTo(b1 + r * 1.4, cy - r * 1.4); ctx.stroke(); }
    if (o2.kind === "yes" && show > 0 && show < 1) {
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.6; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(b1 - r, cy); ctx.quadraticCurveTo((a2 + b1) / 2, cy - r * 3, a2 + r, cy - 4); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.font = `${small ? 11 : 12}px ${F.mono}`; ctx.fillStyle = C.ink;
    const eq = o2.kind === "yes" ? `${SUB[x]} + 2${ION[y]} → 2${ION[x]} + ${SUB[y]}` : o2.kind === "no" ? `${SUB[x]} + ${ION[y]} → 변화 없음` : "같은 할로젠끼리";
    if (t > 2.4) ctx.fillText(eq, ox, h - 30);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2;
    if (t > 2.4) ctx.fillText(o2.kind === "yes" ? `헥세인 층: ${NAME[y]}의 색 → 새로 생김` : o2.kind === "no" ? `헥세인 층: 넣은 ${NAME[x]}의 색 그대로` : "비교할 대상이 아님", ox, h - 12);
  }

  function pick(b) {
    sel = { x: b.dataset.x, y: b.dataset.y }; t = NM.reduce ? 3.19 : 0; fired = false;
    btns.forEach((q) => q.setAttribute("aria-pressed", q === b ? "true" : "false"));
    res.innerHTML = "섞는 중…";
    draw();
  }
  function finish() {
    const b = btns.find((q) => q.getAttribute("aria-pressed") === "true");
    const o = outcome(sel.x, sel.y);
    b.classList.remove("yes", "no");
    b.classList.add(o.kind === "yes" ? "yes" : "no");
    b.textContent = o.kind === "yes" ? "반응" : o.kind === "no" ? "없음" : "같음";
    res.innerHTML = o.kind === "yes"
      ? `<b>반응이 일어났습니다.</b> 헥세인 층이 ${NAME[sel.y]}의 색으로 바뀌었습니다. ${GA[sel.x]} ${ION[sel.y]}의 전자를 빼앗아 ${SUB[sel.y]} 분자가 생겼습니다.`
      : o.kind === "no"
      ? `<b>반응이 없습니다.</b> 헥세인 층의 색은 넣은 ${NAME[sel.x]} 그대로입니다. ${NEUN[sel.x]} ${ION[sel.y]}의 전자를 빼앗지 못합니다.`
      : "<b>같은 할로젠입니다.</b> 서로 바꿔도 달라지는 것이 없어 비교에 쓸 수 없습니다.";
  }
  btns.forEach((b) => b.addEventListener("click", () => pick(b)));
  let fired = false;
  loop(cv, (dt) => {
    if (!sel) return;
    if (t < 3.2) { t += dt; fired = false; draw(); }
    else if (!fired) { fired = true; t = 3.2; draw(); finish(); }
  });
})();
