<template>
  <div class="drawer-wrapper">
    <div class="container-wrapper">
      <div id="container" ref="canvasRef"></div>
    </div>
    <div class="controller">
      <div class="canvas-color">
        <h5>画笔颜色</h5>
        <ul class="color-ul">
          <li
            v-for="(item, index) in colors"
            :class="{
              active: config.lineColor === item,
              'color-li': 'color-li',
            }"
            :style="{ background: item }"
            :key="index"
            @click="setColor(item)"
          ></li>
        </ul>
      </div>
      <!--画笔-->
      <div class="canvas-brush">
        <h5>画笔大小</h5>
        <span
          v-for="(pen, index) in brushes"
          :class="[
            pen.className,
            { active: canPaint && config.lineWidth === pen.lineWidth },
          ]"
          :key="index"
          @click="setBrush(pen.lineWidth)"
        >
        </span>
      </div>
      <!--操作-->
      <div class="canvas-control">
        <h5>操作</h5>
        <span
          v-for="(control, index) in controls"
          :title="control.title"
          :class="control.className"
          :key="index"
          @click="controlCanvas(control.action)"
        ></span>
      </div>
      <!-- 文本 -->
      <div class="canvas-control">
        <h5>文本</h5>
        <span ref="textFont" id="textFont" @click="setText()">A</span>
      </div>
      <!-- 文本 -->
      <div class="canvas-control">
        <h5>旋转</h5>
        <span class="fa fa-rotate-left" @click="rotate('left')"></span>
        <span class="fa fa-rotate-right" @click="rotate('right')"></span>
      </div>
      <div class="canvas-control">
        <h5>批改</h5>
        <span
          :class="[
            lastOptions.tickable ? 'active-right' : '',
            'fa',
            'fa-check',
          ]"
          @click="drawShap('tickable')"
        ></span>
        <span
          style="font-weight: bolder"
          :class="[lastOptions.inclinedable ? 'active-right' : '']"
          @click="drawShap('inclinedable')"
          >\</span
        >
        <span
          style=""
          :class="[
            lastOptions.crossable ? 'active-right' : '',
            'fa',
            'fa-close',
          ]"
          @click="drawShap('crossable')"
        ></span>
      </div>
      <div class="canvas-control">
        <el-alert
          title="当前画布是否可以拖动"
          :description="
            group
              ? group.draggable()
                ? '可以拖动'
                : '不可以拖动'
              : '不可以拖动'
          "
          :closable="false"
        >
        </el-alert>
        <!-- <span style="width:unset">{{
          group ? (group.draggable() ? "可以移动" : "不可以移动") : "不可以移动"
        }}</span> -->
        <!-- <span class="fa fa-download" @click="exportImage()"></span> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElAlert } from 'element-plus'
import { reactive, ref, onMounted, defineProps, watch, computed } from 'vue'
import Konva from 'konva'

let props = defineProps({
  renderImgUrl: {
    type: String,
    default: () => '',
  },
})
watch(
  () => props.renderImgUrl,
  (newValue: string, oldValue: string) => {
    baseStage.value?.destroy()
    appHistory.value = [] //画布历史
    appHistoryStep.value = 0
    initCanvas()
  }
)
let controls = computed(() => {
  return [
    {
      title: '上一步',
      action: 'prev',
      className:
        appHistory.value.length > 1 ? 'active fa fa-reply' : 'fa fa-reply',
    },
    // {
    //   title: "下一步",
    //   action: "next",
    //   className: this.nextDrawAry.length
    //     ? "active fa fa-share"
    //     : "fa fa-share"
    // },
    {
      title: '清除',
      action: 'clear',
      className:
        appHistory.value.length > 1 ? 'active fa fa-trash' : 'fa fa-trash',
    },
    {
      title: '缩小',
      action: 'minus',
      className: 'fa fa-search-minus',
    },
    {
      title: '放大',
      action: 'plus',
      className: 'fa fa-search-plus',
    },
  ]
})

let baseStage = ref<Konva.Stage>()
let baseLayer = ref<Konva.Layer>()
let group = ref<Konva.Group>() //容器
let lastLine = ref<Konva.Line>() //最近时间的一条线
let isPaint = ref(false) //是否在绘画
let canvasRef: any = ref() // 挂载容器的dom元素
let canPaint = ref(true) //是否允许绘画

