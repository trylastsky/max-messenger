import { useState } from 'react'
import { ConnectionForm } from './features/connection/ConnectionForm'
import { ChatScreen } from './features/chat/ChatScreen'
import type { GreenApiCredentials } from './types/greenApi'

function App() {
    const [credentials, setCredentials] = useState<GreenApiCredentials | null>(() => {
        const saved = localStorage.getItem('max_messenger_creds')
        return saved ? JSON.parse(saved) : null
    })

    const handleConnect = (value: GreenApiCredentials) => {
        localStorage.setItem('max_messenger_creds', JSON.stringify(value))
        setCredentials(value)
    }

    const handleDisconnect = () => {
        localStorage.removeItem('max_messenger_creds')
        localStorage.removeItem('max_messenger_active_chat')
        setCredentials(null)
    }

    if (!credentials) {
        return <ConnectionForm onConnect={handleConnect} />
    }

    return (
        <ChatScreen
            credentials={credentials}
            onDisconnect={handleDisconnect}
        />
    )
}

export default App