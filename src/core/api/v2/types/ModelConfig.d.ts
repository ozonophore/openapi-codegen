import { OpenApi } from './OpenApi';
import { OpenApiSchema } from './OpenApiSchema';

export interface ModelConfig {
    openApi: OpenApi;
    definition: OpenApiSchema;
    isDefinition?: boolean;
    name?: string;
    path?: string;
    parentRef: string;
}
