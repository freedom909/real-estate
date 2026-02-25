import { gql } from '@apollo/client';

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      guest {
        id
        name
        email
      }
      listing {
        id
        title
        description
        price
        location
        city
        country
        imageUrl
        host {
          id
          name
          avatar
        }
      }
      checkInDate
      checkOutDate
      totalPrice
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORDERS_BY_GUEST = gql`
  query GetOrdersByGuest($guestId: ID!) {
    ordersByGuest(guestId: $guestId) {
      id
      orderNumber
      listing {
        id
        title
        imageUrl
        location
        city
        country
        host {
          id
          name
          avatar
        }
      }
      checkInDate
      checkOutDate
      totalPrice
      status
      createdAt
    }
  }
`;

export const GET_ORDERS_BY_HOST = gql`
  query GetOrdersByHost($hostId: ID!) {
    ordersByHost(hostId: $hostId) {
      id
      orderNumber
      guest {
        id
        name
        email
        avatar
      }
      listing {
        id
        title
        location
        city
        country
      }
      checkInDate
      checkOutDate
      totalPrice
      status
      createdAt
    }
  }
`;

export const GET_PENDING_ORDERS = gql`
  query GetPendingOrders {
    pendingOrders {
      id
      orderNumber
      guest {
        id
        name
        email
      }
      listing {
        id
        title
        location
        city
        country
        host {
          id
          name
        }
      }
      checkInDate
      checkOutDate
      totalPrice
      status
      createdAt
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      code
      success
      message
      order {
        id
        orderNumber
        status
        totalPrice
        createdAt
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      code
      success
      message
      order {
        id
        status
        updatedAt
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      code
      success
      message
      order {
        id
        status
        updatedAt
      }
    }
  }
`;

export const CONFIRM_ORDER = gql`
  mutation ConfirmOrder($orderId: ID!) {
    confirmOrder(orderId: $orderId) {
      code
      success
      message
      order {
        id
        status
        updatedAt
      }
    }
  }
`;