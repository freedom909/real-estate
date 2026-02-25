'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

// Mock review data
const mockReviews = {
  '1': [
    {
      id: 'rev1',
      content: 'Absolutely amazing experience! The traditional ryokan was everything we hoped for and more. The host was incredibly welcoming and the food was exceptional.',
      rating: 5,
      author: {
        id: 'user1',
        name: 'Sarah Johnson',
        picture: '/images/user1.jpg'
      },
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      isPinned: true,
      isRecommended: true,
      likes: [{ id: 'like1', userId: 'user2', isPositive: true }],
      dislikes: []
    },
    {
      id: 'rev2',
      content: 'Beautiful property with authentic Japanese atmosphere. The garden was stunning and the hot spring was very relaxing.',
      rating: 4,
      author: {
        id: 'user2',
        name: 'Michael Chen',
        picture: '/images/user2.jpg'
      },
      createdAt: '2024-01-18T14:20:00Z',
      updatedAt: '2024-01-18T14:20:00Z',
      isPinned: false,
      isRecommended: true,
      likes: [{ id: 'like2', userId: 'user3', isPositive: true }],
      dislikes: []
    },
    {
      id: 'rev3',
      content: 'Great location and very clean. The traditional breakfast was a highlight of our trip.',
      rating: 5,
      author: {
        id: 'user3',
        name: 'Emma Wilson',
        picture: '/images/user3.jpg'
      },
      createdAt: '2024-01-15T09:15:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      isPinned: false,
      isRecommended: true,
      likes: [],
      dislikes: []
    }
  ],
  '2': [
    {
      id: 'rev4',
      content: 'Modern apartment with great city views. Perfect location for exploring Osaka.',
      rating: 4,
      author: {
        id: 'user4',
        name: 'David Kim',
        picture: '/images/user4.jpg'
      },
      createdAt: '2024-01-25T16:45:00Z',
      updatedAt: '2024-01-25T16:45:00Z',
      isPinned: true,
      isRecommended: true,
      likes: [{ id: 'like3', userId: 'user1', isPositive: true }],
      dislikes: []
    }
  ]
};

export default function ReviewSection({ listingId, listingTitle }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(mockReviews[listingId] || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    content: '',
    rating: 5
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!session) {
      alert('Please log in to submit a review');
      return;
    }

    if (!newReview.content.trim()) {
      alert('Please write a review');
      return;
    }

    const review = {
      id: `rev${Date.now()}`,
      content: newReview.content,
      rating: newReview.rating,
      author: {
        id: session.user.id,
        name: session.user.name,
        picture: session.user.image || '/images/default-user.jpg'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isRecommended: true,
      likes: [],
      dislikes: []
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ content: '', rating: 5 });
    setShowReviewForm(false);
    
    alert('Review submitted successfully!');
  };

  const handleLikeReview = (reviewId) => {
    if (!session) {
      alert('Please log in to like reviews');
      return;
    }

    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        const hasLiked = review.likes.some(like => like.userId === session.user.id);
        if (hasLiked) {
          // Remove like
          return {
            ...review,
            likes: review.likes.filter(like => like.userId !== session.user.id)
          };
        } else {
          // Add like
          return {
            ...review,
            likes: [...review.likes, { id: `like${Date.now()}`, userId: session.user.id, isPositive: true }]
          };
        }
      }
      return review;
    }));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Guest Reviews</h2>
      
      {/* Review Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">{averageRating}</div>
          <div className="text-gray-600">Average Rating</div>
          <div className="flex justify-center mt-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-xl ${i < Math.floor(averageRating) ? 'text-yellow-500' : 'text-gray-300'}`}>
                ⭐
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <div className="font-semibold text-gray-900 mb-2">Rating Distribution</div>
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center mb-1">
              <span className="w-8 text-sm text-gray-600">{rating}⭐</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(ratingDistribution[rating] / reviews.length) * 100 || 0}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">{ratingDistribution[rating]}</span>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
          <div className="text-gray-600">Total Reviews</div>
          <button 
            onClick={() => setShowReviewForm(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Write Your Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                    className={`text-2xl ${rating <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-gray-600">No reviews yet. Be the first to review this property!</p>
            <button 
              onClick={() => setShowReviewForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Write the First Review
            </button>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={`border rounded-lg p-4 ${review.isPinned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {review.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.author.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{review.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button 
                    onClick={() => handleLikeReview(review.id)}
                    className={`flex items-center space-x-1 hover:text-blue-600 ${
                      review.likes.some(like => like.userId === session?.user?.id) ? 'text-blue-600' : ''
                    }`}
                  >
                    <span>👍</span>
                    <span>{review.likes.length}</span>
                  </button>
                  
                  {review.isRecommended && (
                    <span className="flex items-center space-x-1 text-green-600">
                      <span>✅</span>
                      <span>Recommended</span>
                    </span>
                  )}
                  
                  {review.isPinned && (
                    <span className="flex items-center space-x-1 text-yellow-600">
                      <span>📌</span>
                      <span>Pinned</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}