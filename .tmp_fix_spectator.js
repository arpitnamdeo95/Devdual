const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/SpectatorView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const returnIdx = content.indexOf('  return (\n<div className="min-h-screen');
if (returnIdx === -1) {
  console.log("Could not find return statement");
  process.exit(1);
}

const beforeReturn = content.substring(0, returnIdx);

// We also need to add chat message listeners to useEffect. Let's do that with simple replacing.
let newBeforeReturn = beforeReturn.replace("socket.off('game-end');\n    };", "socket.off('game-end');\n      socket.off('chat-message');\n    };\n  }, [roomId]);\n\n  useEffect(() => {\n    socket.on('chat-message', (data) => {\n      setLiveChat(prev => [...prev, data]);\n    });\n    return () => socket.off('chat-message');\n  }, []);\n\n  useEffect(() => {");

// update the dummy chat
newBeforeReturn = newBeforeReturn.replace("const handleSendMessage = () => {", "const handleSendMessage = (e?: React.FormEvent) => {\n    if (e) e.preventDefault();\n    if (!newMessage.trim()) return;\n    socket.emit('chat-message', { roomId, message: newMessage, user: 'Spectator_' + Math.floor(Math.random() * 1000) });\n    setNewMessage('');\n  };\n\n  /* dummy */\n  const handleSendMessageOld = () => {");

const newJSX = `
  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container flex flex-col h-screen overflow-hidden">
      <AppNavbar />
      <div className="flex flex-1 overflow-hidden pt-16">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden bg-surface-dim relative">
          {/* Header */}
          <header className="h-16 bg-surface border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]"></span>
              <h1 className="font-bold tracking-tight text-lg">LIVE DUEL <span className="text-on-surface-variant font-mono text-sm ml-2">#{roomId?.substring(0, 8) || 'TEST'}</span></h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-lg border border-white/5">
                <Users className="w-4 h-4 text-tertiary" />
                <span className="font-mono font-bold text-sm">{spectatorCount}</span>
              </div>
              <div className={\`font-mono font-black text-xl \${timerColor}\`}>
                {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Editor Area */}
            <div className="flex-1 flex flex-col">
              {status === 'ENDED' && (
                <div className="h-12 bg-primary/20 border-b border-primary/30 flex items-center justify-center text-primary font-bold tracking-widest text-sm z-20">
                  MATCH ENDED — {result?.winnerId === p1?.id ? p1?.name : p2?.name || 'Player'} WON
                </div>
              )}
              
              <div className="flex-1 relative border-b md:border-b-0 md:border-r border-white/5 flex flex-col md:flex-row">
                
                {/* P1 */}
                <div className="flex-1 flex flex-col border-r border-white/5 h-full relative group">
                  <div className="h-10 bg-surface-container flex items-center px-4 justify-between shrink-0">
                    <span className="text-sm font-bold text-primary">{p1?.name || 'Awaiting Player 1'}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant">PLAYER 1</span>
                  </div>
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      defaultLanguage="python"
                      theme="vs-dark"
                      value={codes[p1?.id || ''] || '# Connecting...\\n'}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: { top: 16 }
                      }}
                    />
                  </div>
                </div>

                {/* VS Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-[10px] font-black tracking-widest z-10 shadow-xl overflow-hidden glass">
                  VS
                </div>

                {/* P2 */}
                <div className="flex-1 flex flex-col h-full relative group">
                  <div className="h-10 bg-surface-container flex items-center px-4 justify-between shrink-0">
                    <span className="text-[10px] font-mono text-on-surface-variant">PLAYER 2</span>
                    <span className="text-sm font-bold text-tertiary">{p2?.name || 'Awaiting Player 2'}</span>
                  </div>
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      defaultLanguage="python"
                      theme="vs-dark"
                      value={codes[p2?.id || ''] || '# Connecting...\\n'}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: { top: 16 }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className={\`w-80 bg-surface border-l border-white/5 flex flex-col transition-all duration-300 \${showChat ? 'translate-x-0' : 'translate-x-full absolute right-0 inset-y-0'}\`}>
              <div className="h-12 bg-surface-container flex items-center justify-between px-4 shrink-0 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Live Chat
                </span>
                <button onClick={() => setShowChat(false)} className="md:hidden text-zinc-500 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 code-editor-scrollbar">
                {liveChat.map((msg, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-bold text-primary mr-2 text-[12px]">{msg.user}</span>
                    <span className="text-on-surface/90 text-[13px] leading-relaxed break-words">{msg.message}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 bg-surface-container-low border-t border-white/5 shrink-0 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send message..."
                  className="flex-1 bg-surface-container px-3 py-2 border border-white/5 rounded-lg text-sm focus:outline-none focus:border-primary/50 text-white font-body"
                />
                <button type="submit" className="px-3 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newBeforeReturn + newJSX, 'utf8');
console.log("Updated SpectatorView.tsx successfully.");
