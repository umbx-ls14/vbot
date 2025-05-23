import React from 'react';

export default function HttpVip() {
  return (
    <div>
      <form action="/api/http-vip" method="POST">
        <input type="text" name="target" placeholder="Target URL" required />
        <input type="number" name="time" placeholder="Seconds" required />
        <input type="number" name="port" placeholder="Port" required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}