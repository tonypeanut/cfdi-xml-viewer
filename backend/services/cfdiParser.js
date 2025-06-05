const { XMLParser } = require('fast-xml-parser');
const { extractCFDIData } = require('./cfdiExtractor');
const { validateCFDI } = require('./cfdiValidator');
const { ensureString, ensureNumber } = require('../utils/typeHelpers');

const getParser = () => {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: false, // Desactivamos conversión automática
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      // Forzamos arrays para estos nodos
      if (['Concepto', 'Traslado', 'Retencion'].includes(name)) return true;
      return false;
    },
    attributeValueProcessor: (name, val) => {
      // Forzamos tipos específicos para ciertos atributos
      if (['Version', 'Folio', 'Serie', 'Rfc', 'UsoCFDI'].includes(name)) {
        return ensureString(val);
      }
      if (['Total', 'SubTotal', 'Importe', 'ValorUnitario'].includes(name)) {
        return ensureNumber(val);
      }
      return val;
    }
  });
};

const parseCFDI = (xmlData) => {
  const parser = getParser();
  try {
    const jsonObj = parser.parse(xmlData);
    const comprobante = jsonObj['cfdi:Comprobante'] || jsonObj['Comprobante'];
    
    if (!comprobante) {
      throw new Error('No se encontró nodo Comprobante');
    }
    
    validateCFDI(comprobante);
    return extractCFDIData(comprobante);
    
  } catch (error) {
    throw new Error(`Error parsing CFDI: ${error.message}`);
  }
};

module.exports = { parseCFDI };