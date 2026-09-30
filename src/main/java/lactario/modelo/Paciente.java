package lactario.modelo;

public class Paciente {
    private final String nombre;
    private final int edadMeses;
    private final double pesoKg;
    private final boolean edema;
    private final String alergias;
    private final int diaTratamiento;

    public Paciente(String nombre, int edadMeses, double pesoKg, boolean edema, String alergias, int diaTratamiento) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El paciente necesita un nombre.");
        }
        if (edadMeses < 0 || edadMeses > 59) {
            throw new IllegalArgumentException("El lineamiento cubre de 0 a 59 meses.");
        }
        if (pesoKg <= 0) {
            throw new IllegalArgumentException("El peso debe ser mayor que cero.");
        }
        if (diaTratamiento < 1) {
            throw new IllegalArgumentException("El día de tratamiento empieza en 1.");
        }
        this.nombre = nombre.trim();
        this.edadMeses = edadMeses;
        this.pesoKg = pesoKg;
        this.edema = edema;
        this.alergias = alergias == null ? "" : alergias.trim();
        this.diaTratamiento = diaTratamiento;
    }

    public String nombre() { return nombre; }
    public int edadMeses() { return edadMeses; }
    public double pesoKg() { return pesoKg; }
    public boolean edema() { return edema; }
    public String alergias() { return alergias; }
    public int diaTratamiento() { return diaTratamiento; }

    @Override
    public String toString() {
        return nombre + " (" + edadMeses + " meses, " + pesoKg + " kg)";
    }
}
