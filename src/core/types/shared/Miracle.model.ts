export type MiracleType = 'RENAME' | 'TYPE_COERCION';

export type MiracleStatus = 'auto-generated' | 'confirmed';

export interface MiracleEntry {
    oldPath: string;
    newPath: string;
    type: MiracleType;
    confidence: number;
    status: MiracleStatus;
    modelName?: string;
    oldProperty?: string;
    newProperty?: string;
}
