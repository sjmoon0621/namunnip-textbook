/* 카드: 왜 한쪽 병동에서만 산모가 더 많이 죽었을까? — 제멜바이스의 산욕열 자료(1841~1846)와 가설 시험 */
(() => {
  const root = document.getElementById("card-resr-semmelweis");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);

  /* 제멜바이스(1861)의 표: [연도, 제1병동 분만, 제1병동 사망, 제2병동 분만, 제2병동 사망] */
  const D = [
    [1841, 3036, 237, 2442, 86], [1842, 3287, 518, 2659, 202], [1843, 3060, 274, 2739, 164],
    [1844, 3157, 260, 2956, 68], [1845, 3492, 241, 3241, 66], [1846, 4010, 459, 3754, 105],
  ];
  const AFTER = { year: 1848, b: 3556, d: 45 };   // 손 씻기 도입(1847년 5월) 이후 제1병동

  const H = [
    { k: "epi", name: "유행병 기운",
      h: "도시 전체에 퍼진 대기·지구의 '유행병 기운'이 산욕열을 일으킨다.",
      p: "그렇다면 같은 빈 시내의 두 병동은 사망률이 비슷해야 하고, 병원에 오다 길에서 아이를 낳은 산모도 똑같이 걸려야 한다.",
      r: "해마다 제1병동만 높았고, 길에서 낳고 들어온 산모는 오히려 산욕열이 드물었다.", ok: false },
    { k: "crowd", name: "과밀",
      h: "제1병동이 더 붐벼서 산모가 더 많이 죽는다.",
      p: "그렇다면 제1병동이 제2병동보다 더 붐벼야 한다.",
      r: "오히려 제2병동이 더 붐볐다. 제1병동의 소문을 들은 산모들이 그곳을 피하려 했기 때문이다.", ok: false },
    { k: "exam", name: "거친 진찰",
      h: "의대생들의 거친 진찰이 상처를 내서 병이 생긴다.",
      p: "그렇다면 의대생 수와 진찰 횟수를 줄이면 사망률이 떨어져야 한다.",
      r: "의대생을 절반으로 줄이고 진찰을 최소로 했지만, 사망률은 잠깐 내렸다가 전보다 더 높아졌다. 출산 자체의 상처가 진찰보다 훨씬 크고, 제2병동 조산사들도 같은 방식으로 진찰했다.", ok: false },
    { k: "priest", name: "신부의 종소리",
      h: "임종 성사를 주러 오는 신부의 종소리가 제1병동 산모들을 겁먹게 해 병이 생긴다.",
      p: "그렇다면 신부가 종을 울리지 않고 다른 길로 오게 하면 사망률이 떨어져야 한다.",
      r: "신부가 돌아서 조용히 오도록 바꾸었지만 사망률은 변하지 않았다.", ok: false },
    { k: "pose", name: "분만 자세",
      h: "제1병동은 반듯이 누운 자세로, 제2병동은 옆으로 누운 자세로 분만한다. 이 자세 차이가 원인이다.",
      p: "그렇다면 제1병동도 옆으로 누워 분만하게 하면 사망률이 떨어져야 한다.",
      r: "자세를 바꾸었지만 사망률은 변하지 않았다.", ok: false },
    { k: "cadaver", name: "시체 물질",
      h: "1847년 동료 콜레치카가 해부 중 학생의 칼에 베인 뒤 산욕열과 같은 증상으로 죽었다. 해부실에서 바로 와서 진찰하는 의사와 의대생의 손에 묻은 '시체 물질'이 원인이다. 제2병동 조산사들은 해부를 하지 않는다.",
      p: "그렇다면 진찰 전에 염소 석회수로 손을 씻어 그 물질을 없애면 제1병동 사망률이 떨어져야 한다.",
      r: "1847년 5월부터 손 씻기를 하자 사망률이 급히 떨어졌고, 1848년 제1병동 사망률은 1.27%(3,556명 중 45명)였다. 길에서 낳은 산모가 드물게 걸린 것도 진찰을 덜 받았기 때문으로 설명된다.", ok: true },
  ];

  let mode = "year", cur = null;
  const seen = {};
  const pct = (d, b) => d / b * 100;
  const tot = D.reduce((s, r) => [s[0] + r[1], s[1] + r[2], s[2] + r[3], s[3] + r[4]], [0, 0, 0, 0]);

  const cv = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const showAfter = seen.cadaver != null;
    const groups = mode === "year"
      ? D.map((r) => ({ lab: String(r[0]), a: pct(r[2], r[1]), b: pct(r[4], r[3]) }))
      : [{ lab: "1841~1846", a: pct(tot[1], tot[0]), b: pct(tot[3], tot[2]) }];
    if (showAfter) groups.push({ lab: AFTER.year + (w > 520 ? " 손 씻기 뒤" : "*"), a: pct(AFTER.d, AFTER.b), b: null, after: true });
    const x0 = 40, y0 = 30, bw = w - x0 - 14, bh = h - y0 - 40, top = 18;
    const Y = (v) => y0 + bh - v / top * bh;
    NM.axes(ctx, { x0, y0, w: bw, h: bh, X: (v) => v, Y, yt: [0, 3, 6, 9, 12, 15, 18].map((v) => [v, v + ""]), ylabel: "사망률 (%)" });
    const gw = bw / groups.length, barW = Math.min(30, gw * 0.32);
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "center";
    groups.forEach((g, i) => {
      const cx = x0 + gw * (i + 0.5);
      const bars = g.b == null ? [[g.a, C.apple, 0]] : [[g.a, C.apple, -barW * 0.55], [g.b, C.leaf, barW * 0.55]];
      bars.forEach(([v, col, dx]) => {
        ctx.fillStyle = col; ctx.fillRect(cx + dx - barW / 2, Y(v), barW, Y(0) - Y(v));
        ctx.fillStyle = C.ink2; ctx.fillText(v.toFixed(1), cx + dx, Y(v) - 4);
      });
      ctx.fillStyle = g.after ? C.forest : C.ink3;
      ctx.fillText(g.lab, cx, y0 + bh + 15);
    });
    if (showAfter) {
      const xs = x0 + gw * (groups.length - 1);
      ctx.strokeStyle = C.forest; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xs, y0); ctx.lineTo(xs, y0 + bh); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.textAlign = "left"; ctx.font = `11.5px ${F.sans}`;
    ctx.fillStyle = C.apple; ctx.fillRect(w - 186, 8, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText("제1병동", w - 172, 17);
    ctx.fillStyle = C.leaf; ctx.fillRect(w - 110, 8, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText("제2병동", w - 96, 17);
  }

  function nums() {
    const rows = mode === "year" ? D : [[0, ...tot]];
    const a = mode === "year" ? Math.min(...D.map((r) => pct(r[2], r[1]))) : pct(tot[1], tot[0]);
    const a2 = mode === "year" ? Math.max(...D.map((r) => pct(r[2], r[1]))) : a;
    const b = mode === "year" ? Math.min(...D.map((r) => pct(r[4], r[3]))) : pct(tot[3], tot[2]);
    const b2 = mode === "year" ? Math.max(...D.map((r) => pct(r[4], r[3]))) : b;
    $(".n1").textContent = mode === "year" ? `${a.toFixed(1)}~${a2.toFixed(1)}%` : `${a.toFixed(2)}%`;
    $(".n2").textContent = mode === "year" ? `${b.toFixed(1)}~${b2.toFixed(1)}%` : `${b.toFixed(2)}%`;
    const ratio = rows.map((r) => pct(r[2], r[1]) / pct(r[4], r[3]));
    $(".nr").textContent = mode === "year" ? `${Math.min(...ratio).toFixed(1)}~${Math.max(...ratio).toFixed(1)}배` : `${ratio[0].toFixed(1)}배`;
  }

  const hostH = $(".r1s-hyp"), box = $(".r1s-box");
  hostH.innerHTML = H.map((x, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="false">${i + 1}. ${x.name}</button>`).join("");

  function show() {
    if (cur == null) {
      box.innerHTML = `<p>위 자료에서 끌어낼 수 있는 규칙은 "제1병동의 사망률이 해마다 제2병동보다 높다"입니다. 이것은 관찰을 모아 얻은 <b>귀납</b>의 결과입니다. 왜 그런지는 아직 모릅니다.</p><p>아래 가설 단추를 골라 제멜바이스가 원인을 어떻게 시험했는지 따라가 보세요.</p>`;
      return;
    }
    const x = H[cur], g = seen[x.k];
    let html = `<p><b class="mono">가설</b>${x.h}</p><p><b class="mono">예측</b>${x.p}</p>`;
    if (g == null) {
      html += `<div class="r1s-guess"><span class="mono small dim">결과를 보기 전에 예측해 보세요</span><button type="button" class="chip r1s-g" data-g="1">지지될 것이다</button><button type="button" class="chip r1s-g" data-g="0">기각될 것이다</button></div>`;
    } else {
      html += `<p class="r1s-res ${x.ok ? "r1s-yes" : "r1s-no"}"><b class="mono">결과</b>${x.r} → <b>${x.ok ? "예측대로 나옴: 가설 지지" : "예측과 어긋남: 가설 기각"}</b></p>`;
      html += `<p class="small dim">내 예측: ${g === x.ok ? "맞힘" : "빗나감"}</p>`;
    }
    const done = H.filter((y) => seen[y.k] != null);
    html += `<p class="r1s-score mono">시험한 가설 ${done.length}/6 · 기각 ${done.filter((y) => !y.ok).length} · 지지 ${done.filter((y) => y.ok).length}</p>`;
    box.innerHTML = html;
  }

  hostH.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    cur = +b.dataset.i;
    hostH.querySelectorAll("[data-i]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    show();
  });
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".r1s-g"); if (!b || cur == null) return;
    seen[H[cur].k] = b.dataset.g === "1";
    show(); draw();
  });
  $(".r1s-mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return;
    mode = b.dataset.m;
    root.querySelectorAll(".r1s-mode [data-m]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    nums(); draw();
  });
  nums(); show();
  if (/[?&]demo\b/.test(location.search)) {
    H.forEach((x) => { seen[x.k] = false; });
    cur = 5; hostH.querySelector('[data-i="5"]').setAttribute("aria-pressed", "true"); show(); draw();
  }
})();
