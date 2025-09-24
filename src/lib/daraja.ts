import axios, { AxiosResponse } from 'axios'

interface AccessTokenResponse {
    access_token: string
    expires_in: string
}

interface STKPushRequest {
    phoneNumber: string
    amount: number
    accountReference: string
    transactionDesc: string
}

interface STKPushResponse {
    MerchantRequestID: string
    CheckoutRequestID: string
    ResponseCode: string
    ResponseDescription: string
    CustomerMessage: string
}

interface STKQueryRequest {
    checkoutRequestId: string
}

interface STKQueryResponse {
    ResponseCode: string
    ResponseDescription: string
    MerchantRequestID: string
    CheckoutRequestID: string
    ResultCode: string
    ResultDesc: string
}

class DarajaService {
    private baseUrl: string
    private consumerKey: string
    private consumerSecret: string
    private businessShortCode: string
    private passkey: string
    private callbackUrl: string

    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY || ''
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || ''
        this.businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE || '174379'
        this.passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
        this.callbackUrl = process.env.MPESA_CALLBACK_URL || ''

        // Current 2024/2025 API URLs
        const environment = process.env.MPESA_ENVIRONMENT || 'sandbox'
        this.baseUrl = environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke'

        if (!this.consumerKey || !this.consumerSecret) {
            throw new Error('Missing M-Pesa credentials. Check your environment variables.')
        }
    }

    // Generate access token
    async getAccessToken(): Promise<string> {
        try {
            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')

            const response: AxiosResponse<AccessTokenResponse> = await axios.get(
                `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                }
            )

            if (!response.data.access_token) {
                throw new Error('No access token received from Safaricom')
            }

            return response.data.access_token
        } catch (error: any) {
            console.error('Error getting access token:', error.response?.data || error.message)
            throw new Error(`Failed to get access token: ${error.response?.data?.error_description || error.message}`)
        }
    }

    // Generate password for STK Push (Correct 2024 format)
    private generatePassword(): { password: string; timestamp: string } {
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14) // YYYYMMDDHHmmss format
        const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64')
        return { password, timestamp }
    }

    // Format phone number to correct M-Pesa format (254XXXXXXXXX)
    private formatPhoneNumber(phoneNumber: string): string {
        // Remove any non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '')

        // Handle different input formats
        if (cleaned.startsWith('0')) {
            // Convert 0712345678 to 254712345678
            cleaned = '254' + cleaned.slice(1)
        } else if (cleaned.startsWith('7') && cleaned.length === 9) {
            // Convert 712345678 to 254712345678
            cleaned = '254' + cleaned
        } else if (!cleaned.startsWith('254')) {
            // Add 254 if not present
            cleaned = '254' + cleaned
        }

        // Validate final format
        if (!/^254[17]\d{8}$/.test(cleaned)) {
            throw new Error(`Invalid phone number format: ${phoneNumber}. Expected format: 254XXXXXXXXX`)
        }

        return cleaned
    }

    // Initiate STK Push (Updated for 2024/2025)
    async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
        try {
            const accessToken = await this.getAccessToken()
            const { password, timestamp } = this.generatePassword()
            const formattedPhone = this.formatPhoneNumber(request.phoneNumber)

            // Validate amount
            if (request.amount < 1 || request.amount > 150000) {
                throw new Error('Amount must be between KES 1 and KES 150,000')
            }

            const stkPushData = {
                BusinessShortCode: parseInt(this.businessShortCode),
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.round(request.amount), // Ensure integer
                PartyA: parseInt(formattedPhone),
                PartyB: parseInt(this.businessShortCode),
                PhoneNumber: parseInt(formattedPhone),
                CallBackURL: this.callbackUrl,
                AccountReference: request.accountReference.substring(0, 12), // Max 12 characters
                TransactionDesc: request.transactionDesc.substring(0, 13), // Max 13 characters
            }

            console.log('STK Push Request:', JSON.stringify(stkPushData, null, 2))

            const response: AxiosResponse<STKPushResponse> = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                stkPushData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000, // 60 seconds timeout
                }
            )

            console.log('STK Push Response:', JSON.stringify(response.data, null, 2))

            return response.data
        } catch (error: any) {
            console.error('STK Push Error:', error.response?.data || error.message)

            if (error.response?.status === 400) {
                throw new Error(`Invalid request: ${error.response.data?.errorMessage || 'Bad request parameters'}`)
            } else if (error.response?.status === 401) {
                throw new Error('Unauthorized: Invalid credentials or expired token')
            } else if (error.response?.status === 500) {
                throw new Error('Safaricom server error. Please try again later.')
            }

            throw new Error(`STK Push failed: ${error.response?.data?.errorMessage || error.message}`)
        }
    }

    // Query STK Push status (Updated for 2024/2025)
    async querySTKPush(request: STKQueryRequest): Promise<STKQueryResponse> {
        try {
            const accessToken = await this.getAccessToken()
            const { password, timestamp } = this.generatePassword()

            const queryData = {
                BusinessShortCode: parseInt(this.businessShortCode),
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: request.checkoutRequestId,
            }

            const response: AxiosResponse<STKQueryResponse> = await axios.post(
                `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
                queryData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                }
            )

            return response.data
        } catch (error: any) {
            console.error('STK Query Error:', error.response?.data || error.message)
            throw new Error(`STK Query failed: ${error.response?.data?.errorMessage || error.message}`)
        }
    }

    // Validate transaction (helper method)
    isTransactionSuccessful(queryResponse: STKQueryResponse): boolean {
        return queryResponse.ResultCode === '0'
    }

    // Extract transaction details from callback (Updated structure)
    extractTransactionDetails(callbackData: any) {
        try {
            const items = callbackData?.Body?.stkCallback?.CallbackMetadata?.Item || []

            const details: any = {
                amount: null,
                mpesaReceiptNumber: null,
                phoneNumber: null,
                transactionDate: null,
            }

            items.forEach((item: any) => {
                switch (item.Name) {
                    case 'Amount':
                        details.amount = item.Value
                        break
                    case 'MpesaReceiptNumber':
                        details.mpesaReceiptNumber = item.Value
                        break
                    case 'PhoneNumber':
                        details.phoneNumber = item.Value
                        break
                    case 'TransactionDate':
                        details.transactionDate = item.Value
                        break
                }
            })

            return details
        } catch (error) {
            console.error('Error extracting transaction details:', error)
            return {}
        }
    }

    // Get human-readable status from result code
    getTransactionStatus(resultCode: string): { status: string; message: string } {
        const statusMap: { [key: string]: { status: string; message: string } } = {
            '0': { status: 'success', message: 'The service request is processed successfully' },
            '1032': { status: 'cancelled', message: 'Request cancelled by user' },
            '1037': { status: 'timeout', message: 'DS timeout user cannot be reached' },
            '2001': { status: 'failed', message: 'Wrong PIN entered' },
            '1001': { status: 'failed', message: 'Unable to lock subscriber' },
            '1019': { status: 'failed', message: 'Transaction expired' },
            '1025': { status: 'failed', message: 'Unable to load subscriber' },
            '1036': { status: 'failed', message: 'Transaction expired' },
        }

        return statusMap[resultCode] || {
            status: 'failed',
            message: `Unknown error occurred (Code: ${resultCode})`
        }
    }
}

export default DarajaService
export type { STKPushRequest, STKPushResponse, STKQueryRequest, STKQueryResponse }