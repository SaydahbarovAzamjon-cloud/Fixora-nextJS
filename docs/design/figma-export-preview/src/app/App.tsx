import { useState } from "react";
import TechnicianLayout from "../libs/components/layout/TechnicianLayout";
import type { Page } from "../libs/components/technician/TechnicianSidebar";

// Pages — new structure
import DashboardPage from "../pages/technician/dashboard";

// Remaining screens (not yet migrated to pages/)
import IncomingRequests from "./components/IncomingRequests";
import ActiveJobs from "./components/ActiveJobs";
import Messages from "./components/Messages";
import Notifications from "./components/Notifications";
import PublicProfile from "./components/PublicProfile";
import Analytics from "./components/Analytics";
import Earnings from "./components/Earnings";
import Settings from "./components/Settings";
import ArticleEditor from "./components/ArticleEditor";

const HelpPage = () => (
  <div style={{ padding: 32, color: "#909090", fontSize: 14 }}>Help & Support coming soon…</div>
);

const FULLSCREEN_PAGES: Page[] = ["requests", "jobs", "messages", "settings"];

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":     return <DashboardPage onNavigate={setActivePage} />;
      case "requests":      return <IncomingRequests />;
      case "jobs":          return <ActiveJobs />;
      case "messages":      return <Messages />;
      case "notifications": return <Notifications />;
      case "profile":       return <PublicProfile />;
      case "analytics":     return <Analytics />;
      case "earnings":      return <Earnings />;
      case "settings":      return <Settings />;
      case "articles":      return <ArticleEditor />;
      case "help":          return <HelpPage />;
    }
  };

  return (
    <TechnicianLayout
      activePage={activePage}
      onNavigate={setActivePage}
      fullscreen={FULLSCREEN_PAGES.includes(activePage)}
    >
      {renderPage()}
    </TechnicianLayout>
  );
}
