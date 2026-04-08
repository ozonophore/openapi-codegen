import type { Dictionary } from '../../../types/shared/Dictionary.model';
import { isDefined } from '../../../utils/isDefined';
import type { OpenApiMediaType } from '../types/OpenApiMediaType.model';
import type { OpenApiSchema } from '../types/OpenApiSchema.model';

type TContent = {
    mediaType: string;
    schema: OpenApiSchema;
};

type MediaTypeEntry = [mediaType: string, mediaTypeObject: OpenApiMediaType];

function normalizeMediaType(mediaType: string): string {
    return mediaType.split(';')[0].trim().toLowerCase();
}

export function getContent(content: Dictionary<OpenApiMediaType>): TContent | null {
    const entriesWithSchema: MediaTypeEntry[] = Object.entries(content).filter(([, mediaTypeObject]) => isDefined(mediaTypeObject?.schema));

    if (entriesWithSchema.length === 0) {
        return null;
    }

    const getByPredicate = (predicate: (normalizedMediaType: string) => boolean): MediaTypeEntry | undefined => {
        return entriesWithSchema.find(([mediaType]) => predicate(normalizeMediaType(mediaType)));
    };

    const selectedEntry =
        getByPredicate(mediaType => mediaType === 'application/json') ??
        getByPredicate(mediaType => mediaType.startsWith('application/') && mediaType.endsWith('+json')) ??
        getByPredicate(mediaType => mediaType === '*/*') ??
        entriesWithSchema[0];

    if (!selectedEntry) {
        return null;
    }

    const [mediaType, mediaTypeObject] = selectedEntry;

    return {
        mediaType,
        schema: mediaTypeObject.schema as OpenApiSchema,
    };
}
