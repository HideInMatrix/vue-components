<!--
 * @Author: David
 * @Date: 2021-03-18 17:46:22
 * @LastEditTime: 2022-05-23 16:36:23
 * @LastEditors: David
 * @Description: 
 * @FilePath: /Pad3.0/src/components/wangEditor/index.vue
 * 可以输入预定的版权声明、个性签名、空行等
-->
<template>
  <div class="editor-wrap">
    <div :id="`editor${tid}`"></div>
  </div>
</template>

<script>
import WangEditor from "wangeditor";

import createKityformula from "./kityformula";
import myscriptMath from "./myscript-math-web";
export default {
  props: {
    //id作为区分
    tid: {
      type: [Number, String],
      default: () => {
        return 0;
      }
    },

    //上传文件的URL
    uploadImgUrl: {
      type: String,
      default: () => {
        return "";
      }
    },
    //上传视频接口地址
    uploadVideoUrl: {
      type: String,
      default: () => {
        return "";
      }
    },

    //上传文件接口的参数名
    uploadFileName: {
      type: String,
      default: () => {
        return "files";
      }
    }
  },
  data() {
    return {
      editor: null //wangEditor对象
    };
  },

  mounted() {
    const _this = this;
    this.initReadMarkdown();
  },
  methods: {
    /**
     * @description: 初始化markdown富文本框 设置参数，生成对象
     * @param {*}
     * @return {*}
     * @Date: 2021-03-18 16:45:40
     * @Author: David
     */

    initReadMarkdown() {
      const _this = this;
      let editor = new WangEditor(`#editor${this.tid}`);

      //获取wangEditor中的变量，下文用上
      const { PanelMenu, Panel } = WangEditor;

      class kityformula extends PanelMenu {
        //公式输入插件
        constructor(editors) {
          const $elem = WangEditor.$(
            `<div class="w-e-menu wang-formula">
                <svg t="1644305340930" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2195" width="16" height="16"><path d="M902.636511 462.62493c6.825229-6.825229 13.650458-11.94415 18.769379-11.944151h90.434282c6.825229 0 11.94415-6.825229 11.944151-11.94415v-102.378432c0-6.825229-6.825229-11.94415-11.944151-11.944151h-102.378432c-6.825229 0-18.769379 6.825229-18.769379 11.944151l-109.203661 114.322582c-6.825229 6.825229-13.650458 6.825229-13.650458 0l-58.014445-114.322582c-6.825229-6.825229-13.650458-11.94415-18.769379-11.944151h-167.218106c-6.825229 0-11.94415 6.825229-11.944151 11.944151v102.378432c0 6.825229 6.825229 11.94415 11.944151 11.94415h102.378432c6.825229 0 13.650458 6.825229 18.769379 11.944151l39.245066 83.609053v18.769379L568.200299 699.801631c-6.825229 0-11.94415 6.825229-18.769379 6.825229H460.702945c-6.825229 0-13.650458 6.825229-13.650457 11.94415v102.378433c0 6.825229 6.825229 11.94415 13.650457 11.94415h102.378433c6.825229 0 18.769379-6.825229 18.769379-11.94415l146.742419-165.511799c6.825229-6.825229 11.94415-6.825229 11.944151 0l83.609053 165.511799c0 6.825229 13.650458 11.94415 18.769379 11.94415h102.378432c6.825229 0 13.650458-6.825229 13.650458-11.94415v-102.378433c0-6.825229-6.825229-11.94415-13.650458-11.94415h-37.538758c-6.825229 0-11.94415-6.825229-18.769379-11.94415l-64.839674-127.973041v-18.769379l78.490131-85.31536zM377.093892 65.055351c-32.419837 25.594608-64.839674 63.133367-83.609053 127.97304l-32.419837 127.973041H75.077517c-6.825229 0-13.650458 6.825229-13.650458 11.94415v102.378432c0 6.825229 6.825229 11.94415 13.650458 11.944151h153.567648L133.091962 831.187286c-18.769379 76.783824-69.958595 63.133367-69.958595 63.133366H0v127.973041h64.839674c51.189216 0 102.378432-6.825229 127.97304-37.538759 32.419837-32.419837 51.189216-88.727975 64.839674-153.567648l95.553203-383.919121h146.74242c6.825229 0 11.94415-6.825229 11.94415-11.944151v-102.378432c0-6.825229-6.825229-11.94415-11.94415-11.94415h-114.322583l32.419837-121.147812c6.825229-18.769379 37.538759-51.189216 58.014445-63.133366 69.958595-51.189216 167.218106-18.769379 230.351473-6.825229V20.691364C639.865202 8.747213 498.241704-37.323081 377.093892 65.055351z" p-id="2196"></path></svg>
              </div>`
          );
          super($elem, editors);
        }
        // 菜单点击事件
        clickHandler() {
          // 做任何你想做的事情
          // 可参考【常用 API】文档，来操作编辑器
          const conf = createKityformula(editor);
          const panel = new Panel(this, conf);
          panel.create();
        }

        tryChangeActive() {}
      }

      // class Myscript extends PanelMenu {
      //   // 公式手写插件
      //   constructor(editors) {
      //     const $elem = WangEditor.$(
      //       `<div class="w-e-menu">
      //             <i class="iconfont iconshouxieban" style="font-size:18px;"></i>
      //         </div>`
      //     )
      //     super($elem, editors)
      //   }
      //   // 菜单点击事件
      //   clickHandler() {
      //     // 做任何你想做的事情
      //     // 可参考【常用 API】文档，来操作编辑器
      //     const conf = myscriptMath(editor)
      //     const panel = new Panel(this, conf)
      //     panel.create()
      //   }

      //   tryChangeActive() {}
      // }

      // 注册菜单
      const menuKey = "kityformulaKey"; // 菜单 key ，各个菜单不能重复
      editor.menus.extend("kityformulaKey", kityformula);

      // 注册菜单
      // const menuKey2 = 'myscriptKey' // 菜单 key ，各个菜单不能重复
      // editor.menus.extend('myscriptKey', Myscript)

      // 自定义菜单配置
      editor.config.menus = [
        "head", // 标题
        "bold", // 粗体
        "fontSize", // 字号
        "italic", // 斜体
        "underline", // 下划线
        "strikeThrough", // 删除线
        "foreColor", // 文字颜色
        "backColor", // 背景颜色
        "link", // 插入链接
        "list", // 列表
        "justify", // 对齐方式
        "quote", // 引用
        "emoticon", // 表情
        "image", // 插入图片
        "table", // 表格
        "code", // 插入代码
        "undo", // 撤销
        "redo" // 重复
      ];
      if (this.uploadVideoUrl) {
        editor.config.menus.push("video");
      }

      // 将菜单加入到 editor.config.menus 中
      // 也可以通过配置 menus 调整菜单的顺序，参考【配置菜单】部分的文档
      editor.config.menus = editor.config.menus.concat(menuKey);
      // editor.config.menus = editor.config.menus.concat(menuKey2)

      //上传视频回调函数
      editor.config.uploadVideoHooks = {
        // 上传视频之前
        // before: function(xhr) {
        //   // console.log(xhr);

        //   // 可阻止视频上传
        //   return {
        //     prevent: true,
        //     msg: "需要提示给用户的错误信息"
        //   };
        // },
        // 视频上传并返回了结果，视频插入已成功
        success: function(xhr) {
          console.log("success", xhr);
        },
        // 视频上传并返回了结果，但视频插入时出错了
        fail: function(xhr, editor, resData) {
          console.log("fail", resData);
        },
        // 上传视频出错，一般为 http 请求的错误
        error: function(xhr, editor, resData) {
          console.log("error", xhr, resData);
        },
        // 上传视频超时
        timeout: function(xhr) {
          console.log("timeout");
        },
        // 视频上传并返回了结果，想要自己把视频插入到编辑器中
        // 例如服务器端返回的不是 { errno: 0, data: { url : '.....'} } 这种格式，可使用 customInsert
        customInsert: function(insertVideoFn, result) {
          // result 即服务端返回的接口
          console.log("customInsert", result);

          // insertVideoFn 可把视频插入到编辑器，传入视频 src ，执行函数即可
          let url = result.data[0].url;
          insertVideoFn(url);
        }
      };

      //上传图片回调函数
      editor.config.uploadImgHooks = {
        // 图片上传并返回结果，但图片插入错误时触发
        fail: function(xhr, editor, result) {
          console.log(result);
        },
        success: function(xhr, editor, result) {
          // 图片上传并返回结果，图片插入成功之后触发
          console.log(result, "success");
        },
        customInsert: function(insertImg, result, editor) {
          // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
          // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
          // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
          if (result.code == 0) {
            let url = result.data.Data[0].FileName;
            insertImg(url);
          }
          // result 必须是一个 JSON 格式字符串！！！否则报错
        }
      };

      // 配置字体大小
      editor.config.fontSizes = {
        "x-small": { name: "10px", value: "1" },
        small: { name: "13px", value: "2" },
        normal: { name: "16px", value: "3" },
        large: { name: "18px", value: "4" },
        "x-large": { name: "24px", value: "5" },
        "xx-large": { name: "32px", value: "6" },
        "xxx-large": { name: "48px", value: "7" }
      };

      // 下面两个配置，使用其中一个即可显示“上传图片”的tab。但是两者不要同时使用！！！
      // this.editor.config.uploadImgShowBase64 = true // 使用 base64 保存图片
      // this.editor.config.uploadImgServer = '/upload' // 上传图片到服务器
      //配置文件上传路径
      editor.config.uploadImgServer = this.uploadImgUrl;
      editor.config.uploadVideoServer = this.uploadVideoUrl;
      // editor.config.uploadImgHeaders = editor.config.uploadVideoHeaders = {
      //   DebugUser: 'bestsch',
      //   currentRole:
      //     process.env.NODE_ENV == 'production'
      //       ? localStorage.getItem('currentRole')
      //       : '%7B%22childId%22:0,%22roleId%22:7,%22schId%22:319351%7D',
      // }
      // 配置字体
      // editor.config.fontNames = [
      //   "黑体",
      //   "仿宋",
      //   "楷体",
      //   "标楷体",
      //   "华文仿宋",
      //   "华文楷体",
      //   "宋体",
      //   "微软雅黑",
      //   "Arial",
      //   "Tahoma",
      //   "Verdana",
      //   "Times New Roman"
      // ];
      this.editor = editor;
      this.editor.create();
    },

    getEditorContent() {
      const _this = this;
      return encodeURIComponent(this.editor.txt.html());
    },

    /**
     * @description: 设置富文本编辑框的内容
     * @param {*} content 文本
     * @return {*}
     * @Date: 2021-03-19 10:30:42
     * @Author: David
     */

    setEditorContent(content) {
      try {
        this.editor.txt.html(content);
      } catch (error) {
        console.error("编辑器对象未初始化");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.editor-wrap {
  /deep/ li {
    list-style-type: unset;
  }
  // 富文本框配置字号
  /deep/ .ivu-tabs-tab {
    font-size: 14px;
    font-weight: 400;
    color: #272829;
  }
  /deep/ font[size="1"] {
    font-size: 10px;
  }
  /deep/ font[size="2"] {
    font-size: 13px;
  }
  /deep/ font[size="3"] {
    font-size: 16px;
  }
  /deep/ font[size="4"] {
    font-size: 18px;
  }
  /deep/ font[size="5"] {
    font-size: 24px;
  }
  /deep/ font[size="6"] {
    font-size: 32px;
  }
  /deep/ font[size="7"] {
    font-size: 48px;
  }
  // 配置字号结束
}

/deep/ .wang-formula .w-e-panel-container {
  transform: translateX(-50%);
  margin-left: unset !important;
  position: fixed;
}
</style>
