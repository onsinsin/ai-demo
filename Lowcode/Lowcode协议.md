# 阿里巴巴 LowcodeEngine 协议规范

## 1. 协议概述

**LowcodeEngine 搭建协议**（Lowcode Engine Schema）是阿里巴巴低代码引擎的核心标准，用于描述页面、组件、数据、逻辑和样式的完整结构。该协议是一个标准的 JSON 对象，遵循 **“版本 + 组件树 + 元数据”** 的顶层结构。

AI Agent 在生成或解析低代码页面时，必须严格遵循此结构，以确保页面能在 LowcodeEngine 运行时（Renderer）中正确渲染和执行。

---

## 2. 完整 Schema 根结构

一个标准的 LowcodeEngine 页面 Schema 包含以下顶级字段：

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| **version** | String | ✅ | 协议版本号，通常为 `"1.0.0"`。 |
| **componentTree** | Array | ✅ | **核心**。组件树列表，通常包含一个根节点（Page）。支持多根节点（用于片段或弹窗）。 |
| **componentsMap** | Array | ❌ | 组件映射表，声明页面中使用的组件及其来源（npm 包、本地物料等）。 |
| **dataSource** | Array | ❌ | 页面级数据源定义（API、静态数据等）。 |
| **state** | Object | ❌ | 页面级状态定义（响应式数据）。 |
| **methods** | Object | ❌ | 页面级方法定义（JS 函数字符串）。 |
| **lifeCycles** | Object | ❌ | 生命周期钩子（如 `mounted`, `updated`）。 |
| **config** | Object | ❌ | 页面配置信息（如标题、描述、布局模式等）。 |
| **meta** | Object | ❌ | 元数据（如作者、创建时间、修改记录等）。 |

### 2.1 根结构示例

```json
{
  "version": "1.0.0",
  "componentTree": [
    {
      "componentName": "Page",
      "props": {},
      "children": []
    }
  ],
  "componentsMap": [],
  "state": {},
  "dataSource": [],
  "methods": {},
  "lifeCycles": {},
  "config": {},
  "meta": {}
}
```

---

## 3. 核心字段详解

### 3.1 version (版本号)
- **类型**: `String`
- **说明**: 标识协议版本，用于兼容性处理。
- **示例**: `"1.0.0"`

### 3.2 componentTree (组件树)
- **类型**: `Array<Object>`
- **说明**: 页面组件的层级结构列表。通常第一个元素是根节点 `Page`。
- **结构**: 每个节点是一个组件描述对象（见第 4 节）。

```json
"componentTree": [
  {
    "componentName": "Page",
    "props": { "className": "home" },
    "children": [
      {
        "componentName": "Header",
        "props": { "title": "欢迎" }
      }
    ]
  }
]
```

### 3.3 componentsMap (组件映射)
- **类型**: `Array<Object>`
- **说明**: 声明页面中使用的组件来源，帮助运行时加载正确的组件库。
- **字段**:
  - `componentName`: 组件名称。
  - `package`: npm 包名（可选）。
  - `version`: 包版本（可选）。
  - `exportName`: 导出名称（可选，默认为组件名）。
  - `subName`: 子组件名（可选，如 `Table.Column`）。

```json
"componentsMap": [
  {
    "package": "biz-materials",
    "destructuring": true,
    "subName": "",
    "main": "src/index.tsx",
    "exportName": "Page",
    "componentName": "Page",
    "version": "1.150.2"
  },
  {
    "package": "biz-materials",
    "version": "1.150.2",
    "exportName": "LayoutBlock",
    "main": "src/index.tsx",
    "destructuring": true,
    "subName": "",
    "componentName": "LayoutBlock"
  },
  {
    "package": "biz-materials",
    "destructuring": true,
    "subName": "",
    "main": "src/index.tsx",
    "exportName": "Map2dMapbox",
    "componentName": "Map2dMapbox",
    "version": "1.150.2"
  }
]
```

### 3.4 state (状态管理)
- **类型**: `Object`
- **说明**: 定义页面的响应式状态，可在组件中通过 `${state.key}` 引用。
- **示例**:
```json
"state": {
  "count": 0,
  "user": {
    "name": "Alice",
    "age": 25
  },
  "list": [1, 2, 3]
}
```

### 3.5 dataSource (数据源)
- **类型**: `Array<Object>`
- **说明**: 定义页面所需的数据来源，支持 API 请求、静态数据、常量等。
- **关键字段**:
  - `id`: 数据源唯一标识。
  - `type`: 类型 (`fetch`, `static`, `constant` 等)。
  - `options`: 配置项（如 URL、Method、Headers 等）。
  - `data`: 静态数据（当 type 为 static 时）。

