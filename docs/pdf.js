function generarPDF() {
    if (!contenidoParaPDF) {
        alert("Primero debe generar una vista previa.");
        return;
    }

    const elementoTemporal = document.createElement('div');
    elementoTemporal.innerHTML = contenidoParaPDF;
    document.body.appendChild(elementoTemporal);

    const options = {
        margin: 10,
        filename: 'Cambio_Tutorias.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
        .from(elementoTemporal)
        .set(options)
        .outputPdf('blob') // Cambiar para obtener el PDF como Blob
        .then((pdfBlob) => {
            // Guardar el PDF generado en una variable global
            window.pdfBlob = pdfBlob;

            // Mostrar el botón de firma si se requiere
            document.getElementById('btnFirmarPDF').style.display = 'inline-block';

            console.log('PDF generado exitosamente.');
        })
        .catch((error) => {
            console.error('Error al generar el PDF:', error);
        })
        .finally(() => {
            // Limpieza del DOM
            document.body.removeChild(elementoTemporal);
        });
}
