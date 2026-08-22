import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import LandingPage from '../features/marketing/LandingPage'
import ConversationView from '../features/navigator/components/ConversationView'
import Home from '../features/navigator/components/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/navigator" element={<ConversationView />} />
          <Route path="/old" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
