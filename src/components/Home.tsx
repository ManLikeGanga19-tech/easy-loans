// src/app/components/home.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Shield, Zap, Clock, TrendingUp, Users, DollarSign } from 'lucide-react'
import LoanResults from '@/components/LoanResults';

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

export default function EasyLoansLanding() {
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
        interestRate: 5,
        repaymentPeriod: 2
    })

    const generateLoanDetails = (formData: FormData): LoanDetails => {
        // Generate tracking ID
        const trackingId = `LON-C${Math.random().toString().substr(2, 6)}L${Date.now().toString().substr(-7)}`

        // Calculate loan amount based on loan type (simplified logic)
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
        const verificationFee = Math.round(qualifiedAmount * 0.007) // 0.7% of loan amount

        return {
            trackingId,
            qualifiedAmount,
            verificationFee,
            interestRate: 10,
            repaymentPeriod: 2
        }
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Generate loan details
        const generatedLoanDetails = generateLoanDetails(formData)
        setLoanDetails(generatedLoanDetails)

        console.log('Form submitted:', formData)
        console.log('Loan details:', generatedLoanDetails)

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
        { icon: Clock, text: '5-Minute Approval', color: 'text-green-500' },
        { icon: TrendingUp, text: 'Rates from 3.99%', color: 'text-green-500' },
        { icon: Shield, text: 'No Hidden Fees', color: 'text-green-500' }
    ]

    const stats = [
        { value: '50K+', label: 'Happy Customers', icon: Users },
        { value: 'ksh 20M+', label: 'Loans Funded', icon: DollarSign },
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

    // If showing loan details, render the separate results component
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

    // Main landing page
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), 
                           url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2026&q=80')`
                }}
            />

            {/* Animated Background Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-green-400/20 rounded-full animate-bounce" />
            <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse" />
            <div className="absolute top-1/3 left-1/3 w-6 h-6 bg-green-300/30 rounded-full animate-ping" />

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
                {/* Left Side - Hero Content */}
                <div className="flex-1 flex items-center justify-center px-6 lg:px-16 py-12 lg:py-0">
                    <div className="max-w-3xl text-white space-y-8">
                        {/* Brand Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-semibold">EasyLoans</span>
                            </div>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-400/30">
                                Trusted by 50,000+ customers
                            </Badge>
                        </div>

                        {/* Main Headline */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                Your Dreams,
                                <span className="block bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                                    Funded Fast
                                </span>
                            </h1>
                            <p className="text-xl lg:text-2xl text-gray-100 leading-relaxed max-w-2xl">
                                Skip the paperwork, skip the wait. Get approved for your loan in minutes with our streamlined digital process.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-lg font-medium">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl font-bold text-green-400 mb-2">{stat.value}</div>
                                    <div className="text-gray-300 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Application Form */}
                <div className="w-full lg:w-[28rem] xl:w-[32rem]">
                    <Card className="h-full bg-white/96 backdrop-blur-sm border-0 shadow-2xl rounded-none lg:rounded-l-2xl">
                        {/* Form Header */}
                        <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 relative overflow-hidden rounded-t-none lg:rounded-tl-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                            <div className="relative space-y-2">
                                <h2 className="text-3xl font-bold">Apply Now</h2>
                                <p className="text-green-100 text-lg">Get pre-approved in under 5 minutes</p>
                            </div>
                        </CardHeader>

                        {/* Form Content */}
                        <CardContent className="p-8 space-y-6 flex-1 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="John Doe Mwangi"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className="h-12 border-2 border-gray-200 focus:border-green-500 transition-all duration-300"
                                        required
                                    />
                                </div>

                                {/* M-Pesa Phone Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="mpesaPhone" className="text-sm font-semibold text-gray-700">
                                        M-Pesa Phone Number
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                                            +254
                                        </span>
                                        <Input
                                            id="mpesaPhone"
                                            type="tel"
                                            placeholder="712345678"
                                            value={formData.mpesaPhone}
                                            onChange={(e) => handleInputChange('mpesaPhone', e.target.value)}
                                            className="h-12 pl-16 border-2 border-gray-200 focus:border-green-500 transition-all duration-300"
                                            pattern="[0-9]{9}"
                                            maxLength={9}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">Enter your 9-digit M-Pesa number (without +254)</p>
                                </div>

                                {/* National ID Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="nationalId" className="text-sm font-semibold text-gray-700">
                                        National ID Number
                                    </Label>
                                    <Input
                                        id="nationalId"
                                        type="text"
                                        placeholder="12345678"
                                        value={formData.nationalId}
                                        onChange={(e) => handleInputChange('nationalId', e.target.value)}
                                        className="h-12 border-2 border-gray-200 focus:border-green-500 transition-all duration-300"
                                        pattern="[0-9]{8}"
                                        maxLength={8}
                                        required
                                    />
                                    <p className="text-xs text-gray-500">Enter your 8-digit National ID number</p>
                                </div>

                                {/* Loan Type */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">
                                        Loan Type
                                    </Label>
                                    <Select
                                        value={formData.loanType}
                                        onValueChange={(value) => handleInputChange('loanType', value)}
                                        required
                                    >
                                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500">
                                            <SelectValue placeholder="Select loan type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loanTypes.map((loanType) => (
                                                <SelectItem key={loanType.value} value={loanType.value}>
                                                    {loanType.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Key Benefits */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-green-800 font-bold">
                                            **No CRB Check. No Guarantors. Disbursed to MPESA. No Paperwork**
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            Get Pre-Approved Now
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                    )}
                                </Button>

                                {/* Terms */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        By applying, you agree to our{' '}
                                        <a href="#" className="text-green-600 hover:underline font-semibold">
                                            Terms of Service
                                        </a>{' '}
                                        and{' '}
                                        <a href="#" className="text-green-600 hover:underline font-semibold">
                                            Privacy Policy
                                        </a>
                                        . Your information is secure and encrypted.
                                    </p>
                                </div>
                            </form>
                        </CardContent>

                        {/* Trust Indicators */}
                        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <Shield className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="font-semibold">256-bit SSL</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="font-semibold">Bank-Grade Security</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}