import { EVersionedSchemaType } from "../Enums";
import { VersionedSchema } from "../Types";
import { multiOptionsSchemaV1 } from "./MultiOptionsSchemaV1";
import { multiOptionsSchemaV2 } from "./MultiOptionsSchemaV2";
import { multiOptionsSchemaV3 } from "./MultiOptionsSchemaV3";
import { multiOptionsSchemaV4 } from "./MultiOptionsSchemaV4";
import { multiOptionsSchemaV5 } from "./MultiOptionsSchemaV5";

export const multiOptionsVersionedSchema: VersionedSchema<Record<string, any>>[] = [{
    version: 'v1',
    schema: multiOptionsSchemaV1,
    type: EVersionedSchemaType.MULTI_OPTIONS,
}, {
    version: 'v2',
    schema: multiOptionsSchemaV2,
    type: EVersionedSchemaType.MULTI_OPTIONS,
}, {
    version: 'v3',
    schema: multiOptionsSchemaV3,
    type: EVersionedSchemaType.MULTI_OPTIONS,
}, {
    version: 'v4',
    schema: multiOptionsSchemaV4,
    type: EVersionedSchemaType.MULTI_OPTIONS,
}, {
    version: 'v5',
    schema: multiOptionsSchemaV5,
    type: EVersionedSchemaType.MULTI_OPTIONS,
}];
