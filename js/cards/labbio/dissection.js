/* 카드: 가상 해부 — 오징어(무척추)와 붕어(척추)의 기관 위치·구조·기능, 단계별 해부, 이름 맞히기와 길이 재기 */
(() => {
  const root = document.getElementById("card-labbio-dissection");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const TAU = Math.PI * 2;
  /* 단계 설명 */
  const STEPS = {
    squid: ["1단계 · 겉모습 (배 쪽이 위)", "2단계 · 외투막을 배 쪽 가운데 선을 따라 가름", "3단계 · 먹물주머니와 간을 옆으로 젖힘", "4단계 · 등 쪽에서 갑을 빼내고 입을 벌림"],
    fish: ["1단계 · 겉모습 (왼쪽 옆면이 위)", "2단계 · 아가미뚜껑을 떼어 냄", "3단계 · 옆구리 벽을 들어냄", "4단계 · 부레와 창자를 들어냄"],
  };
  /* 핀: 이름, 위치(캔버스 비율), 실제 길이(mm, 예시), 보이는 단계 [처음, 끝] */
  const PINS = {
    squid: [
      { n: "다리", x: 0.08, y: 0.58, len: 100, s: [0, 3] }, { n: "눈", x: 0.27, y: 0.37, len: 15, s: [0, 3] }, { n: "깔때기", x: 0.335, y: 0.5, len: 25, s: [0, 0] },
      { n: "외투막", x: 0.55, y: 0.3, len: 250, s: [0, 0] }, { n: "지느러미", x: 0.86, y: 0.3, len: 90, s: [0, 3] },
      { n: "아가미", x: 0.5, y: 0.37, len: 70, s: [1, 3] }, { n: "먹물주머니", x: 0.44, y: 0.5, len: 35, s: [1, 1] }, { n: "간", x: 0.5, y: 0.56, len: 60, s: [1, 3] }, { n: "생식소", x: 0.78, y: 0.5, len: 50, s: [1, 3] },
      { n: "아가미 심장", x: 0.62, y: 0.63, len: 8, s: [2, 3] }, { n: "심장", x: 0.62, y: 0.5, len: 10, s: [2, 3] }, { n: "위", x: 0.69, y: 0.53, len: 25, s: [2, 3] },
      { n: "갑", x: 0.62, y: 0.1, len: 230, s: [3, 3] }, { n: "입(턱판)", x: 0.3, y: 0.86, len: 8, s: [3, 3] },
    ],
    fish: [
      { n: "눈", x: 0.165, y: 0.42, len: 9, s: [0, 3] }, { n: "아가미뚜껑", x: 0.245, y: 0.52, len: 25, s: [0, 0] }, { n: "측선", x: 0.6, y: 0.49, len: 110, s: [0, 0] }, { n: "지느러미", x: 0.5, y: 0.22, len: 50, s: [0, 3] },
      { n: "아가미", x: 0.235, y: 0.5, len: 18, s: [1, 3] },
      { n: "심장", x: 0.28, y: 0.66, len: 8, s: [2, 3] }, { n: "간", x: 0.36, y: 0.6, len: 30, s: [2, 2] }, { n: "창자", x: 0.5, y: 0.64, len: 300, s: [2, 2] }, { n: "부레", x: 0.45, y: 0.47, len: 55, s: [2, 2] }, { n: "생식소", x: 0.62, y: 0.57, len: 35, s: [2, 3] },
      { n: "신장", x: 0.48, y: 0.45, len: 50, s: [3, 3] }, { n: "척추", x: 0.6, y: 0.4, len: 120, s: [3, 3] },
    ],
  };
  const FUNC = {
    squid: {
      "다리": "빨판이 달린 다리 8개와 긴 촉완 2개로 먹이를 붙잡습니다. 머리에 다리가 붙어 있어 '두족류'라고 합니다.",
      "눈": "수정체와 망막을 갖춘 큰 눈으로, 척추동물의 눈과 구조가 비슷합니다(서로 다른 길로 진화한 수렴 진화).",
      "깔때기": "외투강에 들어온 물을 세게 뿜어내 몸을 반대쪽으로 밀어냅니다(제트 추진). 배설물과 먹물도 이 길로 나갑니다.",
      "외투막": "내장을 감싸는 근육질 막입니다. 수축하면 외투강의 물을 깔때기로 밀어내 헤엄치고 아가미로 물을 흘려보냅니다.",
      "지느러미": "외투막 끝의 지느러미를 물결치듯 움직여 천천히 헤엄치거나 방향을 잡습니다.",
      "아가미": "외투강 속에 깃털 모양으로 한 쌍 있습니다. 얇은 판이 겹겹이 있어 물과 닿는 면적이 넓고, 혈관이 많아 기체를 교환합니다.",
      "먹물주머니": "항문 가까이 있는 검은 주머니로, 위험할 때 먹물을 깔때기로 뿜어 몸을 숨깁니다.",
      "간": "주황빛 큰 소화샘(간)으로, 소화 효소를 만들고 영양분을 저장합니다.",
      "생식소": "몸 뒤쪽 끝에 있는 정소 또는 난소로, 생식 세포를 만듭니다.",
      "아가미 심장": "아가미 밑동에 하나씩 있는 작은 심장으로, 온몸에서 돌아온 피를 아가미로 밀어 넣습니다.",
      "심장": "가운데의 심장(체심장)이 아가미에서 산소를 받은 피를 온몸으로 보냅니다. 오징어는 심장이 모두 세 개입니다.",
      "위": "근육질 위에서 먹이를 부수고, 맹낭과 함께 소화·흡수합니다.",
      "갑": "등 쪽 외투막 속의 깃털 모양 투명한 판(연갑)으로, 조개껍데기가 몸속으로 들어가 줄어든 흔적입니다. 몸의 형태를 받칩니다.",
      "입(턱판)": "다리 가운데에 있는 새의 부리 같은 단단한 턱판으로, 먹이를 물어 자릅니다.",
    },
    fish: {
      "눈": "물속에서 가까운 곳을 보기 좋은 둥근 수정체를 가집니다.",
      "아가미뚜껑": "아가미를 덮어 보호하고, 입과 번갈아 여닫으며 아가미 위로 물이 한 방향으로 흐르게 합니다.",
      "측선": "몸 옆의 구멍 뚫린 비늘 줄로, 그 아래 감각 기관이 물의 흐름과 진동을 느낍니다.",
      "지느러미": "등지느러미는 몸이 옆으로 기울지 않게 하고, 꼬리지느러미는 앞으로 나아가는 힘을 냅니다.",
      "아가미": "붉은 아가미가 네 쌍 있습니다. 가는 새엽이 빗살처럼 늘어서 면적이 넓고, 모세 혈관이 많아 물속 산소를 흡수합니다.",
      "심장": "아가미 바로 뒤 아래쪽에 있는 1심방 1심실 심장으로, 피를 아가미로 보내고 아가미를 지난 피가 온몸으로 갑니다.",
      "간": "갈색 간(간췌장)은 쓸개즙과 소화 효소를 만들고 영양분을 저장합니다.",
      "창자": "붕어는 위가 따로 없고 창자가 몸길이의 두 배 넘게 길어 여러 번 접혀 있습니다. 소화가 느린 식물성 먹이를 오래 소화·흡수합니다.",
      "부레": "척추 바로 아래 은빛 주머니 두 칸으로, 기체 양을 조절해 물속에서 뜨고 가라앉는 깊이를 맞춥니다.",
      "생식소": "부레 아래쪽 양옆에 있는 난소나 정소로, 산란기에는 매우 커집니다.",
      "신장": "척추 바로 아래 붙은 짙은 붉은색 기관으로, 혈액에서 노폐물을 걸러 오줌을 만들고 체내 물과 염류를 조절합니다.",
      "척추": "척추뼈가 이어진 몸의 축으로, 근육이 붙어 몸을 좌우로 휘며 헤엄치게 하고 척수를 보호합니다.",
    },
  };
  let ani = "squid", step = { squid: 0, fish: 0 }, sel = null;
  const found = { squid: new Set(), fish: new Set() };
  const tbl = L.table($(".tbl-host"), [{ key: "a", label: "동물" }, { key: "s", label: "단계" }, { key: "p", label: "핀" }, { key: "g", label: "고른 이름" }, { key: "j", label: "판정" }, { key: "l", label: "길이 (mm)", res: 1 }], () => nums());
  const { ctx, size } = fit($(".cv-wide"), () => draw());
  const visible = () => PINS[ani].map((p, i) => ({ ...p, i })).filter((p) => step[ani] >= p.s[0] && step[ani] <= p.s[1]);

  function squid(w, h) {
    const st = step.squid, X = (x) => x * w, Y = (y) => y * h, cy = 0.5;
    /* 다리 */
    ctx.strokeStyle = "#c98f86"; ctx.lineCap = "round";
    for (let k = 0; k < 10; k++) {
      const tent = k === 4 || k === 5, a = (k - 4.5) * 0.09, len = tent ? 0.26 : 0.17;
      ctx.lineWidth = tent ? 3 : 7 - Math.abs(k - 4.5) * 0.5;
      ctx.beginPath(); ctx.moveTo(X(0.22), Y(cy + (k - 4.5) * 0.012)); ctx.quadraticCurveTo(X(0.22 - len * 0.5), Y(cy + a * 0.6 + Math.sin(k) * 0.03), X(0.22 - len), Y(cy + a * 1.2));
      ctx.stroke();
      if (tent) { ctx.fillStyle = "#c98f86"; ctx.beginPath(); ctx.ellipse(X(0.22 - len), Y(cy + a * 1.2), 9, 5, a, 0, TAU); ctx.fill(); }
    }
    /* 머리 */
    ctx.fillStyle = "#e7b9ae"; ctx.beginPath(); ctx.ellipse(X(0.27), Y(cy), X(0.06), Y(0.13), 0, 0, TAU); ctx.fill();
    [-1, 1].forEach((s) => { ctx.fillStyle = "#2c2c38"; ctx.beginPath(); ctx.ellipse(X(0.27), Y(cy + s * 0.12), 7, 9, 0, 0, TAU); ctx.fill(); ctx.fillStyle = "#cfd6e6"; ctx.beginPath(); ctx.arc(X(0.27) + 2, Y(cy + s * 0.12) - 3, 2.5, 0, TAU); ctx.fill(); });
    /* 외투막 바깥선 */
    const mantle = () => { ctx.beginPath(); ctx.moveTo(X(0.31), Y(cy - 0.16)); ctx.bezierCurveTo(X(0.5), Y(cy - 0.21), X(0.8), Y(cy - 0.15), X(0.93), Y(cy)); ctx.bezierCurveTo(X(0.8), Y(cy + 0.15), X(0.5), Y(cy + 0.21), X(0.31), Y(cy + 0.16)); ctx.quadraticCurveTo(X(0.33), Y(cy), X(0.31), Y(cy - 0.16)); ctx.closePath(); };
    /* 지느러미 */
    ctx.fillStyle = "#e3ab9f"; ctx.beginPath(); ctx.moveTo(X(0.74), Y(cy)); ctx.lineTo(X(0.84), Y(cy - 0.26)); ctx.lineTo(X(0.95), Y(cy)); ctx.lineTo(X(0.84), Y(cy + 0.26)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#efc3b6"; mantle(); ctx.fill();
    if (st === 0) {
      ctx.fillStyle = "rgba(140,60,60,.25)"; for (let i = 0; i < 120; i++) { ctx.beginPath(); ctx.arc(X(0.33 + (i * 37 % 100) / 100 * 0.55), Y(cy + ((i * 53 % 100) / 100 - 0.5) * 0.28 * (1 - ((i * 37 % 100) / 100) * 0.6)), 1.6, 0, TAU); ctx.fill(); }
      ctx.fillStyle = "#d99c90"; ctx.beginPath(); ctx.moveTo(X(0.36), Y(cy - 0.035)); ctx.lineTo(X(0.31), Y(cy - 0.02)); ctx.lineTo(X(0.31), Y(cy + 0.02)); ctx.lineTo(X(0.36), Y(cy + 0.035)); ctx.closePath(); ctx.fill();
    } else {
      ctx.save(); mantle(); ctx.clip();
      ctx.fillStyle = "#f6e6dc"; ctx.fillRect(X(0.3), Y(cy - 0.2), X(0.64), Y(0.4));
      /* 아가미 */
      [-1, 1].forEach((s) => {
        const gy = Y(cy + s * 0.115);
        ctx.fillStyle = "#eadbc0"; ctx.strokeStyle = "#b9a98a"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(X(0.37), gy); ctx.quadraticCurveTo(X(0.5), gy - Y(0.045), X(0.63), gy); ctx.quadraticCurveTo(X(0.5), gy + Y(0.045), X(0.37), gy); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#c9b48e"; for (let i = 1; i < 24; i++) { const x = X(0.37 + i * 0.0108), hh = Y(0.04) * Math.sin(i / 24 * Math.PI); ctx.beginPath(); ctx.moveTo(x, gy - hh); ctx.lineTo(x, gy + hh); ctx.stroke(); }
      });
      /* 간 */
      ctx.fillStyle = "#d48a3a"; ctx.beginPath(); ctx.ellipse(X(0.49), Y(cy + (st >= 2 ? 0.05 : 0.02)), X(0.1), Y(0.065), 0, 0, TAU); ctx.fill();
      /* 생식소 */
      ctx.fillStyle = "#f3efe3"; ctx.strokeStyle = "#d8cfba"; ctx.beginPath(); ctx.ellipse(X(0.78), Y(cy), X(0.08), Y(0.05), 0, 0, TAU); ctx.fill(); ctx.stroke();
      if (st === 1) { ctx.fillStyle = "#1f1f26"; ctx.beginPath(); ctx.ellipse(X(0.44), Y(cy), X(0.05), Y(0.018), 0, 0, TAU); ctx.fill(); ctx.strokeStyle = "#1f1f26"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0.39), Y(cy)); ctx.lineTo(X(0.34), Y(cy)); ctx.stroke(); }
      if (st >= 2) {
        ctx.fillStyle = "#1f1f26"; ctx.beginPath(); ctx.ellipse(X(0.42), Y(cy + 0.15), X(0.045), Y(0.016), 0.2, 0, TAU); ctx.fill();
        [-1, 1].forEach((s) => { ctx.fillStyle = "#b8576a"; ctx.beginPath(); ctx.arc(X(0.62), Y(cy + s * 0.12), 7, 0, TAU); ctx.fill(); });
        ctx.fillStyle = "#c94a5a"; ctx.beginPath(); ctx.ellipse(X(0.62), Y(cy), 9, 7, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = "#c94a5a"; ctx.lineWidth = 1.5; [-1, 1].forEach((s) => { ctx.beginPath(); ctx.moveTo(X(0.62), Y(cy)); ctx.lineTo(X(0.62), Y(cy + s * 0.12)); ctx.stroke(); });
        ctx.fillStyle = "#e8c9a8"; ctx.beginPath(); ctx.ellipse(X(0.69), Y(cy + 0.03), X(0.025), Y(0.035), 0, 0, TAU); ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = "#c48a7e"; ctx.lineWidth = 2; mantle(); ctx.stroke();
    }
    if (st === 3) {
      ctx.fillStyle = "rgba(225,200,140,.75)"; ctx.strokeStyle = "#b99a5a"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(0.36), Y(0.1)); ctx.quadraticCurveTo(X(0.6), Y(0.04), X(0.88), Y(0.1)); ctx.quadraticCurveTo(X(0.6), Y(0.16), X(0.36), Y(0.1)); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0.36), Y(0.1)); ctx.lineTo(X(0.88), Y(0.1)); ctx.stroke();
      ctx.fillStyle = "#3a2a20"; ctx.beginPath(); ctx.moveTo(X(0.28), Y(0.86)); ctx.quadraticCurveTo(X(0.3), Y(0.8), X(0.32), Y(0.86)); ctx.quadraticCurveTo(X(0.3), Y(0.9), X(0.28), Y(0.86)); ctx.fill();
          }
  }

  function fish(w, h) {
    const st = step.fish, X = (x) => x * w, Y = (y) => y * h;
    const body = () => { ctx.beginPath(); ctx.moveTo(X(0.1), Y(0.48)); ctx.bezierCurveTo(X(0.18), Y(0.27), X(0.5), Y(0.22), X(0.8), Y(0.43)); ctx.lineTo(X(0.84), Y(0.47)); ctx.lineTo(X(0.8), Y(0.55)); ctx.bezierCurveTo(X(0.55), Y(0.74), X(0.2), Y(0.73), X(0.1), Y(0.52)); ctx.closePath(); };
    ctx.fillStyle = "#b8b08a";
    ctx.beginPath(); ctx.moveTo(X(0.82), Y(0.47)); ctx.lineTo(X(0.96), Y(0.3)); ctx.quadraticCurveTo(X(0.92), Y(0.48), X(0.96), Y(0.68)); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(X(0.36), Y(0.33)); ctx.lineTo(X(0.46), Y(0.15)); ctx.lineTo(X(0.64), Y(0.34)); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(X(0.3), Y(0.62)); ctx.lineTo(X(0.36), Y(0.76)); ctx.lineTo(X(0.38), Y(0.64)); ctx.fill();
    ctx.beginPath(); ctx.moveTo(X(0.5), Y(0.68)); ctx.lineTo(X(0.54), Y(0.8)); ctx.lineTo(X(0.57), Y(0.68)); ctx.fill();
    ctx.beginPath(); ctx.moveTo(X(0.66), Y(0.6)); ctx.lineTo(X(0.7), Y(0.72)); ctx.lineTo(X(0.74), Y(0.58)); ctx.fill();
    const g = ctx.createLinearGradient(0, Y(0.25), 0, Y(0.72)); g.addColorStop(0, "#7d7a52"); g.addColorStop(0.6, "#c9c095"); g.addColorStop(1, "#ece6c8");
    ctx.fillStyle = g; body(); ctx.fill();
    ctx.save(); body(); ctx.clip();
    ctx.strokeStyle = "rgba(80,75,45,.25)"; ctx.lineWidth = 1;
    for (let i = 0; i < 18; i++) for (let j = 0; j < 8; j++) { const x = X(0.28 + i * 0.03 + (j % 2) * 0.015), y = Y(0.3 + j * 0.055); ctx.beginPath(); ctx.arc(x, y, X(0.017), -1.1, 1.1); ctx.stroke(); }
    if (st >= 2) {
      ctx.fillStyle = "#f2e8dc"; ctx.beginPath(); ctx.moveTo(X(0.26), Y(0.42)); ctx.lineTo(X(0.72), Y(0.42)); ctx.lineTo(X(0.72), Y(0.62)); ctx.quadraticCurveTo(X(0.5), Y(0.74), X(0.26), Y(0.68)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#b99a7a"; ctx.lineWidth = 1.5; ctx.stroke();
      if (st >= 3) {
        ctx.strokeStyle = "#d6cdb9"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X(0.26), Y(0.4)); ctx.lineTo(X(0.72), Y(0.41)); ctx.stroke();
        ctx.strokeStyle = "#a89c80"; ctx.lineWidth = 1; for (let x = 0.27; x < 0.72; x += 0.02) { ctx.beginPath(); ctx.moveTo(X(x), Y(0.395)); ctx.lineTo(X(x), Y(0.415)); ctx.stroke(); }
        ctx.fillStyle = "#7a2630"; ctx.beginPath(); ctx.moveTo(X(0.3), Y(0.43)); ctx.quadraticCurveTo(X(0.48), Y(0.47), X(0.66), Y(0.43)); ctx.lineTo(X(0.66), Y(0.445)); ctx.quadraticCurveTo(X(0.48), Y(0.48), X(0.3), Y(0.445)); ctx.fill();
      } else {
        const sb = (x0, x1, y) => { const gg = ctx.createLinearGradient(0, Y(y - 0.04), 0, Y(y + 0.04)); gg.addColorStop(0, "#ffffff"); gg.addColorStop(1, "#c7cdd6"); ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(X((x0 + x1) / 2), Y(y), X((x1 - x0) / 2), Y(0.04), 0, 0, TAU); ctx.fill(); ctx.strokeStyle = "#a9b0bb"; ctx.lineWidth = 1; ctx.stroke(); };
        sb(0.33, 0.44, 0.47); sb(0.45, 0.66, 0.475);
        ctx.fillStyle = "#8a5a32"; ctx.beginPath(); ctx.ellipse(X(0.35), Y(0.59), X(0.05), Y(0.035), -0.2, 0, TAU); ctx.fill();
        ctx.strokeStyle = "#c9a07a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(X(0.4), Y(0.6)); for (let k = 0; k < 6; k++) ctx.bezierCurveTo(X(0.42 + k * 0.04), Y(0.54 + (k % 2) * 0.12), X(0.44 + k * 0.04), Y(0.66 - (k % 2) * 0.12), X(0.45 + k * 0.04), Y(0.6)); ctx.stroke();
      }
      ctx.fillStyle = "#efd58a"; ctx.beginPath(); ctx.ellipse(X(0.62), Y(0.555), X(0.05), Y(0.025), 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "#c33a4a"; ctx.beginPath(); ctx.ellipse(X(0.28), Y(0.655), 7, 6, 0, 0, TAU); ctx.fill();
    } else {
      ctx.strokeStyle = "#4a4a38"; ctx.setLineDash([2, 3]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(X(0.28), Y(0.44)); ctx.quadraticCurveTo(X(0.55), Y(0.52), X(0.82), Y(0.48)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
    /* 머리, 아가미뚜껑, 아가미 */
    if (st === 0) { ctx.strokeStyle = "#5f5a3c"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0.26), Y(0.36)); ctx.quadraticCurveTo(X(0.29), Y(0.5), X(0.25), Y(0.64)); ctx.stroke(); }
    else { ctx.fillStyle = "#e9dccb"; ctx.beginPath(); ctx.moveTo(X(0.2), Y(0.38)); ctx.quadraticCurveTo(X(0.29), Y(0.5), X(0.24), Y(0.63)); ctx.lineTo(X(0.2), Y(0.6)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#c6303f"; ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(X(0.205 + k * 0.012), Y(0.4)); ctx.quadraticCurveTo(X(0.235 + k * 0.012), Y(0.5), X(0.21 + k * 0.01), Y(0.6)); ctx.stroke(); } }
    ctx.fillStyle = "#e9e3c8"; ctx.beginPath(); ctx.arc(X(0.165), Y(0.42), 8, 0, TAU); ctx.fill(); ctx.fillStyle = "#1f1f1f"; ctx.beginPath(); ctx.arc(X(0.165), Y(0.42), 4.5, 0, TAU); ctx.fill();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#d9dccf"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#cfd3c4"; for (let i = 0; i < 60; i++) ctx.fillRect((i * 97) % w, (i * 53) % h, 2, 2);
    if (ani === "squid") squid(w, h); else fish(w, h);
    for (const p of visible()) {
      const x = p.x * w, y = p.y * h, done = found[ani].has(p.n), on = sel && sel.i === p.i;
      ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - 10); ctx.stroke();
      ctx.fillStyle = on ? C.warn : done ? C.forest : "#fff"; ctx.strokeStyle = "#333";
      ctx.beginPath(); ctx.arc(x + 8, y - 13, 8, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on || done ? "#fff" : C.ink; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(String(p.i + 1), x + 8, y - 9.5);
    }
    ctx.fillStyle = "rgba(251,251,248,.88)"; ctx.fillRect(0, h - 20, w, 20);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(STEPS[ani][step[ani]], 8, h - 6);
    $(".n-step").textContent = `${step[ani] + 1} / 4`;
  }

  function nums() {
    const rows = tbl.rows;
    $(".n-ok").textContent = rows.length ? `${rows.filter((r) => r.j === "맞음").length} / ${rows.length}` : "—";
    $(".n-found").textContent = `${found[ani].size} / ${PINS[ani].length}`;
  }
  function choose(name) {
    const fb = $(".fb"); fb.classList.remove("good", "bad");
    if (!sel) { fb.textContent = "먼저 그림에서 번호 핀을 하나 누르세요."; return; }
    const ok = name === sel.n, len = ok ? L.measure(sel.len, { sd: 1 + sel.len * 0.02, res: 1 }) : NaN;
    tbl.add({ a: ani === "squid" ? "오징어" : "붕어", s: step[ani] + 1, p: sel.i + 1, g: name, j: ok ? "맞음" : "틀림", l: len });
    if (ok) { found[ani].add(sel.n); fb.classList.add("good"); fb.textContent = `${sel.i + 1}번 ${sel.n}: ${FUNC[ani][sel.n]}`; }
    else { fb.classList.add("bad"); fb.textContent = `${sel.i + 1}번은 ${name}이(가) 아닙니다. ${FUNC[ani][name] ? "" : `${ani === "squid" ? "오징어" : "붕어"}에는 ${name}이(가) 없습니다. `}위치와 생김새를 다시 보세요.`; }
    sel = null; nums(); draw();
  }
  function setAni(a) { ani = a; sel = null; root.querySelectorAll("[data-a]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.a === a))); nums(); draw(); }

  $(".cv-wide").addEventListener("click", (e) => {
    const r = $(".cv-wide").getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, { w, h } = size;
    let best = null, bd = 1e9;
    for (const p of visible()) { const d = Math.min(Math.hypot(p.x * w + 8 - x, p.y * h - 13 - y), Math.hypot(p.x * w - x, p.y * h - y)); if (d < bd) { bd = d; best = p; } }
    if (best && bd < 16) { sel = best; const fb = $(".fb"); fb.classList.remove("good", "bad"); fb.textContent = `${best.i + 1}번 핀을 골랐습니다. 이 기관의 이름은?`; draw(); }
  });
  $(".ani").addEventListener("click", (e) => { const b = e.target.closest("[data-a]"); if (b) setAni(b.dataset.a); });
  $(".names").addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (b) choose(b.dataset.n); });
  $(".st-fwd").addEventListener("click", () => { if (step[ani] < 3) step[ani]++; sel = null; draw(); });
  $(".st-back").addEventListener("click", () => { if (step[ani] > 0) step[ani]--; sel = null; draw(); });
  nums(); draw();

  if (L.demo) {
    const go = (a, st, picks) => { setAni(a); step[a] = st; picks.forEach(([n, g]) => { sel = visible().find((p) => p.n === n); if (sel) choose(g || n); }); };
    go("fish", 0, [["측선"], ["아가미뚜껑"]]);
    go("fish", 2, [["부레"], ["간", "생식소"], ["간"], ["심장"]]);
    go("fish", 3, [["신장"]]);
    go("squid", 0, [["깔때기"], ["외투막"]]);
    go("squid", 1, [["아가미"], ["먹물주머니"]]);
    go("squid", 2, [["아가미 심장"], ["심장"]]);
    sel = visible().find((p) => p.n === "위"); draw();
  }
})();
