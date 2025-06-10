import {BrowserRouter as Router, Route,  Routes } from "react-router-dom"
import AnimationGenerator from "./pages/AnimationGenrator"


function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/main" element={<AnimationGenerator/>} ></Route>
      </Routes>
    </Router>
  )
}

export default App
