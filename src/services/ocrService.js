const { createWorker } = require('tesseract.js');

const WORKER_TIMEOUT = 45_000;
const OCR_TIMEOUT = 20_000;

let workerPromise = null;

function conTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

async function obtenerWorker() {
  if (!workerPromise) {
    workerPromise = conTimeout(createWorker('spa'), WORKER_TIMEOUT, 'Worker creation')
      .catch(err => {
        workerPromise = null;
        throw err;
      });
  }
  return workerPromise;
}

const KEYWORD_PATTERNS = [
  /REP[BÚU]BLICA\s+BOLIVARIANA\s+DE\s+VENEZUELA/i,
  /C[CÉE]DULA\s+DE\s+IDENTIDAD/i,
];

const ID_PATTERN = /[VE]\s*-?\s*\d{6,8}/i;

// Extrae el número de cédula del texto OCR (ej. "V-12345678")
function extraerCedula(text) {
  const match = text.match(ID_PATTERN);
  if (!match) return null;
  const raw = match[0].replace(/\s+/g, '').toUpperCase();
  return raw;
}

// Intenta extraer nombres y apellidos del texto OCR.
// Patrones comunes en cédulas venezolanas:
//   "APELLIDOS: PÉREZ\nNOMBRES: JUAN"
//   "PÉREZ, JUAN" (cerca del nro de cédula)
//   "PÉREZ JUAN"
function extraerNombres(text) {
  let apellidos = null;
  let nombres = null;

  // Patrón 1: "APELLIDOS: XXXX\nNOMBRES: XXXX"
  const patronApellidos = /APELLIDOS?\s*:?\s*([A-ZÁÉÍÓÚÑ\s]+?)(?:\n|\r)/i;
  const patronNombres = /NOMBRES?\s*:?\s*([A-ZÁÉÍÓÚÑ\s]+?)(?:\n|\r|$)/i;
  const matchAp = text.match(patronApellidos);
  const matchNom = text.match(patronNombres);
  if (matchAp && matchNom) {
    apellidos = matchAp[1].trim();
    nombres = matchNom[1].trim();
    return { apellidos, nombres };
  }

  // Patrón 2: "APELLIDO, NOMBRE" cerca de línea con cédula
  const lineas = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const linea of lineas) {
    const matchComa = linea.match(/^([A-ZÁÉÍÓÚÑ\s]+),\s*([A-ZÁÉÍÓÚÑ\s]+)$/i);
    if (matchComa) {
      apellidos = matchComa[1].trim();
      nombres = matchComa[2].trim();
      return { apellidos, nombres };
    }
  }

  // Patrón 3: última línea con dos palabras capitalizadas (apellido + nombre simple)
  if (lineas.length >= 2) {
    const ultimaLinea = lineas[lineas.length - 1];
    const palabras = ultimaLinea.split(/\s+/).filter(Boolean);
    if (palabras.length >= 2 && !/^\d/.test(ultimaLinea)) {
      apellidos = palabras.slice(0, -1).join(' ');
      nombres = palabras[palabras.length - 1];
      return { apellidos, nombres };
    }
  }

  return { apellidos, nombres };
}

function normalizarTexto(t) {
  return t ? t.replace(/[^A-ZÁÉÍÓÚÑ\s]/gi, '').trim().toUpperCase() : '';
}

async function validarCedula(buffer) {
  let w;
  try {
    w = await obtenerWorker();
  } catch (err) {
    throw Object.assign(new Error('El servicio OCR no está disponible en este momento. Intente más tarde.'), {
      status: 503,
      ocrError: err.message,
      ocrFallo: true,
    });
  }

  let resultado;
  try {
    resultado = await conTimeout(w.recognize(buffer), OCR_TIMEOUT, 'OCR recognition');
  } catch (err) {
    throw Object.assign(new Error('No se pudo analizar la imagen. Asegúrese de que sea una imagen clara de una Cédula de Identidad.'), {
      status: 422,
      ocrError: err.message,
      ocrFallo: true,
    });
  }

  const text = resultado.data.text;
  const tienePalabrasClave = KEYWORD_PATTERNS.some(p => p.test(text));
  const tieneNumeroIdentidad = ID_PATTERN.test(text);

  const valido = tienePalabrasClave && tieneNumeroIdentidad;

  const resultadoExtraccion = {
    valido,
    textoExtraido: text.trim(),
    coincidencias: {
      palabrasClave: tienePalabrasClave,
      numeroIdentidad: tieneNumeroIdentidad,
    },
    cedulaExtraida: valido ? extraerCedula(text) : null,
    nombresExtraidos: valido ? extraerNombres(text) : null,
  };

  return resultadoExtraccion;
}

async function cerrarWorker() {
  if (workerPromise) {
    try {
      const w = await workerPromise;
      await w.terminate();
    } catch (_) {}
    workerPromise = null;
  }
}

module.exports = { validarCedula, cerrarWorker };
