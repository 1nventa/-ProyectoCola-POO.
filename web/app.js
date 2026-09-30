import { CATALOGO } from "./catalogo.js";
import {
  ESQUEMAS_F75,
  alertasAlergia,
  clasificarPuntajeZ,
  gananciaEsperada,
  mlPorKgToma,
  prepararF100,
  prepararF75,
  prepararFtlc,
} from "./calculos.js";

const $ = (id) => document.getElementById(id);
const CLAVE_COLA = "lactario-cola";
const CLAVE_MATRIZ = "lactario-matriz";

let cola = cargar(CLAVE_COLA, []);

document.querySelectorAll(".pestana").forEach((boton) => {
  boton.addEventListener("click", () => mostrar(boton.dataset.seccion));
});

$("formulario").addEventListener("submit", (evento) => {
  evento.preventDefault();
  sincronizarFase();
});
$("formulario").addEventListener("input", sincronizarFase);
$("caso-guia").addEventListener("click", cargarCasoGuia);
$("encolar").addEventListener("click", () => {
  try {
    const paciente = leerPaciente();
    cola.push({ ...paciente, id: crypto.randomUUID() });
    guardarCola();
    pintarOrden(paciente, $("resultado"));
  } catch (error) {
    $("resultado").innerHTML = `<p class="alerta">${escapeHtml(error.message)}</p>`;
  }
});
$("atender").addEventListener("click", atender);
$("filtro-lab").addEventListener("change", pintarCatalogo);
$("guardar-matriz").addEventListener("click", guardarMatriz);
$("imprimir-matriz").addEventListener("click", () => window.print());

pintarCola();
pintarCatalogo();
pintarFichas();
restaurarMatriz();
sincronizarFase();

function mostrar(id) {
  document.querySelectorAll(".seccion").forEach((seccion) => seccion.classList.toggle("activa", seccion.id === id));
  document.querySelectorAll(".pestana").forEach((boton) => boton.classList.toggle("activa", boton.dataset.seccion === id));
}

function cargarCasoGuia() {
  $("nombre").value = "Caso guía";
  $("edad").value = "6";
  $("peso").value = "7";
  $("dia").value = "1";
  $("z").value = "";
  $("alergias").value = "";
  $("edema").checked = false;
  document.querySelector('input[name="fase"][value="estabilizacion"]').checked = true;
  $("esquema").value = "severa_sin_edema";
  sincronizarFase();
  pintarOrden(leerPaciente(), $("resultado"));
}

function sincronizarFase() {
  const fase = document.querySelector('input[name="fase"]:checked').value;
  $("bloque-f75").hidden = fase === "ambulatoria";
  $("bloque-ftlc").hidden = fase !== "ambulatoria";
  $("dia").disabled = fase !== "estabilizacion";
  if (fase === "estabilizacion" && $("edema").checked && $("esquema").value === "severa_sin_edema") {
    $("esquema").value = "severa_con_edema";
  }
  const esquema = ESQUEMAS_F75[$("esquema").value];
  $("nota-esquema").textContent = esquema ? `${esquema.titulo}. ${esquema.alcance}` : "";
  try {
    pintarOrden(leerPaciente(), $("resultado"));
  } catch (error) {
    $("resultado").innerHTML = `<p class="alerta">${escapeHtml(error.message)}</p>`;
  }
}

function leerPaciente() {
  const fase = document.querySelector('input[name="fase"]:checked').value;
  const edad = Number($("edad").value);
  const peso = Number($("peso").value);
  const dia = Number($("dia").value);
  const zTexto = $("z").value.trim();
  if ($("edad").value === "" || Number.isNaN(edad) || edad < 0 || edad > 59) {
    throw new Error("La edad debe estar entre 0 y 59 meses.");
  }
  if (!Number.isFinite(peso) || peso <= 0) {
    throw new Error("El peso debe ser mayor que cero.");
  }
  return {
    nombre: $("nombre").value.trim() || "Sin nombre",
    edadMeses: edad,
    pesoKg: peso,
    dia,
    edema: $("edema").checked,
    alergias: $("alergias").value.trim(),
    fase,
    esquema: $("esquema").value,
    dosisFtlc: $("dosis-ftlc").value,
    z: zTexto === "" ? null : Number(zTexto),
  };
}

