import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import Home from '../features/navigator/components/Home'
import ConversationView from '../features/navigator/components/ConversationView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="navigator" element={<ConversationView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
