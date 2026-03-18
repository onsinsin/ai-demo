# 服务接口定义

## 1. 图层查找接口
接口地址：http://127.0.0.1/api/geospatial-api/openapi/lowCode/layer/list
请求方式：GET
Content-Type：application/json

### 1.1. 接口描述
加载所有的图层服务信息

### 1.2. 入参说明
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| tag | string | 是 | 可选值为[7,1]; 7=底图，1=其他 | 1 |
| srsName | string | 是 | 坐标系EPSG编码，可选值为"EPSG:3857"、"EPSG:4326" | EPSG:3857 |

### 1.3 权限认证

接口请求的header里需要添加认证参数：

```
Access-Token = eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzOTA5MSwwNjQ4N2ZhMGIyYTc0ZmUyYTUzYTcwYWY4MmI2YWY3YyxiZGgtbWljcm9mcm9udC1tYWluIiwiaWF0IjoxNzczNzk3MTc1LCJzdWIiOiIiLCJpc3MiOiIgeHh4eC5jb20iLCJleHAiOjE4Njg0MDUxNzV9.T7cNBLzayexYpCurL73hqGYmDm_nf5U5_-1Bsv3fDxk
```



### 1.4. 响应字段说明

#### 1.4.1 基础响应结构
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | number | 状态码，0=成功 |
| msg | string | 提示信息 |
| success | boolean | 是否成功 |
| data | array[LayerNode] | 图层节点数组 |

#### 1.4.2 LayerNode 属性说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 节点id |
| label | string | 节点标题 |
| children | string | 用户ID |

### 1.5 请求示例
#### 1.5.1 请求成功

##### 请求参数

```
{
	"tag": 7,
	"srsName": EPSG:3857
}
```
##### 响应结果

```json
{
  "code": 0,
  "success": true,
  "msg": "success",
  "data": []
}
```
#### 1.5.2 失败示例

##### 请求参数

```
{
	"tag": 0,
	"srsName": EPSG:3857
}
```

##### 响应结果

```json
{
  "code": -1,
  "success": false,
  "msg": "系统出错",
  "data": null
}
```


## 2. 图层加载接口
接口地址：http://127.0.0.1/api/geospatial-api/openapi/lowCode/lowCodeMapStyle
请求方式：POST
Content-Type：application/json

### 2.1. 接口描述
批量加载所有的图层样式信息，用于地图渲染

### 2.2. 入参说明
| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| activities | string[] | 是 | 图层id数组 | ["10"]                                            |
| mapIds | string[] | 是 | 图层id数组，与activities一致 | ["10"] |
| srid | string | 是 | 坐标系，默认传"EPSG:3857" | "EPSG:3857" |
| dynamicParams | object | 是 | 动态参数 | { "year": 2022,  "orgCode": "86"} |
| dynamicParams.orgCode | string | 是 | 组织机构， 默认传"86" | "86" |
| dynamicParams.year | number | 是 | 年份，默认传2022 | 2022 |

### 2.3 权限认证

接口请求的header里需要添加认证参数：

```
Access-Token = eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzOTA5MSwwNjQ4N2ZhMGIyYTc0ZmUyYTUzYTcwYWY4MmI2YWY3YyxiZGgtbWljcm9mcm9udC1tYWluIiwiaWF0IjoxNzczNzk3MTc1LCJzdWIiOiIiLCJpc3MiOiIgeHh4eC5jb20iLCJleHAiOjE4Njg0MDUxNzV9.T7cNBLzayexYpCurL73hqGYmDm_nf5U5_-1Bsv3fDxk
```



### 2.4. 响应字段说明

#### 2.4.1 基础响应结构
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | number | 状态码，0=成功 |
| msg | string | 提示信息 |
| success | boolean | 是否成功 |
| data | LayerResult | 图层信息集合 |

#### 2.4.2 LayerResult属性说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| mapboxStyle | MapboxStyle | 可直接用于mapboxgl加载         |
| bizGisLayerRelation | Map<string, string[]> | 图层id与mapbox layerId映射表 |

#### 2.4.3 MapboxStyle属性说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| sprite | string | mapbox雪碧图url |
| glyphs | string | mapbox字体url |
| sources | Object | mapbox数据源 |
| layers | Array | mapbox图层 |
| version | number | mapbox 样式规范版本 |

### 2.5 请求示例
#### 2.5.1 请求成功

##### 请求参数

```
{
	"activities": ["10007"],
	"mapIds": ["10007"],
	"dynamicParams": {
      "year": 2022,
      "orgCode": "86"
    },
	"srid": EPSG:3857
}
```
##### 响应结果

```json
{
  "code": 0,
  "success": true,
  "msg": "success",
  "data": {
     "bizGisLayerRelation": { 
         "10007": ["3139", "3032"]
     },
     "mapboxStyle": {
         "version": 8,
         "glyphs": "/oss-static-api/res-static-lib/font/bdh-resource-view/2023/public-font-0110-sy/{fontstack}/{range}.pbf",
         "sprite": "/oss-static-api/res-static-lib/sprite/bdh-resource-view/2023/icon-layer-sprite",
         "layers": [],
         "sources": {}
     }
  }
}
```
#### 2.5.2 失败示例

##### 请求参数

```
{
	"activities": ["10007"],
	"mapIds": ["10007"],
	"srid": EPSG:3857
}
```

##### 响应结果

```json
{
  "code": -1,
  "success": false,
  "msg": "系统出错",
  "data": null
}
```