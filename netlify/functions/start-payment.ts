import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';
import crypto from 'crypto';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // CRITICAL: Use environment variable for service account
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL 
    });
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
  }
}

const packages: Record<string, { credits: number; price: number; name: string }> = {
  p_trial: { credits: 5, price: 30, name: 'Deneme Paketi' },
  p_standard: { credits: 25, price: 125, name: 'Standart Paket' },
  p_pro: { credits: 75, price: 300, name: 'Profesyonel Paket' },
};

const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY;
const SHOPIER_SECRET_KEY = process.env.SHOPIER_SECRET_KEY;
const SHOPIER_API_URL = 'https://api.shopier.com/v1/payments';

const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Check if Shopier keys are configured
  if (!SHOPIER_API_KEY || !SHOPIER_SECRET_KEY) {
    console.error("Shopier API keys are not configured.");
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: 'Payment gateway is not configured.' }) 
    };
  }

  // Get site URL
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://aimac.netlify.app';

  try {
    // Verify Firebase token
    const { authorization } = event.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ error: 'Unauthorized - No token provided' })
      };
    }

    const token = authorization.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (authError) {
      console.error("Token verification failed:", authError);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    const user = await admin.auth().getUser(decodedToken.uid);

    // Parse and validate request body
    const { packageId } = JSON.parse(event.body || '{}');
    if (!packageId || !packages[packageId]) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ error: 'Invalid package ID' }) 
      };
    }

    const selectedPackage = packages[packageId];
    const orderId = `${user.uid}-${packageId}-${Date.now()}`;

    // Prepare payment data
    const paymentData = {
      amount: selectedPackage.price * 100, // Amount in cents
      currency: 'TRY',
      buyer: {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
        surname: ' ',
        email: user.email!,
        phone: '5555555555',
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

    // Create signature
    const signature = crypto
      .createHmac('sha256', SHOPIER_SECRET_KEY)
      .update(requestBody)
      .digest('hex');

    // Call Shopier API
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
      headers,
      body: JSON.stringify({ paymentUrl: responseData.paymentUrl }),
    };

  } catch (error: any) {
    console.error("Payment initiation failed:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};

export { handler };
