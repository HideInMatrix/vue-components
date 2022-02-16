<template>
  <div class="inner draw" @mousemove="beginPath($event)">
    <div id="canvasWrap" class="wrap">
      <div id="control" >
        <!--画笔颜色-->
        <div id="canvas-color">
          <h5>
            画笔颜色</h5>
          <ul>
            <li 
              v-for="(item,index) in colors" 
              :class="{'active':config.lineColor === item}"
              :style="{ background: item }"
              :key = "index" 
              @click="setColor(item)"
            ></li>
          </ul>
        </div>
        <!--画笔-->
        <div id="canvas-brush">
          <h5>画笔大小</h5>
          <span 
            v-for="(pen,index) in brushs" 
            :class="[pen.className,{'active': config.lineWidth === pen.lineWidth}]"
            @click="setBrush(pen.lineWidth)"
            :key = "index"
          ></span>
        </div>
        <!--操作-->
        <div id="canvas-control">
          <h5>操作</h5>
          <span 
            v-for="(control,index) in controls" 
            :title="control.title" 
            :class="control.className" 
            @click="controlCanvas(control.action)"
            :key = "index"
          ></span>
        </div>
        <!-- 文本 -->
         <div id="canvas-control">
          <h5>文本</h5>
          <span 
            @click="write()"
          >A</span>
        </div>
         <!-- 文本 -->
         <div id="canvas-control">
          <h5>旋转</h5>
          <span class="fa fa-rotate-left"
            @click="rotateLeft()"
          ></span>
          <!-- <span class="fa fa-rotate-right"
            @click="rotateRight()"
          ></span> -->
        </div>
        <!-- 生成图像-->
        <div id="canvas-drawImage">
          <!-- <h5>保存当前图像</h5> -->
          <button class="drawImage" @click="saveImg()">保存当前图像</button>
        </div>
      </div>
      <div>
        <canvas 
          id="canvas" 
          class="fl" 
          height="1000"
          width="1000" 
          @mousedown="canvasDown($event)" 
          @mouseup="canvasUp($event)"
          @mousemove="canvasMove($event)"
          @touchstart="canvasDown($event)" 
          @touchend="canvasUp($event)"
          @touchmove="canvasMove($event)"
          @ondrop="drop(event)" 
          @ondragover="allowDrop(event)"
        >
        </canvas>
      </div>
      <div id="inputDiv">
        <input id = "test" class="ui-widget-content" draggable="true" @ondragstart="drag(event)"  @blur="setTest" style="display:none;position:absolute;top:70px;left:100px;font-size:22px;">
      </div>
      
    </div>
    <!--存放图片-->
    <div id="img-box" v-show="imgUrl.length">
      <div class="img-item" v-for="(src,index) in imgUrl" :key="index">
        <img :src="src">
        <span class="fa fa-close" @click="removeImg(src)"></span>
      </div>
    </div>
  </div>
  
</template>

