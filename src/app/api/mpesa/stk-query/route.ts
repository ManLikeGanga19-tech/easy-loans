// src/app/api/mpesa/stk-query/route.ts
import { NextRequest, NextResponse } from 'next/server'
import DarajaService from '@/lib/daraja'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { checkoutRequestId } = body

        if (!checkoutRequestId) {
            return NextResponse.json(
                { error: 'Missing required field: checkoutRequestId' },
                { status: 400 }
            )
        }

        const daraja = new DarajaService()

        const queryResponse = await daraja.querySTKPush({
            checkoutRequestId,
        })

        // Determine transaction status
        let status = 'pending'
        let message = queryResponse.ResultDesc || queryResponse.ResponseDescription

        if (queryResponse.ResultCode === '0') {
            status = 'success'
            message = 'Payment completed successfully'
        } else if (queryResponse.ResultCode === '1032') {
            status = 'cancelled'
            message = 'Payment was cancelled by user'
        } else if (queryResponse.ResultCode === '1037') {
            status = 'timeout'
            message = 'Payment request timed out'
        } else if (queryResponse.ResultCode && queryResponse.ResultCode !== '1032') {
            status = 'failed'
        }

        return NextResponse.json({
            success: true,
            data: {
                merchantRequestId: queryResponse.MerchantRequestID,
                checkoutRequestId: queryResponse.CheckoutRequestID,
                resultCode: queryResponse.ResultCode,
                resultDescription: queryResponse.ResultDesc,
                status,
                message,
            },
        })
    } catch (error) {
        console.error('STK Query error:', error)
        return NextResponse.json(
            { error: 'Internal server error', message: 'Failed to query payment status' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json(
        { message: 'M-Pesa STK Query API endpoint. Use POST method to check payment status.' },
        { status: 405 }
    )
}