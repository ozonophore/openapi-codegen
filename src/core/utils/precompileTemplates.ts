import fs from 'fs';
import Handlebars from 'handlebars';
import { extname } from 'path';

import { ELogLevel, ELogOutput } from '../../common/Enums';
import { Logger } from '../../common/Logger';
import { dirNameHelper, joinHelper, relativeHelper, resolveHelper } from '../../common/utils/pathHelpers';
import { REGEX_BACKSLASH } from '../../core/types/Consts';

const templatesDir = resolveHelper(__dirname, '../../templates');
const compiledDir = resolveHelper(__dirname, '../../templatesCompiled');

const header = `// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default `;

/**
 * Function for template precompilation (hbs) before further use
 */
const precompileTemplates = () => {
    const logger = new Logger({
        instanceId: 'templates',
        level: ELogLevel.INFO,
        logOutput: ELogOutput.CONSOLE,
    });
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
                const filePath = joinHelper(dir, file.name);
                if (file.isDirectory()) {
                    walk(filePath);
                } else if (file.isFile() && extname(file.name) === '.hbs') {
                    const templateName = relativeHelper(templatesDir, filePath)
                        .replace(/\.hbs$/, '')
                        .replace(REGEX_BACKSLASH, '/');
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
                            containsSystemName: true,
                            normalizePath: true,
                            joinPath: true,
                            isNumericEnum: true,
                            isBasicType: true,
                            yupBaseSchema: true,
                            joiBaseSchema: true,
                            getRequiredFields: true,
                            getEnumType: true,
                            camelCase: true,
                        },
                    });

                    const tsContent = header + (precompiled as any);
                    const outputFilePath = joinHelper(compiledDir, `${templateName}.ts`);
                    const outputDir = dirNameHelper(outputFilePath);

                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }
                    fs.writeFileSync(outputFilePath, tsContent, 'utf-8');
                }
            });
        };
        walk(templatesDir);

        logger.info('The templates have been successfully precompiled and saved!');
    } catch (error: any) {
        logger.error(`Error during pre-compilation of templates: ${error.message}`);
    }
};

precompileTemplates();
