// Debug environment variables
console.log('Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('All NEXT_PUBLIC variables:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));

export default function DebugPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Debug</h1>
      <p><strong>API URL:</strong> {apiUrl}</p>
      <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
      <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
      
      <h2>Test API Connection</h2>
      <button onClick={async () => {
        try {
          const response = await fetch(`${apiUrl}/api/health`);
          const data = await response.json();
          alert(`Success: ${JSON.stringify(data)}`);
        } catch (error) {
          alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }}>
        Test Backend Connection
      </button>
    </div>
  );
}