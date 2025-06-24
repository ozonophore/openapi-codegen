import type { OpenApiContact } from './OpenApiContact.model';
import type { OpenApiLicense } from './OpenApiLicense.model';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#infoObject
 */
export interface OpenApiInfo {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: OpenApiContact;
    license?: OpenApiLicense;
    version: string;
}
