/**
 * Firebase Skills for G-Pilot
 *
 * Provides Firebase integrations:
 * - Real-time mission status updates (Firestore)
 * - File upload/download (Cloud Storage)
 * - Push notifications (Cloud Messaging)
 */

import { adminFirestore, adminMessaging } from '@/lib/firebase-admin';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseApp } from '@/lib/firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

// =============================================================================
// FIRESTORE: REAL-TIME MISSION STATUS
// =============================================================================

export interface MissionStatus {
    missionId: string;
    userId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    currentStep: string;
    progress: number; // 0-100
    agentLogs: string[];
    startTime: Date;
    endTime?: Date;
    result?: unknown;
}

/**
 * Create real-time mission status document
 */
export async function createMissionStatus(
    missionId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await adminFirestore.collection('missions').doc(missionId).set({
            missionId,
            userId,
            status: 'pending',
            currentStep: 'Initializing',
            progress: 0,
            agentLogs: [],
            startTime: Timestamp.now(),
            createdAt: Timestamp.now()
        });

        return { success: true };
    } catch (error: any) {
        console.error('[createMissionStatus] Error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Update mission status in real-time
 */
export async function updateMissionStatus(
    missionId: string,
    update: Partial<MissionStatus>
): Promise<{ success: boolean; error?: string }> {
    try {
        const docRef = adminFirestore.collection('missions').doc(missionId);

        await docRef.update({
            ...update,
            updatedAt: Timestamp.now()
        });

        return { success: true };
    } catch (error: any) {
        console.error('[updateMissionStatus] Error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Add log entry to mission
 */
export async function addMissionLog(
    missionId: string,
    logMessage: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const docRef = adminFirestore.collection('missions').doc(missionId);

        await docRef.update({
            agentLogs: FieldValue.arrayUnion(
                `[${new Date().toISOString()}] ${logMessage}`
            ),
            updatedAt: Timestamp.now()
        });

        return { success: true };
    } catch (error: any) {
        console.error('[addMissionLog] Error:', error.message);
        return { success: false, error: error.message };
    }
}

// =============================================================================
// CLOUD STORAGE: FILE UPLOADS
// =============================================================================

/**
 * Upload file to Firebase Storage
 */
export async function uploadToStorage(
    userId: string,
    fileName: string,
    fileBuffer: Buffer,
    contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const storage = getStorage(getFirebaseApp());
        const storageRef = ref(storage, `users/${userId}/outputs/${fileName}`);

        await uploadBytes(storageRef, fileBuffer, {
            contentType,
            customMetadata: {
                uploadedAt: new Date().toISOString(),
                userId
            }
        });

        const downloadURL = await getDownloadURL(storageRef);

        return { success: true, url: downloadURL };
    } catch (error: any) {
        console.error('[uploadToStorage] Error:', error.message);
        return { success: false, error: error.message };
    }
}

// =============================================================================
// CLOUD MESSAGING: PUSH NOTIFICATIONS
// =============================================================================

/**
 * Send push notification to user
 */
export async function sendMissionNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        // Get user's FCM token from Firestore
        const userDoc = await adminFirestore
            .collection('users')
            .doc(userId)
            .get();

        const fcmToken = userDoc.data()?.fcmToken;

        if (!fcmToken) {
            return { success: false, error: 'User has no FCM token registered' };
        }

        const message = {
            notification: {
                title,
                body
            },
            data: data || {},
            token: fcmToken
        };

        const messageId = await adminMessaging.send(message);

        return { success: true, messageId };
    } catch (error: any) {
        console.error('[sendMissionNotification] Error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Register user's FCM token for notifications
 */
export async function registerFCMToken(
    userId: string,
    fcmToken: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await adminFirestore.collection('users').doc(userId).set(
            {
                fcmToken,
                fcmTokenUpdatedAt: Timestamp.now()
            },
            { merge: true }
        );

        return { success: true };
    } catch (error: any) {
        console.error('[registerFCMToken] Error:', error.message);
        return { success: false, error: error.message };
    }
}

// =============================================================================
// EXPORT
// =============================================================================

export const firebaseSkills = {
    createMissionStatus,
    updateMissionStatus,
    addMissionLog,
    uploadToStorage,
    sendMissionNotification,
    registerFCMToken
};

export default firebaseSkills;
