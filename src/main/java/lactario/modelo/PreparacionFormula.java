package lactario.modelo;

public class PreparacionFormula {
    private final String formula;
    private final double pesoKg;
    private final int tomasDia;
    private final double mlPorKgToma;
    private final double mlToma;
    private final double mlDia;
    private final double kcalToma;
    private final double kcalDia;
    private final double kcalPorKgDia;
    private final Double aguaMlToma;
    private final Double aguaMlDia;
    private final Double cucharadasToma;
    private final Double cucharadasDia;
    private final Double gramosToma;
    private final Double gramosDia;
    private final Double sobresDia;

    public PreparacionFormula(
            String formula,
            double pesoKg,
            int tomasDia,
            double mlPorKgToma,
            double mlToma,
            double mlDia,
            double kcalToma,
            double kcalDia,
            double kcalPorKgDia,
            Double aguaMlToma,
            Double aguaMlDia,
            Double cucharadasToma,
            Double cucharadasDia,
            Double gramosToma,
            Double gramosDia,
            Double sobresDia) {
        this.formula = formula;
        this.pesoKg = pesoKg;
        this.tomasDia = tomasDia;
        this.mlPorKgToma = mlPorKgToma;
        this.mlToma = mlToma;
        this.mlDia = mlDia;
        this.kcalToma = kcalToma;
        this.kcalDia = kcalDia;
        this.kcalPorKgDia = kcalPorKgDia;
        this.aguaMlToma = aguaMlToma;
        this.aguaMlDia = aguaMlDia;
        this.cucharadasToma = cucharadasToma;
        this.cucharadasDia = cucharadasDia;
        this.gramosToma = gramosToma;
        this.gramosDia = gramosDia;
        this.sobresDia = sobresDia;
    }

    public String formula() { return formula; }
    public double pesoKg() { return pesoKg; }
    public int tomasDia() { return tomasDia; }
    public double mlPorKgToma() { return mlPorKgToma; }
    public double mlToma() { return mlToma; }
    public double mlDia() { return mlDia; }
    public double kcalToma() { return kcalToma; }
    public double kcalDia() { return kcalDia; }
    public double kcalPorKgDia() { return kcalPorKgDia; }
    public Double aguaMlToma() { return aguaMlToma; }
    public Double aguaMlDia() { return aguaMlDia; }
    public Double cucharadasToma() { return cucharadasToma; }
    public Double cucharadasDia() { return cucharadasDia; }
    public Double gramosToma() { return gramosToma; }
    public Double gramosDia() { return gramosDia; }
    public Double sobresDia() { return sobresDia; }
}
