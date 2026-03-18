import React from 'react'
import { Layout, Button, Card, Radio } from 'antd'
import { MenuFoldOutlined } from '@ant-design/icons'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Map from './pages/Map'
import './styles/App.scss'

const { Header, Content } = Layout

const AppContent: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleRadioChange = (e: any) => {
    navigate(e.target.value)
  }

  return (
    <Layout className="app-layout">
      <Layout>
        <Header className="header">
          <Button
            type="text"
            icon={<MenuFoldOutlined />}
            onClick={() => {}}
            className="trigger"
          />
          <span className="title">React Mapbox App</span>
        </Header>
        <Content className="content">
          <Card className="router-card">
            <div className="radio-container">
              <Radio.Group
                value={location.pathname}
                onChange={handleRadioChange}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="/">首页</Radio.Button>
                <Radio.Button value="/map">地图</Radio.Button>
              </Radio.Group>
            </div>
            <div className="router-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<Map />} />
              </Routes>
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App