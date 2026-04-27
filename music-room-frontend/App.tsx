import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './routes/LandingPage'
import { CreateRoomPage } from './routes/CreateRoomPage'
import { RoomPage } from './routes/RoomPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/r/:roomCode" element={<RoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
