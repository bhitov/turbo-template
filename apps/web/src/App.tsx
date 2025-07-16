import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ORPCDemo } from "@/pages/ORPCDemo";

function App(): React.JSX.Element {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orpc" element={<ORPCDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
