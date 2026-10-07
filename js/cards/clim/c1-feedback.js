/* 카드: 되먹임이 온난화를 얼마나 키울까? — 0차원 에너지 균형과 되먹임 계수(IPCC AR6 표 7.10), 거미줄 그림 */
(() => {
  const root = document.getElementById("card-clim-feedback");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const PL = 3.22;   // 플랑크 응답 (W/m²/°C, 부호를 바꿔 양수로)
  const FB = { wv: 1.30, alb: 0.35 };   // 수증기+기온 감률, 지표 알베도
  const on = { wv: true, alb: true, cld: true };
  const COL = { pl: "#2f62a8", fb: "#c4462f", web: C.ink, eq: C.forest };
  const a = fit($(".fb-cv"), () => draw());
  const P = () => {
    const Fc = +$(".frc").value, cld = +$(".cld").value;
    const f = (on.wv ? FB.wv : 0) + (on.alb ? FB.alb : 0) + (on.cld ? cld : 0);
    return { Fc, cld, f };
  };

  function draw() {
    const { ctx } = a, { w, h } = a.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { Fc, f } = P();
    const box = { x0: 36, y0: 24, w: w - 48, h: h - 60 }, xmax = 10, ymax = 32;
    const X = (t) => box.x0 + t / xmax * box.w, Y = (v) => box.y0 + (ymax - v) / ymax * box.h;
    axes(ctx, { ...box, X, Y, xt: [0, 2, 4, 6, 8, 10].map((v) => [v, String(v)]), yt: [0, 10, 20, 30].map((v) => [v, String(v)]), xlabel: "기온 상승 ΔT (°C)", ylabel: "에너지 (W/m²)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    // 나가는 에너지 증가: 플랑크
    ctx.strokeStyle = COL.pl; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(xmax), Y(PL * xmax)); ctx.stroke();
    // 붙잡힌 에너지: 강제력 + 되먹임
    ctx.strokeStyle = COL.fb; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(X(0), Y(Fc)); ctx.lineTo(X(xmax), Y(Fc + f * xmax)); ctx.stroke();
    // 거미줄: T0 = 0 → 플랑크선이 (F + f T)와 같아질 때까지 데워짐 → 되먹임이 추가 에너지 → 반복
    ctx.strokeStyle = COL.web; ctx.lineWidth = 1.1; ctx.setLineDash([3, 2]);
    let T = 0; ctx.beginPath(); ctx.moveTo(X(0), Y(Fc));
    for (let k = 0; k < 30; k++) {
      const Tn = (Fc + f * T) / PL; if (Tn > xmax * 1.2) break;
      ctx.lineTo(X(Tn), Y(Fc + f * T));
      ctx.lineTo(X(Tn), Y(Fc + f * Tn));
      if (Math.abs(Tn - T) < 1e-3) break;
      T = Tn;
    }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    // 평형점
    const run = f >= PL;
    if (!run) {
      const Te = Fc / (PL - f);
      if (Te <= xmax) {
        ctx.fillStyle = COL.eq; ctx.beginPath(); ctx.arc(X(Te), Y(PL * Te), 5, 0, Math.PI * 2); ctx.fill();
        ctx.font = `11px ${F.mono}`; ctx.textAlign = Te > xmax * 0.7 ? "right" : "left"; ctx.fillStyle = COL.eq;
        ctx.fillText(`평형 +${Te.toFixed(1)} °C`, X(Te) + (Te > xmax * 0.7 ? -8 : 8), Y(PL * Te) + 16);
      }
    }
    // 범례
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    const lx = box.x0 + 8; let ly = box.y0 + 12;
    ctx.fillStyle = "rgba(251,251,248,.88)"; ctx.fillRect(lx - 4, ly - 11, 214, 48);
    [[COL.pl, "더 내보내는 에너지 (플랑크 응답 3.22·ΔT)"], [COL.fb, "붙잡힌 에너지 (강제력 + 되먹임·ΔT)"], [COL.web, "한 바퀴씩 도는 되먹임"]].forEach(([c, t], i) => {
      ctx.fillStyle = c; ctx.fillRect(lx, ly - 4, 14, i === 2 ? 1.2 : 2.4); ctx.fillStyle = C.ink2; ctx.fillText(t, lx + 20, ly); ly += 15;
    });
  }

  function update() {
    const { Fc, cld, f } = P();
    $(".frc-out").textContent = Fc.toFixed(2); $(".cld-out").textContent = (cld >= 0 ? "+" : "") + cld.toFixed(2);
    const T0 = Fc / PL;
    $(".n-0").textContent = `+${T0.toFixed(2)} °C`;
    $(".n-f").textContent = `${f >= 0 ? "+" : ""}${f.toFixed(2)} W/m²/°C`;
    const v = $(".verdict");
    if (f >= PL) {
      $(".n-t").textContent = "끝없이 오름"; $(".n-g").textContent = "∞";
      v.className = "verdict small bad";
      v.textContent = "되먹임의 합이 플랑크 응답(3.22) 이상이면 데워질수록 붙잡히는 에너지가 내보내는 에너지보다 더 빨리 늘어 평형이 없습니다. 이른바 폭주 온실 효과입니다. 실제 지구의 값(약 2.07)은 여기서 멀리 떨어져 있습니다.";
    } else {
      const Te = Fc / (PL - f), g = PL / (PL - f);
      $(".n-t").textContent = `+${Te.toFixed(2)} °C`; $(".n-g").textContent = `${g.toFixed(2)}배`;
      const part = (x) => (x * Te / PL).toFixed(2);
      v.className = "verdict small";
      v.textContent = `되먹임이 없으면 +${T0.toFixed(2)} °C에서 멈추지만, 되먹임이 한 바퀴씩 돌며 ${g.toFixed(1)}배인 +${Te.toFixed(2)} °C까지 오릅니다. 늘어난 몫: 수증기 ${on.wv ? "+" + part(FB.wv) : "0"}, 알베도 ${on.alb ? "+" + part(FB.alb) : "0"}, 구름 ${on.cld ? (cld >= 0 ? "+" : "") + part(cld) : "0"} °C.`;
    }
    draw();
  }

  $(".fbs").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-f]"); if (!bt) return;
    const k = bt.dataset.f; on[k] = !on[k]; bt.setAttribute("aria-pressed", String(on[k])); update();
  });
  $(".frcs").addEventListener("click", (e) => {
    const bt = e.target.closest("[data-v]"); if (!bt) return;
    $(".frc").value = bt.dataset.v; update();
  });
  root.querySelectorAll(".frc, .cld").forEach((el) => el.addEventListener("input", update));
  update();
  if (/[?&]demo\b/.test(location.search)) { $(".cld").value = "0.94"; update(); }
})();
