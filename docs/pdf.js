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
        .outputPdf('blob')
        .then((pdfBlob) => {
            // Guardar el PDF generado en una variable global
            window.pdfBlob = pdfBlob;

            // Mostrar el botón de firma
            document.getElementById('btnFirmarPDF').style.display = 'inline-block';

            // Descargar el PDF
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = options.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('PDF generado exitosamente.');
        })
        .catch((error) => {
            console.error('Error al generar el PDF:', error);
            alert('Error al generar el PDF: ' + error.message);
        })
        .finally(() => {
            // Limpieza del DOM
            document.body.removeChild(elementoTemporal);
        });
}