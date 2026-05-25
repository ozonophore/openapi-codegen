import type { Model } from './Model.model';
import type { MiracleEntry } from './Miracle.model';
import type { Service } from './Service.model';

export interface Client {
    version: string;
    server: string;
    models: Model[];
    services: Service[];
    miracles?: MiracleEntry[];
}
