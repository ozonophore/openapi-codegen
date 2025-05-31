export interface ConverterData {
    fieldName: string;
    format?: 'int32' | 'int64' | 'float' | 'double' | 'byte' | 'binary' | 'date' | 'date-time' | 'password';
    type?: string;
    properties: ConverterData[];
}
