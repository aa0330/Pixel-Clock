// Builds client.js from template.js + the planet shaders in src/planetShaders.ts.
// Run: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, 'src/planetShaders.ts');
const fontFile = resolve(here, 'desktop/vendor/fusion-pixel.woff2');

function extract(text, name) {
  const match = text.match(new RegExp(`export const ${name} = \`([\\s\\S]*?)\``));
  if (!match) throw new Error(`cannot find ${name} in ${source}`);
  if (match[1].includes('`')) throw new Error(`${name} contains a backtick; extraction unsafe`);
  return match[1];
}

const shaders = readFileSync(source, 'utf8');
const vertex = extract(shaders, 'PLANET_VERTEX_SHADER');
const fragment = extract(shaders, 'PLANET_FRAGMENT_SHADER');

const fontData = readFileSync(fontFile).toString('base64');
const fontUrl = `data:font/woff2;base64,${fontData}`;

const template = readFileSync(resolve(here, 'template.js'), 'utf8');
const output = template
  .split('"__VERTEX_SHADER_JSON__"').join(JSON.stringify(vertex))
  .split('"__FRAGMENT_SHADER_JSON__"').join(JSON.stringify(fragment))
  .split('"__PIXEL_FONT_DATA_URL__"').join(JSON.stringify(fontUrl));

writeFileSync(resolve(here, 'client.js'), output);
console.log(
  `client.js written: vertex ${vertex.length} chars, fragment ${fragment.length} chars, font ${fontData.length} base64 chars, total ${output.length} chars`,
);
