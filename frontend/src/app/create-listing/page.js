"use client"

import React, { useReducer, useState } from 'react';
import Link from 'next/link';
import useListingOptions from './useListingOptions';
import useCreateListing from '@/hooks/useCreateListing';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.name]: action.payload.value,
        },
      };
    case 'TOGGLE_AMENITY': {
      const { amenityId } = action.payload;
      const exists = state.formData.amenityIds.includes(String(amenityId));
      const newAmenityIds = exists
        ? state.formData.amenityIds.filter(id => id !== String(amenityId))
        : [...state.formData.amenityIds, String(amenityId)];
      return { ...state, formData: { ...state.formData, amenityIds: newAmenityIds } };
    }
    case 'ADD_AMENITY': {
      const { amenity } = action.payload;
      // Add the new amenity to the list if it's not already there
      const newAmenityIds = state.formData.amenityIds.includes(String(amenity.id))
        ? state.formData.amenityIds
        : [...state.formData.amenityIds, String(amenity.id)];

      return { ...state, formData: { ...state.formData, amenityIds: newAmenityIds } };
    }
    case 'SET_CATEGORY_TYPE':
      return { ...state, selectedCategoryType: action.payload, selectedCategoryId: '' };
    case 'SET_CATEGORY_ID': {
      const categoryId = action.payload;
      return {
        ...state,
        selectedCategoryId: categoryId,
        formData: { ...state.formData, categoryIds: categoryId ? [categoryId] : [] },
      };
    }
    case 'ADD_CATEGORY': {
      return {
        ...state,
        selectedCategoryId: action.payload.id,
      };
    }
    case 'SUBMIT_START':
      return { ...state, error: null, createdListing: null, validationErrors: {} };
    case 'SUBMIT_SUCCESS':
      return { ...state, createdListing: action.payload.listing, createdLocation: action.payload.location };
    case 'SUBMIT_FAILURE':
      return { ...state, error: action.payload };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };
    default:
      return state;
  }
}

const initialState = {
  formData: {
    title: '',
    description: '',
    locationId: '',
    locationInput: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zip: '',
      latitude: 0,
      longitude: 0,
    },
    hostId: 'test-host-1',
    pictures: ['default.jpg'],
    numOfBeds: 1,
    price: 100,
    isFeatured: false,
    amenityIds: [],
    categoryIds: [],
    checkInDate: '',
    checkOutDate: '',
    locationType: 'HOUSE',
    listingStatus: 'ACTIVE',
  },
  selectedCategoryType: '',
  selectedCategoryId: '',
  error: null,
  validationErrors: {},
  createdListing: null,
  createdLocation: null,
};