let initCanvas = () => {
  nextTick(() => {
    // 初始化画布
    canvasWidth.value = canvasRef.value.clientWidth
    canvasHeight.value = canvasRef.value.clientHeight

    baseStage.value = new Konva.Stage({
      container: 'container',
      width: canvasWidth.value,
      height: canvasHeight.value,
    })
    baseLayer.value = new Konva.Layer()
    group.value = new Konva.Group({
      x: canvasWidth.value / 2,
      y: canvasHeight.value / 2,
    })

    baseLayer.value.add(group.value)
    baseStage.value.add(baseLayer.value)

    if (props.renderImgUrl !== '') {
      drawImage({ url: props.renderImgUrl })()
    }
    drawLiner()
    thumbImage()
  })
}

let thumbImage = () => {
  baseStage.value?.on('wheel', (e: any) => {
    // console.log('滚动', e.evt.deltaY)

    let x = group.value?.getAttr('x')
    let y = group.value?.getAttr('y')

    let s1 = groupScale.value
    let s2 = 0

    let plusFun = () => {
      let x2 = e.evt.layerX - ((e.evt.layerX - x) * s2) / s1
      let y2 = e.evt.layerY - ((e.evt.layerY - y) * s2) / s1

      canPaint.value = false
      lastOptions[lastSymbol.value] = false
      group.value?.draggable(!canPaint.value)
      group.value?.setAttr('x', x2)
      group.value?.setAttr('y', y2)

      addHistory(group.value?.clone())
      group.value?.scale({
        x: +(groupScale.value / 10).toFixed(2),
        y: +(groupScale.value / 10).toFixed(2),
      })
    }

    console.log(groupScale.value)
    if (e.evt.deltaY > 0) {
      // 向下滚动 缩小
      if (groupScale.value > 10 && groupScale.value <= 20) {
        groupScale.value -= 1
        s2 = groupScale.value
        plusFun()
      }
    } else if (e.evt.deltaY < 0) {
      if (groupScale.value >= 2 && groupScale.value < 20) {
        // 向上滚动 放大
        groupScale.value += 1
        s2 = groupScale.value
        plusFun()
      }
    }
  })
}

let drawLiner = (mode: string = 'brush') => {
  // 画线
  baseStage.value?.on('mousedown touchstart', (e) => {
    if (canPaint.value) {
      isPaint.value = true // 绘画图片
      let pos = getRelativePointerPosition()
      lastLine.value = new Konva.Line({
        stroke: config.value.lineColor,
        strokeWidth: config.value.lineWidth,
        globalCompositeOperation:
          mode === 'brush' ? 'source-over' : 'destination-out',
        points: [pos.x, pos.y],
      })
      addHistory(group.value?.clone())
      group.value?.add(lastLine.value)
    }
  })
  baseStage.value?.on('mouseup touchend', () => {
    isPaint.value = false
    baseLayer.value?.batchDraw()
  })

  baseStage.value?.on('mousemove touchmove', () => {
    if (!isPaint.value || !canPaint.value) {
      return
    }
    const pos = getRelativePointerPosition()
    let newPoints = lastLine.value?.points().concat([pos.x, pos.y])
    lastLine.value?.points(newPoints as any)
  })
}

