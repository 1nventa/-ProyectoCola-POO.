# Lactario de desnutrición, fórmulas infantiles y APME

Aplicación de estudio para Nutrición Clínica Pediátrica. Calcula la preparación de F-75, F-100 y FTLC según la guía de la asignatura y la Resolución 0115 de 2026, ordena a los pacientes en una cola y consulta APMEs de los vademécums de Boydorr, Fresenius, Nutricia y Abbott.

La cola está escrita en Java. La pantalla de trabajo está en `web/`.

## Caso de la guía

Lactante de 6 meses y 7,0 kg, estabilización sin edema, día 1:

- 7 ml/kg por toma × 7 kg = 49 ml por toma
- 8 tomas = 392 ml al día
- 75 kcal/100 ml = 42 kcal/kg/día
- 2 cucharadas de 4,6 g por cada 55 ml = 65,6 g de polvo al día
- 50 ml de agua por cada 55 ml preparados = 356,4 ml de agua al día

El lactario divide agua y polvo entre las 8 tomas. No se prepara el volumen de 24 horas de una vez.

## Java

```bash
javac -d out $(find src/main/java -name '*.java')
java -cp out lactario.Main
```

## Pantalla

```bash
cd web && python3 -m http.server 8765
```

Abrir `http://localhost:8765`.

## Pruebas del cálculo

```bash
node --test web/calculos.test.js
```

Los registros, porciones e indicaciones del vademécum salen de los PDF de Abbott, Boydorr, Fresenius y Nutricia compartidos para la actividad. La reconstitución de cada APME es la de su ficha, no la constante de la F-75.
