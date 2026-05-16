import { Routes, Route } from "react-router-dom";
import { AgentProvider } from "./context/AgentContext";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Positions } from "./pages/Positions";
import { Opportunities } from "./pages/Opportunities";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <AgentProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </AgentProvider>
  );
}
