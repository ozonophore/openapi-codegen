import type { Model } from './Model.model';

export interface OperationParameter extends Model {
    in: 'path' | 'query' | 'header' | 'formData' | 'body' | 'cookie';
    prop: string;
    mediaType: string | null;
}
