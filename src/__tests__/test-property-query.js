import fetch from 'node-fetch';

async function testQuery() {
  // Test a query that doesn't involve the User type
  const propertyQuery = `
    query {
      properties {
        id
        title
        price
      }
    }
  `;

  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: propertyQuery,
      }),
    });

    const result = await response.json();
    console.log('Property query response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testQuery();