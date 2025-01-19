async function firmarPDFConCertificadoNavegador(pdfBlob) {
    try {
        // Paso 1: Generar el hash del contenido del PDF
        const pdfBytes = await pdfBlob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBytes);

        // Paso 2: Solicitar acceso al certificado digital desde el navegador
        const certificado = await solicitarCertificadoDelSistema();
        const firma = await firmarHash(hashBuffer, certificado);

        // Paso 3: Incrustar la firma en el PDF
        const pdfFirmadoBlob = await incrustarFirmaEnPDF(pdfBlob, firma);

        // Descargar el PDF firmado
        const url = URL.createObjectURL(pdfFirmadoBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'PDF_Firmado.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('PDF firmado con éxito.');
    } catch (error) {
        console.error('Error al firmar el PDF:', error);
    }
}

// Función para solicitar acceso al certificado desde el sistema
async function solicitarCertificadoDelSistema() {
    const cert = await navigator.credentials.get({
        publicKey: {
            challenge: new Uint8Array([0x00, 0x01, 0x02, 0x03]), // Reto para evitar ataques de repetición
            timeout: 60000,
            allowCredentials: [], // Puede configurarse para seleccionar un certificado específico
            userVerification: "preferred",
        },
    });

    if (!cert) throw new Error("No se seleccionó ningún certificado.");
    return cert;
}

// Función para firmar el hash utilizando el certificado seleccionado
async function firmarHash(hashBuffer, certificado) {
    // Usar el método de firma del certificado
    const firma = await certificado.sign(hashBuffer);
    return new Uint8Array(firma);
}

// Función para incrustar la firma en el PDF
async function incrustarFirmaEnPDF(pdfBlob, firma) {
    const { PDFDocument } = PDFLib;

    // Cargar el PDF original
    const pdfDoc = await PDFDocument.load(await pdfBlob.arrayBuffer());

    // Añadir un campo de firma (opcional)
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();
    const signatureField = pdfDoc.addSignatureField('Firma');
    signatureField.addToPage(lastPage, { x: width - 200, y: 50, width: 150, height: 30 });

    // Incrustar la firma
    signatureField.setSignature(firma);

    // Guardar el PDF firmado
    const pdfFirmadoBytes = await pdfDoc.save();
    return new Blob([pdfFirmadoBytes], { type: 'application/pdf' });
}
