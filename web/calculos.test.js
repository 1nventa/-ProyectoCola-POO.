import assert from "node:assert/strict";
import test from "node:test";
import {
  clasificarPuntajeZ,
  mlPorKgToma,
  prepararF75,
  prepararFtlc,
} from "./calculos.js";

test("caso de la guía: 7 kg, día 1, sin edema", () => {
  const orden = prepararF75(7, mlPorKgToma("severa_sin_edema", 1));
  assert.equal(orden.mlToma, 49);
  assert.equal(orden.mlDia, 392);
  assert.equal(orden.kcalPorKgDia, 42);
  assert.ok(Math.abs(orden.gramosDia - 65.570909) < 0.001);
  assert.ok(Math.abs(orden.aguaMlDia - 356.363636) < 0.001);
  assert.ok(Math.abs(orden.gramosToma - 8.1963636) < 0.001);
});

test("tablas 15 y 16 y FTLC", () => {
  assert.equal(mlPorKgToma("severa_con_edema", 1), 4);
  assert.equal(mlPorKgToma("moderada", 5), 22);
  const riesgo = prepararFtlc({ pesoKg: 9, kcalDia: 255 });
  assert.ok(Math.abs(riesgo.sobresDia - 0.51) < 0.001);
  const seguimiento = prepararFtlc({ pesoKg: 10, kcalDia: 1000 });
  assert.equal(seguimiento.sobresDia, 2);
});

test("clasificación del puntaje Z", () => {
  assert.equal(clasificarPuntajeZ(-3.2).codigo, "severa");
  assert.equal(clasificarPuntajeZ(-2.5).codigo, "moderada");
  assert.equal(clasificarPuntajeZ(-1.4).codigo, "riesgo");
  assert.equal(clasificarPuntajeZ(-1).codigo, "adecuado");
  assert.equal(clasificarPuntajeZ(-2).codigo, "limite");
});
