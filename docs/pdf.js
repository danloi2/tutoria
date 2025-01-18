// Función para generar el PDF
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
    .set({
        margin: 10, // Márgenes alrededor del contenido
        filename: 'Cambio_Tutorias.pdf', // Nombre del archivo PDF
        image: { type: 'jpeg', quality: 0.98 }, // Calidad de la imagen generada
        html2canvas: {
            scale: 2, // Aumenta la resolución del contenido renderizado
            scrollX: 0, // Asegura que no haya desplazamiento horizontal
            scrollY: 0,  // Asegura que no haya desplazamiento vertical
            useCORS: true // Permite el uso de recursos de otros dominios
        },
        jsPDF: { 
            unit: 'mm', // Unidades en milímetros
            format: 'a4', // Formato A4
            orientation: 'portrait' // Orientación vertical
        }
    })
    .save() // Genera y guarda el PDF
    .then(() => {
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