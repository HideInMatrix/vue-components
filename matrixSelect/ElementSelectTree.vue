<!--
 * @Author: David
 * @Date: 2020-04-28 14:08:55
 * @LastEditTime: 2021-05-28 13:21:19
 * @LastEditors: David
 * @Description: 基于elementUI 的下拉框树封装
 * @FilePath: /WebFront 2/src/components/matrixTreeSelect/treeSelect.vue
 * 可以输入预定的版权声明、个性签名、空行等
-->

<template>
  <el-select :value="valueTitle" :clearable="clearable" @clear="clearHandle">
    <el-option :value="valueTitle" :label="valueTitle" class="options">
      <el-tree
        id="tree-option"
        ref="selectTree"
        :accordion="accordion"
        :data="options"
        :props="props"
        :node-key="props.value"
        :default-expanded-keys="defaultExpandedKey"
        @node-click="handleNodeClick"
      >
      </el-tree>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "el-tree-select",
  props: {
    // 配置项
    props: {
      type: Object,
      default: {
        value: "id", // ID字段名
        label: "name", // 显示名称
        children: "child" // 子级字段名
      }
    },

    // 选项列表数据(树形结构的对象数组)
    options: { type: Array, default: [] },

    // 初始值
    value: { type: Number, default: null },

    // 可清空选项
    clearable: { type: Boolean, default: true },

    // 自动收起
    accordion: { type: Boolean, default: false }
  },
  data() {
    return {
      valueId: null,
      valueTitle: "",
      defaultExpandedKey: []
    };
  },
  mounted() {
    this.valueId = this.value; // 初始值
    this.initHandle();
  },
  methods: {
    init(id) {
      this.valueTitle = "";
    },
    // 初始化值
    initHandle() {
      const _this = this;
      if (_this.valueId) {
        this.$emit(
          "getValue",
          _this.$refs.selectTree.getNode(_this.valueId).data
        );
        _this.valueTitle = _this.$refs.selectTree.getNode(_this.valueId).data[
          _this.props.label
        ]; // 初始化显示
        _this.$refs.selectTree.setCurrentKey(_this.valueId); // 设置默认选中
        _this.defaultExpandedKey = [_this.valueId]; // 设置默认展开
      }
      _this.initScroll();
    },

    // 初始化滚动条
    initScroll() {
      this.$nextTick(() => {
        let scrollWrap = document.querySelectorAll(
          ".el-scrollbar .el-select-dropdown__wrap"
        )[0];
        let scrollBar = document.querySelectorAll(
          ".el-scrollbar .el-scrollbar__bar"
        );
        scrollWrap.style.cssText =
          "margin: 0px; max-height: none; overflow: hidden;";
        scrollBar.forEach(ele => (ele.style.width = 0));
      });
    },

    // 切换选项
    handleNodeClick(node) {
      this.valueTitle = node[this.props.label];
      this.valueId = node[this.props.value];
      // this.$emit("getValue", this.valueId);
      this.$emit("getValue", node);

      this.defaultExpandedKey = [];
    },

    // 清除选中
    clearHandle() {
      this.valueTitle = "";
      this.valueId = null;
      this.defaultExpandedKey = [];
      this.clearSelected();
      this.$emit("getValue", null);
    },

    // 清空选中样式
    clearSelected() {
      let allNode = document.querySelectorAll("#tree-option .el-tree-node");
      allNode.forEach(element => element.classList.remove("is-current"));
    }
  },

  watch: {
    value() {
      this.valueId = this.value;
      this.initHandle();
    }
  }
};
</script>

<style scoped>
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  max-height: 274px;
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
}
.el-select-dropdown__item.selected {
  font-weight: normal;
}
ul li >>> .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
}
.el-tree-node__label {
  font-weight: normal;
}
.el-tree >>> .is-current .el-tree-node__label {
  color: #409eff;
  font-weight: 700;
}
.el-tree >>> .is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}
.el-select >>> .el-input__inner {
  height: 32px;
  line-height: 32px;
}
.el-select >>> .el-input__icon {
  line-height: 32px;
}
</style>
