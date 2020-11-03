/**
*
* Author: lvgc
* CreatDate: 2020-06-15 14:35:48
*
* Description: 粒子效果
*
*/
<template>
  <div class="three-wapper">
    <div id="container"></div>
  </div>
</template>

<script type="module">
import * as THREE from "three";
import Stats from "@/assets/three/examples/jsm/libs/stats.module.js";

import { OrbitControls } from "@/assets/three/examples/jsm/controls/OrbitControls"; // 引入鼠标控制

// postprocessing 是后期处理模块
import { EffectComposer } from "@/assets/three/examples/jsm/postprocessing/EffectComposer.js"; // 后期处理模块
import { RenderPass } from "@/assets/three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "@/assets/three/examples/jsm/postprocessing/ShaderPass.js";
import { BloomPass } from "@/assets/three/examples/jsm/postprocessing/BloomPass.js";
import { FilmPass } from "@/assets/three/examples/jsm/postprocessing/FilmPass.js";
import { FocusShader } from "@/assets/three/examples/jsm/shaders/FocusShader.js";
import { GLTFLoader } from "@/assets/three/examples/jsm/loaders/GLTFLoader"; // 引入模型加载器
import { OBJLoader } from "@/assets/three/examples/jsm/loaders/OBJLoader.js"; // OBJ 加载器

// import {
//   CubeTextureLoader,
//   PerspectiveCamera,
//   Scene,
//   WebGLRenderer,
//   AmbientLight,
//   DirectionalLight,
//   MeshPhysicalMaterial,
//   MeshLambertMaterial,
//   Color,
//   RectAreaLight,
//   RectAreaLightHelper,
//   PointLight,
//   Vector2,
//   ShaderMaterial
// } from "three/build/three.module.js";

