const { ensureString, ensureNumber } = require('../utils/typeHelpers');

const extractCFDIData = (comprobante) => {
  return {
    metadata: extractMetadata(comprobante),
    emisor: extractEmisor(comprobante),
    receptor: extractReceptor(comprobante),
    conceptos: extractConceptos(comprobante),
    impuestos: extractImpuestos(comprobante),
    complemento: extractComplemento(comprobante)
  };
};

const extractMetadata = (comprobante) => ({
  version: ensureString(comprobante.Version || comprobante.version),
  tipo: ensureString(comprobante.TipoDeComprobante || comprobante.tipoDeComprobante),
  fecha: ensureString(comprobante.Fecha || comprobante.fecha),
  folio: ensureString(comprobante.Folio || comprobante.folio),
  serie: ensureString(comprobante.Serie || comprobante.serie),
  moneda: ensureString(comprobante.Moneda || comprobante.moneda),
  subtotal: ensureNumber(comprobante.SubTotal || comprobante.subTotal),
  total: ensureNumber(comprobante.Total || comprobante.total),
  metodoPago: ensureString(comprobante.MetodoPago || comprobante.metodoPago),
  formaPago: ensureString(comprobante.FormaPago || comprobante.formaPago),
  lugarExpedicion: ensureString(comprobante.LugarExpedicion || comprobante.lugarExpedicion),
  exportacion: ensureString(comprobante.Exportacion || comprobante.exportacion),
  noCertificado: ensureString(comprobante.NoCertificado || comprobante.noCertificado),
  certificado: ensureString(comprobante.Certificado || comprobante.certificado),
});

const extractEmisor = (comprobante) => {
  // Buscamos el emisor en todas las posibles variaciones de nombre y namespace
  const emisor = 
    comprobante['cfdi:Emisor'] || 
    comprobante.Emisor || 
    comprobante.emisor || 
    comprobante['cfdi:emisor'] || {};
  
  return {
    nombre: ensureString(
      emisor.Nombre || 
      emisor.nombre || 
      emisor['cfdi:Nombre'] || 
      emisor['cfdi:nombre'] || 
      ''
    ),
    rfc: ensureString(
      emisor.Rfc || 
      emisor.rfc || 
      emisor['cfdi:Rfc'] || 
      emisor['cfdi:rfc'] || 
      ''
    ),
    regimenFiscal: ensureString(
      emisor.RegimenFiscal || 
      emisor.regimenFiscal || 
      emisor['cfdi:RegimenFiscal'] || 
      emisor['cfdi:regimenFiscal'] || 
      ''
    )
  };
};

const extractReceptor = (comprobante) => {
  // Buscamos el receptor en todas las posibles variaciones
  const receptor = 
    comprobante['cfdi:Receptor'] || 
    comprobante.Receptor || 
    comprobante.receptor || 
    comprobante['cfdi:receptor'] || {};
  
  return {
    nombre: ensureString(
      receptor.Nombre || 
      receptor.nombre || 
      receptor['cfdi:Nombre'] || 
      receptor['cfdi:nombre']
    ),
    rfc: ensureString(
      receptor.Rfc || 
      receptor.rfc || 
      receptor['cfdi:Rfc'] || 
      receptor['cfdi:rfc']
    ),
    usoCFDI: ensureString(
      receptor.UsoCFDI || 
      receptor.usoCFDI || 
      receptor['cfdi:UsoCFDI'] || 
      receptor['cfdi:usoCFDI']
    ),
    regimenFiscal: ensureString(
      receptor.RegimenFiscalReceptor || 
      receptor.regimenFiscalReceptor || 
      receptor['cfdi:RegimenFiscalReceptor'] || 
      receptor['cfdi:regimenFiscalReceptor']
    ),
    domicilioFiscal: ensureString(
      receptor.DomicilioFiscalReceptor || 
      receptor.domicilioFiscalReceptor || 
      receptor['cfdi:DomicilioFiscalReceptor'] || 
      receptor['cfdi:domicilioFiscalReceptor']
    )
  };
};

