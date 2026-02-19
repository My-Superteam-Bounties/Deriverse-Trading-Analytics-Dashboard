import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
    setDemoMode: (isDemo: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Initialize with false (Live Mode) by default for all users.
            // The `persist` middleware will overwrite this with the value from localStorage immediately after hydration if it exists.
            isDemoMode: false,

            toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
            setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
        }),
        {
            name: 'deriverse-app-storage',
            // Custom storage to ensure we handle the boolean correctly
            storage: {
                getItem: (name) => {
                    if (typeof window === 'undefined') return null;
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    const existing = JSON.parse(str);
                    return {
                        state: {
                            ...existing.state,
                            // Ensure priority: existing storage > env var
                            // If key exists in storage, use it. If not, use env var default (handled by zustand init above)
                        },
                        version: existing.version
                    };
                },
                setItem: (name, value) => {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(name, JSON.stringify(value));
                    }
                },
                removeItem: (name) => {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(name);
                    }
                },
            },
        }
    )
);

// Helper to access state outside components
export const getIsDemoMode = () => useAppStore.getState().isDemoMode;
