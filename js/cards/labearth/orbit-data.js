/* 지구과학 실험 · 인공위성과 위성의 궤도 자료 (실제 공개 자료)
   1) earth: CelesTrak SATCAT 레코드(https://celestrak.org/satcat/records.php?CATNR=번호&FORMAT=JSON), 가져온 날 2026-10-07.
      값은 미 우주군(18 SDS)이 공개하는 궤도 요소에서 계산된 공전 주기(분)와 원지점·근지점 고도(km).
      궤도 긴반지름 a = 지구 적도 반지름 6378.137 km + (원지점 + 근지점)/2.
      달: NASA Moon Fact Sheet (https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html) — 긴반지름 384,400 km, 항성 공전 주기 27.3217일.
   2) jupiter: NASA Jupiter Fact Sheet / JPL SSD 위성 평균 궤도 요소 — 긴반지름(km), 항성 공전 주기(일).
   NASA 자료는 미국 연방 정부 저작물(퍼블릭 도메인). 궤도 수치는 사실 자료로 그대로 옮겼다. */
window.LE_ORBIT = {
  RE: 6378.137,
  earth: [
    { id: "css", name: "톈궁(중국 우주 정거장)", norad: 48274, T: 92.29, apo: 388, peri: 386 },
    { id: "iss", name: "국제 우주 정거장(ISS)", norad: 25544, T: 92.98, apo: 425, peri: 416 },
    { id: "hst", name: "허블 우주 망원경", norad: 20580, T: 94.01, apo: 471, peri: 469 },
    { id: "ls9", name: "랜드샛 9", norad: 49260, T: 98.83, apo: 704, peri: 702 },
    { id: "n20", name: "NOAA-20", norad: 43013, T: 101.44, apo: 827, peri: 826 },
    { id: "jas", name: "제이슨-3", norad: 41240, T: 111.83, apo: 1318, peri: 1304 },
    { id: "gps", name: "GPS (NAVSTAR 77)", norad: 43873, T: 717.97, apo: 20290, peri: 20074 },
    { id: "gal", name: "갈릴레오 23", norad: 43566, T: 844.69, apo: 23235, peri: 23209 },
    { id: "gk2a", name: "천리안 2A (정지 궤도)", norad: 43823, T: 1436.11, apo: 35792, peri: 35781 },
    { id: "moon", name: "달", norad: 0, T: 27.3217 * 1440, a: 384400 },
  ],
  jupiter: [
    { id: "io", name: "이오", a: 421800, T: 1.769138 },
    { id: "eu", name: "유로파", a: 671100, T: 3.551181 },
    { id: "ga", name: "가니메데", a: 1070400, T: 7.154553 },
    { id: "ca", name: "칼리스토", a: 1882700, T: 16.689018 },
  ],
};
