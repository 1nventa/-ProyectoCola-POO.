export const TOMAS_CADA_3_HORAS = 8;
export const KCAL_POR_ML_F75 = 0.75;
export const KCAL_POR_ML_F100 = 1;
export const ML_PREPARADOS_POR_BLOQUE = 55;
export const ML_AGUA_POR_BLOQUE = 50;
export const CUCHARADAS_POR_BLOQUE = 2;
export const GRAMOS_POR_CUCHARADA_F75 = 4.6;
export const KCAL_POR_SOBRE_FTLC = 500;

export const ESQUEMAS_F75 = {
  severa_sin_edema: {
    id: "severa_sin_edema",
    titulo: "Tabla 16. Desnutrición aguda severa sin edema",
    alcance: "Menores de 6 meses. La guía docente usa el día 1 de este esquema (7 ml/kg/toma) en el ejemplo de 6 meses y 7 kg.",
    mlPorKgToma: [7, 10, 13, 16, 19],
  },
  severa_con_edema: {
    id: "severa_con_edema",
    titulo: "Tabla 16. Desnutrición aguda severa con edema",
    alcance: "Menores de 6 meses. El día 1 baja a 4 ml/kg/toma.",
    mlPorKgToma: [4, 7, 10, 13, 16],
  },
  moderada: {
    id: "moderada",
    titulo: "Tabla 15. Desnutrición aguda moderada",
    alcance: "Menores de 6 meses. Ocho tomas, cada 3 horas.",
    mlPorKgToma: [10, 13, 16, 19, 22],
  },
};

export function mlPorKgToma(esquemaId, dia) {
  const esquema = ESQUEMAS_F75[esquemaId];
  if (!esquema) {
    throw new Error("Esquema de F-75 no reconocido.");
  }
  if (dia < 1 || dia > esquema.mlPorKgToma.length) {
    throw new Error("La estabilización de estas tablas cubre los días 1 a 5.");
  }
  return esquema.mlPorKgToma[dia - 1];
}

export function prepararVolumen({ formula, pesoKg, mlPorKgToma, kcalPorMl, reconstitucionF75 }) {
  if (!(pesoKg > 0)) {
    throw new Error("El peso debe ser mayor que cero.");
  }
  if (!(mlPorKgToma > 0)) {
    throw new Error("El volumen por toma debe ser mayor que cero.");
  }
  const mlToma = mlPorKgToma * pesoKg;
  const mlDia = mlToma * TOMAS_CADA_3_HORAS;
  const kcalToma = mlToma * kcalPorMl;
  const kcalDia = mlDia * kcalPorMl;
  const kcalPorKgDia = mlPorKgToma * TOMAS_CADA_3_HORAS * kcalPorMl;
  const orden = {
    formula,
    pesoKg,
    tomasDia: TOMAS_CADA_3_HORAS,
    mlPorKgToma,
    mlToma,
    mlDia,
    kcalToma,
    kcalDia,
    kcalPorKgDia,
  };
  if (reconstitucionF75) {
    const bloques = mlDia / ML_PREPARADOS_POR_BLOQUE;
    orden.aguaMlDia = bloques * ML_AGUA_POR_BLOQUE;
    orden.cucharadasDia = bloques * CUCHARADAS_POR_BLOQUE;
    orden.gramosDia = orden.cucharadasDia * GRAMOS_POR_CUCHARADA_F75;
    orden.aguaMlToma = orden.aguaMlDia / TOMAS_CADA_3_HORAS;
    orden.cucharadasToma = orden.cucharadasDia / TOMAS_CADA_3_HORAS;
    orden.gramosToma = orden.gramosDia / TOMAS_CADA_3_HORAS;
  }
  return orden;
}

export function prepararF75(pesoKg, mlPorToma) {
  return prepararVolumen({
    formula: "F-75",
    pesoKg,
    mlPorKgToma: mlPorToma,
    kcalPorMl: KCAL_POR_ML_F75,
    reconstitucionF75: true,
  });
}

export function prepararF100(pesoKg, mlPorToma) {
  return prepararVolumen({
    formula: "F-100",
    pesoKg,
    mlPorKgToma: mlPorToma,
    kcalPorMl: KCAL_POR_ML_F100,
    reconstitucionF75: false,
  });
}

export function prepararFtlc({ pesoKg, kcalDia }) {
  if (!(pesoKg > 0)) {
    throw new Error("El peso debe ser mayor que cero.");
  }
  if (!(kcalDia > 0)) {
    throw new Error("Las kilocalorías del día deben ser mayores que cero.");
  }
  return {
    formula: "FTLC",
    pesoKg,
    kcalDia,
    kcalPorKgDia: kcalDia / pesoKg,
    sobresDia: kcalDia / KCAL_POR_SOBRE_FTLC,
    kcalPorSobre: KCAL_POR_SOBRE_FTLC,
  };
}

export function clasificarPuntajeZ(z) {
  if (!Number.isFinite(z)) {
    throw new Error("El puntaje Z no es un número.");
  }
  if (z < -3) {
    return { codigo: "severa", etiqueta: "Desnutrición aguda severa" };
  }
  if (z >= -3 && z < -2) {
    return { codigo: "moderada", etiqueta: "Desnutrición aguda moderada" };
  }
  if (z > -2 && z < -1) {
    return { codigo: "riesgo", etiqueta: "Riesgo de desnutrición aguda" };
  }
  if (z >= -1) {
    return { codigo: "adecuado", etiqueta: "Peso adecuado para la talla o longitud" };
  }
  return {
    codigo: "limite",
    etiqueta: "Límite exacto en −2 DE",
  };
}

export function gananciaEsperada(edadMeses) {
  if (edadMeses < 3) {
    return { minimo: 25, objetivo: 30, texto: "Menor de 3 meses: 25 a 30 g/día." };
  }
  if (edadMeses < 6) {
    return { minimo: 12, objetivo: 16, texto: "De 3 a 6 meses: 12 a 16 g/día." };
  }
  return { minimo: 10, objetivo: 10, texto: "Mayor de 6 meses en recuperación: más de 10 g/día." };
}

const ALERGENOS = [
  { clave: "leche", textos: ["leche", "lacteo", "lácteo", "caseina", "caseína", "suero"] },
  { clave: "lactosa", textos: ["lactosa"] },
  { clave: "soya", textos: ["soya", "soja"] },
  { clave: "coco", textos: ["coco"] },
  { clave: "mani", textos: ["mani", "maní", "cacahuate"] },
];

export function alertasAlergia(texto) {
  const normalizado = (texto || "").toLowerCase();
  if (!normalizado.trim()) {
    return [];
  }
  const hallados = ALERGENOS.filter((item) => item.textos.some((clave) => normalizado.includes(clave))).map(
    (item) => item.clave
  );
  const avisos = [];
  if (hallados.some((clave) => ["leche", "lactosa", "soya", "coco"].includes(clave))) {
    avisos.push(
      "F-75 y F-100 llevan leche descremada y aceites de palma, soya y coco. F-100 además lleva lactosa y proteína de suero. Confirme contraindicación antes de preparar."
    );
  }
  if (hallados.includes("mani")) {
    avisos.push(
      "Varias FTLC tipo alimento terapéutico listo para el consumo contienen maní. Revise la ficha del sobre antes de la prueba de apetito."
    );
  }
  if (avisos.length === 0) {
    avisos.push("Hay alergias registradas. Compare cada ingrediente de la fórmula con la historia antes de iniciar.");
  }
  return avisos;
}
