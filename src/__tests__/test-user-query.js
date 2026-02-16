import fetch from 'node-fetch';

async function testQuery() {
  // Test a query that doesn't require authentication
  const userQuery = `
    query {
      user(id: "some-test-id") {
        id
        email
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
        query: userQuery,
      }),
    });

    const result = await response.json();
    console.log('User query response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testQuery();