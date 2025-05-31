import { Import } from './Import.model';
import type { OperationParameter } from './OperationParameter.model';

export interface OperationParameters {
    imports: Import[];
    parameters: OperationParameter[];
    parametersPath: OperationParameter[];
    parametersQuery: OperationParameter[];
    parametersForm: OperationParameter[];
    parametersCookie: OperationParameter[];
    parametersHeader: OperationParameter[];
    parametersBody: OperationParameter | null;
}
