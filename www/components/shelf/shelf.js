import { css, html, LitElement, unsafeCSS } from "lit";
import client from "@greenwood/plugin-graphql/src/core/client.js";
import CollectionQuery from "@greenwood/plugin-graphql/src/queries/collection.gql";
import shelfCss from "./shelf.css?type=raw";
import chevronRt from "../icons/chevron-right.js";
import chevronDwn from "../icons/chevron-down.js";

class Shelf extends LitElement {
  static get properties() {
    return {
      page: {
        type: String,
      },
    };
  }

  static get styles() {
    return css`
      ${unsafeCSS(shelfCss)}
    `;
  }

  constructor() {
    super();
    this.page = "";
    this.selectedIndex = "";
    this.shelfList = [];
  }

  async connectedCallback() {
    super.connectedCallback();
    this.collapseAll();
  }

  expandRoute(path) {
    let routeShelfListIndex = this.shelfList.findIndex((item) => {
      let expRoute = new RegExp(`^${path}$`);
      return expRoute.test(item.route);
    });

    if (routeShelfListIndex > -1) {
      this.shelfList[routeShelfListIndex].selected = true;
      this.selectedIndex = routeShelfListIndex;
    }
  }

  collapseAll() {
    this.shelfList = this.shelfList.map((item) => {
      item.selected = false;
      return item;
    });
  }

  toggleSelectedItem() {
    let selectedShelfListIndex = this.shelfList.findIndex(
      (list, index) => index === this.selectedIndex,
    );

    if (selectedShelfListIndex > -1) {
      this.shelfList[selectedShelfListIndex].selected =
        !this.shelfList[selectedShelfListIndex].selected;
    }
  }

  setSelectedItem(evt) {
    const previousSelected = this.selectedIndex;

    this.selectedIndex = parseInt(evt.target.id.substring(6, evt.target.id.length), 10);

    if (this.selectedIndex === previousSelected) {
      this.selectedIndex = "";
    }

    this.toggleSelectedItem();
  }

  handleShelfClick(evt) {
    // collapse all other items
    this.collapseAll();
    // set selected to index
    this.setSelectedItem(evt);
    // force re-render
    this.requestUpdate();
  }

  async fetchShelfData() {
    return await client.query({
      query: CollectionQuery,
      variables: {
        name: this.page,
        orderBy: "order_asc",
      },
    });
  }

  async updated(changedProperties) {
    if (changedProperties.has("page") && this.page !== "" && this.page !== "/") {
      const response = await this.fetchShelfData();

      this.shelfList = response.data.collection;
      this.expandRoute(window.location.pathname);
      this.requestUpdate();
    }
  }

  renderList() {
    /* eslint-disable indent */
    const renderListItems = (mainRoute, children, selected) => {
      let listItems = "";

      if (children && children.length > 0) {
        listItems = html`
          <ul>
            ${children.map((child) => {
              return html`
                <li class="${selected ? "" : "hidden"}">
                  <a href="${mainRoute}${child.route}">${child.label}</a>
                </li>
              `;
            })}
          </ul>
        `;
      }

      return listItems;
    };

    /* eslint-enable */
    return this.shelfList.map((item, index) => {
      let id = `index_${index}`;
      let chevron =
        item.tableOfContents && item.tableOfContents.length > 0
          ? item.selected === true
            ? chevronDwn
            : chevronRt
          : "";

      return html`
        <li class="list-wrap">
          <div>
            <a href="${item.route}">${item.label}</a>
            <a id="${id}" @click="${this.handleShelfClick}"
              ><span class="pointer">${chevron}</span></a
            >
          </div>

          ${renderListItems(item.route, item.tableOfContents, item.selected)}
        </li>
      `;
    });
  }

  render() {
    return html`
      <div>
        <ul>
          ${this.renderList()}
        </ul>
      </div>
    `;
  }
}

customElements.define("app-shelf", Shelf);
