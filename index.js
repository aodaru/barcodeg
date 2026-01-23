import express from 'express'
import JsBarcode from 'jsbarcode'
import xmldom from 'xmldom'
import cors from 'cors'

const PORT = process.env.PORT ?? 1234;
const app = express();

/* Activacion del cors */
// const ACCEPT_ORIGINS = [
//   '*'
// ]
//
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if(ACCEPT_ORIGINS.includes(origin)){
//         return callback(null,true)
//       }
//
//       return callback(new Error('Este origen no es permitido'))
//     }
//   })
// )

app.get('/', (req, res) => {
  return res.send('Hello World!')
})

app.get('/gbcode/:value', (req,res) => {
  // const { format = 'barcode128', value } = req.params;
  const { value } = req.params
  const { DOMImplementation, XMLSerializer } = xmldom;
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  console.log(value)
  JsBarcode(svgNode, value, {
      xmlDocument: document,
  });

  const svgText = xmlSerializer.serializeToString(svgNode);
  return res.send(svgText)

})

app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`)
})
