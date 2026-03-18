import React from 'react'
import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

const Home: React.FC = () => {
  return (
    <Card className="home-card">
      <Title level={2}>欢迎使用 React Mapbox 应用</Title>
      <Paragraph>
        这是一个基于 React 18、Ant Design 和 Mapbox GL 构建的前端应用。
      </Paragraph>
      <Paragraph>
        通过顶部的导航按钮可以切换不同的页面视图。
      </Paragraph>
      <Paragraph>
        本应用展示了如何将 React 路由与 Ant Design 组件集成，提供流畅的单页应用体验。
      </Paragraph>
    </Card>
  )
}

export default Home