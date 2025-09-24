'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Toaster } from 'sonner'
import { CheckCircle, Shield, Zap, Clock, TrendingUp, Users, DollarSign } from 'lucide-react'
import LoanResults from '@/components/LoanResults';
import easyloans from '@/assets/easyloan.jpeg';

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

interface Transaction {
    id: string
    name: string
    phone: string
    amount: number
    loanType: string
    timestamp: Date
}

export default function PesaChapChapLanding() {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        mpesaPhone: '',
        nationalId: '',
        loanType: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showLoanDetails, setShowLoanDetails] = useState(false)
    const [loanDetails, setLoanDetails] = useState<LoanDetails>({
        trackingId: '',
        qualifiedAmount: 0,
        verificationFee: 0,
        interestRate: 10,
        repaymentPeriod: 2
    })

    // Generate random timestamp within the last 3 minutes
    const generateRecentTimestamp = (): Date => {
        const now = Date.now()
        const threeMinutesAgo = now - (3 * 60 * 1000) // 3 minutes in milliseconds
        const randomTime = Math.random() * (now - threeMinutesAgo) + threeMinutesAgo
        return new Date(randomTime)
    }

    // Mock transaction data
    const mockTransactions: Transaction[] = [
        { id: '1', name: 'John Mwangi', phone: '254712****78', amount: 15000, loanType: 'Personal Loan', timestamp: generateRecentTimestamp() },
        { id: '2', name: 'Mary Wanjiku', phone: '254701****45', amount: 25000, loanType: 'Education Loan', timestamp: generateRecentTimestamp() },
        { id: '3', name: 'Peter Kimani', phone: '254722****56', amount: 18500, loanType: 'Business Loan', timestamp: generateRecentTimestamp() },
        { id: '4', name: 'Grace Akinyi', phone: '254723****89', amount: 32000, loanType: 'Agriculture Loan', timestamp: generateRecentTimestamp() },
        { id: '5', name: 'David Mutua', phone: '254745****23', amount: 12000, loanType: 'Emergency Loan', timestamp: generateRecentTimestamp() },
        { id: '6', name: 'Susan Njeri', phone: '254796****67', amount: 28000, loanType: 'Home Improvement', timestamp: generateRecentTimestamp() },
        { id: '7', name: 'James Ochieng', phone: '254727****12', amount: 22500, loanType: 'Motorcycle Loan', timestamp: generateRecentTimestamp() },
        { id: '8', name: 'Lucy Wambui', phone: '254748****34', amount: 19500, loanType: 'Medical Loan', timestamp: generateRecentTimestamp() }
    ]

    const getTimeAgo = (timestamp: Date): string => {
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)

        if (diffInSeconds < 60) {
            return `${diffInSeconds} secs ago`
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60)
            return `${minutes} min${minutes > 1 ? 's' : ''} ago`
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`
        } else {
            const days = Math.floor(diffInSeconds / 86400)
            return `${days} day${days > 1 ? 's' : ''} ago`
        }
    }

    const showTransactionToast = (transaction: Transaction) => {
        toast.success(
            <div className="flex flex-col space-y-2 min-h-[60px]">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-700">{transaction.name}</span>
                    <span className="text-xs text-gray-500">{getTimeAgo(transaction.timestamp)}</span>
                </div>
                <div className="text-sm text-gray-600">
                    {transaction.phone} • KSh {transaction.amount.toLocaleString()}
                </div>
                <div className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full inline-block w-fit">
                    {transaction.loanType}
                </div>
            </div>,
            {
                duration: 5000,
                description: "💰 Loan Approved & Disbursed!",
            }
        )
    }

    // Show transaction toasts at intervals
    useEffect(() => {
        let currentIndex = 0

        const showNextTransaction = () => {
            if (currentIndex < mockTransactions.length) {
                showTransactionToast(mockTransactions[currentIndex])
                currentIndex++

                // Schedule next transaction after 5 seconds
                setTimeout(showNextTransaction, 5000)
            } else {
                // Reset to beginning and continue the cycle
                currentIndex = 0
                setTimeout(showNextTransaction, 5000)
            }
        }

        // Start showing transactions after 5 seconds
        const initialTimeout = setTimeout(showNextTransaction, 5000)

        return () => {
            clearTimeout(initialTimeout)
        }
    }, [])

    const generateLoanDetails = (formData: FormData): LoanDetails => {
        const trackingId = `LON-C${Math.random().toString().substr(2, 6)}L${Date.now().toString().substr(-7)}`

        const loanAmounts: { [key: string]: number } = {
            personal: 15000,
            business: 35000,
            emergency: 10000,
            education: 25000,
            medical: 20000,
            'home-improvement': 30000,
            agriculture: 40000,
            motorcycle: 22200
        }

        const qualifiedAmount = loanAmounts[formData.loanType] || 15000
        const verificationFee = Math.round(qualifiedAmount * 0.007)

        return {
            trackingId,
            qualifiedAmount,
            verificationFee,
            interestRate: 10,
            repaymentPeriod: 2
        }
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        const generatedLoanDetails = generateLoanDetails(formData)
        setLoanDetails(generatedLoanDetails)
        setIsSubmitting(false)
        setShowLoanDetails(true)
    }

    const handleProceedWithLoan = () => {
        alert('Proceeding to payment verification...')
    }

    const handleApplyForDifferentLoan = () => {
        setShowLoanDetails(false)
        setFormData({ fullName: '', mpesaPhone: '', nationalId: '', loanType: '' })
    }

    const features = [
        { icon: Clock, text: '5-Minute Approval' },
        { icon: TrendingUp, text: 'Rates from 3.99%' },
        { icon: Shield, text: 'No Hidden Fees' }
    ]

    const stats = [
        { value: '50K+', label: 'Happy Customers', icon: Users },
        { value: 'Ksh 20M+', label: 'Loans Funded', icon: DollarSign },
        { value: '4.9★', label: 'Customer Rating', icon: CheckCircle }
    ]

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

    if (showLoanDetails) {
        return (
            <LoanResults
                formData={formData}
                loanDetails={loanDetails}
                onProceedWithLoan={handleProceedWithLoan}
                onApplyForDifferentLoan={handleApplyForDifferentLoan}
            />
        )
    }

    return (
        <>
            <div className="min-h-screen relative overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${easyloans.src})`
                    }}
                />

                <div className="relative z-10 min-h-screen flex flex-col lg:flex-row pt-6">
                    {/* Left Side */}
                    <div className="flex-1 flex items-start justify-center px-4 lg:px-10 py-6">
                        <div className="max-w-2xl text-white space-y-6">
                            {/* Branding */}
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-semibold">Pesa Chap Chap</span>
                            </div>
                            <Badge className="bg-green-500/20 text-green-200 border-green-400/30 text-xs">
                                Trusted by 50,000+ customers
                            </Badge>

                            {/* Headline */}
                            <h1 className="text-3xl md:text-5xl font-bold leading-snug">
                                Your Dreams,
                                <span className="block bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                                    Funded Fast
                                </span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-100 leading-relaxed">
                                Skip the paperwork, skip the wait. Get approved for your loan in minutes with our streamlined digital process.
                            </p>

                            {/* Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span>{f.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 text-center text-sm">
                                {stats.map((stat, i) => (
                                    <div key={i}>
                                        <div className="text-xl font-bold text-green-400">{stat.value}</div>
                                        <div className="text-gray-300">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full lg:w-[24rem] xl:w-[28rem]">
                        <Card className="h-full bg-white/95 border-0 shadow-xl rounded-none lg:rounded-l-2xl">
                            <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
                                <h2 className="text-xl font-bold">Apply Now</h2>
                                <p className="text-sm text-green-100">Get pre-approved in under 5 minutes</p>
                            </CardHeader>

                            <CardContent className="p-6 space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                                    {/* Full Name */}
                                    <div>
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="John Doe Mwangi"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            className="h-10"
                                            required
                                        />
                                    </div>

                                    {/* M-Pesa Phone */}
                                    <div>
                                        <Label htmlFor="mpesaPhone">M-Pesa Phone Number</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">+254</span>
                                            <Input
                                                id="mpesaPhone"
                                                type="tel"
                                                placeholder="712345678"
                                                value={formData.mpesaPhone}
                                                onChange={(e) => handleInputChange('mpesaPhone', e.target.value)}
                                                className="h-10 pl-12"
                                                pattern="[0-9]{9}"
                                                maxLength={9}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* National ID */}
                                    <div>
                                        <Label htmlFor="nationalId">National ID Number</Label>
                                        <Input
                                            id="nationalId"
                                            type="text"
                                            placeholder="12345678"
                                            value={formData.nationalId}
                                            onChange={(e) => handleInputChange('nationalId', e.target.value)}
                                            className="h-10"
                                            pattern="[0-9]{8}"
                                            maxLength={8}
                                            required
                                        />
                                    </div>

                                    {/* Loan Type */}
                                    <div>
                                        <Label>Loan Type</Label>
                                        <Select
                                            value={formData.loanType}
                                            onValueChange={(v) => handleInputChange('loanType', v)}
                                            required
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select loan type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loanTypes.map((lt) => (
                                                    <SelectItem key={lt.value} value={lt.value}>
                                                        {lt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 text-sm bg-gradient-to-r from-green-600 to-green-500"
                                    >
                                        {isSubmitting ? 'Processing...' : 'Get Pre-Approved Now'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Toaster
                position="bottom-left"
                toastOptions={{
                    style: {
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#166534'
                    }
                }}
            />
        </>
    )
}