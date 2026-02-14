"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Monitor, Moon, Sun, Bell, Brain, Eye, EyeOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIStore, AIProvider } from "@/lib/ai/ai-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const AI_PROVIDERS: { value: AIProvider; label: string; description: string }[] = [
    { value: 'gemini', label: 'Google Gemini', description: 'Free tier available' },
    { value: 'openai', label: 'OpenAI (ChatGPT)', description: 'GPT-4 & GPT-3.5' },
    { value: 'anthropic', label: 'Anthropic (Claude)', description: 'Claude 3.5 Sonnet' },
    { value: 'deepseek', label: 'DeepSeek', description: 'Open-source alternative' },
    { value: 'llama', label: 'Meta Llama', description: 'Via Groq or Together AI' },
    { value: 'kimi', label: 'Kimi', description: 'Moonshot AI' },
];

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();


    const {
        provider,
        apiKeys,
        isAgentEnabled,
        useDefaultKey,
        setProvider,
        setApiKey,
        toggleAgent,
        setUseDefaultKey
    } = useAIStore();

    const [mounted, setMounted] = useState(false);
    const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({} as any);
    const [tempKeys, setTempKeys] = useState<Partial<Record<AIProvider, string>>>({});
    const [savedProvider, setSavedProvider] = useState<AIProvider | null>(null);

    useEffect(() => {
        setMounted(true);
        setTempKeys(apiKeys);
    }, [apiKeys]);

    if (!mounted) return null;

    const handleSaveKey = (prov: AIProvider) => {
        // ... rest of function
        const key = tempKeys[prov];
        if (key && key.trim()) {
            setApiKey(prov, key.trim());
            setSavedProvider(prov);

            // Success toast
            toast.success(`${AI_PROVIDERS.find(p => p.value === prov)?.label} API Key Saved`, {
                description: "Your API key has been securely stored in your browser.",
                duration: 3000,
            });

            setTimeout(() => setSavedProvider(null), 2000);
        } else {
            toast.error("Invalid API Key", {
                description: "Please enter a valid API key before saving.",
            });
        }
    };

    const toggleKeyVisibility = (prov: AIProvider) => {
        setShowKeys(prev => ({ ...prev, [prov]: !prev[prov] }));
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                        <p className="text-muted-foreground text-sm">Manage your preferences and account settings.</p>
                    </div>

                    <div className="max-w-2xl space-y-6">
                        {/* Appearance */}
                        <section className="card-gradient rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-foreground mb-4">Appearance</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                                        theme === 'light'
                                            ? "bg-primary/5 border-primary/50 text-primary shadow-inner"
                                            : "border-border text-muted-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Sun className="h-6 w-6" />
                                    <span className="text-sm font-medium">Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                                        theme === 'dark'
                                            ? "bg-primary/5 border-primary/50 text-primary shadow-inner"
                                            : "border-border text-muted-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Moon className="h-6 w-6" />
                                    <span className="text-sm font-medium">Dark (Amber)</span>
                                </button>
                                <button
                                    onClick={() => setTheme('deriverse')}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                                        theme === 'deriverse'
                                            ? "bg-primary/5 border-primary/50 text-primary shadow-inner"
                                            : "border-border text-muted-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <Monitor className="h-6 w-6" />
                                    <span className="text-sm font-medium">Deriverse Pro</span>
                                </button>
                            </div>
                        </section>

                        {/* AI Configuration */}
                        <section className="card-gradient rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Brain className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-bold text-foreground">AI Configuration</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Enable/Disable AI */}
                                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                                    <div>
                                        <p className="text-foreground font-medium">Enable AI Agent</p>
                                        <p className="text-muted-foreground text-sm">Use AI-powered insights and analysis</p>
                                    </div>
                                    <Switch checked={isAgentEnabled} onCheckedChange={toggleAgent} />
                                </div>

                                {isAgentEnabled && (
                                    <>
                                        {/* Use Default Key Toggle */}
                                        <div className="flex items-center justify-between pb-4 border-b border-border/50">
                                            <div>
                                                <p className="text-foreground font-medium">Use Default API Key</p>
                                                <p className="text-muted-foreground text-sm">Use our internal API key (limited usage)</p>
                                            </div>
                                            <Switch checked={useDefaultKey} onCheckedChange={setUseDefaultKey} />
                                        </div>

                                        {/* Provider Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="ai-provider">AI Provider</Label>
                                            <Select value={provider} onValueChange={(val) => setProvider(val as AIProvider)}>
                                                <SelectTrigger className="bg-muted/30">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {AI_PROVIDERS.map((prov) => (
                                                        <SelectItem key={prov.value} value={prov.value}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{prov.label}</span>
                                                                <span className="text-xs text-muted-foreground">{prov.description}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* API Keys Section */}
                                        {!useDefaultKey && (
                                            <div className="space-y-4 pt-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Enter your API keys below. Keys are stored locally in your browser.
                                                </p>

                                                {AI_PROVIDERS.map((prov) => (
                                                    <div key={prov.value} className="space-y-2">
                                                        <Label htmlFor={`key-${prov.value}`} className="flex items-center gap-2">
                                                            {prov.label}
                                                            {apiKeys[prov.value] && (
                                                                <span className="text-xs text-primary">(Saved)</span>
                                                            )}
                                                        </Label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Input
                                                                    id={`key-${prov.value}`}
                                                                    type={showKeys[prov.value] ? "text" : "password"}
                                                                    placeholder={`Enter ${prov.label} API key`}
                                                                    value={tempKeys[prov.value] || ''}
                                                                    onChange={(e) => setTempKeys(prev => ({ ...prev, [prov.value]: e.target.value }))}
                                                                    className="bg-muted/30 pr-10"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleKeyVisibility(prov.value)}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                                >
                                                                    {showKeys[prov.value] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSaveKey(prov.value)}
                                                                disabled={!tempKeys[prov.value] || tempKeys[prov.value] === apiKeys[prov.value]}
                                                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                                            >
                                                                {savedProvider === prov.value ? (
                                                                    <Check className="h-4 w-4" />
                                                                ) : (
                                                                    'Save'
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Notifications */}
                        <section className="card-gradient rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Bell className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-bold text-foreground">Notifications</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-foreground font-medium">Trade Executions</p>
                                        <p className="text-muted-foreground text-sm">Get notified when orders fill.</p>
                                    </div>
                                    <div className="h-6 w-11 rounded-full bg-primary/20 border border-primary/50 relative cursor-pointer">
                                        <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary shadow-sm"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-foreground font-medium">Price Alerts</p>
                                        <p className="text-muted-foreground text-sm">Push notifications for price movements.</p>
                                    </div>
                                    <div className="h-6 w-11 rounded-full bg-white/10 border border-white/10 relative cursor-pointer">
                                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-slate-400"></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
