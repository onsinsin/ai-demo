import React, { useEffect, useRef, memo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// 设置Mapbox访问令牌
mapboxgl.accessToken = 'MAPBOX_ACCESS_TOKEN'

// 地图组件
const Map: React.FC = memo(() => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  
  /**地图加载完成回调 **/
  const onMapLoad = () => {
    console.debug('地图加载完成')
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
        center: [130, 48] as [number, number], // 设置中心点为130,48
        zoom: 6, // 设置层级为6
        container: mapContainerRef.current,
      })
      map.on('load', onMapLoad)
      
      return () => map.remove()
    }
  }, [])

  return (
    <div ref={mapContainerRef} className="fullscreen-map" />
  )
})

export default Map