// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "  { name: '"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":14,"column":13},"end":{"line":14,"column":17}} ), depth0)) != null ? stack1 : "")
    + "', serviceId: '"
    + ((stack1 = alias2(alias1(depth0, "serviceId", {"start":{"line":14,"column":36},"end":{"line":14,"column":45}} ), depth0)) != null ? stack1 : "")
    + "' },\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "/**\n * Swarm API Server\n * Automatically generated HTTP server for "
    + ((stack1 = alias2(alias1(depth0, "swarmName", {"start":{"line":3,"column":45},"end":{"line":3,"column":54}} ), depth0)) != null ? stack1 : "")
    + " coordination\n */\n\nimport http from 'http';\n\nimport { "
    + ((stack1 = alias2(alias1(depth0, "swarmNameCamel", {"start":{"line":8,"column":11},"end":{"line":8,"column":25}} ), depth0)) != null ? stack1 : "")
    + "Coordinator } from './coordinator';\n\nconst DEFAULT_PORT = "
    + ((stack1 = alias2(alias1(depth0, "port", {"start":{"line":10,"column":23},"end":{"line":10,"column":27}} ), depth0)) != null ? stack1 : "")
    + ";\n\nconst avatars: Array<{ name: string; serviceId: string }> = [\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"avatars"),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":15,"column":9}}})) != null ? stack1 : "")
    + "];\n\nfunction sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {\n  res.writeHead(statusCode, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify(data));\n}\n\nfunction parseJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {\n  return new Promise((resolve, reject) => {\n    let body = '';\n\n    req.on('data', chunk => {\n      body += chunk;\n    });\n\n    req.on('end', () => {\n      try {\n        resolve(body ? JSON.parse(body) : {});\n      } catch (error) {\n        reject(error);\n      }\n    });\n\n    req.on('error', reject);\n  });\n}\n\nexport function createApiServer(): http.Server {\n  return http.createServer(async (req, res) => {\n    const url = req.url?.split('?')[0] ?? '/';\n    const method = req.method ?? 'GET';\n\n    try {\n      if (method === 'GET' && url === '/health') {\n        sendJson(res, 200, {\n          healthy: "
    + ((stack1 = alias2(alias1(depth0, "swarmNameCamel", {"start":{"line":51,"column":21},"end":{"line":51,"column":35}} ), depth0)) != null ? stack1 : "")
    + "Coordinator.isHealthy(),\n          services: "
    + ((stack1 = alias2(alias1(depth0, "swarmNameCamel", {"start":{"line":52,"column":22},"end":{"line":52,"column":36}} ), depth0)) != null ? stack1 : "")
    + "Coordinator.getHealthStatus(),\n        });\n        return;\n      }\n\n      if (method === 'GET' && url === '/services') {\n        sendJson(res, 200, { avatars });\n        return;\n      }\n\n      if (method === 'POST' && url === '/consensus/propose') {\n        const body = await parseJsonBody(req);\n        const operationId = body.operationId;\n        const operation = body.operation;\n        const services = body.services;\n\n        if (\n          typeof operationId !== 'string' ||\n          typeof operation !== 'string' ||\n          !Array.isArray(services)\n        ) {\n          sendJson(res, 400, { error: 'Missing operationId, operation, or services array' });\n          return;\n        }\n\n        const result = await "
    + ((stack1 = alias2(alias1(depth0, "swarmNameCamel", {"start":{"line":77,"column":31},"end":{"line":77,"column":45}} ), depth0)) != null ? stack1 : "")
    + "Coordinator.proposeConsensus(\n          operationId,\n          operation,\n          services as string[]\n        );\n        sendJson(res, 200, result);\n        return;\n      }\n\n      if (method === 'GET' && url === '/metrics') {\n        sendJson(res, 200, {\n          health: "
    + ((stack1 = alias2(alias1(depth0, "swarmNameCamel", {"start":{"line":88,"column":20},"end":{"line":88,"column":34}} ), depth0)) != null ? stack1 : "")
    + "Coordinator.getHealthStatus(),\n          avatarCount: avatars.length,\n        });\n        return;\n      }\n\n      sendJson(res, 404, { error: 'Not found' });\n    } catch (error) {\n      sendJson(res, 500, {\n        error: error instanceof Error ? error.message : 'Internal server error',\n      });\n    }\n  });\n}\n\nexport function startApiServer(port: number = DEFAULT_PORT): http.Server {\n  const server = createApiServer();\n  server.listen(port, () => {\n    console.log(`Swarm API server listening on port ${port}`);\n  });\n  return server;\n}\n";
},"useData":true}