// inputs {—}, does {оболочка: Topbar + Rail + маршруты 11 экранов + Clawd}, returns {App}
import { Route, Routes } from 'react-router-dom'
import { Topbar } from './shell/Topbar'
import { Rail } from './shell/Rail'
import { ClawdDefs, useClawdRoamer } from './components/Clawd'
import Dashboard from './screens/Dashboard'
import Championship from './screens/Championship'
import Fantasy from './screens/Fantasy'
import Predict from './screens/Predict'
import Profiles from './screens/Profiles'
import Weekend from './screens/Weekend'
import League from './screens/League'
import { Favorites, Live, Model, Paddock, Strategy } from './screens/Stubs'

export default function App() {
  useClawdRoamer()
  return (
    <>
      <ClawdDefs />
      <Topbar />
      <Rail />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/weekend" element={<Weekend />} />
          <Route path="/live" element={<Live />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/fantasy" element={<Fantasy />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/league" element={<League />} />
          <Route path="/championship" element={<Championship />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/paddock" element={<Paddock />} />
          <Route path="/model" element={<Model />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </>
  )
}
