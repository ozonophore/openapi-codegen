import { EVersionedSchemaType } from "../Enums";
import { VersionedSchema } from "../Types";
import { optionsSchemaV1 } from "./OptionsSchemaV1";
import { optionsSchemaV2 } from "./OptionsSchemaV2";
import { optionsSchemaV3 } from "./OptionsSchemaV3";
import { optionsSchemaV4 } from "./OptionsSchemaV4";

export const optionsVersionedSchemas: VersionedSchema<Record<string, any>>[] = [{
    version: 'v1',
    schema: optionsSchemaV1,
    type: EVersionedSchemaType.OPTIONS,
}, {
    version: 'v2',
    schema: optionsSchemaV2,
    type: EVersionedSchemaType.OPTIONS,
}, {
    version: 'v3',
    schema: optionsSchemaV3,
    type: EVersionedSchemaType.OPTIONS,
}, {
    version: 'v4',
    schema: optionsSchemaV4,
    type: EVersionedSchemaType.OPTIONS,
}];
