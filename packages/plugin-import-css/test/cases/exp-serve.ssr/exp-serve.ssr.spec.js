/*
 * Use Case
 * Run Greenwood with an API and SSR routes that import CSS.
 *
 * User Result
 * Should generate a Greenwood build that correctly builds and bundles all assets.
 *
 * User Command
 * greenwood build
 *
 * User Config
 * {
 *   plugins: [
 *      greenwoodPluginImportCss()
 *   ]
 * }
 *
 * User Workspace
 *  src/
 *   api/
 *     fragment.js
 *   components/
 *     card.js
 *     card.css
 *   pages/
 *     products.js
 *   services/
 *     products.js
 *   styles/
 *     some.css
 */
import chai from 'chai';
import { JSDOM } from 'jsdom';
import path from 'path';
import { getSetupFiles, getOutputTeardownFiles } from '../../../../../test/utils.js';
import request from 'request';
import { Runner } from 'gallinago';
import { fileURLToPath } from 'url';

const expect = chai.expect;

describe('Serve Greenwood With: ', function() {
  const LABEL = 'A Server Rendered Application (SSR) with API Routes importing CSS';
  const cliPath = path.join(process.cwd(), 'packages/cli/src/index.js');
  const outputPath = fileURLToPath(new URL('.', import.meta.url));
  const hostname = 'http://127.0.0.1:8080';
  let runner;

  before(async function() {
    this.context = {
      publicDir: path.join(outputPath, 'public'),
      hostname
    };
    runner = new Runner(false, true);
  });

  describe(LABEL, function() {

    before(async function() {
      await runner.setup(outputPath, getSetupFiles(outputPath));
      await runner.runCommand(cliPath, 'build');

      return new Promise(async (resolve) => {
        setTimeout(() => {
          resolve();
        }, 10000);

        await runner.runCommand(cliPath, 'serve');
      });
    });

    describe('Serve command with HTML route response for products page', function() {
      let response = {};
      let productsPageDom;

      before(async function() {
        return new Promise((resolve, reject) => {
          request.get(`${hostname}/products/`, (err, res, body) => {
            if (err) {
              reject();
            }

            response = res;
            response.body = body;
            productsPageDom = new JSDOM(body);

            resolve();
          });
        });
      });

      it('should return a 200 status', function(done) {
        expect(response.statusCode).to.equal(200);
        done();
      });

      it('should return the correct content type', function(done) {
        expect(response.headers['content-type']).to.equal('text/html');
        done();
      });

      it('should return a response body', function(done) {
        expect(response.body).to.not.be.undefined;
        done();
      });

      it('should have the expected import CSS in the page in the response body', function(done) {
        const styleTag = productsPageDom.window.document.querySelectorAll('body > style');

        expect(styleTag.length).to.equal(1);
        expect(styleTag[0].textContent.replace(/ /g, '').replace(/\n/, '')).contain('h1{color:red;}');
        done();
      });

      it('should make sure to have the expected CSS inlined into the page for each <app-card>', function(done) {
        const cardComponents = productsPageDom.window.document.querySelectorAll('body app-card');

        expect(cardComponents.length).to.equal(2);
        Array.from(cardComponents).forEach((card) => {
          expect(card.innerHTML).contain('display: flex;');
        });
        done();
      });
    });

    describe('Serve command with API specific behaviors for an HTML ("fragment") API', function() {
      let response = {};
      let fragmentsApiDom;

      before(async function() {
        return new Promise((resolve, reject) => {
          request.get(`${hostname}/api/fragment`, (err, res, body) => {
            if (err) {
              reject();
            }

            response = res;
            response.body = body;
            fragmentsApiDom = new JSDOM(body);

            resolve();
          });
        });
      });

      it('should return a 200 status', function(done) {
        expect(response.statusCode).to.equal(200);
        done();
      });

      it('should return a custom status message', function(done) {
        expect(response.statusMessage).to.equal('OK');
        done();
      });

      it('should return the correct content type', function(done) {
        expect(response.headers['content-type']).to.equal('text/html');
        done();
      });

      it('should make sure to have the expected CSS inlined into the page for each <app-card>', function(done) {
        const cardComponents = fragmentsApiDom.window.document.querySelectorAll('body > app-card');

        expect(cardComponents.length).to.equal(2);
        Array.from(cardComponents).forEach((card) => {
          expect(card.innerHTML).contain('display: flex;');
        });
        done();
      });
    });
  });

  after(function() {
    runner.teardown(getOutputTeardownFiles(outputPath));
    runner.stopCommand();
  });

});