import type { Model } from './Model.model';

export interface OperationResponse extends Model {
    in: 'response' | 'header';
    code: number;
}
