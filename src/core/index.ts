import { TRawOptions } from '../common/TRawOptions';
import { OpenApiClient } from './OpenApiClient';

export { HttpClient } from './types/enums/HttpClient.enum';

export async function generate(rawOptions: TRawOptions): Promise<void> {
    const openApiClient = new OpenApiClient();
    await openApiClient.generate(rawOptions);
}
