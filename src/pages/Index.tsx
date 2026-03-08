import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { ScanPage } from "@/components/ScanPage";
import { BoostPage } from "@/components/BoostPage";
import { ToolsPage } from "@/components/ToolsPage";
import { ActionCenterPage } from "@/components/ActionCenterPage";
import { SettingsPage } from "@/components/SettingsPage";
import { DriverHistoryPage } from "@/components/DriverHistoryPage";
import { WhatsNewPage } from "@/components/WhatsNewPage";

type Page = "scan" | "boost" | "tools" | "action-center";
type SubPage = "settings" | "history" | "whats-new" | null;

const pageOrder: Page[] = ["scan", "boost", "tools", "action-center"];

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>("scan");
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [animKey, setAnimKey] = useState(0);
  const prevIndexRef = useRef(0);

  const handlePageChange = (page: Page) => {
    setSubPage(null);
    const newIndex = pageOrder.indexOf(page);
    const oldIndex = prevIndexRef.current;
    setSlideDirection(newIndex > oldIndex ? "right" : "left");
    prevIndexRef.current = newIndex;
    setAnimKey((k) => k + 1);
    setCurrentPage(page);
  };

  const handleMenuNavigate = (action: "settings" | "history" | "whats-new" | null) => {
    if (action) {
      setSubPage(action);
      setAnimKey((k) => k + 1);
    }
  };

  const handleSubPageBack = () => {
    setSubPage(null);
    setAnimKey((k) => k + 1);
  };

  const renderPage = () => {
    if (subPage === "settings") return <SettingsPage onBack={handleSubPageBack} />;
    if (subPage === "history") return <DriverHistoryPage onBack={handleSubPageBack} />;
    if (subPage === "whats-new") return <WhatsNewPage onBack={handleSubPageBack} />;

    switch (currentPage) {
      case "scan": return <ScanPage />;
      case "boost": return <BoostPage />;
      case "tools": return <ToolsPage />;
      case "action-center": return <ActionCenterPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange} onMenuNavigate={handleMenuNavigate}>
      <div
        key={animKey}
        className={subPage ? "animate-fade-in" : (slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left")}
        style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        {renderPage()}
      </div>
    </Layout>
  );
};

export default Index;
