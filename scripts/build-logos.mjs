// assets/brands/*.svg dosyalarını okuyup src/data/brandLogos.ts üretir.
// Logo eklemek/değiştirmek için: dosyayı assets/brands/<marka-slug>.svg olarak koy ve `npm run logos` çalıştır.
//   slug kuralı: küçük harf, aksansız, harf/rakam dışı -> "-"  (Škoda -> skoda, Mercedes-Benz -> mercedes-benz)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const DIR = 'assets/brands';

function clean(svg) {
  svg = svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<metadata[\s\S]*?<\/metadata>/g, '')
    .replace(/<sodipodi:[\s\S]*?(\/>|<\/sodipodi:[^>]*>)/g, '')
    .replace(/\s(?:inkscape|sodipodi|xmlns:(?!xlink)[a-z]+):?[\w-]*="[^"]*"/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // viewBox yoksa width/height'tan üret (ölçeklenebilsin)
  if (!/viewBox=/.test(svg)) {
    const w = svg.match(/<svg[^>]*\swidth="([\d.]+)/)?.[1];
    const h = svg.match(/<svg[^>]*\sheight="([\d.]+)/)?.[1];
    if (w && h) svg = svg.replace('<svg', `<svg viewBox="0 0 ${w} ${h}"`);
  }
  return svg;
}

/** PNG/JPG boyutunu başlıktan okur. */
function rasterSize(buf) {
  if (buf.readUInt32BE(0) === 0x89504e47) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  let o = 2;
  while (o < buf.length) {
    if (buf[o] !== 0xff) { o++; continue; }
    const m = buf[o + 1];
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [buf.readUInt16BE(o + 7), buf.readUInt16BE(o + 5)];
    o += 2 + buf.readUInt16BE(o + 2);
  }
  throw new Error('JPEG boyutu okunamadı');
}

/** Raster logo (PNG/JPG) -> içine gömülü SVG. assets/brands/seres.png gibi dosyalar doğrudan kullanılır. */
function wrapRaster(file) {
  const buf = readFileSync(`${DIR}/${file}`);
  const [w, h] = rasterSize(buf);
  const mime = /\.png$/i.test(file) ? 'image/png' : 'image/jpeg';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><image width="${w}" height="${h}" href="data:${mime};base64,${buf.toString('base64')}"/></svg>`;
}

const logos = {};
// Raster dosyalar (SVG aynı adla varsa SVG kazanır)
for (const f of readdirSync(DIR).filter((f) => /\.(png|jpe?g)$/i.test(f) && !f.startsWith('_')).sort()) {
  logos[f.replace(/\.[^.]+$/, '')] = wrapRaster(f);
}
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.svg') && !f.startsWith('_')).sort()) {
  logos[f.replace(/\.svg$/, '')] = clean(readFileSync(`${DIR}/${f}`, 'utf8'));
}

const out =
  `// OTOMATİK ÜRETİLDİ: scripts/build-logos.mjs (kaynak: assets/brands/*.svg). Elle düzenleme.\n` +
  `// Logolar ilgili markaların tescilli markalarıdır; yalnızca marka tanımlama amacıyla gösterilir.\n` +
  `export const BRAND_LOGOS: Record<string, string> = ${JSON.stringify(logos, null, 1)};\n`;
writeFileSync('src/data/brandLogos.ts', out);
console.log(`${Object.keys(logos).length} logo -> src/data/brandLogos.ts (${(out.length / 1024).toFixed(0)} KB)`);
