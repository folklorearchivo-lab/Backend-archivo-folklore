const { Obras } = require('../src/models');

async function run() {
  try {
    console.log("Iniciando consulta de obras...");
    const list = await Obras.findAll();
    console.log("Obras encontradas:");
    list.forEach(o => {
      console.log(`ID: ${o.id_obra}, Título: ${o.titulo}, Código QR: ${o.codigo_qr_link}, Estatus: ${o.estatus}`);
    });

    // 1. Eliminar duplicadas (manteniendo solo la de código IP-001)
    // Buscamos todas las obras con título similar o duplicadas
    console.log("\nLimpiando duplicados de 'cestas de samu'...");
    for (const o of list) {
      if (o.titulo.toLowerCase().includes('cesta') && o.codigo_qr_link !== 'IP-001') {
        console.log(`Eliminando obra duplicada: ID ${o.id_obra} (${o.titulo}) con código ${o.codigo_qr_link}`);
        await o.destroy();
      }
    }

    // 2. Actualizar la de código IP-003 a IP-002
    console.log("\nActualizando códigos...");
    const obra003 = await Obras.findOne({ where: { codigo_qr_link: 'IP-003' } });
    if (obra003) {
      console.log(`Actualizando obra ID ${obra003.id_obra} de IP-003 a IP-002`);
      obra003.codigo_qr_link = 'IP-002';
      await obra003.save();
    } else {
      console.log("No se encontró ninguna obra con código IP-003");
    }

    console.log("\nEjecución finalizada con éxito.");
    process.exit(0);
  } catch (error) {
    console.error("Error ejecutando script:", error);
    process.exit(1);
  }
}

run();
