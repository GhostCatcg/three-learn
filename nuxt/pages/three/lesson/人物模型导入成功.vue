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
import * as THREE from "three";
// const GLTFLoader = require("three/examples/jsm/loaders/GLTFLoader")
import { GLTFLoader } from "@/static/three/examples/jsm/loaders/GLTFLoader";
// import  { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from "@/static/three/examples/jsm/controls/OrbitControls";
import {
  CubeTextureLoader,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  MeshPhysicalMaterial,
  MeshLambertMaterial,
  Color,
  RectAreaLight,
  RectAreaLightHelper,
  PointLight,
  Vector2,
  ShaderMaterial
} from "three/build/three.module.js";

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
    init() {
      let container = document.getElementById("container"); // 选中元素
      this.camera = new THREE.PerspectiveCamera( // 透视摄像机
        70,
        container.clientWidth / container.clientHeight,
        0.01,
        10000
      );
      // 透视摄像机
      // 第一个参数是视野角度（FOV）。视野角度就是无论在什么时候，你所能在显示器上看到的场景的范围，它的值是角度单位。
      // 第二个参数是长宽比（aspect ratio）。 也就是你用一个物体的宽除以它的高的值。比如说，当你在一个宽屏电视上播放老电影时，可以看到图像仿佛是被压扁的。
      // 接下来的两个参数是近截面（near）和远截面（far）。 当物体某些部分比摄像机的远截面远或者比近截面近的时候，该这些部分将不会被渲染到场景中。或许现在你不用担心这个值的影响，但未来为了获得更好的渲染性能，你将可以在你的应用程序里去设置它。
      this.camera.position.z = 0.6; // 相机的Z轴
      this.scene = new THREE.Scene(); // 创建场景
      let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2); // 创建大小为0.2的box模型
      let material = new THREE.MeshNormalMaterial(); // 创建材质
      // this.mesh = new THREE.Mesh(geometry, material); // 给模型上材质

      var light = new AmbientLight(0xffffff, 1); // 添加环境光
      this.scene.add(light);

      let directionalLight = new DirectionalLight(0xffffff, 1); // 平行光 1.灯光颜色 2.灯光强度
      directionalLight.position.set(1, 0, 0); // 灯光照射方向 
      this.scene.add(directionalLight);

      let directionalLight1 = new DirectionalLight(0xffffff, 0.5); // 平行光 1.灯光颜色 2.灯光强度
      directionalLight1.position.set(0, 0, 1); // 灯光照射方向 
      this.scene.add(directionalLight1);


      this.scene.add(this.mesh); // 场景添加 带有材质的box模型

      this.renderer = new THREE.WebGLRenderer({ antialias: true }); // 创建渲染器
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      console.log(this.scene, "打印场景");
      container.appendChild(this.renderer.domElement); // 添加到dom里
    },
    animate() {
      // requestAnimationFrame(this.animate); // 循环渲染，产生动画 请求再次执行渲染函数animate
      // this.mesh.rotation.x += 0.01; // 每次渲染位置发生改变，从而产生动画
      // this.mesh.rotation.y += 0.02; // 每次渲染位置发生改变，从而产生动画
      this.renderer.render(this.scene, this.camera); // 渲染场景和相机
    },
    // 控制器
    controls() {
      let _this = this;
      var controls = new OrbitControls(_this.camera, _this.renderer.domElement); //创建控件对象
      console.log(controls);
      controls.addEventListener("change", _this.animate); //监听鼠标、键盘事件   执行动画
    },
    // 加载模型
    loadModel() {
      let _this = this;
      var loader = new GLTFLoader();
      loader.load(
        // "/model/Gold4.glb",
        // "/model/max/1.obj",
        "/model/people.gltf",
        gltf => {
          // let material = new THREE.MeshNormalMaterial(); // 创建材质
          // let mesh = new THREE.Mesh(gltf.scene, material); // 给模型上材质
          // gltf.scene.name = '模型'
          _this.scene.add(gltf.scene);
          // _this.scene.add(mesh);
          // console.log(this.scene,'打印场景')
        },
        undefined,
        function(error) {
          console.error(error);
        }
      );
    }
  },
  mounted() {
    this.init();
    this.animate();
    this.loadModel();
    this.controls();
  }
};
</script>
<style scoped lang='scss'>
.three-wapper,
#container {
  height: 100%;
}
</style>