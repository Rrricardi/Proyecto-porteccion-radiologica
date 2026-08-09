// ---------- Datos constantes (misma física del original) ----------
const U = 1;
const P = 0.02;

const blindaje_primario = {
  'camilla': { alfa: 0.03994, beta: 0.1448, gamma: 0.4231, Kp1: 5.2 },
  'bucky de pared': { alfa: 0.03552, beta: 0.1177, gamma: 0.6007, Kp1: 2.3 }
};

const blindaje_secundario = {
  'camilla': { alfa: 0.0392, beta: 0.1464, gamma: 0.4486 },
  'bucky de pared': { alfa: 0.0356, beta: 0.1079, gamma: 0.7705 }
};

const K_p_secundario = { directo: 0.049, indirecto: 0.034 };

const T_BY_AREA_RANGE = [
  { min: 1, max: 6, T: 1 },
  { min: 7, max: 9, T: 0.2 },
  { min: 10, max: 12, T: 0.125 },
  { min: 13, max: 16, T: 0.025 }
];

function getT(areaId) {
  const range = T_BY_AREA_RANGE.find(r => areaId >= r.min && areaId <= r.max);
  return range ? range.T : null;
}

// ---------- DOM refs ----------
const form = document.getElementById('calcForm');
const barreraRadios = form.elements['barrera'];
const contactoGroup = document.getElementById('contactoGroup');
const barreraHint = document.getElementById('barreraHint');
const formError = document.getElementById('formError');
const resetBtn = document.getElementById('resetBtn');

const resultsWrap = document.getElementById('resultsWrap');
const placeholder = document.getElementById('placeholder');
const resultX = document.getElementById('resultX');
const outT = document.getElementById('outT');
const outKp = document.getElementById('outKp');
const outBp = document.getElementById('outBp');

const barrierRect = document.getElementById('barrier');
const barrierLabel = document.getElementById('barrierLabel');
const beamPath = document.getElementById('beamPath');
const dimLabel = document.getElementById('dimLabel');
const peopleGroup = document.getElementById('people');

// ---------- Interactividad: mostrar/ocultar campo "contacto" ----------
function updateBarreraUI() {
  const val = [...barreraRadios].find(r => r.checked).value;
  const isSecundaria = val === 'secundaria';
  contactoGroup.hidden = !isSecundaria;
  barreraHint.textContent = isSecundaria
    ? 'La radiación llega dispersada o por fuga, no en línea directa con el haz.'
    : 'El haz útil incide directamente sobre la barrera.';
  beamPath.setAttribute('stroke-dasharray', isSecundaria ? '3 5' : '6 4');
  beamPath.setAttribute('opacity', isSecundaria ? '0.55' : '1');
}
[...barreraRadios].forEach(r => r.addEventListener('change', updateBarreraUI));
updateBarreraUI();

// ---------- Validación + cálculo ----------
function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}
function clearError() {
  formError.hidden = true;
  formError.textContent = '';
}

function drawPeople(n) {
  peopleGroup.innerHTML = '';
  const max = 6;
  const shown = Math.min(n, max);
  const startX = 300;
  const spacing = 34;
  for (let i = 0; i < shown; i++) {
    const cx = startX + i * spacing;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `
      <circle cx="${cx}" cy="180" r="6" fill="var(--good)"/>
      <rect x="${cx - 7}" y="188" width="14" height="20" rx="4" fill="var(--good)" opacity="0.85"/>
    `;
    peopleGroup.appendChild(g);
  }
  if (n > max) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', startX + max * spacing + 6);
    text.setAttribute('y', 200);
    text.setAttribute('class', 'svg-label mono');
    text.textContent = `+${n - max}`;
    peopleGroup.appendChild(text);
  }
}

function updateDiagram({ dp, X, n }) {
  // Distancia -> separación visual entre fuente y barrera (clamp para legibilidad)
  const barrierX = Math.min(320, Math.max(140, 74 + dp * 30));
  beamPath.setAttribute('x2', barrierX);
  document.getElementById('dimLine').setAttribute('x2', barrierX);
  dimLabel.setAttribute('x', (74 + barrierX) / 2);
  dimLabel.textContent = `${dp.toFixed(2)} m`;

  // Espesor -> ancho visual de la barrera (clamp, ilustrativo)
  const width = Math.min(60, Math.max(6, X * 0.6));
  barrierRect.setAttribute('x', barrierX);
  barrierRect.setAttribute('width', width);
  barrierLabel.setAttribute('x', barrierX + width / 2);
  barrierLabel.textContent = `${X.toFixed(1)} mm`;

  drawPeople(n);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();

  const barrera = [...barreraRadios].find(r => r.checked).value;
  const procedimiento = form.elements['procedimiento'].value;
  const dp = parseFloat(form.elements['distancia'].value);
  const areaId = parseInt(form.elements['area'].value, 10);
  const N = parseInt(form.elements['personas'].value, 10);

  if (!procedimiento) return showError('Seleccioná un procedimiento.');
  if (!dp || dp <= 0) return showError('Ingresá una distancia válida, mayor a 0.');
  if (!areaId) return showError('Seleccioná el área protegida.');
  if (!N || N < 1) return showError('Ingresá al menos 1 persona en el área.');

  const T = getT(areaId);
  if (T === null) return showError('El área seleccionada no es válida.');

  let a, b, c, Kp;

  if (barrera === 'primaria') {
    const datos = blindaje_primario[procedimiento];
    a = datos.alfa; b = datos.beta; c = datos.gamma;
    Kp = (datos.Kp1 * U * N) / (dp ** 2);
  } else {
    const contacto = form.elements['contacto'].value;
    const datos = blindaje_secundario[procedimiento];
    a = datos.alfa; b = datos.beta; c = datos.gamma;
    Kp = (K_p_secundario[contacto] * U * N) / (dp ** 2);
  }

  const Bp = P / (T * Kp);

  let X;
  if (Bp >= 1) {
    // La transmisión requerida es mayor a 1: no se necesita blindaje adicional
    X = 0;
  } else {
    X = (1 / (a * c)) * Math.log(((1 / Bp) ** c + (b / a)) / (1 + b / a));
    if (!isFinite(X) || isNaN(X)) {
      return showError('No fue posible calcular con estos valores. Revisá los datos ingresados.');
    }
    if (X < 0) X = 0;
  }

  // ---------- Mostrar resultados ----------
  placeholder.hidden = true;
  resultsWrap.hidden = false;
  resultX.textContent = X.toFixed(2);
  outT.textContent = T;
  outKp.textContent = Kp.toFixed(5);
  outBp.textContent = Bp < 1000 ? Bp.toExponential(3) : Bp.toFixed(2);

  updateDiagram({ dp, X, n: N });
});

resetBtn.addEventListener('click', () => {
  clearError();
  resultsWrap.hidden = true;
  placeholder.hidden = false;
  setTimeout(updateBarreraUI, 0);
});
