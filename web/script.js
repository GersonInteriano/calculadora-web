/* js/script.js */
document.addEventListener("DOMContentLoaded", function() {
  // Variables globales para las instancias de los gráficos
  let chartElectricidad, chartAgua, chartOficina, chartLimpieza, chartCsv;
  let datosCsv = []; // Almacenará los datos del CSV.  ¡IMPORTANTE!  Debe ser global.

  // Función para obtener valor numérico de un input
  function obtenerValor(id) {
    const valor = document.getElementById(id).value.trim();
    return valor === "" ? 0 : parseFloat(valor);
  }

  // Validación: solo números positivos
  function validarValor(valor) {
    return !isNaN(valor) && valor >= 0;
  }

  // Convertir cadena separada por comas a array de números (considera coma decimal)
  function convertirCadenaAArray(cadena) {
    return cadena.split(",")
      .map(item => parseFloat(item.trim().replace(",", ".")))
      .filter(num => validarValor(num));
  }

  // Mostrar y limpiar mensajes de error
  function mostrarError(mensaje) {
    document.getElementById("errorMensaje").textContent = mensaje;
  }
  function limpiarError() {
    document.getElementById("errorMensaje").textContent = "";
  }

  // Función para mostrar u ocultar secciones avanzadas según el método seleccionado.  ¡CORRECTO!
  function toggleSeccionAvanzada(idSelect, idAdvanced) {
      const selectElem = document.getElementById(idSelect);
      const advancedElem = document.getElementById(idAdvanced);
      if (selectElem.value === "avanzado") {
        advancedElem.classList.remove("oculto");
      } else {
        advancedElem.classList.add("oculto");
      }
  }

    // Event Listeners para mostrar/ocultar secciones avanzadas.
    document.getElementById("metodoElectrico").addEventListener("change", function() {
      toggleSeccionAvanzada("metodoElectrico", "advancedElectricidad");
    });
    document.getElementById("metodoAgua").addEventListener("change", function() {
      toggleSeccionAvanzada("metodoAgua", "advancedAgua");
    });
    document.getElementById("metodoOficina").addEventListener("change", function() {
      toggleSeccionAvanzada("metodoOficina", "advancedOficina");
    });
    document.getElementById("metodoLimpieza").addEventListener("change", function() {
      toggleSeccionAvanzada("metodoLimpieza", "advancedLimpieza");
    });



  // Funciones de cálculo básico y avanzado
  function calcularBasico(base, factor, meses) {
    return base * factor * meses;
  }
  function calcularAvanzado(arrayDatos, meses) {
    return arrayDatos.slice(0, meses).reduce((acc, val) => acc + val, 0);
  }

  // Funciones avanzadas de Electricidad
  function promedioMensual(arrayDatos) {
    return arrayDatos.reduce((acc, val) => acc + val, 0) / arrayDatos.length;
  }
  function consumoTeoricoAnual(arrayDatos) {
    return calcularAvanzado(arrayDatos, 12);
  }
  function consumoRealAnual(arrayDatos, factorVacacional) {
    let total = 0;
    for (let i = 0; i < arrayDatos.length; i++) {
      total += (i === 7) ? arrayDatos[i] * factorVacacional : arrayDatos[i]; // Agosto es el índice 7
    }
    return total;
  }
  function produccionFotovoltaicaAnual(produccionDiaria) {
    return produccionDiaria * 365;
  }
  function autoconsumoRealDiario(promedioMensualVal, porcentaje) {
    return (promedioMensualVal / 30) * (porcentaje / 100);
  }

  // Funciones para almacenamiento en localStorage
  function almacenarResultados(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
  }
  function obtenerResultados(clave) {
    return JSON.parse(localStorage.getItem(clave));
  }

 // Función para generar tabla comparativa para cualquier recurso
function generarTablaComparativa(arrayDatos, recursoID) {
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  let tablaHTML = `<h3>Comparativa de Consumo/Gasto Mensual</h3>`;
  tablaHTML += `<table><tr><th>Mes</th><th>Valor</th></tr>`;
  arrayDatos.forEach((valor, index) => {
      // Asegurarse de que el valor sea un número antes de llamar a toFixed()
      const valorNumerico = parseFloat(valor);
      const valorFormateado = isNaN(valorNumerico) ? 'Dato no disponible' : valorNumerico.toFixed(2);
      tablaHTML += `<tr><td>${meses[index]}</td><td>${valorFormateado}</td></tr>`;
  });
  tablaHTML += `</table>`;
  document.getElementById(recursoID).innerHTML = tablaHTML;
}


// Función para actualizar la publicación de datos y tablas comparativas
function actualizarPublicacionDatos() {
  const datosPublicadosDiv = document.getElementById("datosPublicados");
    let html = "";

    // Recupera los resultados.  Si no existen, usa valores por defecto.
    const electricidad = obtenerResultados("resultadosElectricidad") || {anual: 0, periodo: 0, meses: 0, metodo: 'No calculado'};
    const agua = obtenerResultados("resultadosAgua") || {anual: 0, periodo: 0, meses: 0, metodo: 'No calculado'};
    const oficina = obtenerResultados("resultadosOficina") || {anual: 0, periodo: 0, meses: 0, metodo: 'No calculado'};
    const limpieza = obtenerResultados("resultadosLimpieza") || {anual: 0, periodo: 0, meses: 0, metodo: 'No calculado'};


    html += `<h3>Electricidad</h3>
        <table>
          <tr><th>Consumo Anual (kWh)</th><td>${electricidad.anual}</td></tr>
          <tr><th>Consumo Período (${electricidad.meses} meses)</th><td>${electricidad.periodo}</td></tr>
          <tr><th>Método</th><td>${electricidad.metodo}</td></tr>
        </table>`;
  html += `<h3>Agua</h3>
        <table>
          <tr><th>Consumo Anual (litros)</th><td>${agua.anual}</td></tr>
          <tr><th>Consumo Período (${agua.meses} meses)</th><td>${agua.periodo}</td></tr>
          <tr><th>Método</th><td>${agua.metodo}</td></tr>
        </table>`;
  html += `<h3>Consumibles de Oficina</h3>
        <table>
          <tr><th>Gasto Anual (€)</th><td>${oficina.anual}</td></tr>
          <tr><th>Gasto Período (${oficina.meses} meses)</th><td>${oficina.periodo}</td></tr>
          <tr><th>Método</th><td>${oficina.metodo}</td></tr>
        </table>`;

      html += `<h3>Productos de limpieza</h3>
              <table>
                <tr><th>Consumo Anual (€)</th><td>${limpieza.anual}</td></tr>
                <tr><th>Consumo Período (${limpieza.meses} meses)</th><td>${limpieza.periodo}</td></tr>
                <tr><th>Método</th><td>${limpieza.metodo}</td></tr>
              </table>`;

    datosPublicadosDiv.innerHTML = html; // Actualiza la sección de datos publicados.


    actualizarGraficas(electricidad, agua, oficina, limpieza);


 // Generar tablas comparativas para cada recurso si se usa el método avanzado y se han ingresado 12 valores
     if (electricidad && electricidad.metodo.indexOf("Avanzado") !== -1 && window.arrayElectricoDatos && window.arrayElectricoDatos.length === 12) {
      generarTablaComparativa(window.arrayElectricoDatos, "tablaComparativaElectrica");
    } else {
      document.getElementById("tablaComparativaElectrica").innerHTML = "";
    }
    if (agua && agua.metodo.indexOf("Avanzado") !== -1 && window.arrayAguaDatos && window.arrayAguaDatos.length === 12) {
      generarTablaComparativa(window.arrayAguaDatos, "tablaComparativaAgua");
    } else {
      document.getElementById("tablaComparativaAgua").innerHTML = "";
    }
    if (oficina && oficina.metodo.indexOf("Avanzado") !== -1 && window.arrayOficinaDatos && window.arrayOficinaDatos.length === 12) {
      generarTablaComparativa(window.arrayOficinaDatos, "tablaComparativaOficina");
    } else {
      document.getElementById("tablaComparativaOficina").innerHTML = "";
    }
    if (limpieza && limpieza.metodo.indexOf("Avanzado") !== -1 && window.arrayLimpiezaDatos && window.arrayLimpiezaDatos.length === 12) {
      generarTablaComparativa(window.arrayLimpiezaDatos, "tablaComparativaLimpieza");
    } else {
      document.getElementById("tablaComparativaLimpieza").innerHTML = "";
    }
  }  // Función para actualizar gráficas utilizando Chart.js
  function actualizarGraficas(electricidad, agua, oficina, limpieza) {
    // Destruir gráficos previos si existen
    if (chartElectricidad) { chartElectricidad.destroy(); }
    if (chartAgua) { chartAgua.destroy(); }
    if (chartOficina) { chartOficina.destroy(); }
    if (chartLimpieza) { chartLimpieza.destroy(); }
    if (chartCsv) { chartCsv.destroy(); } // Asegúrate de destruir también chartCsv.

    // Gráfica Electricidad.  Usa los datos de la variable global si existen.
    const ctxElec = document.getElementById("graficaElectricidad").getContext("2d");
    if (electricidad) {
      const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      let datosGrafica = [];
      let tipoGrafica = 'bar'; // Por defecto, barra
      let etiquetas = ["Anual", `Período (${electricidad.meses}m)`];

      if (electricidad.metodo.indexOf("Avanzado") !== -1 && window.arrayElectricoDatos && window.arrayElectricoDatos.length === 12) {
        // Si hay datos avanzados, usa los datos mensuales
        datosGrafica = window.arrayElectricoDatos;
        tipoGrafica = 'line'; // Cambia a línea para datos mensuales
        etiquetas = meses;
      } else {
        // Si no hay datos avanzados, usa los datos anuales y de período
        datosGrafica = [parseFloat(electricidad.anual), parseFloat(electricidad.periodo)];
      }
      chartElectricidad = new Chart(ctxElec, {
        type: tipoGrafica,
        data: {
          labels: etiquetas,
          datasets: [{
            label: tipoGrafica === 'line' ? 'Consumo Mensual (kWh)' : 'Consumo (kWh)',
            data: datosGrafica,
            backgroundColor: tipoGrafica === 'line' ? 'rgba(75, 192, 192, 0.4)' : ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
            borderColor: tipoGrafica === 'line' ? 'rgba(75, 192, 192, 1)' : undefined,
            fill: tipoGrafica === 'line' ? true : false
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Gráfica Agua (Lógica similar a Electricidad)
      const ctxAgua = document.getElementById("graficaAgua").getContext("2d");
      if (agua) {
          const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
          let datosGrafica = [];
          let tipoGrafica = 'bar';
          let etiquetas = ["Anual", `Período (${agua.meses}m)`];

          if (agua.metodo.indexOf("Avanzado") !== -1 && window.arrayAguaDatos && window.arrayAguaDatos.length === 12) {
              datosGrafica = window.arrayAguaDatos;
              tipoGrafica = 'line';
              etiquetas = meses;
          } else {
              datosGrafica = [parseFloat(agua.anual), parseFloat(agua.periodo)];
          }

          chartAgua = new Chart(ctxAgua, {
              type: tipoGrafica,
              data: {
                  labels: etiquetas,
                  datasets: [{
                      label: tipoGrafica === 'line' ? 'Consumo Mensual (litros)' : 'Consumo (litros)',
                      data: datosGrafica,
                      backgroundColor: tipoGrafica === 'line' ? 'rgba(54, 162, 235, 0.4)' : 'rgba(54, 162, 235, 0.6)',
                      borderColor: tipoGrafica === 'line' ? 'rgba(54, 162, 235, 1)' : undefined,
                      fill: tipoGrafica === 'line' ? true : false
                  }]
              },
              options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true }}}
          });
      }

      // Gráfica Consumibles de Oficina (similar)
      const ctxOficina = document.getElementById("graficaOficina").getContext("2d");
        if (oficina) {
            const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            let datosGrafica = [];
            let tipoGrafica = 'bar';
            let etiquetas = ["Anual", `Período (${oficina.meses}m)`];

            if (oficina.metodo.indexOf("Avanzado") !== -1 && window.arrayOficinaDatos && window.arrayOficinaDatos.length === 12) {
                datosGrafica = window.arrayOficinaDatos;
                tipoGrafica = 'line';
                etiquetas = meses;
            } else {
                datosGrafica = [parseFloat(oficina.anual), parseFloat(oficina.periodo)];
            }

            chartOficina = new Chart(ctxOficina, {
                type: tipoGrafica,
                data: {
                    labels: etiquetas,
                    datasets: [{
                        label: tipoGrafica === 'line' ? 'Gasto Mensual (€)' : 'Gasto (€)',
                        data: datosGrafica,
                        backgroundColor: tipoGrafica === 'line' ? 'rgba(255, 159, 64, 0.4)' : ['rgba(255, 159, 64, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                        borderColor: tipoGrafica === 'line' ? 'rgba(255, 159, 64, 1)' : undefined,
                        fill: tipoGrafica === 'line' ? true : false
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } }

            });
        }

    // Gráfica Productos de Limpieza (similar)
      const ctxLimpieza = document.getElementById("graficaLimpieza").getContext("2d");
        if (limpieza) {
            const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            let datosGrafica = [];
            let tipoGrafica = 'bar';
            let etiquetas = ["Anual", `Período (${limpieza.meses}m)`];

            if (limpieza.metodo.indexOf("Avanzado") !== -1 && window.arrayLimpiezaDatos && window.arrayLimpiezaDatos.length === 12) {
                datosGrafica = window.arrayLimpiezaDatos;
                tipoGrafica = 'line';
                etiquetas = meses;
            } else {
                datosGrafica = [parseFloat(limpieza.anual), parseFloat(limpieza.periodo)];
            }

            chartLimpieza = new Chart(ctxLimpieza, {
                type: tipoGrafica,
                data: {
                    labels: etiquetas,
                    datasets: [{
                        label: tipoGrafica === 'line' ? 'Gasto Mensual (€)' : 'Gasto (€)',
                        data: datosGrafica,
                        backgroundColor: tipoGrafica === 'line' ? 'rgba(255, 99, 132, 0.4)' : ['rgba(255, 99, 132, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                        borderColor: tipoGrafica === 'line' ? 'rgba(255, 99, 132, 1)' : undefined,
                        fill: tipoGrafica === 'line' ? true : false
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true }}}
            });
        }
    }

  // Sección Ayuda: mostrar/ocultar
  const btnAyuda = document.getElementById("btnAyuda");
  const seccionAyuda = document.getElementById("seccionAyuda");
  const cerrarAyudaBtn = document.getElementById("cerrarAyuda");

  btnAyuda.addEventListener("click", function() {
    seccionAyuda.classList.remove("oculto");
  });
  cerrarAyudaBtn.addEventListener("click", function() {
    seccionAyuda.classList.add("oculto");
  });

   // Funcionalidad de lectura de CSV desde archivo (opción adicional)
   const csvFileInput = document.getElementById("csvFileInput");
   const btnProcesarCSV = document.getElementById("btnProcesarCSV");
 
   btnProcesarCSV.addEventListener("click", function() {
     if (csvFileInput.files.length === 0) {
       alert("Por favor, selecciona un archivo CSV.");
       return;
     }
     const file = csvFileInput.files[0];
     const reader = new FileReader();
     reader.onload = function(e) {
       const csvText = e.target.result;
       const parsed = Papa.parse(csvText, {  // Utiliza Papa.parse para parsear el CSV.
         header: true,        // Considera la primera fila como nombres de columna
         skipEmptyLines: true, // Ignora líneas vacías
         delimiter: ",",      // Delimitador es la coma.
         dynamicTyping: true,   // Convierte los números automáticamente
         transform: function(value) {  // Transforma cada valor,
             if (typeof value === 'string') {
                 return value.trim().replace(/\s+/g, ' '); // Limpieza de espacios extra
             }
             return value;
         }
       });
 
       if (parsed.errors.length > 0) {
         alert("Error al procesar el CSV: " + parsed.errors[0].message); //Mensaje de error si hay un problema en el parseo
         return;
       }
       datosCsv = parsed.data; //Si todo va bien, se guardan los datos parseados.
 
 
       // Validar que exista la columna "Consumo (kWh)" en el CSV,
       //   y al menos una fila de datos (aparte de la cabecera)
     if (!datosCsv[0] || !datosCsv[0]["Consumo (kWh)"]) {
         alert("El CSV no tiene la columna 'Consumo (kWh)' requerida o no tiene datos.");
         return;
     }
 
 
       alert("CSV cargado correctamente.");
       updateCSVDisplay(); //Actualiza las tablas y la gráfica CSV.
     };
     reader.readAsText(file); //Lee el archivo como texto.
   });
 
     // Al cambiar el recurso en el selector CSV se actualiza la visualización
     document.getElementById("csvResourceSelect").addEventListener("change", updateCSVDisplay);
 
 
   // Función para procesar los datos CSV y actualizar tabla y gráfica según el recurso seleccionado
   function updateCSVDisplay() {
    if (!datosCsv || datosCsv.length === 0) return;
  
    const resource = document.getElementById("csvResourceSelect").value;
    let dataArray = [];
    let label = "";
    let fechas = []; // Inicializa fechas a un array vacío
  
    // Extrae los datos según el recurso seleccionado
    switch (resource) {
      case "electricidad":
        // Asegúrate de que 'datosCsv' tiene la estructura correcta ANTES de intentar acceder a las propiedades
        if (datosCsv[0] && datosCsv[0]["Fecha"] && datosCsv[0]["Consumo (kWh)"]) {
          fechas = datosCsv.map(row => row["Fecha"]); // Ahora podemos obtener las fechas de forma segura
          dataArray = datosCsv.map(row => parseFloat(String(row["Consumo (kWh)"]).replace(",", ".")));
          label = "Consumo (kWh)";
        } else {
          console.error("El CSV no tiene las columnas esperadas para electricidad ('Fecha' o 'Consumo (kWh)').");
          return;  // Sale de la función si no hay datos correctos
        }
        break;
      case "agua":
          //Validacion para agua
          if (datosCsv[0] && datosCsv[0]["Fecha"] && datosCsv[0]["Consumo (litros)"]) {
            fechas = datosCsv.map(row => row["Fecha"]);
            dataArray = datosCsv.map(row => parseFloat(String(row["Consumo (litros)"]).replace(",", ".")));
            label = "Agua (litros)";
          } else {
              console.error("El CSV no tiene las columnas esperadas para agua ('Fecha' o 'Consumo (litros))'.");
              return;
          }
        break;
      case "oficina":
          //Validacion para oficina
          if (datosCsv[0] && datosCsv[0]["Fecha"] && datosCsv[0]["Consumibles (€)"]) {
            fechas = datosCsv.map(row => row["Fecha"]);
            dataArray = datosCsv.map(row => parseFloat(String(row["Consumibles (€)"]).replace(",", ".")));
            label = "Consumibles (€)";
          }else{
              console.error("El CSV no tiene las columnas esperadas para consumibles ('Fecha' o 'Consumibles (€))'.");
              return;
          }
  
        break;
      case "limpieza":
          //Validacion para limpieza
          if (datosCsv[0] && datosCsv[0]["Fecha"] && datosCsv[0]["Limpieza (€)"]){
              fechas = datosCsv.map(row => row["Fecha"]);
              dataArray = datosCsv.map(row => parseFloat(String(row["Limpieza (€)"]).replace(",", ".")));
              label = "Limpieza (€)";
          } else {
              console.error("El CSV no tiene las columnas esperadas para limpieza ('Fecha' o 'Limpieza (€))'.");
              return;
          }
        break;
      default:
          console.error("Recurso desconocido:", resource);
          return; // Sale si el recurso no es reconocido.
  
    }
  
      // Generar tabla comparativa CSV
    let tableHTML = `<h3>Comparativa CSV - ${resource.charAt(0).toUpperCase() + resource.slice(1)}</h3>`;
    tableHTML += `<table><tr><th>Fecha</th><th>${label}</th></tr>`;
    for (let i = 0; i < fechas.length; i++) {
      let value = isNaN(dataArray[i]) ? dataArray[i] : dataArray[i].toFixed(2);
      tableHTML += `<tr><td>${fechas[i]}</td><td>${value}</td></tr>`;
    }
    tableHTML += `</table>`;
    document.getElementById("csvTableDisplay").innerHTML = tableHTML;
  
      // Actualizar gráfica CSV
    const ctxCsv = document.getElementById("csvGraph").getContext("2d");
    if (chartCsv) { chartCsv.destroy(); }
    chartCsv = new Chart(ctxCsv, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: label,
          data: dataArray,
          backgroundColor: 'rgba(255, 206, 86, 0.4)',
          borderColor: 'rgba(255, 206, 86, 1)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Cargar automáticamente el CSV de ejemplo al iniciar la página (opción adicional)
  Papa.parse("Datos para hacer la calculadora - Full 1.csv", { // <-- Path Corrected and simplified
    download: true,
    header: true,
    skipEmptyLines: true,
    delimiter: ",", // Ya es el delimitador por defecto
    complete: function(results) {
      if (results.errors.length > 0) {
        console.error("Error al cargar CSV predefinido: " + results.errors[0].message);
      } else {
        datosCsv = results.data;  // Guarda los datos en la variable global.
        // Preseleccionar "electricidad" y actualizar visualización CSV
        document.getElementById("csvResourceSelect").value = "electricidad";
        updateCSVDisplay();
        // Actualiza la publicación de datos *después* de cargar el CSV
        actualizarPublicacionDatos();
      }
    }
  });

  // Botón Calcular (funcionalidad existente)
  document.getElementById("btnCalcular").addEventListener("click", function() {
    limpiarError();
    let errores = [];

    // --- Electricidad ---
    const baseElectrica = obtenerValor("baseElectrica");
    const factorElectrico = obtenerValor("factorElectrico");
    const mesesElectrico = obtenerValor("mesesElectrico");
    const metodoElectrico = document.getElementById("metodoElectrico").value;
    const arrayElectricoInput = document.getElementById("arrayElectrico").value.trim();
    const consumoLunesViernes = obtenerValor("consumoLunesViernes");
    const consumoFinSemana = obtenerValor("consumoFinSemana");

    if (!validarValor(baseElectrica) || !validarValor(factorElectrico) || !validarValor(mesesElectrico)) {
      errores.push("Los campos de electricidad deben ser números positivos.");
    }
    let consumoElectricoAnual = 0;
    let consumoElectricoPeriodo = 0;
    let arrayElectrico = [];

    if (metodoElectrico === "avanzado" && arrayElectricoInput !== "") {
      arrayElectrico = convertirCadenaAArray(arrayElectricoInput);
      window.arrayElectricoDatos = arrayElectrico.slice();
      if (arrayElectrico.length !== 12) {
        errores.push("Para electricidad (avanzado), ingrese 12 valores separados por comas.");
      } else {
        consumoElectricoAnual = calcularAvanzado(arrayElectrico, 12);
      }
    } else {
      consumoElectricoAnual = calcularBasico(baseElectrica, factorElectrico, 12);
    }
    consumoElectricoPeriodo = (metodoElectrico === "avanzado" && arrayElectrico.length === 12)
      ? calcularAvanzado(arrayElectrico, mesesElectrico)
      : calcularBasico(baseElectrica, factorElectrico, mesesElectrico);

    // Cálculos avanzados de Electricidad
    const factorVacacionalElectrico = obtenerValor("factorVacacionalElectrico") || 1.0;
    const produccionFotovoltaica = obtenerValor("produccionFotovoltaica");
    const autoconsumo = obtenerValor("autoconsumoElectrico");

    let promedioMensualVal = 0, consumoTeoricoAnualVal = 0, consumoRealAnualVal = 0;
    let produccionFotovoltaicaAnualVal = 0, autoconsumoRealDiarioVal = 0;
    if (metodoElectrico === "avanzado" && arrayElectrico.length === 12) {
      promedioMensualVal = promedioMensual(arrayElectrico);
      consumoTeoricoAnualVal = consumoTeoricoAnual(arrayElectrico);
      consumoRealAnualVal = consumoRealAnual(arrayElectrico, factorVacacionalElectrico);
      if (produccionFotovoltaica > 0) {
        produccionFotovoltaicaAnualVal = produccionFotovoltaicaAnual(produccionFotovoltaica);
      }
      autoconsumoRealDiarioVal = autoconsumoRealDiario(promedioMensual(arrayElectrico), autoconsumo);
    }

    // Nuevos cálculos para Lunes a Viernes y Fin de Semana
    let totalDiasConsumo = consumoLunesViernes + consumoFinSemana;
    let porcentajeLunesViernes = totalDiasConsumo > 0 ? ((consumoLunesViernes / totalDiasConsumo) * 100) : 0;
    let porcentajeFinSemana = totalDiasConsumo > 0 ? ((consumoFinSemana / totalDiasConsumo) * 100) : 0;
    let promedioLunesViernes = consumoLunesViernes / 5;
    let promedioFinSemana = consumoFinSemana / 2;

    // --- Agua ---
    const baseAgua = obtenerValor("baseAgua");
    const factorAgua = obtenerValor("factorAgua");
    const mesesAgua = obtenerValor("mesesAgua");
    const metodoAgua = document.getElementById("metodoAgua").value;
    const arrayAguaInput = document.getElementById("arrayAgua").value.trim();
    if (!validarValor(baseAgua) || !validarValor(factorAgua) || !validarValor(mesesAgua)) {
      errores.push("Los campos de agua deben ser números positivos.");
    }
    let consumoAguaAnual = 0;
    let consumoAguaPeriodo = 0;
    if (metodoAgua === "avanzado" && arrayAguaInput !== "") {
      const arrayAgua = convertirCadenaAArray(arrayAguaInput);
      window.arrayAguaDatos = arrayAgua.slice();  // Guarda en variable global
      if (arrayAgua.length !== 12) {
        errores.push("Para agua (avanzado), ingrese 12 valores separados por comas.");
      } else {
        consumoAguaAnual = calcularAvanzado(arrayAgua, 12);
      }
      consumoAguaPeriodo = calcularAvanzado(arrayAgua, mesesAgua);
    } else {
      consumoAguaAnual = calcularBasico(baseAgua, factorAgua, 12);
      consumoAguaPeriodo = calcularBasico(baseAgua, factorAgua, mesesAgua);
    }

    // --- Consumibles de Oficina ---
    const baseOficina = obtenerValor("baseOficina");
    const mesesOficina = obtenerValor("mesesOficina");
    const metodoOficina = document.getElementById("metodoOficina").value;
    const arrayOficinaInput = document.getElementById("arrayOficina").value.trim();
    if (!validarValor(baseOficina) || !validarValor(mesesOficina)) {
      errores.push("Los campos de consumibles de oficina deben ser números positivos.");
    }
    let gastoOficinaAnual = 0;
    let gastoOficinaPeriodo = 0;
    if (metodoOficina === "avanzado" && arrayOficinaInput !== "") {
      const arrayOficina = convertirCadenaAArray(arrayOficinaInput);
      window.arrayOficinaDatos = arrayOficina.slice();  // Guarda en variable global
      if (arrayOficina.length !== 12) {
        errores.push("Para consumibles de oficina (avanzado), ingrese 12 valores separados por comas.");
      } else {
        gastoOficinaAnual = calcularAvanzado(arrayOficina, 12);
      }
      gastoOficinaPeriodo = calcularAvanzado(arrayOficina, mesesOficina);
    } else {
      gastoOficinaAnual = calcularBasico(baseOficina, 1, 12);
      gastoOficinaPeriodo = calcularBasico(baseOficina, 1, mesesOficina);
    }

    // --- Productos de Limpieza ---
    const baseLimpieza = obtenerValor("baseLimpieza");
    const mesesLimpieza = obtenerValor("mesesLimpieza");
    const metodoLimpieza = document.getElementById("metodoLimpieza").value;
    const arrayLimpiezaInput = document.getElementById("arrayLimpieza").value.trim();
    if (!validarValor(baseLimpieza) || !validarValor(mesesLimpieza)) {
      errores.push("Los campos de productos de limpieza deben ser números positivos.");
    }
    let gastoLimpiezaAnual = 0;
    let gastoLimpiezaPeriodo = 0;
    if (metodoLimpieza === "avanzado" && arrayLimpiezaInput !== "") {
      const arrayLimpieza = convertirCadenaAArray(arrayLimpiezaInput);
      window.arrayLimpiezaDatos = arrayLimpieza.slice(); // Guarda en variable global.
      if (arrayLimpieza.length !== 12) {
        errores.push("Para productos de limpieza (avanzado), ingrese 12 valores separados por comas.");
      } else {
        gastoLimpiezaAnual = calcularAvanzado(arrayLimpieza, 12);
      }
      gastoLimpiezaPeriodo = calcularAvanzado(arrayLimpieza, mesesLimpieza);
    } else {
      gastoLimpiezaAnual = calcularBasico(baseLimpieza, 1, 12);
      gastoLimpiezaPeriodo = calcularBasico(baseLimpieza, 1, mesesLimpieza);
    }

    if (errores.length > 0) {
      mostrarError(errores.join(" "));
      return;
    }

    const resultadosElectricidad = {
      anual: consumoElectricoAnual.toFixed(2),
      periodo: consumoElectricoPeriodo.toFixed(2),
      meses: mesesElectrico,
      metodo: metodoElectrico === "avanzado" ? "Avanzado (datos mensuales)" : "Básico (factor estacional)",
      promedioMensual: (arrayElectrico.length === 12) ? promedioMensual(arrayElectrico).toFixed(2) : "",
      consumoTeoricoAnual: (arrayElectrico.length === 12) ? consumoTeoricoAnual(arrayElectrico).toFixed(2) : "",
      consumoRealAnual: (arrayElectrico.length === 12) ? consumoRealAnual(arrayElectrico, factorVacacionalElectrico).toFixed(2) : "",
      produccionFotovoltaicaAnual: (produccionFotovoltaica > 0 && arrayElectrico.length === 12) ? produccionFotovoltaicaAnual(produccionFotovoltaica).toFixed(2) : "",
      autoconsumoRealDiario: (arrayElectrico.length === 12) ? autoconsumoRealDiario(promedioMensual(arrayElectrico), autoconsumo).toFixed(2) : "",
      consumoLunesViernes: consumoLunesViernes.toFixed(2),
      consumoFinSemana: consumoFinSemana.toFixed(2),
      porcentajeLunesViernes: totalDiasConsumo > 0 ? ((consumoLunesViernes / totalDiasConsumo) * 100).toFixed(2) : "0.00",
      porcentajeFinSemana: totalDiasConsumo > 0 ? ((consumoFinSemana / totalDiasConsumo) * 100).toFixed(2) : "0.00",
      promedioLunesViernes: promedioLunesViernes.toFixed(2),
      promedioFinSemana: promedioFinSemana.toFixed(2)
    };
    almacenarResultados("resultadosElectricidad", resultadosElectricidad);

    const resultadosAgua = {
      anual: consumoAguaAnual.toFixed(2),
      periodo: consumoAguaPeriodo.toFixed(2),
      meses: mesesAgua,
      metodo: metodoAgua === "avanzado" ? "Avanzado (datos mensuales)" : "Básico (factor estacional)"
    };
    almacenarResultados("resultadosAgua", resultadosAgua);

    const resultadosOficina = {
      anual: gastoOficinaAnual.toFixed(2),
      periodo: gastoOficinaPeriodo.toFixed(2),
      meses: mesesOficina,
      metodo: metodoOficina === "avanzado" ? "Avanzado (datos mensuales)" : "Básico (valor fijo)"
    };
    almacenarResultados("resultadosOficina", resultadosOficina);

    const resultadosLimpieza = {
      anual: gastoLimpiezaAnual.toFixed(2),
      periodo: gastoLimpiezaPeriodo.toFixed(2),
      meses: mesesLimpieza,
      metodo: metodoLimpieza === "avanzado" ? "Avanzado (datos mensuales)" : "Básico (valor fijo)"
    };
    almacenarResultados("resultadosLimpieza", resultadosLimpieza);

    document.getElementById("resultadoElectrico").innerHTML = `
      <h3>Electricidad - Cálculos Básicos</h3>
      <p>Consumo anual estimado: ${resultadosElectricidad.anual} kWh</p>
      <p>Consumo para el período (${mesesElectrico} meses): ${resultadosElectricidad.periodo} kWh</p>
      <p><em>Método: ${resultadosElectricidad.metodo}</em></p>
    `;
    if (metodoElectrico === "avanzado" && arrayElectrico.length === 12) {
      document.getElementById("resultadoAvanzadoElectrico").innerHTML = `
        <h3>Electricidad - Cálculos Avanzados</h3>
        <p>Consumo Promedio Mensual: ${resultadosElectricidad.promedioMensual} kWh</p>
        <p>Consumo Teórico Anual: ${resultadosElectricidad.consumoTeoricoAnual} kWh</p>
        <p>Consumo Real Anual (ajustado): ${resultadosElectricidad.consumoRealAnual} kWh</p>
        <p>Producción Fotovoltaica Anual: ${resultadosElectricidad.produccionFotovoltaicaAnual} kWh</p>
        <p>Autoconsumo Real Diario: ${resultadosElectricidad.autoconsumoRealDiario} kWh</p>
        <p>Consumo Total Lunes-Viernes: ${resultadosElectricidad.consumoLunesViernes} kWh</p>
        <p>Consumo Total Fin de Semana: ${resultadosElectricidad.consumoFinSemana} kWh</p>
        <p>Porcentaje Lunes-Viernes: ${resultadosElectricidad.porcentajeLunesViernes}%</p>
        <p>Porcentaje Fin de Semana: ${resultadosElectricidad.porcentajeFinSemana}%</p>
        <p>Promedio Diario Lunes-Viernes: ${resultadosElectricidad.promedioLunesViernes} kWh</p>
        <p>Promedio Diario Fin de Semana: ${resultadosElectricidad.promedioFinSemana} kWh</p>
      `;
    } else {
      document.getElementById("resultadoAvanzadoElectrico").innerHTML = "";
    }
    document.getElementById("resultadoAgua").innerHTML = `
      <h3>Agua</h3>
      <p>Consumo anual estimado: ${resultadosAgua.anual} litros</p>
      <p>Consumo para el período (${mesesAgua} meses): ${resultadosAgua.periodo} litros</p>
      <p><em>Método: ${resultadosAgua.metodo}</em></p>
    `;
    document.getElementById("resultadoOficina").innerHTML = `
      <h3>Consumibles de Oficina</h3>
      <p>Gasto anual estimado: €${resultadosOficina.anual}</p>
      <p>Gasto para el período (${mesesOficina} meses): €${resultadosOficina.periodo}</p>
      <p><em>Método: ${resultadosOficina.metodo}</em></p>
    `;
    document.getElementById("resultadoLimpieza").innerHTML = `
      <h3>Productos de Limpieza</h3>
      <p>Gasto anual estimado: €${resultadosLimpieza.anual}</p>
      <p>Gasto para el período (${mesesLimpieza} meses): €${resultadosLimpieza.periodo}</p>
      <p><em>Método: ${resultadosLimpieza.metodo}</em></p>
    `;

    actualizarPublicacionDatos();
  });
    // Cargar automáticamente el CSV de ejemplo al iniciar la página,
  // y *después* de cargarlo, actualizar la publicación de datos.
Papa.parse("Datos para hacer la calculadora - Full 1.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    delimiter: ",",
    complete: function(results) {
      if (results.errors.length > 0) {
        console.error("Error al cargar CSV predefinido: " + results.errors[0].message);
      } else {
        datosCsv = results.data;  // Guarda los datos.
        // Preseleccionar "electricidad" y actualizar visualización CSV.
        document.getElementById("csvResourceSelect").value = "electricidad";
        updateCSVDisplay();

         // **IMPORTANTE:** Llama a  actualizarPublicacionDatos() aquí, 
        // *DENTRO* del callback de Papa.parse, DESPUÉS de cargar el CSV,
        // para asegurar que se inicialicen y muestren las gráficas correctamente.
        actualizarPublicacionDatos();

      }
    }
  });

});