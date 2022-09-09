import Vue from 'vue';

/**
 * 获取中点坐标
 * @param {object} a 第一个点坐标
 * @param {object} b 第二个点坐标
 * @returns
 */
function getCenter (a, b) {
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2;
  return { x: x, y: y };
}

/**
 * 获取两点间距离
 * @param {object} a 第一个点坐标
 * @param {object} b 第二个点坐标
 * @returns
 */
let getDistance = (a, b) => {
  const x = a.x - b.x;
  const y = a.y - b.y;
  return Math.hypot(x, y); // Math.sqrt(x * x + y * y);
}

/**
 * 获取图片缩放尺寸
 * @param {number} naturalWidth 
 * @param {number} naturalHeight 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @returns 
 */
function getImgSize (naturalWidth, naturalHeight, maxWidth, maxHeight) {
  const imgRatio = naturalWidth / naturalHeight;
  const maxRatio = maxWidth / maxHeight;
  let width, height;
  // 如果图片实际宽高比例 >= 显示宽高比例
  if (imgRatio >= maxRatio) {
    if (naturalWidth > maxWidth) {
      width = maxWidth;
      height = maxWidth / naturalWidth * naturalHeight;
    } else {
      width = naturalWidth;
      height = naturalHeight;
    }
  } else {
    if (naturalHeight > maxHeight) {
      width = maxHeight / naturalHeight * naturalWidth;
      height = maxHeight;
    } else {
      width = naturalWidth;
      height = naturalHeight;
    }
  }
  return { width: width, height: height }
}

Vue.directive("doubleswiper", {
  bind: (el, binding) => {
    // 全局变量
    let isPointerdown = false, // 按下标识
      pointers = [], // 触摸点数组
      point1 = { x: 0, y: 0 }, // 第一个点坐标
      point2 = { x: 0, y: 0 }, // 第二个点坐标
      diff = { x: 0, y: 0 }, // 相对于上一次pointermove移动差值
      lastPointermove = { x: 0, y: 0 }, // 用于计算diff
      lastPoint1 = { x: 0, y: 0 }, // 上一次第一个触摸点坐标
      lastPoint2 = { x: 0, y: 0 }, // 上一次第二个触摸点坐标
      lastCenter; // 上一次中心点坐标

    let result, // 图片缩放宽高
      x, // x轴偏移量
      y, // y轴偏移量
      scale = 1, // 缩放比例
      maxScale,
      minScale = 0.5;
    // 由于图片是异步加载，需要在load方法里获取naturalWidth，naturalHeight
    el.addEventListener('load', function () {
      result = getImgSize(el.naturalWidth, el.naturalHeight, window.innerWidth, window.innerHeight);
      maxScale = Math.max(Math.round(el.naturalWidth / result.width), 3);
      // 图片宽高
      el.style.width = result.width + 'px';
      el.style.height = result.height + 'px';
      // 垂直水平居中显示
      x = (window.innerWidth - result.width) * 0.5;
      y = (window.innerHeight - result.height) * 0.5;
      el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) scale(1)';
    });

    // 图片赋值需放在load回调之后，因为图片缓存后读取很快，有可能不执行load回调
    el.src = el.src;
    // 绑定 pointerdown
    el.addEventListener('pointerdown', function (e) {

      pointers.push(e);
      point1 = { x: pointers[0].clientX, y: pointers[0].clientY };
      if (pointers.length === 1) {
        isPointerdown = true;
        el.setPointerCapture(e.pointerId);
        lastPointermove = { x: pointers[0].clientX, y: pointers[0].clientY };
      } else if (pointers.length === 2) {
        point2 = { x: pointers[1].clientX, y: pointers[1].clientY };
        lastPoint2 = { x: pointers[1].clientX, y: pointers[1].clientY };
        lastCenter = getCenter(point1, point2);
      }
      lastPoint1 = { x: pointers[0].clientX, y: pointers[0].clientY };
    });

    // 绑定 pointermove
    el.addEventListener('pointermove', function (e) {

      if (isPointerdown) {
        handlePointers(e, 'update');
        const current1 = { x: pointers[0].clientX, y: pointers[0].clientY };
        if (pointers.length === 1) {
          // 单指拖动查看图片
          diff.x = current1.x - lastPointermove.x;
          diff.y = current1.y - lastPointermove.y;
          lastPointermove = { x: current1.x, y: current1.y };
          x += diff.x;
          y += diff.y;
          el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + scale + ')';
        } else if (pointers.length === 2) {
          const current2 = { x: pointers[1].clientX, y: pointers[1].clientY };
          // 计算相对于上一次移动距离比例 ratio > 1放大，ratio < 1缩小
          let ratio = getDistance(current1, current2) / getDistance(lastPoint1, lastPoint2);
          // 缩放比例
          const _scale = scale * ratio;
          if (_scale > maxScale) {
            scale = maxScale;
            ratio = maxScale / scale;
          } else if (_scale < minScale) {
            scale = minScale;
            ratio = minScale / scale;
          } else {
            scale = _scale;
          }
          // 计算当前双指中心点坐标
          const center = getCenter(current1, current2);
          // 计算图片中心偏移量，默认transform-origin: 50% 50%
          // 如果transform-origin: 30% 40%，那origin.x = (ratio - 1) * result.width * 0.3
          // origin.y = (ratio - 1) * result.height * 0.4
          // 如果通过修改宽高或使用transform缩放，但将transform-origin设置为左上角时。
          // 可以不用计算origin，因为(ratio - 1) * result.width * 0 = 0
          const origin = {
            x: (ratio - 1) * result.width * 0.5,
            y: (ratio - 1) * result.height * 0.5
          };
          // 计算偏移量，认真思考一下为什么要这样计算(带入特定的值计算一下)
          x -= (ratio - 1) * (center.x - x) - origin.x - (center.x - lastCenter.x);
          y -= (ratio - 1) * (center.y - y) - origin.y - (center.y - lastCenter.y);
          el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + scale + ')';
          lastCenter = { x: center.x, y: center.y };
          lastPoint1 = { x: current1.x, y: current1.y };
          lastPoint2 = { x: current2.x, y: current2.y };
        }
      }
      e.preventDefault();
    });

    // 绑定 pointerup
    el.addEventListener('pointerup', function (e) {
      if (isPointerdown) {
        handlePointers(e, 'delete');
        if (pointers.length === 0) {
          isPointerdown = false;
        } else if (pointers.length === 1) {
          point1 = { x: pointers[0].clientX, y: pointers[0].clientY };
          lastPointermove = { x: pointers[0].clientX, y: pointers[0].clientY };
        }
      }
    });

    // 绑定 pointercancel
    el.addEventListener('pointercancel', function (e) {
      if (isPointerdown) {
        isPointerdown = false;
        pointers.length = 0;
      }
    });

    /**
     * 更新或删除指针
     * @param {PointerEvent} e
     * @param {string} type
     */
    function handlePointers (e, type) {
      for (let i = 0; i < pointers.length; i++) {
        if (pointers[i].pointerId === e.pointerId) {
          if (type === 'update') {
            pointers[i] = e;
          } else if (type === 'delete') {
            pointers.splice(i, 1);
          }
        }
      }
    }
  }
}
)
