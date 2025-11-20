import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';

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

// Shopier API Credentials
const SHOPIER_API_USER = process.env.SHOPIER_API_USER || '3b9d7f8a811d5b0034c6f670f2b37311';
const SHOPIER_API_PASSWORD = process.env.SHOPIER_API_PASSWORD || '5536639175758c69ce1ef57c730f7a84';
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
    const orderId = `order_${user.uid.substring(0, 8)}_${Date.now()}`;

    console.log("💳 Creating payment for:", selectedPackage.name);

    // TEST MODE: Skip Shopier
    if (TEST_MODE) {
      console.log("⚠️ TEST MODE: Skipping Shopier API");
      
      // Simulate adding credits in test mode
      const db = admin.database();
      const userRef = db.ref(`users/${user.uid}`);
      const snapshot = await userRef.once('value');
      const currentBalance = snapshot.val()?.balance || 0;
      
      await userRef.update({
        balance: currentBalance + selectedPackage.credits,
        lastPurchase: {
          packageId,
          credits: selectedPackage.credits,
          price: selectedPackage.price,
          timestamp: Date.now(),
          testMode: true
        }
      });
      
      console.log("✅ TEST: Credits added successfully");
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          paymentUrl: `${siteUrl}/purchase-success?test=true&credits=${selectedPackage.credits}`,
          testMode: true
        }),
      };
    }

    // PRODUCTION MODE: Call Shopier API
    if (!SHOPIER_API_USER || !SHOPIER_API_PASSWORD) {
      console.error("❌ Shopier credentials not configured");
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ error: 'Ödeme sistemi yapılandırılmamış. Lütfen destek ile iletişime geçin.' }) 
      };
    }

    // Shopier API için doğru payload
    const shopierPayload = {
      API_key: SHOPIER_API_USER,
      API_secret: SHOPIER_API_PASSWORD,
      random_nr: orderId,
      buyer_name: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
      buyer_email: user.email!,
      buyer_phone: '5555555555',
      buyer_account_age: '0',
      billing_address: 'Adres bilgisi',
      billing_city: 'Istanbul',
      billing_postcode: '34000',
      billing_country: 'Turkey',
      product_name: selectedPackage.name,
      product_type: '1', // Digital product
      website_index: '1',
      platform_order_id: orderId,
      total_order_value: selectedPackage.price.toString(),
      currency: 'TL',
      current_language: 'tr',
      modul_version: 'API_v1',
      callback_url: `${siteUrl}/.netlify/functions/shopier-callback`,
      back_url: `${siteUrl}/purchase-success`
    };

    console.log("🚀 Calling Shopier API...");
    console.log("📦 Order ID:", orderId);
    
    const response = await fetch('https://www.shopier.com/ShowProduct/api_pay4.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(shopierPayload).toString(),
    });

    const responseText = await response.text();
    console.log("📥 Shopier Response:", responseText);

    // Shopier returns HTML with payment form
    if (!response.ok || !responseText.includes('form')) {
      console.error("❌ Shopier API Error");
      throw new Error('Ödeme sayfası oluşturulamadı. Lütfen tekrar deneyin.');
    }

    // Extract payment URL from response
    // Shopier usually returns a form with action URL
    const urlMatch = responseText.match(/action="([^"]+)"/);
    const paymentUrl = urlMatch ? urlMatch[1] : `https://www.shopier.com/payment?order=${orderId}`;

    console.log("✅ Payment page created");
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        paymentUrl,
        orderId
      }),
    };

  } catch (error: any) {
    console.error("❌ Payment initiation failed:", error);
    console.error("📋 Error stack:", error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Ödeme işlemi başlatılamadı',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};

export { handler };