interface drawImageParams {
  x?: number
  y?: number
  url: string
  width?: number
  height?: number
}
let imageNatural = ref({ width: 0, height: 0, scaleWidth: 0, scaleHeight: 0 })
let drawImage: Function = (params: drawImageParams) => {
  // 绘画图片
  return () => {
    let image: Konva.Image
    let { x, y, url, width, height } = params
    let imageObj = new Image()
    // imageObj.setAttribute("crossOrigin", "anonymous");
    imageObj.src = url
    let scaleImage = (
      imWidth: number,
      imHeight: number,
      caWidth: number,
      caHeight: number
    ) => {
      // console.log(imWidth, imHeight, caWidth, caHeight);
      //图片 宽高，画布宽高
      if (imWidth > caWidth && imHeight > caHeight) {
        return {
          width: (imWidth * caHeight) / imHeight,
          height: caHeight,
        }
      } else if (imWidth > caWidth && imHeight < caHeight) {
        return {
          width: caWidth,
          height: (imHeight * caWidth) / imWidth,
        }
      } else if (imWidth < caWidth && imHeight > caHeight) {
        return {
          width: (imWidth * caHeight) / imHeight,
          height: caHeight,
        }
      } else {
        return {
          width: imWidth,
          height: imHeight,
        }
      }
    }
    imageObj.onload = () => {
      let scaleimage = scaleImage(
        imageObj.naturalWidth,
        imageObj.naturalHeight,
        canvasWidth.value,
        canvasHeight.value
      )
      imageNatural.value = {
        width: imageObj.naturalWidth,
        height: imageObj.naturalHeight,
        scaleWidth: scaleimage.width,
        scaleHeight: scaleimage.height,
      }
      background.value = scaleimage

      image = new Konva.Image({
        x: -scaleimage.width / 2,
        y: -scaleimage.height / 2,
        image: imageObj,
        width: scaleimage.width,
        height: scaleimage.height,
        rotation: 0,
      })

      group.value?.add(image)
      baseLayer.value?.batchDraw()
      addHistory(group.value?.clone())
    }
  }
}

let appHistory = ref<Konva.Group[]>([]) //画布历史
let appHistoryStep = ref(0)
let addHistory = (group: Konva.Group | undefined) => {
  appHistoryStep.value++
  group ? appHistory.value.push(group) : false
}

let getRelativePointerPosition = () => {
  const pos = baseStage.value?.getPointerPosition() as Konva.Vector2d
  const absTransform = group.value?.getAbsoluteTransform()

  const invertedTransform = new Konva.Transform(
    absTransform?.getMatrix()
  ).invert()

  const shapePos = invertedTransform.point(pos)
  return shapePos
}

onMounted(() => {
  initCanvas()
})

let needTextArea = ref(false) //是否需要生成一个字体框

let groupScale = ref(10)
let colors = ref([
  '#fef4ac',
  '#0018ba',
  '#ffc200',
  '#f32f15',
  '#cccccc',
  '#5ab639',
  '#ffffff',
])

let setColor = (color: string) => {
  config.value.lineColor = color
}

let brushes = ref([
  {
    className: 'small fa fa-paint-brush',
    lineWidth: 3,
  },
  {
    className: 'middle fa fa-paint-brush',
    lineWidth: 6,
  },
  {
    className: 'big fa fa-paint-brush',
    lineWidth: 12,
  },
])

let setBrush = (type: number) => {
  canPaint.value = !canPaint.value
  lastOptions[lastSymbol.value] = false
  group.value?.draggable(!canPaint.value)
  config.value.lineWidth = type
}

let config = ref({
  lineWidth: 3,
  lineColor: '#f32f15',
  shadowBlur: 2,
})
let lastOptions = reactive<{ [p: string]: boolean }>({
  tickable: false,
  inclinedable: false,
  crossable: false,
})
// let tickable = ref(false)
// let inclinedable = ref(false)
// let crossable = ref(false)
let lastSymbol = ref('tickable')

let background = ref({ width: 0, height: 0 })
let canvasWidth = ref(0)
let canvasHeight = ref(0)
let textFont: any = ref()

