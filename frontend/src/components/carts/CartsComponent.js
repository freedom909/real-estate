import React from 'react';

export default function CartsComponent({ id }) {
  return (
    <div>
      <h1>Carts Service</h1>
      {id && <p>Cart ID: {id}</p>}
    </div>
  );
}