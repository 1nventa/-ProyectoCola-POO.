package lactario.modelo;

/**
 * Puntos de corte del indicador peso para la talla o longitud.
 * Desnutrición aguda moderada y severa según el uso habitual de la Resolución 2465 de 2016.
 * Riesgo y egreso según la Resolución 0115 de 2026: riesgo entre &gt; -2 y &lt; -1 DE;
 * egreso cuando el puntaje Z es igual o superior a -1 DE.
 */
public enum ClasificacionNutricional {
    SEVERA("Desnutrición aguda severa"),
    MODERADA("Desnutrición aguda moderada"),
    RIESGO("Riesgo de desnutrición aguda"),
    ADECUADO("Peso adecuado para la talla o longitud"),
    LIMITE_MENOS_DOS("Límite exacto en -2 DE");

    private final String etiqueta;

    ClasificacionNutricional(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String etiqueta() {
        return etiqueta;
    }

    public static ClasificacionNutricional desdePuntajeZ(double z) {
        if (Double.isNaN(z)) {
            throw new IllegalArgumentException("El puntaje Z no es un número.");
        }
        if (z < -3.0) {
            return SEVERA;
        }
        if (z >= -3.0 && z < -2.0) {
            return MODERADA;
        }
        if (z > -2.0 && z < -1.0) {
            return RIESGO;
        }
        if (z >= -1.0) {
            return ADECUADO;
        }
        return LIMITE_MENOS_DOS;
    }
}
