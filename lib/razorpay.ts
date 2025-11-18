/**
 * Razorpay Payment Gateway Integration
 * Phase C: Subscription System
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance (server-side only)
let razorpayInstance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.');
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
}

/**
 * Create a Razorpay order for subscription payment
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt: string,
  notes?: Record<string, string>
): Promise<any> {
  const razorpay = getRazorpayInstance();

  const options = {
    amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
    currency,
    receipt,
    notes: notes || {},
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error('Razorpay key secret is not configured');
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

/**
 * Fetch Razorpay payment details
 */
export async function fetchPaymentDetails(paymentId: string): Promise<any> {
  const razorpay = getRazorpayInstance();

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
}

/**
 * Refund a Razorpay payment
 */
export async function refundPayment(
  paymentId: string,
  amount?: number
): Promise<any> {
  const razorpay = getRazorpayInstance();

  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
}

/**
 * Get Razorpay public key for client-side
 */
export function getRazorpayPublicKey(): string {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId) {
    throw new Error('Razorpay public key is not configured');
  }

  return keyId;
}
