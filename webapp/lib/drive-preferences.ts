/**
 * Drive Preferences Service
 *
 * Saves and loads user preferences (including LLM API keys) to/from
 * a `preferences.csv` file in the user's Google Drive `.deriverse-analytics` folder.
 *
 * This is the privacy-first alternative to storing keys in localStorage.
 */

import { AIProvider } from './ai/ai-store';

export interface DrivePreferences {
    provider: AIProvider;
    useDefaultKey: boolean;
    isAgentEnabled: boolean;
    apiKeys: Partial<Record<AIProvider, string>>;
    theme?: string;
}

async function callDriveApi(action: string, payload?: object) {
    const res = await fetch('/api/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Drive request failed');
    }
    return res.json();
}

export async function savePreferencesToDrive(prefs: DrivePreferences): Promise<void> {
    await callDriveApi('savePreferences', { preferences: prefs });
}

export async function loadPreferencesFromDrive(): Promise<DrivePreferences | null> {
    try {
        const data = await callDriveApi('loadPreferences');
        return data.preferences ?? null;
    } catch (e: any) {
        if (e.message === 'UNAUTHORIZED') throw e;
        return null;
    }
}
