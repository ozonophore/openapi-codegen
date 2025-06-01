import { OpenApiPath } from '../openApi/v2/types/OpenApiPath';
import { OpenApiPaths } from '../openApi/v3/types/OpenApiPaths';
import { Dictionary } from './Dictionary.model';

export interface CommonOpenApi {
    paths: OpenApiPaths | Dictionary<OpenApiPath>;
}
