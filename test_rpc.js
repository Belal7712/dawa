const fetch = require('node-fetch'); // wait, node v18 has built in fetch
const url = 'https://yugwjnnwpsnuazzattbu.supabase.co/rest/v1/rpc/submit_rsvp';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z3dqbm53cHNudWF6emF0dGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMTk4ODYsImV4cCI6MjA5OTg5NTg4Nn0.NX5m9TJivGZjj0C39HEzFUD6oYEw5Kf1Khl0owDXzVk';

async function test() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      p_token: "97b7739f-ca2e-4616-815b-682242a7014d",
      p_status: "confirmed",
      p_companions: 4
    })
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
test();
