import { OpenApi } from './OpenApi.model';
import { OpenApiSchema } from './OpenApiSchema.model';

export interface ModelConfig {
    openApi: OpenApi;
    definition: OpenApiSchema;
    isDefinition?: boolean;
    name?: string;
    path?: string;
    parentRef: string;
}
