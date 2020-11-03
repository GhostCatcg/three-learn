/**
*
* Author: lvgc
* CreatDate: 2020-06-28 15:28:58
*
* Description: 小男孩3D粒子
*
*/

<template>
  <div class="three-wapper">
    <div :id="threeId" @click="handleThree(sex)" class="three-main"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import Stats from "@/assets/three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "@/assets/three/examples/jsm/controls/OrbitControls"; // 引入鼠标控制
// postprocessing 是后期处理模块
import { EffectComposer } from "@/assets/three/examples/jsm/postprocessing/EffectComposer.js"; // 后期处理模块
import { RenderPass } from "@/assets/three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "@/assets/three/examples/jsm/postprocessing/ShaderPass.js";
import { BloomPass } from "@/assets/three/examples/jsm/postprocessing/BloomPass.js";
import { UnrealBloomPass } from "@/assets/three/examples/jsm/postprocessing/UnrealBloomPass.js"; // 后期处理模块
import { FilmPass } from "@/assets/three/examples/jsm/postprocessing/FilmPass.js";
import { FocusShader } from "@/assets/three/examples/jsm/shaders/FocusShader.js";
import { GLTFLoader } from "@/assets/three/examples/jsm/loaders/GLTFLoader"; // 引入模型加载器
import { OBJLoader } from "@/assets/three/examples/jsm/loaders/OBJLoader.js"; // OBJ 加载器
import { DDSLoader } from "@/assets/three/examples/jsm/loaders/DDSLoader.js";
import { DRACOLoader } from "@/assets/three/examples/jsm/loaders/DRACOLoader.js";
export default {
  name: "ThreeBox",
  props: {
    threeId: {
      type: String,
      default: () => {
        return "xxx";
      }
    },
    sex: {
      type: String,
      default: () => {
        return "man";
      }
    }
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      camera: "",
      scene: "",
      renderer: "",
      mesh: "",
      skinMesh: "",
      parent: "",
      meshes: [],
      clonemeshes: [],
      composer: "",
      effectFocus: "",
      clock: new THREE.Clock(), // 该对象用于跟踪时间。如果performance.now可用，则 Clock 对象通过该方法实现，否则回落到使用略欠精准的Date.now来实现。
      stats: "",
      controls: "",
      domWidth: "",
      domHeight: "",
      ele: "",
      raycaster: "", // 点击的光线射线
      mouse: "",
      toggle: 0,
      pointclouds: "",
      pointSize: 0.05
    };
  },
  watch: {
    sex: {
      handler(newVal) {
        // 到时候上面换性别，下面就换模型
        // this.init();
        // this.animate();
      },
      deep: true
    }
  },
  methods: {
    generatePointCloudGeometry(color, width, length) {
      // 几何模型
      var geometry = new THREE.BufferGeometry();
      var numPoints = width * length;

      // 浮点
      var positions = new Float32Array(numPoints * 3);
      var colors = new Float32Array(numPoints * 3);

      var k = 0;

      for (var i = 0; i < width; i++) {
        for (var j = 0; j < length; j++) {
          var u = i / width;
          var v = j / length;
          var x = u - 0.5;
          var y = (Math.cos(u * Math.PI * 4) + Math.sin(v * Math.PI * 8)) / 20;
          var z = v - 0.5;

          positions[3 * k] = x;
          positions[3 * k + 1] = y;
          positions[3 * k + 2] = z;

          var intensity = (y + 0.1) * 5;
          colors[3 * k] = color.r * intensity;
          colors[3 * k + 1] = color.g * intensity;
          colors[3 * k + 2] = color.b * intensity;

          k++;
        }
      }

      //
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.computeBoundingBox();

      return geometry;
    },

    generatePointcloud(color, width, length) {
      // 创建点云 ？

      var geometry = this.generatePointCloudGeometry(color, width, length);
      var material = new THREE.PointsMaterial({
        size: this.pointSize,
        vertexColors: true
      });

      return new THREE.Points(geometry, material);
    },

    generateIndexedPointcloud(color, width, length) {
      var geometry = this.generatePointCloudGeometry(color, width, length);
      var numPoints = width * length;
      var indices = new Uint16Array(numPoints);

      var k = 0;

      for (var i = 0; i < width; i++) {
        for (var j = 0; j < length; j++) {
          indices[k] = k;
          k++;
        }
      }

      // 向可以更高效的向GPU传递数据
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      // 点材质
      var material = new THREE.PointsMaterial({
        size: this.pointSize,
        vertexColors: true
      });
      // 点模型
      return new THREE.Points(geometry, material);
    },

    generateIndexedWithOffsetPointcloud(color, width, length) {
      var geometry = this.generatePointCloudGeometry(color, width, length);
      var numPoints = width * length;
      var indices = new Uint16Array(numPoints);

      var k = 0;

      for (var i = 0; i < width; i++) {
        for (var j = 0; j < length; j++) {
          indices[k] = k;
          k++;
        }
      }

      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      geometry.addGroup(0, indices.length);
      // 点材质
      var material = new THREE.PointsMaterial({
        size: this.pointSize,
        vertexColors: true
      });
      // 点模型
      return new THREE.Points(geometry, material);
    },
    /**
     * 点击事件
     */
    handleThree(sex) {
      // console.log("点击事件");
      this.$emit("manClick", sex);
    },
    init() {
      THREE.Cache.enabled = true; // 开启缓存

      // this.ele = document.querySelector(".three-wapper");
      this.ele = document.querySelector(`#${this.threeId}`);
      let _this = this;
      var container = document.querySelector(`#${this.threeId}`); // 选择元素
      this.camera = new THREE.PerspectiveCamera(
        20,
        this.ele.getBoundingClientRect().width /
          this.ele.getBoundingClientRect().height,
        1,
        50000
      ); // 创建透视摄像机
      //   this.camera.aspect = ele.getBoundingClientRect().width / ele.getBoundingClientRect().height;

      this.scene = new THREE.Scene(); // 新建场景
      // scene.background = new THREE.Color( 0x000104 ); // 数学库里面的构造器Color 给场景背景设置颜色  相当于环境色了吧
      this.scene.fog = new THREE.FogExp2(0x000104, 0.0000675); // 场景里面的

      // 射线hover粒子放大效果

      var width = 80;
      var length = 160;
      var pcBuffer = this.generatePointcloud(
        new THREE.Color(1, 0, 0),
        width,
        length
      );
      pcBuffer.scale.set(5, 10, 10);
      pcBuffer.position.set(-5, 0, 0);
      this.scene.add(pcBuffer);

      //
      var pcIndexed = this.generateIndexedPointcloud(
        new THREE.Color(0, 1, 0),
        width,
        length
      );
      pcIndexed.scale.set(5, 10, 10);
      pcIndexed.position.set(0, 0, 0);
      this.scene.add(pcIndexed);

      var pcIndexedOffset = this.generateIndexedWithOffsetPointcloud(
        new THREE.Color(0, 1, 1),
        width,
        length
      );
      pcIndexedOffset.scale.set(5, 10, 10);
      pcIndexedOffset.position.set(5, 0, 0);
      this.scene.add(pcIndexedOffset);

      this.pointclouds = [pcBuffer, pcIndexed, pcIndexedOffset];

      this.camera.position.set(0, 40, -240); // 设置相机位置

      // this.camera.lookAt({ x: 50, y: 50, z: 50 });
      // console.log(this.camera);

      // var loader = new OBJLoader(); // OBJ加载器
      var loader = new GLTFLoader(); // gltf/glb 加载器

      var dracoLoader = new DRACOLoader(); // 加载glb模型的辅助
      dracoLoader.setDecoderPath("/models/health/js/libs/draco/gltf/");
      loader.setDRACOLoader(dracoLoader);
      loader.setDDSLoader(new DDSLoader());

      var objPath;

      if (this.sex == "woman") {
        objPath = "/models/health/schoolGirl-processed.glb";
      } else {
        objPath = "/models/health/maleStudent-processed.glb";
      }
      // obj转gltf模型命令
      // 全局安装 obj2gltf
      // obj2gltf -i .\maleStudent.obj -o maleStudent.gltf
      // draco 压缩 成glb
      // #全局安装 npm install -g gltf-pipeline
      // #压缩glb文件 -b表示输出glb格式，-d表示压缩
      // gltf-pipeline -i model.glb -b -d
      // #压缩glb文件并将纹理图片分离出来
      // gltf-pipeline -i model.glb -b -d -t
      // #更多参数查阅
      // gltf-pipeline -h

      // 这里要加一个文件加载中的效果
      // var loader = new THREE.FileLoader();

      // //加载一个文本文件，并把结果输出到控制台上
      // loader.load(
      //   // resource URL
      //   "example.txt",

      //   // onLoad回调
      //   function(data) {
      //     // output the text to the console
      //     console.log(data);
      //   },

      //   // onProgress回调
      //   function(xhr) {
      //     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      //   },

      //   // onError回调
      //   function(err) {
      //     console.error("An error happened");
      //   }
      // );

      loader.load(objPath, function(object) {
        // 载入模型 male02.obj 男人模型
        // console.log(object, "模型对象");

        var positions = _this.combineBuffer(object.scene, "position");

        _this.createMesh(positions, _this.scene, 5, 0, 0, 0, 0x46c892, object); // 创建人物粒子效果
      });

      var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4); // 添加环境光
      this.scene.add(ambientLight);

      var pointLight = new THREE.PointLight(0xffffff, 0.8); // 添加点光源
      this.camera.add(pointLight);

      this.renderer = new THREE.WebGLRenderer({ alpha: true }); // alpha 渲染透明
      //   this.renderer = new THREE.WebGLRenderer(); // Three 渲染器  WebGL Render 用WebGL渲染出你精心制作的场景。
      this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
      //   this.renderer.setSize(window.innerWidth, window.innerHeight); // 将输出canvas的大小调整为(width, height)并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小 将updateStyle设置为false以阻止对canvas的样式做任何改变。
      this.renderer.setSize(
        this.ele.getBoundingClientRect().width,
        this.ele.getBoundingClientRect().height
      ); // 将输出canvas的大小调整为(width, height)并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小 将updateStyle设置为false以阻止对canvas的样式做任何改变。
      this.renderer.autoClear = false;
      container.appendChild(this.renderer.domElement); // 页面添加渲染器dom

      this.parent = new THREE.Object3D(); // 这是Three.js中大部分对象的基类，提供了一系列的属性和方法来对三维空间中的物体进行操纵。
      this.parent.position.y = -37;
      this.scene.add(this.parent);

      var axisHelper = new THREE.AxisHelper(30); // 坐标轴线
      // this.scene.add(axisHelper); // 向场景添加坐标轴

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
      // this.parent.add( grid ); // 红色点粒子底盘添加到场景中

      // postprocessing
      var params = {
        exposure: 1,
        bloomStrength: 1,
        bloomThreshold: 0,
        bloomRadius: 0
      };
      var renderModel = new RenderPass(this.scene, this.camera); // 后期处理模块 该通道在指定的场景和相机的基础上渲染出一个新场景
      var effectBloom = new BloomPass(0.75); // 后期处理模块  辉光
      var effectFilm = new FilmPass(0.5, 0.5, 1448, false); // 噪音动画
      var effectFilm = new FilmPass(0, 0, 1448, false); // 噪音动画
      var bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
      ); // UnrealBloomPass通道可实现一个泛光效果。
      bloomPass.threshold = params.bloomThreshold; // 绽放阈值
      bloomPass.strength = params.bloomStrength; // 绽放强度
      bloomPass.radius = params.bloomRadius; // 绽放半径

      this.effectFocus = new ShaderPass(FocusShader);
      this.effectFocus.uniforms["screenWidth"].value =
        this.ele.getBoundingClientRect().width * window.devicePixelRatio;
      this.effectFocus.uniforms["screenHeight"].value =
        this.ele.getBoundingClientRect().height * window.devicePixelRatio;

      this.composer = new EffectComposer(this.renderer); // 效果合成器 后期处理根据它门添加/插入的顺序来执行，最后一个过程会被自动渲染到屏幕上

      // addPass 添加到效果组合器中  将被添加到过程链的过程
      this.composer.addPass(renderModel); // 渲染模型
      this.composer.addPass(effectBloom);
      this.composer.addPass(effectFilm);
      // this.composer.addPass(bloomPass); // 泛光效果
      // this.composer.addPass(this.effectFocus); // 聚焦光 开启之后只会显示聚焦的地方 其他地方渐变消失

      // stats
      this.stats = new Stats(); // 帧速率 模块   需要在渲染里面加上stats.update();
      // container.appendChild(this.stats.dom); // 帧速率添加到左上角

      // 添加添加事件 （光线投射）
      this.raycaster = new THREE.Raycaster(); // 构造函数和对象方法,文档https://blog.csdn.net/qq_30100043/article/details/79054862
      // new Raycaster( origin, direction, near, far );
      // origin — 光线投射的起点向量。
      // direction — 光线投射的方向向量，应该是被归一化的。
      // near — 投射近点，用来限定返回比near要远的结果。near不能为负数。缺省为0。
      // far — 投射远点，用来限定返回比far要近的结果。far不能比near要小。缺省为无穷大。
      this.mouse = new THREE.Vector2();
      window.addEventListener("click", this.onMouseClick, false);
      console.log(this.ele);
      // 监听鼠标移动事件
      this.ele.addEventListener("mousemove", this.onDocumentMouseMove, false);

      window.addEventListener("resize", this.onWindowResize, false); // 监听窗口尺寸改变事件

      this.controls = new OrbitControls(this.camera, this.renderer.domElement); // 创建控件对象
      // controls.addEventListener("change", this.animate()); // 监听鼠标、键盘事件、执行动画
      this.controls.addEventListener("change", () => {
        // console.log(1);
      }); // 监听鼠标、键盘事件、执行动画
      this.controls.enabled = true; // 是否开启鼠标控制
      this.controls.enableDamping = true; // 开启阻尼
      this.controls.dampingFactor = 0.2; // 阻尼惯性

      // this.controls.minPolarAngle =50; //
      // this.controls.maxPolarAngle = 150; //
      // this.controls.minDistance = 250; // 你能够将相机向内移动多少（仅适用于PerspectiveCamera），其默认值为Infinity。
      // this.controls.maxDistance = 300; // 你能够将相机向外移动多少（仅适用于PerspectiveCamera），其默认值为Infinity。
    },

    onWindowResize() {
      // 屏幕尺寸
      // aspect 视锥宽高比
      this.camera.aspect =
        this.ele.getBoundingClientRect().width /
        this.ele.getBoundingClientRect().height;

      //   this.camera.lookAt(0, 300, 0); // 相机继续看向场景中央

      this.camera.updateProjectionMatrix(); // 更新直角投影模型，在参数改变时候被调用

      //   this.camera.lookAt(this.scene.position); // 相机继续看向场景中央
      //   this.camera.lookAt(this.parent.position); // 相机继续看向场景中央

      this.renderer.setSize(
        this.ele.getBoundingClientRect().width,
        this.ele.getBoundingClientRect().height
      ); // 将输出canvas的大小调整为(width, height)并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小 将updateStyle设置为false以阻止对canvas的样式做任何改变。
      this.composer.setSize(
        this.ele.getBoundingClientRect().width,
        this.ele.getBoundingClientRect().height
      ); // 将输出canvas的大小调整为(width, height)并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小 将updateStyle设置为false以阻止对canvas的样式做任何改变。

      this.effectFocus.uniforms["screenWidth"].value =
        this.ele.getBoundingClientRect().width * window.devicePixelRatio;
      this.effectFocus.uniforms["screenHeight"].value =
        this.ele.getBoundingClientRect().height * window.devicePixelRatio;
    },

    combineBuffer(model, bufferName) {
      //   console.log(model, bufferName);
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
      // 这个类用于存储与BufferGeometry相关联的 attribute（例如顶点位置向量，面片索引，法向量，颜色值，UV坐标以及任何自定义 attribute ）。 利用 BufferAttribute，可以更高效的向GPU传递数据。
      return new THREE.BufferAttribute(combined, 3);
    },
    /**
     * threejs 鼠标移动事件，通过发射射线 计算出最后点的那个三维模型
     */
    onDocumentMouseMove(event) {
      // console.log(event)
      event.preventDefault();

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      console.log(this.mouse.x, this.mouse.y);
    },
    /**
     * threejs 点击事件，通过发射射线 计算出最后点的那个三维模型
     */
    onMouseClick(event) {
      //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // console.log(this.scene, "场景");
      // console.log(this.scene.children, "场景孩子");
      // 获取raycaster直线和所有模型相交的数组集合
      var intersects = this.raycaster.intersectObjects(this.scene.children);

      // console.log(intersects);

      //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
      for (var i = 0; i < intersects.length; i++) {
        intersects[i].object.material.color.set(0xff0000);
      }
    },

    // 创建人物 粒子模型
    //           位置      场景   缩放   x  y  z   颜色  对象
    createMesh(positions, scene, scale, x, y, z, color, object) {
      var geometry = new THREE.BufferGeometry();
      // 添加与当前几何体有关的 attribute
      geometry.setAttribute("position", positions.clone()); // 克隆当前的 BufferGeometry。
      geometry.setAttribute("initialPosition", positions.clone()); // 克隆当前的 BufferGeometry。

      geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

      this.mesh = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({ size: .3, color: color }) // 点的大小
      ); // 点的渲染模式  渲染点的材质
      this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = scale;

      var lineMesh = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: color,
          linewidth: 1,
          linecap: "round", //ignored by WebGLRenderer
          linejoin: "round" //ignored by WebGLRenderer
        })
      );
      lineMesh.scale.x = lineMesh.scale.y = lineMesh.scale.z = scale;

      // this.skinMesh = new THREE.MeshMatcapMaterial(

      // let meshbase = new THREE.MeshBasicMaterial({
      // let meshbase = new THREE.MeshMatcapMaterial({
      //   color: color,
      //   transparent: true,
      //   opacity: 1
      // });
      var meshbase = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 1
      }); // 创建材质 Phong网格材质

      var light = new THREE.AmbientLight(0x404040); // soft white light
      // meshbase.wireframe = true;
      // meshbase.alphaMap = 0.3;
      this.skinMesh = new THREE.Mesh(geometry, meshbase);
      this.skinMesh.scale.x = this.skinMesh.scale.y = this.skinMesh.scale.z = scale;

      // this.parent.add(lineMesh); // 线条
      this.parent.add(this.mesh);
      // this.parent.add(this.skinMesh); // 皮肤

      this.scene.add(light);
    },
    animate() {
      // console.log("相机", this.camera);
      // console.log('相机quanbu', camera.rotation)
      let _this = this;
      requestAnimationFrame(_this.animate); // 这个函数不能加（） 不然就等于无限调用了
      this.render();
      //   this.stats.update(); // 帧速率的实时更新
      this.controls.update(); // 开启控制阻尼，必须使用update
    },

    // 渲染后期效果和粒子显示/隐藏动画
    render() {
      var delta = 10 * this.clock.getDelta();
      delta = delta < 2 ? delta : 2;

      // 场景旋转
      this.parent.rotation.y += 0.1 * delta; // 场景旋转

      // for ( var j = 0; j < clonemeshes.length; j ++ ) {

      // 	var cm = clonemeshes[ j ];
      // 	cm.mesh.rotation.y += - 0.1 * delta * cm.speed;
      // }

      // raycaster.setFromCamera(this.mouse, this.camera);
      // var intersections = raycaster.intersectObjects(pointclouds);
      // intersection = intersections.length > 0 ? intersections[0] : null;

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

        for (var i = 0; i < count; i++) {
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
  },
  beforeDestroy() {
    // this.dispose()
  }
};
</script>
<style lang='scss'>
.three-wapper {
  height: 100%;
  background: #000;
  .three-main {
    width: 100%;
    height: 100%;
    canvas {
      // border:1px solid #fff;
      &:focus {
        outline: none;
      }
    }
  }
}
</style>