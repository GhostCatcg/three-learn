 **three** - 模型转换
# WEBGL 模型格式转换


## 1 OBJ转换为GLTF
### 安装obj2gltf
> npm install obj2gltf
### 使用obj2gltf
> obj2gltf -i ./model.obj -o model.gltf


## 2 GLTF转换为GLB

### 安装gltf-pipeline
> npm install gltf-pipeline
### 使用gltf-pipeline
> gltf-pipeline -i model.gltf -o model.glb -d
