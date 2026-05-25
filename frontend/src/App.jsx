import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ReagentPage from './pages/ReagentPage'
import ConsumablePage from './pages/ConsumablePage'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reagent" element={<ReagentPage />} />
        <Route path="/consumable" element={<ConsumablePage />} />
      </Routes>
    </div>
  )
}

export default App
