package lactario.servicio;

import lactario.modelo.EsquemaF75;
import lactario.modelo.PreparacionFormula;

/**
 * Cálculos de la guía de Nutrición Clínica Pediátrica y de la Resolución 0115 de 2026.
 * F-75 aporta 75 kcal/100 ml. Por cada 55 ml preparados se usan 50 ml de agua y 2 cucharadas;
 * cada cucharada de F-75 pesa 4,6 g. La FTLC aporta 500 kcal por sobre.
 */
public final class CalculadoraLactario {
    public static final int TOMAS_CADA_3_HORAS = 8;
    public static final double KCAL_POR_ML_F75 = 0.75;
    public static final double KCAL_POR_ML_F100 = 1.0;
    public static final double ML_PREPARADOS_POR_BLOQUE = 55.0;
    public static final double ML_AGUA_POR_BLOQUE = 50.0;
    public static final double CUCHARADAS_POR_BLOQUE = 2.0;
    public static final double GRAMOS_POR_CUCHARADA_F75 = 4.6;
    public static final double KCAL_POR_SOBRE_FTLC = 500.0;

    private CalculadoraLactario() {
    }

    public static PreparacionFormula f75(double pesoKg, int mlPorKgToma) {
        return volumenTerapeutico("F-75", pesoKg, mlPorKgToma, KCAL_POR_ML_F75, true);
    }

    public static PreparacionFormula f75(double pesoKg, EsquemaF75 esquema, int dia) {
        return f75(pesoKg, esquema.mlPorKgToma(dia));
    }

    public static PreparacionFormula f100(double pesoKg, double mlPorKgToma) {
        return volumenTerapeutico("F-100", pesoKg, mlPorKgToma, KCAL_POR_ML_F100, false);
    }

    public static PreparacionFormula ftlcPorKcalDia(double pesoKg, double kcalDia) {
        if (pesoKg <= 0) {
            throw new IllegalArgumentException("El peso debe ser mayor que cero.");
        }
        if (kcalDia <= 0) {
            throw new IllegalArgumentException("Las kilocalorías del día deben ser mayores que cero.");
        }
        double sobres = kcalDia / KCAL_POR_SOBRE_FTLC;
        return new PreparacionFormula(
                "FTLC",
                pesoKg,
                0,
                0,
                0,
                0,
                0,
                kcalDia,
                kcalDia / pesoKg,
                null,
                null,
                null,
                null,
                null,
                null,
                sobres);
    }

    public static PreparacionFormula ftlcPorKcalKg(double pesoKg, double kcalPorKg) {
        if (kcalPorKg <= 0) {
            throw new IllegalArgumentException("Las kilocalorías por kilogramo deben ser mayores que cero.");
        }
        return ftlcPorKcalDia(pesoKg, pesoKg * kcalPorKg);
    }

    private static PreparacionFormula volumenTerapeutico(
            String formula,
            double pesoKg,
            double mlPorKgToma,
            double kcalPorMl,
            boolean reconstitucionF75) {
        if (pesoKg <= 0) {
            throw new IllegalArgumentException("El peso debe ser mayor que cero.");
        }
        if (mlPorKgToma <= 0) {
            throw new IllegalArgumentException("El volumen por toma debe ser mayor que cero.");
        }
        double mlToma = mlPorKgToma * pesoKg;
        double mlDia = mlToma * TOMAS_CADA_3_HORAS;
        double kcalToma = mlToma * kcalPorMl;
        double kcalDia = mlDia * kcalPorMl;
        double kcalPorKgDia = mlPorKgToma * TOMAS_CADA_3_HORAS * kcalPorMl;
        Double aguaToma = null;
        Double aguaDia = null;
        Double cucharadasToma = null;
        Double cucharadasDia = null;
        Double gramosToma = null;
        Double gramosDia = null;
        if (reconstitucionF75) {
            double bloques = mlDia / ML_PREPARADOS_POR_BLOQUE;
            aguaDia = bloques * ML_AGUA_POR_BLOQUE;
            cucharadasDia = bloques * CUCHARADAS_POR_BLOQUE;
            gramosDia = cucharadasDia * GRAMOS_POR_CUCHARADA_F75;
            aguaToma = aguaDia / TOMAS_CADA_3_HORAS;
            cucharadasToma = cucharadasDia / TOMAS_CADA_3_HORAS;
            gramosToma = gramosDia / TOMAS_CADA_3_HORAS;
        }
        return new PreparacionFormula(
                formula,
                pesoKg,
                TOMAS_CADA_3_HORAS,
                mlPorKgToma,
                mlToma,
                mlDia,
                kcalToma,
                kcalDia,
                kcalPorKgDia,
                aguaToma,
                aguaDia,
                cucharadasToma,
                cucharadasDia,
                gramosToma,
                gramosDia,
                null);
    }
}
