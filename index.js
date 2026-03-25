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

  // Proceso de validacion de datos 
  if (!value) {
    return res.status(500).json({ error: 'Value is required' })
  }

  if (value.length < 1 || value.length > 48) {
    return res.status(500).json({ error: 'Value must be 1-48 characters' })
  }

  try {
    return res.status(200).send(getBarcodeSvg(value))
  } catch (error) {
    return res.status(400).json({ error: 'Failed to generate barcode' })
  }
})

app.get('/tcfj/:cardTemplate/:value/:cardId', (req, res) => {
  const { cardTemplate, value, cardId } = req.params

  if(!cardTemplate || !value || !cardId) {
    return res.status(500).json({ error: 'Send all data...!' })
  }

  if(cardTemplate !== 'black' && cardTemplate !== 'orange'){
    return res.status(500).json({ error: 'cardTemplate would be orange or black' })
  }
  
  const template = cardTemplate === 'black' ? templates.cardBlack : templates.cardOrange
  const xPos = cardTemplate === 'black' ? 30 : 25
  const yPos = cardTemplate === 'black' ? 96 : 90
  const finalWidth = cardTemplate === 'black' ? 245.39 : 600
  const finalHeight = cardTemplate === 'black' ? 156.49001 : 400

  try {
    const barcode = getBarcodeSvg(value)

    const svgShow = overlaySVGs(template, barcode, {
      x: xPos,
      y: yPos,
      width: finalWidth,
      height: finalHeight,
      cardId
    })

    return res.status(200).send(svgShow)
  } catch (error){
    return res.status(400).json({ error: 'Failed to generate barcode' })
  }
})

app.post('/coupon', (req, res) => {
  const { couponCode, couponId, expirationDate } = req.body
  
  if (!couponCode) {
    return res.status(500).json({ error: 'couponCode is required' })
  }

  if (!couponId) {
    return res.status(500).json({ error: 'couponId is required' })
  }
  
  if (!expirationDate) {
    return res.status(500).json({ error: 'expirationDate is required' })
  }

  try {
    const barcode = getBarcodeSvg(couponCode, { width: 2, height: 120 })
    const svg = buildCouponSvg(templates.coupon, barcode, couponId, expirationDate)

    return res.send(svg)
  }catch(error){
    return res.status(400).json({ error: 'Failed to generate barcode' })
  }

})

app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`)
})
