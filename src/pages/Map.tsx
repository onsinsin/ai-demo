import React, { useEffect, useRef, memo, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { message } from 'antd'
import {
  findLayers,
  loadLayers,
  addLayersToMap,
  type LayerSearchResult,
  type LayerLoadResult
} from '../services/layerService'
import LayerList from '../components/LayerList'

// 设置 Mapbox 访问令牌
mapboxgl.accessToken = ACCESS_TOKEN

// 底图图层名称
const BASE_LAYER_NAME = '全国影像'
// 资源图层名称
const RESOURCE_LAYER_NAMES = ['气象传感器', '省', '市', '区']

// 地图组件
const Map: React.FC = memo(() => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [layerData, setLayerData] = useState<{
    baseLayers: LayerSearchResult[]
    resourceLayers: LayerSearchResult[]
    layerResult: LayerLoadResult | null
  } | null>(null)

  /** 地图加载完成回调 **/
  const onMapLoad = async (map: mapboxgl.Map) => {
    console.debug('地图加载完成')

    try {
      // 1. 查找底图图层
      const baseLayers = await findLayers(7, [BASE_LAYER_NAME])
      
      // 2. 查找资源图层
      const resourceLayers = await findLayers(1, RESOURCE_LAYER_NAMES)

      // 3. 合并所有图层 ID
      const allLayerIds = [
        ...baseLayers.map(layer => layer.id),
        ...resourceLayers.map(layer => layer.id)
      ]

      if (allLayerIds.length === 0) {
        message.error('没有找到任何图层')
        return
      }

      // 4. 加载图层详情
      const layerResult = await loadLayers(allLayerIds)

      if (!layerResult) {
        message.error('图层加载失败')
        return
      }

      // 5. 添加图层到地图
      addLayersToMap(map, layerResult)

      // 6. 保存图层数据
      setLayerData({
        baseLayers,
        resourceLayers,
        layerResult
      })

      // 7. 弹出成功提示
      const successCount = baseLayers.length + resourceLayers.length
      const totalCount = 1 + RESOURCE_LAYER_NAMES.length
      
      if (successCount === totalCount) {
        message.success(`所有图层加载成功 (${successCount}/${totalCount})`)
      } else {
        message.warning(`部分图层加载成功 (${successCount}/${totalCount})`)
      }
    } catch (error) {
      console.error('图层加载过程中出错:', error)
      message.error('图层加载失败')
    }
  }

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        style: {
          layers: [],
          sources: {},
          version: 8,
          sprite: 'http://10.11.14.211:30879/oss-static-api/res-static-lib/sprite/bdh-resource-view/2023/icon-layer-sprite',
          glyphs: 'http://10.11.14.211:30879/oss-static-api/res-static-lib/font/bdh-resource-view/2023/public-font-0110-sy/{fontstack}/{range}.pbf',
        },
        center: [130, 48] as [number, number],
        zoom: 6,
        container: mapContainerRef.current,
      })

      mapRef.current = map
      map.on('load', () => onMapLoad(map))

      return () => {
        map.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} className="fullscreen-map" />
      {layerData && (
        <LayerList
          baseLayers={layerData.baseLayers}
          resourceLayers={layerData.resourceLayers}
          layerRelation={layerData.layerResult?.bizGisLayerRelation || {}}
          map={mapRef.current}
        />
      )}
    </div>
  )
})

export default Map