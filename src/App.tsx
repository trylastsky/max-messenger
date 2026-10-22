
import { useState } from 'react'
import { ConnectionForm } from './features/connection/ConnectionForm'
import { ChatScreen } from './features/chat/ChatScreen'
import type { GreenApiCredentials } from './types/greenApi'

function App() {
  const [credentials, setCredentials] =
    useState<GreenApiCredentials | null>(null)

  if (!credentials) {
    return (
      <ConnectionForm
        onConnect={(value) => setCredentials(value)}
      />
    )
  }

  return (
    <ChatScreen
      credentials={credentials}
      onDisconnect={() => setCredentials(null)}
    />
  )
}

export default App
