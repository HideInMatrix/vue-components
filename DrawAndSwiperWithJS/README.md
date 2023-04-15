# 纯JS画布手写板

## 简介

该项目纯用JS、Css、Dom实现。主体的2个类是`swiper.js`和`board.js`

- `swiper.js` 是一个纯JS实现的轮播图组件，需要一定的dom结构才能使用，你需要如下的dom结构才可以单独使用该组件

  ```html
      <div class="canvas-list swiper">
        <div class="swiper-wrapper"></div>
      </div>

      <!-- 页码是提前固定好还是在配置中按配置需求生成待思考 -->
      <ul class="bsch-pagination-list">
      </ul>
  ```

  然后使用函数初始化一个轮播图

  ```javascript
  this.swiper = new Swiper('.swiper', {
    enablePlay: false,
    onSlideAdded: this.jumpToLastBoard,
    onSlideChanged: this.changeCurrentIndex
  })
  this.swiper.init();
  ```

  - 传入的options 参数介绍

    - enablePlay 是否开启滑动模式
    - delay 自动轮播延迟
    - autoplay 自动轮播开关
    - onSlideAdded 新添加的 swiper-slide 元素处理函数
    - onSlideChanged 滑动事件触发回调

- `board.js`是主要的画布功能封装文件
如果你需要单独使用它的话，如下案例

```javascript
// 生成一个canvas画布
let _canvas = new DrawCanvas({ width: this.canvasWidth, height: this.canvasHeight });

// 将所生成的canvas挂在 指定的dom元素 下面
let _middleContainer = document.querySelector(".swiper .swiper-wrapper");
_middleContainer.appendChild(_canvas.canvasRef);

// 最后初始化一下画布，让他展示出来
_canvas.initBoard({ width: _middleContainer.clientWidth, height: _middleContainer.clientHeight })

```

## 组合文件`index.js`

这个文件主要是抛出一个对象，供引入组件的地方初始化。`初始化的时候一定要保证挂载的dom元素存在`。
然后使用案例如下

```html
<template>
  <div class="draw-wrapper">
    <div id="container"></div>
  </div>
</template>

<script>
  export default{
    mounted () {
      this.canvasObject = new BschStage({ container: '#container',options: {
        saveImageAction: this.getSaveImages // 保存图片按钮执行之后的回调，会返回图片的base64编码
      } });
      this.canvasObject.initStage();
    },
  }
</script>
```

## `template.js`是一个基础的dom元素，为了配合`swiper.js`中需要的dom组织结构，以及`board.js`中需要的dom组织结构
