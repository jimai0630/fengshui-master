// Subscription Service
// This is a frontend service that will call backend APIs for subscription management
// TODO: Implement actual API calls when backend is ready

export interface SubscriptionData {
    email: string;
    nickname?: string;
    birthDate: string;
    zodiac: string;
    subscribed: boolean;
}

export interface SubscriptionResponse {
    success: boolean;
    message: string;
    subscriptionId?: string;
}

export interface SubscriptionStatus {
    email: string;
    subscribed: boolean;
    lastSentDate?: string;
    nextSendDate?: string;
}

class SubscriptionService {
    private apiBaseUrl = '/api'; // Update this with your actual API base URL

    /**
     * Subscribe a user to monthly reports
     * @param data Subscription data including email, birth date, and zodiac
     * @returns Promise with subscription response
     */
    async subscribe(data: SubscriptionData): Promise<SubscriptionResponse> {
        try {
            // TODO: Replace with actual API call
            console.log('Subscribing user:', data);

            // Simulated API call
            const response = await fetch(`${this.apiBaseUrl}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Subscription failed');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Subscription error:', error);
            // For now, return mock success response
            return {
                success: true,
                message: 'Subscription saved (mock)',
                subscriptionId: 'mock-' + Date.now()
            };
        }
    }

    /**
     * Get subscription status for an email
     * @param email User's email address
     * @returns Promise with subscription status
     */
    async getStatus(email: string): Promise<SubscriptionStatus> {
        try {
            // TODO: Replace with actual API call
            const response = await fetch(`${this.apiBaseUrl}/subscription/${encodeURIComponent(email)}`);

            if (!response.ok) {
                throw new Error('Failed to get subscription status');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Get status error:', error);
            // Return mock status
            return {
                email,
                subscribed: false
            };
        }
    }

    /**
     * Unsubscribe a user from monthly reports
     * @param email User's email address
     * @param token Unsubscribe token (sent in emails)
     * @returns Promise with unsubscribe response
     */
    async unsubscribe(email: string, token: string): Promise<SubscriptionResponse> {
        try {
            // TODO: Replace with actual API call
            const response = await fetch(`${this.apiBaseUrl}/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token }),
            });

            if (!response.ok) {
                throw new Error('Unsubscribe failed');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Unsubscribe error:', error);
            return {
                success: false,
                message: 'Unsubscribe failed'
            };
        }
    }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

// Backend Implementation Guide:
/*
 * Database Schema (PostgreSQL example):
 * 
 * CREATE TABLE subscriptions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   nickname VARCHAR(100),
 *   birth_date DATE NOT NULL,
 *   zodiac VARCHAR(20) NOT NULL,
 *   subscribed BOOLEAN DEFAULT true,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   last_sent_at TIMESTAMP,
 *   next_send_at TIMESTAMP,
 *   unsubscribe_token VARCHAR(255) UNIQUE DEFAULT md5(random()::text)
 * );
 * 
 * CREATE INDEX idx_subscriptions_email ON subscriptions(email);
 * CREATE INDEX idx_subscriptions_next_send ON subscriptions(next_send_at) WHERE subscribed = true;
 * 
 * 
 * Cron Job (Node.js example using node-cron):
 * 
 * import cron from 'node-cron';
 * import { sendMonthlyReports } from './services/emailService';
 * 
 * // Run at 23:00 on the last day of every month
 * cron.schedule('0 23 L * *', async () => {
 *   console.log('Starting monthly report distribution...');
 *   await sendMonthlyReports();
 * });
 * 
 * 
 * Email Service (using SendGrid example):
 * 
 * import sgMail from '@sendgrid/mail';
 * import { getActiveSubscribers, generateMonthlyReport, updateLastSent } from './database';
 * 
 * sgMail.setApiKey(process.env.SENDGRID_API_KEY);
 * 
 * export async function sendMonthlyReports() {
 *   const subscribers = await getActiveSubscribers();
 *   
 *   for (const subscriber of subscribers) {
 *     try {
 *       const report = await generateMonthlyReport(subscriber);
 *       
 *       const msg = {
 *         to: subscriber.email,
 *         from: 'reports@yourfengshuiapp.com',
 *         subject: `Your Monthly Feng Shui Report - ${new Date().toLocaleDateString()}`,
 *         html: report.html,
 *         text: report.text,
 *       };
 *       
 *       await sgMail.send(msg);
 *       await updateLastSent(subscriber.id);
 *       
 *       console.log(`Report sent to ${subscriber.email}`);
 *     } catch (error) {
 *       console.error(`Failed to send report to ${subscriber.email}:`, error);
 *     }
 *   }
 * }
 */