<script>
import "../../static/js/jquery-1.9.1.min.js";
import "../../static/js/jquery-ui.min.css";
// import "../../static/js/jquery-ui.min.js";
export default {
  data() {
    return {
      colors: [
        "#fef4ac",
        "#0018ba",
        "#ffc200",
        "#f32f15",
        "#cccccc",
        "#5ab639"
      ],
      brushs: [
        {
          className: "small fa fa-paint-brush",
          lineWidth: 3
        },
        {
          className: "middle fa fa-paint-brush",
          lineWidth: 6
        },
        {
          className: "big fa fa-paint-brush",
          lineWidth: 12
        }
      ],
      context: {},
      imgUrl: [],
      canvasMoveUse: false,
      // 存储当前表面状态数组-上一步
      preDrawAry: [],
      // 存储当前表面状态数组-下一步
      nextDrawAry: [],
      // 中间数组
      middleAry: [],
      // 配置参数
      config: {
        lineWidth: 3,
        lineColor: "red",
        shadowBlur: 2
      },
      // 背景图片缓存
      img: new Image(),
      writeT: false,
      wenben: "",
      color: "red",
      rang: 0,
      imgW: "",
      imgH: "",
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,

      canvasHeight: "",
      canvaswidth: ""
    };
  },
  created() {
    this.$emit("setNav", "在线涂鸦画板");
  },
  mounted() {
    const canvasWrap = document.querySelector("#canvasWrap");
    // console.log(canvasWrap.clientHeight, canvasWrap.clientWidth);

    const canvas = document.querySelector("#canvas");
    // canvas.setAttribute("height", canvasWrap.clientHeight - 40);
    // canvas.setAttribute("width", canvasWrap.clientWidth);
    // this.canvasHeight = canvasWrap.clientHeight - 40;
    // this.canvaswidth = canvasWrap.clientWidth;

    this.context = canvas.getContext("2d");
    this.context.font = "20px Georgia";
    this.initDraw();
    this.setCanvasStyle();
    // document.querySelector('#footer').classList.add('hide-footer')
    // document.querySelector('body').classList.add('fix-body')
  },
  destroyed() {
    // document.querySelector('#footer').classList.remove('hide-footer')
    // document.querySelector('body').classList.remove('fix-body')
  },
  computed: {
    controls() {
      return [
        {
          title: "上一步",
          action: "prev",
          className: this.preDrawAry.length
            ? "active fa fa-reply"
            : "fa fa-reply"
        },
        {
          title: "下一步",
          action: "next",
          className: this.nextDrawAry.length
            ? "active fa fa-share"
            : "fa fa-share"
        },
        {
          title: "清除",
          action: "clear",
          className:
            this.preDrawAry.length || this.nextDrawAry.length
              ? "active fa fa-trash"
              : "fa fa-trash"
        }
      ];
    }
  },
  methods: {
    saveImg() {
      const _this = this;
      _this.$parent.uploadTea();
    },
    upload() {
      const preData = $("#canvas")
        .get(0)
        .toDataURL("image/png");
      let blob = this.base64ToBlob(preData);
      var formData = new FormData();
      formData.append("upfile", blob, new Date().valueOf() + ".jpg"); //fileData为自定义
      return blob;
    },
    allowDrop(ev) {
      console.log("jjj");
      ev.preventDefault();
    },

    drag(ev) {
      console.log("jjj");
      ev.dataTransfer.setData("Text", ev.target.id);
    },

    drop(ev) {
      console.log("jjj");
      ev.preventDefault();
      var data = ev.dataTransfer.getData("Text");
      ev.target.appendChild(document.getElementById(data));
    },
    write() {
      this.writeT = true;
      this.canvasMoveUse = false;
    },
    isPc() {
      const userAgentInfo = navigator.userAgent;
      const Agents = [
        "Android",
        "iPhone",
        "SymbianOS",
        "Windows Phone",
        "iPad",
        "iPod"
      ];
      let flag = true;
      for (let v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    },
    removeImg(src) {
      this.imgUrl = this.imgUrl.filter(item => item !== src);
    },
    initDraw() {
      const preData = this.context.getImageData(0, 0, 2000, 1400);
      // 空绘图表面进栈
      this.middleAry.push(preData);
    },
    canvasDown(e) {
      var _this = this;
      if (_this.config.lineWidth != 0 || _this.writeT) {
        const t = e.target;
        console.log("canvasDown", e.offsetX, e.offsetY);

        // const canvasX = e.clientX - e.target.parentNode.offsetLeft
        // const canvasY = e.clientY - e.target.parentNode.offsetTop
        const canvasX = e.offsetX; //16是model leftpadding的值
        const canvasY = e.offsetY;
        _this.startX = canvasX;
        _this.startY = canvasY;

        //61是头的高+滚动条的高度
        console.log("移动到", canvasX, canvasY);

        this.setCanvasStyle(); //设置画笔
        const color = this.context.lineColor;
        if (this.writeT) {
          this.canvasMoveUse = false;
          $("#test").attr(
            "style",
            "display:display;position:absolute;color:" +
              color +
              ";top:" +
              (canvasY - t.parentNode.parentNode.parentNode.scrollTop + 61) +
              "px;left:" +
              (canvasX + 16) +
              "px"
          );
          this.writeT = false;
        } else {
          this.canvasMoveUse = true;
          // client是基于整个页面的坐标
          // offset是cavas距离顶部以及左边的距离

          // 清除子路径
          this.context.beginPath();
          this.context.moveTo(canvasX, canvasY);

          console.log(
            "moveTo",
            canvasX,
            canvasY,
            t.parentNode.parentNode.parentNode.scrollTop
          );
          // 当前绘图表面状态
          const preData = this.context.getImageData(0, 0, 2000, 1400);
          // 当前绘图表面进栈
          this.preDrawAry.push(preData);
        }
      }
    },
    canvasMove(e) {
      if (this.canvasMoveUse) {
        console.log("canvasMove");
        const t = e.target;
        let canvasX;
        let canvasY;
        if (this.isPc()) {
          console.log(e.clientY);
          // canvasX = e.clientX - t.parentNode.offsetLeft
          // canvasY = e.clientY - t.parentNode.offsetTop
          //这是在model框里的层数,智障操作
          canvasX = e.offsetX;
          canvasY = e.offsetY;
          console.log("移动", canvasX, canvasY);
          //61是头的高+滚动条的高度
        } else {
          // canvasX = e.changedTouches[0].clientX - t.parentNode.offsetLeft
          // canvasY = e.changedTouches[0].clientY - t.parentNode.offsetTop
          canvasX = e.changedTouches[0].offsetX;
          canvasY = e.changedTouches[0].offsetY; //61是头的高
        }
        if (canvasX > 0 || canvasY > 0) {
          this.context.lineTo(canvasX, canvasY);
          this.context.stroke(); //进行绘制
        }
      }
    },
    beginPath(e) {
      const canvas = document.querySelector("#canvas");
      if (e.target !== canvas) {
        console.log("beginPath");
        this.context.beginPath();
      }
    },
    // mouseup
    canvasUp(e) {
      console.log("canvasUp");
      const preData = this.context.getImageData(0, 0, 2000, 1400);
      if (!this.nextDrawAry.length) {
        // 当前绘图表面进栈
        this.middleAry.push(preData);
      } else {
        this.middleAry = [];
        this.middleAry = this.middleAry.concat(this.preDrawAry);
        this.middleAry.push(preData);
        this.nextDrawAry = [];
      }
      this.canvasMoveUse = false;
    },
    rotateLeft() {
      this.rang = Number(this.rang) + 90;
      console.log("this", this.rang);
      this.rotateImg();
    },
    rotateImg(e) {
      this.context.clearRect(
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height
      );
      this.preDrawAry = [];
      this.nextDrawAry = [];
      this.middleAry = [this.middleAry[0]];
      var canvas = document.getElementById("canvas");
      let image = new Image();
      image.setAttribute("crossOrigin", "anonymous");
      image.src = this.img.src + "?time=" + new Date().valueOf();
      image.onload = () => {
        if (image.naturalWidth > image.naturalHeight) {
          var ctx = this.context;
          if (image.naturalWidth > 1000) {
            ctx.translate(500, image.naturalHeight * 500 / image.naturalWidth); // 1
            ctx.rotate(-Math.PI * this.rang / 180);
            if (this.rang % 180 != 0) {
              console.log("jinzheg ");
              this.context.drawImage(
                image,
                -1000 + this.imgH / 2,
                -image.naturalHeight * 500 / image.naturalWidth,
                1000,
                image.naturalHeight * 1000 / image.naturalWidth
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(
                -500,
                -image.naturalHeight * 500 / image.naturalWidth
              ); // 2
              this.imgH = (1000 - this.imgH / 2) * 2;
            } else {
              console.log("jinzheg2 ");
              this.context.drawImage(
                image,
                -500,
                -image.naturalHeight * 500 / image.naturalWidth,
                1000,
                image.naturalHeight * 1000 / image.naturalWidth
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(
                -500,
                -image.naturalHeight * 500 / image.naturalWidth
              ); // 2
            }
          } else {
            ctx.translate(image.naturalWidth / 2, image.naturalHeight / 2); // 1
            ctx.rotate(-Math.PI * this.rang / 180);
            if (this.rang % 180 != 0) {
              console.log(777);
              console.log(-image.naturalWidth, image.naturalHeight); //600 400
              this.context.drawImage(
                image,
                -this.imgW + this.imgH / 2,
                -image.naturalWidth / 2,
                image.naturalWidth,
                image.naturalHeight
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2); // 2
              this.imgH = (this.imgW - this.imgH / 2) * 2;
              // this.imgW = this.imgW - this.imgW
            } else {
              this.context.drawImage(
                image,
                -image.naturalWidth / 2,
                -image.naturalHeight / 2,
                image.naturalWidth,
                image.naturalHeight
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
            }
          }
        } else {
          var ctx = this.context;
          if (image.naturalHeight > 1000) {
            ctx.translate(image.naturalWidth * 500 / image.naturalHeight, 500); // 1
            ctx.rotate(-Math.PI * this.rang / 180);
            if (this.rang % 180 == 0) {
              this.context.drawImage(
                image,
                -image.naturalWidth * 500 / image.naturalHeight,
                -500,
                image.naturalWidth * 1000 / image.naturalHeight,
                1000
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(
                -image.naturalWidth * 500 / image.naturalHeight,
                -500
              ); // 2
              this.imgH = (1000 - this.imgW / 2) * 2;
            } else {
              this.context.drawImage(
                image,
                -500,
                -this.imgW / 2,
                image.naturalWidth * 1000 / image.naturalHeight,
                1000
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(
                -image.naturalWidth * 500 / image.naturalHeight,
                -500
              ); // 2
              this.imgW = (1000 - this.imgW / 2) * 2;
            }
          } else {
            console.log(999);
            ctx.translate(image.naturalWidth / 2, image.naturalHeight / 2); // 1
            ctx.rotate(-Math.PI * this.rang / 180);
            if (this.rang % 180 != 0) {
              this.context.drawImage(
                image,
                -image.naturalWidth / 2,
                -this.imgW / 2,
                image.naturalWidth,
                image.naturalHeight
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2); // 2
              this.imgW = (this.imgH - this.imgW / 2) * 2;
            } else {
              this.context.drawImage(
                image,
                -image.naturalWidth / 2,
                -image.naturalHeight / 2,
                image.naturalWidth,
                image.naturalHeight
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
            }
          }
          // this.context.drawImage(image,0,0,image.naturalWidth,image.naturalHeight);
        }

        // var ctx=this.context
        // ctx.translate(500, image.naturalHeight * 500 / image.naturalWidth)         // 1
        // ctx.rotate(-Math.PI * this.rang / 180)
        // if(image.naturalWidth>1000){
        //   this.context.drawImage(image,-500,-image.naturalHeight * 500 / image.naturalWidth,1000,image.naturalHeight * 1000 / image.naturalWidth);
        //   ctx.rotate(Math.PI * this.rang / 180)         // 1
        //   ctx.translate(-500, -image.naturalHeight * 500 / image.naturalWidth)       // 2
        // }else
        //   this.context.drawImage(image,0,0,image.naturalWidth,image.naturalHeight);
        //  // 恢复设置（恢复的步骤要跟你修改的步骤向反）
      };
    },

    rotateImg(e) {
      this.context.clearRect(
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height
      );
      this.preDrawAry = [];
      this.nextDrawAry = [];
      this.middleAry = [this.middleAry[0]];
      var canvas = document.getElementById("canvas");
      let image = new Image();
      image.setAttribute("crossOrigin", "anonymous");
      image.src = this.img.src + "?time=" + new Date().valueOf();
      image.onload = () => {
        if (image.naturalWidth > image.naturalHeight) {
          var ctx = this.context;
          if (image.naturalWidth > this.canvaswidth) {
            ctx.translate(
              this.canvaswidth / 2 - image.width / 2,
              this.canvasHeight / 2 - image.height / 2
            ); // 1
            ctx.rotate(-Math.PI * this.rang / 180);
            if (this.rang % 180 != 0) {
              this.context.drawImage(
                image,
                -1000 + this.imgH / 2,
                -image.naturalHeight * 500 / image.naturalWidth,
                1000,
                image.naturalHeight * 1000 / image.naturalWidth
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(
                -500,
                -image.naturalHeight * 500 / image.naturalWidth
              ); // 2
              this.imgH = (1000 - this.imgH / 2) * 2;
            } else {
              console.log("jinzheg2 ");
              this.context.drawImage(
                image,
                -500,
                -image.naturalHeight * 500 / image.naturalWidth,
                1000,
                image.naturalHeight * 1000 / image.naturalWidth
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(
                -500,
                -image.naturalHeight * 500 / image.naturalWidth
              ); // 2
            }
          } else {
            ctx.translate(image.naturalWidth / 2, image.naturalHeight / 2); // 1
            ctx.rotate(-Math.PI * this.rang / 180);
            if (this.rang % 180 != 0) {
              console.log(777);
              console.log(-image.naturalWidth, image.naturalHeight); //600 400
              this.context.drawImage(
                image,
                -this.imgW + this.imgH / 2,
                -image.naturalWidth / 2,
                image.naturalWidth,
                image.naturalHeight
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2); // 2
              this.imgH = (this.imgW - this.imgH / 2) * 2;
              // this.imgW = this.imgW - this.imgW
            } else {
              this.context.drawImage(
                image,
                -image.naturalWidth / 2,
                -image.naturalHeight / 2,
                image.naturalWidth,
                image.naturalHeight
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
            }
          }
        } else {
          var ctx = this.context;
          if (image.naturalHeight > this.canvasHeight) {
            ctx.translate(image.naturalWidth * 500 / image.naturalHeight, 500); // 1
            ctx.rotate(-Math.PI * this.rang / 180);
            if (this.rang % 180 == 0) {
              this.context.drawImage(
                image,
                -image.naturalWidth * 500 / image.naturalHeight,
                -500,
                image.naturalWidth * 1000 / image.naturalHeight,
                1000
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(
                -image.naturalWidth * 500 / image.naturalHeight,
                -500
              ); // 2
              this.imgH = (1000 - this.imgW / 2) * 2;
            } else {
              this.context.drawImage(
                image,
                -500,
                -this.imgW / 2,
                image.naturalWidth * 1000 / image.naturalHeight,
                1000
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(
                -image.naturalWidth * 500 / image.naturalHeight,
                -500
              ); // 2
              this.imgW = (1000 - this.imgW / 2) * 2;
            }
          } else {
            console.log(999);
            ctx.translate(image.naturalWidth / 2, image.naturalHeight / 2); // 1
            ctx.rotate(-Math.PI * this.rang / 180);
            if (this.rang % 180 != 0) {
              this.context.drawImage(
                image,
                -image.naturalWidth / 2,
                -this.imgW / 2,
                image.naturalWidth,
                image.naturalHeight
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2); // 2
              this.imgW = (this.imgH - this.imgW / 2) * 2;
            } else {
              this.context.drawImage(
                image,
                -image.naturalWidth / 2,
                -image.naturalHeight / 2,
                image.naturalWidth,
                image.naturalHeight
              );
              ctx.rotate(Math.PI * this.rang / 180); // 1
              ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
            }
          }
          // this.context.drawImage(image,0,0,image.naturalWidth,image.naturalHeight);
        }

        // var ctx=this.context
        // ctx.translate(500, image.naturalHeight * 500 / image.naturalWidth)         // 1
        // ctx.rotate(-Math.PI * this.rang / 180)
        // if(image.naturalWidth>1000){
        //   this.context.drawImage(image,-500,-image.naturalHeight * 500 / image.naturalWidth,1000,image.naturalHeight * 1000 / image.naturalWidth);
        //   ctx.rotate(Math.PI * this.rang / 180)         // 1
        //   ctx.translate(-500, -image.naturalHeight * 500 / image.naturalWidth)       // 2
        // }else
        //   this.context.drawImage(image,0,0,image.naturalWidth,image.naturalHeight);
        //  // 恢复设置（恢复的步骤要跟你修改的步骤向反）
      };
    },
    // mousedown

    // 设置颜色
    setColor(color) {
      console.log("yanse", color);
      this.color = color;
      this.config.lineColor = color;
    },
    // 设置笔刷大小
    setBrush(type) {
      this.config.lineWidth = type;
    },
    setTest(e) {
      const words = $("#test").val();
      console.log(words);
      if ($("#test").css("display") != "none" && "" != words) {
        let left = parseInt($("#test").css("left")) - 16;
        let top =
          parseInt($("#test").css("top")) -
          50 +
          e.target.parentNode.parentNode.parentNode.parentNode.scrollTop;
        console.log();
        this.context.font = "20px Georgia";
        this.context.shadowColor = this.color;
        this.context.strokeStyle = this.color;
        this.context.fillStyle = this.color;
        this.context.fillText(words, left, top);
        this.context.stroke();
        $("#test").val("");
      }
      // this.opeartorType.type = 0;
      $("#test").attr("style", "display:none");
      const preData = this.context.getImageData(0, 0, 2000, 1400);
      // 当前绘图表面进栈
      this.preDrawAry.push(preData);
    },
    // 操作
    controlCanvas(action) {
      switch (action) {
        case "prev":
          if (this.preDrawAry.length) {
            const popData = this.preDrawAry.pop();
            const midData = this.middleAry[this.preDrawAry.length + 1];
            this.nextDrawAry.push(midData);
            this.context.putImageData(popData, 0, 0);
          }
          break;
        case "next":
          if (this.nextDrawAry.length) {
            const popData = this.nextDrawAry.pop();
            const midData = this.middleAry[
              this.middleAry.length - this.nextDrawAry.length - 2
            ];
            this.preDrawAry.push(midData);
            this.context.putImageData(popData, 0, 0);
          }
          break;
        case "clear":
          this.context.clearRect(
            0,
            0,
            this.context.canvas.width,
            this.context.canvas.height
          );
          this.preDrawAry = [];
          this.nextDrawAry = [];
          this.middleAry = [this.middleAry[0]];
          break;
      }
    },
    // 生成图片
    // getImage () {
    //   const canvas = document.querySelector('#canvas')
    //   const src = canvas.toDataURL('image/png')
    //   this.imgUrl.push(src)
    //   if (!this.isPc()) {
    //     // window.open(`data:text/plain,${src}`)
    //     console.log(src)
    //     window.location.href = src
    //   }
    // },
    getImage() {
      const preData = $("#canvas")
        .get(0)
        .toDataURL("image/png");
      let aLink = document.createElement("a");
      let blob = this.base64ToBlob(preData); //new Blob([content]);

      //组装成formdata
      let fd = new FormData();
      fd.append("filData", blob);
      fd.append("fileName", this.imgName);

      console.log("formdata", fd);

      let evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      aLink.download = this.imgName;
      aLink.href = URL.createObjectURL(blob);

      // aLink.dispatchEvent(evt);
      aLink.click();
    },
    //base64转blob
    base64ToBlob(code) {
      let parts = code.split(";base64,");
      let contentType = parts[0].split(":")[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;

      let uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    },
    // 设置绘画配置
    setCanvasStyle() {
      this.context.lineWidth = this.config.lineWidth;
      this.context.shadowBlur = this.config.shadowBlur;
      this.context.shadowColor = this.config.lineColor;
      this.context.strokeStyle = this.config.lineColor;
    },
    setImg(url) {
      //先清空
      this.context.clearRect(
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height
      );
      this.preDrawAry = [];
      this.nextDrawAry = [];
      this.middleAry = [this.middleAry[0]];
      this.rang = 0;
      var canvas = document.getElementById("canvas");

      let image = new Image();
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url + "?time=" + new Date().valueOf();
      image.onload = () => {
        if (image.naturalWidth > image.naturalHeight) {
          //将画布的宽高设定死了
          // canvas.width=image.naturalWidth>1000?1000:image.naturalWidth < 500?500:image.naturalWidth;//注意：没有单位
          // canvas.height =image.naturalWidth>1000?image.naturalHeight * 1000 / image.naturalWidth>1000?image.naturalHeight * 1000 / image.naturalWidth:1000 : image.naturalHeight<500?500:image.naturalHeight;//注意：没有单位
          if (image.naturalWidth > 1000) {
            this.context.drawImage(
              image,
              0,
              0,
              1000,
              image.naturalHeight * 1000 / image.naturalWidth
            );
            this.imgW = 1000;
            this.imgH = image.naturalHeight * 1000 / image.naturalWidth;
          } else {
            this.context.drawImage(
              image,
              0,
              0,
              image.naturalWidth,
              image.naturalHeight
            );
            this.imgW = image.naturalWidth;
            this.imgH = image.naturalHeight;
          }
        } else {
          // canvas.height = image.naturalHeight>1000?1000:image.naturalHeight < 500?500:image.naturalHeight;//注意：没有单位
          // canvas.width = image.naturalHeight>1000?image.naturalWidth * 1000 / image.naturalHeight>1000?image.naturalWidth * 1000 / image.naturalHeight:1000 : image.naturalWidth<500?500:image.naturalWidth;//注意：没有单位
          if (image.naturalHeight > 1000) {
            this.context.drawImage(
              image,
              0,
              0,
              image.naturalWidth * 1000 / image.naturalHeight,
              1000
            );
            this.imgW = image.naturalWidth * 1000 / image.naturalHeight;
            this.imgH = 1000;
          } else {
            this.context.drawImage(
              image,
              0,
              0,
              image.naturalWidth,
              image.naturalHeight
            );
            this.imgW = image.naturalWidth;
            this.imgH = image.naturalHeight;
          }
        }
        // 恢复设置（恢复的步骤要跟你修改的步骤向反）
        this.img = image;
      };
      image.onerror = err => {
        console.log(err);
      };
    }
  }
};
</script>

<style>
#canvas {
  background: transparent;
}
@media screen and (max-width: 700px) {
  #img-box,
  #canvas-drawImage h5,
  #canvas-brush {
    display: none;
  }
  #canvas-drawImage button {
    width: auto;
    position: absolute;
    flex: 1;
  }
  .wrap #control {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    text-align: center;
  }
}
.fix-body {
  position: fixed !important;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
}
.inner.draw {
  display: flex;
  flex-direction: row;
}
.draw h5 {
  /* margin-bottom: 10px; */
  display: inline-block;
}
#img-box {
  flex: 1;
  padding-left: 10px;
}
#img-box .img-item {
  position: relative;
  display: inline-block;
}
#img-box .img-item .fa {
  position: absolute;
  cursor: pointer;
  right: 1px;
  top: -1px;
  font-size: 12px;
  font-weight: 1;
  display: none;
  color: #ccc;
}
#img-box .img-item:hover .fa {
  display: block;
}
#img-box .img-item .fa:hover {
  color: #f2849e;
}
#img-box img {
  border: 1px solid #ccc;
  width: 90px;
  height: 60px;
  margin: 5px;
}
.wrap {
  width: 100%;
  border: 1px solid #eee;
  overflow: hidden;
}
.fl {
  /* float: left; */
  display: inline-block;
}
#canvas {
  /* border-right: 1px #585858 solid; */
  cursor: crosshair;
}
#canvas-color,
#canvas-brush,
#canvas-control,
#canvas-drawImage {
  display: inline-block;
  vertical-align: middle;
}
#canvas-drawImage {
  position: absolute;
  padding: 5px !important;
  right: 0;
}
#control {
  position: relative;
  height: 40px;
  border-bottom: 1px solid #eee;
}
#control div {
  padding: 10px;
}
#canvas-color ul {
  display: inline-block;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#canvas-color ul li {
  float: left;
  display: inherit;
  width: 13px;
  height: 13px;
  border: 3px #fff solid;
  margin: 0px 8px;
  cursor: pointer;
}
#canvas-color .active {
  border: 1px solid #f2849e;
}
#canvas-brush span {
  display: inline-block;
  width: 20px;
  height: 15px;
  margin-left: 10px;
  cursor: pointer;
}
#canvas-brush .small {
  font-size: 12px;
}
#canvas-brush .middle {
  font-size: 14px;
}
#canvas-brush .big {
  font-size: 16px;
}

#canvas-control span {
  display: inline-block;
  font-size: 14px;
  width: 20px;
  height: 15px;
  margin-left: 10px;
  cursor: pointer;
}
#canvas-control .active,
#canvas-brush .active {
  color: #f2849e;
}
.drawImage {
  width: 100px;
  height: 30px;
  font-size: 12px;
  line-height: 30px;
  color: #fff;
  background-color: #3089f1;
}
</style>
