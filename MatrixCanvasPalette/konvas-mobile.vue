<template>
    <div
        class="drawer-wrapper"
        @touchstart="onTouchStart($event)"
        @touchend="onTouchEnd($event)"
        @touchmove="preventTouchMove($event)"
    >
        <div class="container-wrapper">
            <div class="drawer-index">{{ currentIndex + 1 }}/{{ total }}</div>
            <div id="container" ref="canvasRef"></div>
        </div>
        <!-- <van-loading v-show="show" type="spinner" color="#1989fa" /> -->
    </div>
</template>

<script>
import Konva from "konva";
import { Loading } from "vant";
export default {
    props: {
        renderImgUrl: {
            type: String,
            default: () => "",
        },
        total: {
            type: Number,
            default: () => 0,
        },
        currentIndex: {
            type: Number,
            default: () => 0,
        },
    },
    components: { [Loading.name]: Loading },
    data() {
        return {
            canDrawImage: true,
            baseStage: null,
            baseLayer: null, //基础层
            group: null, //容器
            lastLine: null, //最近时间的一条线
            isPaint: false, //是否在绘画
            canPaint: true, //是否允许绘画

            needTextArea: false, //是否需要生成一个字体框
            appHistory: [], //画布历史
            appHistoryStep: 0,
            groupDegree: 0, //角度
            groupScale: 10,
            colors: ["#fef4ac", "#0018ba", "#ffc200", "#f32f15", "#cccccc", "#5ab639", "#ffffff"],
            brushes: [
                {
                    className: "small fa fa-paint-brush",
                    lineWidth: 3,
                },
                {
                    className: "middle fa fa-paint-brush",
                    lineWidth: 6,
                },
                {
                    className: "big fa fa-paint-brush",
                    lineWidth: 12,
                },
            ],
            config: {
                lineWidth: 3,
                lineColor: "#f32f15",
                shadowBlur: 2,
            },
            tickable: false,
            inclinedable: false,
            crossable: false,
            lastSymbol: "tickable",
            background: {
                width: 0,
                height: 0,
            },
            canvasWidth: 0,
            canvasHeight: 0,

            show: false, // 加载进度

            scaleDown: false,
            touchDistance: 0,
            lastPinchScale: 1,

            imageNatural: {
                width: 0,
                height: 0,
                scaleWidth: 0,
                scaleHeight: 0,
            },
        };
    },
    computed: {
        controls() {
            return [
                {
                    title: "上一步",
                    action: "prev",
                    className: this.appHistory.length > 1 ? "active fa fa-reply" : "fa fa-reply",
                },
                // {
                //   title: "下一步",
                //   action: "next",
                //   className: this.nextDrawAry.length
                //     ? "active fa fa-share"
                //     : "fa fa-share"
                // },
                {
                    title: "清除",
                    action: "clear",
                    className: this.appHistory.length > 1 ? "active fa fa-trash" : "fa fa-trash",
                },
                {
                    title: "缩小",
                    action: "minus",
                    className: "fa fa-search-minus",
                },
                {
                    title: "放大",
                    action: "plus",
                    className: "fa fa-search-plus",
                },
            ];
        },
    },
    watch: {
        renderImgUrl(newValue) {
            this.baseStage.destroy();
            this.appHistory = []; //画布历史
            this.appHistoryStep = 0;
            this.initCanvas();
        },
        canPaint(newValue) {
            this.$emit("penStatus", newValue);
        },
        appHistoryStep() {
            this.$emit("revokeStatus", this.appHistory.length);
        },
    },
    mounted() {
        this.initCanvas();
        this.$emit("penStatus", this.canPaint);
    },
    methods: {
        /**
         * @description: 笔的大小随着画布的放大而缩小
         * @return {*}
         * @Date: 2022-11-11 15:17:12
         * @Author: David
         */
        scaleBrush() {
            let scale = this.group.scale();
            console.log(scale);
            // this.config.lineWidth = this.config.lineWidth / scale.x;
            console.log(this.config.lineWidth);
        },
        onTouchStart(event) {
            let _this = this;

            let x = _this.group.getAttr("x");
            let y = _this.group.getAttr("y");

            if (event.touches.length > 1) {
                _this.scaleDown = true;

                _this.canPaint = false;
                _this.group.draggable(false);

                let xLen = Math.abs(event.touches[1].pageX - event.touches[0].pageX);
                let yLen = Math.abs(event.touches[1].pageY - event.touches[0].pageY);

                _this.touchDistance = Math.sqrt(xLen * xLen + yLen * yLen);
            }
        },

        preventTouchMove(event) {
            let _this = this;

            if (event.touches.length > 1) {
                let xLen = Math.abs(event.touches[1].pageX - event.touches[0].pageX);
                let yLen = Math.abs(event.touches[1].pageY - event.touches[0].pageY);

                let touchDistance = Math.sqrt(xLen * xLen + yLen * yLen);

                if (_this.touchDistance > 0) {
                    let pinchScale = (touchDistance / _this.touchDistance) * _this.lastPinchScale;

                    let x = event.touches[0].clientX + xLen / 2;
                    let y = event.touches[0].clientY + yLen / 2;

                    _this.doScale({ x: x, y: y }, pinchScale);
                }
            }

            event.preventDefault(true);
        },

        onTouchEnd(event) {
            let _this = this;

            _this.lastPinchScale = _this.group.scale().x;

            if (_this.scaleDown) {
                _this.scaleDown = false;
                _this.group.setDraggable(true);
            }
        },

        doScale: function (anchorPt, newScale) {
            let _this = this;

            let x = _this.group.getAttr("x");
            let y = _this.group.getAttr("y");

            let scale = _this.group.scale();

            let x1 = anchorPt.x;
            let y1 = anchorPt.y;

            let s1 = scale.x;
            let s2 = newScale;

            let x2 = x1 - ((x1 - x) * s2) / s1;
            let y2 = y1 - ((y1 - y) * s2) / s1;

            _this.group.setAttr("x", x2);
            _this.group.setAttr("y", y2);

            _this.group.scale({ x: newScale, y: newScale });
        },

        canvasDestroyed() {
            this.baseStage ? this.baseStage.destroy() : null;
        },
        rotate(action) {
            this.canPaint = false;
            this.needTextArea = false;
            this.addHistory(this.group.clone());
            this.group.draggable(true);
            // document.getElementById("textFont").classList.remove("active");
            switch (action) {
                case "left":
                    this.groupDegree -= 90;
                    this.groupDegree = this.groupDegree % 360 == 0 ? 0 : this.groupDegree;
                    this.group.setAttr("rotation", this.groupDegree);
                    // this.rotateGroup(this.groupDegree);

                    break;
                case "right":
                    this.groupDegree += 90;
                    this.groupDegree = this.groupDegree % 360 == 0 ? 0 : this.groupDegree;
                    this.group.setAttr("rotation", this.groupDegree);
                    break;
            }
        },
        rotateGroup(degree) {
            this.baseStage.on("click tap", e => {
                // console.log(e.target);
                let transList = this.baseStage.find("Transformer");
                if (e.target === this.baseStage) {
                    for (let i = 0; i < transList.length; i++) {
                        transList[i].destroy();
                    }
                    this.baseLayer.draw();
                    return;
                }

                // if (!e.target.hasName("rect")) {
                //   return;
                // }

                for (let i = 0; i < transList.length; i++) {
                    transList[i].destroy();
                }

                let tr = new Konva.Transformer({
                    nodes: [this.group],
                    x: this.group.width() / 2,
                    y: this.group.height() / 2,
                    borderStroke: "#f2849e", // 虚线颜色
                    borderStrokeWidth: 2, //虚线大小
                    borderDash: [5], // 虚线间距
                    keepRatio: true, // 等比缩放
                    centeredScaling: true,
                    resizeEnabled: false,
                    rotationSnaps: [0, 90, 180, 270],
                });
                // tr.hide();
                // tr.rotation(degree);
                this.baseLayer.add(tr);
                this.group.draggable(true);
                tr.forceUpdate();

                this.baseLayer.draw();

                e.cancelBubble = true;
            });
        },

        controlCanvas(action) {
            // let canvasWidth = this.$refs.canvasRef.clientWidth;
            // let canvasHeight = this.$refs.canvasRef.clientHeight;

            switch (action) {
                case "prev":
                    if (this.appHistoryStep > 1) {
                        this.appHistoryStep--;

                        let scale = this.group.getAbsoluteScale();
                        this.groupScale = (scale.x * 10).toFixed(2);
                        let preGroup = (this.group = this.appHistory.pop());
                        this.baseLayer.destroyChildren();
                        this.baseLayer.add(preGroup);
                        this.baseLayer.draw();
                    }
                    break;
                case "clear": {
                    if (this.appHistory.length > 1) {
                        this.groupScale = 10;
                        this.appHistory.splice(1, this.appHistory.length - 1);
                        this.appHistoryStep = 1;
                        let preGroup = (this.group = this.appHistory[0]);
                        this.baseLayer.destroyChildren();
                        this.baseLayer.add(preGroup);
                        this.baseLayer.draw();
                    }

                    break;
                }
                case "minus": {
                    if (this.groupScale > 2 && this.groupScale <= 20) {
                        this.group.draggable(!this.canPaint);

                        this.group.setAttr("x", this.canvasWidth / 2);
                        this.group.setAttr("y", this.canvasHeight / 2);
                        this.groupScale -= 1;
                        let newScale = +(this.groupScale / 10).toFixed(2);
                        this.addHistory(this.group.clone());
                        this.group.scale({ x: newScale, y: newScale });
                        this.scaleBrush();
                    }
                    break;
                }
                case "plus": {
                    if (this.groupScale >= 2 && this.groupScale < 20) {
                        this.group.draggable(!this.canPaint);

                        this.group.setAttr("x", this.canvasWidth / 2);
                        this.group.setAttr("y", this.canvasHeight / 2);
                        this.groupScale += 1;
                        let newScale = +(this.groupScale / 10).toFixed(2);
                        this.addHistory(this.group.clone());
                        this.group.scale({ x: newScale, y: newScale });
                        this.scaleBrush();
                    }
                }
            }
        },

        debounce(func, wait = 500) {
            // 缓存一个定时器id
            let timer = 0;
            // 这里返回的函数是每次用户实际调用的防抖函数
            // 如果已经设定过定时器了就清空上一次的定时器
            // 开始一个新的定时器，延迟执行用户传入的方法
            return function (...args) {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    func.apply(this, args);
                }, wait);
            };
        },
        setColor(color) {
            this.config.lineColor = color;
        },
        setBrush(type) {
            this.canPaint = !this.canPaint;
            this[this.lastSymbol] = false;
            this.group.draggable(!this.canPaint);
            this.config.lineWidth = type;
        },
        setText() {
            this.canPaint = false;
            this.needTextArea = true;
            this[this.lastSymbol] = false;
            // document.getElementById("textFont").classList.add("active");
            this.addHistory(this.group.clone());
            this.baseStage.on("mousedown touchend", evt => {
                if (this.needTextArea) {
                    let pos = this.getRelativePointerPosition(this.group);
                    //字体节点展示的位置
                    let textNode = new Konva.Text({
                        x: pos.x,
                        y: pos.y,
                        fontSize: 20,
                        text: "双击编辑",
                        draggable: true,
                        borderStroke: "#000", // 虚线颜色
                        borderStrokeWidth: 10, //虚线大小
                        borderDash: [0], // 虚线间距
                        rotation: -this.group.rotation(),
                        fill: this.config.lineColor,
                    });

                    // let MIN_WIDTH = 20;
                    // let tr = new Konva.Transformer({
                    //   nodes: [textNode],
                    //   padding: 5,
                    //   // enable only side anchors
                    //   enabledAnchors: ["middle-left", "middle-right"],
                    //   // limit transformer size
                    //   boundBoxFunc: (oldBox, newBox) => {
                    //     if (newBox.width < MIN_WIDTH) {
                    //       return oldBox;
                    //     }
                    //     return newBox;
                    //   }
                    // });

                    // textNode.on(
                    //   "transformend",
                    //   this.debounce(() => {
                    //     textNode.setAttrs({
                    //       width: Math.max(
                    //         textNode.width() * textNode.scaleX(),
                    //         MIN_WIDTH
                    //       ),
                    //       scaleX: 1,
                    //       scaleY: 1
                    //     });
                    //   })
                    // );

                    // this.group.add(tr);
                    // textNode.hide();
                    // tr.hide();

                    // create textarea over canvas with absolute position
                    // first we need to find position for textarea
                    // how to find it?

                    // at first lets find position of text node relative to the stage:
                    var textPosition = textNode.absolutePosition();
                    textNode.on("dblclick dbltap", e => {
                        textNode.hide();
                        // tr.hide();
                        // console.log(this.getRelativePointerPosition(this.group));

                        // textNode.x(this.getRelativePointerPosition(this.baseLayer).x - this.getRelativePointerPosition(this.baseLayer).x);
                        // textNode.y(this.getRelativePointerPosition(this.baseLayer).y);
                        this.buildTextArea(
                            { x: textNode.x(), y: textNode.y() },
                            textNode
                            // tr
                        );
                        e.cancelBubble = true;
                    });

                    textNode.on("dragstart", e => {
                        // console.log(e);
                        this.addHistory(this.group.clone());
                        e.cancelBubble = true;
                    });

                    this.group.add(textNode);
                    this.baseLayer.draw();
                    // this.buildTextArea(textPosition, textNode);
                }
                this.needTextArea = false;

                evt.cancelBubble = true;
            });
        },

        buildTextArea(textPosition, textNode) {
            var areaPosition = {
                x: textPosition.x,
                y: textPosition.y,
            };

            var textarea = document.createElement("textarea");
            const canvasContainer = document.getElementById("container");
            canvasContainer.appendChild(textarea);

            textarea.value = textNode.text() === "双击编辑" ? "" : textNode.text();
            textarea.style.position = "absolute";
            textarea.style.top = textNode.absolutePosition().y + "px"; //group的增加是修正偏移的位置
            textarea.style.left = textNode.absolutePosition().x + "px";
            textarea.style.width = textNode.width() - textNode.padding() * 2 + "px";
            textarea.style.height = textNode.height() - textNode.padding() * 2 + 5 + "px";
            textarea.style.fontSize = ((textNode.fontSize() * this.group.scaleX() * 10) / 10).toFixed() + "px";
            textarea.style.border = "none";
            textarea.style.padding = "0px";
            textarea.style.margin = "0px";
            textarea.style.overflow = "hidden";
            textarea.style.background = "none";
            textarea.style.outline = "none";
            textarea.style.resize = "none";
            textarea.style.lineHeight = textNode.lineHeight();
            textarea.style.fontFamily = textNode.fontFamily();
            textarea.style.transformOrigin = "left top";
            textarea.style.textAlign = textNode.align();
            textarea.style.color = this.config.lineColor;
            textarea.style.border = "1px solid #f32f15";
            // let rotation = textNode.rotation();

            let rotation = 0;

            var transform = "";
            if (rotation) {
                transform += "rotateZ(" + rotation + "deg)";
            }

            var px = 0;

            var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
            if (isFirefox) {
                px += 2 + Math.round(textNode.fontSize() / 20);
            }
            transform += "translateY(-" + px + "px)";

            textarea.style.transform = transform;

            textarea.style.height = "auto";

            textarea.style.height = textarea.scrollHeight + 3 + "px";

            textarea.focus();

            let removeTextarea = () => {
                if (textarea.parentNode) {
                    textarea.parentNode.removeChild(textarea);
                    this.group.removeEventListener("click touchend", handleOutsideClick);
                    // document.getElementById("textFont").classList.remove("active");
                    textNode.show();
                    // tr.show();
                    // tr.forceUpdate();
                    this.baseLayer.draw();
                    // this.addHistory(this.group.clone());
                }
            };

            function setTextareaWidth(newWidth) {
                if (!newWidth) {
                    newWidth = textNode.placeholder.length * textNode.fontSize();
                }

                var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
                if (isSafari || isFirefox) {
                    newWidth = Math.ceil(newWidth);
                }

                var isEdge = document.documentMode || /Edge/.test(navigator.userAgent);
                if (isEdge) {
                    newWidth += 1;
                }
                textarea.style.width = newWidth + "px";
            }

            textarea.addEventListener("keydown", function (e) {
                // if (e.keyCode === 13 && !e.shiftKey) {
                //   textNode.text(textarea.value);
                //   removeTextarea();
                // }

                if (e.keyCode === 27) {
                    removeTextarea();
                }
            });

            textarea.addEventListener("keydown", function (e) {
                let scale = textNode.getAbsoluteScale().x;
                setTextareaWidth(textNode.width() * scale);
                textarea.style.height = "auto";
                textarea.style.height = textarea.scrollHeight + textNode.fontSize() + "px";
            });

            function handleOutsideClick(e) {
                if (e.target !== textarea) {
                    textNode.text(textarea.value);
                    removeTextarea();
                }
                e.cancelBubble = true;
            }
            setTimeout(() => {
                // window.addEventListener("click", handleOutsideClick, { passive: true });
                this.group.on("click touchend", handleOutsideClick);
            });
        },
        /**
         * @description: 生成画布，如果有图片就画一张图片,并将此画层作为基础画层
         * @param {*}
         * @return {*}
         * @Date: 2022-03-18 09:12:57
         * @Author: David
         */
        initCanvas() {
            Konva.hitOnDragEnabled = true;
            Konva.captureTouchEventsEnabled = true;
            // let canvasWidth = this.$refs.canvasRef.clientWidth;
            // let canvasHeight = this.$refs.canvasRef.clientHeight;
            this.canvasWidth = this.$refs.canvasRef.clientWidth;
            this.canvasHeight = this.$refs.canvasRef.clientHeight;

            this.baseStage = new Konva.Stage({
                container: "container", // id of container <div>
                width: this.canvasWidth,
                height: this.canvasHeight,
            });
            this.baseLayer = new Konva.Layer(); //基础的画布层
            this.group = new Konva.Group({
                x: this.canvasWidth / 2,
                y: this.canvasHeight / 2,
            });

            this.baseLayer.add(this.group);

            // add the layer to the stage
            this.baseStage.add(this.baseLayer);

            if (this.renderImgUrl != "") {
                this.drawImage({
                    url: this.renderImgUrl,
                });
            }
            this.drawLiner();
        },
        /**
         * @description: 画一张图片到画布上
         * @param {*}
         * @return {*}
         * @Date: 2022-03-18 09:14:14
         * @Author: David
         */
        drawImage(params) {
            // this.show = true;
            return (() => {
                let image;
                let { x, y, url, width, height } = params;
                // let canvasWidth = this.$refs.canvasRef.clientWidth;
                // let canvasHeight = this.$refs.canvasRef.clientHeight;
                let imageObj = new Image();
                // imageObj.setAttribute("crossOrigin", "anonymous");

                imageObj.src = url;

                imageObj.onload = async () => {
                    let scaleimage = this.scaleImage(
                        imageObj.naturalWidth,
                        imageObj.naturalHeight,
                        this.canvasWidth,
                        this.canvasHeight
                    );
                    this.imageNatural = {
                        width: imageObj.naturalWidth,
                        height: imageObj.naturalHeight,
                        scaleWidth: scaleimage.width,
                        scaleHeight: scaleimage.height,
                    };
                    let calcCanvasSize = () => {
                        return new Promise((resolve, reject) => {
                            let canvasSize = null;
                            canvasSize = setInterval(() => {
                                if (typeof scaleimage === "undefined") return;
                                if (scaleimage.width <= this.canvasWidth && scaleimage.height <= this.canvasHeight) {
                                    clearInterval(canvasSize);
                                    resolve();
                                } else {
                                    scaleimage = this.scaleImage(
                                        scaleimage.width,
                                        scaleimage.height,
                                        this.canvasWidth,
                                        this.canvasHeight
                                    );
                                }
                            });
                        });
                    };

                    await calcCanvasSize();

                    this.background = scaleimage;

                    image = new Konva.Image({
                        x: -scaleimage.width / 2,
                        y: -scaleimage.height / 2,
                        image: imageObj,
                        width: scaleimage.width,
                        height: scaleimage.height,
                        rotation: 0,
                    });
                    // this.show = false;
                    this.group.add(image);
                    this.baseLayer.batchDraw();
                    this.addHistory(this.group.clone());
                };
            })();
        },
        scaleImage(imWidth, imHeight, caWidth, caHeight) {
            // console.log(imWidth, imHeight, caWidth, caHeight);
            //图片 宽高，画布宽高
            if (imWidth > caWidth && imHeight > caHeight) {
                return {
                    width: (imWidth * caHeight) / imHeight,
                    height: caHeight,
                };
            } else if (imWidth >= caWidth && imHeight <= caHeight) {
                return {
                    width: caWidth,
                    height: (imHeight * caWidth) / imWidth,
                };
            } else if (imWidth < caWidth && imHeight > caHeight) {
                return {
                    width: (imWidth * caHeight) / imHeight,
                    height: caHeight,
                };
            } else {
                return {
                    width: imWidth,
                    height: imHeight,
                };
            }
        },
        /**
         * @description: 改变笔的颜色和大小
         * @param {*}
         * @return {*}
         * @Date: 2022-03-18 13:42:48
         * @Author: David
         */
        changePen() {
            return (() => {
                let params = [...arguments];
                for (let i in params) {
                    this.config[i] = params[i];
                }
            })();
        },
        drawLiner(mode = "brush") {
            this.baseStage.on("mousedown touchstart", e => {
                if (this.canPaint) {
                    this.isPaint = true; //绘画
                    let pos = this.getRelativePointerPosition(this.group);
                    this.lastLine = new Konva.Line({
                        stroke: this.config.lineColor,
                        strokeWidth: this.config.lineWidth,
                        globalCompositeOperation: mode === "brush" ? "source-over" : "destination-out",
                        points: [pos.x, pos.y],
                    });

                    this.addHistory(this.group.clone());
                    this.group.add(this.lastLine);
                }
                e.cancelBubble = true;
            });
            this.baseStage.on("mouseup touchend", e => {
                this.isPaint = false;
                this.baseLayer.batchDraw();
                e.cancelBubble = true;
            });

            // and core function - drawing
            this.baseStage.on("mousemove touchmove", e => {
                if (!this.isPaint || !this.canPaint) {
                    return;
                }

                const pos = this.getRelativePointerPosition(this.group);
                let newPoints = this.lastLine.points().concat([pos.x, pos.y]);
                this.lastLine.points(newPoints);
                e.cancelBubble = true;
            });
        },
        addHistory(group) {
            this.appHistoryStep++;
            this.appHistory.push(group);
        },
        //获取相对位置
        getRelativePointerPosition(node) {
            // let transform = node.getAbsoluteTransform().copy();
            // transform.invert();
            // let pos = node.getStage().getPointerPosition();
            // return transform.point(pos);

            const pos = this.baseStage.getPointerPosition();

            const absTransform = this.group.getAbsoluteTransform();

            const invertedTransform = new Konva.Transform(absTransform.getMatrix()).invert();

            const shapePos = invertedTransform.point(pos);
            return shapePos;
        },
        drawShap(type) {
            this.canPaint = false;
            this[this.lastSymbol] = false;
            this[type] = true;
            this.lastSymbol = type;
            this.baseStage.on("mousedown touchend", e => {
                let pos = this.getRelativePointerPosition(this.group);
                //暂时固定写法
                if (type == "tickable" && this.tickable) {
                    this.addHistory(this.group.clone());
                    // [pos.x, pos.y, pos.x + 20, pos.y + 15, pos.x + 35, pos.y - 15];
                    let tick = new Konva.Line({
                        points: [pos.x, pos.y],
                        stroke: this.config.lineColor,
                        strokeWidth: this.config.lineWidth,
                        lineJoin: "round",
                    });
                    if (this.group.rotation() == 0) {
                        tick.points(tick.points().concat([pos.x + 20, pos.y + 15, pos.x + 35, pos.y - 15]));
                    } else if (this.group.rotation() == 90) {
                        tick.points(tick.points().concat([pos.x + 15, pos.y - 20, pos.x - 15, pos.y - 35]));
                    } else if (this.group.rotation() == 180) {
                        tick.points(tick.points().concat([pos.x - 15, pos.y - 20, pos.x - 35, pos.y + 15]));
                    } else {
                        tick.points(tick.points().concat([pos.x - 20, pos.y + 15, pos.x + 15, pos.y + 35]));
                    }
                    this.group.add(tick);
                    this.baseLayer.draw();
                }
                if (type == "inclinedable" && this.inclinedable) {
                    this.addHistory(this.group.clone());
                    //  [pos.x, pos.y, pos.x + 30, pos.y + 45]
                    let inclined = new Konva.Line({
                        points: [pos.x, pos.y],
                        stroke: this.config.lineColor,
                        strokeWidth: this.config.lineWidth,
                        lineJoin: "round",
                    });
                    if (this.group.rotation() == 0) {
                        inclined.points(inclined.points().concat([pos.x + 30, pos.y + 45]));
                    } else if (this.group.rotation() == 90) {
                        inclined.points(inclined.points().concat([pos.x + 45, pos.y - 30]));
                    } else if (this.group.rotation() == 180) {
                        inclined.points(inclined.points().concat([pos.x - 30, pos.y - 45]));
                    } else {
                        inclined.points(inclined.points().concat([pos.x - 45, pos.y + 30]));
                    }

                    this.group.add(inclined);
                    this.baseLayer.draw();
                }
                if (type == "crossable" && this.crossable) {
                    this.addHistory(this.group.clone());
                    let cross = new Konva.Line({
                        points: [
                            pos.x,
                            pos.y,
                            pos.x + 30,
                            pos.y + 30,
                            pos.x + 15,
                            pos.y + 15,
                            pos.x + 30,
                            pos.y,
                            pos.x,
                            pos.y + 30,
                        ],
                        stroke: this.config.lineColor,
                        strokeWidth: this.config.lineWidth,
                        lineJoin: "round",
                    });
                    this.group.add(cross);
                    this.baseLayer.draw();
                }
                e.cancelBubble = true;
            });
        },
        exportImage() {
            // let canvasWidth = this.$refs.canvasRef.clientWidth;
            // let canvasHeight = this.$refs.canvasRef.clientHeight;
            this.group.setAttr("x", this.canvasWidth / 2);
            this.group.setAttr("y", this.canvasHeight / 2);
            this.groupScale = 10;
            this.group.scale({
                x: +(this.groupScale / 10).toFixed(2),
                y: +(this.groupScale / 10).toFixed(2),
            });
            let tr = new Konva.Transformer({
                nodes: [this.group],
                x: +(this.group.width() / 2).toFixed(2),
                y: +(this.group.height() / 2).toFixed(2),
                borderStroke: "#f2849e", // 虚线颜色
                borderStrokeWidth: 0, //虚线大小
                borderDash: [5], // 虚线间距
                resizeEnabled: false,
                rotateEnabled: false,
            });

            this.baseLayer.add(tr);
            this.group.draggable(true);
            tr.forceUpdate();
            this.baseLayer.draw();
            let transList = this.baseStage.find("Transformer");

            let relativePosition = { x: 0, y: 0, width: 0, height: 0 };
            if (this.group.rotation() == 0) {
                relativePosition.x = tr.x();
                relativePosition.y = tr.y();
                relativePosition.width = tr.width();
                relativePosition.height = tr.height();
            } else if (this.group.rotation() == 90) {
                relativePosition.x = tr.x() - tr.height();
                relativePosition.y = tr.y();
                relativePosition.width = tr.height();
                relativePosition.height = tr.width();
            } else if (this.group.rotation() == 180) {
                relativePosition.x = tr.x() - tr.width();
                relativePosition.y = tr.y() - tr.height();
                relativePosition.width = tr.width();
                relativePosition.height = tr.height();
            } else if (this.group.rotation() == 270) {
                relativePosition.x = tr.x();
                relativePosition.y = tr.y() - tr.width();
                relativePosition.width = tr.height();
                relativePosition.height = tr.width();
            }
            transList.forEach(element => {
                element.destroy();
            });
            let ratio = () => {
                let widthScale = this.imageNatural.width / this.imageNatural.scaleWidth;
                let heightScale = this.imageNatural.height / this.imageNatural.scaleHeight;
                return Math.max(widthScale, heightScale, 1);
            };
            let dataURL = this.baseStage.toDataURL({
                x: relativePosition.x,
                y: relativePosition.y,
                pixelRatio: ratio(),
                width: relativePosition.width,
                height: relativePosition.height,
            });

            return dataURL;
            let downloadURI = (uri, name) => {
                let link = document.createElement("a");
                link.download = name;
                console.log(uri);
                link.href = uri;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
            // downloadURI(dataURL, "stage.png");
        },
    },
};
</script>

