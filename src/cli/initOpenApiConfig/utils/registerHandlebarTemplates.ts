import templateRequest from '../../../templatesCompiled/cli/customRequest';
import templateRequestExecutor from '../../../templatesCompiled/cli/customRequestExecutor';
import templateConfig from '../../../templatesCompiled/cli/openApiConfig';
import partialHeader from '../../../templatesCompiled/client/partials/header';
import { CLITemplates } from '../Types';


export function registerHandlebarTemplates(): CLITemplates {
    const templates: CLITemplates = {
        config: Handlebars.template(templateConfig),
        request: Handlebars.template(templateRequest),
        requestExecutor: Handlebars.template(templateRequestExecutor),
    };

    Handlebars.registerPartial('header', Handlebars.template(partialHeader));

    return templates;
}
