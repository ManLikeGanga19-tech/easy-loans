// src/app/api/mpesa/stk-push/route.ts
import { NextRequest, NextResponse } from 'next/server'
import DarajaService from '@/lib/daraja'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { phoneNumber, amount, accountReference, transactionDesc } = body

        console.log('STK Push request received:', { phoneNumber, amount, accountReference })

        // Validate required fields
        if (!phoneNumber || !amount || !accountReference) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields',
                    message: 'phoneNumber, amount, and accountReference are required'
                },
                { status: 400 }
            )
        }

        // Validate amount (KES limits)
        const numericAmount = parseFloat(amount)
        if (isNaN(numericAmount) || numericAmount < 1 || numericAmount > 150000) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid amount',
                    message: 'Amount must be between KES 1 and KES 150,000'
                },
                { status: 400 }
            )
        }

        // Validate phone number format
        const phoneRegex = /^(254|0)[17]\d{8}$|^[17]\d{8}$/
        const cleanPhone = phoneNumber.toString().replace(/\D/g, '')
        if (!phoneRegex.test(phoneNumber) && !phoneRegex.test(cleanPhone)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid phone number',
                    message: 'Phone number must be in format: 254712345678, 0712345678, or 712345678'
                },
                { status: 400 }
            )
        }

        // Validate account reference (max 12 characters)
        if (accountReference.length > 12) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid account reference',
                    message: 'Account reference must be 12 characters or less'
                },
                { status: 400 }
            )
        }

        // Initialize Daraja service
        const daraja = new DarajaService()

        // Prepare STK push request
        const stkPushRequest = {
            phoneNumber: phoneNumber.toString(),
            amount: Math.round(numericAmount),
            accountReference: accountReference.toString().substring(0, 12),
            transactionDesc: (transactionDesc || `Payment for ${accountReference}`).substring(0, 13),
        }

        // Initiate STK push
        const stkPushResponse = await daraja.initiateSTKPush(stkPushRequest)

        // Check if STK push was successful
        if (stkPushResponse.ResponseCode === '0') {
            return NextResponse.json({
                success: true,
                message: 'STK Push sent successfully',
                data: {
                    merchantRequestId: stkPushResponse.MerchantRequestID,
                    checkoutRequestId: stkPushResponse.CheckoutRequestID,
                    customerMessage: stkPushResponse.CustomerMessage,
                    responseCode: stkPushResponse.ResponseCode,
                    responseDescription: stkPushResponse.ResponseDescription,
                },
            })
        } else {
            // Handle specific error codes
            let errorMessage = stkPushResponse.ResponseDescription || 'STK Push failed'

            if (stkPushResponse.ResponseCode === '1') {
                errorMessage = 'Insufficient funds in your M-Pesa account'
            } else if (stkPushResponse.ResponseCode === '2001') {
                errorMessage = 'Wrong PIN entered or PIN locked'
            } else if (stkPushResponse.ResponseCode === '1032') {
                errorMessage = 'Transaction was cancelled'
            }

            return NextResponse.json(
                {
                    success: false,
                    error: 'STK Push failed',
                    message: errorMessage,
                    code: stkPushResponse.ResponseCode
                },
                { status: 400 }
            )
        }
    } catch (error: any) {
        console.error('STK Push API error:', error)

        // Handle specific error types
        if (error.message.includes('Invalid phone number')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid phone number format',
                    message: 'Please enter a valid Kenyan phone number (254712345678)'
                },
                { status: 400 }
            )
        }

        if (error.message.includes('credentials')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Configuration error',
                    message: 'M-Pesa service is temporarily unavailable. Please try again later.'
                },
                { status: 503 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: 'Failed to process payment request. Please try again.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        )
    }
}

// Handle GET requests
export async function GET() {
    return NextResponse.json(
        {
            message: 'M-Pesa STK Push API endpoint',
            usage: 'Send POST request with phoneNumber, amount, and accountReference',
            example: {
                phoneNumber: '254712345678',
                amount: 1,
                accountReference: 'LOAN123',
                transactionDesc: 'Verification Fee'
            }
        },
        { status: 200 }
    )
}