import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Planning from './pages/Planning'
import ItemBuilder from './pages/ItemBuilder'
import Counts from './pages/Counts'
import Settlement from './pages/Settlement'
import SettlementStatement from './pages/SettlementStatement'
import ArtistPortal from './pages/ArtistPortal'
import ManagerOverview from './pages/ManagerOverview'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/overview" element={<ManagerOverview />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/item-builder" element={<ItemBuilder />} />
        <Route path="/counts" element={<Counts />} />
        <Route path="/settlement" element={<Settlement />} />
        <Route path="/settlement-statement" element={<SettlementStatement />} />
        <Route path="/artist-portal" element={<ArtistPortal />} />
      </Routes>
    </BrowserRouter>
  )
}
