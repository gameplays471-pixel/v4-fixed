// Test direct IPv6 connection to Supabase
import { setTimeout as sleep } from 'timers/promises';

const url = new URL('postgresql://postgres:WLTM4q9FIquG1ItF@db.coyaqzvmpcdhxwtoowye.supabase.co:5432/postgres');
console.log('Host:', url.hostname);
console.log('Port:', url.port);

// Test raw TCP connection
import net from 'net';

const sock = net.createConnection({
  host: url.hostname,
  port: parseInt(url.port),
  family: 0, // try any
  timeout: 8000,
});

sock.on('connect', () => {
  console.log('CONNECTED to', url.hostname);
  sock.end();
  process.exit(0);
});

sock.on('error', (err) => {
  console.log('ERROR:', err.message);
  console.log('Code:', err.code);
  process.exit(1);
});

sock.on('timeout', () => {
  console.log('TIMEOUT');
  sock.destroy();
  process.exit(2);
});

await sleep(10000);
console.log('No response in 10s');
process.exit(3);