function calcular(paciente) {
  if (paciente.fase === "ambulatoria") {
    const kcalDia = paciente.dosisFtlc === "100kg" ? paciente.pesoKg * 100 : Number(paciente.dosisFtlc);
    return { tipo: "ftlc", orden: prepararFtlc({ pesoKg: paciente.pesoKg, kcalDia }), paciente };
  }
  const ml = paciente.fase === "estabilizacion"
    ? mlPorKgToma(paciente.esquema, paciente.dia)
    : mlPorKgToma(paciente.esquema, 5);
  const orden = paciente.fase === "estabilizacion"
    ? prepararF75(paciente.pesoKg, ml)
    : prepararF100(paciente.pesoKg, ml);
  return { tipo: paciente.fase, orden, paciente, mlPorKgToma: ml };
}

function pintarOrden(paciente, destino) {
  let calculo;
  try {
    calculo = calcular(paciente);
  } catch (error) {
    destino.innerHTML = `<p class="alerta">${escapeHtml(error.message)}</p>`;
    return;
  }
  const { orden } = calculo;
  const clasificacion = paciente.z === null ? "" : bloqueClasificacion(paciente);
  const alergias = alertasAlergia(paciente.alergias).map((texto) => `<p class="alerta">${escapeHtml(texto)}</p>`).join("");
  const ganancia = gananciaEsperada(paciente.edadMeses);
  if (calculo.tipo === "ftlc") {
    destino.innerHTML = `
      <h2>Orden de FTLC</h2>
      <p>${escapeHtml(paciente.nombre)} · ${formato(paciente.pesoKg)} kg</p>
      ${clasificacion}
      ${alergias}
      <dl>
        <dt>Energía del día</dt><dd>${formato(orden.kcalDia, 0)} kcal</dd>
        <dt>Por kilogramo</dt><dd>${formato(orden.kcalPorKgDia)} kcal/kg/día</dd>
        <dt>Sobres de 500 kcal</dt><dd>${formato(orden.sobresDia, 2)} / día</dd>
        <dt>Para 15 días</dt><dd>${formato(orden.sobresDia * 15, 1)} sobres</dd>
      </dl>
      <p class="nota">${escapeHtml(ganancia.texto)} El egreso ambulatorio pide puntaje Z igual o superior a −1.</p>`;
    return;
  }
  const reconstitucion = orden.gramosDia == null ? "" : `
    <dt>Agua de la toma</dt><dd>${formato(orden.aguaMlToma)} ml</dd>
    <dt>Polvo de la toma</dt><dd>${formato(orden.gramosToma)} g (${formato(orden.cucharadasToma, 2)} cucharadas)</dd>
    <dt>Agua del día</dt><dd>${formato(orden.aguaMlDia)} ml</dd>
    <dt>Polvo del día</dt><dd>${formato(orden.gramosDia)} g</dd>`;
  destino.innerHTML = `
    <h2>Orden de ${escapeHtml(orden.formula)}</h2>
    <p>${escapeHtml(paciente.nombre)} · ${paciente.edadMeses} meses · ${formato(paciente.pesoKg)} kg</p>
    ${clasificacion}
    ${alergias}
    <ol class="pasos">
      <li>${formato(calculo.mlPorKgToma, 0)} ml/kg × ${formato(paciente.pesoKg)} kg = <strong>${formato(orden.mlToma)} ml por toma</strong>.</li>
      <li>Ocho tomas, cada 3 horas: <strong>${formato(orden.mlDia)} ml al día</strong>.</li>
      <li>${orden.formula === "F-75" ? "75 kcal/100 ml" : "100 kcal/100 ml"}: <strong>${formato(orden.kcalPorKgDia)} kcal/kg/día</strong>.</li>
    </ol>
    <dl>
      <dt>Energía de la toma</dt><dd>${formato(orden.kcalToma)} kcal</dd>
      <dt>Energía del día</dt><dd>${formato(orden.kcalDia)} kcal</dd>
      ${reconstitucion}
    </dl>
    <p class="nota">${escapeHtml(ganancia.texto)} ${textoConservacion(orden.formula)}</p>`;
}

