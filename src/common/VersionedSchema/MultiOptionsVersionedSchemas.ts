import { EVersionedSchemaType } from "./Enums";
import { multiOptionsSchemaV1 } from "./MultiOptionsSchemaV1";
import { multiOptionsSchemaV2 } from "./MultiOptionsSchemaV2";
import { multiOptionsSchemaV3 } from "./MultiOptionsSchemaV3";
import { multiOptionsSchemaV4 } from "./MultiOptionsSchemaV4";
import { VersionedSchema } from "./Types";

export const multiOptionsVersionedSchema: VersionedSchema<Record<string, any>>[] = [{
    version: '1.0.0',
    schema: multiOptionsSchemaV1,
    type: EVersionedSchemaType.MULTI_OPTIONS,
}, {
    version: '1.0.1',
    schema: multiOptionsSchemaV2,
    type: EVersionedSchemaType.MULTI_OPTIONS,
}, {
    version: '1.0.2',
    schema: multiOptionsSchemaV3,
    type: EVersionedSchemaType.MULTI_OPTIONS,
}, {
    version: '2.0.0',
    schema: multiOptionsSchemaV4,
    type: EVersionedSchemaType.MULTI_OPTIONS,
}];
