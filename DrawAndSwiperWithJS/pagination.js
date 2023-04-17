import { EventMethods } from "./board";
export class Pagination {

  lastPagination = null // 最近一个被点亮的pagination

  constructor(container, options) {

    this.container = container;
    let defaultOptions = {
    }

    this.options = Object.assign({
      activePageAction: null
    }, defaultOptions, options);

    this.updatePageNumber = this.updatePageNumber.bind(this);
    this.activePageNumberByDom = this.activePageNumberByDom.bind(this);
    this.activePageNumberByIndex = this.activePageNumberByIndex.bind(this);
  }

  // 更新已有的页码
  updatePageNumber (pageNumber) {

    let _pagination = document.querySelector(this.container);
    while (_pagination.firstElementChild) {
      _pagination.firstElementChild.removeEventListener(`${EventMethods.MOUSEDOWN}`, () => { this.activePageNumberByDom(_pagination.firstElementChild) })
      _pagination.removeChild(_pagination.firstElementChild);

    }

    for (let index = 0; index < pageNumber; index++) {
      let navItem = document.createElement("li")
      navItem.className = `pagination-item`
      navItem.setAttribute('data-page', index)
      navItem.textContent = index + 1
      navItem.addEventListener(`${EventMethods.MOUSEDOWN}`, () => { this.activePageNumberByDom(navItem) })
      _pagination.appendChild(navItem)
    }
  }

  activePageNumberByDom (_dom) {
    if (this.lastPagination) {
      this.lastPagination.classList.remove('active');
    }
    _dom.classList.add('active');
    this.lastPagination = _dom;
    if (typeof this.options.activePageAction === 'function') {
      this.options.activePageAction(_dom)
    }
  }

  activePageNumberByIndex (index) {

    if (this.lastPagination) {
      this.lastPagination.classList.remove('active');
    }
    // 记录下最近被点亮的pagination
    let _paginationList = document.querySelectorAll(`${this.container} .pagination-item`);
    _paginationList[index].classList.add('active');
    this.lastPagination = _paginationList[index];
  }

  destroyPagination () {
    let _pagination = document.querySelector(this.container);
    while (_pagination.firstElementChild) {
      _pagination.firstElementChild.removeEventListener(`${EventMethods.MOUSEDOWN}`, () => { this.activePageNumberByDom(_pagination.firstElementChild) })
      _pagination.removeChild(_pagination.firstElementChild);

    }
  }
}