function bloqueClasificacion(paciente) {
  if (!Number.isFinite(paciente.z)) {
    return `<p class="alerta">El puntaje Z no es un número.</p>`;
  }
  const clase = clasificarPuntajeZ(paciente.z);
  const extra = clase.codigo === "limite"
    ? " La Resolución 0115 define el riesgo por encima de −2 y por debajo de −1. Exactamente −2 no entra en ninguna de las dos frases: hay que revisar el redondeo."
    : "";
  return `<p><strong>${escapeHtml(clase.etiqueta)}</strong> (Z ${formato(paciente.z, 2)}).${escapeHtml(extra)}</p>`;
}

function textoConservacion(formula) {
  if (formula === "F-75") {
    return "La constante es 50 ml de agua y 2 cucharadas de 4,6 g por cada 55 ml preparados. La guía ilustra 366,3 ml de agua para este caso; con esa constante el agua del día es 356,4 ml y el polvo queda en 65,6 g, junto a los 65,5 g del ejemplo.";
  }
  return "F-100 aporta 100 kcal/100 ml. El volumen mostrado es el del día 5 del esquema F-75 elegido. El agua y las cucharadas dependen de la ficha de la F-100; la guía solo cuantifica la reconstitución de F-75. Se pasa a F-100 si a los 5 días no hay la ganancia esperada o si el edema severo continúa.";
}

function pintarCola() {
  const lista = $("lista-cola");
  if (cola.length === 0) {
    lista.innerHTML = `<li class="vacia">No hay pacientes en espera.</li>`;
    return;
  }
  lista.innerHTML = cola.map((paciente, indice) => `
    <li>
      <strong>${indice + 1}. ${escapeHtml(paciente.nombre)}</strong>
      · ${paciente.edadMeses} meses · ${formato(paciente.pesoKg)} kg · ${etiquetaFase(paciente)}
      <button type="button" class="quitar" data-id="${paciente.id}">Quitar</button>
    </li>`).join("");
  lista.querySelectorAll(".quitar").forEach((boton) => {
    boton.addEventListener("click", () => {
      cola = cola.filter((paciente) => paciente.id !== boton.dataset.id);
      guardarCola();
    });
  });
}

function atender() {
  if (cola.length === 0) {
    $("resultado").innerHTML = `<p class="alerta">La cola está vacía.</p>`;
    return;
  }
  const paciente = cola.shift();
  guardarCola();
  pintarOrden(paciente, $("resultado"));
}

function guardarCola() {
  localStorage.setItem(CLAVE_COLA, JSON.stringify(cola));
  pintarCola();
}

function pintarCatalogo() {
  const laboratorio = $("filtro-lab").value;
  const productos = CATALOGO.filter((item) => laboratorio === "todos" || item.laboratorio === laboratorio);
  $("lista-apme").innerHTML = productos.map((item) => `
    <article class="tarjeta apme">
      <p class="laboratorio">${escapeHtml(item.laboratorio)} · ${escapeHtml(item.tipo)}</p>
      <h3>${escapeHtml(item.nombre)}</h3>
      <p>${escapeHtml(item.edad)}</p>
      <p>${escapeHtml(item.indicacion)}</p>
      <p class="nota">${escapeHtml(item.preparacion)}</p>
      <p class="nota">${escapeHtml(item.registro)}${item.mipres ? ` · MIPRES ${escapeHtml(item.mipres)}` : ""}</p>
    </article>`).join("");
}

