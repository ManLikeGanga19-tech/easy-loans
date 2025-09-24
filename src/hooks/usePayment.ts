// src/hooks/usePayment.ts
'use client'

import { useState, useCallback } from 'react'
import axios from 'axios'

interface PaymentData {
    phoneNumber: string
    amount: number
    accountReference: string
    transactionDesc?: string
}

interface PaymentResponse {
    success: boolean
    message: string
    data?: {
        merchantRequestId: string
        checkoutRequestId: string
        customerMessage: string
        responseCode: string
    }
    error?: string
}

interface PaymentStatus {
    status: 'idle' | 'processing' | 'success' | 'failed' | 'cancelled' | 'timeout' | 'pending'
    message: string
    resultCode?: string
    checkoutRequestId?: string
}

export const usePayment = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
        status: 'idle',
        message: ''
    })

    const initiatePayment = useCallback(async (paymentData: PaymentData): Promise<PaymentResponse> => {
        setIsLoading(true)
        setPaymentStatus({ status: 'processing', message: 'Initiating payment...' })

        try {
            // Validate inputs before sending
            if (!paymentData.phoneNumber || !paymentData.amount || !paymentData.accountReference) {
                throw new Error('Missing required payment information')
            }

            if (paymentData.amount < 1 || paymentData.amount > 150000) {
                throw new Error('Amount must be between KES 1 and KES 150,000')
            }

            console.log('Initiating payment:', paymentData)

            const response = await axios.post('/api/mpesa/stk-push', paymentData, {
                timeout: 60000, // 60 seconds timeout
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (response.data.success) {
                setPaymentStatus({
                    status: 'pending',
                    message: 'Payment request sent to your phone. Please check your phone and enter your M-Pesa PIN.',
                    checkoutRequestId: response.data.data.checkoutRequestId
                })

                // Start polling for payment status
                if (response.data.data?.checkoutRequestId) {
                    pollPaymentStatus(response.data.data.checkoutRequestId)
                }
            } else {
                setPaymentStatus({
                    status: 'failed',
                    message: response.data.message || 'Payment initiation failed'
                })
            }

            return response.data
        } catch (error: any) {
            console.error('Payment initiation error:', error)

            let errorMessage = 'Payment failed. Please try again.'

            if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Invalid payment details'
            } else if (error.response?.status === 503) {
                errorMessage = 'M-Pesa service is temporarily unavailable'
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.'
            } else if (error.message) {
                errorMessage = error.message
            }

            setPaymentStatus({ status: 'failed', message: errorMessage })
            throw new Error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const pollPaymentStatus = useCallback(async (checkoutRequestId: string) => {
        const maxAttempts = 24 // Poll for 4 minutes (24 attempts * 10 seconds)
        let attempts = 0

        const poll = async () => {
            try {
                console.log(`Polling payment status (attempt ${attempts + 1}/${maxAttempts})`)

                const response = await axios.post('/api/mpesa/stk-query', {
                    checkoutRequestId
                }, { timeout: 30000 })

                if (response.data.success) {
                    const status = response.data.data.status
                    const message = response.data.data.message
                    const resultCode = response.data.data.resultCode

                    console.log('Payment status:', { status, message, resultCode })

                    if (status === 'success') {
                        setPaymentStatus({
                            status: 'success',
                            message: 'Payment completed successfully! Your loan will be disbursed shortly.',
                            resultCode
                        })
                        return
                    } else if (['cancelled', 'timeout', 'failed'].includes(status)) {
                        setPaymentStatus({
                            status: status as any,
                            message: message || `Payment ${status}`,
                            resultCode
                        })
                        return
                    }
                    // If still pending, continue polling
                }

                attempts++
                if (attempts < maxAttempts) {
                    // Continue polling every 10 seconds
                    setTimeout(poll, 10000)
                } else {
                    // Timeout after maximum attempts
                    setPaymentStatus({
                        status: 'timeout',
                        message: 'Payment verification timed out. Please check your M-Pesa messages or contact support.'
                    })
                }
            } catch (error) {
                console.error('Error checking payment status:', error)
                attempts++
                if (attempts < maxAttempts) {
                    // Continue polling even if there's an error
                    setTimeout(poll, 15000) // Wait a bit longer on error
                } else {
                    setPaymentStatus({
                        status: 'timeout',
                        message: 'Unable to verify payment status. Please check your M-Pesa messages.'
                    })
                }
            }
        }

        // Start polling after 5 seconds (give time for STK to be processed)
        setTimeout(poll, 5000)
    }, [])

    const resetPaymentStatus = useCallback(() => {
        setPaymentStatus({ status: 'idle', message: '' })
        setIsLoading(false)
    }, [])

    const retryPayment = useCallback(async (paymentData: PaymentData) => {
        resetPaymentStatus()
        return initiatePayment(paymentData)
    }, [initiatePayment, resetPaymentStatus])

    return {
        initiatePayment,
        retryPayment,
        isLoading,
        paymentStatus,
        resetPaymentStatus,
        isPaymentInProgress: isLoading || paymentStatus.status === 'pending' || paymentStatus.status === 'processing',
        isPaymentComplete: paymentStatus.status === 'success',
        isPaymentFailed: ['failed', 'cancelled', 'timeout'].includes(paymentStatus.status),
    }
}