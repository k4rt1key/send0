import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import HomePage from '@/components/HomePage'
import '@/App.css'

export default function App() {
  return (
    <Router>
        <div
          className="min-h-screen w-full font-2 antialiased"
        >
        <div className="w-full">
          <Routes>
            <Route path="/:name?" element={<HomePage />} />
          </Routes>
        </div>
        <Toaster />
      </div>
    </Router>
  )
}