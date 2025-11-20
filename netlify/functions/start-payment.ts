import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';
import crypto from 'crypto';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL 
    });
    
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
    throw error;
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
const TEST_MODE = process.env.PAYMENT_TEST_MODE === 'true';

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://aimac.netlify.app';

  try {
    console.log("🔐 Verifying token...");
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
      console.log("🎫 Token received, verifying...");
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log("✅ Token verified for user:", decodedToken.uid);
    } catch (authError: any) {
      console.error("❌ Token verification failed:", authError.message);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    const user = await admin.auth().getUser(decodedToken.uid);
    console.log("✅ User fetched:", user.email);

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

    console.log("💳 Creating payment for:", selectedPackage.name);

    // TEST MODE: Skip Shopier and return test URL
    if (TEST_MODE) {
      console.log("⚠️ TEST MODE: Skipping Shopier API");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          paymentUrl: `${siteUrl}/purchase-success?test=true&orderId=${orderId}&package=${packageId}`,
          testMode: true
        }),
      };
    }

    // PRODUCTION MODE: Call Shopier
    if (!SHOPIER_API_KEY || !SHOPIER_SECRET_KEY) {
      console.error("❌ Shopier API keys are not configured.");
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ error: 'Payment gateway is not configured. Please contact support.' }) 
      };
    }

    const paymentData = {
      amount: selectedPackage.price * 100,
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
    const signature = crypto
      .createHmac('sha256', SHOPIER_SECRET_KEY)
      .update(requestBody)
      .digest('hex');

    console.log("🚀 Calling Shopier API...");
    console.log("📡 API URL:", SHOPIER_API_URL);
    console.log("🔑 Using API Key:", SHOPIER_API_KEY?.substring(0, 10) + '...');
    
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
    console.log("📥 Shopier Response Status:", response.status);
    console.log("📥 Shopier Response:", responseData);

    if (!response.ok) {
      console.error("❌ Shopier API Error:", responseData);
      throw new Error(responseData.message || 'Shopier API returned an error. Please check your API credentials.');
    }

    console.log("✅ Payment initiated successfully");
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ paymentUrl: responseData.paymentUrl }),
    };

  } catch (error: any) {
    console.error("❌ Payment initiation failed:", error);
    console.error("📋 Error stack:", error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        details: error.stack
      }),
    };
  }
};

export { handler };