```json
"dataSource": [
  {
    "id": "userInfo",
    "type": "fetch",
    "options": {
      "method": "GET",
      "url": "/api/user/info",
      "params": {
        "id": "${state.userId}"
      }
    }
  },
  {
    "id": "staticList",
    "type": "static",
    "data": [
      { "label": "选项1", "value": "1" },
      { "label": "选项2", "value": "2" }
    ]
  }
]
```

### 3.6 methods (方法定义)
- **类型**: `Object`
- **说明**: 定义页面级的 JavaScript 方法，值为函数字符串。
- **调用方式**: 在事件中使用 `this.methods.methodName()`。

```json
"methods": {
  "handleClick": "function() { console.log('clicked'); this.setState({ count: this.state.count + 1 }); }",
  "fetchData": "async function() { const res = await fetch('/api/data'); return res.json(); }"
}
```

### 3.7 lifeCycles (生命周期)
- **类型**: `Object`
- **说明**: 定义页面生命周期钩子，值为函数字符串。
- **常用钩子**: `mounted`, `updated`, `unmounted`。

```json
"lifeCycles": {
  "mounted": "function() { console.log('页面已挂载'); this.methods.fetchData(); }",
  "updated": "function() { console.log('页面已更新'); }"
}
```

### 3.8 config (页面配置)
- **类型**: `Object`
- **说明**: 页面的元配置，如标题、描述、布局模式等。
- **示例**:
```json
"config": {
  "title": "用户管理页",
  "description": "用于管理用户信息的页面",
  "layout": "fixed",
  "css": ".custom-class { color: red; }"
}
```

### 3.9 meta (元数据)
- **类型**: `Object`
- **说明**: 用于记录页面的附加信息，如作者、创建时间、版本历史等。
- **示例**:
```json
"meta": {
  "author": "AI-Agent",
  "createdAt": "2026-03-26T10:00:00Z",
  "updatedAt": "2026-03-26T15:00:00Z",
  "version": "1.0.1"
}
```

---

## 4. 组件节点结构 (Component Node)

`componentTree` 中的每个节点都遵循以下结构：

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| **componentName** | String | ✅ | 组件名称（需与 `componentsMap` 或内置组件匹配）。 |
| **id** | String | ✅ | 组件唯一标识字符串 |
| **props** | Object | ❌ | 组件属性配置。 |
| **children** | Array/Object | ❌ | 子节点（支持单个对象或数组）。 |
| **condition** | String | ❌ | 条件渲染表达式（如 `"${state.visible}"`）。 |
| **loop** | Object | ❌ | 循环渲染配置。 |
| **events** | Object | ❌ | 事件绑定（如 `onClick`, `onChange`）。 |
| **style** | Object | ❌ | 内联样式（可写在 props.style 或独立字段）。 |
| **className** | String | ❌ | CSS 类名（可写在 props.className 或独立字段）。 |
| **ref** | String | ❌ | 组件引用标识。 |

### 4.1 数据绑定 (Data Binding)
在 props 中使用 ${} 语法引用 state 或 dataSource 中的数据。
```json
{
  "componentName": "Input",
  "props": {
    "value": "${state.value}"
  }
}
```

### 4.2 循环渲染 (loop) 结构
```json
"loop": {
  "data": "${dataSource.list.data}",
  "item": "item",
  "index": "idx"
}
```


### 4.3 事件绑定 (events) 结构
```json
"events": {
  "onClick": "this.methods.handleClick()",
  "onChange": "this.setState({ value: event.target.value })"
}
```

### 4.4 属性(props)结构

| 参数	| 说明	| 类型 |	支持变量 | 默认值	| 备注 |
| :--: | :--: | :--: | :--: | :--: | :--: |
| id | 	组件 ID	| String	| 是	| -	| 系统属性 |
| className | 组件样式类名	| String	| 是	| -	| 系统属性，支持变量表达式 |
| style | 组件内联样式	| Object	| 是	| -	| 系统属性，单个内联样式属性值 |
| ref	| 组件 ref 名称 |	String	| 是	| -	| 可通过 this.$(ref) 获取组件实例 |
| extendProps | 组件继承属性	| 变量	| 是	| -	| 仅支持变量绑定，常用于继承属性对象 |
| ... | 组件私有属性	| -	| -	| -	| - |


---

## 5. 组件说明

### 5.1 概览
- Page: 页面的根容器，负责承载整个页面的布局、状态和数据
- LayoutBlock: 块级容器，用于承载其他组件
- Map2dMapbox: 2D地图组件


### 5.2 Page 组件

