let contenidoParaPDF = ""; // Variable global para almacenar el contenido previsualizado

function generarImpresion() {
    const profesor = document.getElementById('profesor').value;
    const fechaModifica = document.getElementById('fechaModifica').value;
    const horaModificaInicio = document.getElementById('horaModificaInicio').value;
    const horaModificaFin = document.getElementById('horaModificaFin').value;
    const fechaNueva = document.getElementById('fechaNueva').value;
    const horaNuevaInicio = document.getElementById('horaNuevaInicio').value;
    const horaNuevaFin = document.getElementById('horaNuevaFin').value;

    // Validar que la diferencia de horas no sea mayor a 6
    if (!validarHoras(horaModificaInicio, horaModificaFin) || !validarHoras(horaNuevaInicio, horaNuevaFin)) {
        alert("La diferencia entre la hora de inicio y fin no puede ser mayor a 6 horas.");
        return;
    }

    const fechaActualLarga = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const fechaActualLargaEuskara = new Date().toLocaleDateString('eu', { year: 'numeric', month: 'long', day: 'numeric' });

    contenidoParaPDF = `
         <link rel="stylesheet" href="style.css">
         <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
        <img src="https://www.ehu.eus/documents/2947353/2967241/blanco_pequeno.jpg" alt="Logo UPV/EHU" style="width: 10%;">
        <h1>Tutoretza Ordutegiaren Aldaketa / Formulario de Cambio de Tutorías</h1>
    </div>
        <div>
            <div class="output">
             <h1>Tutoretza Ordutegiaren Aldaketa / Formulario de Cambio de Tutorías</h1>
             <br>
                <h3>Argitaratzeko kopia / Ejemplar para hacer público</h3>
                <p><strong>Irakaslea<br>Profesor:</strong> ${profesor}</p>
              <div class="column-container">
    <div class="column">
        <h4>Aldatutako Data eta Ordua<br>Fecha y Hora que se Modifica</h4>
        <p>Data / Fecha: ${fechaModifica}</p>
        <p>Ordua / Hora: ${horaModificaInicio} - ${horaModificaFin}</p>
    </div>
    <div class="column">
        <h4>Ordutegi Berria<br>Nuevo Horario</h4>
        <p>Data / Fecha: ${fechaNueva}</p>
        <p>Ordua / Hora: ${horaNuevaInicio} - ${horaNuevaFin}</p>
    </div>
</div>
                <center>
                    <p>
                        Donostian, ${fechaActualLargaEuskara}
                        <br>
                        En Donostia-San Sebastián, ${fechaActualLarga}
                    </p>
                    <br>
                    <p>Firma y Sello</p>
                </center>
            </div>
        </div>
        <div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
        <img src="https://www.ehu.eus/documents/2947353/2967241/blanco_pequeno.jpg" alt="Logo UPV/EHU" style="width: 10%;">
        <h1>Tutoretza Ordutegiaren Aldaketa / Formulario de Cambio de Tutorías</h1>
    </div>
            <div class="output">
                         <br>
                <h3>ikastegi edo sailarako kopia / Ejemplar para el centro/departamento</h3>
                <p><strong>Irakaslea<br>Profesor:</strong> ${profesor}</p>
                <div class="column-container">
    <div class="column">
        <h4>Aldatutako Data eta Ordua<br>Fecha y Hora que se Modifica</h4>
        <p>Data / Fecha: ${fechaModifica}</p>
        <p>Ordua / Hora: ${horaModificaInicio} - ${horaModificaFin}</p>
    </div>
    <div class="column">
        <h4>Ordutegi Berria<br>Nuevo Horario</h4>
        <p>Data / Fecha: ${fechaNueva}</p>
        <p>Ordua / Hora: ${horaNuevaInicio} - ${horaNuevaFin}</p>
    </div>
</div>
                <center>
                    <p>
                        Donostian, ${fechaActualLargaEuskara}
                        <br>
                        En Donostia-San Sebastián, ${fechaActualLarga}
                    </p>
                </center>
            </div>
        </div>
    `;

    document.getElementById('btnPDF').style.display = 'inline-block';
    const nuevaPestaña = window.open("", "_blank");
    nuevaPestaña.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vista Previa</title>
            
        </head>
        <body>${contenidoParaPDF}</body>
        </html>
    `);
    
    nuevaPestaña.document.close();

}