let setText = () => {
  canPaint.value = false
  needTextArea.value = true
  lastOptions[lastSymbol.value] = false
  // 设置文字颜色
  textFont.value?.classList.add('active')
  addHistory(group.value?.clone())
  baseStage.value?.on('mousedown touchend', (evt) => {
    if (needTextArea.value) {
      let pos = getRelativePointerPosition()
      let groupRotation = group.value?.rotation() || 0

      let textNode = new Konva.Text({
        x: pos.x,
        y: pos.y,
        fontSize: 20,
        text: '双击编辑',
        draggable: true,
        borderStroke: '#000', // 虚线颜色
        borderStrokeWidth: 10, //虚线大小
        borderDash: [0], // 虚线间距
        rotation: -groupRotation,
        fill: config.value.lineColor,
      })

      group.value?.add(textNode)
      baseLayer.value?.draw()

      textNode.on('dblclick dbltap', (e) => {
        textNode.hide()
        buildTextArea(textNode)
      })

      textNode.on('dragstart', (e) => {
        addHistory(group.value?.clone())
      })
    }
    needTextArea.value = false
  })

  let buildTextArea = (textNode: Konva.Text) => {
    let textarea = document.createElement('textarea')
    const canvasContainer = document.getElementById('container')
    canvasContainer?.appendChild(textarea)

    textarea.value = textNode.text() === '双击编辑' ? '' : textNode.text()
    textarea.style.position = 'absolute'
    textarea.style.top = textNode.absolutePosition().y + 'px' //group的增加是修正偏移的位置
    textarea.style.left = textNode.absolutePosition().x + 'px'
    textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px'
    textarea.style.height =
      textNode.height() - textNode.padding() * 2 + 5 + 'px'
    textarea.style.fontSize =
      (
        (textNode.fontSize() *
          (group.value?.scaleX() ? group.value?.scaleX() : 0) *
          10) /
        10
      ).toFixed() + 'px'
    textarea.style.border = 'none'
    textarea.style.padding = '0px'
    textarea.style.margin = '0px'
    textarea.style.overflow = 'hidden'
    textarea.style.background = 'none'
    textarea.style.outline = 'none'
    textarea.style.resize = 'none'
    textarea.style.lineHeight = String(textNode.lineHeight())
    textarea.style.fontFamily = textNode.fontFamily()
    textarea.style.transformOrigin = 'left top'
    textarea.style.textAlign = textNode.align()
    textarea.style.color = config.value.lineColor
    textarea.style.border = '1px solid #f32f15'

    let rotation = 0

    var transform = ''
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)'
    }

    var px = 0

    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
    if (isFirefox) {
      px += 2 + Math.round(textNode.fontSize() / 20)
    }
    transform += 'translateY(-' + px + 'px)'

    textarea.style.transform = transform

    textarea.style.height = 'auto'

    textarea.style.height = textarea.scrollHeight + 3 + 'px'

    textarea.focus()

    let removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea)
      window.removeEventListener('click', handleOutsideClick)
      document.getElementById('textFont')?.classList.remove('active')
      textNode.show()
      // tr.show();
      // tr.forceUpdate();
      baseLayer.value?.draw()
      // this.addHistory(this.group.clone());
    }

    function setTextareaWidth(newWidth: number) {
      if (!newWidth) {
        newWidth = (textNode as any).placeholder
          ? (textNode as any).placeholder.length * textNode.fontSize()
          : 0
      }

      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
      if (isSafari || isFirefox) {
        newWidth = Math.ceil(newWidth)
      }

      var isEdge =
        (document as any).documentMode || /Edge/.test(navigator.userAgent)
      if (isEdge) {
        newWidth += 1
      }
      textarea.style.width = newWidth + 'px'
    }
    textarea.addEventListener('keydown', function (e) {
      // if (e.keyCode === 13 && !e.shiftKey) {
      //   textNode.text(textarea.value);
      //   removeTextarea();
      // }

      if (e.keyCode === 27) {
        removeTextarea()
      }
    })

    textarea.addEventListener('keydown', function (e) {
      let scale = textNode.getAbsoluteScale().x
      setTextareaWidth(textNode.width() * scale)
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + textNode.fontSize() + 'px'
    })

    function handleOutsideClick(e: Event) {
      if (e.target !== textarea) {
        textNode.text(textarea.value)
        removeTextarea()
      }
    }
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick)
    })
  }
}

let groupDegree = ref(0)
let rotate = (action: string) => {
  canPaint.value = false
  needTextArea.value = false
  addHistory(group.value?.clone())
  group.value?.draggable(true)
  document.getElementById('textFont')?.classList.remove('active')
  switch (action) {
    case 'left':
      groupDegree.value -= 90
      groupDegree.value = groupDegree.value % 360 == 0 ? 0 : groupDegree.value
      group.value?.setAttr('rotation', groupDegree.value)
      // this.rotateGroup(this.groupDegree);

      break
    case 'right':
      groupDegree.value += 90
      groupDegree.value = groupDegree.value % 360 == 0 ? 0 : groupDegree.value
      group.value?.setAttr('rotation', groupDegree.value)
      break
  }
}

