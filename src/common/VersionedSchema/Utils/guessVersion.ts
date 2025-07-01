import { GuessVersion, VersionedSchema } from "../Types";

export function guessVersion(rawInput: Record<string, any>, schemas: VersionedSchema<Record<string, any>>[]) {
    const matchesSchemas = schemas
        .map((vs, idx) => {
            const { error } = vs.schema.validate(rawInput, { allowUnknown: true });

            return error ? null : ({ version: vs.version, index: idx } as GuessVersion);
        })
        .filter(it => it !== null);

    if (matchesSchemas.length === 0) {
        throw new Error('Data does not conform to any known version schema');
    }

    const latestVersion = matchesSchemas.reduce((a, b) => (a.index > b.index ? a : b));

    return latestVersion;
}
