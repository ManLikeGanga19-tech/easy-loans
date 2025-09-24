// src/app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import DarajaService from '@/lib/daraja'

// This interface matches the M-Pesa callback structure
interface MpesaCallback {
    Body: {
        stkCallback: {
            MerchantRequestID: string
            CheckoutRequestID: string
            ResultCode: number
            ResultDesc: string
            CallbackMetadata?: {
                Item: Array<{
                    Name: string
                    Value: any
                }>
            }
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const callbackData: MpesaCallback = await request.json()

        console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2))

        const stkCallback = callbackData.Body.stkCallback
        const daraja = new DarajaService()

        // Extract transaction details
        const transactionDetails = daraja.extractTransactionDetails(callbackData)

        // Determine if transaction was successful
        const isSuccessful = stkCallback.ResultCode === 0

        if (isSuccessful) {
            console.log('Payment successful:', {
                merchantRequestId: stkCallback.MerchantRequestID,
                checkoutRequestId: stkCallback.CheckoutRequestID,
                amount: transactionDetails.amount,
                mpesaReceiptNumber: transactionDetails.mpesaReceiptNumber,
                phoneNumber: transactionDetails.phoneNumber,
                transactionDate: transactionDetails.transactionDate,
            })

            // TODO: Update your database here
            // Example: Update loan application status, record payment, etc.
            // await updateLoanPaymentStatus(stkCallback.CheckoutRequestID, 'completed', transactionDetails)

        } else {
            console.log('Payment failed:', {
                merchantRequestId: stkCallback.MerchantRequestID,
                checkoutRequestId: stkCallback.CheckoutRequestID,
                resultCode: stkCallback.ResultCode,
                resultDesc: stkCallback.ResultDesc,
            })

            // TODO: Handle failed payment
            // await updateLoanPaymentStatus(stkCallback.CheckoutRequestID, 'failed', { error: stkCallback.ResultDesc })
        }

        // Always respond with success to acknowledge receipt
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: 'Callback processed successfully'
        })

    } catch (error) {
        console.error('Callback processing error:', error)

        // Still return success to avoid M-Pesa retrying the callback
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: 'Callback received'
        })
    }
}

export async function GET() {
    return NextResponse.json(
        { message: 'M-Pesa callback endpoint. This endpoint receives POST requests from Safaricom.' },
        { status: 405 }
    )
}