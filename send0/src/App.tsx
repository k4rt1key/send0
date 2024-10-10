import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import HomePage from '@/components/HomePage'
import '@/App.css'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen w-full font-2 antialiased"  style={{
           backgroundImage: "url('https://res.cloudinary.com/dkc3qcuuk/image/upload/v1728559796/winhcvsknji6sjwrxtxv.avif')",
           backgroundColor: 'rgba(0, 0, 0, 0.7)',
           backgroundBlendMode: 'overlay'
         }}>
        <div className="container w-full">
          <Routes>
            <Route path="/:name?" element={<HomePage />} />
          </Routes>
        </div>
        <Toaster />
      </div>
    </Router>
  )
}