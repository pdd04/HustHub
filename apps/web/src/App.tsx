import { useState } from "react";
import { SearchPage } from "./pages/SearchPage";
import { DetailPage } from "./pages/DetailPage";
import type { DocumentItem } from "./data/mockDocuments";

export default function App() {
  const [currentDocument, setCurrentDocument] = useState<DocumentItem | null>(null);

  return currentDocument ? (
    <DetailPage document={currentDocument} onBack={() => setCurrentDocument(null)} />
  ) : (
    <SearchPage onSelectDocument={setCurrentDocument} />
  );
}
