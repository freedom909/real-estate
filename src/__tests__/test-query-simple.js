import fetch from 'node-fetch';

async function testQuery() {
  // Test a simple query first
  const simpleQuery = `
    query Query {
      me {
        id
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
        query: simpleQuery,
      }),
    });

    const result = await response.json();
    console.log('Simple query response:', result);
    
    // Now try the original query
    const originalQuery = `
      query Query {
        me {
          id
          role
        }
      }
    `;
    
    const response2 = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: originalQuery,
      }),
    });

    const result2 = await response2.json();
    console.log('Original query response:', result2);
  } catch (error) {
    console.error('Error:', error);
  }
}

testQuery();