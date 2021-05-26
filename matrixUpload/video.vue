<!--
 * @Author: David
 * @Date: 2021-05-14 17:49:33
 * @LastEditTime: 2021-05-26 09:40:20
 * @LastEditors: David
 * @Description: 
 * @FilePath: /WebFront 2/src/components/matrixUpload/index.vue
 * 可以输入预定的版权声明、个性签名、空行等
-->
<template>
  <div class="upload-main">
    <Upload
      ref="upload"
      :show-upload-list="false"
      :default-file-list="defaultList"
      :on-success="handleSuccess"
      :accept="fileAccept"
      :max-size="fileMaxSize"
      :on-exceeded-size="handleMaxSize"
      :before-upload="handleBeforeUpload"
      :on-progress="fileProgress"
      :name="uploadFileName"
      :action="fileUploadUrl"
      :data="uploadParams"
      style="display: inline-block;width:100px;margin:10px;"
    >
      <div class="upload-rang">
        <Icon type="md-add" size="30" />
        <span>点击上传图片</span>
      </div>
    </Upload>
    <div
      class="demo-upload-list"
      v-for="(item, index) in uploadList"
      :key="index"
    >
      <template
        v-if="item.status === 'finished' || typeof item.status == 'undefined'"
      >
        <img :src="item.path" />
        <!-- <p
          style="position: absolute;top: calc(50% - 20px);z-index: 9;color: red;right: 10px;"
        >
          {{ $utils.formatDuraton(item.videoTime) }}
        </p> -->
        <div class="demo-upload-list-cover">
          <Icon
            type="ios-trash-outline"
            @click.native="handleRemove(item, index)"
          ></Icon>
        </div>
      </template>
      <template v-else>
        <Progress
          v-if="item.showProgress"
          :percent="item.percentage"
          hide-info
        ></Progress>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    //文件上传的参数名称 每个后台设计估计不太一样
    uploadFileName: {
      type: String,
      default: () => {
        return "files";
      }
    },

    //文件上传的接口
    fileUploadUrl: {
      type: String,
      default: () => {
        return "";
      }
    },
    // 文件上传大小 kb
    fileMaxSize: {
      type: Number,
      default: () => {
        return 20 * 1024;
      }
    },
    // 上传的文件的参数
    uploadParams: {
      type: Object,
      default: () => {
        return null;
      }
    },
    //是否手动上传
    isHandUpload: {
      type: Boolean,
      default: () => {
        return false;
      }
    },

    /**
     * @description: 仅仅只能上传一张图片
     */
    singleUpload: {
      type: Boolean,
      default: () => {
        return false;
      }
    },

    /**
     * @description: 初始化上传的文件列表
     * @param {*}
     * @return {*} [{path:"",name:""}]
     * @Date: 2021-03-19 16:36:48
     * @Author: David
     */

    defaultList: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      uploadList: [], //文件列表
      fileAccept: ".png,.jpg,.jpeg", //上传文件的类型
      delteFileIds: [] //将要删除文件的ID
    };
  },
  watch: {
    defaultList() {
      this.uploadList = this.$refs.upload.fileList = this.defaultList;
      this.$emit("getVideos", this.uploadList);
    }
  },
  mounted() {},
  methods: {
    /**
     * @description: 文件移除
     * @param {*} file
     * @param {*} index
     * @return {*}
     * @Date: 2021-03-19 16:32:14
     * @Author: David
     */

    handleRemove(file, index) {
      const fileList = this.$refs.upload.fileList;
      // console.log(fileList.indexOf(file));
      this.uploadList.splice(fileList.indexOf(file), 1);
      this.delteFileIds.push(file.id);
      this.$emit("deleteFile", file);
    },
    /**
     * @description: 文件上传成功
     * @param {*} resp
     * @param {*} file
     * @return {*}
     * @Date: 2021-03-19 16:32:25
     * @Author: David
     */

    handleSuccess(resp, file, fileList) {
      if (resp.code == 0) {
        let index = this.uploadList.findIndex(item => {
          return item.uid == file.uid;
        });
        let tem = resp.data[0];
        tem.status = "finished";
        // this.uploadList.push(tem);
        this.uploadList.splice(index, 1, tem);
        // 上传成功后输出ID到父组件中
        this.$emit("getVideos", this.uploadList);
      } else {
        this.$Message.info(resp.msg);
      }
    },

    /**
     * @description: 文件超出设置大小
     * @param {*} file
     * @return {*}
     * @Date: 2021-03-19 16:32:35
     * @Author: David
     */

    handleMaxSize(file) {
      const fileList = this.$refs.upload.fileList;
      // console.log(fileList.indexOf(file));
      this.uploadList.splice(fileList.indexOf(file), 1);
      this.$Notice.warning({
        title: "文件大小超出设定",
        desc: `文件" ${file.name}超出20M的大小限制`
      });
    },

    fileProgress(event, file, fileList) {
      this.$nextTick(() => {
        const fileList = this.$refs.upload.fileList;
        // console.log(fileList.indexOf(file));
        let index = fileList.indexOf(file);

        if (this.$refs.upload.fileList[index].percentage != 100) {
          this.$refs.upload.fileList[index].status = "unfinished";
          this.$refs.upload.fileList[index].percentage = +event.percent.toFixed(
            2
          );
        } else {
          this.$refs.upload.fileList[index].status = "finished";
        }
        this.uploadList = this.uploadList.reverse().reverse();
      });
    },
    /**
     * @description: 文件上传前
     * @param {*} file
     * @return {*}
     * @Date: 2021-03-19 16:32:49
     * @Author: David
     */

    handleBeforeUpload(file) {
      // 先插入一个本地的文件数据
      // console.log(file);
      file.showProgress = true;
      file.percentage = 0;

      //如果是手动上传
      if (this.isHandUpload) {
        file.status = "finished";
        file.percentage = 100;
        file.path = URL.createObjectURL(file);
      }

      //如果是单独上传只要一个文件,清空数组
      if (this.singleUpload) {
        this.uploadList = [];
      }
      this.uploadList.push(file);

      let typeArr = this.fileAccept.split(",");
      let fileType = file.name.slice(
        file.name.lastIndexOf("."),
        file.name.length
      );
      if (
        typeArr.some(item => {
          return item == fileType;
        })
      ) {
        if (this.isHandUpload) {
          return false;
        } else {
          return true;
        }
      } else {
        this.$Notice.warning({
          title: "文件类型出错",
          desc: `文件${file.name}不在${this.fileAccept}类型中`
        });
        return false;
      }
    },

    /**
     * @description: 获取需要上传的文件
     * @param {*}
     * @return {*}
     * @Date: 2021-03-19 16:34:07
     * @Author: David
     */

    getSaveFile() {
      return this.uploadList;
    },

    /**
     * @description: 获取需要删除的文件
     * @param {*}
     * @return {*}
     * @Date: 2021-03-19 16:34:25
     * @Author: David
     */

    getDeleteFile() {
      return this.delteFileIds;
    }
  },
  mounted() {
    this.$nextTick(() => {});
  }
};
</script>

<style lang="scss" scoped>
.upload-main {
  .upload-rang {
    width: 100px;
    height: 100px;
    border-radius: 5px;
    background-color: #f7f7f7;
    border: 1px solid #dddddd;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
  }
}
.demo-upload-list {
  display: inline-block;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin: 10px;
  vertical-align: bottom;
}
.demo-upload-list img,
.demo-upload-list video,
.demo-upload-list audio,
.demo-upload-list iframe {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
}
.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}
.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}
</style>
