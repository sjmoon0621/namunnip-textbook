/* 카드: 판 경계마다 지진과 화산은 어떻게 다를까? — 경계 유형별 단면과 진원 깊이 */
(() => {
  const root = document.getElementById("card-is1-plate-boundary");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const chips = [...root.querySelectorAll("[data-b]")];
  const sD = $(".dmin"), oD = $(".dmin-out");
  const nN = $(".n-eq"), nMax = $(".n-max"), nV = $(".n-vol"), note = $(".b-note");

  const W = 1400, DMAX = 720; // 단면 범위 (km), 가로·세로 같은 축척
  // 결정적인 난수 (새로 고쳐도 같은 그림)
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // 섭입대: 해구(x=300 km)에서 판 윗면의 깊이 d일 때의 가로 위치
  const XT = 300;
  const slabX = (d) => XT + (d < 60 ? d * 2.75 : 165 + (d - 60) * 0.84);

  const B = {
    ridge: {
      name: "발산형 경계 (해령)", ex: "대서양 중앙 해령, 아이슬란드", vol: "있음 (해령을 따라 현무암질 마그마)",
      note: "두 해양판이 벌어지는 틈으로 맨틀 물질이 올라와 새 해양 지각이 됩니다. 판이 얇아 지진은 얕은 곳에서만 일어납니다.",
      quakes() { const r = rng(11), q = []; for (let i = 0; i < 70; i++) q.push([700 + (r() - .5) * 90, r() * 12]); return q; },
    },
    subduction: {
      name: "수렴형 경계 (섭입대)", ex: "일본 열도, 안데스 산맥", vol: "있음 (해구에서 수백 km 떨어진 곳에 화산대)",
      note: "무거운 해양판이 다른 판 아래로 비스듬히 들어갑니다. 내려가는 판을 따라 지진이 일어나 진원이 해구에서 멀어질수록 깊어집니다.",
      quakes() {
        const r = rng(7), q = [];
        for (let i = 0; i < 150; i++) {
          // 얕은 곳에 많고 깊을수록 드묾, 300~500 km 부근은 비교적 적음
          let d = Math.pow(r(), 2.2) * 690;
          if (d > 300 && d < 500 && r() < 0.6) d = r() * 120;
          q.push([slabX(d) + (r() - .5) * 26, d + 4 + r() * 18]);
        }
        for (let i = 0; i < 25; i++) q.push([XT + 60 + r() * 400, r() * 30]); // 위 판 지각 속 얕은 지진
        return q;
      },
    },
    collision: {
      name: "수렴형 경계 (충돌대)", ex: "히말라야 산맥", vol: "거의 없음",
      note: "두 대륙판은 모두 가벼워 어느 쪽도 깊이 가라앉지 못하고 부딪쳐 두꺼워집니다. 지진은 넓은 지역에서 얕거나 중간 깊이로 일어나고, 화산은 거의 없습니다.",
      quakes() { const r = rng(5), q = []; for (let i = 0; i < 110; i++) q.push([420 + r() * 620, Math.pow(r(), 1.6) * 90]); return q; },
    },
    transform: {
      name: "보존형 경계 (변환 단층)", ex: "산안드레아스 단층", vol: "없음",
      note: "두 판이 어긋나며 옆으로 미끄러집니다. 판이 생기지도 사라지지도 않으며, 지진은 단층을 따라 얕은 곳에서만 일어납니다.",
      quakes() { const r = rng(3), q = []; for (let i = 0; i < 70; i++) q.push([700 + (r() - .5) * 30, r() * 18]); return q; },
    },
  };
  for (const k in B) B[k].q = B[k].quakes();
  let sel = "subduction", phase = 0;

  const { ctx, size } = fit(cv, () => draw());
  const dcol = (d) => d < 70 ? C.apple : d < 300 ? C.amber : "#3f6fa0";

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const top = 40, s = Math.min((h - top - 20) / DMAX, w / W);
    const ox = (w - W * s) / 2;
    const X = (km) => ox + km * s, Y = (d) => top + d * s;
    const b = B[sel];
    // 맨틀 배경
    ctx.fillStyle = "#f3e9df"; ctx.fillRect(X(0), Y(0), W * s, DMAX * s);
    // 깊이 눈금
    ctx.font = `10px ${F.mono}`; ctx.strokeStyle = "rgba(0,0,0,.06)"; ctx.fillStyle = C.ink3;
    for (let d = 100; d <= 700; d += 100) {
      ctx.beginPath(); ctx.moveTo(X(0), Math.round(Y(d)) + .5); ctx.lineTo(X(W), Math.round(Y(d)) + .5); ctx.stroke();
      ctx.textAlign = "left"; ctx.fillText(`${d} km`, X(0) + 3, Y(d) - 3);
    }
    const lithoFill = (ocean) => ocean ? "#8fa3b3" : "#b9a88e";
    const TH = 90; // 암석권 두께 (모식)
    // 판 그리기 (유형별)
    ctx.lineWidth = 1; ctx.strokeStyle = C.ink2;
    const band = (x1, x2, d1, fill) => { ctx.fillStyle = fill; ctx.fillRect(X(x1), Y(0), (x2 - x1) * s, d1 * s); };
    const water = (x1, x2) => { ctx.fillStyle = "#cfe0ee"; ctx.fillRect(X(x1), Y(0) - 10, (x2 - x1) * s, 10); };
    const mountain = (xc, wd, ht, col) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X(xc - wd), Y(0));
      ctx.quadraticCurveTo(X(xc), Y(0) - ht * 2, X(xc + wd), Y(0)); ctx.fill();
    };
    const volcano = (xc) => {
      ctx.fillStyle = "#7a5a44"; ctx.beginPath(); ctx.moveTo(X(xc) - 11, Y(0)); ctx.lineTo(X(xc) - 3, Y(0) - 16); ctx.lineTo(X(xc) + 3, Y(0) - 16); ctx.lineTo(X(xc) + 11, Y(0)); ctx.fill();
      ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(xc), Y(0) - 19, 3.5, 0, Math.PI * 2); ctx.fill();
    };
    const arrowH = (x, y, dir) => {
      ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(x - dir * 18, y); ctx.lineTo(x + dir * 18, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + dir * 22, y); ctx.lineTo(x + dir * 14, y - 4.5); ctx.lineTo(x + dir * 14, y + 4.5); ctx.fill();
    };
    const tick = (x1, x2, dir) => { // 판 위의 움직이는 눈금
      ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1;
      for (let k = x1 + ((phase * dir * 40) % 40 + 40) % 40; k < x2; k += 40) { ctx.beginPath(); ctx.moveTo(X(k), Y(3)); ctx.lineTo(X(k), Y(12)); ctx.stroke(); }
    };

    if (sel === "ridge") {
      water(0, W);
      // 해령에서 멀어질수록 두꺼워지는 판
      for (const dir of [-1, 1]) {
        ctx.fillStyle = lithoFill(true); ctx.beginPath(); ctx.moveTo(X(700), Y(0));
        for (let k = 0; k <= 700; k += 20) ctx.lineTo(X(700 + dir * k), Y(Math.min(TH, 8 + Math.sqrt(k) * 3.6)));
        ctx.lineTo(X(700 + dir * 700), Y(0)); ctx.fill();
        tick(dir < 0 ? 0 : 710, dir < 0 ? 690 : W, dir);
        arrowH(X(700 + dir * 330), Y(0) - 22, dir);
      }
      ctx.fillStyle = "rgba(212,73,58,.35)"; ctx.beginPath(); ctx.ellipse(X(700), Y(40), 22 * s * 3, 45 * s, 0, 0, Math.PI * 2); ctx.fill();
      mountain(700, 110, 9, "#8fa3b3"); volcano(700);
    } else if (sel === "subduction") {
      water(0, XT + 90);
      band(0, XT, TH, lithoFill(true)); tick(0, XT, 1);
      // 섭입하는 판
      ctx.fillStyle = lithoFill(true); ctx.beginPath();
      for (let d = 0; d <= 690; d += 10) ctx.lineTo(X(slabX(d)), Y(d));
      for (let d = 690; d >= 0; d -= 10) ctx.lineTo(X(slabX(d) + TH * (d < 60 ? .5 : .9)), Y(d + TH * (d < 60 ? .85 : .6)));
      ctx.fill();
      // 대륙판
      ctx.fillStyle = lithoFill(false); ctx.beginPath(); ctx.moveTo(X(XT), Y(0));
      ctx.lineTo(X(W), Y(0)); ctx.lineTo(X(W), Y(TH + 20));
      for (let d = TH + 10; d >= 0; d -= 5) ctx.lineTo(X(slabX(d) - 2), Y(d));
      ctx.fill();
      mountain(560, 180, 12, lithoFill(false));
      // 마그마 생성 (판 윗면 깊이 약 100 km)
      const mx = slabX(105);
      ctx.fillStyle = "rgba(212,73,58,.35)"; ctx.beginPath(); ctx.ellipse(X(mx) - 6, Y(75), 9, 26 * s * 1.5 + 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(212,73,58,.6)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(mx) - 6, Y(95)); ctx.lineTo(X(mx) - 6, Y(0)); ctx.stroke(); ctx.setLineDash([]);
      volcano(mx - 6 / s);
      arrowH(X(150), Y(0) - 22, 1);
      ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText("해구", X(XT), Y(0) - 14);
    } else if (sel === "collision") {
      band(0, 700, TH + 30, lithoFill(false)); band(700, W, TH + 30, lithoFill(false));
      // 두꺼워진 지각 (산맥 뿌리)
      ctx.fillStyle = "#a8967a"; ctx.beginPath(); ctx.ellipse(X(720), Y(TH + 20), 260 * s, 60 * s, 0, 0, Math.PI); ctx.fill();
      mountain(720, 300, 22, "#b9a88e");
      tick(0, 650, 1); tick(760, W, -1);
      arrowH(X(250), Y(0) - 22, 1); arrowH(X(1180), Y(0) - 22, -1);
    } else {
      band(0, 700, TH, lithoFill(false)); band(700, W, TH, "#a99a82");
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(700), Y(0) - 6); ctx.lineTo(X(700), Y(TH)); ctx.stroke();
      // 종이면 안쪽/바깥쪽 기호
      const sym = (x, into) => {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, Y(0) - 22, 9, 0, Math.PI * 2); ctx.stroke();
        if (into) { ctx.beginPath(); ctx.moveTo(x - 5, Y(0) - 27); ctx.lineTo(x + 5, Y(0) - 17); ctx.moveTo(x + 5, Y(0) - 27); ctx.lineTo(x - 5, Y(0) - 17); ctx.stroke(); }
        else { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, Y(0) - 22, 3, 0, Math.PI * 2); ctx.fill(); }
      };
      sym(X(500), true); sym(X(900), false);
      ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
      ctx.fillText("화면 안쪽으로", X(500), Y(0) - 36); ctx.fillText("화면 바깥쪽으로", X(900), Y(0) - 36);
    }
    ctx.textAlign = "left";

    // 지진
    const dmin = +sD.value;
    b.q.forEach(([x, d]) => {
      const on = d >= dmin;
      ctx.beginPath(); ctx.arc(X(x), Y(d), on ? 2.6 : 1.6, 0, Math.PI * 2);
      ctx.fillStyle = on ? dcol(d) : "rgba(0,0,0,.12)"; ctx.fill();
    });
    if (dmin > 0) {
      ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(0), Y(dmin)); ctx.lineTo(X(W), Y(dmin)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("모식 · 가로와 세로 같은 축척 · 지형 높이만 과장", X(W) - 4, h - 4); ctx.textAlign = "left";
  }

  function update() {
    const b = B[sel], dmin = +sD.value;
    oD.textContent = dmin;
    const vis = b.q.filter(([, d]) => d >= dmin);
    nN.textContent = `${vis.length} / ${b.q.length}`;
    nMax.textContent = sel === "subduction" ? "약 700 km" : sel === "collision" ? "약 100 km" : sel === "ridge" ? "약 10 km" : "약 20 km";
    nV.textContent = b.vol.split(" (")[0];
    note.innerHTML = `<b>${b.name}</b> · 예: ${b.ex}. ${b.note}`;
    chips.forEach((c) => c.setAttribute("aria-pressed", c.dataset.b === sel ? "true" : "false"));
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => { sel = c.dataset.b; update(); }));
  sD.addEventListener("input", update);
  update();
  loop(cv, (dt) => { if (NM.reduce) return; phase += dt * 0.5; draw(); });
})();
