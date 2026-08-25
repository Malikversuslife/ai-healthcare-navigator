import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '../features/marketing/LandingPage'
import Navigator from '../features/navigator/components/Navigator'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/navigator" element={<Navigator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
