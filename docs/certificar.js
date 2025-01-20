async function firmarPDFConCertificadoNavegador(pdfBlob) {
    try {
        if (!pdfBlob) {
            alert('Por favor, genera primero el PDF antes de firmarlo');
            return;
        }

        // Paso 1: Permitir al usuario seleccionar el archivo .p12
        const certificadoFile = await seleccionarArchivoCertificado();
        const certificadoBuffer = await certificadoFile.arrayBuffer();
        
        // Paso 2: Solicitar contraseña del certificado
        const password = prompt('Por favor, introduce la contraseña del certificado:');
        if (!password) {
            throw new Error('Se requiere la contraseña del certificado');
        }

        // Paso 3: Importar el certificado P12
        const certificado = await importarCertificadoP12(certificadoBuffer, password);

        // Paso 4: Generar el hash del contenido del PDF
        const pdfBytes = await pdfBlob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBytes);

        // Paso 5: Firmar el hash con el certificado importado
        const firma = await firmarHash(hashBuffer, certificado);

        // Paso 6: Incrustar la firma en el PDF
        const pdfFirmadoBlob = await incrustarFirmaEnPDF(pdfBlob, firma);

        // Descargar el PDF firmado
        const url = URL.createObjectURL(pdfFirmadoBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Cambio_Tutorias_Firmado.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('PDF firmado con éxito.');
    } catch (error) {
        console.error('Error al firmar el PDF:', error);
        alert('Error al firmar el PDF: ' + error.message);
    }
}

function seleccionarArchivoCertificado() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.p12,.pfx';  // Aceptar tanto .p12 como .pfx (mismo formato)
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                resolve(file);
            } else {
                reject(new Error('No se seleccionó ningún archivo'));
            }
        };
        
        input.click();
    });
}

async function importarCertificadoP12(buffer, password) {
    try {
        // Primero necesitamos importar la librería forge
        if (typeof forge === 'undefined') {
            await cargarForge();
        }

        // Convertir el ArrayBuffer a Uint8Array
        const asn1Buffer = new Uint8Array(buffer);
        console.log('Buffer del archivo .p12:', asn1Buffer);

        // Parsear el archivo P12
        const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(asn1Buffer));
        console.log('ASN1 Decodificado:', p12Asn1);

        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
        console.log('Contenido del PKCS#12:', p12);

        // Obtener la clave privada y el certificado
        const keyData = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0];
        console.log('Clave privada extraída:', keyData);

        const certData = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
        console.log('Certificado extraído:', certData);

        // Convertir la clave privada a formato PKCS#8 DER
        const privateKeyDer = forge.pki.wrapRsaPrivateKey(keyData.key);
        const privateKeyBuffer = forge.asn1.toDer(privateKeyDer).getBytes();
        console.log('Clave privada en formato PKCS#8 DER:', privateKeyBuffer);

        // Convertir a ArrayBuffer para WebCrypto
        const privateKeyArrayBuffer = str2ab(privateKeyBuffer);
        console.log('Clave privada como ArrayBuffer:', privateKeyArrayBuffer);

        // Importar la clave privada en WebCrypto
        const privateKey = await crypto.subtle.importKey(
            'pkcs8',
            privateKeyArrayBuffer,
            {
                name: 'RSASSA-PKCS1-v1_5',
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: { name: 'SHA-256' }
            },
            false,
            ['sign']
        );
        

        return privateKey;
    } catch (error) {
        console.error('Error específico en la importación del certificado:', error);
        throw new Error('Detalles: ' + error.message);
    }
}

// Función auxiliar para cargar forge
function cargarForge() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/forge/1.3.1/forge.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('No se pudo cargar la librería forge'));
        document.head.appendChild(script);
    });
}

// Función auxiliar para convertir string a ArrayBuffer
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

// Función para firmar el hash
async function firmarHash(hashBuffer, certificado) {
    try {
        const firma = await crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            certificado,
            hashBuffer
        );
        return new Uint8Array(firma);
    } catch (error) {
        console.error('Error al firmar:', error);
        throw new Error('No se pudo firmar el documento con el certificado proporcionado');
    }
}

// Función para incrustar la firma en el PDF
async function incrustarFirmaEnPDF(pdfBlob, firma) {
    const { PDFDocument } = PDFLib;

    try {
        const pdfDoc = await PDFDocument.load(await pdfBlob.arrayBuffer());
        
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];
        const { width, height } = lastPage.getSize();
        const signatureField = pdfDoc.addSignatureField('Firma');
        signatureField.addToPage(lastPage, { 
            x: width - 200, 
            y: 50, 
            width: 150, 
            height: 30 
        });

        signatureField.setSignature(firma);

        const pdfFirmadoBytes = await pdfDoc.save();
        return new Blob([pdfFirmadoBytes], { type: 'application/pdf' });
    } catch (error) {
        console.error('Error al incrustar la firma en el PDF:', error);
        throw new Error('No se pudo incrustar la firma en el PDF');
    }
}
