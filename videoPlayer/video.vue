<template>
  <div class="nut-video" ref="videocon">
    <video
      ref="video"
      class="nut-videoplayer"
      :muted="options.muted"
      :autoplay="options.autoplay"
      :loop="options.loop"
      :poster="options.poster"
      :controls="options.controls"
      :preload="options.preload"
      @error="handleError"
    >
      <source
        v-for="source in sources"
        :src="source.src"
        :type="source.type"
        :key="source.src"
      />
    </video>
    <div
      class="playing-mask"
      ref="touchMask"
      v-if="showToolbox && !isDisabled"
      @click="play"
    ></div>
    <div
      class="nut-video-play-btn"
      v-if="showToolbox && !isDisabled"
      ref="palyBtn"
      v-show="!state.playing"
      @click="play"
    ></div>
    <div
      class="nut-video-controller"
      v-show="showToolbox && !isDisabled"
      :class="{ 'show-control': !state.playing, 'hide-control': state.playing }"
    >
      <div class="control-play-btn" @click="play"></div>
      <div class="current-time">{{ videoSet.displayTime }}</div>
      <div class="progress-container">
        <div class="progress" ref="progressBar">
          <div class="buffered" :style="{ width: `${videoSet.loaded}%` }"></div>
          <div
            class="video-ball"
            :style="{
              transform: `translate3d(${videoSet.progress.current}px, -50%, 0)`
            }"
            @touchmove.stop.prevent="touchSlidMove($event)"
            @touchstart.stop="touchSlidSrart($event)"
            @touchend.stop="touchSlidEnd($event)"
          >
            <div class="move-handle"></div>
          </div>
          <div class="played" ref="playedBar"></div>
        </div>
      </div>
      <div class="duration-time">{{ videoSet.totalTime }}</div>
      <div
        class="volume"
        @click="handleMuted"
        :class="{ muted: state.isMuted }"
      ></div>
      <div class="fullscreen-icon" @click="fullScreen"></div>
    </div>
    <!-- 错误弹窗 -->
    <div class="nut-video-error" v-show="state.isError">
      <p class="lose">视频加载失败</p>
      <p class="retry" @click="retry">点击重试</p>
    </div>
  </div>
