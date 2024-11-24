import { useState } from 'react';

function Header() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      });
      if (response.ok) {
        console.log('✅ Sync successful!');
      } else {
        console.error('❌ Sync failed:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header>
      <button onClick={handleSync} disabled={isSyncing}>
        {isSyncing ? 'Syncing...' : 'Sync'}
      </button>
    </header>
  );
}

export default Header; 