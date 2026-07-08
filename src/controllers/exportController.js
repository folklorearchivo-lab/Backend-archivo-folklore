const { Cultores, Obras, Parroquias, Municipios, CategoriasObra } = require('../models');
const { Op } = require('sequelize');
const {
  crearDocumentoPdf,
  dibujarEncabezado,
  dibujarTabla,
  dibujarTarjetaResumen,
  agregarPiesDePagina,
  MARGEN_X,
  COLOR_TEXTO,
  COLOR_TEXTO_SECUNDARIO,
} = require('../utils/pdfDocumento');
const { enviarExcel } = require('../utils/excelDocumento');

function nombreCompletoCultor(c) {
  return `${c.primer_nombre || ''} ${c.segundo_nombre || ''} ${c.primer_apellido || ''} ${c.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim();
}

// Reporte PDF: listado de cultores registrados. Solo cultores aprobados — estos
// reportes son para uso oficial/externo, y las postulaciones pendientes o rechazadas
// no deben figurar como si ya fueran parte del registro oficial.
exports.exportCultoresPdf = async (req, res, next) => {
  try {
    const cultores = await Cultores.findAll({
      where: { estatus: 'aprobado' },
      include: [{ model: Parroquias, as: 'parroquia', attributes: ['nombre'], include: [{ model: Municipios, as: 'municipio', attributes: ['nombre'] }] }],
      order: [['primer_apellido', 'ASC']],
    });

    const doc = crearDocumentoPdf(res, 'reporte_cultores_registrados.pdf');
    dibujarEncabezado(doc, 'Reporte de Cultores Registrados', `${cultores.length} cultores en el sistema`);

    dibujarTabla(doc, {
      columnas: ['#', 'NOMBRE', 'CÉDULA', 'REGIÓN', 'ESTATUS', 'REGISTRO'],
      anchos: [4, 26, 14, 24, 14, 14],
      filas: cultores.map((c, i) => [
        i + 1,
        nombreCompletoCultor(c),
        c.cedula || 'N/D',
        c.parroquia?.municipio?.nombre ? `${c.parroquia.nombre}, ${c.parroquia.municipio.nombre}` : (c.parroquia?.nombre || 'Sin región'),
        c.estatus || 'N/D',
        c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString('es-VE') : 'N/D',
      ]),
    });

    agregarPiesDePagina(doc);
    doc.end();
  } catch (err) {
    next(err);
  }
};

// Excel: listado de cultores registrados (misma data que exportCultoresPdf, en Excel).
// Solo aprobados, mismo criterio que exportCultoresPdf.
exports.exportCultoresExcel = async (req, res, next) => {
  try {
    const cultores = await Cultores.findAll({
      where: { estatus: 'aprobado' },
      include: [{ model: Parroquias, as: 'parroquia', attributes: ['nombre'], include: [{ model: Municipios, as: 'municipio', attributes: ['nombre'] }] }],
      order: [['primer_apellido', 'ASC']],
    });

    await enviarExcel(res, 'reporte_cultores_registrados.xlsx', {
      titulo: 'Reporte de Cultores Registrados',
      columnas: [
        { header: '#', width: 6 },
        { header: 'Nombre', width: 30 },
        { header: 'Cédula', width: 16 },
        { header: 'Municipio', width: 20 },
        { header: 'Parroquia', width: 20 },
        { header: 'Estatus', width: 14 },
        { header: 'Fecha de Registro', width: 18 },
      ],
      filas: cultores.map((c, i) => [
        i + 1,
        nombreCompletoCultor(c),
        c.cedula || 'N/D',
        c.parroquia?.municipio?.nombre || 'Sin municipio',
        c.parroquia?.nombre || 'Sin parroquia',
        c.estatus || 'N/D',
        c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString('es-VE') : 'N/D',
      ]),
    });
  } catch (err) {
    next(err);
  }
};

// Excel: cultores aprobados agrupados y ordenados por municipio, con subtotales por
// región (mismo patrón que exportObrasPorMunicipioExcel, para el reporte oficial de
// "Registro de Cultores por Región"). Solo aprobados, mismo criterio que las demás
// exportaciones de cultores.
exports.exportCultoresPorRegionExcel = async (req, res, next) => {
  try {
    const cultores = await Cultores.findAll({
      where: { estatus: 'aprobado' },
      include: [{ model: Parroquias, as: 'parroquia', attributes: ['nombre'], include: [{ model: Municipios, as: 'municipio', attributes: ['nombre'] }] }],
      order: [['primer_apellido', 'ASC']],
    });

    // Agrupa por municipio (o "Sin municipio") y ordena alfabéticamente por municipio,
    // manteniendo el orden original de los cultores dentro de cada grupo.
    const grupos = new Map();
    for (const c of cultores) {
      const municipio = c.parroquia?.municipio?.nombre || 'Sin municipio';
      if (!grupos.has(municipio)) grupos.set(municipio, []);
      grupos.get(municipio).push(c);
    }
    const municipiosOrdenados = [...grupos.keys()].sort((a, b) => a.localeCompare(b, 'es'));

    const filas = [];
    for (const municipio of municipiosOrdenados) {
      const cultoresDelMunicipio = grupos.get(municipio);
      filas.push([municipio, `— ${cultoresDelMunicipio.length} cultor(es) —`, '', '', '', '']);
      for (const c of cultoresDelMunicipio) {
        filas.push([
          '',
          nombreCompletoCultor(c),
          c.cedula || 'N/D',
          c.parroquia?.nombre || 'Sin parroquia',
          c.esta_certificado ? 'Sí' : 'No',
          c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString('es-VE') : 'N/D',
        ]);
      }
    }

    await enviarExcel(res, 'cultores_por_region.xlsx', {
      titulo: 'Registro de Cultores Aprobados por Región',
      columnas: [
        { header: 'Municipio', width: 22 },
        { header: 'Nombre', width: 32 },
        { header: 'Cédula', width: 16 },
        { header: 'Parroquia', width: 20 },
        { header: 'Certificado', width: 14 },
        { header: 'Fecha de Registro', width: 18 },
      ],
      filas,
    });
  } catch (err) {
    next(err);
  }
};

// Excel: inventario de obras agrupado y ordenado por municipio, con subtotales.
exports.exportObrasPorMunicipioExcel = async (req, res, next) => {
  try {
    const obras = await Obras.findAll({
      where: { estatus: { [Op.ne]: 'eliminado' } },
      include: [
        { model: Cultores, as: 'cultor', attributes: ['primer_nombre', 'primer_apellido'] },
        { model: CategoriasObra, as: 'categoria', attributes: ['nombre'] },
        {
          model: Parroquias, as: 'parroquia', attributes: ['nombre'],
          include: [{ model: Municipios, as: 'municipio', attributes: ['nombre'] }],
        },
      ],
      order: [['id_obra', 'ASC']],
    });

    // Agrupa por municipio (o "Sin municipio") y ordena alfabéticamente por municipio,
    // manteniendo el orden original de las obras dentro de cada grupo.
    const grupos = new Map();
    for (const o of obras) {
      const municipio = o.parroquia?.municipio?.nombre || 'Sin municipio';
      if (!grupos.has(municipio)) grupos.set(municipio, []);
      grupos.get(municipio).push(o);
    }
    const municipiosOrdenados = [...grupos.keys()].sort((a, b) => a.localeCompare(b, 'es'));

    const filas = [];
    for (const municipio of municipiosOrdenados) {
      const obrasDelMunicipio = grupos.get(municipio);
      filas.push([municipio, `— ${obrasDelMunicipio.length} obra(s) —`, '', '', '']);
      for (const o of obrasDelMunicipio) {
        filas.push([
          '',
          o.titulo || 'Sin título',
          o.cultor ? `${o.cultor.primer_nombre || ''} ${o.cultor.primer_apellido || ''}`.trim() : 'Sin cultor',
          o.categoria?.nombre || 'Sin categoría',
          o.estatus || '',
        ]);
      }
    }

    await enviarExcel(res, 'patrimonio_por_municipio.xlsx', {
      titulo: 'Inventario de Patrimonio por Municipio',
      columnas: [
        { header: 'Municipio', width: 22 },
        { header: 'Título', width: 30 },
        { header: 'Cultor', width: 24 },
        { header: 'Categoría', width: 20 },
        { header: 'Estatus', width: 14 },
      ],
      filas,
    });
  } catch (err) {
    next(err);
  }
};

// Ficha PDF individual de un cultor (usado por "Exportar Ficha" en el catálogo)
exports.exportFichaCultorPdf = async (req, res, next) => {
  try {
    const cultor = await Cultores.findByPk(req.params.id_cultor, {
      include: [{ model: Parroquias, as: 'parroquia', attributes: ['nombre'], include: [{ model: Municipios, as: 'municipio', attributes: ['nombre'] }] }],
    });
    if (!cultor) {
      return res.status(404).json({ error: 'Cultor no encontrado' });
    }

    const nombre = nombreCompletoCultor(cultor);
    const doc = crearDocumentoPdf(res, `ficha_cultor_${cultor.id_cultor}.pdf`);
    dibujarEncabezado(doc, 'Ficha de Cultor', nombre);

    const region = cultor.parroquia?.municipio?.nombre ? `${cultor.parroquia.nombre}, ${cultor.parroquia.municipio.nombre}` : (cultor.parroquia?.nombre || 'Sin región');

    // Tarjetas resumen (cédula, estatus, región) en una fila, estilo "stat card"
    const anchoTarjeta = (doc.page.width - MARGEN_X * 2 - 24) / 3;
    dibujarTarjetaResumen(doc, 'Cédula', cultor.cedula || 'N/D', MARGEN_X, doc.y, anchoTarjeta);
    dibujarTarjetaResumen(doc, 'Estatus', cultor.estatus || 'N/D', MARGEN_X + anchoTarjeta + 12, doc.y, anchoTarjeta);
    dibujarTarjetaResumen(doc, 'Región', region, MARGEN_X + (anchoTarjeta + 12) * 2, doc.y, anchoTarjeta);
    doc.y += 70;

    dibujarTabla(doc, {
      columnas: ['CAMPO', 'VALOR'],
      anchos: [12, 28],
      filas: [
        ['Género', cultor.genero || 'N/D'],
        ['Teléfono', cultor.telefono_contacto || 'N/D'],
        ['Correo', cultor.correo_contacto || 'N/D'],
        ['Estatus de vida', cultor.estatus_vida || 'N/D'],
        ['Certificado', cultor.esta_certificado ? 'Sí' : 'No'],
        ['Fecha de registro', cultor.fecha_registro ? new Date(cultor.fecha_registro).toLocaleDateString('es-VE') : 'N/D'],
      ],
    });

    if (cultor.resumen_curricular) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_TEXTO).text('Resumen curricular');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9.5).fillColor(COLOR_TEXTO_SECUNDARIO).text(cultor.resumen_curricular, { width: doc.page.width - MARGEN_X * 2 });
    }

    agregarPiesDePagina(doc);
    doc.end();
  } catch (err) {
    next(err);
  }
};

// Excel de obras registradas (inventario), con diseño de marca
exports.exportObrasCsv = async (req, res, next) => {
  try {
    const obras = await Obras.findAll({
      where: { estatus: { [Op.ne]: 'eliminado' } },
      include: [
        { model: Cultores, as: 'cultor', attributes: ['primer_nombre', 'primer_apellido'] },
        { model: CategoriasObra, as: 'categoria', attributes: ['nombre'] },
        { model: Parroquias, as: 'parroquia', attributes: ['nombre'] },
      ],
      order: [['id_obra', 'ASC']],
    });

    await enviarExcel(res, 'inventario_obras.xlsx', {
      titulo: 'Inventario de Obras Registradas',
      columnas: [
        { header: 'ID', width: 8 },
        { header: 'Título', width: 32 },
        { header: 'Cultor', width: 24 },
        { header: 'Categoría', width: 20 },
        { header: 'Región', width: 20 },
        { header: 'Estatus', width: 14 },
        { header: 'Fecha Postulación', width: 18 },
        { header: 'Fecha Aprobación', width: 18 },
      ],
      filas: obras.map((o) => [
        o.id_obra,
        o.titulo || '',
        o.cultor ? `${o.cultor.primer_nombre || ''} ${o.cultor.primer_apellido || ''}`.trim() : '',
        o.categoria?.nombre || '',
        o.parroquia?.nombre || '',
        o.estatus || '',
        o.fecha_postulacion ? new Date(o.fecha_postulacion).toLocaleDateString('es-VE') : '',
        o.fecha_aprobacion ? new Date(o.fecha_aprobacion).toLocaleDateString('es-VE') : '',
      ]),
    });
  } catch (err) {
    next(err);
  }
};

// Catálogo consolidado PDF: resumen de cultores + obras
exports.exportCatalogoConsolidadoPdf = async (req, res, next) => {
  try {
    const [totalCultores, obras] = await Promise.all([
      Cultores.count(),
      Obras.findAll({
        where: { estatus: { [Op.ne]: 'eliminado' } },
        include: [
          { model: Cultores, as: 'cultor', attributes: ['primer_nombre', 'primer_apellido'] },
          { model: CategoriasObra, as: 'categoria', attributes: ['nombre'] },
        ],
        order: [['id_obra', 'ASC']],
      }),
    ]);

    const doc = crearDocumentoPdf(res, 'catalogo_consolidado_archivo.pdf');
    dibujarEncabezado(doc, 'Catálogo Consolidado del Archivo', 'Resumen general de cultores y patrimonio catalogado');

    const anchoTarjeta = (doc.page.width - MARGEN_X * 2 - 12) / 2;
    dibujarTarjetaResumen(doc, 'Cultores registrados', totalCultores, MARGEN_X, doc.y, anchoTarjeta);
    dibujarTarjetaResumen(doc, 'Obras catalogadas', obras.length, MARGEN_X + anchoTarjeta + 12, doc.y, anchoTarjeta);
    doc.y += 70;

    doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_TEXTO).text('Inventario de Obras');
    doc.moveDown(0.4);

    dibujarTabla(doc, {
      columnas: ['#', 'TÍTULO', 'CULTOR', 'CATEGORÍA', 'ESTATUS'],
      anchos: [4, 28, 22, 20, 14],
      filas: obras.map((o, i) => [
        i + 1,
        o.titulo || 'Sin título',
        o.cultor ? `${o.cultor.primer_nombre || ''} ${o.cultor.primer_apellido || ''}`.trim() : 'Sin cultor',
        o.categoria?.nombre || 'Sin categoría',
        o.estatus || '',
      ]),
    });

    agregarPiesDePagina(doc);
    doc.end();
  } catch (err) {
    next(err);
  }
};
