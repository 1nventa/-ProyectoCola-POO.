package lactario.cola;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 * Cola FIFO del lactario. El primero en llegar es el primero en prepararse,
 * porque la fórmula reconstituida no se deja hecha para todo el día.
 */
public class ColaAtencion<T> {
    private final LinkedList<T> datos = new LinkedList<>();

    public void encolar(T elemento) {
        if (elemento == null) {
            throw new IllegalArgumentException("No se puede encolar un elemento nulo.");
        }
        datos.addLast(elemento);
    }

    public T desencolar() {
        if (datos.isEmpty()) {
            throw new IllegalStateException("La cola del lactario está vacía.");
        }
        return datos.removeFirst();
    }

    public T verPrimero() {
        if (datos.isEmpty()) {
            throw new IllegalStateException("La cola del lactario está vacía.");
        }
        return datos.getFirst();
    }

    public boolean estaVacia() {
        return datos.isEmpty();
    }

    public int tamano() {
        return datos.size();
    }

    public List<T> elementos() {
        return new ArrayList<>(datos);
    }
}
