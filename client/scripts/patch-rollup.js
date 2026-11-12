import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rollupNativePath = path.resolve(__dirname, '../node_modules/rollup/dist/native.js');

if (fs.existsSync(rollupNativePath)) {
  let content = fs.readFileSync(rollupNativePath, 'utf8');
  if (!content.includes('@rollup/wasm-node/dist/native.js')) {
    const target = 'const nativeModule = requireWithFriendlyError(';
    if (content.includes(target)) {
      const replacement = `let nativeModule;
try {
	nativeModule = requireWithFriendlyError(
		existsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
	);
} catch (e) {
	try {
		nativeModule = require('@rollup/wasm-node/dist/native.js');
	} catch {
		throw e;
	}
}
const _unused_nativeModule = (`;
      content = content.replace(target, replacement);
      fs.writeFileSync(rollupNativePath, content, 'utf8');
      console.log('✔ Patched rollup to support WASM fallback');
    }
  }
}
