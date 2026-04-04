import React, { createContext, useContext, useEffect, useState } from 'react';
import { DbConnection } from './module_bindings';

const SpacetimeDBContext = createContext<DbConnection | null>(null);

export const SpacetimeDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<DbConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = import.meta.env.VITE_SPACETIME_URL || 'ws://localhost:3000';
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
      {isConnected ? children : (
        <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            Connecting to SpacetimeDB...
          </div>
        </div>
      )}
    </SpacetimeDBContext.Provider>
  );
};

export const useSpacetime = () => {
  const ctx = useContext(SpacetimeDBContext);
  if (!ctx) throw new Error("useSpacetime must be used within SpacetimeDBProvider");
  return ctx;
};

// Quick hook to trigger re-renders on db events
export function useSpacetimeData<T>(selector: (db: DbConnection['db']) => T): T {
    const conn = useSpacetime();
    const [data, setData] = useState<T>(() => selector(conn.db));

    useEffect(() => {
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
