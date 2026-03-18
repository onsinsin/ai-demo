# 地图创建

## 1 资源引入

检查是否已安装依赖库：mapbox-gl

如未安装，则先在当前工程下安装依赖

```
npm install --save-dev mapbox-gl@2.15
```


## 2 创建地图

### 2.1 引入依赖
```typescript
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
```

### 2.2 设置mapbox token

```typescript
// 设置Mapbox访问令牌
mapboxgl.accessToken = 'MAPBOX_ACCESS_TOKEN'
```
### 2.3 准备地图容器
```typescript
  import { useEffect, useRef, memo } from 'react'
  export const DemoMap = memo(() => {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    return (
      <div ref={mapContainerRef} className="map-container" />
    )
  })
```

### 2.4 定义地图参数
```typescript
  const mapOptions = {
    style: {
        layers: [],
        sources: {},
        version: 8,
        sprite: 
          'http://10.11.14.211:30879/oss-static-api/res-static-lib/sprite/bdh-resource-view/2023/icon-layer-sprite',
        glyphs:
          'http://10.11.14.211:30879/oss-static-api/res-static-lib/font/bdh-resource-view/2023/public-font-0110-sy/{fontstack}/{range}.pbf',
    },
    center: [116.404, 39.915],
    zoom: 12
  }
```

### 2.5 创建地图

```typescript
import { useEffect, useRef, memo } from 'react'
import { Button } from 'antd'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// 地图组件
export const DemoMap = memo(() => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map>(null)
  
  /**地图加载完成回调 **/
  const onMapLoad = () => {
      console.debug(' map loaded ')
  }

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        ...mapOptions,
        container: mapContainerRef.current,
      })
      mapRef.current = map;
      map.on('load', onMapLoad);
      return () => map.remove()
    }
  }, [])

  return (
    <div ref={mapContainerRef} className="map-container" />
  )
})
```

## 3 规则
- 地图创建的参数里的style，默认使用2.4里定义的style对象。
- 地图容器必须有固定的高度和宽度，否则地图将无法显示。
- 地图加载完成后，必须调用`map.remove()`移除地图，否则地图将一直存在于内存中。