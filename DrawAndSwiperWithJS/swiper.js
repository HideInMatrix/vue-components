import { EventMethods } from "./board";
export class Swiper {
  lastPagination = null; // 最近一个被点亮的pagination
  constructor(selector, options) {
    // 默认选项
    const defaultOptions = {
      autoplay: true,
      delay: 3000,
      enablePlay: true,// 是否开启滑动模式
      enablePagination: false
    };

    // 合并选项
    this.settings = Object.assign({
      // 默认配置
      onSlideAdded: null, // 新添加的 swiper-slide 元素处理函数
      onSlideChanged: null, // 滑动事件触发回调
    }, defaultOptions, options);

    // 获取元素
    this.container = document.querySelector(selector);
    this.wrapper = this.container.querySelector('.swiper-wrapper');
    this.slides = this.wrapper.querySelectorAll('.swiper-slide');

    // 私有变量
    this.currentSlideIndex = 0;
    this.slideWidth = this.slides[0].clientWidth;
    this.autoSlideInterval;

    // 初始化 MutationObserver，监听 swiper-wrapper 子节点的变化
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          // 处理新添加的 swiper-slide 元素
          this.handleSlideAdded(mutation.addedNodes[0]);
        } else if (mutation.type === 'childList' && mutation.removedNodes.length) {
          // 处理删除的节点
          this.handleSlideDeleted(mutation.removedNodes[0])
        }
      });
    });

    this.observer.observe(this.wrapper, { childList: true });

    if (this.settings.enablePlay) {
      // 绑定事件
      this.container.addEventListener(`mouseenter`, () => {
        this.stopAutoSlide();
      });

      this.container.addEventListener(`mouseleave`, () => {
        this.startAutoSlide();
      });

    }

    // 如何你的公开方法会被对象所调用，需要如下的类似代码确保this指向不出问题
    // this.activePageNumberByIndex = this.activePageNumberByIndex.bind(this);
  }

  destroy () {
    this.container.removeEventListener(`mouseenter`, () => {
      this.stopAutoSlide();
    });

    this.container.removeEventListener(`mouseleave`, () => {
      this.startAutoSlide();
    })

  }

  handleSlideDeleted (deletedSlide) {
    // 调用一下更新函数
    this.refreshSlide();

    // 更新页码
    this.updatePageNumber();
    let slideIndex = (this.currentSlideIndex) % this.slides.length;
    this.slideTo(slideIndex)
  }

  // 添加新的slide元素之后的回调
  handleSlideAdded (newSlide) {
    // 在这里处理新添加的 swiper-slide 元素
    // console.log('New slide added:', newSlide);
    // 调用一下更新函数
    this.refreshSlide();

    // 更新页码
    this.updatePageNumber();

    // 如果设置了 onSlideAdded 回调函数，则执行它
    if (typeof this.settings.onSlideAdded === 'function') {
      this.settings.onSlideAdded(newSlide);
    }

    this.slideTo(this.currentSlideIndex)

  }

  // 这一步频繁的渲染dom，有损性能
  updatePageNumber () {
    if (this.settings.enablePagination) {
      let _pagination = document.querySelector('.bsch-pagination-list');
      while (_pagination.firstElementChild) {
        _pagination.firstElementChild.removeEventListener(`${EventMethods.MOUSEDOWN}`, () => { this.activePageNumberByDom(_pagination.firstElementChild) })
        _pagination.removeChild(_pagination.firstElementChild);

      }
      this.slides.forEach((item, index) => {
        let navItem = document.createElement("li")
        navItem.className = `pagination-item`
        navItem.setAttribute('data-page', index)
        navItem.textContent = index + 1
        navItem.addEventListener(`${EventMethods.MOUSEDOWN}`, () => { this.activePageNumberByDom(navItem) })
        _pagination.appendChild(navItem)
      })
    }

  }

  activePageNumberByDom (_dom) {
    if (this.lastPagination) {
      this.lastPagination.classList.remove('active');
    }
    _dom.classList.add('active');
    this.lastPagination = _dom;
    this.slideTo(_dom.dataset.page)
  }

  activePageNumberByIndex (index) {
    if (this.settings.enablePagination) {
      if (this.lastPagination) {
        this.lastPagination.classList.remove('active');
      }
      // 记录下最近被点亮的pagination
      let _paginationList = document.querySelectorAll('.bsch-pagination-list .pagination-item');
      _paginationList[index].classList.add('active');
      this.lastPagination = _paginationList[index];
    }
  }

  // 添加新的slide元素之后更新组件内部的状态
  refreshSlide () {
    this.slides = this.wrapper.querySelectorAll('.swiper-slide');
  }

  // 滑动到下一个幻灯片
  slideToNext () {
    this.currentSlideIndex++;
    if (this.currentSlideIndex > this.slides.length - 1) {
      this.currentSlideIndex = 0;
    }
    this.activePageNumberByIndex(this.currentSlideIndex)
    this.wrapper.style.transition = 'transform 0.3s ease-in-out';
    this.wrapper.style.transform = `translateX(-${this.slideWidth * this.currentSlideIndex}px)`;
  }

  // 自动滑动
  startAutoSlide () {
    this.autoSlideInterval = setInterval(() => {
      this.slideToNext();
    }, this.settings.delay);
  }

  stopAutoSlide () {
    clearInterval(this.autoSlideInterval);
  }

  // 初始化
  init () {
    this.wrapper.style.transform = `translateX(-${this.slideWidth * this.currentSlideIndex}px)`;

    // 调用一下更新函数
    this.refreshSlide();
    // 初始化的时候更新下页码的dom
    this.updatePageNumber()

    if (this.settings.enablePlay && this.settings.autoplay) {
      this.startAutoSlide();
    }
    this.slideTo(this.currentSlideIndex)
  }

  // 滑动到指定幻灯片
  slideTo (index) {
    this.currentSlideIndex = index;
    if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = this.slides.length - 1;
    } else if (this.currentSlideIndex > this.slides.length - 1) {
      this.currentSlideIndex = 0;
    }


    this.activePageNumberByIndex(index)

    if (typeof this.settings.onSlideChanged === 'function') {
      this.settings.onSlideChanged(index)
    }
    this.wrapper.style.transition = 'transform 0.3s ease-in-out';
    this.wrapper.style.transform = `translateX(-${this.slideWidth * this.currentSlideIndex}px)`;
  }

  // 滑动到上一个幻灯片
  slideToPrev () {
    this.currentSlideIndex--;
    if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = this.slides.length - 1;
    }
    this.activePageNumberByIndex(this.currentSlideIndex);
    this.wrapper.style.transition = 'transform 0.3s ease-in-out';
    this.wrapper.style.transform = `translateX(-${this.slideWidth * this.currentSlideIndex}px)`;
  }
}