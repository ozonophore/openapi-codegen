import { OpenApiPath } from '../../api/v2/types/OpenApiPath.model';
import { OpenApiPaths } from '../../api/v3/types/OpenApiPaths.model';
import { Dictionary } from './Dictionary.model';

export interface CommonOpenApi {
    paths: OpenApiPaths | Dictionary<OpenApiPath>;
}
