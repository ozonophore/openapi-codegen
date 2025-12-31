import { EVersionedSchemaType } from "../Enums";
import { VersionedSchema } from "../Types";
import { unifiedOptionsSchemaV1 } from "./UnifiedOptionsSchemaV1";

export const unifiedOptionsVersionedSchemas: VersionedSchema<Record<string, any>>[] = [{
    version: 'v1',
    schema: unifiedOptionsSchemaV1,
    type: EVersionedSchemaType.UNIFIED_OPTIONS,
}];