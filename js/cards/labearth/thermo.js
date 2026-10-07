/* 지구과학 실험 대기 열역학 공용 계산 window.LEThermo — 포화 수증기압, 혼합비, 단열선, 공기 덩어리 상승 계산.
   기온은 °C, 기압은 hPa. 식: 포화 수증기압은 마그누스–테텐스 근사(Bolton 1980), 습윤 단열선은 위단열(pseudo-adiabatic) 근사. */
window.LEThermo = (() => {
  "use strict";
  const Rd = 287.04, Rv = 461.5, cp = 1005.7, Lv = 2.501e6, EPS = 0.622, G = 9.80665, K = 273.15;
  const KAPPA = Rd / cp;

  /* 물 표면 위 포화 수증기압 (hPa) */
  const es = (T) => 6.112 * Math.exp(17.67 * T / (T + 243.5));
  /* 수증기압 e (hPa)에서 이슬점 (°C) */
  const tdOf = (e) => { const l = Math.log(e / 6.112); return 243.5 * l / (17.67 - l); };
  /* 혼합비 w (kg/kg) = 0.622 e / (p − e), 비습 q = 0.622 e / (p − 0.378 e) */
  const wOf = (e, p) => EPS * e / (p - e);
  const qOf = (e, p) => EPS * e / (p - 0.378 * e);
  const eOfW = (w, p) => w * p / (EPS + w);
  /* 포화 혼합비 (kg/kg) */
  const ws = (T, p) => wOf(es(T), p);
  /* 절대 습도 (g/m³) */
  const rhoV = (e, T) => e * 100 / (Rv * (T + K)) * 1000;

  /* 건조 단열선: 1000 hPa에서 온위 θ(°C)인 공기의 기압 p에서의 기온 */
  const dryT = (theta, p) => (theta + K) * Math.pow(p / 1000, KAPPA) - K;
  const thetaOf = (T, p) => (T + K) * Math.pow(1000 / p, KAPPA) - K;
  /* 혼합비선: 혼합비 w(kg/kg)가 일정할 때 기압 p에서의 이슬점 */
  const wLineT = (w, p) => tdOf(eOfW(w, p));

  /* 위단열 감률 dT/dp (K/hPa) */
  function moistDTdp(T, p) {
    const Tk = T + K, r = ws(T, p);
    return (Rd * Tk + Lv * r) / (p * (cp + Lv * Lv * r * EPS / (Rd * Tk * Tk)));
  }
  /* 습윤 단열선을 p0(T0)에서 p1까지 따라간 기온 (작은 걸음 RK2) */
  function moistT(T0, p0, p1) {
    const n = Math.max(2, Math.ceil(Math.abs(p1 - p0) / 5)), h = (p1 - p0) / n;
    let T = T0, p = p0;
    for (let i = 0; i < n; i++) {
      const k1 = moistDTdp(T, p), k2 = moistDTdp(T + k1 * h / 2, p + h / 2);
      T += k2 * h; p += h;
    }
    return T;
  }
  /* 습윤 단열 감률 (°C/km), 기온 T·기압 p에서 */
  function gammaM(T, p) {
    const Tk = T + K, r = ws(T, p);
    return 1000 * G * (1 + Lv * r / (Rd * Tk)) / (cp + Lv * Lv * r * EPS / (Rd * Tk * Tk));
  }
  const gammaD = 1000 * G / cp;   // 9.75 °C/km

  /* 상승 응결 고도: 지표 (T, Td, p)의 공기를 건조 단열로 올려 혼합비선과 만나는 점 */
  function lcl(T, Td, p) {
    const w = wOf(es(Td), p), th = thetaOf(T, p);
    let lo = 100, hi = p;
    for (let i = 0; i < 50; i++) {
      const m = (lo + hi) / 2;
      if (ws(dryT(th, m), m) > w) hi = m; else lo = m;
    }
    return { p: hi, T: dryT(th, hi) };
  }

  /* 관측 자료 lv = [[p, z, T, Td], …] (기압이 줄어드는 순) 보간 */
  function interp(lv, p, col) {
    for (let i = 0; i < lv.length - 1; i++) {
      const a = lv[i], b = lv[i + 1];
      if (a[0] >= p && p >= b[0]) {
        if (a[col] == null || b[col] == null) return null;
        const f = Math.log(a[0] / p) / Math.log(a[0] / b[0]);
        return a[col] + f * (b[col] - a[col]);
      }
    }
    return null;
  }
  const envT = (lv, p) => interp(lv, p, 2);
  const zAt = (lv, p) => interp(lv, p, 1);
  /* 높이 z(m)에서의 기압 */
  function pAtZ(lv, z) {
    for (let i = 0; i < lv.length - 1; i++) {
      const a = lv[i], b = lv[i + 1];
      if (a[1] <= z && z <= b[1]) return a[0] * Math.pow(b[0] / a[0], (z - a[1]) / (b[1] - a[1]));
    }
    return null;
  }
  /* 기온이 있는 층에서 이슬점이 있는 층까지 보간한 이슬점 */
  function envTd(lv, p) {
    const pts = lv.filter((r) => r[3] != null);
    return interp(pts, p, 3);
  }

  /* 지표 공기 덩어리 상승 분석: LCL, CCL, LFC, EL, CAPE, CIN과 공기 덩어리 경로 */
  function parcel(lv) {
    const s = lv[0], p0 = s[0], T0 = s[2], Td0 = s[3];
    const L = lcl(T0, Td0, p0), th = thetaOf(T0, p0), w0 = wOf(es(Td0), p0);
    const top = Math.max(100, lv[lv.length - 1][0]);
    const path = [];
    let Tm = L.T, pm = L.p;
    for (let p = p0; p >= top; p -= 2) {
      let Tp;
      if (p > L.p) Tp = dryT(th, p);
      else { Tm = moistT(Tm, pm, p); pm = p; Tp = Tm; }
      const Te = envT(lv, p);
      if (Te == null) break;
      path.push([p, Tp, Te]);
    }
    /* 부력 적분: CAPE = Rd ∫ (Tvp − Tve) d ln p (여기서는 기온으로 근사) */
    let cape = 0, cin = 0, lfc = null, el = null;
    const pos = path.map(([, Tp, Te]) => Tp > Te);
    let lastPos = -1;
    for (let i = path.length - 1; i >= 0; i--) if (pos[i] && path[i][0] <= L.p + 1) { lastPos = i; break; }
    if (lastPos >= 0) {
      let i0 = lastPos;
      while (i0 > 0 && pos[i0 - 1] && path[i0 - 1][0] <= L.p + 1) i0--;
      lfc = path[i0][0];
      el = lastPos < path.length - 1 ? path[lastPos + 1][0] : path[lastPos][0];
      for (let i = 1; i < path.length; i++) {
        const [p, Tp, Te] = path[i], dl = Math.log(path[i - 1][0] / p), b = Rd * (Tp - Te) * dl;
        if (p >= lfc) { if (b < 0) cin += b; }
        else if (p >= el) cape += b;
      }
    }
    /* 대류 응결 고도: 지표 이슬점의 혼합비선이 주변 기온 곡선과 처음 만나는 점 */
    let ccl = null;
    for (let i = 1; i < path.length; i++) {
      const p = path[i][0], Te = path[i][2];
      if (wLineT(w0, p) >= Te) { ccl = { p, T: Te }; break; }
    }
    return { lcl: L, lfc, el, cape: Math.max(0, cape), cin, ccl, path, w0, theta: th, convT: ccl ? thetaOf(ccl.T, ccl.p) : null };
  }

  return { Rd, Rv, cp, Lv, EPS, G, K, es, tdOf, wOf, qOf, eOfW, ws, rhoV, dryT, thetaOf, wLineT, moistDTdp, moistT, gammaM, gammaD, lcl, interp, envT, envTd, zAt, pAtZ, parcel };
})();
