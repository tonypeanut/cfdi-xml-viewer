const validateCFDI = (comprobante) => {
  const version = String(comprobante.Version || comprobante.version);
  
  if (version !== '4.0' && version !== '4') {
    throw new Error(`Versión CFDI no soportada: ${version}`);
  }
  
  // Puedes agregar más validaciones aquí
  /*
  if (!comprobante.Emisor && !comprobante.emisor) {
    throw new Error('CFDI no contiene información del emisor');
  }
  
  if (!comprobante.Receptor && !comprobante.receptor) {
    throw new Error('CFDI no contiene información del receptor');
  }
  */
};

module.exports = { validateCFDI };