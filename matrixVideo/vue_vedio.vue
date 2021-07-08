<template>
  <div class="_contenter flex_center">
    <div class="videoBox">
      <video
        v-if="mobile == 'android'"
        :id="timestamp"
        width="100%"
        height="100%"
        x5-video-player-fullscreen="true"
        x5-playsinline
        playsinline
        webkit-playsinline
        preload="none"
        :src="videoUrl"
        :poster="videoImg"
      ></video>
      <video
        v-if="mobile == 'iPhone'"
        :id="timestamp"
        width="100%"
        height="100%"
        preload="none"
        webkit-playsinline
        x5-playsinline="true"
        x5-video-player-fullscreen="false"
        playsinline="true"
        :poster="videoImg"
        :src="videoUrl"
      ></video>
    </div>

    <div
      :id="'play_' + timestamp"
      class="absoluteapply"
      @click.stop="play()"
      v-if="isshowplay"
    >
      <img style="height:100%;width:100%;" src="static/images/vedioplay.png" />
    </div>

    <div
      :id="'cover_' + timestamp"
      class="video-cover"
      @click.stop="play()"
      v-if="isshowplay"
    >
      <img style="height:100%;width:100%;" v-show="cover" :src="cover" />
    </div>
    <!-- <div v-else class="absolutepp" @click="endclick">返回</div> -->
  </div>
</template>
<script>
export default {
  props: {
    videoUrl: {
      type: String,
      default: () => {
        return "";
      }
    },
    cover: {
      type: String,
      default: () => {
        return "";
      }
    },
    isshowplay: {
      type: Boolean,
      default: () => {
        return true;
      }
    }
  },
  watch: {
    videoUrl() {
      // if (_this.mobile == "android") {
      //   _this.$nextTick(() => {
      //     //封面
      //     var video = document.getElementById(_this.timestamp);
      //     let height = $(video)[0].clientHeight;
      //     let width = $(video)[0].clientWidth;
      //     _this.videoImg = `${_this.videoUrl}?x-oss-process=video/snapshot,t_1000,f_jpg,w_${width},h_${height},m_fast`;
      //   });
      // }
    }
  },
  data() {
    return {
      videoImg: "",
      mobile: "",
      timestamp:
        new Date().getTime() + "_" + Math.floor((1 + Math.random()) * 1000000),
      isshow: true
    };
  },
  created() {
    this.mobile =
      navigator.appVersion.indexOf("iPhone") !== -1 ? "iPhone" : "android";
  },
  mounted() {
    const _this = this;
    // _this.isshow=true;
    var video = document.getElementById(_this.timestamp);
    _this.bindInit(_this.timestamp);

    window.onhashchange = function(e) {
      if (e.oldURL.indexOf("video") > 0) {
        let idStr = e.oldURL.substring(e.oldURL.indexOf("video"));
        var id = idStr.split("=");
        var video = document.getElementById(id[1]);
        $(video).removeClass("mainContent");
        var playbtn = document.getElementById("play_" + id[1]);
        $(playbtn).css("display", "block");

        video.controls = "";
        var parent = $(video).parent();
        var html = $(parent).html();
        $(parent).html("");
        $(parent).html(html);
        _this.bindInit(id[1]);
      }
    };
    if (_this.mobile == "android") {
      // _this.$nextTick(() => {
      //   //封面
      //   var video = document.getElementById(_this.timestamp);
      //   let height = $(video)[0].clientHeight;
      //   let width = $(video)[0].clientWidth;
      //   _this.videoImg = `${_this.videoUrl}?x-oss-process=video/snapshot,t_1000,f_jpg,w_${width},h_${height},m_fast`;
      // });
    }
  },
  methods: {
    play: function() {
      document.getElementById(this.timestamp).play();

      var playbtn = document.getElementById("play_" + this.timestamp);
      $(playbtn).css("display", "none");
    },
    endclick: function() {
      history.back();
      this.isshowplay = false;
    },
    bindInit(timestamp) {
      const _this = this;
      var video = document.getElementById(timestamp);
      video.addEventListener("play", function(e) {
        //pushState只会在当前history中添加一条记录，并不会刷新浏览器
        history.pushState(
          {},
          "mp4_" + timestamp,
          `${window.location.href}&video=${timestamp}`
        );
        $(video).addClass("mainContent");
        video.controls = "controls";
      });
    }
  }
};
</script>
<style>
video::-webkit-media-controls-fullscreen-button {
  display: none;
}
</style>
<style rel="stylesheet/scss" lang="scss">
._contenter {
  height: 100%;
  width: 100%;
  position: relative;
  background: #000;
  .videoBox {
    position: relative;
    width: calc(100%);
    height: calc(100%);
    video {
      // width: 100%;
      overflow: hidden;
      display: block;
      // object-fit: cover;
      object-fit: contain;

      object-position: center center;
    }
    #video {
      display: block;
      width: 100%;
      height: 180px;
      .video-show {
        width: 100%;
        height: 100%;
        position: relative;
      }
    }
  }
}

.mainContent {
  position: fixed;
  width: 100vw;
  height: 100vh;
  object-fit: contain;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  background: #333;
}
.absoluteapply {
  // border: 1px solid #333;
  width: 50px;
  height: 50px;
  text-align: center;
  line-height: 50px;
  border-radius: 50%;
  position: absolute;
  z-index: 3;
  // background: #333;
  // color: #ffffff;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  // font-size: 12px !important;
}
.video-cover {
  width: calc(100%);
  height: calc(100%);
  object-fit: contain;
  text-align: center;
  line-height: 50px;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}
.absolutepp {
  border: 1px solid #333;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border-radius: 50%;
  position: absolute;
  z-index: 10;
  background: #333;
  color: #ffffff;
  left: 10px;
  top: 10px;
}
</style>
