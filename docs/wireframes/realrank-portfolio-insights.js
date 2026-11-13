const rrNs = 'http://www.w3.org/2000/svg';
const rrToast = document.querySelector('.rr-toast');
const rrHelpButton = document.querySelector('[data-rr-help-button]');
const rrHelpMenu = document.querySelector('[data-rr-help-menu]');
const rrContent = document.querySelector('[data-rr-insights-content]');
const rrEmpty = document.querySelector('[data-rr-insights-empty]');
const rrAccountDialog = document.querySelector('.rr-account-dialog');
const rrListingFilter = document.querySelector('[data-rr-listing-filter]');
const rrCustomRange = document.querySelector('[data-rr-custom-range]');
let rrActiveRange = '28';
let rrActiveMetric = 'views';
let rrCustomDays = 28;
let rrCustomPeriod = '';
let rrChartCoordinates = [];

const rrData = {
  7: { period: '4–10 November 2026 · Updated daily', range: 'Last 7 days', labels: ['4 Nov', '5 Nov', '6 Nov', '7 Nov', '8 Nov', '9 Nov', '10 Nov'], profile: [35, 39, 42, 46, 49, 53, 58], views: [12, 14, 16, 17, 19, 22, 28], contacts: [1, 1, 1, 2, 2, 2, 2] },
  28: { period: '14 October–10 November 2026 · Updated daily', range: 'Last 28 days', labels: ['14 Oct', '19 Oct', '25 Oct', '31 Oct', '5 Nov', '10 Nov'], profile: [160, 180, 195, 220, 238, 255], views: [51, 68, 61, 82, 104, 120], contacts: [2, 4, 5, 6, 7, 8] },
  90: { period: '13 August–10 November 2026 · Updated daily', range: 'Last 3 months', labels: ['13 Aug', '31 Aug', '18 Sep', '6 Oct', '24 Oct', '10 Nov'], profile: [430, 490, 545, 620, 735, 860], views: [168, 190, 218, 241, 286, 323], contacts: [8, 9, 11, 14, 18, 23] }
};
const rrListings = {
  all: { label: 'All listings', viewShare: 1, contactShare: 1 },
  aarambh: { label: 'Aarambh Heights', viewShare: 214 / 486, contactShare: 19 / 32 },
  'mp-nagar': { label: 'MP Nagar office collection', viewShare: 166 / 486, contactShare: 9 / 32 },
  'vijay-nagar': { label: 'Vijay Nagar residential selection', viewShare: 106 / 486, contactShare: 4 / 32 }
};
const rrMetricLabels = { profile: 'Profile views', views: 'Listing views', contacts: 'Contact clicks', rate: 'Contact rate' };

