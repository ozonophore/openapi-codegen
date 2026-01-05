/* eslint-disable simple-import-sort/imports */
import * as Handlebars from 'handlebars/runtime';

import templateCoreApiError from '../../templatesCompiled/client/core/ApiError';
import templateCoreApiRequestOptions from '../../templatesCompiled/client/core/ApiRequestOptions';
import templateCoreApiResult from '../../templatesCompiled/client/core/ApiResult';
import templateHttpStatuses from '../../templatesCompiled/client/core/HttpStatusCode';
// axios START
import axiosGetHeaders from '../../templatesCompiled/client/core/axios/getHeaders';
import axiosGetRequestBody from '../../templatesCompiled/client/core/axios/getRequestBody';
import axiosGetResponseBody from '../../templatesCompiled/client/core/axios/getResponseBody';
import axiosGetResponseHeader from '../../templatesCompiled/client/core/axios/getResponseHeader';
import axiosRequest from '../../templatesCompiled/client/core/axios/request';
import axiosSendRequest from '../../templatesCompiled/client/core/axios/sendRequest';
// axios END
import fetchGetHeaders from '../../templatesCompiled/client/core/fetch/getHeaders';
import fetchGetRequestBody from '../../templatesCompiled/client/core/fetch/getRequestBody';
import fetchGetResponseBody from '../../templatesCompiled/client/core/fetch/getResponseBody';
import fetchGetResponseHeader from '../../templatesCompiled/client/core/fetch/getResponseHeader';
import fetchRequest from '../../templatesCompiled/client/core/fetch/request';
import fetchSendRequest from '../../templatesCompiled/client/core/fetch/sendRequest';
import functionCatchErrors from '../../templatesCompiled/client/core/functions/catchErrors';
import functionGetFormData from '../../templatesCompiled/client/core/functions/getFormData';
import functionGetQueryString from '../../templatesCompiled/client/core/functions/getQueryString';
import functionGetUrl from '../../templatesCompiled/client/core/functions/getUrl';
import functionIsBinary from '../../templatesCompiled/client/core/functions/isBinary';
import functionIsBlob from '../../templatesCompiled/client/core/functions/isBlob';
import functionIsDefined from '../../templatesCompiled/client/core/functions/isDefined';
import functionIsString from '../../templatesCompiled/client/core/functions/isString';
import functionIsStringWithValue from '../../templatesCompiled/client/core/functions/isStringWithValue';
import functionIsSuccess from '../../templatesCompiled/client/core/functions/isSuccess';
import functionResolve from '../../templatesCompiled/client/core/functions/resolve';
import nodeGetHeaders from '../../templatesCompiled/client/core/node/getHeaders';
import nodeGetRequestBody from '../../templatesCompiled/client/core/node/getRequestBody';
import nodeGetResponseBody from '../../templatesCompiled/client/core/node/getResponseBody';
import nodeGetResponseHeader from '../../templatesCompiled/client/core/node/getResponseHeader';
import nodeRequest from '../../templatesCompiled/client/core/node/request';
import nodeSendRequest from '../../templatesCompiled/client/core/node/sendRequest';
import templateCoreSettings from '../../templatesCompiled/client/core/OpenAPI';
import templateCancellablePromise from '../../templatesCompiled/client/core/CancelablePromise';
import templateCoreRequest from '../../templatesCompiled/client/core/request';
import templateCoreRequestExecutor from '../../templatesCompiled/client/core/request-executor';
import templateLegacyRequestAdapter from '../../templatesCompiled/client/core/legacy-request-adapter';
import xhrGetHeaders from '../../templatesCompiled/client/core/xhr/getHeaders';
import xhrGetRequestBody from '../../templatesCompiled/client/core/xhr/getRequestBody';
import xhrGetResponseBody from '../../templatesCompiled/client/core/xhr/getResponseBody';
import xhrGetResponseHeader from '../../templatesCompiled/client/core/xhr/getResponseHeader';
import xhrRequest from '../../templatesCompiled/client/core/xhr/request';
import xhrSendRequest from '../../templatesCompiled/client/core/xhr/sendRequest';
import templateExportModel from '../../templatesCompiled/client/exportModel';
import templateExportSchema from '../../templatesCompiled/client/exportSchema';
import templateExportService from '../../templatesCompiled/client/exportService';
import templateFullIndex from '../../templatesCompiled/client/indexFull';
import templateSimpeIndex from '../../templatesCompiled/client/indexSimple';
import templateCore from '../../templatesCompiled/client/indexCore';
import templateModels from '../../templatesCompiled/client/indexModels';
import templateSchemas from '../../templatesCompiled/client/indexShemas';
import templateServices from '../../templatesCompiled/client/indexServices'
import partialBase from '../../templatesCompiled/client/partials/base';
import partialExportComposition from '../../templatesCompiled/client/partials/exportComposition';
import partialExportEnum from '../../templatesCompiled/client/partials/exportEnum';
import partialExportInterface from '../../templatesCompiled/client/partials/exportInterface';
import partialExportType from '../../templatesCompiled/client/partials/exportType';
import partialHeader from '../../templatesCompiled/client/partials/header';
import partialIsNullable from '../../templatesCompiled/client/partials/isNullable';
import partialIsReadOnly from '../../templatesCompiled/client/partials/isReadOnly';
import partialIsRequired from '../../templatesCompiled/client/partials/isRequired';
import partialIsRequiredDefinition from '../../templatesCompiled/client/partials/isRequiredDefinition';
import partialParameters from '../../templatesCompiled/client/partials/parameters';
import partialParametersDefinition from '../../templatesCompiled/client/partials/parametersDefinition';
import partialParameterValues from '../../templatesCompiled/client/partials/parameterValues';
import partialResult from '../../templatesCompiled/client/partials/result';
import partialSchema from '../../templatesCompiled/client/partials/schema';
import partialSchemaArray from '../../templatesCompiled/client/partials/schemaArray';
import partialSchemaComposition from '../../templatesCompiled/client/partials/schemaComposition';
import partialSchemaDictionary from '../../templatesCompiled/client/partials/schemaDictionary';
import partialSchemaEnum from '../../templatesCompiled/client/partials/schemaEnum';
import partialSchemaGeneric from '../../templatesCompiled/client/partials/schemaGeneric';
import partialSchemaInterface from '../../templatesCompiled/client/partials/schemaInterface';
import partialServiceOption from '../../templatesCompiled/client/partials/serviceOption';
import partialType from '../../templatesCompiled/client/partials/type';
import partialTypeArray from '../../templatesCompiled/client/partials/typeArray';
import partialTypeDictionary from '../../templatesCompiled/client/partials/typeDictionary';
import partialTypeEnum from '../../templatesCompiled/client/partials/typeEnum';
import partialTypeGeneric from '../../templatesCompiled/client/partials/typeGeneric';
import partialTypeInterface from '../../templatesCompiled/client/partials/typeInterface';
import partialTypeIntersection from '../../templatesCompiled/client/partials/typeIntersection';
import partialTypeReference from '../../templatesCompiled/client/partials/typeReference';
import partialTypeUnion from '../../templatesCompiled/client/partials/typeUnion';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';
import { HttpClient } from '../types/enums/HttpClient.enum';

