import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';
import crypto from 'crypto';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64!, 'base64').toString('utf-8')
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
  });
}

const packages = {
  p_trial: { credits: 5, price: 30, name: 'Deneme Paketi' },
  p_standard: { credits: 25, price: 125, name: 'Standart Paket' },
  p_pro: { credits: 75, price: 300, name: 'Profesyonel Paket' },
};

const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY;
const SHOPIER_SECRET_KEY = process.env.SHOPIER_SECRET_KEY;
const SHOPIER_API_URL = 'https://api.shopier.com/v1/payments';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!SHOPIER_API_KEY || !SHOPIER_SECRET_KEY) {
    console.error("Shopier API keys are not configured.");
    return { statusCode: 500, body: JSON.stringify({ error: 'Payment gateway is not configured.' }) };
  }

  const siteUrl = process.env.URL || 'http://localhost:8888';

  try {
    const { authorization } = event.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await admin.auth().getUser(decodedToken.uid);

    const { packageId } = JSON.parse(event.body || '{}');
    if (!packageId || !packages[packageId]) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid package ID' }) };
    }

    const selectedPackage = packages[packageId];
    // A unique order ID that helps us identify the user and package in the callback
    const orderId = `${user.uid}-${packageId}-${Date.now()}`;

    const paymentData = {
      amount: selectedPackage.price * 100, // Amount in cents
      currency: 'TRY',
      buyer: {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
        surname: ' ',
        email: user.email!,
        phone: '5555555555', // Placeholder
      },
      billingAddress: {
        address: "Placeholder Address",
        city: "Istanbul",
        postalCode: "34000",
        country: "TR"
      },
      shippingAddress: {
        address: "Placeholder Address",
        city: "Istanbul",
        postalCode: "34000",
        country: "TR"
      },
      orderId: orderId,
      productName: selectedPackage.name,
      productCount: 1,
      callbackUrl: `${siteUrl}/.netlify/functions/shopier-callback`,
      redirectUrl: `${siteUrl}/purchase-success`,
    };

    const requestBody = JSON.stringify(paymentData);

    // Create signature as per Shopier documentation
    const signature = crypto
      .createHmac('sha256', SHOPIER_SECRET_KEY)
      .update(requestBody)
      .digest('hex');
      
    const response = await fetch(SHOPIER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SHOPIER_API_KEY}`,
            'Signature': signature
        },
        body: requestBody,
    });

    const responseData = await response.json();

    if (!response.ok) {
        console.error("Shopier API Error:", responseData);
        throw new Error(responseData.message || 'Failed to initiate payment with Shopier.');
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ paymentUrl: responseData.paymentUrl }),
    };
  } catch (error) {
    console.error("Payment initiation failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};

export { handler };