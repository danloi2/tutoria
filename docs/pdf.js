// pdf.js - Función de generación del PDF
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
            // Guardar el Blob directamente en una variable global
            window.pdfBlobParaFirma = pdfBlob;
            console.log('PDF guardado en variable global:', window.pdfBlobParaFirma);

            // Mostrar el botón de firma
            const btnFirmar = document.getElementById('btnFirmarPDF');
            btnFirmar.style.display = 'inline-block';
            console.log('Botón de firma visible');

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
            document.body.removeChild(elementoTemporal);
        });
}

// certificar.js - Función para firmar el PDF
async function firmarPDFConImagen() {
    try {
        console.log('Iniciando proceso de firma...');
        console.log('Estado del PDF:', window.pdfBlobParaFirma);

        // Verificar si existe el PDF
        if (!window.pdfBlobParaFirma) {
            throw new Error('No se ha generado ningún PDF para firmar. Por favor, genere primero el PDF.');
        }

        // Verificar que sea un Blob válido
        if (!(window.pdfBlobParaFirma instanceof Blob)) {
            throw new Error('El PDF almacenado no es válido. Por favor, genere el PDF nuevamente.');
        }

        console.log("Seleccionando archivo de imagen...");
        const archivoImagen = await seleccionarArchivoImagen();

        console.log("Archivo de imagen recibido:", archivoImagen);

        // Incrustar la imagen en el PDF
        console.log("Incrustando imagen en el PDF...");
        const pdfFirmadoBlob = await incrustarImagenEnPDF(window.pdfBlobParaFirma, archivoImagen);
        console.log("Imagen incrustada exitosamente.");

        // Descargar el PDF firmado
        const url = URL.createObjectURL(pdfFirmadoBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "documento_firmado.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Limpiar la variable global
        window.pdfBlobParaFirma = null;

        console.log("PDF firmado descargado exitosamente.");
    } catch (error) {
        console.error("Error en el proceso:", error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}