import express from 'express'
import JsBarcode from 'jsbarcode'
import xmldom from 'xmldom'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'

const svgCardBlackBack = fs.readFileSync(path.join(import.meta.dirname, 'src/cardBlackBack.svg'), 'utf8')
const svgCardOrangeBack = fs.readFileSync(path.join(import.meta.dirname, 'src/cardOrangeBack.svg'), 'utf8')

const PORT = process.env.PORT ?? 1234;
const app = express();

// sin esto no parsea el contenido del body
/* Activacion del cors */
const corsOptions = {
  origin: [
    'http://localhost',
    'https://n8n.franklinjurado.com'
  ],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
// inicio de codigo de superposicion.
// Added sequenceNumber parameter and logic to display it
function overlaySVGs(svg1String, svg2String, xPos, yPos, finalSvgWidth, finalSvgHeight, sequenceNumber) {
  // 1. Crear un contenedor SVG principal
  //    Este será el SVG final que contendrá ambos SVGs.
  //    Ajustamos el tamaño del contenedor para que sea lo suficientemente grande
  //    para albergar ambos SVGs. En un caso real, necesitarías calcular esto
  //    basándote en las dimensiones de los SVG originales.
  // const finalSvgWidth = 450; // Ejemplo: Ancho total del SVG final
  // const finalSvgHeight = 300; // Ejemplo: Alto total del SVG final
  let finalSvg = `
    <svg width="${finalSvgWidth*3}" height="${finalSvgHeight*3}" viewBox="0 0 ${finalSvgWidth*3} ${finalSvgHeight*3}"  xmlns="http://www.w3.org/2000/svg"> <g transform="scale(3)">`;

  // 2. Añadir el primer SVG (el base) al contenedor final.
  //    Eliminamos la declaración xmlns si está presente para evitar duplicados,
  //    y nos aseguramos de que no tenga atributos de posición que interfieran.
  const cleanedSvg1 = svg1String
    .replace(/<svg[^>]*>/, `<svg >`) // Reemplaza la etiqueta svg inicial para asegurar que no tenga atributos que interfieran
    .replace('xmlns="http://www.w3.org/2000/svg"', ''); // Elimina xmlns si ya está en el SVG principal
  finalSvg += cleanedSvg1;

  // 3. Añadir el segundo SVG (el superpuesto) con posicionamiento.
  //    Aquí es donde aplicamos las coordenadas `xPos` e `yPos`.
  const svg2WithPosition = svg2String
    .replace('<svg', `<svg x="${xPos}" y="${yPos}"`) // Añade o modifica los atributos x e y
    .replace(/<svg[^>]*>/, `<svg x="${xPos}" y="${yPos}" width="220" height="80" viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg">`); // Asegura xmlns y posicion

  finalSvg += svg2WithPosition;

  // 4. Añadir la secuencia de números en la parte inferior izquierda
  const formattedSequence = formatSequence(sequenceNumber);
  finalSvg += `
    <text x="175" y="150" font-family="Montserrat-Medium, Montserrat" font-size="8px" font-weight="600" fill="#333">${formattedSequence}</text>
  `;

  // 5. Cerrar el contenedor SVG principal
  finalSvg += '</g></svg>';
  return finalSvg;
}

// Helper function to format the sequence number
function formatSequence(num) {
  return String(num).padStart(12, '0');
}
// fin de codigo de superposicion

const getBarcodeSvg = (value) => {
  const { DOMImplementation, XMLSerializer } = xmldom;
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  JsBarcode(svgNode, value, {
    xmlDocument: document,
    displayValue: false,
    margin: 0,
    width: 1,
    height: 40
  });

  const svgText = xmlSerializer.serializeToString(svgNode);
  return svgText;
}

app.get('/', (req, res) => {
  return res.send('Hello World!')
})

app.get('/gbcode/:value', (req,res) => {
  // const { format = 'barcode128', value } = req.params;
  const { value } = req.params
  return res.send(getBarcodeSvg(value))
})

// Modified route to accept sequenceNumber
// app.get('/tcfj/:value/:cardTemplate/:sequenceNumber', (req,res) => {
app.post('/tcfj', (req,res) => {
  const { cardTemplate, value, sequenceNumber } = req.body // Original commented out
  // const { cardTemplate, value, sequenceNumber } = req.params;
  // define template to use
  const cardBase = cardTemplate === 'black' ? svgCardBlackBack : svgCardOrangeBack;
  const xPos = cardTemplate === 'black' ? 30 : 25;
  const yPos = cardTemplate === 'black' ? 96 : 90;
  const finalWidth = cardTemplate === 'black' ? 245.39 : 600;
  const finalHeight = cardTemplate === 'black' ? 156.49001 : 400;
  // get barcode in svg format
  const barcode = getBarcodeSvg(value);

  // Pass sequenceNumber to overlaySVGs
  const svgShow = overlaySVGs(cardBase, barcode, xPos, yPos, finalWidth, finalHeight, sequenceNumber);
  return res.send(svgShow);
})

app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`)
})