function rrShowToast(rrMessage) {
  rrToast.textContent = rrMessage;
  rrToast.hidden = false;
  window.clearTimeout(window.rrToastTimer);
  window.rrToastTimer = window.setTimeout(() => { rrToast.hidden = true; }, 2600);
}
function rrCloseHelp() { rrHelpMenu.hidden = true; rrHelpButton.setAttribute('aria-expanded', 'false'); }
function rrSum(rrValues) { return rrValues.reduce((rrTotal, rrValue) => rrTotal + rrValue, 0); }
function rrFormatNumber(rrValue) { return Math.round(rrValue).toLocaleString('en-IN'); }
function rrScale(rrValues, rrFactor) { return rrValues.map((rrValue) => Math.max(0, Math.round(rrValue * rrFactor))); }
function rrFormatDate(rrDate) { return rrDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
function rrFormatChartValue(rrValue) { return rrActiveMetric === 'rate' ? rrValue.toFixed(1) + '%' : rrFormatNumber(rrValue); }
function rrChartMaximum(rrValue) {
  const rrStep = rrActiveMetric === 'rate' ? (rrValue <= 10 ? 1 : 5) : rrValue <= 10 ? 2 : rrValue <= 50 ? 10 : rrValue <= 200 ? 20 : rrValue <= 500 ? 50 : 100;
  return Math.max(rrStep, Math.ceil(rrValue / rrStep) * rrStep);
}

function rrGetRangeData() {
  if (rrActiveRange !== 'custom') return rrData[rrActiveRange];
  const rrBaseKey = rrCustomDays <= 7 ? '7' : rrCustomDays <= 35 ? '28' : '90';
  const rrBase = rrData[rrBaseKey];
  const rrFactor = rrCustomDays / Number(rrBaseKey);
  return { ...rrBase, period: rrCustomPeriod + ' · Updated daily', range: rrCustomDays + (rrCustomDays === 1 ? ' day' : ' days'), profile: rrScale(rrBase.profile, rrFactor), views: rrScale(rrBase.views, rrFactor), contacts: rrScale(rrBase.contacts, rrFactor) };
}

function rrGetSeries() {
  const rrRange = rrGetRangeData();
  const rrListing = rrListings[rrListingFilter.value];
  const rrViews = rrScale(rrRange.views, rrListing.viewShare);
  const rrContacts = rrScale(rrRange.contacts, rrListing.contactShare);
  if (rrActiveMetric === 'profile') return rrRange.profile;
  if (rrActiveMetric === 'views') return rrViews;
  if (rrActiveMetric === 'contacts') return rrContacts;
  return rrViews.map((rrValue, rrIndex) => rrValue ? Number(((rrContacts[rrIndex] / rrValue) * 100).toFixed(1)) : 0);
}

function rrUpdateMetricValues() {
  const rrRange = rrGetRangeData();
  const rrListing = rrListings[rrListingFilter.value];
  const rrProfileTotal = rrSum(rrRange.profile);
  const rrViewTotal = Math.round(rrSum(rrRange.views) * rrListing.viewShare);
  const rrContactTotal = Math.round(rrSum(rrRange.contacts) * rrListing.contactShare);
  const rrRate = rrViewTotal ? ((rrContactTotal / rrViewTotal) * 100).toFixed(1) + '%' : '—';
  document.querySelector('[data-rr-metric-value="profile"]').textContent = rrListingFilter.value === 'all' ? rrFormatNumber(rrProfileTotal) : '—';
  document.querySelector('[data-rr-metric-value="views"]').textContent = rrFormatNumber(rrViewTotal);
  document.querySelector('[data-rr-metric-value="contacts"]').textContent = rrFormatNumber(rrContactTotal);
  document.querySelector('[data-rr-metric-value="rate"]').textContent = rrRate;
  const rrProfileButton = document.querySelector('[data-rr-metric-button="profile"]');
  rrProfileButton.disabled = rrListingFilter.value !== 'all';
  if (rrProfileButton.disabled && rrActiveMetric === 'profile') rrActiveMetric = 'views';
}

function rrHideChartPoint() {
  document.querySelector('[data-rr-chart-crosshair]').hidden = true;
  document.querySelector('[data-rr-chart-tooltip]').hidden = true;
  document.querySelectorAll('.rr-chart-point-active').forEach((rrPoint) => rrPoint.classList.remove('rr-chart-point-active'));
}

function rrShowChartPoint(rrIndex) {
  const rrPoint = rrChartCoordinates[rrIndex];
  if (!rrPoint) return;
  const rrChart = document.querySelector('[data-rr-chart]');
  const rrWrap = rrChart.closest('.rr-insights-chart-wrap');
  const rrTooltip = document.querySelector('[data-rr-chart-tooltip]');
  const rrCrosshair = document.querySelector('[data-rr-chart-crosshair]');
  const rrChartRect = rrChart.getBoundingClientRect();
  const rrWrapRect = rrWrap.getBoundingClientRect();
  const rrPrevious = rrChartCoordinates[rrIndex - 1];
  const rrDelta = rrPrevious ? Number((rrPoint.value - rrPrevious.value).toFixed(1)) : null;
  const rrDeltaUnit = rrActiveMetric === 'rate' ? ' pp' : '';
  document.querySelectorAll('.rr-chart-point').forEach((rrCircle, rrCircleIndex) => rrCircle.classList.toggle('rr-chart-point-active', rrCircleIndex === rrIndex));
  rrCrosshair.setAttribute('x1', rrPoint.x);
  rrCrosshair.setAttribute('x2', rrPoint.x);
  rrCrosshair.hidden = false;
  rrTooltip.querySelector('[data-rr-tooltip-date]').textContent = rrPoint.label;
  rrTooltip.querySelector('[data-rr-tooltip-value]').textContent = rrFormatChartValue(rrPoint.value) + ' ' + rrMetricLabels[rrActiveMetric].toLowerCase();
  rrTooltip.querySelector('[data-rr-tooltip-change]').textContent = rrDelta === null ? 'Start of range' : rrDelta === 0 ? 'No change' : (rrDelta > 0 ? '+' : '−') + Math.abs(rrDelta).toFixed(rrActiveMetric === 'rate' ? 1 : 0) + rrDeltaUnit + ' from previous';
  rrTooltip.hidden = false;
  const rrLeft = rrChartRect.left - rrWrapRect.left + (rrPoint.x / 640) * rrChartRect.width;
  const rrTop = rrChartRect.top - rrWrapRect.top + (rrPoint.y / 220) * rrChartRect.height;
  rrTooltip.style.left = Math.min(Math.max(rrLeft, 72), rrWrapRect.width - 72) + 'px';
  rrTooltip.style.top = Math.max(8, rrTop - 70) + 'px';
}

function rrRenderChart() {
  rrUpdateMetricValues();
  const rrRange = rrGetRangeData();
  const rrValues = rrGetSeries();
  const rrMax = rrChartMaximum(Math.max(...rrValues, 1));
  const rrChart = document.querySelector('[data-rr-chart]');
  const rrLine = document.querySelector('[data-rr-chart-line]');
  const rrArea = document.querySelector('[data-rr-chart-area]');
  const rrPoints = document.querySelector('[data-rr-chart-points]');
  const rrLabels = document.querySelector('[data-rr-chart-labels]');
  const rrYLabels = document.querySelector('[data-rr-chart-y-labels]');
  rrChartCoordinates = rrValues.map((rrValue, rrIndex) => ({ x: 42 + (rrIndex * 574 / Math.max(rrValues.length - 1, 1)), y: 178 - (rrValue / rrMax * 146), value: rrValue, label: rrRange.labels[rrIndex] }));
  const rrLinePath = rrChartCoordinates.map((rrPoint, rrIndex) => (rrIndex ? 'L' : 'M') + rrPoint.x.toFixed(1) + ' ' + rrPoint.y.toFixed(1)).join(' ');
  rrLine.setAttribute('d', rrLinePath);
  rrArea.setAttribute('d', rrLinePath + ' L ' + rrChartCoordinates.at(-1).x.toFixed(1) + ' 178 L ' + rrChartCoordinates[0].x.toFixed(1) + ' 178 Z');
  rrPoints.replaceChildren();
  rrLabels.replaceChildren();
  rrYLabels.replaceChildren();
  [rrMax, rrMax * 2 / 3, rrMax / 3, 0].forEach((rrValue, rrIndex) => {
    const rrText = document.createElementNS(rrNs, 'text');
    rrText.setAttribute('x', '34');
    rrText.setAttribute('y', String([35, 84, 132, 181][rrIndex]));
    rrText.setAttribute('text-anchor', 'end');
    rrText.textContent = rrActiveMetric === 'rate' ? rrValue.toFixed(rrValue % 1 ? 1 : 0) + '%' : rrFormatNumber(rrValue);
    rrYLabels.appendChild(rrText);
  });
  rrChartCoordinates.forEach((rrPoint, rrIndex) => {
    const rrCircle = document.createElementNS(rrNs, 'circle');
    rrCircle.setAttribute('class', 'rr-chart-point');
    rrCircle.setAttribute('cx', rrPoint.x);
    rrCircle.setAttribute('cy', rrPoint.y);
    rrCircle.setAttribute('r', '4.5');
    rrCircle.setAttribute('tabindex', '0');
    rrCircle.setAttribute('aria-label', rrPoint.label + ': ' + rrFormatChartValue(rrPoint.value) + ' ' + rrMetricLabels[rrActiveMetric].toLowerCase());
    ['pointerenter', 'focus', 'click'].forEach((rrEventName) => rrCircle.addEventListener(rrEventName, () => rrShowChartPoint(rrIndex)));
    rrCircle.addEventListener('blur', rrHideChartPoint);
    rrPoints.appendChild(rrCircle);
    if (rrIndex === 0 || rrIndex === Math.floor(rrChartCoordinates.length / 2) || rrIndex === rrChartCoordinates.length - 1) {
      const rrText = document.createElementNS(rrNs, 'text');
      rrText.setAttribute('x', rrPoint.x);
      rrText.setAttribute('y', '208');
      rrText.setAttribute('text-anchor', rrIndex === 0 ? 'start' : rrIndex === rrChartCoordinates.length - 1 ? 'end' : 'middle');
      rrText.textContent = rrPoint.label;
      rrLabels.appendChild(rrText);
    }
  });
  rrChart.onpointermove = (rrEvent) => {
    const rrRect = rrChart.getBoundingClientRect();
    const rrSvgX = (rrEvent.clientX - rrRect.left) / rrRect.width * 640;
    if (rrSvgX < 42 || rrSvgX > 616) { rrHideChartPoint(); return; }
    const rrNearestIndex = rrChartCoordinates.reduce((rrBestIndex, rrPoint, rrIndex) => Math.abs(rrPoint.x - rrSvgX) < Math.abs(rrChartCoordinates[rrBestIndex].x - rrSvgX) ? rrIndex : rrBestIndex, 0);
    rrShowChartPoint(rrNearestIndex);
  };
  rrChart.onpointerleave = () => { if (!document.activeElement?.classList.contains('rr-chart-point')) rrHideChartPoint(); };
  rrHideChartPoint();
  document.querySelector('[data-rr-chart-title]').textContent = rrMetricLabels[rrActiveMetric];
  document.querySelector('[data-rr-chart-description]').textContent = rrListingFilter.value === 'all' ? 'Across all public listings.' : rrListings[rrListingFilter.value].label;
  document.querySelector('[data-rr-chart-range]').textContent = rrRange.range;
  document.querySelector('[data-rr-insights-period]').textContent = rrRange.period;
  rrChart.setAttribute('aria-label', rrMetricLabels[rrActiveMetric] + ' for ' + rrRange.range.toLowerCase());
  document.querySelectorAll('[data-rr-metric-button]').forEach((rrButton) => rrButton.setAttribute('aria-pressed', String(rrButton.dataset.rrMetricButton === rrActiveMetric)));
}

function rrUpdateListingRows() {
  const rrRange = rrGetRangeData();
  const rrRangeViewTotal = rrSum(rrRange.views);
  const rrRangeContactTotal = rrSum(rrRange.contacts);
  document.querySelectorAll('[data-rr-listing-row]').forEach((rrRow) => {
    const rrListing = rrListings[rrRow.dataset.rrListingRow];
    const rrViews = Math.round(rrRangeViewTotal * rrListing.viewShare);
    const rrContacts = Math.round(rrRangeContactTotal * rrListing.contactShare);
    rrRow.querySelector('[data-rr-row-views]').textContent = rrFormatNumber(rrViews);
    rrRow.querySelector('[data-rr-row-contacts]').textContent = rrFormatNumber(rrContacts);
    rrRow.querySelector('[data-rr-row-rate]').textContent = rrViews ? ((rrContacts / rrViews) * 100).toFixed(1) + '%' : '—';
    rrRow.setAttribute('aria-pressed', String(rrListingFilter.value === rrRow.dataset.rrListingRow));
  });
}
function rrRefreshInsights() { rrUpdateListingRows(); rrRenderChart(); }

rrHelpButton.addEventListener('click', () => {
  const rrWillOpen = rrHelpMenu.hidden;
  rrHelpMenu.hidden = !rrWillOpen;
  rrHelpButton.setAttribute('aria-expanded', String(rrWillOpen));
  if (rrWillOpen) rrHelpMenu.querySelector('[role="menuitem"]').focus();
});
document.addEventListener('click', (rrEvent) => { if (!rrEvent.target.closest('.rr-help-menu-wrap')) rrCloseHelp(); });
document.addEventListener('keydown', (rrEvent) => { if (rrEvent.key === 'Escape') rrCloseHelp(); });
document.querySelector('[data-rr-ranking-policy]').addEventListener('click', () => { rrCloseHelp(); rrShowToast('Ranking Policy would open here.'); });
document.querySelectorAll('[data-rr-range]').forEach((rrButton) => rrButton.addEventListener('click', () => {
  document.querySelectorAll('[data-rr-range]').forEach((rrItem) => rrItem.setAttribute('aria-pressed', String(rrItem === rrButton)));
  rrActiveRange = rrButton.dataset.rrRange;
  rrCustomRange.hidden = rrActiveRange !== 'custom';
  if (rrActiveRange !== 'custom') rrRefreshInsights();
}));
rrCustomRange.addEventListener('submit', (rrEvent) => {
  rrEvent.preventDefault();
  if (!rrCustomRange.reportValidity()) return;
  const rrFrom = new Date(document.querySelector('#rr-insights-from').value + 'T00:00:00+05:30');
  const rrTo = new Date(document.querySelector('#rr-insights-to').value + 'T00:00:00+05:30');
  if (rrFrom > rrTo) { rrShowToast('Choose an end date after the start date.'); return; }
  rrCustomDays = Math.floor((rrTo - rrFrom) / 86400000) + 1;
  if (rrCustomDays > 90) { rrShowToast('Choose a range of 90 days or less.'); return; }
  rrCustomPeriod = rrFormatDate(rrFrom) + '–' + rrFormatDate(rrTo);
  rrRefreshInsights();
});
document.querySelectorAll('[data-rr-metric-button]').forEach((rrButton) => rrButton.addEventListener('click', () => { if (!rrButton.disabled) { rrActiveMetric = rrButton.dataset.rrMetricButton; rrRenderChart(); } }));
rrListingFilter.addEventListener('change', rrRefreshInsights);
document.querySelectorAll('[data-rr-listing-row]').forEach((rrRow) => rrRow.addEventListener('click', () => {
  rrListingFilter.value = rrRow.dataset.rrListingRow;
  rrRefreshInsights();
  rrContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
document.querySelector('[data-rr-account-menu]').addEventListener('click', () => rrAccountDialog.showModal());
document.querySelector('[data-rr-close-account]').addEventListener('click', () => rrAccountDialog.close());
if (new URLSearchParams(window.location.search).get('state') === 'empty') { rrContent.hidden = true; rrEmpty.hidden = false; }
rrRefreshInsights();