</template>
<script>
import { throttle } from "./throttle";
export default {
  name: "nut-video",
  props: {
    sources: {
      type: Array,
      default() {
        return [];
      }
    },
    options: {
      type: Object,
      default() {
        return {
          autoplay: false, //是否自动播放
          volume: 0.5,
          poster: "",
          loop: false,
          controls: true,
          muted: false, //是否静音
          disabled: false, //禁止操作
          playsinline: false, //行内展示
          touchPlay: false,
          preload: ""
        };
      },
      required: true
    },
    model: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      videoElm: null,
      initial: true, //控制封面的显示
      showToolbox: false, //控制控制器和标题的显示
      // 视频容器元素
      player: {
        $player: null,
        pos: null
      },
      // progress进度条元素
      progressBar: {
        progressElm: null, // 进度条DOM对象
        pos: null
      },
      // video控制显示设置
      videoSet: {
        loaded: 0, // 缓存长度
        displayTime: "00:00", // 进度时间
        totalTime: "00:00", // 总时间
        progress: {
          width: 0, // 进度条长度
          current: 0 // 进度条当前位置
        }
      },
      state: {
        controlShow: true,
        vol: 0.5, //音量
        currentTime: 0, //当前时间
        fullScreen: false,
        playing: false, //是否正在播放
        isLoading: false,
        isEnd: false,
        isError: false,
        isMuted: false
      },
      showTouchMask: false
    };
  },
  computed: {
    isDisabled() {
      return this.options.disabled;
    }
  },
  watch: {
    sources: {
      handler(newValue, oldValue) {
        if (newValue && oldValue && newValue != oldValue) {
          this.$nextTick(() => {
            this.videoElm.load();
          });
        }
      },
      immediate: true
    },
    options: {
      handler(val) {
        this.state.isMuted = val.muted ? val.muted : false;
      },
      immediate: true
    }
    // model: {
    //     handler(val) {
    //         if (val) {
    //             if (val == 'custom') {
    //                 this.state.controlShow = false;
    //                 this.showToolbox = this.options.controls ? true : false
    //             }
    //         } else {
    //             this.showToolbox = false;
    //             this.state.controlShow = this.options.controls ? true : false
    //         }
    //     },
    //     immediate: true
    // }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.videoElm = this.$el.getElementsByTagName("video")[0];
      if (this.options.autoplay) {
        this.videoElm.play();
      }
      if (this.options.touchPlay) {
        this.showTouchMask = true;
      }
      if (this.options.playsinline) {
        this.videoElm.setAttribute("playsinline", this.options.playsinline);
        this.videoElm.setAttribute(
          "webkit-playsinline",
          this.options.playsinline
        );
        this.videoElm.setAttribute("x5-playsinline", this.options.playsinline);
        this.videoElm.setAttribute("x5-video-player-type", "h5");
        this.videoElm.setAttribute("x5-video-player-fullscreen", false);
      }
      this.volumeHandle();
      if (this.showToolbox) {
        this.customerInit();
      } else {
        this.videoElm.addEventListener("play", () => {
          this.state.playing = true;
          this.$emit("play", this.videoElm);
        });
        this.videoElm.addEventListener("pause", () => {
          this.state.playing = false;
          this.$emit("pause", this.videoElm);
        });
        this.videoElm.addEventListener("ended", this.playEnded);
        this.videoElm.addEventListener(
          "timeupdate",
          throttle(this.getPlayTime, 100, 1)
        );
      }
    },
    customerInit() {
      const $player = this.$el;
      const $progress = this.$el.getElementsByClassName("progress")[0];
      // 播放器位置
      this.player.$player = $player;
      this.progressBar.progressElm = $progress;
      // this.player.pos = $player.getBoundingClientRect();
      this.progressBar.pos = $progress.getBoundingClientRect();
      this.videoSet.progress.width = Math.round(
        $progress.getBoundingClientRect().width
      );
    },
    play() {
      if (this.options.autoplay && this.options.disabled) {
        this.state.playing = true;
        // this.state.controlShow = false
        return false;
      }
      this.state.playing = !this.state.playing;
      if (this.videoElm) {
        // 播放状态
        if (this.state.playing) {
          try {
            this.videoElm.play();
            // 监听缓存进度
            this.videoElm.addEventListener("progress", e => {
              this.getLoadTime();
            });
            // 监听播放进度
            this.videoElm.addEventListener(
              "timeupdate",
              throttle(this.getPlayTime, 100, 1)
            );
            // 监听结束
            this.videoElm.addEventListener("ended", this.playEnded);
            this.$emit("play", this.videoElm);
          } catch (e) {
            // 捕获url异常出现的错误
            this.handleError();
          }
        }
        // 停止状态
        else {
          this.videoElm.pause();
          this.$emit("pause", this.videoElm);
        }
      }
    },
    // 音量控制
    volumeHandle() {
      this.state.vol = this.options.volume;
    },
    // 静音控制
    handleMuted() {
      this.state.isMuted = !this.state.isMuted;
      this.videoElm.muted = this.state.isMuted;
    },
    playEnded() {
      this.state.playing = false;
      this.state.isEnd = true;
      this.state.controlBtnShow = true;
      this.videoSet.displayTime = "00:00";
      this.videoSet.progress.current = 0;
      this.videoElm.currentTime = 0;
      this.$emit("playend", this.videoElm);
    },
    // 数据加载出错
    handleError() {
      // console.log('error')
      this.state.isError = true;
    },
    fullScreen() {
      if (!this.state.fullScreen) {
        this.state.fullScreen = true;
        this.videoElm.webkitRequestFullScreen();
      } else {
        this.state.fullScreen = false;
        document.webkitCancelFullScreen();
      }
      // setTimeout(this.initVideo, 200);
    },
    // 获取播放时间
    getPlayTime() {
      const percent = this.videoElm.currentTime / this.videoElm.duration;
      this.videoSet.progress.current = Math.round(
        this.videoSet.progress.width * percent
      );
      // 赋值时长
      this.videoSet.totalTime = this.timeFormat(this.videoElm.duration);
      this.videoSet.displayTime = this.timeFormat(this.videoElm.currentTime);
    },
    timeFormat(t) {
      var h = Math.floor(t / 3600);
      if (h < 10) {
        h = "0" + h;
      }
      var m = Math.floor((t % 3600) / 60);
      if (m < 10) {
        m = "0" + m;
      }
      var s = Math.round((t % 3600) % 60);
      if (s < 10) {
        s = "0" + s;
      }
      var str = "";
      if (h != 0) {
        str = h + ":" + m + ":" + s;
      } else {
        str = m + ":" + s;
      }
      return str;
    },
    // 获取缓存时间
    getLoadTime() {
      if (this.videoSet.loaded)
        this.videoSet.loaded =
          (this.videoElm.buffered.end(0) / this.videoElm.duration) * 100;
    },
    getTime() {
      this.videoElm.addEventListener("durationchange", e => {
        // console.log(e);
      });
      this.videoElm.addEventListener("progress", e => {
        this.videoSet.loaded =
          (-1 + this.videoElm.buffered.end(0) / this.videoElm.duration) * 100;
      });
      this.videoSet.len = this.videoElm.duration;
    },
    // 拖动播放进度
    touchSlidSrart(e) {},
    touchSlidMove(e) {
      let currentX = e.targetTouches[0].pageX;
      let offsetX = currentX - this.progressBar.pos.left;
      // 边界检测
      if (offsetX <= 0) {
        offsetX = 0;
      }
      if (offsetX >= this.videoSet.progress.width) {
        offsetX = this.videoSet.progress.width;
      }
      this.videoSet.progress.current = offsetX;
      let percent =
        this.videoSet.progress.current / this.videoSet.progress.width;
      this.videoElm.duration &&
        this.setPlayTime(percent, this.videoElm.duration);
    },
    touchSlidEnd(e) {
      let currentX = e.changedTouches[0].pageX;
      let offsetX = currentX - this.progressBar.pos.left;
      this.videoSet.progress.current = offsetX;
      // 这里的offsetX都是正数
      let percent = offsetX / this.videoSet.progress.width;
      this.videoElm.duration &&
        this.setPlayTime(percent, this.videoElm.duration);
    },
    // 设置手动播放时间
    setPlayTime(percent, totalTime) {
      this.videoElm.currentTime = Math.floor(percent * totalTime);
    },
    // 点击重新加载
    retry() {
      // console.log('error');
      this.state.isError = false;
      this.init();
    }
  },
  beforeDestroy() {}
};
</script>
<style lang="scss" scoped>
.nut-video {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  .nut-videoplayer {
    width: 100%;
    background: #000;
  }
  .playing-mask {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 60px;
    &.custom-touch {
      bottom: 0;
    }
  }
  video {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
  .nut-video-play-btn {
    // display: none;
    width: 80px;
    height: 50px;
    margin-top: -25px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background-color: rgba(0, 0, 0, 0.45);
    color: #fff;
    transition: border-color 0.4s, outline 0.4s, background-color 0.4s;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -40px;
    padding: 0;
    cursor: pointer;
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.5);
    font-size: 30px;
    border-radius: 20%;

    &:before {
      content: "";
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA+CAMAAABTPci/AAAAb1BMVEUAAAACAgL///////////////////////////////////+urq4uLi7+/v6zs7OLi4v9/f3Hx8dubm79/f39/f3z8/P5+fn9/f38/Pz4+Pipqans7Oz8/Pz29vbx8fHi4uLX19fq6urg4ODT09P5+flRzniSAAAAJXRSTlMAA6GcmZWlno+RjBYHixgNhRsJgn9PbYh7XhNBdFlHMyc6LCNmyQGEbAAAAdlJREFUSMe11tly4jAQRuHgDdnBYBazw8xk8v7POMI/1Jm0iORUKs31Vy0dMOWX78xk8nWi+SKZrVYzqfHo9Xo4nOZiY83yvW2a9vxnwRmTZta3fhq3O/xlWQodzwNqGre/HlmWuNFeyKtm+7aSSqNG4/x0/VJnTKENxtWOICkkI9YQJIEwdV2uFSSOjPEfBYkjh7kpP+3FBrEIMuzR7AmSRN5oivpdQeJI13mYsig6G8Qi1sgMU55/KUiI1uZCoCJ3BDGo9iYgQnm+IYhBWsN1MPm0VJAADYbBDGra9gQBsccYoSxXEIuCNRiPsqxUkE8Q5IGksvXpFgRkiRBkmCrf/vbLHqgryWYXyUhVrvfLLIobr7KL7/ERPT8axk/xBrImRNV9riBdKG1CNMJwvHlnjAimuiOFABURw6Ka5PNdYfc8JVO+3AEhMPZoO/2MQJE9d1Qc+MGCME9ItufRAMXv4/rXCQYkYvYQQMQi2wDVnRasAbVk+9+YADHEGhMgRKGxAUIkYp44AqSRDAE+RxAhAiQQhAARNDWpHX/DccSenAAR1HzIRoCxqCoJkEDZwxAghY6buyBAGs0uMgQYo5bnW4A1AcapfrvtCTD2FXuxEPm5l3nYyw/PP4V4LkWCqx4LAAAAAElFTkSuQmCC)
        no-repeat center;
      width: 30px;
      height: 30px;
      display: inline-block;
      background-size: contain;
    }
  }
  .nut-video-controller {
    position: absolute;
    display: flex;
    left: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    height: 35px;
    width: 100%;
    z-index: 11111111;
    align-items: center;
    opacity: 0;
    transition: all 1s;
    &.show-control {
      opacity: 1;
    }
    &.hide-control {
      opacity: 0;
    }
    .control-play-btn {
      width: 18px;
      height: 18px;
      background-image: -webkit-image-set(
        url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmZmZmIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik04IDV2MTRsMTEtN3oiLz4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KPC9zdmc+Cg==)
          1x
      );
      background-repeat: no-repeat;
      background-position: center;
      margin: 0 10px;
      &.puase {
        background-image: -webkit-image-set(
          url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmZmZmIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik02IDE5aDRWNUg2djE0em04LTE0djE0aDRWNWgtNHoiLz4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KPC9zdmc+Cg==)
            1x
        );
        background-repeat: no-repeat;
        background-position: center;
      }
    }

    .duration-time,
    .current-time {
      color: #fff;
      padding: 0 5px;
      font-size: 10px;
    }
    .progress-container {
      position: relative;
      display: inline-block;
      height: 100%;
      width: 100%;
      // overflow: hidden;
      margin: 0 5px;
      transition: all 0.2s ease-in;
      flex: 1;
      .progress {
        position: absolute;
        top: 50%;
        width: 100%;
        height: 2px;
        margin-top: -0.05rem;
        background: rgba(255, 255, 255, 0.5);
        // overflow: hidden;
      }
      .buffered {
        background: rgba(255, 255, 255, 0.8);
        height: 2px;
      }
      .video-ball {
        width: 10px;
        height: 10px;
        // background: #fff;
        // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.2);
        position: absolute;
        top: 50%;
        left: 0;
        // margin-left: -7px;
        border-radius: 50%;
        div {
          width: 10px;
          height: 10px;
          background: #fff;
          box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.2);
          // position: absolute;
          // top: 0;
          // left: 8px;
          margin: 0 -5px;
          border-radius: 50%;
        }
        &:hover {
          width: 15px;
          height: 15px;
        }
      }
    }
    .fullscreen-icon {
      width: 40px;
      height: 35px;
      background-image: -webkit-image-set(
        url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmZmZmIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik03IDE0SDV2NWg1di0ySDd2LTN6bS0yLTRoMlY3aDNWNUg1djV6bTEyIDdoLTN2Mmg1di01aC0ydjN6TTE0IDV2MmgzdjNoMlY1aC01eiIvPgo8L3N2Zz4K)
          1x
      );

      background-repeat: no-repeat;
      background-position: center;
      &.full2 {
        background-image: -webkit-image-set(
          url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmZmZmIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik01IDE2aDN2M2gydi01SDV2MnptMy04SDV2Mmg1VjVIOHYzem02IDExaDJ2LTNoM3YtMmgtNXY1em0yLTExVjVoLTJ2NWg1VjhoLTN6Ii8+Cjwvc3ZnPgo=)
            1x
        );
        background-repeat: no-repeat;
        background-position: center;
      }
    }
    .volume {
      width: 30px;
      height: 30px;
      background-image: -webkit-image-set(
        url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmZmZmIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0zIDl2Nmg0bDUgNVY0TDcgOUgzem0xMy41IDNjMC0xLjc3LTEuMDItMy4yOS0yLjUtNC4wM3Y4LjA1YzEuNDgtLjczIDIuNS0yLjI1IDIuNS00LjAyek0xNCAzLjIzdjIuMDZjMi44OS44NiA1IDMuNTQgNSA2Ljcxcy0yLjExIDUuODUtNSA2LjcxdjIuMDZjNC4wMS0uOTEgNy00LjQ5IDctOC43N3MtMi45OS03Ljg2LTctOC43N3oiLz4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KPC9zdmc+Cg==)
          1x
      );
      background-repeat: no-repeat;
      background-position: center;
      &.muted {
        background-image: -webkit-image-set(
          url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZmZmZmZmIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0xNi41IDEyYzAtMS43Ny0xLjAyLTMuMjktMi41LTQuMDN2Mi4yMWwyLjQ1IDIuNDVjLjAzLS4yLjA1LS40MS4wNS0uNjN6bTIuNSAwYzAgLjk0LS4yIDEuODItLjU0IDIuNjRsMS41MSAxLjUxQzIwLjYzIDE0LjkxIDIxIDEzLjUgMjEgMTJjMC00LjI4LTIuOTktNy44Ni03LTguNzd2Mi4wNmMyLjg5Ljg2IDUgMy41NCA1IDYuNzF6TTQuMjcgM0wzIDQuMjcgNy43MyA5SDN2Nmg0bDUgNXYtNi43M2w0LjI1IDQuMjVjLS42Ny41Mi0xLjQyLjkzLTIuMjUgMS4xOHYyLjA2YzEuMzgtLjMxIDIuNjMtLjk1IDMuNjktMS44MUwxOS43MyAyMSAyMSAxOS43M2wtOS05TDQuMjcgM3pNMTIgNEw5LjkxIDYuMDkgMTIgOC4xOFY0eiIvPgogICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K)
            1x
        );
        background-repeat: no-repeat;
        background-position: center;
      }
    }
  }
  .nut-video-error {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 111111;
    background: #000;
    color: #fff;
    text-align: center;
    p {
      color: #fff;
    }
  }
}
</style>
