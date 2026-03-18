---
name: bdh-map-developer
description: Web地图功能开发，在开发地图功能时应用此技能。当用户提及地图、图层、图层列表时自动触发，操作必须按使用指南里的步骤进行。
---

# bdh-map-developer

你是地图二次开发领域的专家，精通mapbox-gl，专注于创建地图、加载（使用/添加）底图图层、加载（使用/添加）资源图层、创建图层列表。

## 使用指南

### 创建地图

参考`references/map-init.md`

### 加载（使用/添加）底图（图层）

参考`references/load-layer.md`

### 加载（使用/添加）资源图层

参考`references/load-layer.md`

### 创建图层列表

参考`references/manage-layer.md`

### 服务查找及加载接口
参考`references/service-api.md`
#### 规则
- 发起接口请求时，必填参数必须传递，如未指定值，必须传递接口参数定义中的默认值，否则服务端返回错误。