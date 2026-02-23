import express from 'express'
import cors from 'cors'
import { templates } from './src/templates.js'
import { getBarcodeSvg } from './src/barcode-generator.js'
import { overlaySVGs, buildCouponSvg } from './src/svg-builder.js'

const PORT = process.env.PORT ?? 1234
const app = express()

const corsOptions = {
  origin: [
    'http://localhost',
    'https://n8n.franklinjurado.com'
  ],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

app.get('/', (req, res) => {
  return res.send('Hello World!')
})

app.get('/gbcode/:value', (req, res) => {
  const { value } = req.params
  return res.send(getBarcodeSvg(value))
})

app.post('/tcfj', (req, res) => {
  const { cardTemplate, value, sequenceNumber } = req.body
  
  const template = cardTemplate === 'black' ? templates.cardBlack : templates.cardOrange
  const xPos = cardTemplate === 'black' ? 30 : 25
  const yPos = cardTemplate === 'black' ? 96 : 90
  const finalWidth = cardTemplate === 'black' ? 245.39 : 600
  const finalHeight = cardTemplate === 'black' ? 156.49001 : 400
  
  const barcode = getBarcodeSvg(value)
  
  const svgShow = overlaySVGs(template, barcode, {
    x: xPos,
    y: yPos,
    width: finalWidth,
    height: finalHeight,
    sequenceNumber
  })
  
  return res.send(svgShow)
})

app.get('/tcfj/:value/:cardTemplate/:sequenceNumber', (req, res) => {
  const { cardTemplate, value, sequenceNumber } = req.params
  
  const template = cardTemplate === 'black' ? templates.cardBlack : templates.cardOrange
  const xPos = cardTemplate === 'black' ? 30 : 25
  const yPos = cardTemplate === 'black' ? 96 : 90
  const finalWidth = cardTemplate === 'black' ? 245.39 : 600
  const finalHeight = cardTemplate === 'black' ? 156.49001 : 400
  
  const barcode = getBarcodeSvg(value)
  
  const svgShow = overlaySVGs(template, barcode, {
    x: xPos,
    y: yPos,
    width: finalWidth,
    height: finalHeight,
    sequenceNumber
  })
  
  return res.send(svgShow)
})

app.post('/coupon', (req, res) => {
  const { couponCode, couponId, expirationDate } = req.body
  
  if (!couponCode) {
    return res.status(400).json({ error: 'couponCode is required' })
  }
  
  const barcode = getBarcodeSvg(couponCode, { width: 2, height: 120 })
  const svg = buildCouponSvg(templates.coupon, barcode, couponId, expirationDate)
  
  return res.send(svg)
})

app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`)
})
