# 加载（使用/添加）底图(或资源)图层

## 1 输入

用户需要加载（使用/添加）的底图(或资源)图层名称，可能是一个或者多个。

## 2 执行流程

### 2.1 根据图层名称查找图层id

#### 2.1.1 调用图层查找接口

  接口参数按如下规则传递：

- 当查找底图图层时，tag参数传入7；当查找资源图层时，tag参数传1；

- srsName参数 传入EPSG:3857

#### 2.1.2  在接口返回结果中查找

- 在接口返回的data数组中递归查找label属性匹配的图层节点，并将匹配的记录id、label属性记录下来，汇总到数组中作为查找结果。

示例：查找“气象传感器” 图层，返回结果为

```
[{
  "id" : "81",
  "label" : "气象传感器"
}]
```
- 如有未查询到的图层，需要弹出提示告知用户

### 2.2 根据图层id加载图层详情

调用图层加载接口，接口参数按如下规则传递：

- activities、mapIds传入查找结果中的图层id；

- srid、dynamicParams传默认值

### 2.3 图层加载到地图

取上一步查询结果中的 mapboxStyle 属性，调用mapbox-gl地图的api添加sources和layers

```
/** 图层详情查询结果 */
const { layers, sources } = serviceResult.data.mapboxStyle;
/**add source */
for (let sourceId in sources) {
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, sources[sourceId]);
  }
}
/**add layers */
layers.forEach(layer => {
  if (!map.getLayer(layer.id)) {
    map.addLayer(layer);
  }
})
```

### 2.4 缓存样式结果以备后续使用
查询结果中的 bizGisLayerRelation、mapboxStyle属性，需要缓存下来，后续使用。

## 3 执行规则
-	底图图层、资源图层的加载（使用/添加）的代码逻辑，必须在地图load事件回调中执行;
- 对于底图图层、资源图层，在2.1步骤需要分别进行，传入的tag参数分别为7、1;
-	对于底图图层、资源图层，在2.2步骤必须通过合并图层id，一次操作完成图层加载接口调用和图层的加载;
