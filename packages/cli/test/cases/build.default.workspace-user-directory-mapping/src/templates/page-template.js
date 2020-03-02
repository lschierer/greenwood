import { html, LitElement } from 'lit-element';
import '../components/header/header';

MDIMPORT;
METAIMPORT;
METADATA;

class PageTemplate extends LitElement {
  render() {
    return html`
      METAELEMENT
      <div class='wrapper'>
        <div class='page-template blog-content content owen-test'>
          <entry></entry>
        </div>
        <x-header></x-header>
      </div>
    `;
  }
}

customElements.define('page-template', PageTemplate);