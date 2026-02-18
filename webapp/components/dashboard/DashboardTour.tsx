"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useTheme } from "next-themes";

interface DashboardTourProps {
    currentView?: 'intelligence' | 'terminal';
    onSwitchView?: (mode: 'intelligence' | 'terminal') => void;
    startTour?: boolean;
    onTourStart?: () => void;
    onTourEnd?: () => void;
}

export function DashboardTour({ currentView, onSwitchView, startTour, onTourStart, onTourEnd }: DashboardTourProps) {
    const { theme } = useTheme();
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    // Effect to handle manual start
    useEffect(() => {
        if (startTour) {
            setRun(false); // Reset first to ensure Joyride picks up the change
            setStepIndex(0);
            if (onSwitchView && currentView !== 'intelligence') {
                onSwitchView('intelligence');
            }
            // Small timeout to allow state to reset
            setTimeout(() => {
                setRun(true);
                if (onTourStart) onTourStart(); // Reset the trigger in parent
            }, 100);
        }
    }, [startTour, onSwitchView, currentView, onTourStart]);

    useEffect(() => {
        // Check if user has seen the tour
        const hasSeenTour = localStorage.getItem("deriverse_has_seen_tour");
        if (!hasSeenTour) {
            // Small delay to ensure UI is mounted
            const t = setTimeout(() => setRun(true), 1000);
            return () => clearTimeout(t);
        }
    }, []);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { action, index, status, type } = data;

        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            setRun(false);
            localStorage.setItem("deriverse_has_seen_tour", "true");
            return;
        }

        if (type === "step:after") {
            if (action === "next") {
                // Determine if we need to switch view
                // Step 2 (Index 2) is "Intelligence Input". Next step (Index 3) is "Terminal Filters".
                if (index === 2) {
                    if (onSwitchView && currentView !== "terminal") {
                        onSwitchView("terminal");
                        // Wait for the view to switch and DOM to settle before advancing
                        setTimeout(() => {
                            setStepIndex(index + 1);
                        }, 800);
                    } else {
                        setStepIndex(index + 1);
                    }
                } else {
                    setStepIndex(index + 1);
                }
            } else if (action === "prev") {
                // Handle switching back to Intelligence view if going back from Terminal Filters
                if (index === 3) {
                    if (onSwitchView && currentView !== "intelligence") {
                        onSwitchView("intelligence");
                        setTimeout(() => {
                            setStepIndex(index - 1);
                        }, 800);
                    } else {
                        setStepIndex(index - 1);
                    }
                } else {
                    setStepIndex(index - 1);
                }
            }
        }
    };

    const steps: Step[] = [
        {
            target: "body",
            content: (
                <div className="space-y-2">
                    <h3 className="font-bold text-lg">Welcome to Deriverse Trader! 🚀</h3>
                    <p className="text-sm">
                        Your advanced trading analytics dashboard. Let's take a quick tour to show you around.
                    </p>
                </div>
            ),
            placement: "center",
            disableBeacon: true,
        },
        {
            target: "#tour-view-switcher",
            content: (
                <div>
                    <h4 className="font-bold mb-1">Dual Interface</h4>
                    <p className="text-sm">
                        Switch between <strong>Intelligence</strong> (AI-powered chat) and
                        <strong> Terminal</strong> (Classic dashboard) modes at any time.
                    </p>
                </div>
            ),
        },
        {
            target: "#tour-intelligence-input",
            content: (
                <div>
                    <h4 className="font-bold mb-1">Ask the AI</h4>
                    <p className="text-sm">
                        Type queries like <em>"What is my win rate on SOL?"</em> or <em>"Analyze my recent losses"</em> to get instant insights.
                    </p>
                </div>
            ),
        },
        {
            target: "#tour-terminal-filters",
            content: (
                <div>
                    <h4 className="font-bold mb-1">Smart Filters</h4>
                    <p className="text-sm">
                        Filter your trade history by specific symbols or time ranges to drill down into your performance.
                    </p>
                </div>
            ),
        },
        {
            target: "#tour-add-journal",
            content: (
                <div>
                    <h4 className="font-bold mb-1">Trading Journal</h4>
                    <p className="text-sm">
                        Keep track of your psychology and strategy by ensuring every trade has a journal entry.
                    </p>
                </div>
            ),
        },
        {
            target: "#tour-friendly-overview",
            content: (
                <div>
                    <h4 className="font-bold mb-1">Quick Overview</h4>
                    <p className="text-sm">
                        Get a simplified, easy-to-read summary of your trading performance with one click.
                    </p>
                </div>
            ),
        },
        {
            target: "#tour-empty-state-action",
            content: (
                <div>
                    <h4 className="font-bold mb-1">Start Trading</h4>
                    <p className="text-sm">
                        Execute trades on Deriverse to start populating your analytics dashboard automatically.
                    </p>
                </div>
            ),
        },
        {
            target: "#tour-wallet-profile",
            content: (
                <div>
                    <h4 className="font-bold mb-1">Wallet & Profile</h4>
                    <p className="text-sm">
                        Manage your connected wallet and view your portfolio summary here.
                    </p>
                </div>
            ),
        },
        {
            target: "#tour-notifications",
            content: (
                <div>
                    <h4 className="font-bold mb-1">Notifications</h4>
                    <p className="text-sm">
                        Stay updated with real-time alerts on trade executions and risk metrics.
                    </p>
                </div>
            ),
        },
        {
            target: "#tour-sidebar-toggle",
            content: (
                <div>
                    <h4 className="font-bold mb-1">Navigation</h4>
                    <p className="text-sm">
                        Access comprehensive features like Trade History, Performance Charts, and Settings from the sidebar.
                    </p>
                </div>
            ),
        },
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            continuous
            showProgress
            showSkipButton
            disableOverlayClose
            spotlightPadding={4}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 10000,
                    backgroundColor: "#09090B", // Zinc-950
                    arrowColor: "#09090B",
                    textColor: "#FAFAFA", // Zinc-50
                    overlayColor: "rgba(0, 0, 0, 0.85)",
                    primaryColor: "#22c55e", // Primary Green (adjust if needed)
                },
                tooltip: {
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "20px",
                },
                buttonNext: {
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "8px 16px",
                    outline: "none",
                },
                buttonBack: {
                    marginRight: "10px",
                    color: "#A1A1AA", // Zinc-400
                },
                buttonSkip: {
                    color: "#52525B", // Zinc-600
                },
            }}
        />
    );
}
