"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
    Monitor, Moon, Sun, Bell, Brain, Eye, EyeOff, Check,
    HardDrive, CloudUpload, CloudDownload, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIStore, AIProvider } from "@/lib/ai/ai-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { savePreferencesToDrive, loadPreferencesFromDrive, DrivePreferences } from "@/lib/drive-preferences";
import { signIn } from "next-auth/react";

const AI_PROVIDERS: { value: AIProvider; label: string; description: string }[] = [
    { value: 'gemini', label: 'Google Gemini', description: 'Free tier available' },
    { value: 'openai', label: 'OpenAI (ChatGPT)', description: 'GPT-4 & GPT-3.5' },
    { value: 'anthropic', label: 'Anthropic (Claude)', description: 'Claude 3.5 Sonnet' },
    { value: 'deepseek', label: 'DeepSeek', description: 'Open-source alternative' },
    { value: 'llama', label: 'Meta Llama', description: 'Via Groq or Together AI' },
    { value: 'kimi', label: 'Kimi', description: 'Moonshot AI' },
];

type DriveStatus = 'idle' | 'saving' | 'loading' | 'success' | 'error';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    const isDriveConnected = !!(session as any)?.accessToken;

    const {
        provider,
        apiKeys,
        isAgentEnabled,
        useDefaultKey,
        setProvider,
        setApiKey,
        clearApiKey,
        toggleAgent,
        setUseDefaultKey
    } = useAIStore();

    const [mounted, setMounted] = useState(false);
    const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({} as any);
    const [tempKeys, setTempKeys] = useState<Partial<Record<AIProvider, string>>>({});
    const [savedProvider, setSavedProvider] = useState<AIProvider | null>(null);
    const [driveStatus, setDriveStatus] = useState<DriveStatus>('idle');
    const [driveKeyStorage, setDriveKeyStorage] = useState(false); // prefer Drive over localStorage

    useEffect(() => {
        setMounted(true);
        setTempKeys(apiKeys);
    }, [apiKeys]);

    if (!mounted) return null;

    const handleSaveKey = (prov: AIProvider) => {
        const key = tempKeys[prov];
        if (key && key.trim()) {
            setApiKey(prov, key.trim());
            setSavedProvider(prov);
            toast.success(`${AI_PROVIDERS.find(p => p.value === prov)?.label} API Key Saved`, {
                description: driveKeyStorage && isDriveConnected
                    ? "Key saved. Syncing to Google Drive..."
                    : "Key stored in browser localStorage.",
                duration: 3000,
            });
            setTimeout(() => setSavedProvider(null), 2000);
        } else {
            toast.error("Invalid API Key", { description: "Please enter a valid API key before saving." });
        }
    };

    const toggleKeyVisibility = (prov: AIProvider) => {
        setShowKeys(prev => ({ ...prev, [prov]: !prev[prov] }));
    };

    const buildPrefsSnapshot = (): DrivePreferences => ({
        provider,
        useDefaultKey,
        isAgentEnabled,
        apiKeys: driveKeyStorage ? apiKeys : {}, // only include keys if user opted in
        theme: theme || 'dark',
    });

    const handleSaveToDrive = async () => {
        setDriveStatus('saving');
        try {
            await savePreferencesToDrive(buildPrefsSnapshot());
            setDriveStatus('success');
            toast.success("Preferences saved to Google Drive", {
                description: "Your settings are backed up in your .deriverse-analytics folder.",
            });
        } catch (e: any) {
            setDriveStatus('error');
            toast.error("Failed to save to Drive", { description: e.message });
        } finally {
            setTimeout(() => setDriveStatus('idle'), 3000);
        }
    };

    const handleLoadFromDrive = async () => {
        setDriveStatus('loading');
        try {
            const prefs = await loadPreferencesFromDrive();
            if (!prefs) {
                toast.info("No saved preferences found", {
                    description: "Save your preferences first to back them up.",
                });
                setDriveStatus('idle');
                return;
            }

            // Apply loaded preferences
            if (prefs.provider) setProvider(prefs.provider);
            if (typeof prefs.isAgentEnabled === 'boolean' && prefs.isAgentEnabled !== isAgentEnabled) toggleAgent();
            if (typeof prefs.useDefaultKey === 'boolean') setUseDefaultKey(prefs.useDefaultKey);
            if (prefs.theme) setTheme(prefs.theme);
            if (prefs.apiKeys) {
                Object.entries(prefs.apiKeys).forEach(([prov, key]) => {
                    if (key) setApiKey(prov as AIProvider, key);
                });
                setTempKeys(prev => ({ ...prev, ...prefs.apiKeys }));
            }

            setDriveStatus('success');
            toast.success("Preferences loaded from Google Drive", {
                description: "Your settings have been restored.",
            });
        } catch (e: any) {
            setDriveStatus('error');
            toast.error("Failed to load from Drive", { description: e.message });
        } finally {
            setTimeout(() => setDriveStatus('idle'), 3000);
        }
    };

    const driveStatusIcon = {
        idle: null,
        saving: <Loader2 className="h-4 w-4 animate-spin" />,
        loading: <Loader2 className="h-4 w-4 animate-spin" />,
        success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        error: <AlertCircle className="h-4 w-4 text-red-500" />,
    }[driveStatus];

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
                                {[
                                    { value: 'light', label: 'Light', icon: Sun },
                                    { value: 'dark', label: 'Dark (Amber)', icon: Moon },
                                    { value: 'deriverse', label: 'Deriverse Pro', icon: Monitor },
                                ].map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTheme(value)}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                                            theme === value
                                                ? "bg-primary/5 border-primary/50 text-primary shadow-inner"
                                                : "border-border text-muted-foreground hover:bg-muted/50"
                                        )}
                                    >
                                        <Icon className="h-6 w-6" />
                                        <span className="text-sm font-medium">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Google Drive */}
                        <section className="card-gradient rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <HardDrive className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-bold text-foreground">Google Drive</h3>
                                {isDriveConnected ? (
                                    <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-xs">Connected</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground text-xs">Not connected</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-6">
                                Back up your preferences and LLM API keys to your personal Google Drive.
                                Since Deriverse has no central database, Drive is your private cloud storage.
                            </p>

                            {!isDriveConnected ? (
                                <Button
                                    onClick={() => signIn('google')}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    <HardDrive className="h-4 w-4 mr-2" />
                                    Connect Google Drive
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    {/* Include LLM keys in backup */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                                        <div>
                                            <p className="text-foreground font-medium text-sm">Include API keys in backup</p>
                                            <p className="text-muted-foreground text-xs mt-0.5">
                                                Encrypt and store your LLM keys in Drive instead of the browser
                                            </p>
                                        </div>
                                        <Switch
                                            checked={driveKeyStorage}
                                            onCheckedChange={setDriveKeyStorage}
                                        />
                                    </div>

                                    {driveKeyStorage && (
                                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <p className="text-xs">
                                                API keys will be stored in plain text in your private Drive folder.
                                                Only enable this if you trust your Google account security.
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleSaveToDrive}
                                            disabled={driveStatus === 'saving' || driveStatus === 'loading'}
                                            className="flex items-center gap-2"
                                        >
                                            {driveStatus === 'saving' ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CloudUpload className="h-4 w-4" />
                                            )}
                                            Save to Drive
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleLoadFromDrive}
                                            disabled={driveStatus === 'saving' || driveStatus === 'loading'}
                                            className="flex items-center gap-2"
                                        >
                                            {driveStatus === 'loading' ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CloudDownload className="h-4 w-4" />
                                            )}
                                            Load from Drive
                                        </Button>
                                    </div>

                                    {driveStatus === 'success' && (
                                        <p className="flex items-center gap-2 text-xs text-green-500">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Operation completed successfully
                                        </p>
                                    )}
                                    {driveStatus === 'error' && (
                                        <p className="flex items-center gap-2 text-xs text-red-500">
                                            <AlertCircle className="h-3.5 w-3.5" /> Operation failed — check your Drive connection
                                        </p>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        Preferences are saved to <code className="bg-muted px-1 py-0.5 rounded text-[10px]">.deriverse-analytics/preferences.json</code> in your Drive.
                                    </p>
                                </div>
                            )}
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
                                                <div className="flex items-start gap-2">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Enter your API keys below.
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {isDriveConnected
                                                                ? "Keys are stored in your browser by default. Enable \"Include API keys in backup\" above to also save them to Drive."
                                                                : "Keys are stored in your browser. Connect Google Drive above to back them up securely."}
                                                        </p>
                                                    </div>
                                                </div>

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
