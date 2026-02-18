
export interface DriveJournalEntry {
    date: string;
    tradeId?: string;
    symbol?: string;
    side?: string;
    pnl?: string;
    mood: string;
    notes: string;
    tags: string;
}

export class GoogleDriveService {

    public async ensureFolder(): Promise<void> {
        const res = await fetch('/api/drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'ensureFolder' }),
        });
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        if (!res.ok) throw new Error('Failed to ensure folder');
    }

    public async appendEntry(entry: any): Promise<string> {
        const response = await fetch('/api/drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'appendEntry', entry }),
        });

        if (response.status === 401) throw new Error("UNAUTHORIZED");

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.fileId;
    }

    public async listEntries(): Promise<any[]> {
        const response = await fetch('/api/drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'listEntries' }),
        });

        if (response.status === 401) {
            throw new Error("UNAUTHORIZED");
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.entries;
    }
}

export const googleDriveService = new GoogleDriveService();
