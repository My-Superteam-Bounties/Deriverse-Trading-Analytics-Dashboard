"use client"

import React, { useState } from "react";
import Link from "next/link";
import {
    Search,
    Book,
    MessageCircle,
    Bug,
    Send,
    CheckCircle,
    ChevronRight,
    HelpCircle,
    MegaphoneIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        toast.info(`Searching for: "${searchQuery}"`, {
            description: "Search functionality is currently in demo mode."
        });
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Message Sent Successfully", {
            description: "We'll get back to you within 24 hours."
        });
        setIsSubmitting(false);
        // Reset form logic would go here
    };

    const faqs = [
        {
            question: "How do I connect my wallet?",
            answer: "Click the 'Connect Wallet' button in the top right corner or the sidebar. We support Phantom, Solflare, and other major Solana wallets. Ensure your wallet extension is installed and active."
        },
        {
            question: "Why is my trade not showing up?",
            answer: "Trades are indexed directly from the Solana blockchain. Takes usually appear within 1-3 seconds, but network congestion can cause delays. Try refreshing the page or checking your wallet explorer transaction history."
        },
        {
            question: "What fees does Deriverse charge?",
            answer: "Deriverse charges a standard protocol fee of 0.05% on takers and provides a 0.02% rebate for makers. These fees go towards the insurance fund and protocol development."
        },
        {
            question: "Are my funds safe?",
            answer: "Yes. Deriverse is a non-custodial decentralized exchange. We never have access to your private keys or funds. All smart contracts have been audited by top security firms."
        },
        {
            question: "Can I trade on mobile?",
            answer: "Absolutely! The Deriverse Dashboard is fully responsive and optimized for mobile browsers, providing a seamless trading experience on iOS and Android devices."
        }
    ];

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8 max-w-6xl space-y-16 animate-fade-in-up">

                {/* Hero Section */}
                <div className="text-center space-y-6 py-12 relative">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 blur-[100px] rounded-full -z-10"></div>

                    <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                        <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                            <ChevronRight className="h-4 w-4 rotate-180" />
                        </div>
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        How can we help you?
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Find answers, explore documentation, or get in touch with our team.
                    </p>

                    <form onSubmit={handleSearch} className="max-w-lg mx-auto relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search for articles, guides, or troubleshooting..."
                            className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-xl focus:border-primary/50 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button
                            type="submit"
                            size="sm"
                            className="absolute right-1.5 top-1.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                        >
                            Search
                        </Button>
                    </form>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group cursor-pointer">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                            <Book className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">Documentation</h3>
                        <p className="text-muted-foreground mb-4 h-12">Detailed guides for API integration, trading strategies, and platform features.</p>
                        <Link href="#" className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-400 gap-1">
                            Read Docs <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group cursor-pointer">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-purple-500 transition-colors">Community</h3>
                        <p className="text-muted-foreground mb-4 h-12">Join our Discord to chat with other traders, share strategies, and get live help.</p>
                        <Link href="#" className="flex items-center text-sm font-medium text-purple-500 hover:text-purple-400 gap-1">
                            Join Discord <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group cursor-pointer">
                        <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform">
                            <Bug className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors">Report a Issue</h3>
                        <p className="text-muted-foreground mb-4 h-12">Found a bug? Let us know and help us improve the platform for everyone.</p>
                        <Link href="#" className="flex items-center text-sm font-medium text-red-500 hover:text-red-400 gap-1">
                            File Report <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <Link href="/support/changelog" className="p-6 rounded-2xl bg-card border border-border hover:border-amber-500/30 hover:bg-muted/50 transition-all group cursor-pointer">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                            <MegaphoneIcon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors">Changelog</h3>
                        <p className="text-muted-foreground mb-4 h-12">See what&apos;s new — latest features, improvements, and bug fixes.</p>
                        <span className="flex items-center text-sm font-medium text-amber-500 hover:text-amber-400 gap-1">
                            View Updates <ChevronRight className="h-4 w-4" />
                        </span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* FAQ Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
                                    <AccordionTrigger className="text-left hover:text-primary transition-colors">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-2">Contact Support</h2>
                        <p className="text-muted-foreground mb-6">Need specific help? Send us a message.</p>

                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Your name" required className="bg-muted/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="your@email.com" required className="bg-muted/30" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="What can we help with?" required className="bg-muted/30" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Describe your issue in detail..."
                                    className="min-h-[120px] bg-muted/30 resize-none"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Message <Send className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
