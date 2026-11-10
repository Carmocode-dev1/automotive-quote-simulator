import { SAMPLE_INVENTORY, buildVehicleSvgDataUrl } from './catalog.js';
import { computeQuoteFinancials, formatEuro } from './finance.js';

const state = {
  selectedId: SAMPLE_INVENTORY[0].id,
  brandFilter: 'ALL',
  fuelFilter: 'ALL',
  search: '',
  calloutMode: 'auto',
  sheetTheme: 'alpha',
  salePrice: SAMPLE_INVENTORY[0].salePrice,
  discount: SAMPLE_INVENTORY[0].defaultDiscount,
  warranty: 390,
  downPayment: 3500,
  tin: 7.9,
  openingFee: 2.0,
};

const els = {
  search: document.getElementById('search-input'),
  brandFilter: document.getElementById('brand-filter'),
  fuelFilter: document.getElementById('fuel-filter'),
  calloutMode: document.getElementById('callout-mode'),
  vehicleList: document.getElementById('vehicle-list'),
  sheet: document.getElementById('quote-sheet'),
  themeButtons: document.querySelectorAll('[data-theme-btn]'),
  salePrice: document.getElementById('input-price'),
  discount: document.getElementById('input-discount'),
  warranty: document.getElementById('input-warranty'),
  downPayment: document.getElementById('input-downpayment'),
  tin: document.getElementById('input-tin'),
  fee: document.getElementById('input-fee'),
  printBtn: document.getElementById('print-btn'),
  quoteTitle: document.getElementById('quote-title'),
  quoteMeta: document.getElementById('quote-meta'),
  quoteRef: document.getElementById('quote-ref'),
  photoSlot: document.getElementById('photo-slot'),
  calloutBadge: document.getElementById('callout-badge'),
  summaryBody: document.getElementById('summary-body'),
  scheduleBody: document.getElementById('schedule-body'),
  guardAlert: document.getElementById('guard-alert'),
};

function getSelectedVehicle() {
  return SAMPLE_INVENTORY.find((v) => v.id === state.selectedId) || SAMPLE_INVENTORY[0];
}

function resolveCalloutState(vehicle) {
  if (state.calloutMode === 'missing') {
    return {
      status: 'HTTP 404 · Not Found',
      detail: 'External catalog returned no photo. Quote PDF continues without blocking.',
      badgeClass: 'badge warn',
      url: null,
    };
  }
  if (state.calloutMode === 'error') {
    return {
      status: 'HTTP 503 · Fallback Active',
      detail: 'Upstream catalog unavailable. Exception caught; document remains downloadable.',
      badgeClass: 'badge warn',
      url: null,
    };
  }
  if (state.calloutMode === 'api') {
    return {
      status: 'HTTP 200 · API Lookup + Cached',
      detail: 'Fetched by brand & plate via Named Credential and stored for reuse.',
      badgeClass: 'badge ok',
      url: buildVehicleSvgDataUrl(vehicle),
    };
  }
  if (vehicle.cachedPhoto) {
    return {
      status: 'Cache Hit · DisplayUrl',
      detail: 'Served directly from cached product image field without external callout.',
      badgeClass: 'badge ok',
      url: buildVehicleSvgDataUrl(vehicle),
    };
  }
  return {
    status: 'HTTP 200 · Catalog Callout',
    detail: 'Product image field was empty; fetched dynamically by brand and plate.',
    badgeClass: 'badge info',
    url: buildVehicleSvgDataUrl(vehicle),
  };
}

function renderCatalog() {
  const q = state.search.trim().toLowerCase();
  const filtered = SAMPLE_INVENTORY.filter((v) => {
    if (state.brandFilter !== 'ALL' && v.brandDivision !== state.brandFilter) return false;
    if (state.fuelFilter !== 'ALL' && v.fuel !== state.fuelFilter) return false;
    if (!q) return true;
    return `${v.make} ${v.model} ${v.plate}`.toLowerCase().includes(q);
  });

  els.vehicleList.innerHTML = '';
  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-msg';
    empty.textContent = 'No vehicles match the active filters.';
    els.vehicleList.appendChild(empty);
    return;
  }

  for (const v of filtered) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `veh-card${v.id === state.selectedId ? ' active' : ''}`;
    btn.innerHTML = `
      <div class="veh-top">
        <strong>${v.make} ${v.model}</strong>
        <span class="veh-price">${formatEuro(v.salePrice)}</span>
      </div>
      <div class="veh-sub">
        <span>${v.plate}</span>
        <span>${v.year} · ${v.fuel}</span>
        <span>${v.brandDivision}</span>
      </div>
    `;
    btn.addEventListener('click', () => {
      state.selectedId = v.id;
      state.salePrice = v.salePrice;
      state.discount = v.defaultDiscount;
      state.sheetTheme = v.brandDivision === 'Division Beta' ? 'beta' : 'alpha';
      syncInputs();
      render();
    });
    els.vehicleList.appendChild(btn);
  }
}

