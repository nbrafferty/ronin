import { HashRouter, Routes, Route } from 'react-router-dom'
import { RoleProvider } from './lib/roles'
import { CountsProvider } from './lib/counts'
import { SignOffProvider } from './lib/signoff'
import Home from './pages/Home'
import Planning from './pages/Planning'
import ItemBuilder from './pages/ItemBuilder'
import Counts from './pages/Counts'
import Reconciliation from './pages/Reconciliation'
import Configurations from './pages/Configurations'
import Settlement from './pages/Settlement'
import SettlementStatement from './pages/SettlementStatement'
import VendorPortal from './pages/VendorPortal'
import ManagerOverview from './pages/ManagerOverview'
import Terms from './pages/Terms'

export default function App() {
  return (
    <RoleProvider>
      <CountsProvider>
      <SignOffProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/overview" element={<ManagerOverview />} />
          <Route path="/configurations" element={<Configurations />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/item-builder" element={<ItemBuilder />} />
          <Route path="/counts" element={<Counts />} />
          <Route path="/reconciliation" element={<Reconciliation />} />
          <Route path="/settlement" element={<Settlement />} />
          <Route path="/settlement-statement" element={<SettlementStatement />} />
          <Route path="/vendor-portal" element={<VendorPortal />} />
          <Route path="/artist-portal" element={<VendorPortal />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </HashRouter>
      </SignOffProvider>
      </CountsProvider>
    </RoleProvider>
  )
}
