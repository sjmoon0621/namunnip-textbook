/* 간단한 구조식 그리기 도구 (화학 반응의 세계). window.NMMol.draw(ctx, mol, cx, cy, scale, hl)
   mol: { n: [[라벨, x, y, 작용기?], ...], b: [[i, j, 결합차수], ...] } — 좌표는 결합 길이 단위, y는 위쪽이 + */
window.NMMol = (() => {
  function draw(ctx, mol, cx, cy, s, F, hlCol) {
    const P = (i) => [cx + mol.n[i][1] * s, cy - mol.n[i][2] * s];
    const r = (i) => (mol.n[i][0].length > 1 ? 13 : 8) * Math.min(1, s / 50) + 4;
    // 작용기 배경
    mol.n.forEach((nd, i) => { if (!nd[3]) return; const [x, y] = P(i); ctx.fillStyle = hlCol; ctx.beginPath(); ctx.arc(x, y, r(i) + 7, 0, Math.PI * 2); ctx.fill(); });
    mol.b.forEach(([i, j, o]) => { if (mol.n[i][3] && mol.n[j][3]) { const [x1, y1] = P(i), [x2, y2] = P(j); ctx.strokeStyle = hlCol; ctx.lineWidth = 22; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); } });
    ctx.lineCap = "butt";
    mol.b.forEach(([i, j, o]) => {
      const [x1, y1] = P(i), [x2, y2] = P(j), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, a = r(i), bb = r(j);
      const sx = x1 + ux * a, sy = y1 + uy * a, ex = x2 - ux * bb, ey = y2 - uy * bb; ctx.strokeStyle = "#232326"; ctx.lineWidth = 1.8;
      const offs = o === 2 ? [-3, 3] : o === 3 ? [-5, 0, 5] : [0];
      offs.forEach((d) => { ctx.beginPath(); ctx.moveTo(sx - uy * d, sy + ux * d); ctx.lineTo(ex - uy * d, ey + ux * d); ctx.stroke(); });
    });
    mol.n.forEach(([lab], i) => { const [x, y] = P(i); ctx.fillStyle = /^O|^N/.test(lab) ? (lab[0] === "O" ? "#c0392b" : "#2c5aa0") : "#232326"; ctx.font = `600 ${Math.max(11, Math.round(s * 0.3))}px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(lab, x, y + 5); });
  }
  return { draw };
})();
