import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000/graphql';

async function getHostListings(hostId, token) {
  const query = `
    query HostListings($hostId: ID!) {
      hostListings(hostId: $hostId) {
        id
        title
        price
        location {
          city
          country
        }
        pictures
      }
    }
  `;

  try {
    const res = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { hostId },
      }),
      // Revalidate every time the page is visited
      cache: 'no-store',
    });

    const { data, errors } = await res.json();

    if (errors) {
      console.error('GraphQL errors:', errors);
      throw new Error('Failed to fetch host listings.');
    }

    return data.hostListings || [];
  } catch (error) {
    console.error('Error fetching host listings:', error);
    return [];
  }
}

export default async function HostDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2">Please <Link href="/api/auth/signin" className="text-blue-600 hover:underline">sign in</Link> to view your dashboard.</p>
      </div>
    );
  }

  const listings = await getHostListings(session.user.id, session.accessToken);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
          <Link href="/create-listing" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            + Create New Listing
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {listing.pictures && listing.pictures.length > 0 && (
                    <img src={listing.pictures[0]} alt={listing.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">{listing.title}</h3>
                  <p className="text-gray-600 mt-1">
                    {listing.location?.city}, {listing.location?.country}
                  </p>
                  <p className="text-lg font-bold mt-2">¥{listing.price.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t">
                  <Link href={`/listings/${listing.id}/edit`} className="text-blue-600 hover:underline">
                    Edit Listing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">You haven't created any listings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

```

With these changes, your host dashboard is now fully dynamic and integrated with your database. It securely fetches and displays the listings for the currently logged-in user.

Let me know if you have any other questions!

<!--
[PROMPT_SUGGESTION]How can I add pagination to the host dashboard?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Create the edit listing page that the dashboard links to.[/PROMPT_SUGGESTION]
--> 
```