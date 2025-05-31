import { Import } from './Import';
import type { OperationParameter } from './OperationParameter';

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