function pintarFichas() {
  const ejes = [
    ["Apariencia", "1 muy heterogéneo · 5 totalmente homogéneo"],
    ["Olor", "1 desagradable · 5 muy agradable"],
    ["Textura", "1 acuosa · 5 muy densa"],
    ["Sabor y retrogusto", "1 insípido o metálico · 5 muy agradable"],
  ];
  $("fichas-sensoriales").innerHTML = [1, 2, 3].map((numero) => `
    <article class="tarjeta ficha-sensorial">
      <h3>APME ${numero}</h3>
      <label>Producto
        <select class="apme-select" data-numero="${numero}">
          <option value="">Elegir del vademécum</option>
          ${CATALOGO.map((item) => `<option value="${escapeHtml(item.nombre)}">${escapeHtml(item.laboratorio)} · ${escapeHtml(item.nombre)}</option>`).join("")}
        </select>
      </label>
      <p class="nota indicacion" data-numero="${numero}"></p>
      ${ejes.map(([eje, ayuda]) => `
        <fieldset>
          <legend>${eje}</legend>
          <div class="escala">
            ${[1, 2, 3, 4, 5].map((punto) => `
              <label><input type="radio" name="p${numero}-${eje}" value="${punto}"> ${punto}</label>`).join("")}
          </div>
          <p class="nota">${ayuda}</p>
          <textarea rows="2" placeholder="Qué se vio, olió o quedó en la boca"></textarea>
        </fieldset>`).join("")}
    </article>`).join("");

  document.querySelectorAll(".apme-select").forEach((select) => {
    select.addEventListener("change", () => {
      const producto = CATALOGO.find((item) => item.nombre === select.value);
      const nota = document.querySelector(`.indicacion[data-numero="${select.dataset.numero}"]`);
      nota.textContent = producto ? producto.indicacion : "";
    });
  });
}

function guardarMatriz() {
  const fichas = [...document.querySelectorAll(".ficha-sensorial")].map((ficha) => ({
    producto: ficha.querySelector("select").value,
    radios: [...ficha.querySelectorAll("input[type=radio]:checked")].map((input) => [input.name, input.value]),
    notas: [...ficha.querySelectorAll("textarea")].map((area) => area.value),
  }));
  const datos = {
    estudiante: $("estudiante").value,
    experiencia: $("reflexion-experiencia").value,
    empatia: $("reflexion-empatia").value,
    fichas,
  };
  localStorage.setItem(CLAVE_MATRIZ, JSON.stringify(datos));
  $("estado-matriz").textContent = "Borrador guardado en este navegador.";
}

function restaurarMatriz() {
  const datos = cargar(CLAVE_MATRIZ, null);
  if (!datos) return;
  $("estudiante").value = datos.estudiante || "";
  $("reflexion-experiencia").value = datos.experiencia || "";
  $("reflexion-empatia").value = datos.empatia || "";
  (datos.fichas || []).forEach((ficha, indice) => {
    const articulo = document.querySelectorAll(".ficha-sensorial")[indice];
    if (!articulo) return;
    articulo.querySelector("select").value = ficha.producto || "";
    articulo.querySelector("select").dispatchEvent(new Event("change"));
    (ficha.radios || []).forEach(([nombre, valor]) => {
      const input = articulo.querySelector(`input[name="${CSS.escape(nombre)}"][value="${valor}"]`);
      if (input) input.checked = true;
    });
    [...articulo.querySelectorAll("textarea")].forEach((area, i) => {
      area.value = ficha.notas?.[i] || "";
    });
  });
}

function etiquetaFase(paciente) {
  if (paciente.fase === "ambulatoria") return "FTLC";
  if (paciente.fase === "transicion") return "F-100";
  return `F-75 día ${paciente.dia}`;
}

function formato(numero, decimales = 1) {
  return Number(numero).toLocaleString("es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

function escapeHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cargar(clave, vacio) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : vacio;
  } catch {
    return vacio;
  }
}
