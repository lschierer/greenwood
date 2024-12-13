/*
 * Use Case
 * Run Greenwood with and loading different references to node_module types to ensure proper support.
 * Sets prerender: true to validate the functionality.
 *
 * User Result
 * Should generate a bare bones Greenwood build without erroring.
 *
 * User Command
 * greenwood build
 *
 * User Config
 * None
 *
 * User Workspace
 * src/
 *   pages/
 *     index.html
 *   scripts/
 *     main.js
 *   styles/
 *     theme.css
 */
import chai from 'chai';
import fs from 'fs';
import glob from 'glob-promise';
import { JSDOM } from 'jsdom';
import path from 'path';
import { getOutputTeardownFiles } from '../../../../../test/utils.js';
import { Runner } from 'gallinago';
import { fileURLToPath, URL } from 'url';

const expect = chai.expect;

describe('Build Greenwood With: ', function() {
  const LABEL = 'Importing packages from node modules';
  const cliPath = path.join(process.cwd(), 'packages/cli/src/index.js');
  const outputPath = fileURLToPath(new URL('.', import.meta.url));
  let runner;

  before(function() {
    this.context = {
      publicDir: path.join(outputPath, 'public')
    };
    runner = new Runner();
  });

  describe(LABEL, function() {
    let dom;

    before(async function() {
      runner.setup(outputPath);
      runner.runCommand(cliPath, 'build');

      dom = await JSDOM.fromFile(path.resolve(this.context.publicDir, 'index.html'));
    });

    describe('<script src="..."> tag in the <head> tag', function() {
      it('should have one <script src="..."> tag for main.js loaded in the <head> tag', function() {
        const scriptTags = dom.window.document.querySelectorAll('head > script[src]');
        const mainScriptTags = Array.prototype.slice.call(scriptTags).filter(script => {
          return (/main.*.js/).test(script.src);
        });

        expect(mainScriptTags.length).to.be.equal(1);
      });

      it('should have the total expected number of .js file in the output directory', async function() {
        expect(await glob.promise(path.join(this.context.publicDir, '*.js'))).to.have.lengthOf(3);
      });

      it('should have the expected main.js file in the output directory', async function() {
        expect(await glob.promise(path.join(this.context.publicDir, 'main.*.js'))).to.have.lengthOf(1);
      });
    });

    describe('<script> tag with inline code in the <head> tag', function() {
      it('should have one <script> tag with inline code loaded in the <head> tag', function() {
        const scriptTagsInline = Array.from(dom.window.document.querySelectorAll('head > script:not([src])')).filter(tag => !tag.getAttribute('data-gwd'));

        expect(scriptTagsInline.length).to.be.equal(1);
      });

      it('should have the expected lit related files in the output directory', async function() {
        expect(await glob.promise(path.join(this.context.publicDir, 'lit*.js'))).to.have.lengthOf(1);
      });

      it('should have the expected inline node_modules content in the first inline script', async function() {
        const inlineScriptTag = Array.from(dom.window.document.querySelectorAll('head > script:not([src])')).filter(tag => !tag.getAttribute('data-gwd'))[0];

        expect(inlineScriptTag.textContent.replace(/\n/g, '')).to
          .equal('import"/116321042.dlaVsmnb.js";import"/lit-html.CYd3Xodq.js";//# sourceMappingURL=116321042.SNvCd9wk.js.map');
      });
    });

    describe('<script src="..."> with reference to node_modules/ path in the <head> tag', function() {
      it('should have one <script src="..."> tag for lit-html loaded in the <head> tag', function() {
        const scriptTagsInline = dom.window.document.querySelectorAll('head > script[src]');
        const litScriptTags = Array.prototype.slice.call(scriptTagsInline).filter(script => {
          return (/lit-.*.js/).test(script.src);
        });

        expect(litScriptTags.length).to.be.equal(1);
      });

      it('should have the expected lit-html.js files in the output directory', async function() {
        expect(await glob.promise(path.join(this.context.publicDir, 'lit-html.*.js'))).to.have.lengthOf(1);
      });
    });

    describe('<link rel="stylesheet" href="..."> with reference to node_modules/ path in the <head> tag', function() {
      it('should have one <link href="..."> tag in the <head> tag', function() {
        const linkTags = dom.window.document.querySelectorAll('head > link[rel="stylesheet"]');
        const prismLinkTag = Array.prototype.slice.call(linkTags).filter(link => {
          return (/prism-tomorrow.*.css/).test(link.href);
        });

        expect(prismLinkTag.length).to.be.equal(1);
      });

      it('should have the expected prism.css file in the output directory', async function() {
        expect(await glob.promise(path.join(this.context.publicDir, 'prism-tomorrow.*.css'))).to.have.lengthOf(1);
      });
    });

    describe('<link rel="stylesheet" href="..."> with reference to node_modules with bare @import paths in the <head> tag', function() {
      it('should have one <link href="..."> tag in the <head> tag', function() {
        const linkTags = dom.window.document.querySelectorAll('head > link[rel="stylesheet"]');
        const themeLinkTag = Array.prototype.slice.call(linkTags).filter(link => {
          return (/theme.*.css/).test(link.href);
        });

        expect(themeLinkTag.length).to.be.equal(1);
      });

      it('should have the expected theme.css file in the output directory with the expected content', async function() {
        const themeFile = await glob.promise(path.join(this.context.publicDir, 'styles/theme.*.css'));
        const contents = fs.readFileSync(themeFile[0], 'utf-8');

        expect(themeFile).to.have.lengthOf(1);
        expect(contents.indexOf(':root,:host{--spectrum-global-animation-linear:cubic-bezier(0, 0, 1, 1);')).to.equal(0);
      });
    });
  });

  after(function() {
    runner.teardown(getOutputTeardownFiles(outputPath));
  });

});