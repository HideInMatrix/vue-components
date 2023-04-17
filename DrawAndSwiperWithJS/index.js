import { DrawCanvas, EventMethods } from "./board";

import { CanvasTemplate } from "./template";
import { Swiper } from "./swiper";
import { Pagination } from "./pagination";
class BschStage {
  canvases = [];//数组
  currentIndex = -1;
  canvasWidth = 0;
  canvasHeight = 0;
  containerRoot = null;

  swiper = null; // 轮播图组件
  pagination = null; // 页码组件
  constructor({ container, options }) {
    // 当new的时候表明使用者认为该dom元素是存在的
    // 可能此时dom元素是存在的，但是还没渲染完，而这里是拿不到的
    // 所以这里做个延迟操作
    this.containerRoot = document.querySelector(container)
    this.settings = Object.assign({
      saveImageAction: null,// 保存按钮点击回调
    }, options)
    this.canvasHeight = this.containerRoot.clientHeight;
    this.canvasWidth = this.containerRoot.clientWidth;
    this.jumpToLastBoard = this.jumpToLastBoard.bind(this);
    this.changeCurrentIndex = this.changeCurrentIndex.bind(this);
    this.clearStage = this.clearStage.bind(this);

  }


  // 初始化展示的舞台
  initStage () {
    // 从 CanvasTemplate 中获取html结构
    this.containerRoot.innerHTML = CanvasTemplate()
    this.createCanvas();

    // 初始化Pagination挂载到swiper上
    this.pagination = new Pagination(`#${this.containerRoot.id} .board-wrapper .toolbar-wrapper .bsch-pagination-list`, {
      activePageAction: (_dom) => this.swiper.slideTo(_dom.dataset.page)
    })
    this.swiper = new Swiper(`#${this.containerRoot.id} .board-wrapper .swiper`, {
      enablePlay: false,
      onSlideAdded: this.jumpToLastBoard,
      onSlideChanged: this.changeCurrentIndex,
      enablePagination: true,
      pagination: this.pagination
    })
    this.swiper.init();
    this.bindEvents();
  }

  // 修改当前画布的下标
  changeCurrentIndex (index) {
    this.currentIndex = index
  }

  // 跳到最近一个画布上
  jumpToLastBoard () {
    this.jumpBoard(this.currentIndex)
  }

  // 按钮事件绑定
  bindEvents () {
    let addNewPageBtn = document.querySelector(`#${this.containerRoot.id} .board-wrapper .toolbar-wrapper #newPage`);
    let clearPageBtn = document.querySelector(`#${this.containerRoot.id} .board-wrapper .toolbar-wrapper #clearPage`);
    let deletePageBtn = document.querySelector(`#${this.containerRoot.id} .board-wrapper .toolbar-wrapper #deletePage`);
    let savePageBtn = document.querySelector(`#${this.containerRoot.id} .board-wrapper .toolbar-wrapper #savePage`)

    addNewPageBtn.addEventListener(`${EventMethods.MOUSEDOWN}`, (e) => {
      this.createCanvas();
    })
    clearPageBtn.addEventListener(`${EventMethods.MOUSEDOWN}`, e => {
      this.clearBoard(this.currentIndex)
    })
    deletePageBtn.addEventListener(`${EventMethods.MOUSEDOWN}`, e => {
      this.unmount(this.currentIndex)
    })
    savePageBtn.addEventListener(`${EventMethods.MOUSEDOWN}`, e => {
      this.saveImage()
    })
  }

  // 新建一个画布
  createCanvas () {
    let _canvas = new DrawCanvas({ width: this.canvasWidth, height: this.canvasHeight })
    // 将所生成的canvas挂在 _middleContainer 下面
    let _middleContainer = document.querySelector(`#${this.containerRoot.id} .board-wrapper .swiper .swiper-wrapper`);
    _canvas.canvasRef.setAttribute("data-index", this.currentIndex + 1)

    _middleContainer.appendChild(_canvas.canvasRef);
    _canvas.initBoard({ width: _middleContainer.clientWidth, height: _middleContainer.clientHeight })
    this.canvases.push(_canvas)
    this.currentIndex = this.canvases.length - 1;
  }

  // 保存图片
  saveImage () {
    let imageArray = this.canvases.map(item =>
      item.exportImage()
    )

    this.settings.saveImageAction(imageArray)

    // imageArray.forEach((item, index) => {
    //   let downloadURI = (uri, name) => {
    //     let link = document.createElement('a')
    //     link.download = name
    //     link.href = uri
    //     document.body.appendChild(link)
    //     link.click()
    //     document.body.removeChild(link)
    //   }
    //   downloadURI(item, `stage${index}.jpg`)
    // })
  }

  // 清除指定面板
  clearBoard (index) {
    this.canvases[index].clearBoard();
  }

  // 还原所有的面板
  clearStage () {
    for (let i = this.canvases.length - 1; i > 0; i--) {
      this.unmount(i)
    }
    this.clearBoard(0);
  }

  jumpBoard (index) {
    this.swiper.slideTo(index)
  }

  // 销毁模版
  destroyTemplate () {
    let addNewPageBtn = document.querySelector(`#${this.containerRoot.id} .board-wrapper .toolbar-wrapper #newPage`);
    let clearPageBtn = document.querySelector(`#${this.containerRoot.id} .board-wrapper .toolbar-wrapper #clearPage`);
    let deletePageBtn = document.querySelector(`#${this.containerRoot.id} .board-wrapper .toolbar-wrapper #deletePage`);
    let savePageBtn = document.querySelector(`#${this.containerRoot.id} .board-wrapper .toolbar-wrapper #savePage`)

    addNewPageBtn.removeEventListener(`${EventMethods.MOUSEDOWN}`, (e) => {
      this.createCanvas();
    })
    clearPageBtn.removeEventListener(`${EventMethods.MOUSEDOWN}`, e => {
      this.clearBoard(this.currentIndex)
    })
    deletePageBtn.removeEventListener(`${EventMethods.MOUSEDOWN}`, e => {
      this.unmount(this.currentIndex)
    })
    savePageBtn.removeEventListener(`${EventMethods.MOUSEDOWN}`, e => {
      this.saveImage()
    })

    while (this.containerRoot.firstElementChild) {
      this.containerRoot.removeChild(this.containerRoot.firstElementChild);
    }

    this.pagination.destroyPagination()

  }

  // 删除指定画布
  unmount (index) {
    if (index == 0 && this.canvases.length == 1) {
      alert("必须保留一张画布");
      return;
    }
    let deleteCanvasItem = this.canvases[index];
    deleteCanvasItem.destroy();
    // 所生成的canvas都挂在 _middleContainer 下面
    let _middleContainer = document.querySelector(`#${this.containerRoot.id} .board-wrapper .swiper .swiper-wrapper`);
    _middleContainer.removeChild(deleteCanvasItem.canvasRef);
    this.canvases.splice(index, 1);
  }
}

export { BschStage }