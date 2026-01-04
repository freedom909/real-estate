import React from 'react';

export default function BookingsComponent({ id }) {
  return (
    <div>
      <h1>Bookings Service</h1>
      {id && <p>Booking ID: {id}</p>}
    </div>
  );
}