import TechnicianSidebar, { type Page } from "../technician/TechnicianSidebar";
import Header from "../../../app/components/Header";

interface TechnicianLayoutProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
  fullscreen?: boolean;
}

export default function TechnicianLayout({
  activePage,
  onNavigate,
  children,
  fullscreen = false,
}: TechnicianLayoutProps) {
  return (
    <div
      style={{
        background: "#0A0A0A",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <TechnicianSidebar activePage={activePage} onNavigate={onNavigate} />
      <Header activePage={activePage} onNavigate={onNavigate} />

      <main
        style={{
          marginLeft: 240,
          paddingTop: 60,
          minHeight: "100vh",
          overflowY: fullscreen ? "hidden" : "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
