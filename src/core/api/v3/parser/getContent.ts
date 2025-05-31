import type { Dictionary } from '../../../types/shared/Dictionary.model';
import { isDefined } from '../../../utils/isDefined';
import type { OpenApiMediaType } from '../types/OpenApiMediaType.model';
import type { OpenApiSchema } from '../types/OpenApiSchema.model';

type TContent = {
    mediaType: string;
    schema: OpenApiSchema;
};

const CONTENT_MEDIA_TYPES = ['application/json-patch+json', 'application/json', 'text/json', 'text/plain', 'multipart/mixed', 'multipart/related', 'multipart/batch', 'multipart/form-data'];

export function getContent(content: Dictionary<OpenApiMediaType>): TContent | null {
    const mediaTypesWithSchema = Object.keys(content).find(mediaType => {
        const cleanMediaType = mediaType.split(';')[0].trim();

        return CONTENT_MEDIA_TYPES.includes(cleanMediaType) && isDefined(content[mediaType]?.schema);
    });

    if (mediaTypesWithSchema) {
        return {
            mediaType: mediaTypesWithSchema,
            schema: content[mediaTypesWithSchema].schema as OpenApiSchema,
        };
    }

    return null;
}
