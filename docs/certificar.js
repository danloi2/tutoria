// Función para seleccionar un archivo de imagen
function seleccionarArchivoImagen() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.png';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.type !== 'image/png') {
                    reject(new Error('Por favor, seleccione un archivo PNG válido'));
                    return;
                }
                console.log("Archivo de imagen seleccionado correctamente:", file);
                resolve(file);
            } else {
                reject(new Error('No se seleccionó ningún archivo de imagen'));
            }
        };

        input.click();
    });
}

// Función para incrustar la imagen en el PDF
async function incrustarImagenEnPDF(pdfBlob, imagenBlob) {
    try {
        const { PDFDocument } = PDFLib;

        // Verificar que pdfBlob e imagenBlob sean válidos
        if (!pdfBlob || !(pdfBlob instanceof Blob)) {
            throw new Error('El PDF no es válido o no es un objeto Blob.');
        }

        if (!imagenBlob || !(imagenBlob instanceof Blob)) {
            throw new Error('La imagen no es válida o no es un objeto Blob.');
        }

        // Depurar el tipo de pdfBlob e imagenBlob
        console.log("Tipo de archivo PDF:", pdfBlob.type);
        console.log("Tipo de archivo Imagen:", imagenBlob.type);

        // Cargar el PDF
        const pdfBytes = await pdfBlob.arrayBuffer();
        if (!pdfBytes || pdfBytes.byteLength === 0) {
            throw new Error('El PDF está vacío o no se pudo cargar correctamente.');
        }

        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        
        if (pages.length === 0) {
            throw new Error('El PDF no contiene páginas.');
        }

        const lastPage = pages[pages.length - 1];
        const { width, height } = lastPage.getSize();

        // Cargar la imagen
        const imagenBytes = await imagenBlob.arrayBuffer();
        console.log("Bytes de la imagen cargados correctamente:", imagenBytes.byteLength);

        if (imagenBytes.byteLength === 0) {
            throw new Error("La imagen está vacía o no se pudo cargar correctamente.");
        }

        // Incrustar la imagen
        const imagenPng = await pdfDoc.embedPng(imagenBytes);

        // Agregar la imagen en la última página
        lastPage.drawImage(imagenPng, {
            x: (width - 90) / 2, // Centra la imagen horizontalmente
            y: (height - -150) / 2, // Centra la imagen verticalmente
            width: 100,
            height: 100,
        });

        // Guardar el PDF modificado
        const pdfFirmadoBytes = await pdfDoc.save();
        return new Blob([pdfFirmadoBytes], { type: 'application/pdf' });
    } catch (error) {
        console.error('Error al incrustar la imagen en el PDF:', error.message, error.stack);
        throw error;
    }
}

async function firmarPDFConImagen(pdfFile) {
    try {
        // Verificar si tenemos un PDF válido
        if (!window.pdfBlobParaFirma) {
            throw new Error('No se ha generado ningún PDF para firmar.');
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

        console.log("PDF firmado descargado exitosamente.");
    } catch (error) {
        console.error("Error en el proceso:", error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}