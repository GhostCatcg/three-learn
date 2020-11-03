/**
*
* Author: lvgc
* CreatDate: 2020-06-17 09:36:19
*
* Description: 测试直播视频
*
*/
<template>
  <div class="video-wapper">
    <!-- <myVideo src="rtmp://221.13.13.154:1936/live/pag/221.13.13.154/7302/001483/编码/0/MAIN/TCP" :type="2" v-if="true"></myVideo> -->
    <myVideo src="rtmp://58.200.131.2:1935/livetv/hunantv" :type="2"></myVideo>
    <myVideo src="rtmp://61.150.105.98:1935/live/openUrl/8gfD29i/" :type="2"></myVideo>
    
    <myVideo src="http://www.w3school.com.cn/i/movie.mp4" :type="1"></myVideo>
    
  </div>
</template>

<script>
import myVideo from "@/components/myVideo";
export default {
  name: "rtmpVideo",
  components: {
    myVideo
  },
  props: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {},
  watch: {}
};
</script>
<style lang='scss' scoped type='text/scss'>
.video-wapper {
  height: 100%;
}
</style>
