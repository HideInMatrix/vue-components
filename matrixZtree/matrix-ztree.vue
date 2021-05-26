<!--
 * @Author: David
 * @pageName: 'Ztree  树'
-->

<!--
getSelected 
params 
参数1：要返回的节点
参数2 返回该树的id
参数3 返回（1、添加 2、修改）
-->

<template>
  <div class="zTreeDemoBackground left">
    <ul :id="id" class="ztree"></ul>
  </div>
</template>

<script>
import "../../../static/plugins/ztree/zTreeStyle.css";
import "../../../static/plugins/ztree/jquery.ztree.all.min.js";
export default {
  name: "matrix-ztree",
  props: {
    id: String,
    TreeSetting: {
      type: Object,
      default: () => {
        return {
          data: {
            keep: {
              parent: true,
              leaf: true
            },
            key: {
              children: "children",
              name: "name"
            }
          }
        };
      }
    },
    zNodes: {
      type: Array,
      default: () => {
        return [];
      }
    }, //整个树的节点
    sNodes: Array //已勾选的节点
  },
  watch: {},
  data() {
    return {
      selectedNodes: this.sNodes,
      setting: this.TreeSetting,
      nodes: [],
      beforeRemoveFlag: false,
      selectedNode: {},
      selectedNodeId: -1
    };
  },

  mounted() {},
  created() {},
  updated() {},
  beforeDestory() {
    this.destoryTree();
  },
  watch: {},
  methods: {
    setGroupTree() {
      //赋值树，所有的设置和志传入都在该函数中设置
      let _this = this;
      _this.nodes = _this.deepCopy(_this.zNodes);

      if (_this.setting.check) {
        // console.log(12);
        _this.setting.check.chkboxType = { Y: "ps", N: "ps" };
        _this.setting.callback.onCheck = _this.nodeOnCheck;
      }
      if (_this.setting.edit) {
        _this.setting.edit.enable = false; //关闭移动统一的
      }

      if (_this.setting.view) {
        _this.setting.view.showIcon = _this.showIconForTree;
      }

      //绑定chekc回调函数

      //绑定click回调函数
      _this.setting.callback.onClick = _this.nodeOnClick;
      if (typeof _this.nodes[0] != "undefined") {
        // let nodes = _this.$utils.openFistNode(_this.nodes[0]);
        let nodes = _this.$utils.openFistNode(_this.nodes);
        //设置节点图标
        _this.nodes = _this.circleNodes(_this.nodes[0]);
      }

      $.fn.zTree.init($("#" + _this.id), _this.setting, _this.nodes);
    },

    /**
     * @description: 递归循环一下树节点，为每个节点添加图标
     * @param {*} item
     * @return {*}
     * @Date: 2021-02-06 10:05:35
     * @Author: David
     */

    circleNodes(item) {
      const _this = this;
      if (item[_this.TreeSetting.data.key.children].length == 0) {
        item.isParent = false;
        return item;
      }
      item.isParent = true;
      item.iconOpen = "../static/images/file.png";
      item.iconClose = "../static/images/closeFile.png";
      item[_this.TreeSetting.data.key.children].forEach(obj => {
        _this.circleNodes(obj);
      });
      return item;
    },

    //获取节点路径
    getNodePath(Node) {
      let _this = this;
      // let listNode = Node.getPath();
      let treeObj = $.fn.zTree.getZTreeObj(_this.id);
      let node = treeObj.getNodeByParam("id", Node.id, null);
      let listNode = node.getPath();
      let path = "";
      for (let i = 0; i < listNode.length; i++) {
        path += listNode[i].name + "-";
      }
      path = path.substring(0, path.length - 1);
      return path;
    },

    //获取点击的数据()
    getNodeData(treeNode) {
      let _this = this;
      if (
        _this.setting.check.chkStyle == "radio" &&
        !treeNode.isParent &&
        !treeNode.nocheck
      ) {
        if (!treeNode.checked) {
          _this.selectedNodes.splice(0, 1, treeNode);
        }
      } else {
        if (!treeNode.isParent && !treeNode.nocheck) {
          let index = _this.selectedNodes.findIndex(x => x.id == treeNode.id);
          if (index != -1) {
            if (!treeNode.checked) {
              _this.selectedNodes.splice(index, 1);
            }
          } else {
            if (treeNode.checked) {
              _this.selectedNodes.push(treeNode);
            }
          }
        }
      }
      if (
        treeNode.isParent &&
        treeNode.children.length != 0 &&
        !treeNode.nocheck
      ) {
        for (let i = 0; i < treeNode.children.length; i++) {
          _this.getNodeData(treeNode.children[i]);
        }
      }
    },
    //取消勾选的节点
    cancelSelected(treeNode) {
      let _this = this;
      if (!treeNode.isParent) {
        treeNode.checked = false;
      }
      if (
        treeNode.isParent &&
        treeNode.children.length != 0 &&
        !treeNode.nocheck
      ) {
        for (let i = 0; i < treeNode.children.length; i++) {
          _this.getNodeData(treeNode.children[i]);
        }
      }
    },
    //初始化勾选节点
    selectedTheFirstNode(node) {
      let _this = this;
      $.fn.zTree.init($(this.id), _this.setting, _this.nodes);
      let zTree = $.fn.zTree.getZTreeObj(this.id);

      let temnode = zTree.getNodeByParam("id", node.id);
      zTree.selectNode(temnode); //根据该节点选中
    },
    destoryTree() {
      $.fn.zTree.destroy(this.id);
    },
    //勾选全部节点
    checkAllNodes(value) {
      //此处勾选全选和取消全选（设计好搞事情）
      let _this = this;
      let zTree = $.fn.zTree.getZTreeObj(_this.id);
      zTree.checkAllNodes(value);
      let temp = zTree.getCheckedNodes(value);
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].children.length == 0) {
          _this.getNodeData(temp[i]);
        } else {
          continue;
        }
      }
      _this.$emit("getSelected", _this.selectedNodes, _this.id);
    },
    //修改节点信息(将修改的节点数据同步到被修改的数据上)
    editNode(treeNode) {
      let _this = this;
      let zTree = $.fn.zTree.getZTreeObj(_this.id);
      let editNode = zTree.getNodeByParam("id", treeNode.id);
      for (let i in treeNode) {
        if (i == "children") {
          continue;
        }
        editNode[i] = treeNode[i];
      }
      _this.$nextTick(() => {
        zTree.selectNode(editNode);
        _this.$emit("getSelected", editNode, _this.id, 2);
        zTree.updateNode(editNode);
      });
    },

    //删除节点(此处有问题)
    remove(treeNode) {
      let _this = this;
      let zTree = $.fn.zTree.getZTreeObj(_this.id);
      if (treeNode.isParent) {
        zTree.removeChildNodes(treeNode);
        // zTree.removeNode(treeNode, true);
      } else {
        zTree.removeNode(treeNode, true); //树视图上删除
      }

      let parentNode = treeNode.getParentNode();
      if (parentNode[this.TreeSetting.data.key.children].length == 0) {
        parentNode.isParent = false;
        zTree.updateNode(parentNode);
        zTree.selectNode(parentNode);
        _this.$emit("getSelected", parentNode, _this.id);
      }
    },
    //获取该节点的父节点
    getParentNode(treeNode) {
      return treeNode.getParentNode();
    },

    /**
     * @description: 添加节点（暂时不需要）
     * @param {*} sNode 主节点
     * @param {*} addNode 添加的节点
     * @return {*}
     * @Date: 2021-05-24 16:07:51
     * @Author: David
     */
    add(sNode, addNode) {
      let _this = this;
      let zTree = $.fn.zTree.getZTreeObj(_this.id);

      if (this.TreeSetting.view) {
        sNode.iconOpen = "../static/images/file.png";
        sNode.iconClose = "../static/images/closeFile.png";
      }

      sNode.isParent = true; //手动改变一下是否为父节点的属性

      let newNode = zTree.addNodes(sNode, -1, addNode, true);

      zTree.selectNode(sNode);
      _this.$emit("getSelected", sNode, _this.id, 1);
      zTree.updateNode(sNode);
    },

    deepCopy(obj) {
      let _this = this;
      let result = Array.isArray(obj) ? [] : {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === "object" && obj[key] !== null) {
            result[key] = _this.deepCopy(obj[key]); //递归复制
          } else {
            result[key] = obj[key];
          }
        }
      }
      return result;
    },

    /**
     * @description: zTree官网demo 按规则设置是否显示图标
     * @param {*} treeId
     * @param {*} treeNode
     * @return {*}
     * @Date: 2021-02-18 14:43:39
     * @Author: David
     */

    showIconForTree(treeId, treeNode) {
      return treeNode.isParent;
    },

    /**
     * @description: 节点check操作函数
     * @param {*} event
     * @param {*} treeId
     * @param {*} treeNode
     * @param {*} clickFlag
     * @return {*}
     * @Date: 2021-05-11 10:15:52
     * @Author: David
     */

    nodeOnCheck(event, treeId, treeNode, clickFlag) {
      const _this = this;
      let zTree = $.fn.zTree.getZTreeObj(treeId);
      _this.selectedNode = treeNode;
      _this.selectedNodeId = treeId;
      if (_this.setting.check && _this.setting.check.enable) {
        // _this.selectedNodes = zTree.getCheckedNodes(true);
        _this.getNodeData(treeNode);

        _this.$emit("getSelected", _this.selectedNodes, treeId);
        // _this.$emit("getSelected", zTree.getCheckedNodes(true), treeId);
        if (zTree.getCheckedNodes(false).length == 0) {
          _this.$emit("isAll", true);
        } else if (zTree.getCheckedNodes(true).length == 0) {
          _this.$emit("isAll", false);
        }
      } else {
        _this.$emit("getSelected", treeNode, treeId);
      }
    },
    nodeOnClick(e, treeId, treeNode) {
      const _this = this;
      let zTree = $.fn.zTree.getZTreeObj(treeId);
      zTree.checkNode(treeNode, !treeNode.checked, true);
      // zTree.expandNode(treeNode);
      _this.selectedNode = treeNode;
      _this.selectedNodeId = treeId;
      if (_this.setting.check && _this.setting.check.enable) {
        _this.getNodeData(treeNode);

        _this.$emit("getSelected", _this.selectedNodes, treeId);
        // _this.$emit("getSelected", zTree.getCheckedNodes(true), treeId);
        if (zTree.getCheckedNodes(false).length == 0) {
          _this.$emit("isAll", true);
        } else if (zTree.getCheckedNodes(true).length == 0) {
          _this.$emit("isAll", false);
        }
      } else {
        _this.$emit("getSelected", treeNode, treeId);
      }
    },
    /**
     * @description: 张开树的所有节点
     * @param {*}
     * @return {*}
     * @Date: 2021-05-13 15:01:26
     * @Author: David
     */

    expandAll() {
      let zTree = $.fn.zTree.getZTreeObj(this.id);
      zTree.expandAll(true);
    }
  }
};
</script>

<style lang="scss" scoped>
* /deep/ .node_name {
  font-size: 10pt;
}
</style>
