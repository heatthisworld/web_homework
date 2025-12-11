import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;