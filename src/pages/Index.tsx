import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { ScanPage } from "@/components/ScanPage";
import { BoostPage } from "@/components/BoostPage";
import { ToolsPage } from "@/components/ToolsPage";
import { ActionCenterPage } from "@/components/ActionCenterPage";

type Page = "scan" | "boost" | "tools" | "action-center";

const pageOrder: Page[] = ["scan", "boost", "tools", "action-center"];

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>("scan");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [animKey, setAnimKey] = useState(0);
  const prevIndexRef = useRef(0);

  const handlePageChange = (page: Page) => {
    const newIndex = pageOrder.indexOf(page);
    const oldIndex = prevIndexRef.current;
    setSlideDirection(newIndex > oldIndex ? "right" : "left");
    prevIndexRef.current = newIndex;
    setAnimKey((k) => k + 1);
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "scan": return <ScanPage />;
      case "boost": return <BoostPage />;
      case "tools": return <ToolsPage />;
      case "action-center": return <ActionCenterPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange}>
      <div
        key={animKey}
        className={slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left"}
        style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        {renderPage()}
      </div>
    </Layout>
  );
};

export default Index;
