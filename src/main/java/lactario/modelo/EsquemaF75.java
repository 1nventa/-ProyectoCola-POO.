package lactario.modelo;

/**
 * Tablas 15 y 16 de la Resolución 0115 de 2026.
 * Mililitros de F-75 por kilogramo en cada toma, días 1 a 5, ocho tomas al día.
 */
public enum EsquemaF75 {
    SEVERA_SIN_EDEMA("Tabla 16. Desnutrición aguda severa sin edema, menores de 6 meses", new int[] {7, 10, 13, 16, 19}),
    SEVERA_CON_EDEMA("Tabla 16. Desnutrición aguda severa con edema, menores de 6 meses", new int[] {4, 7, 10, 13, 16}),
    MODERADA("Tabla 15. Desnutrición aguda moderada, menores de 6 meses", new int[] {10, 13, 16, 19, 22});

    private final String descripcion;
    private final int[] mlPorKgToma;

    EsquemaF75(String descripcion, int[] mlPorKgToma) {
        this.descripcion = descripcion;
        this.mlPorKgToma = mlPorKgToma;
    }

    public String descripcion() {
        return descripcion;
    }

    public int mlPorKgToma(int dia) {
        if (dia < 1 || dia > mlPorKgToma.length) {
            throw new IllegalArgumentException("La estabilización con estas tablas cubre los días 1 a 5.");
        }
        return mlPorKgToma[dia - 1];
    }
}
