// netlify/functions/shopier-callback.ts
import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL 
    });
  } catch (error) {
    console.error("Firebase init error:", error);
  }
}

const packages: Record<string, { credits: number }> = {
  p_trial: { credits: 5 },
  p_standard: { credits: 25 },
  p_pro: { credits: 75 },
};

const handler: Handler = async (event: HandlerEvent) => {
  console.log("🔔 Shopier callback");

  try {
    const params = new URLSearchParams(event.body || '');
    const status = params.get('status');
    const orderId = params.get('platform_order_id') || params.get('random_nr');
    
    console.log("📊 Status:", status);
    console.log("🆔 Order:", orderId);

    if (status === '1' || status === 'success') {
      // orderId format: USERID-PACKAGEID-TIMESTAMP
      const [userId, packageId] = orderId?.split('-') || [];

      if (!userId || !packageId) {
        console.error("❌ Invalid order ID:", orderId);
        return { statusCode: 400, body: 'Invalid order' };
      }

      const creditsToAdd = packages[packageId]?.credits || 5;

      console.log("💰 User:", userId);
      console.log("🎁 Credits:", creditsToAdd);

      const db = admin.database();
      const userRef = db.ref(`users/${userId}`);
      
      const snapshot = await userRef.once('value');
      const currentCredits = snapshot.val()?.credits || 0;
      
      await userRef.update({
        credits: currentCredits + creditsToAdd,
        lastPurchase: {
          orderId,
          packageId,
          credits: creditsToAdd,
          timestamp: Date.now(),
          shopierStatus: status
        }
      });

      console.log("✅ Credits added");
      console.log("📈 New balance:", currentCredits + creditsToAdd);

      return { statusCode: 200, body: 'OK' };
    }

    console.log("⚠️ Payment failed:", status);
    return { statusCode: 200, body: 'Payment not completed' };

  } catch (error: any) {
    console.error("❌ Callback error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

export { handler };
