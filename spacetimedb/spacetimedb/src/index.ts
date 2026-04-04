import { schema, table, t } from 'spacetimedb/server';

const spacetimedb = schema({
  user: table(
    { public: true },
    {
      identity: t.string(), 
      username: t.string(),
      matchesPlayed: t.u32(),
      wins: t.u32(),
    }
  ),

  badge: table(
    { public: true },
    {
      id: t.string(),
      name: t.string(),
      description: t.string(),
    }
  ),

  userBadge: table(
    { public: true },
    {
      userIdentity: t.string(),
      badgeId: t.string(),
      awardedAt: t.u64(),
    }
  ),

  gameStat: table(
    { public: true },
    {
      statId: t.string(),
      value: t.string(),
    }
  ),

  matchLog: table(
    { public: true },
    {
      matchId: t.string(),
      codeUpdates: t.string(), 
      winnerId: t.string(),
      loserId: t.string(),
      timestamp: t.u64(),
    }
  ),

  leaderboardEntry: table(
    { public: true },
    {
      userIdentity: t.string(),
      username: t.string(),
      elo: t.u32(),
    }
  ),
});

export default spacetimedb;

export const init = spacetimedb.init(ctx => {
  const badges = [
    { id: 'first_win', name: 'First Win', description: 'Won your first match' },
    { id: 'win_streak_3', name: 'Hot Streak', description: 'Won 3 matches in a row' },
    { id: 'win_streak_5', name: 'Unstoppable', description: 'Won 5 matches in a row' },
    { id: 'fast_solver', name: 'Speed Demon', description: 'Solved a puzzle in under 2 minutes' },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Passes 100% test cases on first run' },
    { id: 'comeback', name: 'Comeback Kid', description: 'Won after making multiple mistakes' },
    { id: 'grinder', name: 'Grinder', description: 'Played 50+ matches' },
    { id: 'legend', name: 'DevDuel Legend', description: 'Reached top 10 on the Leaderboard' },
  ];
  
  for (const b of badges) {
    ctx.db.badge.insert(b);
  }

  // Initialize stats to 0
  const initialStats = [
    'active_players', 'matches_in_progress', 'matches_per_minute', 
    'average_match_time', 'average_submission_time', 'server_latency', 
    'code_sync_latency', 'total_matches_played'
  ];
  
  for (const stat of initialStats) {
    ctx.db.gameStat.insert({ statId: stat, value: '0' });
  }
});

export const createOrUpdateUser = spacetimedb.reducer(
  { identity: t.string(), username: t.string() },
  (ctx, { identity, username }) => {
    let found = false;
    for (const u of ctx.db.user.iter()) {
      if (u.identity === identity) {
        found = true;
        // SpacetimeDB v2 updates row by deleting and re-inserting, or just leaves it if identity exists
        // we'll just return for now as it's just creation tracking.
        return;
      }
    }
    if (!found) {
      ctx.db.user.insert({ identity, username, matchesPlayed: 0, wins: 0 });
      ctx.db.leaderboardEntry.insert({ userIdentity: identity, username, elo: 1000 });
    }
  }
);

export const recordStat = spacetimedb.reducer(
  { statId: t.string(), value: t.string() },
  (ctx, { statId, value }) => {
    for (const s of ctx.db.gameStat.iter()) {
      if (s.statId === statId) {
        ctx.db.gameStat.delete(s);
      }
    }
    ctx.db.gameStat.insert({ statId, value });
  }
);

export const grantBadge = spacetimedb.reducer(
  { userIdentity: t.string(), badgeId: t.string() },
  (ctx, { userIdentity, badgeId }) => {
    let alreadyHas = false;
    for (const ub of ctx.db.userBadge.iter()) {
      if (ub.userIdentity === userIdentity && ub.badgeId === badgeId) {
        alreadyHas = true;
      }
    }
    if (!alreadyHas) {
      ctx.db.userBadge.insert({ userIdentity, badgeId, awardedAt: BigInt(Date.now()) });
    }
  }
);

export const endMatch = spacetimedb.reducer(
  { matchId: t.string(), codeUpdates: t.string(), winnerId: t.string(), loserId: t.string() },
  (ctx, { matchId, codeUpdates, winnerId, loserId }) => {
    ctx.db.matchLog.insert({
      matchId,
      codeUpdates,
      winnerId,
      loserId,
      timestamp: BigInt(Date.now()),
    });

    // Update stats and leaderboards for winner/loser
    for (const u of ctx.db.user.iter()) {
      if (u.identity === winnerId) {
        ctx.db.user.delete(u);
        ctx.db.user.insert({ ...u, matchesPlayed: u.matchesPlayed + 1, wins: u.wins + 1 });
      }
      if (u.identity === loserId) {
        ctx.db.user.delete(u);
        ctx.db.user.insert({ ...u, matchesPlayed: u.matchesPlayed + 1 });
      }
    }

    for (const l of ctx.db.leaderboardEntry.iter()) {
      if (l.userIdentity === winnerId) {
        ctx.db.leaderboardEntry.delete(l);
        ctx.db.leaderboardEntry.insert({ ...l, elo: l.elo + 15 });
      }
      if (l.userIdentity === loserId) {
        ctx.db.leaderboardEntry.delete(l);
        let newElo = l.elo - 15;
        if (newElo < 0) newElo = 0;
        ctx.db.leaderboardEntry.insert({ ...l, elo: newElo });
      }
    }
  }
);
