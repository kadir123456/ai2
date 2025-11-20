import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';
import { getDatabase, ServerValue } from 'firebase-admin/database';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Read the service account key from a file instead of a large env var
const saPath = path.join(__dirname, 'firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf-8'));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // IMPORTANT: Server-side functions use the non-VITE_ prefixed variable
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}
  
const packages = {
    p_trial: { credits: 5 },
    p_standard: { credits: 25 },
    p_pro: { credits: 75 },
};

const SHOPIER_SECRET_KEY = process.env.SHOPIER_SECRET_KEY;

const handler: Handler = async (event: HandlerEvent) => {
    if (!SHOPIER_SECRET_KEY) {
        console.error("Shopier Secret Key is not configured.");
        return { statusCode: 500, body: 'Webhook processor is not configured.' };
    }

    const receivedSignature = event.headers['signature'];
    const rawBody = event.body;

    if (!receivedSignature || !rawBody) {
        console.warn("Callback received without signature or body.");
        return { statusCode: 400, body: 'Bad Request' };
    }

    try {
        // --- Verify Signature ---
        const expectedSignature = crypto
            .createHmac('sha256', SHOPIER_SECRET_KEY)
            .update(rawBody)
            .digest('hex');

        const receivedSignBuffer = Buffer.from(receivedSignature);
        const expectedSignBuffer = Buffer.from(expectedSignature);

        // Use timingSafeEqual to prevent timing attacks
        if (!crypto.timingSafeEqual(receivedSignBuffer, expectedSignBuffer)) {
            console.error("Invalid signature.");
            return { statusCode: 401, body: 'Unauthorized' };
        }

        // --- Process Webhook Data ---
        const data = JSON.parse(rawBody);
        
        // Only add credits if the payment is fully completed
        if (data.status !== 'COMPLETED') {
             console.log(`Callback processed for order ${data.orderId} with status ${data.status}. No action taken.`);
             return { statusCode: 200, body: 'OK. Status not completed.' };
        }

        const uid = data.buyer.id;
        const orderId = data.orderId; // Format: "uid-packageId-timestamp"
        const packageId = orderId.split('-')[1];

        if (!uid || !packageId || !packages[packageId]) {
            console.error("Invalid payload structure. Could not find uid or packageId from orderId:", orderId);
            return { statusCode: 400, body: 'Invalid payload' };
        }

        const creditsToAdd = packages[packageId].credits;
        
        const db = getDatabase();
        const creditsRef = db.ref(`users/${uid}/credits`);
        
        await creditsRef.set(ServerValue.increment(creditsToAdd));

        console.log(`Successfully incremented ${creditsToAdd} credits for user ${uid}.`);

        return {
            statusCode: 200,
            body: 'OK',
        };
    } catch (error) {
        console.error('Error processing Shopier callback:', error);
        // Return 200 to prevent Shopier from resending on our processing errors.
        return {
            statusCode: 200, 
            body: 'Error processing request.',
        };
    }
};

export { handler };