export interface Templates {
    indexes: {
        full: Handlebars.TemplateDelegate;
        simple: Handlebars.TemplateDelegate;
        core: Handlebars.TemplateDelegate;
        models: Handlebars.TemplateDelegate;
        schemas: Handlebars.TemplateDelegate;
        services: Handlebars.TemplateDelegate;
    }
    exports: {
        model: Handlebars.TemplateDelegate;
        schema: Handlebars.TemplateDelegate;
        service: Handlebars.TemplateDelegate;
    };
    core: {
        settings: Handlebars.TemplateDelegate;
        apiError: Handlebars.TemplateDelegate;
        apiRequestOptions: Handlebars.TemplateDelegate;
        apiResult: Handlebars.TemplateDelegate;
        request: Handlebars.TemplateDelegate;
        cancelablePromise: Handlebars.TemplateDelegate;
        httpStatusCode: Handlebars.TemplateDelegate;
        requestExecutor: Handlebars.TemplateDelegate;
        legacyRequestAdapter: Handlebars.TemplateDelegate;
    };
}

/**
 * Read all the Handlebar templates that we need and return on wrapper object
 * so we can easily access the templates in out generator / write functions.
 */
export function registerHandlebarTemplates(root: { httpClient: HttpClient; useOptions: boolean; useUnionTypes: boolean }): Templates {
    registerHandlebarHelpers(root);

    // Main templates (entry points for the files we write to disk)
    const templates: Templates = {
        indexes: {
            full: Handlebars.template(templateFullIndex),
            simple: Handlebars.template(templateSimpeIndex),
            core: Handlebars.template(templateCore),
            models: Handlebars.template(templateModels),
            schemas: Handlebars.template(templateSchemas),
            services: Handlebars.template(templateServices),
        },
        exports: {
            model: Handlebars.template(templateExportModel),
            schema: Handlebars.template(templateExportSchema),
            service: Handlebars.template(templateExportService),
        },
        core: {
            settings: Handlebars.template(templateCoreSettings),
            apiError: Handlebars.template(templateCoreApiError),
            apiRequestOptions: Handlebars.template(templateCoreApiRequestOptions),
            apiResult: Handlebars.template(templateCoreApiResult),
            request: Handlebars.template(templateCoreRequest),
            cancelablePromise: Handlebars.template(templateCancellablePromise),
            httpStatusCode: Handlebars.template(templateHttpStatuses),
            requestExecutor: Handlebars.template(templateCoreRequestExecutor),
            legacyRequestAdapter: Handlebars.template(templateLegacyRequestAdapter),
        },
    };

    // Partials for the generations of the models, services, etc.
    Handlebars.registerPartial('exportEnum', Handlebars.template(partialExportEnum));
    Handlebars.registerPartial('exportInterface', Handlebars.template(partialExportInterface));
    Handlebars.registerPartial('exportComposition', Handlebars.template(partialExportComposition));
    Handlebars.registerPartial('exportType', Handlebars.template(partialExportType));
    Handlebars.registerPartial('header', Handlebars.template(partialHeader));
    Handlebars.registerPartial('isNullable', Handlebars.template(partialIsNullable));
    Handlebars.registerPartial('isReadOnly', Handlebars.template(partialIsReadOnly));
    Handlebars.registerPartial('isRequired', Handlebars.template(partialIsRequired));
    Handlebars.registerPartial('isRequiredDefinition', Handlebars.template(partialIsRequiredDefinition));
    Handlebars.registerPartial('parameters', Handlebars.template(partialParameters));
    Handlebars.registerPartial('parametersDefinition', Handlebars.template(partialParametersDefinition));
    Handlebars.registerPartial('parameterValues', Handlebars.template(partialParameterValues));
    Handlebars.registerPartial('result', Handlebars.template(partialResult));
    Handlebars.registerPartial('serviceOption', Handlebars.template(partialServiceOption));
    Handlebars.registerPartial('schema', Handlebars.template(partialSchema));
    Handlebars.registerPartial('schemaArray', Handlebars.template(partialSchemaArray));
    Handlebars.registerPartial('schemaDictionary', Handlebars.template(partialSchemaDictionary));
    Handlebars.registerPartial('schemaEnum', Handlebars.template(partialSchemaEnum));
    Handlebars.registerPartial('schemaGeneric', Handlebars.template(partialSchemaGeneric));
    Handlebars.registerPartial('schemaInterface', Handlebars.template(partialSchemaInterface));
    Handlebars.registerPartial('schemaComposition', Handlebars.template(partialSchemaComposition));
    Handlebars.registerPartial('type', Handlebars.template(partialType));
    Handlebars.registerPartial('typeArray', Handlebars.template(partialTypeArray));
    Handlebars.registerPartial('typeDictionary', Handlebars.template(partialTypeDictionary));
    Handlebars.registerPartial('typeEnum', Handlebars.template(partialTypeEnum));
    Handlebars.registerPartial('typeGeneric', Handlebars.template(partialTypeGeneric));
    Handlebars.registerPartial('typeInterface', Handlebars.template(partialTypeInterface));
    Handlebars.registerPartial('typeReference', Handlebars.template(partialTypeReference));
    Handlebars.registerPartial('typeUnion', Handlebars.template(partialTypeUnion));
    Handlebars.registerPartial('typeIntersection', Handlebars.template(partialTypeIntersection));
    Handlebars.registerPartial('base', Handlebars.template(partialBase));

    // Generic functions used in 'request' file @see src/templates/core/request for more info
    Handlebars.registerPartial('functions/catchErrors', Handlebars.template(functionCatchErrors));
    Handlebars.registerPartial('functions/getFormData', Handlebars.template(functionGetFormData));
    Handlebars.registerPartial('functions/getQueryString', Handlebars.template(functionGetQueryString));
    Handlebars.registerPartial('functions/getUrl', Handlebars.template(functionGetUrl));
    Handlebars.registerPartial('functions/isBinary', Handlebars.template(functionIsBinary));
    Handlebars.registerPartial('functions/isBlob', Handlebars.template(functionIsBlob));
    Handlebars.registerPartial('functions/isDefined', Handlebars.template(functionIsDefined));
    Handlebars.registerPartial('functions/isString', Handlebars.template(functionIsString));
    Handlebars.registerPartial('functions/isStringWithValue', Handlebars.template(functionIsStringWithValue));
    Handlebars.registerPartial('functions/isSuccess', Handlebars.template(functionIsSuccess));
    Handlebars.registerPartial('functions/resolve', Handlebars.template(functionResolve));

    // Specific files for the fetch client implementation
    Handlebars.registerPartial('fetch/getHeaders', Handlebars.template(fetchGetHeaders));
    Handlebars.registerPartial('fetch/getRequestBody', Handlebars.template(fetchGetRequestBody));
    Handlebars.registerPartial('fetch/getResponseBody', Handlebars.template(fetchGetResponseBody));
    Handlebars.registerPartial('fetch/getResponseHeader', Handlebars.template(fetchGetResponseHeader));
    Handlebars.registerPartial('fetch/sendRequest', Handlebars.template(fetchSendRequest));
    Handlebars.registerPartial('fetch/request', Handlebars.template(fetchRequest));

    // Specific files for the xhr client implementation
    Handlebars.registerPartial('xhr/getHeaders', Handlebars.template(xhrGetHeaders));
    Handlebars.registerPartial('xhr/getRequestBody', Handlebars.template(xhrGetRequestBody));
    Handlebars.registerPartial('xhr/getResponseBody', Handlebars.template(xhrGetResponseBody));
    Handlebars.registerPartial('xhr/getResponseHeader', Handlebars.template(xhrGetResponseHeader));
    Handlebars.registerPartial('xhr/sendRequest', Handlebars.template(xhrSendRequest));
    Handlebars.registerPartial('xhr/request', Handlebars.template(xhrRequest));

    // Specific files for the node client implementation
    Handlebars.registerPartial('node/getHeaders', Handlebars.template(nodeGetHeaders));
    Handlebars.registerPartial('node/getRequestBody', Handlebars.template(nodeGetRequestBody));
    Handlebars.registerPartial('node/getResponseBody', Handlebars.template(nodeGetResponseBody));
    Handlebars.registerPartial('node/getResponseHeader', Handlebars.template(nodeGetResponseHeader));
    Handlebars.registerPartial('node/sendRequest', Handlebars.template(nodeSendRequest));
    Handlebars.registerPartial('node/request', Handlebars.template(nodeRequest));

    // Specific files for the axios client implementation
    Handlebars.registerPartial('axios/getHeaders', Handlebars.template(axiosGetHeaders));
    Handlebars.registerPartial('axios/getRequestBody', Handlebars.template(axiosGetRequestBody));
    Handlebars.registerPartial('axios/getResponseBody', Handlebars.template(axiosGetResponseBody));
    Handlebars.registerPartial('axios/getResponseHeader', Handlebars.template(axiosGetResponseHeader));
    Handlebars.registerPartial('axios/sendRequest', Handlebars.template(axiosSendRequest));
    Handlebars.registerPartial('axios/request', Handlebars.template(axiosRequest));

    return templates;
}