const extractConceptos = (comprobante) => {
  const conceptosNode = comprobante['cfdi:Conceptos'] || comprobante.Conceptos || comprobante.conceptos || {};
  
  const conceptosArray = Array.isArray(conceptosNode['cfdi:Concepto'] || conceptosNode.Concepto || conceptosNode.concepto)
    ? (conceptosNode['cfdi:Concepto'] || conceptosNode.Concepto || conceptosNode.concepto)
    : [conceptosNode['cfdi:Concepto'] || conceptosNode.Concepto || conceptosNode.concepto].filter(Boolean);

  return conceptosArray.map(concepto => {
    const impuestos = extractConceptoImpuestos(concepto);
    const valorUnitario = ensureNumber(concepto.ValorUnitario || concepto.valorUnitario || concepto['cfdi:ValorUnitario'] || 0);
    const cantidad = ensureNumber(concepto.Cantidad || concepto.cantidad || concepto['cfdi:Cantidad'] || 0);
    const importe = ensureNumber(concepto.Importe || concepto.importe || concepto['cfdi:Importe'] || valorUnitario * cantidad);

    // Calcular total de impuestos trasladados
    const totalTraslados = impuestos.traslados.reduce((sum, t) => sum + (t.importe || 0), 0);

    return {
      // Información básica
      claveProdServ: ensureString(concepto.ClaveProdServ || concepto.claveProdServ || concepto['cfdi:ClaveProdServ'] || ''),
      noIdentificacion: ensureString(concepto.NoIdentificacion || concepto.noIdentificacion || concepto['cfdi:NoIdentificacion'] || ''),
      descripcion: ensureString(concepto.Descripcion || concepto.descripcion || concepto['cfdi:Descripcion'] || ''),
      
      // Unidades y cantidades
      cantidad: cantidad,
      claveUnidad: ensureString(concepto.ClaveUnidad || concepto.claveUnidad || concepto['cfdi:ClaveUnidad'] || ''),
      unidad: ensureString(concepto.Unidad || concepto.unidad || concepto['cfdi:Unidad'] || ''),
      
      // Valores monetarios
      valorUnitario: valorUnitario,
      importe: importe,
      descuento: ensureNumber(concepto.Descuento || concepto.descuento || concepto['cfdi:Descuento'] || 0),
      
      // Información fiscal
      objetoImp: ensureString(concepto.ObjetoImp || concepto.objetoImp || concepto['cfdi:ObjetoImp'] || '02'),
      
      // Impuestos
      impuestos: {
        ...impuestos,
        totalTraslados: totalTraslados,
        // Podemos agregar totalRetenciones si existen
      },
      
      // Totales
      importeConImpuestos: importe + totalTraslados,
      
      // Metadata adicional
      complementoConcepto: concepto['cfdi:ComplementoConcepto'] || null
    };
  });
};

const extractConceptoImpuestos = (concepto) => {
  // Obtenemos el nodo de impuestos con manejo de namespaces
  const impuestosNode = concepto['cfdi:Impuestos'] || concepto.Impuestos || concepto.impuestos || {};
  
  // Manejo de traslados
  const trasladosNode = impuestosNode['cfdi:Traslados'] || impuestosNode.Traslados || impuestosNode.traslados || {};
  const trasladosArray = [].concat(
    trasladosNode['cfdi:Traslado'] || 
    trasladosNode.Traslado || 
    trasladosNode.traslado || 
    []
  );

  const traslados = trasladosArray.map(traslado => ({
    base: ensureNumber(traslado.Base || traslado.base || 0),
    impuesto: ensureString(traslado.Impuesto || traslado.impuesto || ''),
    tipoFactor: ensureString(traslado.TipoFactor || traslado.tipoFactor || ''),
    tasaOCuota: ensureNumber(traslado.TasaOCuota || traslado.tasaOCuota || 0),
    importe: ensureNumber(traslado.Importe || traslado.importe || 0)
  }));

  return {
    traslados: traslados,
    // Podemos agregar retenciones aquí si el CFDI las incluye
    retenciones: []
  };
};

