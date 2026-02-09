// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function catchErrors(options: ApiRequestOptions, result: ApiResult): void {\n    const errors: Record<string, string> = {\n        [EHTTP_STATUS_CODES.BAD_GATEWAY]: EHTTP_STATUS_NAME.BAD_GATEWAY,\n        [EHTTP_STATUS_CODES.BAD_REQUEST]: EHTTP_STATUS_NAME.BAD_REQUEST,\n        [EHTTP_STATUS_CODES.FORBIDDEN]: EHTTP_STATUS_NAME.FORBIDDEN,\n        [EHTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: EHTTP_STATUS_NAME.INTERNAL_SERVER_ERROR,\n        [EHTTP_STATUS_CODES.NOT_FOUND]: EHTTP_STATUS_NAME.NOT_FOUND,\n        [EHTTP_STATUS_CODES.SERVICE_UNAVAILABLE]: EHTTP_STATUS_NAME.SERVICE_UNAVAILABLE,\n        [EHTTP_STATUS_CODES.UNAUTHORIZED]: EHTTP_STATUS_NAME.UNAUTHORIZED,\n        ...options.errors,\n    }\n\n    const error = errors[result.status];\n    if (error) {\n        throw new ApiError({\n            message: result.statusText,\n            status: result.status,\n            request: options,\n        });\n    }\n\n    if (!result.ok) {\n        throw new ApiError({\n            message: 'Generic Error',\n            status: result.status,\n            request: options,\n        });\n    }\n}\n";
},"useData":true}