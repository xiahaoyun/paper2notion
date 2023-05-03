/// <reference types="chrome"/>
import { BrowserRouter as Router, Route, Routes  } from "react-router-dom";
import PaperSearch from "./PaperSearch";
import PaperDetail from "./PaperDetail";
import Settings from "./Settings";
import './App.css'

function App() {


  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path="/index.html" element={<PaperSearch/>} />
        <Route path="/paper/:paperId" element={<PaperDetail/>} />
        <Route path="setting" element={<Settings/>} />
      </Routes>
    </Router>
    </div>
  )
}

export default App
