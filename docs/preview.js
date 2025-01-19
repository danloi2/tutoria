let contenidoParaPDF = ""; // Variable global para almacenar el contenido previsualizado

function generarImpresion() {
  const profesor = document.getElementById("profesor").value;
  const fechaModifica = document.getElementById("fechaModifica").value;
  const horaModificaInicio =
    document.getElementById("horaModificaInicio").value;
  const horaModificaFin = document.getElementById("horaModificaFin").value;
  const fechaNueva = document.getElementById("fechaNueva").value;
  const horaNuevaInicio = document.getElementById("horaNuevaInicio").value;
  const horaNuevaFin = document.getElementById("horaNuevaFin").value;

  // Validar que la diferencia de horas no sea mayor a 6
  if (
    !validarHoras(horaModificaInicio, horaModificaFin) ||
    !validarHoras(horaNuevaInicio, horaNuevaFin)
  ) {
    alert(
      "La diferencia entre la hora de inicio y fin no puede ser mayor a 6 horas."
    );
    return;
  }

  const fechaActualLarga = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const fechaActualLargaEuskara = new Date().toLocaleDateString("eu", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  contenidoParaPDF = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
            <img src="img/ehu.jpg" alt="Logo UPV/EHU" style="width: 10%;">
            <h1>Tutoretza Ordutegiaren Aldaketa /  <span class="grisa">Formulario de Cambio de Tutorías</span></h1>
            <br>
        </div>
        <div class="output"> 
            <h3>Argitaratzeko kopia /  <span class="grisa">Ejemplar para hacer público</span></h3>
            <p><strong>Irakaslea /  <span class="grisa">Profesor:</span></strong> ${profesor}</p>
            <table>
                <thead>
                    <tr>
                        <th>ALDATUTAKO DATA ETA ORDUA<br> <span class="grisa">FECHA Y HORA CANCELADA</span></th>
                        <th>DATA ETA ORDUTEGI BERRIA<br> <span class="grisa">FECHA Y HORA NUEVA</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Data /  <span class="grisa">Fecha:</span> <br> <span class="aldatuta">${fechaModifica}</span></td>
                        <td>Data /  <span class="grisa">Fecha:</span> <br> <span class="berria"> ${fechaNueva}</span></td>            
                    </tr>
                    <tr>
                        <td>Ordua /  <span class="grisa">Hora: </span><br> <span class="aldatuta">${horaModificaInicio} - ${horaModificaFin}</span></td>
                        <td>Ordua /  <span class="grisa">Hora: </span> <br> <span class="berria"> ${horaNuevaInicio} - ${horaNuevaFin}</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <center><p>Ikastegiaren edo sailaren oniritzia /  <span class="grisa">Visto bueno de centro o del departamento:</span></p></center>
        <center><p>Sinadura eta zigilua /  <span class="grisa">Firma y sello:</span></p></center>
        
        <center><p>Donostian, ${fechaActualLargaEuskara}<br><span class="grisa">En Donostia-San Sebastián, ${fechaActualLarga}</span></p></center>

        <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
            <img src="img/ehu.jpg" alt="Logo UPV/EHU" style="width: 10%;">
            <h1>Tutoretza Ordutegiaren Aldaketa /  <span class="grisa">Formulario de Cambio de Tutorías</span></h1>
            <br>
        </div>
        <div class="output"> 
            <h3><span class="grisa">ikastegi edo sailarako kopia / Ejemplar para el centro o departamento</span></h3>
            <p><strong>Irakaslea /  <span class="grisa">Profesor:</span></strong> ${profesor}</p>
            <table>
                <thead>
                    <tr>
                        <th>ALDATUTAKO DATA ETA ORDUA<br> <span class="grisa">FECHA Y HORA CANCELADA</span></th>
                        <th>DATA ETA ORDUTEGI BERRIA<br> <span class="grisa">FECHA Y HORA NUEVA</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Data /  <span class="grisa">Fecha:</span> <br> <span class="aldatuta">${fechaModifica}</span></td>
                        <td>Data /  <span class="grisa">Fecha:</span> <br> <span class="berria"> ${fechaNueva}</span></td>            
                    </tr>
                    <tr>
                        <td>Ordua /  <span class="grisa">Hora: </span><br> <span class="aldatuta">${horaModificaInicio} - ${horaModificaFin}</span></td>
                        <td>Ordua /  <span class="grisa">Hora: </span> <br> <span class="berria"> ${horaNuevaInicio} - ${horaNuevaFin}</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <center><p>Donostian, ${fechaActualLargaEuskara}<br><span class="grisa">En Donostia-San Sebastián, ${fechaActualLarga}</span></p></center>

        <div class="output">
            <p class="small">
            Tutoretzen betetze-erregimena Ikasketen Gestiorako Araudia  art. 40.3 Ezarritako tutoretza erregimena ikasturte osoan mantendu beharko da, azken deialdia egin eta burutu arte. Tutoretza ordutegiak lauhileko bakoitza hasi baino lehen argitaratuko dira eta, beroriek aldatu ahal izateko, ikastegiko zuzendaritzaren edo dekanotzaren baimena beharko da eta, gutxien dela, aldaketak indarrean jarri baino 3 eskola egun lehenago argitaratu beharko dira.
            <br>
            <span class="grisa">Régimen de cumplimiento de las tutorías:Normativa  Gestión Académica. Art. 40. 3 El régimen de tutorías establecido se mantendrá durante la totalidad del curso, hasta la realización de la última convocatoria.  El horario de tutorías se hará público antes del comienzo de cada cuatrimestre y cualquier modificación deberá ser autorizada por la Dirección/Decanato del Centro y publicada con al menos 3 días lectivos de antelación.</span>
            </p>
        </div>
    ;   
`;

  document.getElementById("btnPDF").style.display = "inline-block";
  const nuevaPestaña = window.open("", "_blank");
  nuevaPestaña.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="style.css">
            <title>Vista Previa</title>
            
        </head>
        <body>${contenidoParaPDF}</body>
        </html>
    `);

  nuevaPestaña.document.close();
}
