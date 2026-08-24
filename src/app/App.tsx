import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import LandingPage from '../features/marketing/LandingPage'
import Navigator from '../features/navigator/components/Navigator'
import Home from '../features/navigator/components/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/navigator" element={<Navigator />} />
        <Route element={<Layout />}>
          <Route path="/old" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
