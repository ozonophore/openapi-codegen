/* eslint-disable simple-import-sort/imports */
import * as Handlebars from 'handlebars/runtime';

import templateCoreApiError from '../../templatesCompiled/core/ApiError';
import templateCoreApiRequestOptions from '../../templatesCompiled/core/ApiRequestOptions';
import templateCoreApiResult from '../../templatesCompiled/core/ApiResult';
import templateHttpStatuses from '../../templatesCompiled/core/HttpStatusCode';
// axios START
import axiosGetHeaders from '../../templatesCompiled/core/axios/getHeaders';
import axiosGetRequestBody from '../../templatesCompiled/core/axios/getRequestBody';
import axiosGetResponseBody from '../../templatesCompiled/core/axios/getResponseBody';
import axiosGetResponseHeader from '../../templatesCompiled/core/axios/getResponseHeader';
import axiosRequest from '../../templatesCompiled/core/axios/request';
import axiosSendRequest from '../../templatesCompiled/core/axios/sendRequest';
// axios END
import fetchGetHeaders from '../../templatesCompiled/core/fetch/getHeaders';
import fetchGetRequestBody from '../../templatesCompiled/core/fetch/getRequestBody';
import fetchGetResponseBody from '../../templatesCompiled/core/fetch/getResponseBody';
import fetchGetResponseHeader from '../../templatesCompiled/core/fetch/getResponseHeader';
import fetchRequest from '../../templatesCompiled/core/fetch/request';
import fetchSendRequest from '../../templatesCompiled/core/fetch/sendRequest';
import functionCatchErrors from '../../templatesCompiled/core/functions/catchErrors';
import functionGetFormData from '../../templatesCompiled/core/functions/getFormData';
import functionGetQueryString from '../../templatesCompiled/core/functions/getQueryString';
import functionGetUrl from '../../templatesCompiled/core/functions/getUrl';
import functionIsBinary from '../../templatesCompiled/core/functions/isBinary';
import functionIsBlob from '../../templatesCompiled/core/functions/isBlob';
import functionIsDefined from '../../templatesCompiled/core/functions/isDefined';
import functionIsString from '../../templatesCompiled/core/functions/isString';
import functionIsStringWithValue from '../../templatesCompiled/core/functions/isStringWithValue';
import functionIsSuccess from '../../templatesCompiled/core/functions/isSuccess';
import functionResolve from '../../templatesCompiled/core/functions/resolve';
import nodeGetHeaders from '../../templatesCompiled/core/node/getHeaders';
import nodeGetRequestBody from '../../templatesCompiled/core/node/getRequestBody';
import nodeGetResponseBody from '../../templatesCompiled/core/node/getResponseBody';
import nodeGetResponseHeader from '../../templatesCompiled/core/node/getResponseHeader';
import nodeRequest from '../../templatesCompiled/core/node/request';
import nodeSendRequest from '../../templatesCompiled/core/node/sendRequest';
import templateCoreSettings from '../../templatesCompiled/core/OpenAPI';
import templateCancellablePromise from '../../templatesCompiled/core/CancelablePromise';
import templateCoreRequest from '../../templatesCompiled/core/request';
import xhrGetHeaders from '../../templatesCompiled/core/xhr/getHeaders';
import xhrGetRequestBody from '../../templatesCompiled/core/xhr/getRequestBody';
import xhrGetResponseBody from '../../templatesCompiled/core/xhr/getResponseBody';
import xhrGetResponseHeader from '../../templatesCompiled/core/xhr/getResponseHeader';
import xhrRequest from '../../templatesCompiled/core/xhr/request';
import xhrSendRequest from '../../templatesCompiled/core/xhr/sendRequest';
import templateExportModel from '../../templatesCompiled/exportModel';
import templateExportSchema from '../../templatesCompiled/exportSchema';
import templateExportService from '../../templatesCompiled/exportService';
import templateFullIndex from '../../templatesCompiled/indexFull';
import templateSimpeIndex from '../../templatesCompiled/indexSimple';
import templateModels from '../../templatesCompiled/indexModels';
import templateSchemas from '../../templatesCompiled/indexShemas';
import templateServices from '../../templatesCompiled/indexServices'
import partialBase from '../../templatesCompiled/partials/base';
import partialExportComposition from '../../templatesCompiled/partials/exportComposition';
import partialExportEnum from '../../templatesCompiled/partials/exportEnum';
import partialExportInterface from '../../templatesCompiled/partials/exportInterface';
import partialExportType from '../../templatesCompiled/partials/exportType';
import partialHeader from '../../templatesCompiled/partials/header';
import partialIsNullable from '../../templatesCompiled/partials/isNullable';
import partialIsReadOnly from '../../templatesCompiled/partials/isReadOnly';
import partialIsRequired from '../../templatesCompiled/partials/isRequired';
import partialParameters from '../../templatesCompiled/partials/parameters';
import partialParametersDefinition from '../../templatesCompiled/partials/parametersDefinition';
import partialParameterValues from '../../templatesCompiled/partials/parameterValues';
import partialResult from '../../templatesCompiled/partials/result';
import partialSchema from '../../templatesCompiled/partials/schema';
import partialSchemaArray from '../../templatesCompiled/partials/schemaArray';
import partialSchemaComposition from '../../templatesCompiled/partials/schemaComposition';
import partialSchemaDictionary from '../../templatesCompiled/partials/schemaDictionary';
import partialSchemaEnum from '../../templatesCompiled/partials/schemaEnum';
import partialSchemaGeneric from '../../templatesCompiled/partials/schemaGeneric';
import partialSchemaInterface from '../../templatesCompiled/partials/schemaInterface';
import partialServiceOption from '../../templatesCompiled/partials/serviceOption';
import partialType from '../../templatesCompiled/partials/type';
import partialTypeArray from '../../templatesCompiled/partials/typeArray';
import partialTypeDictionary from '../../templatesCompiled/partials/typeDictionary';
import partialTypeEnum from '../../templatesCompiled/partials/typeEnum';
import partialTypeGeneric from '../../templatesCompiled/partials/typeGeneric';
import partialTypeInterface from '../../templatesCompiled/partials/typeInterface';
import partialTypeIntersection from '../../templatesCompiled/partials/typeIntersection';
import partialTypeReference from '../../templatesCompiled/partials/typeReference';
import partialTypeUnion from '../../templatesCompiled/partials/typeUnion';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';
import { HttpClient } from '../types/Enums';

export interface Templates {
    indexes: {
        full: Handlebars.TemplateDelegate;
        simple: Handlebars.TemplateDelegate;
        models: Handlebars.TemplateDelegate;
        schemas: Handlebars.TemplateDelegate;
        service: Handlebars.TemplateDelegate;
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
            models: Handlebars.template(templateModels),
            schemas: Handlebars.template(templateSchemas),
            service: Handlebars.template(templateServices),
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