function renderQuoteSheet() {
  const vehicle = getSelectedVehicle();
  const callout = resolveCalloutState(vehicle);
  const finance = computeQuoteFinancials({
    salePrice: state.salePrice,
    discount: state.discount,
    warranty: state.warranty,
    downPayment: state.downPayment,
    annualTinPercent: state.tin,
    openingFeePercent: state.openingFee,
  });

  els.sheet.dataset.theme = state.sheetTheme;
  els.themeButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.themeBtn === state.sheetTheme);
  });

  const divisionLabel = state.sheetTheme === 'beta' ? 'Division Beta · Commercial Sheet' : 'Division Alpha · Commercial Sheet';
  els.quoteTitle.textContent = `${vehicle.make} ${vehicle.model}`;
  els.quoteMeta.textContent = `${divisionLabel} · Plate ${vehicle.plate} · ${vehicle.year} · ${vehicle.fuel} · ${vehicle.mileageKm.toLocaleString('es-ES')} km`;
  els.quoteRef.textContent = `QT-${vehicle.plate.replace('-', '')}`;

  els.calloutBadge.className = callout.badgeClass;
  els.calloutBadge.textContent = callout.status;

  els.photoSlot.innerHTML = '';
  if (callout.url) {
    const img = document.createElement('img');
    img.src = callout.url;
    img.alt = `${vehicle.make} ${vehicle.model}`;
    els.photoSlot.appendChild(img);
    const caption = document.createElement('p');
    caption.className = 'photo-caption';
    caption.textContent = callout.detail;
    els.photoSlot.appendChild(caption);
  } else {
    const box = document.createElement('div');
    box.className = 'photo-fallback';
    box.innerHTML = `<strong>No photo available</strong><span>${callout.detail}</span>`;
    els.photoSlot.appendChild(box);
  }

  const rawGap = Number(state.salePrice) - Number(state.discount) + Number(state.warranty) - Number(state.downPayment);
  els.guardAlert.hidden = rawGap >= 0;

  els.summaryBody.innerHTML = `
    <tr><th>Base Sale Price</th><td>${formatEuro(finance.salePrice)}</td></tr>
    <tr><th>Commercial Discount</th><td>- ${formatEuro(finance.discount)}</td></tr>
    <tr><th>Extended Warranty</th><td>+ ${formatEuro(finance.warranty)}</td></tr>
    <tr class="row-total"><th>Offer Total</th><td>${formatEuro(finance.offerTotal)}</td></tr>
    <tr><th>Customer Down Payment</th><td>- ${formatEuro(finance.downPayment)}</td></tr>
    <tr class="row-highlight"><th>Financed Capital (Guarded &ge; 0)</th><td>${formatEuro(finance.financedCapital)}</td></tr>
    <tr><th>Opening Fee (${finance.openingFeePercent.toFixed(2)}%)</th><td>${formatEuro(finance.openingFeeAmount)}</td></tr>
    <tr><th>Capital Including Fee</th><td>${formatEuro(finance.capitalWithFee)}</td></tr>
  `;

  els.scheduleBody.innerHTML = finance.schedule
    .map(
      (opt) => `
      <tr>
        <td>${opt.months} months</td>
        <td>${finance.annualTinPercent.toFixed(2)}%</td>
        <td><strong>${formatEuro(opt.monthlyPayment)} / mo</strong></td>
        <td>${formatEuro(opt.totalPayable)}</td>
      </tr>
    `
    )
    .join('');
}

function syncInputs() {
  els.salePrice.value = state.salePrice;
  els.discount.value = state.discount;
  els.warranty.value = state.warranty;
  els.downPayment.value = state.downPayment;
  els.tin.value = state.tin;
  els.fee.value = state.openingFee;
}

function render() {
  renderCatalog();
  renderQuoteSheet();
}

els.search.addEventListener('input', (e) => {
  state.search = e.target.value;
  renderCatalog();
});

els.brandFilter.addEventListener('change', (e) => {
  state.brandFilter = e.target.value;
  renderCatalog();
});

els.fuelFilter.addEventListener('change', (e) => {
  state.fuelFilter = e.target.value;
  renderCatalog();
});

els.calloutMode.addEventListener('change', (e) => {
  state.calloutMode = e.target.value;
  renderQuoteSheet();
});

els.themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.sheetTheme = btn.dataset.themeBtn;
    renderQuoteSheet();
  });
});

[
  [els.salePrice, 'salePrice'],
  [els.discount, 'discount'],
  [els.warranty, 'warranty'],
  [els.downPayment, 'downPayment'],
  [els.tin, 'tin'],
  [els.fee, 'openingFee'],
].forEach(([input, key]) => {
  input.addEventListener('input', (e) => {
    state[key] = e.target.value === '' ? 0 : Number(e.target.value);
    renderQuoteSheet();
  });
});

els.printBtn.addEventListener('click', () => window.print());

syncInputs();
render();
