/* 카드: 지구시스템을 움직이는 에너지는 어디서 올까? — 권역 사이의 상호작용과 에너지원 끄기 */
(() => {
  const root = document.getElementById("card-is1-earth-energy");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const chips = [...root.querySelectorAll("[data-ph]")];
  const tog = { sun: $(".src-sun"), core: $(".src-core"), tide: $(".src-tide") };
  const nOn = $(".e-on"), nPct = $(".e-pct"), nStop = $(".n-stop"), note = $(".ph-note");

  // 에너지 유입량 (TW = 10¹² W)
  // 태양: 1361 W/m² × π(6371 km)² ≈ 173,600 TW (대기 윗면에 도달하는 양)
  // 지구 내부: 지표로 흘러나오는 열 약 47 TW / 조력: 바다에서 소산되는 조석 에너지 약 3.7 TW
  const SRC = {
    sun: { name: "태양 에너지", tw: 1361 * Math.PI * 6.371e6 ** 2 / 1e12, color: C.amber, what: "대기 윗면에 도달하는 태양 복사" },
    core: { name: "지구 내부 에너지", tw: 47, color: C.apple, what: "지구 내부에서 지표로 나오는 열" },
    tide: { name: "조력 에너지", tw: 3.7, color: "#4f7fa8", what: "달·태양의 인력이 만드는 조석" },
  };
  const PH = {
    typhoon: { src: "sun", in: "수권", arrows: [["수권", "기권", "수증기"], ["기권", "지권", "큰비·산사태"]],
      note: "따뜻한 바다에서 증발한 수증기가 구름이 되며 내놓는 숨은열(잠열)이 태풍을 키웁니다. 태풍은 다시 큰비로 땅을 깎습니다." },
    photo: { src: "sun", in: "생물권", arrows: [["기권", "생물권", "CO₂"], ["생물권", "기권", "O₂"]],
      note: "식물은 햇빛 에너지로 대기의 이산화 탄소를 유기물로 바꾸고 산소를 내놓습니다." },
    current: { src: "sun", in: "기권", arrows: [["기권", "수권", "바람"]],
      note: "태양이 위도마다 다르게 데운 대기가 바람을 일으키고, 바람이 바닷물 표면을 밀어 표층 해류가 됩니다." },
    erosion: { src: "sun", in: "수권", arrows: [["수권", "지권", "빗물·강물"], ["생물권", "지권", "뿌리"]],
      note: "태양 에너지로 돌아가는 물 순환이 암석을 깎아 내고, 식물 뿌리도 틈을 벌려 암석을 부숩니다." },
    volcano: { src: "core", in: "지권", arrows: [["지권", "기권", "화산재·기체"]],
      note: "지구 내부 에너지로 생긴 마그마가 분출해 화산재와 이산화 황을 대기로 내보냅니다. 1991년 피나투보 화산 분출 뒤에는 지구 평균 기온이 1~2년 동안 약 0.5 °C 내려갔습니다." },
    tsunami: { src: "core", in: "지권", arrows: [["지권", "수권", "해저 지각 변동"], ["수권", "지권", "해안 침수"]],
      note: "바다 밑에서 큰 지진이 일어나 해저 지각이 갑자기 솟거나 꺼지면 그 위의 바닷물 전체가 움직여 해일이 됩니다." },
    tide: { src: "tide", in: "수권", arrows: [["외권", "수권", "달·태양의 인력"], ["수권", "생물권", "갯벌"]],
      note: "달과 태양의 인력이 바닷물을 끌어당겨 하루에 두 번쯤 해수면이 오르내립니다. 갯벌 생물은 이 주기에 맞춰 삽니다." },
  };
  let sel = "typhoon";

  const { ctx, size } = fit(cv, () => draw());
  const fmtTW = (v) => v >= 1000 ? Math.round(v / 100) * 100 >= 1e4 ? (Math.round(v / 100) * 100).toLocaleString("ko-KR") : Math.round(v).toLocaleString("ko-KR") : v.toFixed(v < 10 ? 1 : 0);

  function arrow(x1, y1, x2, y2, col, bend, lw) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    const cx = mx - dy / L * bend, cy = my + dx / L * bend;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - cy, x2 - cx), k = 5 + lw * 1.6;
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - k * Math.cos(a - .42), y2 - k * Math.sin(a - .42));
    ctx.lineTo(x2 - k * Math.cos(a + .42), y2 - k * Math.sin(a + .42)); ctx.fill();
    return { x: 0.25 * x1 + 0.5 * cx + 0.25 * x2, y: 0.25 * y1 + 0.5 * cy + 0.25 * y2 };
  }
  function tag(t, x, y, col, size = 11) {
    ctx.font = `600 ${size}px ${F.sans}`;
    const tw = ctx.measureText(t).width;
    ctx.fillStyle = "rgba(251,251,248,.94)"; ctx.fillRect(x - tw / 2 - 4, y - size + 1, tw + 8, size + 5);
    ctx.fillStyle = col; ctx.textAlign = "center"; ctx.fillText(t, x, y + 2); ctx.textAlign = "left";
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 520;
    // ── 권역 그림 (왼쪽 또는 위)
    const dw = narrow ? w : w * 0.6, dh = narrow ? h * 0.6 : h;
    const cx = dw / 2, r = Math.min(dw * 0.1, dh * 0.11);
    const top = 8, spaceH = Math.max(34, dh * 0.15);
    const N = {
      외권: { x: cx, y: top + spaceH / 2 },
      기권: { x: cx, y: top + spaceH + r + dh * 0.06 },
      생물권: { x: cx - dw * 0.29, y: dh * 0.62 },
      수권: { x: cx + dw * 0.29, y: dh * 0.62 },
      지권: { x: cx, y: dh - r - 8 },
    };
    // 외권 띠
    ctx.fillStyle = C.night; ctx.fillRect(8, top, dw - 16, spaceH);
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.paper; ctx.textAlign = "center";
    ctx.fillText("외권 (우주 공간)", cx, top + spaceH / 2 + 4); ctx.textAlign = "left";
    // 태양·달 아이콘
    const sunOn = tog.sun.checked, tideOn = tog.tide.checked, coreOn = tog.core.checked;
    const sx = 8 + spaceH * 0.6, sy = top + spaceH / 2;
    ctx.beginPath(); ctx.arc(sx, sy, spaceH * 0.28, 0, Math.PI * 2); ctx.fillStyle = sunOn ? C.amber : "#555"; ctx.fill();
    const mx = dw - 8 - spaceH * 0.6;
    ctx.beginPath(); ctx.arc(mx, sy, spaceH * 0.2, 0, Math.PI * 2); ctx.fillStyle = tideOn ? "#c9c9c2" : "#555"; ctx.fill();

    const P = PH[sel], alive = tog[P.src].checked;
    // 권역 원
    const fills = { 기권: "#e4eef5", 생물권: "#e2efdc", 수권: "#d6e4f0", 지권: "#ece3d6" };
    for (const k of ["기권", "생물권", "수권", "지권"]) {
      const n = N[k];
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fillStyle = fills[k]; ctx.fill();
      const inv = P.arrows.some((a) => a[0] === k || a[1] === k);
      ctx.strokeStyle = inv && alive ? C.ink : C.rule; ctx.lineWidth = inv && alive ? 1.6 : 1; ctx.stroke();
      ctx.font = `700 ${Math.max(11, Math.min(14, r * 0.42))}px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.fillText(k, n.x, n.y + 4); ctx.textAlign = "left";
    }
    // 지구 내부 에너지 표시
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = coreOn ? C.apple : C.ink3; ctx.textAlign = "center";
    ctx.textAlign = "left"; ctx.fillText(coreOn ? "← 내부 열" : "← 내부 열 꺼짐", N.지권.x + r + 6, N.지권.y + 4);

    // 에너지 유입 화살표
    const src = SRC[P.src];
    const ecol = alive ? src.color : C.rule;
    const tgt = N[P.in];
    if (P.src === "sun") {
      ctx.setLineDash([4, 4]);
      const from = { x: sx + 6, y: sy + spaceH * 0.3 };
      const a = Math.atan2(tgt.y - from.y, tgt.x - from.x);
      arrow(from.x, from.y, tgt.x - Math.cos(a) * (r + 4), tgt.y - Math.sin(a) * (r + 4), ecol, 0, 1.5);
      ctx.setLineDash([]);
    } else if (P.src === "tide") {
      // 외권 → 수권 화살표로 함께 그림
    }

    // 상호작용 화살표
    const ghost = !alive;
    P.arrows.forEach(([a, b, lab], i) => {
      const A = N[a], B = N[b];
      const ang = Math.atan2(B.y - A.y, B.x - A.x);
      const ra = a === "외권" ? spaceH / 2 : r, rb = b === "외권" ? spaceH / 2 : r;
      const x1 = a === "외권" ? mx : A.x + Math.cos(ang) * (ra + 3), y1 = a === "외권" ? sy + spaceH * 0.25 : A.y + Math.sin(ang) * (ra + 3);
      const ang2 = Math.atan2(B.y - y1, B.x - x1);
      const x2 = B.x - Math.cos(ang2) * (rb + 5), y2 = B.y - Math.sin(ang2) * (rb + 5);
      const reverse = P.arrows.some(([c, d]) => c === b && d === a);
      const m = arrow(x1, y1, x2, y2, ghost ? C.rule : C.forest, reverse ? 16 : 10, 2.4);
      tag(lab, m.x, m.y + 4, ghost ? C.ink3 : C.forest, narrow ? 10.5 : 11.5);
    });
    if (ghost) {
      ctx.font = `700 13px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "center";
      ctx.fillText(`${src.name}가 없으면 이 현상은 멈춥니다`, cx, dh * 0.47); ctx.textAlign = "left";
    }

    // ── 에너지 막대 (로그 눈금)
    const bx0 = (narrow ? 0 : dw) + 104, bx1 = w - 16;
    const by0 = narrow ? dh + 28 : h * 0.14, by1 = narrow ? h - 22 : h * 0.8;
    const L0 = 0, L1 = 6; // 10⁰ ~ 10⁶ TW
    const X = (v) => bx0 + (Math.log10(v) - L0) / (L1 - L0) * (bx1 - bx0);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("들어오는 에너지 (TW, 로그 눈금)", bx0 - 96, by0 - 8);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let e = 0; e <= 6; e += 2) {
      const x = Math.round(X(10 ** e)) + .5;
      ctx.beginPath(); ctx.moveTo(x, by0); ctx.lineTo(x, by1); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillText(e === 0 ? "1" : `10${["", "", "²", "", "⁴", "", "⁶"][e]}`, x, by1 + 13);
    }
    ctx.textAlign = "left";
    const keys = ["sun", "core", "tide"], rowH = (by1 - by0) / 3;
    keys.forEach((k, i) => {
      const s = SRC[k], on = tog[k].checked, y = by0 + i * rowH;
      const bh = Math.min(14, rowH * 0.5), yb = y + (rowH - bh) / 2;
      ctx.fillStyle = on ? s.color : "#e6e6e0";
      ctx.fillRect(bx0, yb, X(s.tw) - bx0, bh);
      ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = on ? C.ink : C.ink3;
      ctx.textAlign = "right"; ctx.fillText(s.name, bx0 - 8, yb + bh - 3);
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = on ? C.ink2 : C.ink3;
      const t = `${fmtTW(s.tw)} TW`, tw = ctx.measureText(t).width;
      if (X(s.tw) + 6 + tw < bx1 + 12) { ctx.textAlign = "left"; ctx.fillText(t, X(s.tw) + 6, yb + bh - 3); }
      else { ctx.textAlign = "right"; ctx.fillStyle = on ? C.ink : C.ink3; ctx.fillText(t, X(s.tw) - 2, yb - 4); }
      ctx.textAlign = "left";
    });
  }

  function update() {
    let on = 0, all = 0;
    for (const k in SRC) { all += SRC[k].tw; if (tog[k].checked) on += SRC[k].tw; }
    nOn.textContent = `${fmtTW(on)} TW`;
    const pct = on / all * 100;
    nPct.textContent = pct > 99.99 && pct < 100 ? "99.99%" : pct >= 1 || pct === 0 ? `${pct.toFixed(pct >= 99.95 || pct === 0 ? 0 : 2)}%` : `${pct.toPrecision(2)}%`;
    let stop = 0;
    chips.forEach((b) => {
      const off = !tog[PH[b.dataset.ph].src].checked;
      b.classList.toggle("off", off); if (off) stop++;
      b.setAttribute("aria-pressed", b.dataset.ph === sel ? "true" : "false");
    });
    nStop.textContent = `${stop} / ${chips.length}`;
    note.textContent = PH[sel].note;
    draw();
  }
  chips.forEach((b) => b.addEventListener("click", () => { sel = b.dataset.ph; update(); }));
  Object.values(tog).forEach((t) => t.addEventListener("change", update));
  update();
})();
