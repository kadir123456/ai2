import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Ensure you have set FIREBASE_SERVICE_ACCOUNT_KEY_B64 in your Netlify environment variables
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
  p_trial: { credits: 5, price: 30 },
  p_standard: { credits: 25, price: 125 },
  p_pro: { credits: 75, price: 300 },
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the base URL of the site from Netlify's environment variables
  const siteUrl = process.env.URL || 'http://localhost:8888';

  try {
    const { authorization } = event.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    const { packageId } = JSON.parse(event.body || '{}');
    if (!packageId || !packages[packageId]) {
        return { statusCode: 400, body: 'Invalid package ID' };
    }

    const selectedPackage = packages[packageId];

    // --- Shopier API Integration (Simulation) ---
    // In a real application, you would make an API call to Shopier here.
    // The success and cancel URLs are now dynamically generated.
    const successUrl = `${siteUrl}/purchase-success`;
    const cancelUrl = `${siteUrl}/purchase-cancel`;
    
    console.log(`Initiating payment for user ${uid}, package ${packageId}`);
    console.log(`Success URL: ${successUrl}`);
    console.log(`Cancel URL: ${cancelUrl}`);

    // This would be the real URL returned by Shopier, after passing the success/cancel URLs.
    const paymentUrl = `https://www.shopier.com/ShowProduct/p/12345?uid=${uid}&pid=${packageId}`; // Dummy URL

    return {
      statusCode: 200,
      body: JSON.stringify({ paymentUrl }),
    };
  } catch (error) {
    console.error("Payment initiation failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

export { handler };