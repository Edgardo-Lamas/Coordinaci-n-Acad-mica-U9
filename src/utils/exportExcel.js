import * as XLSX from 'xlsx';

const today = () => new Date().toISOString().split('T')[0];

export function exportInternos(internos, sectores) {
    const rows = internos.map(i => ({
        'Nº Interno': i.numero_interno,
        'Nombre Completo': i.nombre_completo,
        'DNI': i.dni || '',
        'Sector': sectores.find(s => s.id === i.sector_actual)?.nombre || '',
        'Fecha Ingreso': i.fecha_ingreso || '',
        'Estado': i.estado === 'activo' ? 'Activo' : 'Inactivo',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Internos');
    XLSX.writeFile(wb, `internos_${today()}.xlsx`);
}

export function exportCursos(cursos, capacitadores, sectores, inscripciones) {
    const rows = cursos.map(c => {
        const cap = capacitadores.find(cap => cap.id === c.capacitador_id);
        const sector = sectores.find(s => s.id === c.sector_id);
        const inscriptos = inscripciones.filter(i => i.curso_id === c.id).length;
        return {
            'Nombre': c.nombre,
            'Tipo': c.tipo || '',
            'Sector': sector?.nombre || '',
            'Capacitador': cap?.nombre || '',
            'Carga Horaria': c.carga_horaria ? `${c.carga_horaria} hs` : '',
            'Inicio': c.fecha_inicio || '',
            'Fin': c.fecha_fin || '',
            'Cupo Máximo': c.cupo_maximo || '',
            'Inscriptos': inscriptos,
            'Estado': c.estado || '',
        };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cursos');
    XLSX.writeFile(wb, `cursos_${today()}.xlsx`);
}

export function exportAuditoria(logs) {
    const rows = logs.map(log => {
        let descripcion = log.detalle;
        let cambios = '';
        try {
            const parsed = JSON.parse(log.detalle);
            if (parsed.descripcion) {
                descripcion = parsed.descripcion;
                cambios = (parsed.cambios || []).map(c => `${c.campo}: ${c.antes || '(vacío)'} → ${c.despues || '(vacío)'}`).join(' | ');
            }
        } catch {}
        return {
            'Fecha': new Date(log.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            'Usuario': log.usuario_nombre || '',
            'Acción': log.accion,
            'Entidad': log.entidad,
            'Detalle': descripcion,
            'Cambios': cambios,
            'IP': log.ip || '',
        };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 14 }, { wch: 50 }, { wch: 40 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría');
    XLSX.writeFile(wb, `auditoria_${today()}.xlsx`);
}

export function exportCertificados(certificados, internos, cursos, inscripciones, sectores) {
    const rows = certificados.map(cert => {
        const insc = inscripciones.find(i => i.id === cert.inscripcion_id);
        const curso = insc ? cursos.find(c => c.id === insc.curso_id) : null;
        const interno = insc ? internos.find(i => i.numero_interno === insc.interno_nro) : null;
        const sector = curso ? sectores.find(s => s.id === curso.sector_id) : null;
        return {
            'Código': cert.codigo,
            'Interno': interno?.nombre_completo || '',
            'DNI': interno?.dni || '',
            'Curso': curso?.nombre || '',
            'Sector': sector?.nombre || '',
            'Fecha Emisión': cert.fecha_emision || '',
            'Estado': cert.estado === 'emitido' ? 'Emitido' : 'Pendiente',
            'Hash Integridad': cert.hash_integridad || '',
        };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Certificados');
    XLSX.writeFile(wb, `certificados_${today()}.xlsx`);
}
