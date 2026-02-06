import { TRawOptions } from '../common/TRawOptions';
import { OpenApiClient } from './OpenApiClient';
import { validateRawOptions } from './utils/validateRawOptions';

export { HttpClient } from './types/enums/HttpClient.enum';

export async function generate(rawOptions: TRawOptions): Promise<void> {
    validateRawOptions(rawOptions);

    const openApiClient = new OpenApiClient();
    await openApiClient.generate(rawOptions);
}
