<!--
 * @Author: David
 * @Date: 2021-05-22 11:45:09
 * @LastEditTime: 2021-05-22 13:21:36
 * @LastEditors: David
 * @Description: 下拉框中的选项渲染
 * @FilePath: /WebFront 2/src/components/matrixTreeSelect/option.vue
 * 可以输入预定的版权声明、个性签名、空行等
-->
<template>
  <li class="matrix-option" :style="styleVar" @click="currentSelect">
    <div class="matrix-option-dropdown-item">{{ label }}</div>
  </li>
</template>

<script>
export default {
  name: "matrix-option",
  components: {},
  props: {
    width: {
      type: Number,
      default: -1
    },
    height: {
      type: Number,
      default: 34
    },
    label: {
      type: String
    },
    optionid: {
      type: String
    }
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  watch: {},
  computed: {
    styleVar() {
      return {
        "--option-height": this.height + "px",
        "--option-width": this.width == -1 ? "100%" : this.width + "px"
      };
    }
  },
  methods: {
    /**
     * @description: 选中的选项
     * @param {*}
     * @return {*}
     * @Date: 2021-05-22 13:43:20
     * @Author: David
     */
    currentSelect() {
      this.$parent.label = this.label;
      this.$parent.optionid = this.optionid;
      this.$parent.isListShow = !this.$parent.isListShow;
      // this.$emit('slot-content', {label: this.label, optionid: this.optionid} );
    }
  }
};
</script>
<style scoped>
.matrix-option {
  list-style: none;
  height: var(--option-height);
  width: var(--option-width);
}
.matrix-option:hover {
  color: #409eff;
  font-weight: 700;
  background-color: #f5f7fa;
}
.matrix-option-dropdown-item {
  height: 100%;
  width: calc(100% - 30px);
  line-height: var(--option-height);
  cursor: pointer;
  margin: 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
