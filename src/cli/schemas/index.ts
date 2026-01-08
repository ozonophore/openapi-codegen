export * from './base';
export * from './checkConfig';
export * from './generate';
export * from './init';
export * from './updateConfig';

// Тип для всех возможных CLI опций (для union type)
export type CLIOptions = import('./generate').GenerateOptions | import('./checkConfig').CheckConfigOptions | import('./updateConfig').UpdateConfigOptions | import('./init').InitOptions;
