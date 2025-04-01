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

function seleccionarArchivoCertificado() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.p12,.pfx';
        
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


// Función para seleccionar el archivo de certificado
function seleccionarArchivoCertificado() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.p12,.pfx';
        
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

// Función para cargar la librería forge
function cargarForge() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/forge/1.3.1/forge.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('No se pudo cargar la librería forge'));
        document.head.appendChild(script);
    });
}

// Función principal con mejor manejo de errores
async function firmarPDFConCertificadoNavegador(pdfBlob) {
    try {
        if (!pdfBlob) {
            throw new Error('PDF no generado');
        }

        // Paso 1: Seleccionar archivo
        console.log('Iniciando selección de archivo...');
        const certificadoFile = await seleccionarArchivoCertificado();
        console.log('Archivo seleccionado:', certificadoFile.name);

        // Paso 2: Leer archivo como ArrayBuffer
        console.log('Leyendo archivo...');
        const certificadoBuffer = await certificadoFile.arrayBuffer();
        console.log('Tamaño del buffer:', certificadoBuffer.byteLength);

        // Paso 3: Solicitar contraseña
        const password = prompt('Por favor, introduce la contraseña del certificado:');
        if (!password) {
            throw new Error('Contraseña no proporcionada');
        }

        // Paso 4: Importar certificado
        console.log('Iniciando importación del certificado...');
        const certificado = await importarCertificadoP12(certificadoBuffer, password);
        console.log('Certificado importado exitosamente');

        // Paso 5: Generar hash del PDF
        console.log('Generando hash del PDF...');
        const pdfBytes = await pdfBlob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBytes);
        console.log('Hash generado');

        // Paso 6: Firmar
        console.log('Firmando documento...');
        const firma = await firmarHash(hashBuffer, certificado);
        console.log('Documento firmado');

        // Paso 7: Incrustar firma
        console.log('Incrustando firma en PDF...');
        const pdfFirmadoBlob = await incrustarFirmaEnPDF(pdfBlob, firma);
        console.log('Firma incrustada');

        // Paso 8: Descargar
        const url = URL.createObjectURL(pdfFirmadoBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Cambio_Tutorias_Firmado.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Proceso completado con éxito');
    } catch (error) {
        console.error('Error detallado:', {
            mensaje: error.message,
            stack: error.stack,
            tipo: error.name
        });
        alert(`Error en el proceso: ${error.message}\n\nPor favor, revise la consola para más detalles.`);
    }
}

async function importarCertificadoP12(buffer, password) {
    try {
        // Verificar forge
        if (typeof forge === 'undefined') {
            console.log('Cargando librería forge...');
            await cargarForge();
            console.log('Forge cargado correctamente');
        }

        // Convertir buffer
        console.log('Convirtiendo buffer del certificado...');
        const asn1Buffer = new Uint8Array(buffer);
        
        // Crear buffer de forge
        console.log('Creando buffer de forge...');
        const forgeBuffer = forge.util.createBuffer(asn1Buffer);
        
        // Decodificar ASN.1
        console.log('Decodificando ASN.1...');
        const asn1 = forge.asn1.fromDer(forgeBuffer);
        
        // Parsear PKCS#12
        console.log('Parseando PKCS#12...');
        const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);
        
        // Obtener bags
        console.log('Obteniendo bags del certificado...');
        const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        console.log('Bags obtenidos:', bags);
        
        if (!bags || !bags[forge.pki.oids.pkcs8ShroudedKeyBag]) {
            throw new Error('No se encontraron las claves en el certificado');
        }

        const privateKeyBag = bags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
        if (!privateKeyBag || !privateKeyBag.key) {
            throw new Error('No se pudo extraer la clave privada');
        }

        // Extraer clave privada
        console.log('Extrayendo clave privada...');
        const rsaPrivateKey = privateKeyBag.key;
        
        // Convertir la clave a formato PKCS#8
        console.log('Convirtiendo a formato PKCS#8...');
        const rsaAsn1 = forge.pki.privateKeyToAsn1(rsaPrivateKey);
        const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaAsn1);
        const der = forge.asn1.toDer(privateKeyInfo);
        
        // Convertir a ArrayBuffer
        console.log('Preparando clave para WebCrypto...');
        const bytes = der.getBytes();
        const privateKeyArrayBuffer = new ArrayBuffer(bytes.length);
        const view = new Uint8Array(privateKeyArrayBuffer);
        for (let i = 0; i < bytes.length; i++) {
            view[i] = bytes.charCodeAt(i);
        }

        // Importar a WebCrypto
        console.log('Importando clave a WebCrypto...');
        return await crypto.subtle.importKey(
            'pkcs8',
            privateKeyArrayBuffer,
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: { name: 'SHA-256' }
            },
            false,
            ['sign']
        );
    } catch (error) {
        console.error('Error detallado en importarCertificadoP12:', {
            mensaje: error.message,
            stack: error.stack,
            tipo: error.name
        });
        throw new Error(`Error en la importación del certificado: ${error.message}`);
    }
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
    try {
        const { PDFDocument } = PDFLib;
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
