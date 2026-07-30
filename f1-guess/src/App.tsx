import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { SoloPage } from './pages/SoloPage'
import { OnlinePage } from './pages/OnlinePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/solo" element={<SoloPage />} />
        <Route path="/online" element={<OnlinePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
