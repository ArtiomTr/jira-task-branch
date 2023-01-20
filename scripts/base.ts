import { build as buildJs, Options } from 'tsup';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFile, readFile, writeFile } from 'fs/promises';
import { minify as minifyHtml } from 'html-minifier-terser';
import cpy from 'cpy';

const getFilePath = (path: string) => {
	return resolve(dirname(fileURLToPath(import.meta.url)), path).replace(/\\/g, '/');
};

const buildHtml = async (source: string, destination: string) => {
	const input = await readFile(source);

	const output = await minifyHtml(input.toString(), { minifyCSS: true, collapseWhitespace: true });

	await writeFile(destination, output);
};

export const build = (options?: Options) => {
	buildJs({
		entry: [getFilePath('../src/popup.ts'), getFilePath('../src/background.ts')],
		onSuccess: async () => {
			await buildHtml(getFilePath('../src/popup.html'), getFilePath('../dist/popup.html'));
			await copyFile(getFilePath('../manifest.json'), getFilePath('../dist/manifest.json'));
			await cpy(getFilePath('../assets/*'), getFilePath('../dist'));
		},
		minify: true,
		clean: true,
		target: ['chrome103', 'ios12', 'safari14', 'firefox102', 'opera91'],
		...options,
	});
};
