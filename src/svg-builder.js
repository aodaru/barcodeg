import { extractSvgContent } from './barcode-generator.js'
import { DOMParser, XMLSerializer } from 'xmldom'

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
  const parser = new DOMParser()
  const templateDoc = parser.parseFromString(templateSvg, 'image/svg+xml')

  const contenedorBarra = templateDoc.getElementById('contenedorBarra')
  const barcodeElement = templateDoc.getElementById('barcode')

  if (contenedorBarra && barcodeElement && barcodeSvg) {
    const barcodeDoc = parser.parseFromString(barcodeSvg, 'image/svg+xml')
    const barcodeContent = barcodeDoc.documentElement
    const importedBarcode = templateDoc.importNode(barcodeContent, true)

    importedBarcode.setAttribute('x', '136')
    importedBarcode.setAttribute('y', '205')
    importedBarcode.setAttribute('width', '520')
    importedBarcode.setAttribute('height', '100')

    barcodeElement.parentNode.replaceChild(importedBarcode, barcodeElement)
  }

  const couponIdElement = templateDoc.getElementById('couponId')
  if (couponIdElement) {
    const tspan = couponIdElement.getElementsByTagName('tspan')[0]
    if (tspan) {
      tspan.textContent = couponId || ''
    } else {
      couponIdElement.textContent = couponId || ''
    }
  }

  const expirationDateElement = templateDoc.getElementById('expirationDate')
  if (expirationDateElement) {
    const tspan = expirationDateElement.getElementsByTagName('tspan')[0]
    if (tspan) {
      tspan.textContent = 'Valido hasta: ' + formatDateDDMMYYYY(expirationDate)
    } else {
      expirationDateElement.textContent = 'Valido hasta: ' + formatDateDDMMYYYY(expirationDate)
    }
  }

  const serializer = new XMLSerializer()
  return serializer.serializeToString(templateDoc)
}
