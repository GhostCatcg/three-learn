/**
*
* Author: lvgc
* CreatDate: 2020-06-15 14:35:48
*
* Description: 简单的旋转box案例
*
*/
<template>
  <div class="three-wapper">
    <div id="container"></div>
  </div>
</template>

<script>
import * as Three from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import "three-orbitcontrols";
// import "three-orbit-controls";
// import { OrbitControls } from "three-orbitcontrols";
// import "three/examples/js/controls/OrbitControls";
export default {
  name: "ThreeBox",
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null
    };
  },
  methods: {
    init: function() {
      let container = document.getElementById("container"); // 选中元素
      this.camera = new Three.PerspectiveCamera( // 透视摄像机
        70,
        container.clientWidth / container.clientHeight,
        0.01,
        10
      );
      // 透视摄像机
      // 第一个参数是视野角度（FOV）。视野角度就是无论在什么时候，你所能在显示器上看到的场景的范围，它的值是角度单位。
      // 第二个参数是长宽比（aspect ratio）。 也就是你用一个物体的宽除以它的高的值。比如说，当你在一个宽屏电视上播放老电影时，可以看到图像仿佛是被压扁的。
      // 接下来的两个参数是近截面（near）和远截面（far）。 当物体某些部分比摄像机的远截面远或者比近截面近的时候，该这些部分将不会被渲染到场景中。或许现在你不用担心这个值的影响，但未来为了获得更好的渲染性能，你将可以在你的应用程序里去设置它。
      this.camera.position.z = 0.6; // 相机的Z轴
      this.scene = new Three.Scene(); // 创建场景
      let geometry = new Three.BoxGeometry(0.2, 0.2, 0.2); // 创建大小为0.2的box模型
      let material = new Three.MeshNormalMaterial(); // 创建材质
      this.mesh = new Three.Mesh(geometry, material); // 给模型上材质
      this.scene.add(this.mesh); // 场景添加 带有材质的box模型

      this.renderer = new Three.WebGLRenderer({ antialias: true }); // 创建渲染器
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(this.renderer.domElement); // 添加到dom里
    },
    animate: function() {
      requestAnimationFrame(this.animate); // 循环渲染，产生动画 请求再次执行渲染函数animate
      this.mesh.rotation.x += 0.01; // 每次渲染位置发生改变，从而产生动画
      this.mesh.rotation.y += 0.02; // 每次渲染位置发生改变，从而产生动画
      this.renderer.render(this.scene, this.camera); // 渲染场景和相机
    },
    controls() {
      // var controls = new Three.OrbitControls(this.camera, this.renderer.domElement); //创建控件对象
      // controls.addEventListener("change", this.render); //监听鼠标、键盘事件
    }
  },
  mounted() {
    this.init();
    this.animate();
    // this.controls();
  }
};
</script>
<style scoped lang='scss'>
.three-wapper,
#container {
  height: 100%;
}
</style>