"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronRight, ChevronLeft, Building2, Palette, Mail, Target, User, Check, CreditCard } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { countries } from '@/lib/countries';
import toast, { Toaster } from 'react-hot-toast';


export default function OnboardingWizard() {
    const [plans, setPlans] = useState<any[]>([]);
    const [currencySymbol, setCurrencySymbol] = useState("$");
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
    const [formData, setFormData] = useState({
        // Personal Details
        first_name: '',
        last_name: '',
        mobile: '',
        country: '',
        state: '',
        city: '',
        // Business Details
        business_name: '',
        industry: '',
        description: '',
        existing_website: '',
        website_goal: '',
        target_audience: '',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        contact_email: '',
        contact_phone: '',
        logo_url: '',
        // Plan Details
        selected_plan: '',
        plan_price: ''
    });
    const [countryCode, setCountryCode] = useState('us');

    useEffect(() => {
        // Fetch User Data & IP Location & Plans
        const initData = async () => {
            try {
                // 0. Fetch Plans
                try {
                    const plansRes = await api.get('/plans');
                    setPlans(plansRes.data.plans || []);
                    setCurrencySymbol(plansRes.data.symbol || "$");
                } catch (e) {
                    console.error("Failed to fetch plans", e);
                }

                // 1. Get User Data
                const userRes = await api.get('/auth/me');
                const user = userRes.data;

                // 2. Get IP Location
                let detectedCountry = 'us';
                let detectedCountryName = '';
                let detectedCity = '';
                let detectedState = '';

                try {
                    const ipRes = await fetch('https://ipapi.co/json/');
                    const ipData = await ipRes.json();
                    if (ipData.country_code) {
                        detectedCountry = ipData.country_code.toLowerCase();
                        detectedCountryName = ipData.country_name;
                        detectedCity = ipData.city;
                        detectedState = ipData.region;
                    }
                } catch (e) {
                    console.warn('IP fetch failed, defaulting to US');
                }

                setCountryCode(detectedCountry);

                // Check for pre-selected plan (Wait for plans to be set? accessing state 'plans' here won't work immediately)
                // We need to use the response data directly if we want to sync

                // Let's re-fetch plans locally to use in this logic or move this logic to a separate effect if needed. 
                // But initData is async so we can just wait for the promise above if we assign it to a var.

                // Actually, let's just use the data we just got.
                const fetchedPlans = (await api.get('/plans')).data.plans || [];

                let preSelectedPlan = '';
                let preSelectedPrice = '';

                if (typeof window !== 'undefined') {
                    const savedPlan = localStorage.getItem('selected_plan');
                    if (savedPlan) {
                        const planDetails = fetchedPlans.find((p: any) => p.name.toLowerCase() === savedPlan.toLowerCase() || p.id === savedPlan);
                        if (planDetails) {
                            preSelectedPlan = planDetails.name;
                            preSelectedPrice = planDetails.price;
                        }
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    contact_email: user.email || '',
                    country: prev.country || detectedCountryName || '',
                    state: prev.state || detectedState || '',
                    city: prev.city || detectedCity || '',
                    selected_plan: preSelectedPlan,
                    plan_price: preSelectedPrice,
                }));

            } catch (error) {
                console.error('Error initializing data:', error);
            }
        };
        initData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (step === 1 && !formData.mobile) {
            setErrors(prev => ({ ...prev, mobile: true }));
            toast.error('Please enter your mobile number', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            return;
        }
        setErrors(prev => ({ ...prev, mobile: false }));
        setStep(step + 1);
    };
    const handlePrev = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/users/profile', formData);
            // Refresh to trigger dashboard view
            window.location.reload();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    const steps = [
        { id: 1, title: 'Personal Details', icon: User },
        { id: 2, title: 'Business Basics', icon: Building2 },
        { id: 3, title: 'Branding', icon: Palette },
        { id: 4, title: 'Goals', icon: Target },
        { id: 5, title: 'Select Plan', icon: CreditCard },
    ];

    // AI Modal State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    const [isCustomIndustry, setIsCustomIndustry] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/public');
                if (res.data) {
                    setAiEnabled(res.data.ai_generation_enabled);
                }
            } catch (error) {
                console.warn('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, []);

    // AI Generation Handler (Opens Modal)
    const handleOpenAiModal = () => {
        if (!formData.business_name || !formData.industry) {
            alert('Please enter Business Name and Industry first.');
            return;
        }
        setShowAiModal(true);
        setGeneratedContent('');
        setAiPrompt('');
    };

    // Trigger AI Generation
    const triggerAiGeneration = async () => {
        if (!aiPrompt.trim()) {
            alert('Please enter a prompt.');
            return;
        }
        setIsGenerating(true);
        try {
            const res = await api.post('/ai/generate-description', {
                business_name: formData.business_name,
                industry: formData.industry,
                custom_prompt: aiPrompt
            });
            setGeneratedContent(res.data.description);
        } catch (error) {
            console.error('AI Generation Error:', error);
            alert('Failed to generate description.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUseContent = () => {
        setFormData({ ...formData, description: generatedContent });
        setShowAiModal(false);
    };

    const [previewLogoUrl, setPreviewLogoUrl] = useState('');

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Immediate local preview
        const localUrl = URL.createObjectURL(file);
        setPreviewLogoUrl(localUrl);

        const uploadData = new FormData();
        uploadData.append('logo', file);

        try {
            const res = await api.post('/upload/logo', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, logo_url: res.data.url }));
            toast.success("Logo uploaded successfully");
        } catch (error: any) {
            console.error('Logo upload failed:', error);
            toast.error("Failed to upload logo. Please try again.");
            // Keep preview but maybe warn that it won't be saved? 
            // Actually if upload fails, formData.logo_url is not set, so they can't submit it effectively.
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* AI Modal */}
            {showAiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-display font-bold text-lg text-dark-900 flex items-center gap-2">
                                <span>✨</span> Generate with AI
                            </h3>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What should the description focus on?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="e.g. Friendly tone, focus on eco-friendly products..."
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && triggerAiGeneration()}
                                    />
                                    <button
                                        onClick={triggerAiGeneration}
                                        disabled={isGenerating || !aiPrompt.trim()}
                                        className="bg-dark-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-blue transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isGenerating ? 'Generating...' : 'Generate'}
                                    </button>
                                </div>
                            </div>

                            {generatedContent && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Generated Description <span className="text-xs font-normal text-gray-400 ml-1">(You can edit this)</span>
                                    </label>
                                    <textarea
                                        value={generatedContent}
                                        onChange={(e) => setGeneratedContent(e.target.value)}
                                        rows={5}
                                        className="w-full bg-blue-50/50 border border-blue-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none text-dark-900"
                                    />
                                </motion.div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUseContent}
                                disabled={!generatedContent}
                                className="bg-accent-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-blue/20"
                            >
                                Use Description
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-gray-100 h-2 w-full">
                    <div
                        className="bg-dark-900 h-full transition-all duration-300 ease-in-out"
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent-blue">
                            {steps.find(s => s.id === step)?.icon &&
                                <span className="[&>svg]:w-8 [&>svg]:h-8">
                                    {(() => {
                                        const Icon = steps.find(s => s.id === step)?.icon!;
                                        return <Icon />;
                                    })()}
                                </span>
                            }
                        </div>
                        <h2 className="text-3xl font-display font-bold text-dark-900">
                            {steps.find(s => s.id === step)?.title}
                        </h2>
                        <p className="text-gray-400 mt-2">Step {step} of 5</p>
                    </div>

                    {/* Form Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* ... Steps 1-4 ... */}
                            {step === 5 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setFormData({ ...formData, selected_plan: plan.name, plan_price: String(plan.price) })}
                                            className={`cursor-pointer rounded-xl p-6 border-2 transition-all duration-200 relative
                                                ${formData.selected_plan === plan.name
                                                    ? 'border-accent-blue bg-blue-50/50 shadow-md ring-1 ring-accent-blue'
                                                    : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-purple text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                    Most Popular
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-dark-900">{plan.name}</h3>
                                                    <div className="flex items-baseline text-dark-900">
                                                        <span className="text-xl font-bold">{plan.symbol || currencySymbol}{plan.price}</span>
                                                        <span className="text-xs text-gray-500 ml-1">/{plan.interval === 'YEARLY' ? 'year' : 'month'}</span>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                    ${formData.selected_plan === plan.name ? 'border-accent-blue bg-accent-blue text-white' : 'border-gray-300'}`}>
                                                    {formData.selected_plan === plan.name && <Check size={14} />}
                                                </div>
                                            </div>
                                            <ul className="space-y-2">
                                                {plan.features.slice(0, 3).map((feature, i) => (
                                                    <li key={i} className="flex items-center text-xs text-gray-600">
                                                        <Check size={12} className="text-green-500 mr-2 shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                                {plan.features.length > 3 && (
                                                    <li className="text-xs text-gray-400 pl-5">+{plan.features.length - 3} more...</li>
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="contact_email"
                                            value={formData.contact_email}
                                            onChange={handleChange}
                                            readOnly
                                            className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed outline-none"
                                            placeholder="contact@yourbusiness.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                        <PhoneInput
                                            country={countryCode}
                                            value={formData.mobile}
                                            onChange={(phone) => {
                                                setFormData({ ...formData, mobile: phone });
                                                if (phone) setErrors(prev => ({ ...prev, mobile: false }));
                                            }}
                                            enableSearch={true}
                                            inputStyle={{
                                                width: '100%',
                                                height: '48px',
                                                fontSize: '16px',
                                                paddingLeft: '48px',
                                                borderRadius: '0.5rem',
                                                borderColor: errors.mobile ? '#ef4444' : '#e5e7eb',
                                                backgroundColor: '#f9fafb'
                                            }}
                                            buttonStyle={{
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                paddingLeft: '8px'
                                            }}
                                            dropdownStyle={{
                                                width: '300px'
                                            }}
                                        />
                                        {errors.mobile && (
                                            <p className="text-red-500 text-xs mt-1">Mobile number is required</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map((c) => (
                                                    <option key={c.code} value={c.name}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                                placeholder="California"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                            placeholder="San Francisco"
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                        <input
                                            type="text"
                                            name="business_name"
                                            value={formData.business_name}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                            placeholder="Acme Corp"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                        <div className="space-y-3">
                                            <select
                                                name="industry"
                                                value={isCustomIndustry ? 'Other' : formData.industry}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'Other') {
                                                        setIsCustomIndustry(true);
                                                        setFormData({ ...formData, industry: '' });
                                                    } else {
                                                        setIsCustomIndustry(false);
                                                        setFormData({ ...formData, industry: val });
                                                    }
                                                }}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">Select Industry</option>
                                                <option value="Technology">Technology</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Healthcare">Healthcare</option>
                                                <option value="Education">Education</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Real Estate">Real Estate</option>
                                                <option value="Other">Other</option>
                                            </select>

                                            {isCustomIndustry && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                >
                                                    <input
                                                        type="text"
                                                        name="industry"
                                                        value={formData.industry}
                                                        onChange={handleChange}
                                                        placeholder="Enter your specific industry"
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                                        autoFocus
                                                    />
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Existing Website (Optional)</label>
                                        <input
                                            type="url"
                                            name="existing_website"
                                            value={formData.existing_website}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-gray-700">Business Description</label>
                                            {aiEnabled && (
                                                <button
                                                    onClick={handleOpenAiModal}
                                                    className="text-white text-xs bg-dark-900 px-2 py-1 rounded hover:bg-accent-blue transition-colors flex items-center gap-1"
                                                >
                                                    <span>✨ Generate with AI</span>
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                            placeholder="Tell us what your business does..."
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="color"
                                                    name="primary_color"
                                                    value={formData.primary_color}
                                                    onChange={handleChange}
                                                    className="h-10 w-10 rounded border border-gray-200 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    name="primary_color"
                                                    value={formData.primary_color}
                                                    onChange={handleChange}
                                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 uppercase"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="color"
                                                    name="secondary_color"
                                                    value={formData.secondary_color}
                                                    onChange={handleChange}
                                                    className="h-10 w-10 rounded border border-gray-200 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    name="secondary_color"
                                                    value={formData.secondary_color}
                                                    onChange={handleChange}
                                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>


                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo (Optional)</label>
                                        <div className="flex items-center gap-4">
                                            {/* @ts-ignore - implicitly typed */}
                                            {(previewLogoUrl || formData.logo_url) && (
                                                <div className="w-16 h-16 relative rounded-lg overflow-hidden border border-gray-200">
                                                    {/* @ts-ignore */}
                                                    <img src={previewLogoUrl || formData.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                                                {/* @ts-ignore */}
                                                <span>{formData.logo_url ? 'Change Logo' : 'Upload Logo'}</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 text-sm">
                                        <p>Don't have a logo yet? No worries, you can upload it later in your dashboard settings.</p>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                        <input
                                            type="text"
                                            name="target_audience"
                                            value={formData.target_audience}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                            placeholder="e.g. Small business owners, Homeowners..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Main Goal for Website</label>
                                        <select
                                            name="website_goal"
                                            value={formData.website_goal}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="">Select Goal</option>
                                            <option value="Generate Leads">Generate Leads</option>
                                            <option value="Sell Products">Sell Products online</option>
                                            <option value="Showcase Portfolio">Showcase Portfolio</option>
                                            <option value="Provide Information">Provide Information</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-10">
                        <button
                            onClick={handlePrev}
                            disabled={step === 1}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${step === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronLeft size={20} />
                            <span>Back</span>
                        </button>

                        {step < 5 ? (
                            <button
                                onClick={handleNext}
                                disabled={step === 5 && !formData.selected_plan}
                                className="flex items-center space-x-2 bg-dark-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-accent-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>Next</span>
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center space-x-2 bg-accent-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-accent-blue/30"
                            >
                                {loading ? (
                                    <span>Saving...</span>
                                ) : (
                                    <>
                                        <span>Complete Setup</span>
                                        <CheckCircle size={20} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <Toaster position="top-center" />
        </div>
    );
}
