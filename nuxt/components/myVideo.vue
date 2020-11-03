<template>
  <video-player
    style="height:100%"
    class="video-player vjs-custom-skin myVideo"
    ref="videoPlayer"
    :playsinline="true"
    :options="playerOptions"
  ></video-player>
</template>
<script>
import videojs from "video.js";
// import VideoPlayer from "vue-video-player";
// import "video.js/dist/video-js.css";
// import "videojs-flash";
// import SWF_URL from "videojs-swf/dist/video-js.swf";
// videojs.options.flash.swf = SWF_URL; // 设置flash路径，Video.js会在不支持html5的浏览中使用flash播放视频文件
export default {
  name: "myVideo",
  props: {
    // 路径
    src: {
      type: String,
      default:
        "rtmp://221.13.13.154:1936/live/pag/221.13.13.154/7302/001447/0/MAIN/TCP"
    },
    // 类型  1:http  2:rtmp
    type: {
      type: Number,
      default: 2
    }
  },
  watch: {
    src: {
      handler(newVal) {
        // console.log("接收到了新的src", newVal);

        // 暂停
        this.$refs.videoPlayer.player.pause();

        for (let item of this.playerOptions.sources) {
          item.src = newVal;
        }
        // 播放
        this.$refs.videoPlayer.player.play();
      },
      deep: true
    }
  },
  computed: {
    player() {
      return this.$refs.videoPlayer.player;
    }
  },
  data() {
    return {
      // 视频播放
      playerOptions: {
        playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
        autoplay: true, //如果true,浏览器准备好时开始回放。
        muted: true, // 默认情况下将会消除任何音频。
        loop: false, // 导致视频一结束就重新开始。
        preload: "auto", // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: "zh-CN",
        aspectRatio: "16:9", // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        techOrder: ["flash", "html5"], // 兼容顺序
        html5: {
          hls: { withCredentials: false }
          // swf: SWF_URL
        },
        sources: [
          {
            // 流配置，数组形式，会根据兼容顺序自动切换
            type: "rtmp/hls",
            src: this.src
          },
          {
            type: "video/mp4",
            src: this.src
          },
          {
            type: "application/x-mpegURL", //如果是直播的话 此处务必这样配置
            src: this.src
          }
        ],
        poster: "", //你的封面地址

        notSupportedMessage: "此视频暂无法播放，请稍后再试", // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: false, // 当前时间和持续时间的分隔符
          durationDisplay: false, // 显示持续时间
          remainingTimeDisplay: false, // 是否显示剩余时间功能
          fullscreenToggle: true //全屏按钮
        }
      }
    };
  }
};
</script>
<style lang="scss" >
.myVideo {
  width: 100%;
  height: 100%;
  position: relative;
  .video-js {
    height: 100%;
    padding-top: 0px;
  }
}
// 超出范围隐藏
.vjs-custom-skin > .video-js .vjs-control-bar {
  font-size: 0.7rem;
  overflow: hidden;
}
// 进度条隐藏
.vjs-custom-skin > .video-js .vjs-progress-control.vjs-control {
  // display: none;
}

// 持续时间隐藏
.vjs-custom-skin > .video-js .vjs-control-bar .vjs-time-control {
  display: none;
}
</style>