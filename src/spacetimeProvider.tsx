import React, { createContext, useContext, useEffect, useState } from 'react';
import { DbConnection } from './module_bindings';

const SpacetimeDBContext = createContext<DbConnection | null>(null);

export const SpacetimeDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<DbConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const isProd = import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost');
    const defaultUrl = isProd ? 'wss://testnet.spacetimedb.com' : 'ws://localhost:3000';
    const url = import.meta.env.VITE_SPACETIME_URL || defaultUrl;
    // Initialize token inside localStorage for Auth mapping
    let token = localStorage.getItem('spacetime-token');
    
    // Setup connection
    const conn = DbConnection.builder()
      .withUri(url)
      .withDatabaseName('devduel-db')
      .withToken(token || "")
      .onConnect((connection, remoteIdentity, newToken) => {
        console.log("Connected to SpacetimeDB!");
        setIsConnected(true);
        
        // Save the token issued by the server if we didn't have one
        if (newToken && newToken !== token) {
          localStorage.setItem('spacetime-token', newToken);
        }

        // Generate or fetch logical identity UUID
        let localIdentity = localStorage.getItem('devduel_user_identity');
        if (!localIdentity) {
            localIdentity = `Player_${Math.floor(Math.random() * 90000) + 10000}_${Date.now()}`;
            localStorage.setItem('devduel_user_identity', localIdentity);
        }
        
        // Subscribe to tables
        connection.subscriptionBuilder()
          .onApplied(() => console.log("SpacetimeDB subscription applied!"))
          .subscribe([
              "SELECT * FROM badge",
              "SELECT * FROM user",
              "SELECT * FROM user_badge",
              "SELECT * FROM game_stat",
              "SELECT * FROM match_log",
              "SELECT * FROM leaderboard_entry"
          ]);

        // Trigger createOrUpdateUser
        // Random dummy name just for profile display if new
        const username = localIdentity.split('_')[0] + "_" + localIdentity.split('_')[1];
        connection.reducers.createOrUpdateUser({ identity: localIdentity, username });
      })
      .onDisconnect(() => {
        setIsConnected(false);
        console.log("Disconnected from SpacetimeDB");
      })
      .build();
    
    setConnection(conn);

    return () => {
      conn.disconnect();
    };
  }, []);

  return (
    <SpacetimeDBContext.Provider value={connection}>
      {children}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 px-3 py-1.5 bg-[#1c1b1b]/80 backdrop-blur-md rounded-full border border-yellow-500/30 text-[10px] font-mono text-yellow-500/80 uppercase tracking-widest animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
          Backend Syncing...
        </div>
      )}
    </SpacetimeDBContext.Provider>
  );
};

export const useSpacetime = () => {
  return useContext(SpacetimeDBContext);
};

// Quick hook to trigger re-renders on db events
export function useSpacetimeData<T>(selector: (db: DbConnection['db']) => T, fallback: T = [] as any): T {
    const conn = useSpacetime();
    const [data, setData] = useState<T>(() => (conn ? selector(conn.db) : fallback));

    useEffect(() => {
        if (!conn) return;
        
        // A simple way to re-render when ANY table updates.
        // For production, we'd use useSyncExternalStore or specific table listeners.
        const handleUpdate = () => {
            setData(selector(conn.db));
        };
        const id = setInterval(handleUpdate, 500); // Polling for simplicity since it's local wasm cache
        return () => clearInterval(id);
    }, [conn, selector]);

    return data;
}