let drawShap = (type: string) => {
  canPaint.value = false
  if (lastOptions[type] && lastSymbol.value === type) {
    lastOptions[type] = false
    group.value?.draggable(true)
  } else {
    lastOptions[lastSymbol.value] = false
    lastOptions[type] = true
    lastSymbol.value = type
    group.value?.draggable(false)
  }
  baseStage.value?.on('mousedown touchstart', (e) => {
    let pos = getRelativePointerPosition()
    //暂时固定写法
    if (type == 'tickable' && lastOptions.tickable) {
      addHistory(group.value?.clone())
      // [pos.x, pos.y, pos.x + 20, pos.y + 15, pos.x + 35, pos.y - 15];
      let tick = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: config.value.lineColor,
        strokeWidth: config.value.lineWidth,
        lineJoin: 'round',
      })
      if (group.value?.rotation() == 0) {
        tick.points(
          tick.points().concat([pos.x + 20, pos.y + 15, pos.x + 35, pos.y - 15])
        )
      } else if (group.value?.rotation() == 90) {
        tick.points(
          tick.points().concat([pos.x + 15, pos.y - 20, pos.x - 15, pos.y - 35])
        )
      } else if (group.value?.rotation() == 180) {
        tick.points(
          tick.points().concat([pos.x - 15, pos.y - 20, pos.x - 35, pos.y + 15])
        )
      } else {
        tick.points(
          tick.points().concat([pos.x - 20, pos.y + 15, pos.x + 15, pos.y + 35])
        )
      }
      group.value?.add(tick)
      baseLayer.value?.draw()
    }
    if (type == 'inclinedable' && lastOptions.inclinedable) {
      addHistory(group.value?.clone())
      //  [pos.x, pos.y, pos.x + 30, pos.y + 45]
      let inclined = new Konva.Line({
        points: [pos.x, pos.y],
        stroke: config.value.lineColor,
        strokeWidth: config.value.lineWidth,
        lineJoin: 'round',
      })
      if (group.value?.rotation() == 0) {
        inclined.points(inclined.points().concat([pos.x + 30, pos.y + 45]))
      } else if (group.value?.rotation() == 90) {
        inclined.points(inclined.points().concat([pos.x + 45, pos.y - 30]))
      } else if (group.value?.rotation() == 180) {
        inclined.points(inclined.points().concat([pos.x - 30, pos.y - 45]))
      } else {
        inclined.points(inclined.points().concat([pos.x - 45, pos.y + 30]))
      }

      group.value?.add(inclined)
      baseLayer.value?.draw()
    }
    if (type == 'crossable' && lastOptions.crossable) {
      addHistory(group.value?.clone())
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
        stroke: config.value.lineColor,
        strokeWidth: config.value.lineWidth,
        lineJoin: 'round',
      })
      group.value?.add(cross)
      baseLayer.value?.draw()
    }
  })
}

let controlCanvas = (action: string) => {
  switch (action) {
    case 'prev':
      if (appHistoryStep.value >= 1) {
        appHistoryStep.value--
        let scale = group.value?.getAbsoluteScale() || { x: 0, y: 0 }
        groupScale.value = Number((scale.x * 10).toFixed(2))
        let preGroup = (group.value = appHistory.value?.pop() as Konva.Group)
        baseLayer.value?.destroyChildren()
        baseLayer.value?.add(preGroup as any)
        baseLayer.value?.draw()
      }
      break
    case 'clear': {
      if (appHistory.value.length > 1) {
        for (let i = appHistory.value.length; i >= 1; i--) {
          appHistoryStep.value--
          let scale = group.value?.getAbsoluteScale() || { x: 0, y: 0 }
          groupScale.value = Number((scale.x * 10).toFixed(2))
          let preGroup = (group.value = appHistory.value?.pop() as Konva.Group)
          baseLayer.value?.destroyChildren()
          baseLayer.value?.add(preGroup as any)
          baseLayer.value?.draw()
        }
        // groupScale.value = 10
        // appHistory.value.splice(1, appHistory.value.length - 1)
        // appHistoryStep.value = 1
        // let preGroup = (group.value = appHistory.value[0] as Konva.Group)
        // baseLayer.value?.destroyChildren()
        // baseLayer.value?.add(preGroup)
        // baseLayer.value?.draw()
      }

      break
    }
    case 'minus': {
      if (groupScale.value > 10 && groupScale.value <= 20) {
        group.value?.draggable(!canPaint.value)
        group.value?.setAttr('x', canvasWidth.value / 2)
        group.value?.setAttr('y', canvasHeight.value / 2)
        groupScale.value -= 1
        addHistory(group.value?.clone())
        group.value?.scale({
          x: +(groupScale.value / 10).toFixed(2),
          y: +(groupScale.value / 10).toFixed(2),
        })
      }
      break
    }
    case 'plus': {
      if (groupScale.value >= 2 && groupScale.value < 20) {
        group.value?.draggable(!canPaint.value)
        group.value?.setAttr('x', canvasWidth.value / 2)
        group.value?.setAttr('y', canvasHeight.value / 2)
        groupScale.value += 1
        addHistory(group.value?.clone())
        group.value?.scale({
          x: +(groupScale.value / 10).toFixed(2),
          y: +(groupScale.value / 10).toFixed(2),
        })
      }
    }
  }
}

