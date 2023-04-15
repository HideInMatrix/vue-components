import { DrawCanvas, EventMethods } from "./board";

import { CanvasTemplate } from "./template";
import { Swiper } from "./swiper";
class BschStage {
  canvases = [];//数组
  currentIndex = -1;
  canvasWidth = 0;
  canvasHeight = 0;
  containerRoot = null;

  swiper = null;
  constructor({ container, options }) {
    this.settings = Object.assign({
      saveImageAction: null,// 保存按钮点击回调
    }, options)
    this.containerRoot = document.querySelector(container)
    this.canvasHeight = this.containerRoot.clientHeight;
    this.canvasWidth = this.containerRoot.clientWidth;
    this.jumpToLastBoard = this.jumpToLastBoard.bind(this);
    this.changeCurrentIndex = this.changeCurrentIndex.bind(this);
  }

  initStage () {
    // 从 CanvasTemplate 中获取html结构
    this.containerRoot.innerHTML = CanvasTemplate()
    this.createCanvas();
    this.swiper = new Swiper('.swiper', {
      enablePlay: false,
      onSlideAdded: this.jumpToLastBoard,
      onSlideChanged: this.changeCurrentIndex,
      enablePagination: true
    })
    this.swiper.init();
    this.bindEvents();
  }
  changeCurrentIndex (index) {
    this.currentIndex = index
  }
  jumpToLastBoard () {
    this.jumpBoard(this.currentIndex)
  }
  bindEvents () {
    let addNewPageBtn = document.querySelector("#newPage");
    let clearPageBtn = document.querySelector("#clearPage");
    let deletePageBtn = document.querySelector("#deletePage");
    let savePageBtn = document.querySelector("#savePage")

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

  createCanvas () {
    let _canvas = new DrawCanvas({ width: this.canvasWidth, height: this.canvasHeight })
    // 将所生成的canvas挂在 _middleContainer 下面
    let _middleContainer = document.querySelector(".swiper .swiper-wrapper");
    _canvas.canvasRef.setAttribute("data-index", this.currentIndex + 1)

    _middleContainer.appendChild(_canvas.canvasRef);
    _canvas.initBoard({ width: _middleContainer.clientWidth, height: _middleContainer.clientHeight })
    this.canvases.push(_canvas)
    this.currentIndex = this.canvases.length - 1;
  }

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

  // 清除面板
  clearBoard (index) {
    this.canvases[index].clearBoard();
  }

  jumpBoard (index) {
    this.swiper.slideTo(index)
  }

  destroyTemplate () {
    let addNewPageBtn = document.querySelector("#newPage");
    let clearPageBtn = document.querySelector("#clearPage");
    let deletePageBtn = document.querySelector("#deletePage");
    let savePageBtn = document.querySelector("#savePage")

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
  }

  unmount (index) {
    if (index == 0 && this.canvases.length == 1) {
      alert("必须保留一张画布");
      return;
    }
    let deleteCanvasItem = this.canvases[index];
    deleteCanvasItem.destroy();
    // 所生成的canvas都挂在 _middleContainer 下面
    let _middleContainer = document.querySelector(".swiper .swiper-wrapper");
    _middleContainer.removeChild(deleteCanvasItem.canvasRef);
    this.canvases.splice(index, 1);
  }
}

export { BschStage }