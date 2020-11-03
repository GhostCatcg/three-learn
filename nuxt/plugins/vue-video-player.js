import Vue from 'vue'
// import VideoPlayer from 'vue-video-player'
// import 'video.js/dist/video-js.css'
// import 'vue-video-player/src/custom-theme.css' // 引入样式
// import 'videojs-flash'
// // "vue-video-player": "5.0.2",
// // let data
// // data.flash.swf = require('videojs-swf/dist/video-js.swf');
// Vue.use(VideoPlayer)
// // Vue.use(VideoPlayer, {F
// //     options: {
// //         data
// //     }

// //   })

// import SWF_URL from "videojs-swf/dist/video-js.swf";
// videojs.options.flash.swf = SWF_URL; // 设置flash路径，Video.js会在不支持html5的浏览中使用flash播放视频文件



import videojs from "video.js";
import VideoPlayer from "vue-video-player";
import "video.js/dist/video-js.css";
import "videojs-flash";

Vue.use(VideoPlayer)





//视频插件包
// import videojs from "video.js";
// import VideoPlayer from 'vue-video-player'
// import "video.js/dist/video-js.css";
// import "videojs-flash";
// import SWF_URL from "videojs-swf/dist/video-js.swf";
// videojs.options.flash.swf = SWF_URL; // 设置flash路径，Video.js会在不支持html5的浏览中使用flash播放视频文件
// Vue.use(VideoPlayer)
