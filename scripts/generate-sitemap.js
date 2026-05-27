import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SITE_URL = process.env.SITE_URL || 'https://contex360.co'
const OUTPUT = resolve(__dirname, '..', 'public', 'sitemap.xml')

const today = new Date().toISOString().split('T')[0]

const routes = [
  { loc: '/', priority: 1.0, changefreq: 'weekly' },
  { loc: '/login', priority: 0.4, changefreq: 'monthly' },
  { loc: '/demo', priority: 0.7, changefreq: 'monthly' },
  { loc: '/nosotros', priority: 0.6, changefreq: 'monthly' },
  { loc: '/precios', priority: 0.8, changefreq: 'weekly' },
  { loc: '/privacidad', priority: 0.3, changefreq: 'yearly' },
  { loc: '/terminos', priority: 0.3, changefreq: 'yearly' },
  { loc: '/forgot-password', priority: 0.2, changefreq: 'yearly' },
  { loc: '/reset-password', priority: 0.2, changefreq: 'yearly' },
  { loc: '/pago-exitoso', priority: 0.1, changefreq: 'yearly' },
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${SITE_URL}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>
`

const outDir = dirname(OUTPUT)
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
writeFileSync(OUTPUT, xml, 'utf-8')
console.log(`sitemap.xml generated at ${OUTPUT} (${routes.length} URLs)`)
