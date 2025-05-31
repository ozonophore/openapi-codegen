import { OpenApiPath } from '../openApi/v2/interfaces/OpenApiPath';
import { OpenApiPaths } from '../openApi/v3/interfaces/OpenApiPaths';
import { Dictionary } from './Dictionary.model';

export interface CommonOpenApi {
    paths: OpenApiPaths | Dictionary<OpenApiPath>;
}
