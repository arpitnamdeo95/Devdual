import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

interface GlobalState {
  players: any[];
  matches: any[];
  badges: any[];
  playerBadges: any[];
  gameStats: any[];
  inventory: any[];
}

const SupabaseContext = createContext<GlobalState | null>(null);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('DEBUG: SupabaseProvider rendering');
  const [state, setState] = useState<GlobalState>({
    players: [],
    matches: [],
    badges: [],
    playerBadges: [],
    gameStats: [],
    inventory: [],
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let localIdentity = localStorage.getItem('devduel_user_identity');
    if (!localIdentity) {
        localIdentity = `Player_${Math.floor(Math.random() * 90000) + 10000}_${Date.now()}`;
        localStorage.setItem('devduel_user_identity', localIdentity);
    }

    const fetchAll = async () => {
      const [
        { data: players },
        { data: matches },
        { data: badges },
        { data: playerBadges },
        { data: gameStats },
        { data: inventory }
      ] = await Promise.all([
        supabase.from('dd_players').select('*'),
        supabase.from('dd_matches').select('*'),
        supabase.from('dd_badges').select('*'),
        supabase.from('dd_player_badges').select('*'),
        supabase.from('dd_game_stats').select('*'),
        supabase.from('dd_inventory').select('*')
      ]);

      setState({
        players: players || [],
        matches: matches || [],
        badges: badges || [],
        playerBadges: playerBadges || [],
        gameStats: gameStats || [],
        inventory: inventory || [],
      });
      setIsConnected(true);

      // Create "anonymous" player if necessary (since we are not using full Auth here to match the current experience)
      const { data: me } = await supabase.from('dd_players').select('id, username').eq('username', localIdentity).single();
      if (!me) {
        const username = localIdentity.split('_')[0] + "_" + localIdentity.split('_')[1];
        await supabase.from('dd_players').insert({ username });
        // re-fetch after insert
        const { data: newPlayers } = await supabase.from('dd_players').select('*');
        setState(s => ({ ...s, players: newPlayers || [] }));
      }
    };

    fetchAll();

    // Subscribe to changes on all relevant tables
    const sub = supabase
      .channel('public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dd_players' }, () => {
        supabase.from('dd_players').select('*').then(({ data }: any) => setState(s => ({ ...s, players: data || [] })));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dd_matches' }, () => {
        supabase.from('dd_matches').select('*').then(({ data }: any) => setState(s => ({ ...s, matches: data || [] })));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dd_player_badges' }, () => {
        supabase.from('dd_player_badges').select('*').then(({ data }: any) => setState(s => ({ ...s, playerBadges: data || [] })));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dd_game_stats' }, () => {
        supabase.from('dd_game_stats').select('*').then(({ data }: any) => setState(s => ({ ...s, gameStats: data || [] })));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dd_inventory' }, () => {
        supabase.from('dd_inventory').select('*').then(({ data }: any) => setState(s => ({ ...s, inventory: data || [] })));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  return (
    <SupabaseContext.Provider value={state}>
      {children}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 px-3 py-1.5 bg-[#1c1b1b]/80 backdrop-blur-md rounded-full border border-blue-500/30 text-[10px] font-mono text-blue-500/80 uppercase tracking-widest animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          Supabase Syncing...
        </div>
      )}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  return useContext(SupabaseContext);
};

// Generic selector hook for convenience
export function useSupabaseData<T>(selector: (state: GlobalState) => T, fallback: T = [] as any): T {
  const state = useSupabase();
  return state ? selector(state) : fallback;
}
