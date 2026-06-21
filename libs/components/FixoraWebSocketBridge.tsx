import useFixoraWebSocket from '../hooks/useFixoraWebSocket';

/** Mount once under ApolloProvider — wires WS events to Apollo refetches. */
const FixoraWebSocketBridge = () => {
	useFixoraWebSocket();
	return null;
};

export default FixoraWebSocketBridge;