export default function CreateListing() {
  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4001/graphql';
  const { createListing } = useCreateListing();
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const { formData, error, validationErrors, createdListing, createdLocation, selectedCategoryType, selectedCategoryId } = state;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (formData.numOfBeds <= 0) newErrors.numOfBeds = 'Number of beds must be at least 1.';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative.';
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required.';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required.';
    if (formData.checkInDate && formData.checkOutDate && new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
      newErrors.checkOutDate = 'Check-out date must be after the check-in date.';
    }
    if (isCreatingLocation) {
      if (!formData.locationInput.name.trim()) newErrors.locationName = 'Location name is required.';
      if (!formData.locationInput.address.trim()) newErrors.locationAddress = 'Address is required.';
      if (!formData.locationInput.city.trim()) newErrors.locationCity = 'City is required.';
      if (!formData.locationInput.country.trim()) newErrors.locationCountry = 'Country is required.';
    } else if (!formData.locationId) {
      newErrors.locationId = 'Please select a location.';
    }
    if (formData.amenityIds.length === 0) {
      newErrors.amenities = 'Please select at least one amenity.';
    }
    if (!state.selectedCategoryId) {
      newErrors.categories = 'Please select a category.';
    }

    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_START' });

    if (!validateForm()) {
      return;
    }

    try {
      if (!session) {
        dispatch({ type: 'SUBMIT_FAILURE', payload: 'Please sign in to create a listing.' });
        return
      }

      const input = isCreatingLocation ? {
        ...state.formData,
        locationId: undefined, // Ensure locationId is not sent when creating a new location
        hostId: session?.user?.id ?? state.formData.hostId,
      } : {
        ...state.formData,
        locationInput: undefined, // Ensure locationInput is not sent when using existing location
        hostId: session?.user?.id ?? state.formData.hostId,
      };

      const { ok, message, data, error } = await createListing(input);
      if (!ok) {
        const errorMessage = message || error?.message || 'An unknown error occurred.';
        console.error("CreateListing failed:", errorMessage);

        dispatch({ type: 'SUBMIT_FAILURE', payload: `Failed to create listing: ${errorMessage}` });
        return;
      }

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : "";

        const locRes = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            query: `query GetLocation($id: ID!) { location(id: $id) { id name city country state zip address latitude longitude } }`,
            variables: { id: formData.locationId }
          })
        })
        const locJson = await locRes.json();
        if (locJson.data?.location) {
          dispatch({
            type: 'SUBMIT_SUCCESS',
            payload: { listing: data?.createListing?.listing, location: locJson.data.location },
          });
        } else {
          const fallback = locations.find(l => l.id === formData.locationId) || null;
          dispatch({
            type: 'SUBMIT_SUCCESS',

            payload: { listing: data?.createListing?.listing, location: fallback },
          })
        }
      } catch (e) {
        const fallback = locations.find(l => l.id === formData.locationId) || null;
        dispatch({ type: 'SUBMIT_SUCCESS', payload: { listing: data?.createListing?.listing, location: fallback } });
      }
    } catch (err) {
      console.error('Request error:', err);
      dispatch({ type: 'SUBMIT_FAILURE', payload: 'A network error occurred. Please try again.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_FIELD', payload: { name, value } });
  };

  const handleLocationInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_FIELD', payload: { name: 'locationInput', value: { ...formData.locationInput, [name]: value } } });
  };

  const handleAmenityToggle = (amenityId) => {
    dispatch({ type: 'TOGGLE_AMENITY', payload: { amenityId } });
  };

  // When first dropdown changes (category type)
  const handleCategoryTypeChange = (e) => {
    const type = e.target.value;
    dispatch({ type: 'SET_CATEGORY_TYPE', payload: type });
  };



  const handleFeaturedTitleChange = (e) => {
    const id = e.target.value;
    dispatch({ type: 'SET_CATEGORY_ID', payload: id });
  };
  
  const [newFeaturedTitle, setNewFeaturedTitle] = useState('');
  const [isCreatingFeaturedTitle, setIsCreatingFeaturedTitle] = useState(false);
  const [newCategoryType, setNewCategoryType] = useState(''); // New state for creating a new category type

  const handleCreateFeaturedTitle = async () => {
    const categoryTypeToUse = selectedCategoryType || newCategoryType;

    if (!newFeaturedTitle.trim() || !categoryTypeToUse.trim()) {
      // Basic validation
      alert("New featured title and a category type (either selected or new) are required.");
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : "";
    if (!token) {
      alert("You must be logged in to create a featured title.");
      return;
    }

    try {
      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `mutation CreateCategory($input: CreateCategoryInput!) { createCategory(input: $input) { success message category { id name featured_title type } } }`,
          variables: {
            input: {
              name: newFeaturedTitle, // Using the title as the name for simplicity
              featured_title: newFeaturedTitle,
              type: categoryTypeToUse,
            }
          }
        })
      });
      const result = await response.json();
      if (result.data?.createCategory?.success) {
        const newCategory = result.data.createCategory.category;
        // This will require a way to update the `categories` in `useListingOptions` or refetch them.
        // For now, let's just set it as selected.
        dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
        alert('Featured title created successfully!');
        setIsCreatingFeaturedTitle(false);
        setNewCategoryType(''); // Clear new category type input
        setNewFeaturedTitle('');
        refetchOptions(); // Refetch categories after creating a new one
      } else {
        throw new Error(result.errors?.[0]?.message || result.data?.createCategory?.message || 'Failed to create featured title.');
      }
    } catch (error) {
      console.error("Error creating featured title:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const [newAmenityName, setNewAmenityName] = useState('');
  const [newAmenityCategory, setNewAmenityCategory] = useState('ACCOMMODATION_DETAILS');
  const [isCreatingAmenity, setIsCreatingAmenity] = useState(false);

  const handleCreateAmenity = async () => {
    if (!newAmenityName.trim() || !newAmenityCategory) {
      alert("New amenity name and category are required.");
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : "";
    if (!token) {
      alert("You must be logged in to create an amenity.");
      return;
    }

    try {
      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `mutation CreateAmenity($input: CreateAmenityInput!) { createAmenity(input: $input) { success message amenity { id name category } } }`,
          variables: {
            input: {
              name: newAmenityName,
              category: newAmenityCategory,
            }
          }
        })
      });

      const result = await response.json();
      if (result.data?.createAmenity?.success) {
        const newAmenity = result.data.createAmenity.amenity;
        alert('Amenity created successfully!');

        // Add the new amenity to the form state and refetch options
        dispatch({ type: 'ADD_AMENITY', payload: { amenity: newAmenity } });
        refetchOptions();

        // Reset creation form
        setIsCreatingAmenity(false);
        setNewAmenityName('');
        setNewAmenityCategory('ACCOMMODATION_DETAILS');

      } else {
        throw new Error(result.errors?.[0]?.message || result.data?.createAmenity?.message || 'Failed to create amenity.');
      }
    } catch (error) {
      console.error("Error creating amenity:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Load amenities and categories with our new custom hook
  const { amenities, categories, locations, loading: loadingOptions, error: optionsError, refetchOptions } = useListingOptions();


  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-2xl mx-auto p-6" >
        <h1 className="text-3xl font-bold mb-6">Create Listing</h1>

        {optionsError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">Could not load listing options. Please try again later.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" >
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="flex items-center space-x-4 mb-2">
              <label>
                <input type="radio" name="locationOption" checked={!isCreatingLocation} onChange={() => setIsCreatingLocation(false)} className="mr-2" />
                Select Existing
              </label>
              <label>
                <input type="radio" name="locationOption" checked={isCreatingLocation} onChange={() => setIsCreatingLocation(true)} className="mr-2" />
                Create New
              </label>
            </div>

            {isCreatingLocation ? (
              <div className="space-y-2 border p-4 rounded-md">
                <input type="text" name="name" placeholder="Location Name" value={formData.locationInput.name} onChange={handleLocationInputChange} className="w-full p-2 border rounded" />
                {validationErrors.locationName && <p className="text-red-500 text-xs">{validationErrors.locationName}</p>}
                <input type="text" name="address" placeholder="Address" value={formData.locationInput.address} onChange={handleLocationInputChange} className="w-full p-2 border rounded" />
                {validationErrors.locationAddress && <p className="text-red-500 text-xs">{validationErrors.locationAddress}</p>}
                <input type="text" name="city" placeholder="City" value={formData.locationInput.city} onChange={handleLocationInputChange} className="w-full p-2 border rounded" />
                {validationErrors.locationCity && <p className="text-red-500 text-xs">{validationErrors.locationCity}</p>}
                <input type="text" name="state" placeholder="State" value={formData.locationInput.state} onChange={handleLocationInputChange} className="w-full p-2 border rounded" />
                <input type="text" name="country" placeholder="Country" value={formData.locationInput.country} onChange={handleLocationInputChange} className="w-full p-2 border rounded" />
                {validationErrors.locationCountry && <p className="text-red-500 text-xs">{validationErrors.locationCountry}</p>}
                <input type="text" name="zip" placeholder="Zip Code" value={formData.locationInput.zip} onChange={handleLocationInputChange} className="w-full p-2 border rounded" />
                <div className="flex space-x-2">
                  <input type="number" name="latitude" placeholder="Latitude" value={formData.locationInput.latitude} onChange={handleLocationInputChange} className="w-full p-2 border rounded" />
                  <input type="number" name="longitude" placeholder="Longitude" value={formData.locationInput.longitude} onChange={handleLocationInputChange} className="w-full p-2 border rounded" />
                </div>
              </div>
            ) : (
              loadingOptions ? (
                <div className="w-full h-[42px] bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a location</option>
                  {locations.length === 0 || optionsError ? (
                    <option value="" disabled>No locations found</option>
                  ) : locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name || `${loc.city}, ${loc.country}`}
                    </option>
                  ))}
                </select>
              )
            )}
            {validationErrors.locationId && <p className="text-red-500 text-xs mt-1">{validationErrors.locationId}</p>}
          </div>

          {/* Category Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Category Type</label>
            {loadingOptions ? (
              <div className="w-full h-[42px] bg-gray-200 rounded animate-pulse mb-3"></div>
            ) : (
              <select
                value={selectedCategoryType}
                onChange={handleCategoryTypeChange}
                className="w-full p-2 border rounded mb-3"
                disabled={loadingOptions}
              >
                {optionsError && <option>Error loading types</option>}
                <>
                  <option value="">Select a type</option>
                  {Array.from(new Set(categories.map(c => c.type))).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </>
              </select>
            )}

            <label className="block text-sm font-medium mb-2">Featured Title</label>
            {loadingOptions ? (
              <div className="w-full h-[42px] bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <select
                value={selectedCategoryId}
                onChange={handleFeaturedTitleChange}
                className="w-full p-2 border rounded"
                disabled={!selectedCategoryType || loadingOptions}
              >
                {!selectedCategoryType ? (
                  <option value="">Select a category type first</option>
                ) : (
                  <>
                    <option value="">Select featured title</option>
                    {categories
                      .filter(c => c.type === selectedCategoryType)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.featured_title || c.name}</option>
                      ))}
                  </>
                )}
              </select>
            )}
            {validationErrors.categories && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.categories}</p>
            )}

            <div className="mt-2">
              <label className="flex items-center">
                <input type="checkbox" checked={isCreatingFeaturedTitle} onChange={(e) => setIsCreatingFeaturedTitle(e.target.checked)} className="mr-2" />
                Create new featured title
              </label>
            </div>

            {isCreatingFeaturedTitle && (
              <div className="mt-2 space-y-2">
                <input type="text" placeholder="New Featured Title" value={newFeaturedTitle} onChange={(e) => setNewFeaturedTitle(e.target.value)} className="w-full p-2 border rounded" required />
                {selectedCategoryType === '' && (
                  <>
                    <input type="text" placeholder="New Category Type" value={newCategoryType} onChange={(e) => setNewCategoryType(e.target.value)} className="w-full p-2 border rounded" required />
                    {/* Add validation error display for newCategoryType if needed */}
                  </>
                )}
                <button
                  type="button"
                  onClick={handleCreateFeaturedTitle}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  disabled={!newFeaturedTitle.trim() || (selectedCategoryType === '' && !newCategoryType.trim())}
                >
                  Create New Category
                </button>
              </div>
            )}
          </div>

        <div>
          <label className="block text-sm font-medium mb-2">Listing Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {validationErrors.title && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
            required
          />
          {validationErrors.description && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Number of Beds</label>
          <input
            type="number"
            name="numOfBeds"
            value={formData.numOfBeds}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
          {validationErrors.numOfBeds && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.numOfBeds}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="0"
            step="0.01"
            required
          />
          {validationErrors.price && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Check-in Date</label>
          <input
            type="date"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {validationErrors.checkInDate && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.checkInDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Check-out Date</label>
          <input
            type="date"
            name="checkOutDate"
            value={formData.checkOutDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {validationErrors.checkOutDate && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.checkOutDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Property Type</label>
          <select
            name="locationType"
            value={formData.locationType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="HOUSE">House</option>
            <option value="APARTMENT">Apartment</option>
            <option value="COTTAGE">Cottage</option>
            <option value="VILLA">Villa</option>
            <option value="ROOM">Room</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amenities</label>
          {loadingOptions ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            !amenities || optionsError ? (
              <div className="text-sm text-red-600">Could not load amenities.</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {amenities.map(a => (
                  <label key={a.id} className="flex items-center space-x-2">
                    <input type="checkbox" name="amenityIds" value={a.id} checked={formData.amenityIds.includes(String(a.id))} onChange={() => handleAmenityToggle(a.id)} />
                    <span className="text-sm">{a.name}</span>
                  </label>
                ))}
              </div>
            )
          )}
          {validationErrors.amenities && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.amenities}</p>
          )}

          <div className="mt-2">
            <label className="flex items-center">
              <input type="checkbox" checked={isCreatingAmenity} onChange={(e) => setIsCreatingAmenity(e.target.checked)} className="mr-2" />
              Create new amenity
            </label>
          </div>

          {isCreatingAmenity && (
            <div className="mt-2 space-y-2 border p-4 rounded-md">
              <input type="text" placeholder="New Amenity Name" value={newAmenityName} onChange={(e) => setNewAmenityName(e.target.value)} className="w-full p-2 border rounded" required />
              <select
                value={newAmenityCategory}
                onChange={(e) => setNewAmenityCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="ACCOMMODATION_DETAILS">Accommodation Details</option>
                <option value="SPACE_SURVIVAL">Space Survival</option>
                <option value="OUTDOORS">Outdoors</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
              <button
                type="button"
                onClick={handleCreateAmenity}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={!newAmenityName.trim()}
              >
                Create Amenity
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Create Listing
        </button>
      </form>
      {createdListing && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
          <h2 className="text-lg font-semibold text-green-700">Listing Created</h2>
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <div>Title: {createdListing?.title}</div>
            <div>Price: ¥{createdListing.price}</div>
            <div>
              Location: {createdLocation 
                ? (
                  createdLocation.name 
                    ? `${createdLocation.name} (${createdLocation.city || ''}${createdLocation.city ? ', ' : ''}${createdLocation.country || ''})`
                    : `${createdLocation.city || ''}${createdLocation.city ? ', ' : ''}${createdLocation.country || ''}`
                  )
                : formData.locationId}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}