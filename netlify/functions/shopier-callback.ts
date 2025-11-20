import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';

// Initialize Firebase Admin (reuse from start-payment)
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
  console.log("🔔 Shopier callback received");
  console.log("📦 Method:", event.httpMethod);
  console.log("📦 Body:", event.body);

  try {
    // Shopier sends POST with form data
    const params = new URLSearchParams(event.body || '');
    
    const status = params.get('status');
    const orderId = params.get('platform_order_id') || params.get('random_nr');
    
    console.log("📊 Payment status:", status);
    console.log("🆔 Order ID:", orderId);

    // Payment successful
    if (status === '1' || status === 'success') {
      // Extract user ID and package from order ID
      // Format: order_USERID_TIMESTAMP or USERID-PACKAGEID-TIMESTAMP
      const parts = orderId?.split('_') || orderId?.split('-') || [];
      let userId: string | null = null;
      let packageId: string | null = null;

      if (orderId?.includes('-')) {
        // Format: USERID-PACKAGEID-TIMESTAMP
        [userId, packageId] = parts;
      } else if (orderId?.includes('_')) {
        // Format: order_USERID_TIMESTAMP
        userId = parts[1];
        // Try to get package from other params
        packageId = params.get('product_name')?.includes('Standart') ? 'p_standard' :
                    params.get('product_name')?.includes('Pro') ? 'p_pro' : 'p_trial';
      }

      if (!userId) {
        console.error("❌ Could not extract user ID from order:", orderId);
        return {
          statusCode: 400,
          body: 'Invalid order ID'
        };
      }

      const creditsToAdd = packages[packageId || 'p_trial']?.credits || 5;

      console.log("💰 Adding credits to user:", userId);
      console.log("🎁 Credits amount:", creditsToAdd);

      // Update user balance in Firebase
      const db = admin.database();
      const userRef = db.ref(`users/${userId}`);
      
      const snapshot = await userRef.once('value');
      const currentBalance = snapshot.val()?.balance || 0;
      
      await userRef.update({
        balance: currentBalance + creditsToAdd,
        lastPurchase: {
          orderId,
          packageId,
          credits: creditsToAdd,
          timestamp: Date.now(),
          shopierStatus: status
        }
      });

      console.log("✅ Credits added successfully");
      console.log("📈 New balance:", currentBalance + creditsToAdd);

      return {
        statusCode: 200,
        body: 'OK'
      };
    }

    // Payment failed
    console.log("⚠️ Payment not successful, status:", status);
    return {
      statusCode: 200,
      body: 'Payment not completed'
    };

  } catch (error: any) {
    console.error("❌ Callback processing failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

export { handler };
