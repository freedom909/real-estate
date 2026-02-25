import { gql } from '@apollo/client';

export const GET_PAYMENT = gql`
  query GetPayment($id: ID!) {
    payment(id: $id) {
      id
      orderId
      guestId
      amount
      status
      paymentIntentId
      createdAt
      updatedAt
    }
  }
`;

export const GET_PAYMENTS_BY_GUEST = gql`
  query GetPaymentsByGuest($guestId: ID!) {
    paymentsByGuest(guestId: $guestId) {
      id
      orderId
      amount
      status
      paymentIntentId
      createdAt
    }
  }
`;

export const GET_PAYMENTS_BY_ORDER = gql`
  query GetPaymentsByOrder($orderId: ID!) {
    paymentsByOrder(orderId: $orderId) {
      id
      guestId
      amount
      status
      paymentIntentId
      createdAt
    }
  }
`;

export const GET_WALLET = gql`
  query GetWallet($userId: ID!) {
    wallet(userId: $userId) {
      userId
      balance
      currency
      createdAt
      updatedAt
    }
  }
`;

export const PROCESS_PAYMENT = gql`
  mutation ProcessPayment($input: ProcessPaymentInput!) {
    processPayment(input: $input) {
      code
      success
      message
      payment {
        id
        orderId
        amount
        status
        paymentIntentId
      }
    }
  }
`;

export const ADD_FUNDS = gql`
  mutation AddFunds($input: AddFundsInput!) {
    addFunds(input: $input) {
      code
      success
      message
      wallet {
        userId
        balance
        currency
      }
    }
  }
`;

export const PROCESS_REFUND = gql`
  mutation ProcessRefund($input: RefundInput!) {
    processRefund(input: $input) {
      code
      success
      message
      refundAmount
    }
  }
`;

export const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($paymentId: ID!) {
    confirmPayment(paymentId: $paymentId) {
      code
      success
      message
      payment {
        id
        status
        updatedAt
      }
    }
  }
`;