#### 5.2.1 组件特性
- **根节点标识**: `componentName` 必须为 `"Page"`。
- **全局管理**: 定义全页共享的 `state` (状态), `dataSource` (数据源), `methods` (方法)。

#### 5.2.2 节点详细结构

```json
{
  "componentName": "Page",
  "props": {
    "className": "page-container",
    "style": {
      "minHeight": "100vh",
      "display": "flex",
      "flexDirection": "column"
    }
  },
  "state": {
    "loading": false,
    "formData": {}
  },
  "dataSource": [],
  "methods": {
    "handleSubmit": "function() { console.log('提交数据', this.state.formData); }"
  },
  "children": [
    // 页面内容组件...
  ]
}

```

#### 5.2.3 组件props说明

| 参数	| 说明	| 类型 | 默认值	| 备注 |
| :--: | :--: | :--: | :--: | :--: |
| dragType | 拖拽类型 | String | free | 自由布局/流式布局 |

### 5.3 LayoutBlock 组件

#### 5.3.1 组件特性
- **根节点标识**: `componentName` 必须为 `"LayoutBlock"`。

#### 5.3.2 节点详细结构

```json
{
  "componentName": "LayoutBlock",
  "id": "node_ocmn76ylqm29",
  "props": {
    "style": {
      "width": "100%",
      "height": "60px",
      "position": "absolute",
      "left": 0,
      "top": 0,
      "backgroundColor": "rgba(242,235,235,0.66)",
      "zIndex": 2
    },
    "dataLoadStatus": {
      "isEmpty": false,
      "isLoading": false,
      "error": ""
    },
    "ref": "layoutblock-abeb44e8"
  },
  "hidden": false,
  "title": "",
  "isLocked": false,
  "condition": true,
  "conditionGroup": "",
  "loopArgs": [
    null,
    null
  ]
}
```

#### 5.3.3 组件props说明

| 参数	| 说明	| 类型 | 默认值	| 备注 |
| :--: | :--: | :--: | :--: | :--: |
|  |      |      |        |      |

### 5.4 Map2dMapbox 组件

#### 5.4.1 组件特性
- **根节点标识**: `componentName` 必须为 `"Map2dMapbox"`。
- 用于渲染二维交互式地图

#### 5.4.2 节点详细结构

```json
{
  "componentName": "Map2dMapbox",
  "id": "node_ocmn2lvf441",
  "props": {
    "toolBar": {
      "list": [],
      "topDistance": "7.8%"
    },
    "legendConfig": {
      "layout": "horizontal",
      "placement": "right"
    },
    "disableLocalBasicMap": false,
    "layerList": {
      "defaultLegendEnabledOnAdd": false,
      "remoteSenseList": [],
      "layerResourceType": "featureLayer",
      "showSettingPanel": false,
      "list": [],
      "disableLocal": false,
      "layerRemoteSenseType": "featureLayer",
      "remoteSenseAllowNoSelect": false,
      "remoteSenseStyle": "common",
      "templateLayerType": "resource",
      "remoteSenseShowNodeList": true,
      "isFilterLayer": false,
      "remoteSenseShowStaticChart": true,
      "remoteSensePlayerType": "cards",
      "remoteSensePlayerBottomInterval": "10px",
      "remoteSenseAutoSelect": true
    },
    "style": {
      "top": 0,
      "left": 0,
      "width": "100%",
      "position": "absolute",
      "height": "100%"
    },
    "basicMap": "10008",
    "basicInfo": {
      "coordinate": "EPSG:3857",
      "maxZoom": 19.9,
      "minZoom": 0,
      "zoom": 10,
      "pitch": 45,
      "projection": "mercator",
      "containerId": "mapboxMap",
      "centerType": "self"
    }
  },
  "condition": true,
  "hidden": false,
  "isLocked": false,
  "conditionGroup": "",
  "title": ""
}
```

#### 5.4.3 组件props说明

| 参数	| 说明	| 类型 | 默认值	| 备注 |
| :--: | :--: | :--: | :--: | :--: |
| basicInfo | 基本参数 | IConfigBasicInfo | {} | 地图中心点、级别等参数 |
| basicMap | 底图服务id | String | 10008 |      |

- IConfigBasicInfo 结构

