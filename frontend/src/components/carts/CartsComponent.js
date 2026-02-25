import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';

const CartsComponent = () => {
  const { data: session } = useSession();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endpoint = process.env.NEXT_PUBLIC_SUBGRAPH_CARTS_URL || 'http://localhost:4060/graphql';
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4001/graphql';

  const fetchCarts = async (guestId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetCarts($guestId: ID!) {
              getCartsByGuest(guestId: $guestId) { id guestId totalPrice cartItems { id listingId quantity price totalPrice } }
            }
          `,
          variables: { guestId }
        })
      });
      const json = await res.json();
      const carts = json?.data?.getCartsByGuest || [];
      setCart(carts?.[0] || null);
    } catch (e) {
      setError(e?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (input) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation AddToCart($input: AddToCartInput!) {
              addToCart(input: $input) { success message cart { id guestId totalPrice cartItems { id listingId quantity price totalPrice } } }
            }
          `,
          variables: { input }
        })
      });
      const json = await res.json();
      const next = json?.data?.addToCart?.cart;
      if (next) setCart(next);
    } catch (e) {
      setError(e?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async ({ cartId, itemId, quantity, price }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateCartItem($input: UpdateCartItemInput!) {
              updateCartItem(input: $input) { success message cart { id guestId totalPrice cartItems { id listingId quantity price totalPrice } } }
            }
          `,
          variables: { input: { cartId, itemId, quantity, price } }
        })
      });
      const json = await res.json();
      const next = json?.data?.updateCartItem?.cart;
      if (next) setCart(next);
    } catch (e) {
      setError(e?.message || 'Failed to update cart item');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async ({ cartId, itemId }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation RemoveFromCart($input: RemoveFromCartInput!) {
              removeFromCart(input: $input) { success message cart { id guestId totalPrice cartItems { id listingId quantity price totalPrice } } }
            }
          `,
          variables: { input: { cartId, itemId } }
        })
      });
      const json = await res.json();
      const next = json?.data?.removeFromCart?.cart;
      if (next) setCart(next);
    } catch (e) {
      setError(e?.message || 'Failed to remove cart item');
    } finally {
      setLoading(false);
    }
  };

  const createOrderFromItem = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const guestId = session?.user?.id || cart?.guestId;
      const payload = {
        listingId: item.listingId,
        guestId,
        checkInDate: dayjs(item.checkInDate || new Date()).toISOString(),
        checkOutDate: dayjs(item.checkOutDate || dayjs().add(1, 'day')).toISOString(),
        totalPrice: Number(item.totalPrice || item.price || 0)
      };
      const res = await fetch(gateway, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateOrder($input: CreateOrderInput!) {
              createOrder(input: $input) { success message order { id orderNumber status totalPrice createdAt } }
            }
          `,
          variables: { input: payload }
        })
      });
      const json = await res.json();
      const ok = json?.data?.createOrder?.success;
      if (!ok) throw new Error(json?.errors?.[0]?.message || json?.data?.createOrder?.message || 'Failed to create order');
      window.location.href = '/orders';
    } catch (e) {
      setError(e?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const checkoutAll = async () => {
    if (!cart?.cartItems?.length) return;
    setLoading(true);
    setError(null);
    try {
      const guestId = session?.user?.id || cart?.guestId;
      for (const item of cart.cartItems) {
        const payload = {
          listingId: item.listingId,
          guestId,
          checkInDate: dayjs(item.checkInDate || new Date()).toISOString(),
          checkOutDate: dayjs(item.checkOutDate || dayjs().add(1, 'day')).toISOString(),
          totalPrice: Number(item.totalPrice || item.price || 0)
        };
        const res = await fetch(gateway, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              mutation CreateOrder($input: CreateOrderInput!) {
                createOrder(input: $input) { success message order { id } }
              }
            `,
            variables: { input: payload }
          })
        });
        const json = await res.json();
        const ok = json?.data?.createOrder?.success;
        if (!ok) throw new Error(json?.errors?.[0]?.message || json?.data?.createOrder?.message || 'Failed to create order');
      }
      window.location.href = '/orders';
    } catch (e) {
      setError(e?.message || 'Failed to checkout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const guestId = session?.user?.id;
    if (guestId) fetchCarts(guestId);
  }, [session?.user?.id]);

  const onAddMock = () => {
    const guestId = session?.user?.id || 'guest-1';
    const cartId = cart?.id || guestId;
    addToCart({ cartId, guestId, listingId: 'listing-1', quantity: 1, price: 100 });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Cart</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && cart && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Total: ${cart.totalPrice?.toFixed?.(2) || cart.totalPrice}</div>
            {cart?.cartItems?.[0] && (
              <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => createOrderFromItem(cart.cartItems[0])}>Checkout</button>
            )}
            {cart?.cartItems?.length > 1 && (
              <button className="ml-2 px-3 py-2 bg-blue-600 text-white rounded" onClick={checkoutAll}>Checkout All</button>
            )}
          </div>
          <div className="space-y-2">
            {cart.cartItems?.map((item) => (
              <div key={item.id} className="flex items-center justify-between border p-2 rounded">
                <div>
                  <div>Listing: {item.listingId}</div>
                  <div>Qty: {item.quantity}</div>
                  <div>Price: {item.price}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => updateCartItem({ cartId: cart.id, itemId: item.id, quantity: item.quantity + 1 })}>+1</button>
                  <button className="px-2 py-1 border rounded" onClick={() => removeFromCart({ cartId: cart.id, itemId: item.id })}>Remove</button>
                  <button className="px-2 py-1 border rounded bg-blue-600 text-white" onClick={() => createOrderFromItem(item)}>Order</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onAddMock}>Add mock item</button>
    </div>
  );
};

export default CartsComponent;