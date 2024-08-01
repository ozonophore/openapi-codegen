import { isDefined } from '../../../utils/isDefined';
import type { Dictionary } from '../../../utils/types';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiMediaType } from '../interfaces/OpenApiMediaType';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

type TContent = {
    mediaType: string;
    schema: OpenApiSchema;
}

const CONTENT_MEDIA_TYPES = [
    'application/json-patch+json',
    'application/json',
    'text/json',
    'text/plain',
    'multipart/mixed',
    'multipart/related',
    'multipart/batch',
    'multipart/form-data',
]

export function getContent(content: Dictionary<OpenApiMediaType>): TContent | null {
    const mediaTypesWithSchema = Object.keys(content).find(mediaType => {
        const cleanMediaType = mediaType.split(';')[0].trim();

        return CONTENT_MEDIA_TYPES.includes(cleanMediaType) && isDefined(content[mediaType]?.schema);
    })

    if (mediaTypesWithSchema) {
        return {
            mediaType: mediaTypesWithSchema,
            schema: content[mediaTypesWithSchema].schema as OpenApiSchema,
        };
    }

    return null
}
