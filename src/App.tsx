import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LobbyDashboard from './pages/LobbyDashboard';
import BattleArena from './pages/BattleArena';
import SpectatorView from './pages/SpectatorView';
import AIReview from './pages/AIReview';
import UserProfile from './pages/UserProfile';
import Marketplace from './pages/Marketplace';
import HypergraphArena from './pages/HypergraphArena';
import { Documentation, PrivacyPolicy, TermsOfService, Resources } from './components/ContentPages';
import { SupabaseProvider } from './supabaseProvider';
import Achievements from './pages/Achievements';
import Dashboard from './pages/Dashboard';
import MatchHistory from './pages/MatchHistory';
import Leaderboard from './pages/Leaderboard';
import BossSelection from './pages/BossSelection';
import BossArena from './pages/BossArena';
import LiveMatches from './pages/LiveMatches';

function App() {
  return (
    <SupabaseProvider>
      <Router>
        <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] selection:bg-[#00F2FF] selection:text-[#002022]">
          <Routes>
            {/* Landing page — the entry point */}
            <Route path="/" element={<LandingPage />} />

            {/* App shell — lobby, arena, spectator, review */}
            <Route path="/app" element={<LobbyDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/arena/matchmaking" element={<BattleArena />} />
            <Route path="/arena/hypergraph" element={<HypergraphArena />} />
            <Route path="/arena/:roomId" element={<BattleArena />} />
            <Route path="/watch/:roomId" element={<SpectatorView />} />
            <Route path="/live" element={<LiveMatches />} />
            <Route path="/review/:matchId" element={<AIReview />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/hypergraph" element={<HypergraphArena />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<MatchHistory />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/boss-select" element={<BossSelection />} />
            <Route path="/boss-arena/:bossId" element={<BossArena />} />

            {/* Footer content — policy, docs, etc */}
            <Route path="/docs" element={<Documentation />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </div>
      </Router>
    </SupabaseProvider>
  );
}

export default App;
