
import { useEffect, useState } from 'react';
import { getOtherUsers } from '../services/chatService';

export default function UserList({ onSelectUser, selectedUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError('');

        const result = await getOtherUsers();

        if (active) {
          setUsers(result);
        }
      } catch (err) {
        console.error('Failed to load users:', err);

        if (active) {
          setError('Could not load users. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="user-list-status">Loading users...</p>;
  }

  if (error) {
    return <p className="user-list-error">{error}</p>;
  }

  if (users.length === 0) {
    return (
      <p className="user-list-status">
        No other registered users yet. Create another account to test chatting.
      </p>
    );
  }

  return (
    <section className="user-list">
      <h2>People</h2>

      {users.map((user) => (
        <button
          key={user.uid}
          type="button"
          className={`user-list-item ${
            selectedUserId === user.uid ? 'selected' : ''
          }`}
          onClick={() => onSelectUser(user)}
        >
          <span className="user-avatar">
            {(user.displayName || user.email || '?')
              .charAt(0)
              .toUpperCase()}
          </span>

          <span className="user-list-details">
            <strong>{user.displayName || 'Unnamed user'}</strong>
            <small>{user.email}</small>
          </span>
        </button>
      ))}
    </section>
  );
}
