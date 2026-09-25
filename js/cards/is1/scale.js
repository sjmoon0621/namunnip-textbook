/* 카드 1.1.1: 원자핵에서 우주까지, 무엇으로 잴까? — 로그 눈금 위의 길이·시간과 측정 방법 */
(() => {
  const root = document.getElementById("card-is1-scale");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sl = $(".v"), out = $(".v-out");
  const dNear = $(".near"), dNearV = $(".nearv"), dMeth = $(".meth");

  const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const pow = (n) => "10" + String(n).split("").map((c) => SUP[c]).join("");
  const sci = (v) => { // 4.2 × 10¹⁶ 꼴
    const e = Math.floor(Math.log10(v)), m = v / 10 ** e;
    if (e >= -2 && e <= 4) return (+v.toPrecision(3)).toLocaleString("ko-KR");
    return `${m.toFixed(1)} × ${pow(e)}`;
  };

  // [이름, 값(SI), 쉬운 표기]
  const DATA = {
    len: {
      unit: "m", min: -15, max: 27,
      items: [
        ["양성자 지름", 1.7e-15, "약 1.7 fm"],
        ["수소 원자 지름", 1.06e-10, "약 0.1 nm"],
        ["DNA 나선의 폭", 2e-9, "약 2 nm"],
        ["독감 바이러스", 1e-7, "약 100 nm"],
        ["적혈구 지름", 7.5e-6, "약 7.5 μm"],
        ["머리카락 굵기", 8e-5, "약 0.08 mm"],
        ["사람 키", 1.7, "약 1.7 m"],
        ["에베레스트 높이", 8849, "8,849 m"],
        ["지구 지름", 1.2742e7, "12,742 km"],
        ["지구–달 거리", 3.844e8, "384,400 km"],
        ["지구–태양 거리", 1.496e11, "1억 4960만 km"],
        ["가장 가까운 별", 4.01e16, "4.2 광년"],
        ["우리은하 지름", 9.5e20, "약 10만 광년"],
        ["안드로메다은하까지", 2.4e22, "약 250만 광년"],
        ["관측 가능한 우주 지름", 8.8e26, "약 930억 광년"],
      ],
      // [방법, 하한, 상한] (지수, 대략)
      methods: [
        ["입자 충돌·산란 실험", -18, -10],
        ["전자 현미경", -10, -5],
        ["광학 현미경", -6.7, -3],
        ["자·캘리퍼스·줄자", -5, 2],
        ["빛·전파의 왕복 시간", 0, 12.5],
        ["삼각 측량·연주 시차", 2, 20],
        ["밝기를 아는 별·초신성", 19, 26],
        ["적색 편이", 23, 27],
      ],
    },
    time: {
      unit: "s", min: -18, max: 18,
      items: [
        ["가장 짧은 레이저 빛 펄스", 5e-17, "수십 아토초"],
        ["세슘 원자의 진동 한 번", 1.088e-10, "약 0.1 ns"],
        ["빛이 1 m 가는 시간", 3.34e-9, "약 3.3 ns"],
        ["꿀벌 날갯짓 한 번", 4e-3, "약 4 ms"],
        ["눈 깜박임", 0.3, "약 0.3 s"],
        ["하루", 86400, "86,400 s"],
        ["1년", 3.156e7, "약 3156만 s"],
        ["사람의 일생 (80년)", 2.5e9, "약 25억 s"],
        ["문자 기록의 역사", 1.6e11, "약 5000년"],
        ["현생 인류의 역사", 9.5e12, "약 30만 년"],
        ["공룡 멸종 이후", 2.08e15, "약 6600만 년"],
        ["지구의 나이", 1.43e17, "약 45억 년"],
        ["우주의 나이", 4.35e17, "약 138억 년"],
      ],
      methods: [
        ["초고속 레이저 측정", -18, -9],
        ["전자 회로·오실로스코프", -11, 0],
        ["원자시계·시계", -9, 9.5],
        ["나이테·빙하 코어", 7.5, 13.4],
        ["방사성 동위원소 연대", 9.5, 17.8],
      ],
    },
  };
  let mode = "len";

  const { ctx, size } = fit(cv, () => draw());

  function nearest(D, e) {
    let best = null, bd = 1e9;
    for (const it of D.items) { const d = Math.abs(Math.log10(it[1]) - e); if (d < bd) { bd = d; best = it; } }
    return best;
  }

  function update() {
    const D = DATA[mode], e = +sl.value;
    const v = 10 ** e;
    out.textContent = `${sci(v)} ${D.unit}`;
    const n = nearest(D, e);
    dNear.textContent = n[0]; dNearV.textContent = n[2];
    const ms = D.methods.filter((m) => e >= m[1] && e <= m[2]).map((m) => m[0]);
    dMeth.textContent = ms.length ? ms.join(", ") : "—";
    dMeth.style.fontSize = ms.join(", ").length > 14 ? "13px" : "";
    draw();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    const D = DATA[mode], e = +sl.value;
    ctx.clearRect(0, 0, w, h);
    const padL = 12, padR = 12, pw = w - padL - padR;
    const X = (x) => padL + (x - D.min) / (D.max - D.min) * pw;
    const small = w < 520;
    const axisY = Math.round(h * 0.40);

    // 눈금
    ctx.font = `${small ? 9 : 10.5}px ${F.mono}`; ctx.textAlign = "center";
    const step = small ? 6 : 3;
    for (let k = D.min; k <= D.max; k++) {
      const x = Math.round(X(k)) + .5;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, axisY - (k % step === 0 ? 6 : 3)); ctx.lineTo(x, axisY + (k % step === 0 ? 6 : 3)); ctx.stroke();
      if (k % step === 0) { ctx.fillStyle = C.ink3; ctx.fillText(pow(k), x, axisY + 19); }
    }
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(padL, axisY + .5); ctx.lineTo(padL + pw, axisY + .5); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(D.unit, padL + pw, axisY - 10);

    // 물체 점과 이름 — 겹치지 않는 것만 이름 표시
    const n = nearest(D, e);
    const placed = [[], []];
    ctx.font = `${small ? 10.5 : 12.5}px ${F.sans}`;
    const items = [...D.items].sort((a, b) => (a === n ? -1 : b === n ? 1 : 0));
    const tops = [axisY - 40, axisY - 70];
    for (const it of items) {
      const x = X(Math.log10(it[1])), on = it === n;
      const tw = ctx.measureText(it[0]).width;
      let lx = clamp(x, padL + tw / 2, padL + pw - tw / 2);
      let row = -1;
      for (let r = 0; r < 2; r++) if (!placed[r].some(([a, b]) => lx - tw / 2 - 6 < b && lx + tw / 2 + 6 > a)) { row = r; break; }
      ctx.beginPath(); ctx.arc(x, axisY, on ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = on ? C.forest : C.ink; ctx.fill();
      if (row < 0) continue;
      placed[row].push([lx - tw / 2, lx + tw / 2]);
      const ty = tops[row];
      ctx.strokeStyle = on ? C.forest : C.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, axisY - 6); ctx.lineTo(x, ty + 5); ctx.stroke();
      ctx.fillStyle = on ? C.forest : C.ink2; ctx.textAlign = "center";
      ctx.font = `${on ? 700 : 400} ${small ? 10.5 : 12.5}px ${F.sans}`;
      ctx.fillText(it[0], lx, ty);
    }

    // 방법 띠
    const bandTop = axisY + 34, bh = Math.min(19, (h - bandTop - 6) / D.methods.length - 4);
    D.methods.forEach(([name, a, b], i) => {
      const y = bandTop + i * (bh + 4), x1 = X(a), x2 = X(b), active = e >= a && e <= b;
      ctx.fillStyle = active ? "rgba(116,171,102,.55)" : "rgba(35,35,38,.08)";
      ctx.fillRect(x1, y, x2 - x1, bh);
      ctx.font = `${active ? 600 : 400} ${small ? 10 : 12}px ${F.sans}`;
      ctx.fillStyle = active ? C.ink : C.ink2;
      const tw = ctx.measureText(name).width;
      if (tw + 8 < x2 - x1) { ctx.textAlign = "left"; ctx.fillText(name, x1 + 4, y + bh / 2 + 4); }
      else if (x2 + tw + 6 < padL + pw) { ctx.textAlign = "left"; ctx.fillText(name, x2 + 4, y + bh / 2 + 4); }
      else { ctx.textAlign = "right"; ctx.fillText(name, x1 - 4, y + bh / 2 + 4); }
    });

    // 커서
    const cx = Math.round(X(e)) + .5;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, 14); ctx.lineTo(cx, h - 4); ctx.stroke();
    ctx.fillStyle = C.warn; ctx.font = `500 ${small ? 10.5 : 12}px ${F.mono}`;
    const lab = `${pow(Math.round(e))} ${D.unit}`;
    const lw = ctx.measureText(lab).width;
    ctx.textAlign = "left";
    ctx.fillText(lab, cx + 5 + lw > w - 4 ? cx - 5 - lw : cx + 5, 12);
  }

  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    const D = DATA[mode];
    sl.min = D.min; sl.max = D.max; sl.value = mode === "len" ? 0.23 : 4.94;
    update();
  }));
  sl.addEventListener("input", update);
  update();
})();
