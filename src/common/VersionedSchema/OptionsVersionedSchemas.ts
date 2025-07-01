import { EVersionedSchemaType } from "./Enums";
import { optionsSchemaV1 } from "./OptionsSchemaV1";
import { optionsSchemaV2 } from "./OptionsSchemaV2";
import { optionsSchemaV3 } from "./OptionsSchemaV3";
import { VersionedSchema } from "./Types";

export const optionsVersionedSchemas: VersionedSchema<Record<string, any>>[] = [{
    version: '1.0.0',
    schema: optionsSchemaV1,
    type: EVersionedSchemaType.OPTIONS,
}, {
    version: '1.0.1',
    schema: optionsSchemaV2,
    type: EVersionedSchemaType.OPTIONS,
}, {
    version: '2.0.0',
    schema: optionsSchemaV3,
    type: EVersionedSchemaType.OPTIONS,
}];
