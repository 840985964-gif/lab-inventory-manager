import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ReagentLocationsPage from './pages/ReagentLocationsPage'
import ReagentPage from './pages/ReagentPage'
import ConsumablePage from './pages/ConsumablePage'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reagent" element={<ReagentLocationsPage />} />
        <Route path="/reagent/:locationId" element={<ReagentPage />} />
        <Route path="/consumable" element={<ConsumablePage />} />
      </Routes>
    </div>
  )
}

export default App
