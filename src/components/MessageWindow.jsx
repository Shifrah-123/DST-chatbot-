
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  listenToMessages,
  sendMessage,
} from '../services/chatService';

export default function MessageWindow({ conversationId, otherUser }) {
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);
    setError('');

    const unsubscribe = listenToMessages(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Could not load messages.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [conversationId]);

  async function handleSendMessage(event) {
    event.preventDefault();

    if (!messageText.trim() || sending) return;

    const text = messageText;

    setSending(true);
    setError('');

    try {
      await sendMessage(conversationId, text);
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="message-window">
      <header className="message-header">
        <h2>
          {otherUser.displayName || otherUser.email}
        </h2>
        <p>Real-time conversation</p>
      </header>

      <div className="message-list" aria-live="polite">
        {loading && <p>Loading messages...</p>}

        {!loading && messages.length === 0 && (
          <p className="message-empty">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((message) => {
          const isOwnMessage =
            message.senderId === currentUser?.uid;

          return (
            <div
              key={message.id}
              className={`message-row ${
                isOwnMessage ? 'own-message' : 'other-message'
              }`}
            >
              <div className="message-bubble">
                <p>{message.text}</p>
                <small>
                  {isOwnMessage ? 'You' : otherUser.displayName || 'User'}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="message-error" role="alert">
          {error}
        </p>
      )}

      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          aria-label="Message"
          disabled={sending}
        />

        <button
          type="submit"
          disabled={sending || !messageText.trim()}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  );
}
