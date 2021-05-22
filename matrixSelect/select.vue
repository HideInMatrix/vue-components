<!--
 * @Author: David
 * @Date: 2021-05-21 17:19:43
 * @LastEditTime: 2021-05-22 13:26:46
 * @LastEditors: David
 * @Description: 下拉框的外层
 * @FilePath: /WebFront 2/src/components/matrixTreeSelect/select.vue
 * 可以输入预定的版权声明、个性签名、空行等
-->
<template>
  <div class="select-wrap" :style="styleVar">
    <!-- 选择框 -->
    <div
      class="div-select"
      :class="{ 'drop-down': isListShow }"
      ref="divSelect"
    >
      <div class="div-select-input" @click="dropDownSelect">
        <!-- 选中后的内容 -->
        <div
          class="selectinfos"
          :title="label"
          :class="{ 'no-select': label == '请选择' }"
        >
          {{ label }}
        </div>
        <!-- 三角形图标 isListShow判断三角形图标是否旋转 -->
        <Icon
          type="ios-arrow-down"
          :class="['imgthree', isListShow ? 'is-reverse' : '']"
        />
      </div>
    </div>
    <!-- 下拉框列表 -->
    <transition name="drop-down">
      <!-- 下拉框列表isListShow来决定是否收起 -->
      <div class="select-list" v-show="isListShow" ref="dropDown">
        <div class="select-triangle" v-show="false"></div>
        <ul class="matrix-option-list">
          <slot name="matrix-option"></slot>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "matrix-select",
  props: {
    placeholder: {
      type: String,
      default: () => {
        return "请选择";
      }
    },
    width: {
      type: Number,
      default: () => {
        return 180;
      }
    },
    height: {
      type: Number,
      default: () => {
        return 40;
      }
    }
  },
  data() {
    return {
      isListShow: false, //下拉框是否收起
      label: "", //标签
      optionid: ""
    };
  },
  computed: {
    styleVar() {
      return {
        "--select-height": this.height + "px",
        "--select-width": this.width + "px"
      };
    }
  },
  mounted() {
    this.clickOutside();
  },
  methods: {
    /**
     * @description: 点击展开下拉框
     * @param {*}
     * @return {*}
     * @Date: 2021-05-22 11:00:42
     * @Author: David
     */
    dropDownSelect() {
      this.isListShow = !this.isListShow;
    },

    /**
     * @description: 点击其他页面收起下拉框
     * @param {*}
     * @return {*}
     * @Date: 2021-05-22 11:03:08
     * @Author: David
     */
    clickOutside() {
      const _this = this;
      document.addEventListener("click", function(e) {
        if (_this.$refs.divSelect) {
          if (
            !!_this.$refs.divSelect.contains(e.target) ||
            !!_this.$refs.dropDown.contains(e.target)
          )
            return;
          else _this.isListShow = false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
/* 三角形图标 */
.imgthree {
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(calc(-50%));
  transition: all ease 0.4s;
}
.is-reverse {
  transform: rotate(180deg) translateY(calc(50%));
  transform-origin: center;
}

/*  重新写一个下拉框组件  */
.div-select {
  /*width:100%;*/
  height: calc(100%);
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  letter-spacing: 0px;
  color: #333333;
  background-color: #fff;
}
.div-select-input {
  width: calc(100%);
  height: calc(100%);
  padding: 0 20px;
  cursor: pointer;
  position: relative;
}
.div-select-input .selectinfos {
  width: calc(100%);
  height: var(--select-height);
  text-align: center;
  line-height: var(--select-height);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  list-style: none;
  float: left;
}

.matrix-option-list {
  border-radius: 5px;
  border: 1px solid #e4e7ed;
  width: 100%;
  padding: 3px 0px;
  box-shadow: 0px 1px 6px #e4e7ed;
  background-color: #fff;
  margin: 0;
}

/* 出现的下拉列表 */
.select-list {
  position: relative;
  width: var(--select-width);
  margin-top: 5px;
  background-color: #ffffff;
  z-index: 800;
  border-radius: 5px;
}

.div-select li {
  width: var(--select-width);
  padding: 0 10px;
  height: 34px;
  line-height: 34px;
  white-space: nowrap;
  /*background-color:#ffffff;*/
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  list-style: none;
  cursor: pointer;
}
.div-select li:hover {
  color: #409eff;
  font-weight: 700;
  background-color: #f5f7fa;
}

.select-wrap {
  border: 1px solid #e6e6e6;
  border-radius: 5px;
  height: var(--select-height);
  width: var(--select-width);
  line-height: var(--select-height);
}

.select-triangle {
  width: 14px;
  height: 7px;
  position: relative;
  left: 15px;
}
.select-triangle::before {
  position: absolute;
  content: "";
  left: 0px;
  width: 0;
  height: 0;
  border-top: 0px solid transparent;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 8px solid #ebeef5;
}
.select-triangle::after {
  position: absolute;
  left: 2px;
  top: 2px;
  content: "";
  width: 0;
  height: 0;
  border-top: 0px solid transparent;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 8px solid #fff;
}

// 下来框动画
.drop-down-enter {
  opacity: 0;
  transform: translate(0px, -80px) scaleY(0.2);
}
.drop-down-leave-to {
  opacity: 0;
  transform: translate(0px, -80px) scaleY(0.2);
}
.drop-down-enter-active {
  transition: all 0.5s ease-in;
}
.drop-down-leave-active {
  transition: all 0.5s ease;
}
</style>
