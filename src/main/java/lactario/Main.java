package lactario;

import lactario.cola.ColaAtencion;
import lactario.modelo.ClasificacionNutricional;
import lactario.modelo.EsquemaF75;
import lactario.modelo.Paciente;
import lactario.modelo.PreparacionFormula;
import lactario.servicio.CalculadoraLactario;

/**
 * Demostración de la cola del lactario con el caso de la guía docente:
 * 6 meses, 7,0 kg, estabilización sin edema severo, día 1.
 */
public class Main {
    public static void main(String[] args) {
        verificarCasoGuia();
        verificarTablasYClasificacion();

        ColaAtencion<Paciente> cola = new ColaAtencion<>();
        cola.encolar(new Paciente("Caso guía", 6, 7.0, false, "", 1));
        cola.encolar(new Paciente("Lactante con edema", 4, 5.2, true, "leche", 1));
        cola.encolar(new Paciente("Seguimiento ambulatorio", 18, 8.0, false, "", 1));

        System.out.println("Cola del lactario (" + cola.tamano() + " pacientes)");
        for (Paciente paciente : cola.elementos()) {
            System.out.println("  en espera: " + paciente);
        }

        Paciente actual = cola.desencolar();
        PreparacionFormula orden = CalculadoraLactario.f75(
                actual.pesoKg(), EsquemaF75.SEVERA_SIN_EDEMA, actual.diaTratamiento());
        System.out.println();
        System.out.println("Atendiendo a " + actual.nombre());
        System.out.printf("  %.1f ml por toma x %d tomas = %.1f ml/día%n",
                orden.mlToma(), orden.tomasDia(), orden.mlDia());
        System.out.printf("  %.1f kcal/kg/día%n", orden.kcalPorKgDia());
        System.out.printf("  Preparar por toma: %.1f ml de agua y %.1f g de F-75%n",
                orden.aguaMlToma(), orden.gramosToma());
        System.out.println("Quedan en cola: " + cola.tamano());
    }

    static void verificarCasoGuia() {
        PreparacionFormula orden = CalculadoraLactario.f75(7.0, EsquemaF75.SEVERA_SIN_EDEMA, 1);
        exigirCercano(49.0, orden.mlToma(), "ml por toma");
        exigirCercano(392.0, orden.mlDia(), "ml al día");
        exigirCercano(42.0, orden.kcalPorKgDia(), "kcal/kg/día");
        exigirCercano(65.570909, orden.gramosDia(), "gramos al día");
        exigirCercano(356.363636, orden.aguaMlDia(), "agua al día");
        exigirCercano(8.1963636, orden.gramosToma(), "gramos por toma");
    }

    static void verificarTablasYClasificacion() {
        exigirIgual(4, EsquemaF75.SEVERA_CON_EDEMA.mlPorKgToma(1));
        exigirIgual(22, EsquemaF75.MODERADA.mlPorKgToma(5));
        PreparacionFormula riesgo = CalculadoraLactario.ftlcPorKcalDia(9.0, 255);
        exigirCercano(0.51, riesgo.sobresDia(), "sobres FTLC");
        PreparacionFormula seguimiento = CalculadoraLactario.ftlcPorKcalKg(10.0, 100);
        exigirCercano(2.0, seguimiento.sobresDia(), "sobres a 100 kcal/kg");
        if (ClasificacionNutricional.desdePuntajeZ(-3.2) != ClasificacionNutricional.SEVERA) {
            throw new IllegalStateException("Z < -3 debe ser severa");
        }
        if (ClasificacionNutricional.desdePuntajeZ(-2.5) != ClasificacionNutricional.MODERADA) {
            throw new IllegalStateException("Z -2.5 debe ser moderada");
        }
        if (ClasificacionNutricional.desdePuntajeZ(-1.4) != ClasificacionNutricional.RIESGO) {
            throw new IllegalStateException("Z -1.4 debe ser riesgo");
        }
        if (ClasificacionNutricional.desdePuntajeZ(-1.0) != ClasificacionNutricional.ADECUADO) {
            throw new IllegalStateException("Z -1 debe permitir el egreso");
        }
        if (ClasificacionNutricional.desdePuntajeZ(-2.0) != ClasificacionNutricional.LIMITE_MENOS_DOS) {
            throw new IllegalStateException("Z -2 exacto queda en el límite de la definición");
        }
    }

    private static void exigirIgual(int esperado, int real) {
        if (esperado != real) {
            throw new IllegalStateException("Se esperaba " + esperado + " y se obtuvo " + real);
        }
    }

    private static void exigirCercano(double esperado, double real, String campo) {
        if (Math.abs(esperado - real) > 0.001) {
            throw new IllegalStateException(campo + ": se esperaba " + esperado + " y se obtuvo " + real);
        }
    }
}
