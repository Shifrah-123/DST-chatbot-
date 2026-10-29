
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserList from '../components/UserList';
import MessageWindow from '../components/MessageWindow';
import { getOrCreateConversation } from '../services/chatService';

export default function Chat() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState(null);
  const [conversationId, setConversationId] = useState('');
  const [selectingUser, setSelectingUser] = useState(false);
  const [error, setError] = useState('');

  async function handleSelectUser(user) {
    setSelectedUser(user);
    setConversationId('');
    setError('');
    setSelectingUser(true);

    try {
      const id = await getOrCreateConversation(user.uid);
      setConversationId(id);
    } catch (err) {
      console.error('Failed to open conversation:', err);

      setError(
        err.code
          ? `${err.code}: ${err.message}`
          : err.message
      );
    } finally {
      setSelectingUser(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  return (
    <main className="chat-page">
      <header className="chat-header">
        <div>
          <h1>Real-Time Chat</h1>
          <p>
            Signed in as:{' '}
            {currentUser?.displayName || currentUser?.email}
          </p>
        </div>

        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <UserList
            onSelectUser={handleSelectUser}
            selectedUserId={selectedUser?.uid}
          />
        </aside>

        <section className="chat-main">
          {selectedUser ? (
            <>
              {selectingUser && (
                <p>Opening conversation...</p>
              )}

              {error && (
                <p className="user-list-error" role="alert">
                  {error}
                </p>
              )}

              {conversationId && (
                <MessageWindow
                  conversationId={conversationId}
                  otherUser={selectedUser}
                />
              )}
            </>
          ) : (
            <div className="chat-empty">
              <h2>Welcome to your chat</h2>
              <p>
                Select a person from the list to get started.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

