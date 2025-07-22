import fs from 'fs';
import Handlebars from 'handlebars';
import path from 'path';

const templatesDir = path.resolve(__dirname, '../../templates');
const compiledDir = path.resolve(__dirname, '../../templatesCompiled');

const header = `// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default `;

/**
 * Фунукция для пре-компеляции шаблонов (hbs) перед дальнейшим использованием
 */
const precompileTemplates = () => {
    try {
        if (!fs.existsSync(compiledDir)) {
            fs.mkdirSync(compiledDir, { recursive: true });
        }

        const walk = (dir: string) => {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            files.forEach(file => {
                if (file.name === '__mocks__') {
                    return;
                }
                const filePath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    walk(filePath);
                } else if (file.isFile() && path.extname(file.name) === '.hbs') {
                    const templateName = path
                        .relative(templatesDir, filePath)
                        .replace(/\.hbs$/, '')
                        .replace(/\\/g, '/');
                    const templateContent = fs.readFileSync(filePath, 'utf8');
                    const precompiled = Handlebars.precompile(templateContent, {
                        strict: true,
                        noEscape: true,
                        preventIndent: true,
                        knownHelpersOnly: true,
                        knownHelpers: {
                            equals: true,
                            notEquals: true,
                            containsSpaces: true,
                            union: true,
                            intersection: true,
                            enumerator: true,
                        },
                    });

                    const tsContent = header + (precompiled as any);
                    const outputFilePath = path.join(compiledDir, `${templateName}.ts`);
                    const outputDir = path.dirname(outputFilePath);

                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }
                    fs.writeFileSync(outputFilePath, tsContent, 'utf-8');
                }
            });
        };
        walk(templatesDir);

        console.log('The templates have been successfully precompiled and saved!');
    } catch (error) {
        console.error('Error during pre-compilation of templates: ', error);
    }
};

precompileTemplates();
