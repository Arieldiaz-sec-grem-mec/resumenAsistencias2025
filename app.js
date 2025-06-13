async function obtenerEstadisticas() {
    try {
        const url = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjhLz1BO5uab87jgVOFLpmBpZ23sYUpvWkD7iWV1WCkwaeQv2_7XEu7s6kdhUvcamFFEGxZ4S1AbyLNQgFF2KZBrPYUv6p_i5jeEEKm6NC35FgpCCjmrj6u26oE_17OJYGVBhM3fLe3U6WxihPvL_C8JD-SU1HKoNQE77bdtSg7CCSV5jF4E6hBH-so7Zpi8XsgJJIV1GvrGQ7b-ZbMn4_VBw_Ea9SzYuPjSne0S3ZlY93UV9M-ZKzqRT-1m7RM2f8EWjHsilfkejeuU_BzOL7EJ0FJ_Q&lib=MUfngVQZI-VtDgiXId2WKgXQNFQG3epjV';
        const response = await fetch(url);
        const data = await response.json();

        // Columnas que son datos fijos del alumno
        const columnasFijas = ['APELLIDO', 'NOMBRE', 'CURSO', 'EMPRESA', 'DNI', 'TELEFONO', 'EMAIL'];

        // Función para obtener las fechas de un registro
        const obtenerFechasAsistencia = (registro) => {
            return Object.keys(registro).filter(key => !columnasFijas.includes(key));
        };

        // Agrupar por cursos
        const cursos = [...new Set(data.data.map(item => item.CURSO))].sort();

        console.log('\n======= RESUMEN DE ASISTENCIAS =======');

        cursos.forEach(curso => {
            console.log(`\n======================= ${curso} =======================`);
            const alumnosCurso = data.data.filter(item => item.CURSO === curso);

            // Obtener todas las fechas para este curso
            const fechasCurso = new Set();
            alumnosCurso.forEach(alumno => {
                obtenerFechasAsistencia(alumno).forEach(fecha => fechasCurso.add(fecha));
            });

            // Convertir las fechas a objetos Date para ordenarlas
            const fechasOrdenadas = [...fechasCurso]
                .sort((a, b) => new Date(a) - new Date(b));

            // Mostrar asistencias por fecha
            fechasOrdenadas.forEach(fecha => {
                const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                const asistencias = alumnosCurso.reduce((acc, alumno) => {
                    const estado = alumno[fecha] || 'No registrado';
                    acc[estado] = (acc[estado] || 0) + 1;
                    return acc;
                }, {});

                console.log(`\nFecha: ${fechaFormateada}`);
                console.log(`Total alumnos: ${alumnosCurso.length}`);
                Object.entries(asistencias).forEach(([estado, cantidad]) => {
                    const porcentaje = ((cantidad/alumnosCurso.length)*100).toFixed(1);
                    const icono = estado === 'Presente' ? '✅' : 
                                estado === 'Ausente' ? '❌' : '⚠️';
                    console.log(`${icono} ${estado}: ${cantidad} (${porcentaje}%)`);
                });
            });

            // Resumen del curso
            const empresas = [...new Set(alumnosCurso.map(a => a.EMPRESA))].sort();
            console.log(`\nEmpresas en ${curso}:`);
            empresas.forEach(empresa => {
                const count = alumnosCurso.filter(a => a.EMPRESA === empresa).length;
                console.log(`- ${empresa}: ${count} alumnos`);
            });
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// ...existing code...

async function obtenerAusentes() {
    try {
        const url = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjhLz1BO5uab87jgVOFLpmBpZ23sYUpvWkD7iWV1WCkwaeQv2_7XEu7s6kdhUvcamFFEGxZ4S1AbyLNQgFF2KZBrPYUv6p_i5jeEEKm6NC35FgpCCjmrj6u26oE_17OJYGVBhM3fLe3U6WxihPvL_C8JD-SU1HKoNQE77bdtSg7CCSV5jF4E6hBH-so7Zpi8XsgJJIV1GvrGQ7b-ZbMn4_VBw_Ea9SzYuPjSne0S3ZlY93UV9M-ZKzqRT-1m7RM2f8EWjHsilfkejeuU_BzOL7EJ0FJ_Q&lib=MUfngVQZI-VtDgiXId2WKgXQNFQG3epjV';
        const response = await fetch(url);
        const data = await response.json();

        const columnasFijas = ['APELLIDO', 'NOMBRE', 'CURSO', 'EMPRESA', 'DNI', 'TELEFONO', 'EMAIL'];
        
        console.log('\n============================ REGISTRO DE AUSENCIAS ============================');

        // Agrupar por cursos
        const cursos = [...new Set(data.data.map(item => item.CURSO))].sort();

        cursos.forEach(curso => {
            const alumnosCurso = data.data.filter(item => item.CURSO === curso);
            const fechasAsistencia = Object.keys(alumnosCurso[0]).filter(key => !columnasFijas.includes(key));
            
            // Buscar ausentes en este curso
            const ausentesCurso = alumnosCurso.filter(alumno => 
                fechasAsistencia.some(fecha => alumno[fecha] === 'Ausente')
            );

            if (ausentesCurso.length > 0) {
                console.log(`\n=== ${curso} ===`);
                
                ausentesCurso.forEach(alumno => {
                    console.log(`\nAlumno: ${alumno.NOMBRE} ${alumno.APELLIDO}`);
                    console.log(`Empresa: ${alumno.EMPRESA}`);
                    console.log(`DNI: ${alumno.DNI}`);
                    console.log(`Contacto: ${alumno.TELEFONO} | ${alumno.EMAIL}`);
                    
                    // Mostrar fechas de ausencia
                    console.log('Ausencias:');
                    fechasAsistencia.forEach(fecha => {
                        if (alumno[fecha] === 'Ausente') {
                            const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR');
                            console.log(`❌ ${fechaFormateada}`);
                        }
                    });
                    console.log('----------------------------------------');
                });
            }
        });

        // Resumen general de ausencias
        console.log('\n=================================== RESUMEN DE AUSENCIAS ===================================');
        let totalAusentes = 0;
        cursos.forEach(curso => {
            const alumnosCurso = data.data.filter(item => item.CURSO === curso);
            const fechasAsistencia = Object.keys(alumnosCurso[0]).filter(key => !columnasFijas.includes(key));
            const ausentesCurso = alumnosCurso.filter(alumno => 
                fechasAsistencia.some(fecha => alumno[fecha] === 'Ausente')
            );
            if (ausentesCurso.length > 0) {
                console.log(`${curso}: ${ausentesCurso.length} alumnos con ausencias`);
                totalAusentes += ausentesCurso.length;
            }
        });
        console.log(`\nTotal de alumnos con ausencias: ${totalAusentes}`);

    } catch (error) {
        console.error('Error al obtener ausentes:', error);
    }
}

// ...existing code...

async function obtenerAusenciasPorEmpresa() {
    try {
        const url = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjhLz1BO5uab87jgVOFLpmBpZ23sYUpvWkD7iWV1WCkwaeQv2_7XEu7s6kdhUvcamFFEGxZ4S1AbyLNQgFF2KZBrPYUv6p_i5jeEEKm6NC35FgpCCjmrj6u26oE_17OJYGVBhM3fLe3U6WxihPvL_C8JD-SU1HKoNQE77bdtSg7CCSV5jF4E6hBH-so7Zpi8XsgJJIV1GvrGQ7b-ZbMn4_VBw_Ea9SzYuPjSne0S3ZlY93UV9M-ZKzqRT-1m7RM2f8EWjHsilfkejeuU_BzOL7EJ0FJ_Q&lib=MUfngVQZI-VtDgiXId2WKgXQNFQG3epjV';
        const response = await fetch(url);
        const data = await response.json();

        const columnasFijas = ['APELLIDO', 'NOMBRE', 'CURSO', 'EMPRESA', 'DNI', 'TELEFONO', 'EMAIL'];
        
        console.log('\n=================================== AUSENCIAS POR EMPRESA ===================================');

        // Obtener lista de empresas
        const empresas = [...new Set(data.data.map(item => item.EMPRESA))].sort();

        empresas.forEach(empresa => {
            const alumnosEmpresa = data.data.filter(item => item.EMPRESA === empresa);
            const ausentesEmpresa = alumnosEmpresa.filter(alumno => {
                const fechasAsistencia = Object.keys(alumno).filter(key => !columnasFijas.includes(key));
                return fechasAsistencia.some(fecha => alumno[fecha] === 'Ausente');
            });

            if (ausentesEmpresa.length > 0) {
                console.log(`\n====== ${empresa} ======`);
                console.log(`Total de ausentes: ${ausentesEmpresa.length}`);

                ausentesEmpresa.forEach(alumno => {
                    console.log('\n----------------------------------------');
                    console.log(`Nombre: ${alumno.NOMBRE} ${alumno.APELLIDO}`);
                    console.log(`Curso: ${alumno.CURSO}`);
                    console.log(`DNI: ${alumno.DNI}`);
                    console.log(`Contacto: ${alumno.TELEFONO} | ${alumno.EMAIL}`);
                    
                    // Mostrar fechas de ausencia
                    console.log('Ausencias:');
                    Object.keys(alumno)
                        .filter(key => !columnasFijas.includes(key) && alumno[key] === 'Ausente')
                        .forEach(fecha => {
                            const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR');
                            console.log(`❌ ${fechaFormateada}`);
                        });
                });
            }
        });

        // Resumen general
        console.log('\n=================================== RESUMEN POR EMPRESA ===================================');
        let totalGeneral = 0;
        empresas.forEach(empresa => {
            const alumnosEmpresa = data.data.filter(item => item.EMPRESA === empresa);
            const ausentesEmpresa = alumnosEmpresa.filter(alumno => {
                const fechasAsistencia = Object.keys(alumno).filter(key => !columnasFijas.includes(key));
                return fechasAsistencia.some(fecha => alumno[fecha] === 'Ausente');
            });
            if (ausentesEmpresa.length > 0) {
                const porcentaje = ((ausentesEmpresa.length / alumnosEmpresa.length) * 100).toFixed(1);
                console.log(`${empresa}: ${ausentesEmpresa.length} ausentes de ${alumnosEmpresa.length} alumnos (${porcentaje}%)`);
                totalGeneral += ausentesEmpresa.length;
            }
        });
        console.log(`\nTotal general de alumnos con ausencias: ${totalGeneral}`);

    } catch (error) {
        console.error('Error al obtener ausencias por empresa:', error);
    }
}

// Modificar las llamadas a las funciones
obtenerEstadisticas();
obtenerAusentes();
obtenerAusenciasPorEmpresa();
