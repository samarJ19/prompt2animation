import {BrowserRouter as Router, Route,  Routes } from "react-router-dom"
import AnimationGenerator from "./pages/AnimationGenrator"
import { DarkModeProvider } from "./context/DarkmodeContext"


function App() {
  

  return (
    <DarkModeProvider>
    <Router>
      <Routes>
        <Route path="/main" element={<AnimationGenerator/>} ></Route>
      </Routes>
    </Router>
    </DarkModeProvider>
  )
}

export default App
