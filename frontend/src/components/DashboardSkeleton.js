export default function DashboardSkeleton() {
  return (
    <>
      {/* Profile Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>

      {/* Bookings Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center border-b pb-4">
              <div className="w-32 h-24 bg-gray-200 rounded-md mr-4"></div>
              <div className="flex-grow">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}