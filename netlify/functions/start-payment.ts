// netlify/functions/start-payment.ts
import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL 
    });
    console.log("✅ Firebase Admin initialized");
  } catch (error) {
    console.error("❌ Firebase init error:", error);
  }
}

const packages: Record<string, { credits: number; price: number; name: string }> = {
  p_trial: { credits: 5, price: 30, name: 'Deneme Paketi' },
  p_standard: { credits: 25, price: 125, name: 'Standart Paket' },
  p_pro: { credits: 75, price: 300, name: 'Profesyonel Paket' },
};

const SHOPIER_API_USER = process.env.SHOPIER_API_USER || '3b9d7f8a811d5b0034c6f670f2b37311';
const SHOPIER_API_PASSWORD = process.env.SHOPIER_API_PASSWORD || '5536639175758c69ce1ef57c730f7a84';
const TEST_MODE = process.env.PAYMENT_TEST_MODE?.toLowerCase()?.trim() === 'true';

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
    const { authorization } = event.headers;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const token = authorization.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log("✅ Token verified:", decodedToken.uid);
    } catch (authError: any) {
      console.error("❌ Token error:", authError.message);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    const user = await admin.auth().getUser(decodedToken.uid);
    const { packageId } = JSON.parse(event.body || '{}');
    
    if (!packageId || !packages[packageId]) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ error: 'Invalid package' }) 
      };
    }

    const selectedPackage = packages[packageId];
    const orderId = `${user.uid.substring(0, 8)}-${packageId}-${Date.now()}`;

    console.log("💳 Payment:", selectedPackage.name);

    // TEST MODE
    if (TEST_MODE) {
      console.log("⚠️ TEST MODE");
      
      const db = admin.database();
      const userRef = db.ref(`users/${user.uid}`);
      const snapshot = await userRef.once('value');
      const currentCredits = snapshot.val()?.credits || 0;
      
      await userRef.update({
        credits: currentCredits + selectedPackage.credits,
        lastPurchase: {
          packageId,
          credits: selectedPackage.credits,
          price: selectedPackage.price,
          timestamp: Date.now(),
          testMode: true
        }
      });
      
      console.log("✅ TEST: Credits added");
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          paymentUrl: `${siteUrl}/purchase-success?test=true&credits=${selectedPackage.credits}`,
          testMode: true
        }),
      };
    }

    // PRODUCTION - Shopier
    const shopierPayload = {
      API_key: SHOPIER_API_USER,
      API_secret: SHOPIER_API_PASSWORD,
      random_nr: orderId,
      buyer_name: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
      buyer_email: user.email!,
      buyer_phone: '5555555555',
      buyer_account_age: '0',
      billing_address: 'Türkiye',
      billing_city: 'Istanbul',
      billing_postcode: '34000',
      billing_country: 'Turkey',
      product_name: selectedPackage.name,
      product_type: '1',
      website_index: '1',
      platform_order_id: orderId,
      total_order_value: selectedPackage.price.toString(),
      currency: 'TL',
      current_language: 'tr',
      modul_version: 'API_v1',
      callback_url: `${siteUrl}/.netlify/functions/shopier-callback`,
      back_url: `${siteUrl}/purchase-success`
    };

    console.log("🚀 Shopier API call");
    
    const response = await fetch('https://www.shopier.com/ShowProduct/api_pay4.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(shopierPayload).toString(),
    });

    const htmlForm = await response.text();
    console.log("📥 Shopier response received");

    if (!response.ok || !htmlForm.includes('form')) {
      console.error("❌ Shopier error");
      throw new Error('Ödeme sayfası oluşturulamadı');
    }

    // HTML formu döndür
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        paymentHtml: htmlForm,
        orderId
      }),
    };

  } catch (error: any) {
    console.error("❌ Payment error:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Ödeme başlatılamadı'
      }),
    };
  }
};

export { handler };
