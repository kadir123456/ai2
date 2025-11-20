import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';
import { getDatabase, ServerValue } from 'firebase-admin/database';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64!, 'base64').toString('utf-8')
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    });
}
  
const packages = {
    p_trial: { credits: 5 },
    p_standard: { credits: 25 },
    p_pro: { credits: 75 },
};

const handler: Handler = async (event: HandlerEvent) => {
    console.log("Shopier callback received:", event.body);
    
    try {
        // In a real app, you MUST verify the signature from Shopier.
        const { uid, packageId, status } = JSON.parse(event.body || '{}');

        if (status !== 'success' || !uid || !packageId || !packages[packageId]) {
            console.warn("Invalid or unsuccessful callback data:", event.body);
            return { statusCode: 200, body: 'Callback processed, but no action taken.' };
        }

        const creditsToAdd = packages[packageId].credits;
        
        const db = getDatabase();
        const creditsRef = db.ref(`users/${uid}/credits`);
        
        // Use a transaction for robust, atomic updates
        await creditsRef.set(ServerValue.increment(creditsToAdd));

        console.log(`Successfully incremented ${creditsToAdd} credits for user ${uid}.`);

        return {
            statusCode: 200,
            body: 'OK',
        };
    } catch (error) {
        console.error('Error processing Shopier callback:', error);
        return {
            statusCode: 200, // Return 200 to prevent Shopier from resending.
            body: 'Error processing request.',
        };
    }
};

export { handler };