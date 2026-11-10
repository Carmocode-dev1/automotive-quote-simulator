export const SAMPLE_INVENTORY = [
  {
    id: 'veh-01',
    brandDivision: 'Division Alpha',
    make: 'Toyota',
    model: 'Corolla Touring Hybrid 140H',
    plate: '4821-KLM',
    year: 2024,
    fuel: 'Hybrid',
    mileageKm: 18400,
    salePrice: 23900,
    defaultDiscount: 900,
    colorHex: '#2e5ea8',
    cachedPhoto: true,
  },
  {
    id: 'veh-02',
    brandDivision: 'Division Alpha',
    make: 'Volkswagen',
    model: 'T-Roc Style 1.0 TSI 110CV',
    plate: '7190-MNP',
    year: 2023,
    fuel: 'Petrol',
    mileageKm: 29100,
    salePrice: 22450,
    defaultDiscount: 650,
    colorHex: '#356c8f',
    cachedPhoto: false,
  },
  {
    id: 'veh-03',
    brandDivision: 'Division Beta',
    make: 'Hyundai',
    model: 'Tucson 1.6 CRDi MHEV',
    plate: '3304-LRT',
    year: 2024,
    fuel: 'Hybrid',
    mileageKm: 14200,
    salePrice: 27800,
    defaultDiscount: 1200,
    colorHex: '#0d7a5f',
    cachedPhoto: true,
  },
  {
    id: 'veh-04',
    brandDivision: 'Division Beta',
    make: 'Peugeot',
    model: '2008 Active Pack BlueHDi',
    plate: '9052-KXP',
    year: 2022,
    fuel: 'Diesel',
    mileageKm: 41800,
    salePrice: 18950,
    defaultDiscount: 500,
    colorHex: '#1f7a68',
    cachedPhoto: false,
  },
  {
    id: 'veh-05',
    brandDivision: 'Division Alpha',
    make: 'Kia',
    model: 'Niro Concept EV 64 kWh',
    plate: '6618-MPZ',
    year: 2024,
    fuel: 'Electric',
    mileageKm: 9800,
    salePrice: 29400,
    defaultDiscount: 1500,
    colorHex: '#2a4d8f',
    cachedPhoto: true,
  },
  {
    id: 'veh-06',
    brandDivision: 'Division Beta',
    make: 'SEAT',
    model: 'Arona FR XL 1.0 EcoTSI',
    plate: '1147-LVD',
    year: 2023,
    fuel: 'Petrol',
    mileageKm: 23600,
    salePrice: 19750,
    defaultDiscount: 400,
    colorHex: '#156e57',
    cachedPhoto: false,
  },
];

export function buildVehicleSvgDataUrl(vehicle) {
  const accent = vehicle.colorHex || '#2e5ea8';
  const label = `${vehicle.make} ${vehicle.year}`.replace(/[<>&"]/g, '');
  const plate = (vehicle.plate || '').replace(/[<>&"]/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 340" width="640" height="340">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f1f5fb"/>
          <stop offset="100%" stop-color="#dfe8f6"/>
        </linearGradient>
      </defs>
      <rect width="640" height="340" rx="14" fill="url(#bg)"/>
      <rect x="24" y="22" width="170" height="30" rx="6" fill="${accent}" opacity="0.14"/>
      <text x="36" y="42" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${accent}">${label}</text>
      <g transform="translate(85, 95)">
        <path d="M55 120 L108 55 Q122 40 148 40 L315 40 Q346 40 368 58 L418 110 L452 122 Q468 128 468 148 L468 168 L22 168 L22 142 Q22 125 55 120 Z" fill="${accent}"/>
        <path d="M126 56 L305 56 Q330 56 348 72 L386 108 L92 108 Z" fill="#e7effb" opacity="0.92"/>
        <line x1="226" y1="56" x2="226" y2="108" stroke="${accent}" stroke-width="5"/>
        <circle cx="115" cy="168" r="36" fill="#182235"/>
        <circle cx="115" cy="168" r="18" fill="#cbd7eb"/>
        <circle cx="370" cy="168" r="36" fill="#182235"/>
        <circle cx="370" cy="168" r="18" fill="#cbd7eb"/>
      </g>
      <rect x="24" y="286" width="118" height="30" rx="5" fill="#ffffff" stroke="#b9c6db"/>
      <text x="83" y="306" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#1b263b">${plate}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
