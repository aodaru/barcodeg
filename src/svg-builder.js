import { extractSvgContent } from './barcode-generator.js'

export function formatDateDDMMYYYY(dateString) {
  if (!dateString) return ''
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

export function formatSequence(num) {
  return String(num).padStart(12, '0')
}

export function overlaySVGs(baseSvgString, overlaySvgString, options = {}) {
  const {
    x = 0,
    y = 0,
    width = 800,
    height = 600,
    scale = 3,
    overlayWidth = 220,
    overlayHeight = 80,
    sequenceNumber = null
  } = options

  const baseContent = extractSvgContent(baseSvgString)
  const overlayContent = extractSvgContent(overlaySvgString)

  let finalSvg = `<svg width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width * scale} ${height * scale}" xmlns="http://www.w3.org/2000/svg"><g transform="scale(${scale})">`

  finalSvg += baseContent

  finalSvg += `<svg x="${x}" y="${y}" width="${overlayWidth}" height="${overlayHeight}" viewBox="0 0 ${overlayWidth} ${overlayHeight}" xmlns="http://www.w3.org/2000/svg">${overlayContent}</svg>`

  if (sequenceNumber !== null) {
    const formattedSequence = formatSequence(sequenceNumber)
    finalSvg += `<text x="175" y="150" font-family="Montserrat-Medium, Montserrat" font-size="8px" font-weight="600" fill="#333">${formattedSequence}</text>`
  }

  finalSvg += '</g></svg>'

  return finalSvg
}

export function buildCouponSvg(templateSvg, barcodeSvg, couponId, expirationDate) {
  const templateContent = extractSvgContent(templateSvg)
  const barcodeContent = extractSvgContent(barcodeSvg)
  const formattedDate = formatDateDDMMYYYY(expirationDate)

  let svg = templateContent

  svg = svg.replace(/\{\{COUPON_ID\}\}/g, couponId || '')
  svg = svg.replace(/\{\{EXPIRATION_DATE\}\}/g, formattedDate)
  svg = svg.replace(/\{\{BARCODE\}\}/g, barcodeContent)

  const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svg}</svg>`

  return finalSvg
}
