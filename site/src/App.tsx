import React from 'react'
import ContentBlock from './component/ContentBlock';
import NavBar from './component/NavBar';
import TestComponent from './TestComponent';
import { data } from './data'
import { CodeBlock, dracula } from 'react-code-blocks';

function App() {
  return (
    <>
      <NavBar />
      <div className='container'>
        <ContentBlock>
          <div className='row'>
            <div className='col s6'>
              <h5>Why?</h5>
              <div>
              <ul>
                <li>- Frontend ❤️ OpenAPI, but we do not want to use JAVA codegen in our builds</li>
                <li>- Quick, lightweight, robust and framework agnostic 🚀</li>
                <li>- Supports generation of TypeScript clients</li>
                <li>- Supports generations of fetch and XHR http clients</li>
                <li>- Supports OpenAPI specification v2.0 and v3.0</li>
                <li>- Supports JSON and YAML files for input</li>
                <li>- Supports generation through CLI, Node.js and NPX</li>
                <li>- Supports tsc and @babel/plugin-transform-typescript</li>
                <li>- Supports axios</li>
                <li>- Supports customization names of models</li>
                <li>- Supports external references using <a href="https://github.com/APIDevTools/json-schema-ref-parser/"><code>json-schema-ref-parser</code></a></li>
              </ul>
              </div>
            </div>
            <div className='col s6'>
              <h5>What is it?</h5>
              OpenApi-CodeGen is a typescript generator that greatly simplifies the implementation of models and services from an openAPI specification.
              The generated models and services are easy to understand and useful.
              When you uses several files with openAPI specification and want generate single core-module and single common index-file, this framework for you
            </div>
          </div>
        </ContentBlock>
        <ContentBlock title='Install'>
          <CodeBlock text='npm install ts-openapi-codegen --save-dev' theme={dracula} showLineNumbers={false} />
        </ContentBlock>
        <ContentBlock title='Documentation'>
          Two ways of configuration exist.<br />
          First, through the command line. Second, through a configuration file.
          <h5>First</h5>
          <CodeBlock language='bash' text='$ openapi --help' theme={dracula} showLineNumbers={false} />
          Usage: openapi [options]<br />
          Options:<br />
          <table>
            <tr>
              <td>-V, --version </td>
              <td>Output the version number</td>
            </tr>
            <tr>
              <td>-i, --input &lt;value&gt;</td>
              <td>OpenAPI specification, can be a path, url or string content (required)</td>
            </tr>
            <tr>
              <td>-o, --output &lt;value&gt;</td>          <td>Output directory (required)</td>
            </tr>
            <tr>
              <td>-oc, --outputCore &lt;value&gt;</td>     <td>Output directory for core files </td>
            </tr>
            <tr>
              <td>-os, --outputServices &lt;value&gt;</td> <td>Output directory for services </td>
            </tr>
            <tr>
              <td>-om, --outputModels &lt;value&gt;</td>   <td>Output directory for models </td>
            </tr>
            <tr>
              <td>-osm, --outputSchemas &lt;value&gt;</td> <td>Output directory for schemas </td>
            </tr>
            <tr>
              <td>-c, --client &lt;value&gt;</td>          <td>HTTP client to generate [fetch, xhr, node] (default: "fetch")</td>
            </tr>
            <tr>
              <td>--useOptions &lt;value&gt;</td>          <td>Use options instead of arguments (default: false)</td>
            </tr>
            <tr>
              <td>--useUnionTypes &lt;value&gt;</td>       <td>Use union types instead of enums (default: false)</td>
            </tr>
            <tr>
              <td>--exportCore &lt;value&gt;</td>          <td>Write core files to disk (default: true)</td>
            </tr>
            <tr>
              <td>--exportServices &lt;value&gt;</td>      <td>Write services to disk (default: true)</td>
            </tr>
            <tr>
              <td>--exportModels &lt;value&gt;</td>        <td>Write models to disk (default: true)</td>
            </tr>
            <tr>
              <td>--exportSchemas &lt;value&gt;</td>       <td>Write schemas to disk (default: false)</td>
            </tr>
            <tr>
              <td>--clean &lt;value&gt;</td>               <td>Clean a directory before generation (default: true)</td>
            </tr>
            <tr>
              <td>--interfacePrefix &lt;value&gt;</td>     <td>Prefix for interface model(default: "I")</td>
            </tr>
            <tr>
              <td>--enumPrefix &lt;value&gt;</td>          <td>Prefix for enum model(default: "E")</td>
            </tr>
            <tr>
              <td>--typePrefix &lt;value&gt;</td>          <td>Prefix for type model(default: "T")</td>
            </tr>
          </table>

          <h5>Second</h5>
          You should create a file in the root of a project with the name 'openapi.config.json', where you can describe configurations for several files with openapi specification.
          <br />Example:
          <CodeBlock language='json'
            text={data.content} codeBlock showLineNumbers={false} theme={dracula} />
        </ContentBlock>
      </div>
    </>
  )
}

export default App;