<style lang="scss" scoped>
.drawer-wrapper {
    display: flex;
    .container-wrapper {
        width: 100%;
        height: 100%;
        // .img-list {
        //     height: 120px;
        //     overflow: auto;
        //     display: flex;
        //     gap: 10px;
        // }
        position: relative;

        .drawer-index {
            position: absolute;
            right: 8px;
            top: 8px;
            color: #fff;
            font-size: 14px;
            width: 40px;
            height: 21px;
            background: rgba(0, 0, 0, 0.25);
            border-radius: 37px 37px 37px 37px;
            text-align: center;
        }
        #container {
            width: 100%;
            height: 100%;
            overflow: auto;
            border: 1px solid #eee;
            cursor: crosshair;
            position: relative;
        }
    }
    .controller {
        width: 140px;
        height: 100%;
        margin-left: 4px;
        div {
            padding: 5px;
        }
        .canvas-control {
            .active-right {
                color: #f2849e;
            }
        }
        .canvas-control,
        .canvas-brush {
            span {
                display: inline-block;
                font-size: 14px;
                width: 20px;
                height: 15px;
                margin-left: 10px;
                cursor: pointer;
            }
            .active {
                color: #f2849e;
            }
        }
        .canvas-color {
            .color-ul {
                overflow: hidden;
                margin: 0;
                padding: 0;
                .color-li {
                    float: left;
                    display: inherit;
                    width: 13px;
                    height: 13px;
                    border: 3px #fff solid;
                    margin: 8px;
                    cursor: pointer;
                }
                .active {
                    border: 1px solid #f2849e;
                }
            }
        }
        .canvas-brush {
            .small {
                font-size: 12px;
            }
            .middle {
                font-size: 14px;
            }
            .big {
                font-size: 16px;
            }
        }
    }
}
</style>