| 属性名称    | 说明                      | 属性类型  | 默认值    |
| ----------- | ------------------------- | --------- | --------- |
| coordinate  | 坐标系                    | `string`  | EPSG:3857 |
| centerType  | 地图中心点类型            | `string`  | self      |
| pitch       | 俯仰角                    | `number`  | 45        |
| projection  | 投影方式                  | `string`  | mercator  |
| fog         | 雾效                      | `any`     |           |
| lon         | 经度                      | `number`  |           |
| lat         | 纬度                      | `number`  |           |
| zoom        | 缩放级别                  | `number?` | 10        |
| orgCodeInfo | 组织机构编码              | `string`  |           |
| minZoom     | 地图最小缩放等级          | `number`  | 0         |
| maxZoom     | 地图最大缩放等级          | `number`  | 19.9      |
| containerId | 地图 id，用于区分地图实例 | `string`  | mapboxMap |

---

## 6. 完整页面 Schema 示例

以下是一个包含所有核心字段的完整页面示例：

```json

{
  "version": "1.1",
  "componentsMap": [
    {
      "package": "biz-materials",
      "version": "1.150.2",
      "exportName": "Page",
      "main": "src/index.tsx",
      "destructuring": true,
      "subName": "",
      "componentName": "Page"
    },
    {
      "package": "biz-materials",
      "version": "1.150.2",
      "exportName": "LayoutBlock",
      "main": "src/index.tsx",
      "destructuring": true,
      "subName": "",
      "componentName": "LayoutBlock"
    }
  ],
  "componentsTree": [
    {
      "componentName": "Page",
      "id": "node_dockcviv8fo1",
      "props": {
        "orgCodeInfo": "86",
        "ref": "outerView",
        "defaultYear": 2024,
        "style": {
          "overflow": "hidden",
          "height": "100vh"
        },
        "theme": "dark",
        "dragType": "free",
        "previewType": "cover",
        "__events": {
          "eventList": [
            {
              "template": "onDefaultYearChange(year){this.setState({year: year})}",
              "name": "onDefaultYearChange",
              "disabled": true
            }
          ],
          "eventDataList": [
            {
              "name": "onDefaultYearChange",
              "type": "componentEvent",
              "relatedEventName": "setYear"
            }
          ]
        },
        "canvasSize": {
          "width": 1920,
          "height": 1080
        }
      },
      "css": "body {\n  font-size: 12px;\n}\n\n.button {\n  width: 100px;\n  color: #ff00ff\n}\n\n@font-face {\n  font-family: 'UISDCBiaoTiHei';\n  src: url('/oss-static-api/resource-view/suihua/UISDC-BiaoTiHei.ttf') format('truetype');\n  font-style: normal;\n  font-weight: normal;\n}",
      "fileName": "/",
      "hidden": false,
      "docId": "doclaqkk3b9",
      "methods": {
        "setYear": {
          "type": "JSFunction",
          "value": "function setYear(year) {\n  this.setState({\n    year\n  });\n}"
        }
      },
      "conditionGroup": "",
      "title": "",
      "lifeCycles": {
        "componentWillUnmount": {
          "type": "JSFunction",
          "value": "function componentWillUnmount() {\n  console.log('will unmount');\n}"
        },
        "componentDidMount": {
          "type": "JSFunction",
          "value": "function componentDidMount() {\n  console.log('did mount');\n}"
        }
      },
      "condition": true,
      "isLocked": false,
      "state": {
        "year": {
          "type": "JSExpression",
          "value": "2023"
        }
      },
      "dataSource": {
        "list": [
          {
            "shouldFetch": {
              "type": "JSFunction",
              "value": "function() { \n  console.log('should fetch.....');\n  return true; \n}"
            },
            "options": {
              "headers": {},
              "method": "GET",
              "isCors": true,
              "params": {},
              "uri": "mock/info.json",
              "timeout": 5000
            },
            "id": "info",
            "type": "fetch",
            "isInit": true
          }
        ]
      },
      "children": [
        {
          "componentName": "LayoutBlock",
          "id": "node_ocmn76ylqm29",
          "props": {
            "style": {
              "width": "100%",
              "height": "60px",
              "position": "absolute",
              "left": 0,
              "top": 0,
              "backgroundColor": "rgba(242,235,235,0.66)",
              "zIndex": 2
            },
            "dataLoadStatus": {
              "isEmpty": false,
              "isLoading": false,
              "error": ""
            },
            "ref": "layoutblock-abeb44e8"
          },
          "hidden": false,
          "title": "",
          "isLocked": false,
          "condition": true,
          "conditionGroup": "",
          "loopArgs": [
            null,
            null
          ]
        }
      ]
    }
  ],
  "i18n": {
    "en-US": {
      "i18n-jwg27yo3": "Doctor {name}",
      "i18n-jwg27yo4": "Hello "
    },
    "zh-CN": {
      "i18n-jwg27yo3": "{name} 博士",
      "i18n-jwg27yo4": "你好 "
    }
  }
}
```
