import React from 'react';

export default function AIServiceComponent({ id }) {
  return (
    <div>
      <h1>AI Service</h1>
      {id && <p>Service ID: {id}</p>}
    </div>
  );
}