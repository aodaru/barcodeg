import JsBarcode from 'jsbarcode'
import xmldom from 'xmldom'

const SVG_NS = 'http://www.w3.org/2000/svg'

export function extractSvgContent(svgString) {
  if (!svgString || typeof svgString !== 'string') {
    return ''
  }
  const match = svgString.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
  return match ? match[1].trim() : ''
}

export function getBarcodeSvg(value, options = {}) {
  const { DOMImplementation, XMLSerializer } = xmldom
  const xmlSerializer = new XMLSerializer()
  const document = new DOMImplementation().createDocument(
    'http://www.w3.org/1999/xhtml',
    'html',
    null
  )
  const svgNode = document.createElementNS(SVG_NS, 'svg')

  const defaults = {
    xmlDocument: document,
    format: 'CODE128',
    displayValue: false,
    margin: 0,
    width: 1,
    height: 40
  }

  JsBarcode(svgNode, value, { ...defaults, ...options })

  return xmlSerializer.serializeToString(svgNode)
}
