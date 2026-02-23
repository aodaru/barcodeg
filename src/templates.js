import fs from 'node:fs'
import path from 'node:path'

const loadTemplate = (filename) => {
  const filePath = path.join(import.meta.dirname, filename)
  return fs.readFileSync(filePath, 'utf8')
}

export const templates = {
  cardBlack: loadTemplate('cardBlackBack.svg'),
  cardOrange: loadTemplate('cardOrangeBack.svg'),
  coupon: loadTemplate('cuponDescuento.svg')
}
