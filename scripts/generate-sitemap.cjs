const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.SITE_URL || 'https://contex360.com'

const publicRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/nosotros', priority: '0.8', changefreq: 'monthly' },
  { path: '/precios', priority: '0.8', changefreq: 'monthly' },
  { path: '/demo', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacidad', priority: '0.3', changefreq: 'yearly' },
  { path: '/terminos', priority: '0.3', changefreq: 'yearly' },
]

const now = new Date().toISOString()

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

for (const route of publicRoutes) {
  xml += `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`
}

xml += `</urlset>
`

const outPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml')
fs.writeFileSync(outPath, xml, 'utf-8')
console.log(`Sitemap generated at ${outPath}`)
console.log(`  Routes: ${publicRoutes.length}`)
console.log(`  Base URL: ${BASE_URL}`)
