// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function catchErrors(options: ApiRequestOptions, result: ApiResult): void {\n    const errors: Record<string, string> = {\n        [EHTTP_STATUS_CODES.BAD_GATEWAY]: EHTTP_STATUS_NAME.BAD_GATEWAY,\n        [EHTTP_STATUS_CODES.BAD_REQUEST]: EHTTP_STATUS_NAME.BAD_REQUEST,\n        [EHTTP_STATUS_CODES.FORBIDDEN]: EHTTP_STATUS_NAME.FORBIDDEN,\n        [EHTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: EHTTP_STATUS_NAME.INTERNAL_SERVER_ERROR,\n        [EHTTP_STATUS_CODES.NOT_FOUND]: EHTTP_STATUS_NAME.NOT_FOUND,\n        [EHTTP_STATUS_CODES.SERVICE_UNAVAILABLE]: EHTTP_STATUS_NAME.SERVICE_UNAVAILABLE,\n        [EHTTP_STATUS_CODES.UNAUTHORIZED]: EHTTP_STATUS_NAME.UNAUTHORIZED,\n        ...options.errors,\n    }\n\n    const error = errors[result.status];\n    if (error) {\n        throw new ApiError(result, error);\n    }\n\n    if (!result.ok) {\n        throw new ApiError(result, 'Generic Error');\n    }\n}\n";
},"useData":true}