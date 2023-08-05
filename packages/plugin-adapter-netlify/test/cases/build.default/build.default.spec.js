/*
 * Use Case
 * Run Greenwood with the Netlify adapter plugin.
 *
 * User Result
 * Should generate a static Greenwood build with serverless and edge functions output.
 *
 * User Command
 * greenwood build
 *
 * User Config
 * import { greenwoodPluginAdapterNetlify } from '@greenwood/plugin-adapter-netlify';
 *
 * {
 *   plugins: [{
 *     greenwoodPluginAdapterNetlify()
 *   }]
 * }
 *
 * User Workspace
 * package.json
 * src/
 *   components/
 *     card.js
 *   pages/
 *     artists.js
 *     users.js
 *   services/
 *     artists.js
 *     greeting.js
 */
import chai from 'chai';
import glob from 'glob-promise';
import { JSDOM } from 'jsdom';
import path from 'path';
import { getSetupFiles, getOutputTeardownFiles } from '../../../../../test/utils.js';
import { Runner } from 'gallinago';
import { fileURLToPath } from 'url';
import extract from 'extract-zip';

const expect = chai.expect;

describe('Build Greenwood With: ', function() {
  const LABEL = 'Netlify Adapter plugin output';
  const cliPath = path.join(process.cwd(), 'packages/cli/src/index.js');
  const outputPath = fileURLToPath(new URL('.', import.meta.url));
  const netlifyFunctionsOutputUrl = new URL('./netlify/functions/', import.meta.url);
  let runner;

  before(async function() {
    this.context = {
      publicDir: path.join(outputPath, 'public')
    };
    runner = new Runner();
  });

  describe(LABEL, function() {
    before(async function() {
      await runner.setup(outputPath, getSetupFiles(outputPath));
      await runner.runCommand(cliPath, 'build');
    });

    describe('Default Output', function() {
      let zipFiles;

      before(async function() {
        zipFiles = await glob.promise(path.join(netlifyFunctionsOutputUrl.pathname, '*.zip'));
      });

      it('should output the expected number of serverless function zip files', function() {
        expect(zipFiles.length).to.be.equal(4);
      });

      it('should output the expected number of serverless function API zip files', function() {
        expect(zipFiles.filter(file => path.basename(file).startsWith('api-')).length).to.be.equal(2);
      });

      it('should output the expected number of serverless function SSR page zip files', function() {
        expect(zipFiles.filter(file => !path.basename(file).startsWith('api-')).length).to.be.equal(2);
      });
    });

    describe('Greeting API Route adapter', function() {
      let apiFunctions;

      before(async function() {
        apiFunctions = await glob.promise(path.join(netlifyFunctionsOutputUrl.pathname, 'api-greeting.zip'));
      });

      it('should output one API route as a serverless function zip file', function() {
        expect(apiFunctions.length).to.be.equal(1);
      });

      it('should return the expected response when the serverless adapter entry point handler is invoked', async function() {
        const param = 'Greenwood';
        const name = path.basename(apiFunctions[0]).replace('.zip', '');

        await extract(apiFunctions[0], {
          dir: path.join(netlifyFunctionsOutputUrl.pathname, name)
        });
        const { handler } = await import(new URL(`./${name}/${name}.js`, netlifyFunctionsOutputUrl));
        const response = await handler({
          rawUrl: `http://localhost:8080/api/${name}?name=${param}`
        }, {});
        const { statusCode, body, headers } = response;

        expect(statusCode).to.be.equal(200);
        expect(headers.get('content-type')).to.be.equal('application/json');
        expect(JSON.parse(body).message).to.be.equal(`Hello ${param}!`);
      });
    });

    describe('Fragments API Route adapter', function() {
      let apiFunctions;

      before(async function() {
        apiFunctions = await glob.promise(path.join(netlifyFunctionsOutputUrl.pathname, 'api-fragment.zip'));
      });

      it('should output one API route as a serverless function zip file', function() {
        expect(apiFunctions.length).to.be.equal(1);
      });

      it('should return the expected response when the serverless adapter entry point handler is invoked', async function() {
        const param = 'Greenwood';
        const name = path.basename(apiFunctions[0]).replace('.zip', '');

        await extract(apiFunctions[0], {
          dir: path.join(netlifyFunctionsOutputUrl.pathname, name)
        });
        const { handler } = await import(new URL(`./${name}/${name}.js`, netlifyFunctionsOutputUrl));
        const response = await handler({
          rawUrl: `http://localhost:8080/api/${name}?name=${param}`
        }, {});
        const { statusCode, body, headers } = response;
        const dom = new JSDOM(body);
        const cardTags = dom.window.document.querySelectorAll('app-card');

        expect(statusCode).to.be.equal(200);
        expect(cardTags.length).to.be.equal(2);
        expect(headers.get('content-type')).to.be.equal('text/html');
      });
    });

    describe('Artists SSR Page adapter', function() {
      const count = 2;
      let pageFunctions;

      before(async function() {
        pageFunctions = (await glob.promise(path.join(netlifyFunctionsOutputUrl.pathname, '*.zip')))
          .filter(zipFile => path.basename(zipFile).startsWith('artists'));
      });

      it('should output one SSR page as a serverless function zip file', function() {
        expect(pageFunctions.length).to.be.equal(1);
      });

      it('should return the expected response when the serverless adapter entry point handler is invoked', async function() {
        const name = path.basename(pageFunctions[0]).replace('.zip', '');

        await extract(pageFunctions[0], {
          dir: path.join(netlifyFunctionsOutputUrl.pathname, name)
        });
        const { handler } = await import(new URL(`./${name}/${name}.js`, netlifyFunctionsOutputUrl));
        const response = await handler({
          rawUrl: `http://localhost:8080/${name}/`
        }, {});
        const { statusCode, body } = response;
        const dom = new JSDOM(body);
        const cardTags = dom.window.document.querySelectorAll('body > app-card');
        const headings = dom.window.document.querySelectorAll('body > h1');

        expect(statusCode).to.be.equal(200);
        expect(cardTags.length).to.be.equal(count);
        expect(headings.length).to.be.equal(1);
        expect(headings[0].textContent).to.be.equal(`List of Artists: ${count}`);
      });
    });

    describe('Users SSR Page adapter', function() {
      let pageFunctions;

      before(async function() {
        pageFunctions = (await glob.promise(path.join(netlifyFunctionsOutputUrl.pathname, '*.zip')))
          .filter(zipFile => path.basename(zipFile).startsWith('users'));
      });

      it('should output one SSR page as a serverless function zip file', function() {
        expect(pageFunctions.length).to.be.equal(1);
      });

      it('should return the expected response when the serverless adapter entry point handler is invoked', async function() {
        const name = path.basename(pageFunctions[0]).replace('.zip', '');
        const count = 1;

        await extract(pageFunctions[0], {
          dir: path.join(netlifyFunctionsOutputUrl.pathname, name)
        });
        const { handler } = await import(new URL(`./${name}/${name}.js`, netlifyFunctionsOutputUrl));
        const response = await handler({
          rawUrl: `http://localhost:8080/${name}/`
        }, {});
        const { statusCode, body } = response;
        const dom = new JSDOM(body);
        const cardTags = dom.window.document.querySelectorAll('body > app-card');
        const headings = dom.window.document.querySelectorAll('body > h1');

        expect(statusCode).to.be.equal(200);
        expect(cardTags.length).to.be.equal(count);
        expect(headings.length).to.be.equal(1);
        expect(headings[0].textContent).to.be.equal(`List of Users: ${count}`);
      });
    });
  });

  after(function() {
    runner.teardown([
      path.join(outputPath, 'netlify'),
      ...getOutputTeardownFiles(outputPath)
    ]);
  });

});