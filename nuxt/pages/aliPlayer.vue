<template>
  <div>
    <div style="float: left;width: 550px;">
      直播
      <ali-video
        @play="play($event)"
        :useFlashPrism="true"
        :autoplay="true"
        :isLive="true"
        :rePlay="false"
        :showBuffer="true"
        showBarTime="5000"
        width="500px"
        height="400px"
        controlBarVisibility="hover"
        source="rtmp://58.200.131.2:1935/livetv/hunantv"
      ></ali-video>
    </div>

    <!-- <div style="float: left;">
      点播
      <ali-player
        @play="play"
        :useFlashPrism="true"
        :autoplay="true"
        :isLive="false"
        :rePlay="false"
        :showBuffer="true"
        showBarTime="5000"
        width="500px"
        height="400px"
        controlBarVisibility="hover"
        source="http://player.alicdn.com/video/aliyunmedia.mp4"
    ></ali-player>-->
    <!-- </div> -->
  </div>
</template>

<script>
import aliVideo from "@/components/ali-video";
export default {
  components: {
    aliVideo
  },
  methods: {
    play(event) {
      console.log(event);
    }
  }
};
</script>

