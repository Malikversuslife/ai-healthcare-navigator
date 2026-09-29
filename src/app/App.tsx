import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigator from '../features/navigator/components/Navigator'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigator />} />
        <Route path="/navigator" element={<Navigator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
