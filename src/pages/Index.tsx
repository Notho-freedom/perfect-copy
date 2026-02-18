import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ScanPage } from "@/components/ScanPage";
import { BoostPage } from "@/components/BoostPage";
import { ToolsPage } from "@/components/ToolsPage";
import { ActionCenterPage } from "@/components/ActionCenterPage";

type Page = "scan" | "boost" | "tools" | "action-center";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>("scan");

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === "scan" && <ScanPage />}
      {currentPage === "boost" && <BoostPage />}
      {currentPage === "tools" && <ToolsPage />}
      {currentPage === "action-center" && <ActionCenterPage />}
    </Layout>
  );
};

export default Index;
