import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { MapProvider } from "./map/MapContext";
import MapView from "./map/MapView";
import MapAgent from "./copilot/MapAgent";

const RUNTIME_URL =
  import.meta.env.VITE_COPILOTKIT_RUNTIME_URL ?? "http://localhost:4000/copilotkit";

export default function App() {
  return (
    <CopilotKit runtimeUrl={RUNTIME_URL} useSingleEndpoint>
      <MapProvider>
        <div className="app">
          <MapView />
          <MapAgent />
          <CopilotSidebar
            instructions="你是地图大屏助手，帮助用户检索地名地址、把结果上图、并控制地图视野定位。"
            labels={{
              title: "地图助手",
              initial: "你好，我可以帮你检索地名地址、把结果上图并控制地图视野。试试问：帮我找一下北京的故宫",
            }}
            defaultOpen
            clickOutsideToClose={false}
          />
        </div>
      </MapProvider>
    </CopilotKit>
  );
}
