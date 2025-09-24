'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Shield, Zap, Loader2, AlertCircle, Clock } from 'lucide-react'
import { usePayment } from '@/hooks/usePayment'

interface FormData {
    fullName: string
    mpesaPhone: string
    nationalId: string
    loanType: string
}

interface LoanDetails {
    trackingId: string
    qualifiedAmount: number
    verificationFee: number
    interestRate: number
    repaymentPeriod: number
}

interface LoanResultsProps {
    formData: FormData
    loanDetails: LoanDetails
    onProceedWithLoan: () => void
    onApplyForDifferentLoan: () => void
}

const loanTypes = [
    { value: 'personal', label: 'Personal Loan' },
    { value: 'business', label: 'Business Loan' },
    { value: 'emergency', label: 'Emergency Loan' },
    { value: 'education', label: 'Education Loan' },
    { value: 'medical', label: 'Medical Loan' },
    { value: 'home-improvement', label: 'Home Improvement' },
    { value: 'agriculture', label: 'Agriculture Loan' },
    { value: 'motorcycle', label: 'Motorcycle Loan' }
]

export default function LoanResults({
    formData,
    loanDetails,
    onProceedWithLoan,
    onApplyForDifferentLoan
}: LoanResultsProps) {
    const {
        initiatePayment,
        retryPayment,
        isLoading,
        paymentStatus,
        resetPaymentStatus,
        isPaymentInProgress,
        isPaymentComplete,
        isPaymentFailed
    } = usePayment()

    const handlePayVerificationFee = async () => {
        try {
            await initiatePayment({
                phoneNumber: `0${formData.mpesaPhone}`,
                amount: loanDetails.verificationFee,
                accountReference: loanDetails.trackingId.substring(0, 12),
                transactionDesc: 'Verification Fee'
            })
        } catch (error) {
            console.error('Payment error:', error)
        }
    }

    const handleRetryPayment = () => {
        handlePayVerificationFee()
    }

    const handleProceedToLoan = () => {
        // This would typically disburse the loan
        alert('Loan disbursement initiated! You will receive your funds within 5 minutes.')
        onProceedWithLoan()
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-6">
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold">EasyLoans</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Success Banner */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Loan Approved!</h1>
                        <p className="text-xl text-gray-600">Your loan has been processed successfully</p>
                    </div>

                    {/* Payment Status Alert */}
                    {paymentStatus.status !== 'idle' && (
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                            {paymentStatus.status === 'processing' && (
                                <Alert className="border-blue-200 bg-blue-50">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        {paymentStatus.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {paymentStatus.status === 'pending' && (
                                <Alert className="border-yellow-200 bg-yellow-50">
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800">
                                        <strong>Check your phone!</strong><br />
                                        {paymentStatus.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {paymentStatus.status === 'success' && (
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <AlertDescription className="text-green-800">
                                        <strong>Payment Successful!</strong><br />
                                        {paymentStatus.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {isPaymentFailed && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <strong>Payment {paymentStatus.status === 'cancelled' ? 'Cancelled' : 'Failed'}</strong><br />
                                        {paymentStatus.message}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-200">
                        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                            <p className="text-lg text-green-800 font-semibold leading-relaxed">
                                **Hi {formData.fullName}, you have qualified for a Loan of Ksh. {loanDetails.qualifiedAmount.toLocaleString()} to your M-PESA. Your loan repayment period is {loanDetails.repaymentPeriod} months with a {loanDetails.interestRate}% interest rate. Terms and conditions apply**
                            </p>
                        </div>
                    </div>

                    {/* Loan Details Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
                            <h2 className="text-2xl font-bold">Loan Details</h2>
                            <p className="text-gray-300">Review your loan information below</p>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-gray-600 mb-1">Loan Tracking ID:</div>
                                        <div className="text-green-600 font-mono text-lg font-bold">{loanDetails.trackingId}</div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-gray-600 mb-1">Your Names:</div>
                                        <div className="text-gray-900 text-lg font-medium">{formData.fullName}</div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-gray-600 mb-1">MPESA Number:</div>
                                        <div className="text-gray-900 text-lg font-medium">0{formData.mpesaPhone}</div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-gray-600 mb-1">ID Number:</div>
                                        <div className="text-gray-900 text-lg font-medium">{formData.nationalId}</div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-gray-600 mb-1">Loan Type:</div>
                                        <div className="text-gray-900 text-lg font-medium">
                                            {loanTypes.find(type => type.value === formData.loanType)?.label}
                                        </div>
                                    </div>

                                    <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
                                        <div className="text-sm font-semibold text-green-700 mb-2">Qualified Loan Amount:</div>
                                        <div className="text-green-600 text-3xl font-bold">
                                            Ksh. {loanDetails.qualifiedAmount.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                                        <div className="text-sm font-semibold text-yellow-700 mb-1">Verification Fee:</div>
                                        <div className="text-yellow-600 text-xl font-bold">Ksh. {loanDetails.verificationFee}</div>
                                        <p className="text-xs text-yellow-600 mt-1">One-time processing fee</p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <div className="text-blue-600 text-2xl font-bold">{loanDetails.repaymentPeriod}</div>
                                                <div className="text-xs text-blue-700">Months</div>
                                            </div>
                                            <div>
                                                <div className="text-blue-600 text-2xl font-bold">{loanDetails.interestRate}%</div>
                                                <div className="text-xs text-blue-700">Interest Rate</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline - Updated based on payment status */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">What's Next?</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPaymentComplete ? 'bg-green-500' : 'bg-blue-500'
                                    }`}>
                                    {isPaymentComplete ? (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                        <span className="text-white font-bold text-sm">1</span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Pay Verification Fee</div>
                                    <div className="text-sm text-gray-600">
                                        {isPaymentComplete ? 'Completed ✓' : 'Pay KES ' + loanDetails.verificationFee + ' via M-Pesa'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPaymentComplete ? 'bg-green-500' : 'bg-gray-300'
                                    }`}>
                                    {isPaymentComplete ? (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                        <span className="text-white font-bold text-sm">2</span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Loan Disbursement</div>
                                    <div className="text-sm text-gray-600">
                                        {isPaymentComplete
                                            ? 'Ready for disbursement'
                                            : 'After verification fee payment'
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPaymentComplete ? 'bg-green-500' : 'bg-gray-300'
                                    }`}>
                                    <span className="text-white font-bold text-sm">3</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Receive Funds</div>
                                    <div className="text-sm text-gray-600">Money sent to M-Pesa within 5 minutes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms Acceptance */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                By proceeding, you confirm that you accept our{' '}
                                <a href="#" className="text-green-600 hover:underline font-semibold">
                                    Terms and Conditions
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-green-600 hover:underline font-semibold">
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons - Updated based on payment status */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {!isPaymentComplete ? (
                            <>
                                {/* Pay Verification Fee Button */}
                                <Button
                                    size="lg"
                                    disabled={isPaymentInProgress}
                                    className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                                    onClick={isPaymentFailed ? handleRetryPayment : handlePayVerificationFee}
                                >
                                    <div className="flex items-center gap-3">
                                        {isPaymentInProgress ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <Shield className="w-6 h-6" />
                                        )}
                                        {isPaymentFailed ? 'Retry Payment' : `Pay KES ${loanDetails.verificationFee} Verification Fee`}
                                    </div>
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Disburse Loan Button */}
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                                    onClick={handleProceedToLoan}
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6" />
                                        Disburse Loan to M-Pesa
                                    </div>
                                </Button>
                            </>
                        )}

                        {/* Apply for Different Loan Button */}
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 text-lg font-semibold"
                            onClick={onApplyForDifferentLoan}
                        >
                            Apply for Different Loan
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white py-8 mt-16">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-400">© 2024 EasyLoans. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}