const extractImpuestos = (comprobante) => {
  // Manejo de namespaces
  const impuestosNode = comprobante['cfdi:Impuestos'] || comprobante.Impuestos || comprobante.impuestos || {};
  
  // Extracción de traslados
  const trasladosNode = impuestosNode['cfdi:Traslados'] || impuestosNode.Traslados || impuestosNode.traslados || {};
  const trasladosArray = [].concat(
    trasladosNode['cfdi:Traslado'] || 
    trasladosNode.Traslado || 
    trasladosNode.traslado || 
    []
  );

  const traslados = trasladosArray.map(traslado => ({
    impuesto: ensureString(traslado.Impuesto || traslado.impuesto),
    tipoFactor: ensureString(traslado.TipoFactor || traslado.tipoFactor),
    tasaOCuota: ensureNumber(traslado.TasaOCuota || traslado.tasaOCuota),
    importe: ensureNumber(traslado.Importe || traslado.importe),
    base: ensureNumber(traslado.Base || traslado.base)
  }));

  return {
    totalImpuestosTrasladados: ensureNumber(
      impuestosNode.TotalImpuestosTrasladados || 
      impuestosNode.totalImpuestosTrasladados ||
      impuestosNode['cfdi:TotalImpuestosTrasladados'] || 
      0
    ),
    traslados: traslados,
    // Agregar retenciones si son necesarias
    retenciones: []
  };
};

const extractComplemento = (comprobante) => {
  // Manejo de namespaces para el complemento
  const complementoNode = comprobante['cfdi:Complemento'] || comprobante.Complemento || comprobante.complemento || {};
  
  // Timbre Fiscal Digital con manejo de namespaces
  const extractTimbreFiscal = () => {
    const tfd = complementoNode['tfd:TimbreFiscalDigital'] || 
                complementoNode.TimbreFiscalDigital || 
                complementoNode.timbreFiscalDigital || {};
    
    if (!tfd.UUID) return null;
    
    return {
      uuid: ensureString(tfd.UUID),
      fechaTimbrado: ensureString(tfd.FechaTimbrado),
      rfcProvCertif: ensureString(tfd.RfcProvCertif),
      selloSAT: ensureString(tfd.SelloSAT),
      selloCFD: ensureString(tfd.SelloCFD),
      noCertificadoSAT: ensureString(tfd.NoCertificadoSAT),
      version: ensureString(tfd.Version || '1.1')
    };
  };

  // Función genérica para extraer addendas
  const extractAddendaGenerica = () => {
    const addendaNode = comprobante['cfdi:Addenda'] || comprobante.Addenda || comprobante.addenda || {};
    
    // Si no hay addenda, retornar null
    if (Object.keys(addendaNode).length === 0) return null;
    
    // Extraer el primer nodo de addenda (puede tener cualquier nombre)
    const addendaKey = Object.keys(addendaNode).find(key => 
      key !== ':' && !key.startsWith('@')
    );
    
    if (!addendaKey) return null;
    
    const addendaContent = addendaNode[addendaKey];
    
    // Función recursiva para normalizar nodos
    const normalizeNode = (node) => {
      if (typeof node !== 'object' || node === null) return node;
      
      const result = {};
      
      for (const [key, value] of Object.entries(node)) {
        // Ignorar atributos XML (comienzan con @)
        if (key.startsWith('@')) continue;
        
        // Determinar si es un nodo con namespace
        const cleanKey = key.includes(':') ? key.split(':')[1] : key;
        
        if (Array.isArray(value)) {
          result[cleanKey] = value.map(normalizeNode);
        } else if (typeof value === 'object' && value !== null) {
          result[cleanKey] = normalizeNode(value);
        } else {
          result[cleanKey] = ensureString(value);
        }
      }
      
      return result;
    };
    
    return {
      tipoAddenda: addendaKey.includes(':') ? addendaKey.split(':')[1] : addendaKey,
      contenido: normalizeNode(addendaContent)
    };
  };

  return {
    timbreFiscalDigital: extractTimbreFiscal(),
    addenda: extractAddendaGenerica()
  };
};


module.exports = { extractCFDIData };