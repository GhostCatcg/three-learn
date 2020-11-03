import * as THREE from "three"
import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls"
var renderer, camera, control, scene;

var cube

function init() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    document.body.appendChild(renderer.domElement);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.y = 1000;
    camera.position.z = 500;

    control = new OrbitControls(camera, renderer.domElement);
    var light = new THREE.HemisphereLight(0xffffff, 0x444444);

    scene = new THREE.Scene();

    scene.add(light);

    scene.add(new THREE.AxesHelper(10000));

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    })

    loadModel();
}

function loadModel() {
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

}


function render() {

    renderer.render(scene, camera);
    cube.rotation.y += 0.01
    // 做任何事情
    requestAnimationFrame(render);
}

init();
render();
render();