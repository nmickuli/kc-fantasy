import { Route, Routes } from 'react-router-dom';
import Welcome from '@/screens/Welcome';
import TeamName from '@/screens/TeamName';
import SelectTeam from '@/screens/SelectTeam';
import PlayerPicker from '@/screens/PlayerPicker';
import PlayerProfile from '@/screens/PlayerProfile';
import Home from '@/screens/Home';
import Rules from '@/screens/Rules';
import Help from '@/screens/Help';
import TeamView from '@/screens/TeamView';

function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-on-surface p-8">
      <h1 className="font-display text-4xl uppercase mb-4">Not found</h1>
      <p className="font-body text-muted">No route matched.</p>
    </main>
  );
}

export default function App() {
  // Constrain the app to a mobile-shaped column. On wider viewports (e.g. a
  // desktop browser), the body's swirl/teal bg shows on the sides — a faux
  // "device frame" effect. The 420px max keeps the design honest at the
  // resolution it was drawn for in Figma (375px width).
  return (
    <div className="max-w-[420px] mx-auto min-h-screen relative">
      <Routes>
        <Route path="/"                          element={<Welcome />} />
        <Route path="/team-name"                 element={<TeamName />} />
        <Route path="/select-team"               element={<SelectTeam />} />
        <Route path="/picker/:section/:position" element={<PlayerPicker />} />
        <Route path="/player/:playerId"          element={<PlayerProfile />} />
        <Route path="/home"                      element={<Home />} />
        <Route path="/team-view"                 element={<TeamView />} />
        <Route path="/rules"                     element={<Rules />} />
        <Route path="/help"                      element={<Help />} />
        <Route path="*"                          element={<NotFound />} />
      </Routes>
    </div>
  );
}
