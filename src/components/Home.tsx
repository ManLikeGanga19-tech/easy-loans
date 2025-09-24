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
import easyloans from '@/assets/easyloan.jpeg'

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
    )
}
