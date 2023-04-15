import Konva from 'konva';

export const EventMethods = {
  MOUSEDOWN: "mousedown",
  TOUCHSTART: 'touchstart',
  MOUSEUP: "mouseup",
  TOUCHEND: "touchend",
  MOUSEMOVE: "mousemove",
  TOUCHMOVE: "touchmove"
}

class DrawCanvas {
  constructor() {
    this.baseStage = null;
    this.baseLayer = null;
    this.group = null; //容器
    this.isPaint = false;// 是否在绘画
    this.canvasRef = document.createElement(`div`); // 生成的画布的挂载对象
    this.canvasRef.id = `${new Date().getTime()}`;
    this.canvasRef.className = "swiper-slide";
    this.canPaint = true; // 是否允许绘画
    this.lastLine = null;// 最近时间的一条线
    this.config = {
      lineWidth: 2,
      lineColor: '#000',
      shadowBlur: 2,
    }

    this.appHistoryStep = 0;// 历史步骤数
    this.appHistory = []; // 历史步骤

    this.groupScale = 10; // 放大倍数

    this.canvasWidth = 0;
    this.canvasHeight = 0;

    this.imageNatural = {
      width: 0,
      height: 0,
      scaleWidth: 0,
      scaleHeight: 0,
    }
  }

  initBoard ({ width, height }) {
    this.baseStage = new Konva.Stage({
      container: this.canvasRef.id,
      width: width,
      height: height
    })
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.baseLayer = new Konva.Layer();
    this.group = new Konva.Group({ x: width / 2, y: height / 2 });
    // 设置背景颜色
    this.setBackgroundColor()
    // 设置 间隔线
    this.drawIntervalLine()
    this.baseLayer.add(this.group);
    this.baseStage.add(this.baseLayer);
    this.addHistory(this.group.clone())
    this.drawLiner()
  }

  setBackgroundColor () {
    let bgRect = new Konva.Rect({
      width: this.baseStage.width(),
      height: this.baseStage.height(),
      fill: 'white'
    });
    this.baseLayer.add(bgRect)
  }

  // 画横线
  drawIntervalLine (space = 56) {

    for (let i = 0; i < this.baseStage.height() / space; i++) {
      let line = new Konva.Line({
        points: [0, i * space, this.baseStage.width(), i * space],
        stroke: '#DCDCDC',
        strokeWidth: 1
      });
      this.baseLayer.add(line);
    }
  }

  // 笔迹
  drawLiner (mode = 'brush') {
    this.baseStage.on(`${EventMethods.MOUSEDOWN} ${EventMethods.TOUCHSTART}`, e => {
      if (this.canPaint) {
        this.isPaint = true;
        let pos = this.getRelativePointerPosition();
        this.lastLine = new Konva.Line({
          stroke: this.config.lineColor,
          strokeWidth: this.config.lineWidth,
          globalCompositeOperation:
            mode === 'brush' ? 'source-over' : 'destination-out',
          points: [pos.x, pos.y],
        })

        this.addHistory(this.group.clone())
        this.group.add(this.lastLine)
      }
    })
    this.baseStage.on(`${EventMethods.MOUSEUP} ${EventMethods.TOUCHEND}`, (e) => {
      this.isPaint = false;
      this.baseLayer.batchDraw()
    })
    this.baseStage.on(`${EventMethods.MOUSEMOVE} ${EventMethods.TOUCHMOVE}`, () => {
      if (!this.isPaint || !this.canPaint) {
        return;
      }
      const pos = this.getRelativePointerPosition();
      let newPoints = this.lastLine.points().concat([pos.x, pos.y]);
      this.lastLine.points(newPoints);
    });
  }

  // 获取相对距离
  getRelativePointerPosition () {
    const pos = this.baseStage.getPointerPosition();
    const absTransform = this.group.getAbsoluteTransform();

    const invertedTransform = new Konva.Transform(
      absTransform.getMatrix()
    ).invert();

    const shapePos = invertedTransform.point(pos);
    return shapePos;
  }

  // 绘画历史保存
  addHistory (group) {
    this.appHistoryStep++;
    group ? this.appHistory.push(group) : false;
  }

  destroy () {
    this.baseStage.destroy();
    this.baseLayer.destroy();
    this.group.destroy();
    let events = '';
    for (let i in EventMethods) {
      events += `${EventMethods[i]} `
    }
    this.baseStage.off(events);
  }

  clearBoard () {

    if (this.appHistory.length > 1) {
      this.appHistoryStep = 0;
      this.group = this.appHistory[0];
      this.baseLayer.destroyChildren();
      this.setBackgroundColor();
      this.drawIntervalLine();
      this.baseLayer.add(this.group);
      this.baseLayer.draw();
    }
  }

  exportImage () {
    this.group.setAttr('x', this.canvasWidth / 2);
    this.group.setAttr('y', this.canvasHeight / 2);
    this.groupScale = 10;
    this.group.scale({
      x: +(this.groupScale / 10).toFixed(2),
      y: +(this.groupScale / 10).toFixed(2),
    });
    let tr = new Konva.Transformer({
      nodes: [this.group],
      x: +(this.group.width() / 2).toFixed(2),
      y: +(this.group.height() / 2).toFixed(2),
      borderStroke: '#f2849e', // 虚线颜色
      borderStrokeWidth: 0, //虚线大小
      borderDash: [5], // 虚线间距
      resizeEnabled: false,
      rotateEnabled: false,
    });

    this.baseLayer.add(tr);
    this.group.draggable(true);
    tr.forceUpdate();
    this.baseLayer.draw();
    let transList = this.baseStage.find('Transformer');

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
    transList.forEach((element) => {
      element.destroy();
    });
    let ratio = () => {
      // 计算放大倍数，暂时不需要返回1
      // let widthScale = this.imageNatural.width / this.imageNatural.scaleWidth;
      // let heightScale =
      //   this.imageNatural.height / this.imageNatural.scaleHeight;


      return 1;
    };
    let dataURL = this.baseStage.toDataURL({
      mimeType: 'image/jpeg',
      x: relativePosition.x,
      y: relativePosition.y,
      quality: 0.5,
      pixelRatio: ratio(),
      width: relativePosition.width,
      height: relativePosition.height,
    });

    return dataURL;
  }


}

export { DrawCanvas };