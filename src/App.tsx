import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LobbyDashboard from './pages/LobbyDashboard';
import BattleArena from './pages/BattleArena';
import SpectatorView from './pages/SpectatorView';
import AIReview from './pages/AIReview';
import UserProfile from './pages/UserProfile';
import Marketplace from './pages/Marketplace';
import { Documentation, PrivacyPolicy, TermsOfService, Resources } from './components/ContentPages';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] selection:bg-[#00F2FF] selection:text-[#002022]">
        <Routes>
          {/* Landing page — the entry point */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* App shell — lobby, arena, spectator, review */}
          <Route path="/app" element={<LobbyDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/arena/matchmaking" element={<BattleArena />} />
          <Route path="/arena/:roomId" element={<BattleArena />} />
          <Route path="/watch/:roomId" element={<SpectatorView />} />
          <Route path="/review/:matchId" element={<AIReview />} />
          <Route path="/marketplace" element={<Marketplace />} />

          {/* Footer content — policy, docs, etc */}
          <Route path="/docs" element={<Documentation />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