export default {
  name: "ThreeBox",
  data() {
    return {
      publicPath: process.env.BASE_URL,
      camera: "",
      scene: "",
      renderer: "",
      mesh: "",
      parent: "",
      meshes: [],
      clonemeshes: [],
      composer: "",
      effectFocus: "",
      clock: new THREE.Clock(), // 该对象用于跟踪时间。如果performance.now可用，则 Clock 对象通过该方法实现，否则回落到使用略欠精准的Date.now来实现。
      stats: ""
    };
  },
  methods: {
    init() {
      let _this = this;
      var container = document.querySelector("#container"); // 选择元素

      this.camera = new THREE.PerspectiveCamera(
        20,
        window.innerWidth / window.innerHeight,
        1,
        50000
      ); // 创建透视摄像机
      this.camera.position.set(-0.71, 300.12, -247); // 设置相机位置
      //   this.camera.rotation.set(0, 0, 0); // 设置相机位置

      this.scene = new THREE.Scene(); // 新建场景
      // scene.background = new THREE.Color( 0x000104 ); // 数学库里面的构造器Color 给场景背景设置颜色  相当于环境色了吧
      this.scene.fog = new THREE.FogExp2(0x000104, 0.0000675); // 场景里面的

      var loader = new OBJLoader(); // OBJ加载器

      loader.load("/man02.obj", function(object) {
        // 载入模型 male02.obj 男人模型
        var positions = _this.combineBuffer(object, "position");
        _this.createMesh(positions, _this.scene, 5, 0, 0, 0, 0x1761e9); // 创建人物粒子效果
      });

      //   this.renderer = new THREE.WebGLRenderer({ alpha: true }); // Three 渲染器  WebGL Render 用WebGL渲染出你精心制作的场景。
      this.renderer = new THREE.WebGLRenderer(); // Three 渲染器  WebGL Render 用WebGL渲染出你精心制作的场景。
      this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
      this.renderer.setSize(window.innerWidth, window.innerHeight); // 将输出canvas的大小调整为(width, height)并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小 将updateStyle设置为false以阻止对canvas的样式做任何改变。
      this.renderer.autoClear = false;
      container.appendChild(this.renderer.domElement); // 页面添加渲染器dom

      this.parent = new THREE.Object3D(); // 这是Three.js中大部分对象的基类，提供了一系列的属性和方法来对三维空间中的物体进行操纵。
      this.scene.add(this.parent);
      console.log(this.parent, "基类");
      this.camera.lookAt(this.parent.position); // 相机继续看向场景中央

      // 一个用于显示点的类。 由WebGLRenderer渲染的点使用 gl.POINTS。
      // Points( geometry : Geometry, material : Material )
      // 设置点和添加材质
      // 红色粒子点
      var grid = new THREE.Points(
        new THREE.PlaneBufferGeometry(15000, 15000, 64, 64),
        new THREE.PointsMaterial({ color: 0xff0000, size: 10 })
      );
      grid.position.y = -400;
      grid.rotation.x = -Math.PI / 2;
      // parent.add( grid ); // 红色点粒子底盘添加到场景中

      // postprocessing

      var renderModel = new RenderPass(this.scene, this.camera); // 后期处理模块 该通道在指定的场景和相机的基础上渲染出一个新场景
      var effectBloom = new BloomPass(0.75); // 后期处理模块  辉光
      //   var effectFilm = new FilmPass(0.5, 0.5, 1448, false); // 噪音动画
      var effectFilm = new FilmPass(0, 0, 1448, false); // 噪音动画

      this.effectFocus = new ShaderPass(FocusShader);

      this.effectFocus.uniforms["screenWidth"].value =
        window.innerWidth * window.devicePixelRatio;
      this.effectFocus.uniforms["screenHeight"].value =
        window.innerHeight * window.devicePixelRatio;

      this.composer = new EffectComposer(this.renderer); // 效果合成器 后期处理根据它门添加/插入的顺序来执行，最后一个过程会被自动渲染到屏幕上

      // addPass 添加到效果组合器中  将被添加到过程链的过程
      this.composer.addPass(renderModel); // 渲染模型
      this.composer.addPass(effectBloom);
      this.composer.addPass(effectFilm);
      // composer.addPass( effectFocus ); // 聚焦光 开启之后只会显示聚焦的地方 其他地方渐变消失

      //stats
      this.stats = new Stats(); // 帧速率 模块   需要在渲染里面加上stats.update();
      container.appendChild(this.stats.dom); // 添加到左上角

      window.addEventListener("resize", this.onWindowResize, false); // 监听窗口尺寸改变事件

      var controls = new OrbitControls(this.camera, this.renderer.domElement); // 创建控件对象
      controls.addEventListener("change", this.animate()); // 监听鼠标、键盘事件、执行动画
    },

    onWindowResize() {
      // 屏幕尺寸

      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      //   this.camera.lookAt(this.scene.position); // 相机继续看向场景中央
      this.camera.lookAt(this.parent.position); // 相机继续看向场景中央

      this.renderer.setSize(window.innerWidth, window.innerHeight); // 渲染器窗口resize  要不然模型就匾了
      this.composer.setSize(window.innerWidth, window.innerHeight); // 效果合成器resize  要不然效果就错位了

      this.effectFocus.uniforms["screenWidth"].value =
        window.innerWidth * window.devicePixelRatio;
      this.effectFocus.uniforms["screenHeight"].value =
        window.innerHeight * window.devicePixelRatio;
    },

    combineBuffer(model, bufferName) {
      console.log(model, bufferName);
      let count = 0;
      // THREE.Scene.Add：用于向场景中添加对象
      // THREE.Scene.Remove：用于移除场景中的对象
      // THREE.Scene.children：用于获取场景中所有的子对象列表
      // THREE.Scene.traverse：用于操作场景中的所有对象
      model.traverse(function(child) {
        if (child.isMesh) {
          var buffer = child.geometry.attributes[bufferName];

          count += buffer.array.length;
        }
      });

      var combined = new Float32Array(count);

      let offset = 0;

      model.traverse(function(child) {
        if (child.isMesh) {
          var buffer = child.geometry.attributes[bufferName];

          combined.set(buffer.array, offset);
          offset += buffer.array.length;
        }
      });

      return new THREE.BufferAttribute(combined, 3);
    },

    // 创建人物 粒子模型
    //                     位置      场景   缩放   x  y  z   颜色
    createMesh(positions, scene, scale, x, y, z, color) {
      var geometry = new THREE.BufferGeometry();
      // 添加与当前几何体有关的 attribute
      geometry.setAttribute("position", positions.clone()); // 克隆当前的 BufferGeometry。
      geometry.setAttribute("initialPosition", positions.clone()); // 克隆当前的 BufferGeometry。

      geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

      var clones = [
        [6000, 0, -4000],
        [5000, 0, 0],
        [1000, 0, 5000],
        [1000, 0, -5000],
        [4000, 0, 2000],
        [-4000, 0, 1000],
        [-5000, 0, -5000],
        [0, 0, 0]
      ];

      // for ( var i = 0; i < clones.length; i ++ ) {

      // 	var c = ( i < clones.length - 1 ) ? 0x252525 : color;

      // 	mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size: 3, color: c } ) ); // 点的渲染模式  渲染点的材质
      // 	mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

      // 	mesh.position.x = x + clones[ i ][ 0 ];
      // 	mesh.position.y = y + clones[ i ][ 1 ];
      // 	mesh.position.z = z + clones[ i ][ 2 ];

      // 	parent.add( mesh );

      // 	clonemeshes.push( { mesh: mesh, speed: 0.5 + Math.random() } );

      // }

      this.mesh = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({ size: 0.3, color: color }) // 点的大小
      ); // 点的渲染模式  渲染点的材质
      this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = scale;

      // mesh.position.x = x + clones[ i ][ 0 ];
      // mesh.position.y = y + clones[ i ][ 1 ];
      // mesh.position.z = z + clones[ i ][ 2 ];

      this.parent.add(this.mesh);

      this.clonemeshes.push({ mesh: this.mesh, speed: 0.5 + Math.random() });

      this.meshes.push({
        mesh: this.mesh,
        verticesDown: 0,
        verticesUp: 0,
        direction: 0,
        speed: 15,
        delay: Math.floor(200 + 200 * Math.random()),
        start: Math.floor(100 + 200 * Math.random())
      });
    },
    animate() {
    //   console.log("相机", this.camera);
      // console.log('相机quanbu', camera.rotation)
      let _this = this;
      requestAnimationFrame(_this.animate); // 这个函数不能加（） 不然就等于无限调用了
      this.render();
      this.stats.update(); // 帧速率的实时更新
    },

    // 渲染后期效果和粒子显示/隐藏动画
    render() {
      var delta = 10 * this.clock.getDelta();
      delta = delta < 2 ? delta : 2;

      // 场景旋转
      // parent.rotation.y += - 0.02 * delta; // 场景旋转

      // for ( var j = 0; j < clonemeshes.length; j ++ ) {

      // 	var cm = clonemeshes[ j ];
      // 	cm.mesh.rotation.y += - 0.1 * delta * cm.speed;

      // }

      for (var j = 0; j < this.meshes.length; j++) {
        var data = this.meshes[j];
        var positions = data.mesh.geometry.attributes.position;
        var initialPositions = data.mesh.geometry.attributes.initialPosition;

        var count = positions.count;

        if (data.start > 0) {
          data.start -= 1;
        } else {
          if (data.direction === 0) {
            data.direction = -1;
          }
        }

        for (var i = 0; i > count; i++) {
          // 把 i < count  改为 i > count 先去掉粒子显示隐藏效果
          // 让粒子升起来 或者 降下去  类似一个出生/消失的效果
          var px = positions.getX(i);
          var py = positions.getY(i);
          var pz = positions.getZ(i);

          // falling down 降下
          if (data.direction < 0) {
            if (py > 0) {
              positions.setXYZ(
                i,
                px + 1.5 * (0.5 - Math.random()) * data.speed * delta,
                py + 3.0 * (0.25 - Math.random()) * data.speed * delta,
                pz + 1.5 * (0.5 - Math.random()) * data.speed * delta
              );
            } else {
              data.verticesDown += 1;
            }
          }

          // rising up 升起
          if (data.direction > 0) {
            var ix = initialPositions.getX(i);
            var iy = initialPositions.getY(i);
            var iz = initialPositions.getZ(i);

            var dx = Math.abs(px - ix);
            var dy = Math.abs(py - iy);
            var dz = Math.abs(pz - iz);

            var d = dx + dy + dx;

            if (d > 1) {
              positions.setXYZ(
                i,
                px -
                  ((px - ix) / dx) *
                    data.speed *
                    delta *
                    (0.85 - Math.random()),
                py -
                  ((py - iy) / dy) * data.speed * delta * (1 + Math.random()),
                pz -
                  ((pz - iz) / dz) * data.speed * delta * (0.85 - Math.random())
              );
            } else {
              data.verticesUp += 1;
            }
          }
        }

        // all vertices down  所有顶点向下
        if (data.verticesDown >= count) {
          if (data.delay <= 0) {
            data.direction = 1;
            data.speed = 5;
            data.verticesDown = 0;
            data.delay = 320;
          } else {
            data.delay -= 1;
          }
        }

        // all vertices up   所有顶点向上
        if (data.verticesUp >= count) {
          if (data.delay <= 0) {
            data.direction = -1;
            data.speed = 15;
            data.verticesUp = 0;
            data.delay = 120;
          } else {
            data.delay -= 1;
          }
        }

        positions.needsUpdate = true;
      }

      this.composer.render(0.01); // 效果合成器渲染
    }
  },
  mounted() {
    this.init();
    this.animate();
    // this.loadModel();
    // this.controls();
  },
  beforeDestroy() {}
};
</script>
<style scoped lang='scss'>
.three-wapper,
#container {
  height: 100%;
}
</style>