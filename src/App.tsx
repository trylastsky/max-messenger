import { ConnectionForm } from './features/connection/ConnectionForm'
import { ChatScreen } from './features/chat/ChatScreen'
import { useChat } from './context/ChatContext'

function App() {
    const { credentials, connect, disconnect } = useChat()

    if (!credentials) {
        return <ConnectionForm onConnect={connect} />
    }

    return (
        <ChatScreen
            credentials={credentials}
            onDisconnect={disconnect}
        />
    )
}

export default App