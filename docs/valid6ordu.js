 // Función para validar que la diferencia entre hora inicio y hora fin no supere las 6 horas
 function validarHoras(horaInicio, horaFin) {
    const startTime = new Date('1970-01-01T' + horaInicio + 'Z');
    const endTime = new Date('1970-01-01T' + horaFin + 'Z');
    const diff = (endTime - startTime) / (1000 * 60 * 60); // Diferencia en horas
    return diff <= 6;
}