let exportImage = () => {
  // let canvasWidth = this.$refs.canvasRef.clientWidth;
  // let canvasHeight = this.$refs.canvasRef.clientHeight;
  group.value.setAttr('x', canvasWidth.value / 2)
  group.value.setAttr('y', canvasHeight.value / 2)
  groupScale.value = 10
  group.value.scale({
    x: +(groupScale.value / 10).toFixed(2),
    y: +(groupScale.value / 10).toFixed(2),
  })
  let tr = new Konva.Transformer({
    nodes: [group.value],
    x: +(group.value.width() / 2).toFixed(2),
    y: +(group.value.height() / 2).toFixed(2),
    borderStroke: '#f2849e', // 虚线颜色
    borderStrokeWidth: 0, //虚线大小
    borderDash: [5], // 虚线间距
    resizeEnabled: false,
    rotateEnabled: false,
  })

  baseLayer.value.add(tr)
  group.value.draggable(true)
  tr.forceUpdate()
  baseLayer.value.draw()
  let transList = baseStage.value.find('Transformer')

  let relativePosition = { x: 0, y: 0, width: 0, height: 0 }
  if (group.value.rotation() == 0) {
    relativePosition.x = tr.x()
    relativePosition.y = tr.y()
    relativePosition.width = tr.width()
    relativePosition.height = tr.height()
  } else if (group.value.rotation() == 90) {
    relativePosition.x = tr.x() - tr.height()
    relativePosition.y = tr.y()
    relativePosition.width = tr.height()
    relativePosition.height = tr.width()
  } else if (group.value.rotation() == 180) {
    relativePosition.x = tr.x() - tr.width()
    relativePosition.y = tr.y() - tr.height()
    relativePosition.width = tr.width()
    relativePosition.height = tr.height()
  } else if (group.value.rotation() == 270) {
    relativePosition.x = tr.x()
    relativePosition.y = tr.y() - tr.width()
    relativePosition.width = tr.height()
    relativePosition.height = tr.width()
  }
  transList.forEach((element) => {
    element.destroy()
  })
  let ratio = () => {
    let widthScale = imageNatural.value.width / imageNatural.value.scaleWidth
    let heightScale = imageNatural.value.height / imageNatural.value.scaleHeight
    return Math.max(widthScale, heightScale, 1)
  }

  let dataURL = baseStage.value.toDataURL({
    x: relativePosition.x,
    y: relativePosition.y,
    pixelRatio: ratio(),
    width: relativePosition.width,
    height: relativePosition.height,
  })

  return dataURL
  // let downloadURI = (uri, name) => {
  //   let link = document.createElement('a')
  //   link.download = name
  //   console.log(uri)
  //   link.href = uri
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  // }
  // downloadURI(dataURL, 'stage.png')
}
defineExpose({ exportImage })
</script>

<style lang="scss" scoped>
.drawer-wrapper {
  display: flex;
  // height: 100%;
  .container-wrapper {
    height: 100%;
    flex: 1 1 auto;
    background-color: #fff;
    #container {
      width: 100%;
      height: 100%;
      overflow: auto;

      cursor: crosshair;
      position: relative;
    }
  }
  .controller {
    width: 202px;
    height: 100%;
    margin-left: 12px;
    background-color: #fff;
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
