
import { google } from 'googleapis';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from 'next/server';

const FOLDER_NAME = '.deriverse-analytics';
const FILENAME = 'journal.csv';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    const drive = google.drive({ version: 'v3', auth });

    try {
        const body = await req.json();
        const { action, entry } = body;

        if (action === 'ensureFolder') {
            // 1. Find Folder
            const listRes = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
                fields: 'files(id, name)',
            });

            let folderId = listRes.data.files?.[0]?.id;

            // 2. Create if missing
            if (!folderId) {
                const createRes = await drive.files.create({
                    requestBody: {
                        name: FOLDER_NAME,
                        mimeType: 'application/vnd.google-apps.folder',
                    },
                    fields: 'id',
                });
                folderId = createRes.data.id;
            }
            return NextResponse.json({ folderId });
        }

        if (action === 'appendEntry') {
            // 1. Get Folder ID
            const listRes = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
                fields: 'files(id, name)',
            });
            let folderId = listRes.data.files?.[0]?.id;

            if (!folderId) {
                // Safety Create if somehow missing
                const createRes = await drive.files.create({
                    requestBody: {
                        name: FOLDER_NAME,
                        mimeType: 'application/vnd.google-apps.folder',
                    },
                    fields: 'id',
                });
                folderId = createRes.data.id;
            }

            // 2. Find File
            const fileListRes = await drive.files.list({
                q: `name='${FILENAME}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id, name)',
            });

            let fileId = fileListRes.data.files?.[0]?.id;
            let currentContent = 'Date,TradeID,Symbol,Side,PnL,Mood,Notes,Tags,Type\n';

            if (fileId) {
                const getRes = await drive.files.get({
                    fileId: fileId,
                    alt: 'media',
                });
                currentContent = getRes.data as unknown as string; // Check type casting
            }

            // 3. Append
            const clean = (s: string | undefined) => (s || '').replace(/,/g, ';').replace(/\n/g, ' ');
            // Default to OFFCHAIN if type is missing (for backward compatibility)
            const type = entry.type || 'OFFCHAIN';
            const newRow = `${clean(entry.date)},${clean(entry.tradeId)},${clean(entry.symbol)},${clean(entry.side)},${clean(entry.pnl)},${clean(entry.mood)},${clean(entry.notes)},${clean(entry.tags)},${type}\n`;
            const newContent = currentContent + newRow;

            // 4. Update or Create
            if (fileId) {
                await drive.files.update({
                    fileId: fileId,
                    media: {
                        mimeType: 'text/csv',
                        body: newContent
                    }
                });
            } else {
                const createRes = await drive.files.create({
                    requestBody: {
                        name: FILENAME,
                        mimeType: 'text/csv',
                        parents: [folderId!],
                    },
                    media: {
                        mimeType: 'text/csv',
                        body: newContent
                    },
                    fields: 'id'
                });
                fileId = createRes.data.id;
            }

            return NextResponse.json({ fileId });
        }

        if (action === 'listEntries') {
            // 1. Find Folder
            const listRes = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
                fields: 'files(id, name)',
            });
            const folderId = listRes.data.files?.[0]?.id;

            if (!folderId) return NextResponse.json({ entries: [] });

            // 2. Find File
            const fileListRes = await drive.files.list({
                q: `name='${FILENAME}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id, name)',
            });
            const fileId = fileListRes.data.files?.[0]?.id;

            if (!fileId) return NextResponse.json({ entries: [] });

            // 3. Read Content
            const getRes = await drive.files.get({
                fileId: fileId,
                alt: 'media',
            });
            const csvContent = getRes.data as unknown as string;

            // 4. Parse CSV (Simple)
            const lines = csvContent.split('\n').filter(line => line.trim() !== '');
            const headers = lines[0].split(',');
            const entries = lines.slice(1).map(line => {
                const values = line.split(',');
                // Handle potential commas in content (naive implementation, but matches append logic)
                // In production, use a real CSV parser
                const entry: any = {};
                headers.forEach((header, index) => {
                    entry[header.trim().toLowerCase()] = values[index]?.replace(/;/g, ',') || '';
                });
                return entry;
            });

            return NextResponse.json({ entries: entries.reverse() }); // Newest first
        }

        if (action === 'savePreferences') {
            const { preferences } = body;
            const PREFS_FILENAME = 'preferences.json';

            // Ensure folder exists
            const folderListRes = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
                fields: 'files(id)',
            });
            let folderId = folderListRes.data.files?.[0]?.id;
            if (!folderId) {
                const createRes = await drive.files.create({
                    requestBody: { name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' },
                    fields: 'id',
                });
                folderId = createRes.data.id!;
            }

            // Find existing prefs file
            const prefsListRes = await drive.files.list({
                q: `name='${PREFS_FILENAME}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id)',
            });
            const existingId = prefsListRes.data.files?.[0]?.id;
            const content = JSON.stringify(preferences, null, 2);

            if (existingId) {
                await drive.files.update({
                    fileId: existingId,
                    media: { mimeType: 'application/json', body: content },
                });
                return NextResponse.json({ fileId: existingId });
            } else {
                const createRes = await drive.files.create({
                    requestBody: { name: PREFS_FILENAME, mimeType: 'application/json', parents: [folderId] },
                    media: { mimeType: 'application/json', body: content },
                    fields: 'id',
                });
                return NextResponse.json({ fileId: createRes.data.id });
            }
        }

        if (action === 'loadPreferences') {
            const PREFS_FILENAME = 'preferences.json';

            const folderListRes = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
                fields: 'files(id)',
            });
            const folderId = folderListRes.data.files?.[0]?.id;
            if (!folderId) return NextResponse.json({ preferences: null });

            const prefsListRes = await drive.files.list({
                q: `name='${PREFS_FILENAME}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id)',
            });
            const fileId = prefsListRes.data.files?.[0]?.id;
            if (!fileId) return NextResponse.json({ preferences: null });

            const getRes = await drive.files.get({ fileId, alt: 'media' });
            const preferences = JSON.parse(getRes.data as unknown as string);
            return NextResponse.json({ preferences });
        }

        if (action === 'saveChat') {
            const { filename, content, fileId } = body;
            const CHATS_FOLDER = 'Chats';

            // 1. Ensure Root Folder
            const rootRes = await ensureFolder(drive, FOLDER_NAME);
            const rootId = rootRes.id;

            // 2. Ensure Chats Subfolder
            const chatsRes = await ensureFolder(drive, CHATS_FOLDER, rootId);
            const chatsId = chatsRes.id;

            // 3. Create or Update File
            if (fileId) {
                await drive.files.update({
                    fileId: fileId,
                    media: { mimeType: 'application/json', body: content },
                });
                return NextResponse.json({ fileId });
            } else {
                // Check if file with same name exists first (to avoid duplicates on re-save)
                const existing = await drive.files.list({
                    q: `name='${filename}' and '${chatsId}' in parents and trashed=false`,
                    fields: 'files(id)',
                });

                if (existing.data.files?.[0]?.id) {
                    await drive.files.update({
                        fileId: existing.data.files[0].id,
                        media: { mimeType: 'application/json', body: content },
                    });
                    return NextResponse.json({ fileId: existing.data.files[0].id });
                }

                const createRes = await drive.files.create({
                    requestBody: {
                        name: filename,
                        mimeType: 'application/json',
                        parents: [chatsId]
                    },
                    media: { mimeType: 'application/json', body: content },
                    fields: 'id',
                });
                return NextResponse.json({ fileId: createRes.data.id });
            }
        }

        if (action === 'listChats') {
            const CHATS_FOLDER = 'Chats';

            // 1. Find Root
            const rootList = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
                fields: 'files(id)',
            });
            const rootId = rootList.data.files?.[0]?.id;
            if (!rootId) return NextResponse.json({ chats: [] });

            // 2. Find Chats Folder
            const chatsList = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${CHATS_FOLDER}' and '${rootId}' in parents and trashed=false`,
                fields: 'files(id)',
            });
            const chatsId = chatsList.data.files?.[0]?.id;
            if (!chatsId) return NextResponse.json({ chats: [] });

            // 3. List JSON Files
            const filesRes = await drive.files.list({
                q: `'${chatsId}' in parents and mimeType='application/json' and trashed=false`,
                orderBy: 'modifiedTime desc',
                fields: 'files(id, name, modifiedTime)',
                pageSize: 20 // Limit to recent chats
            });

            return NextResponse.json({ chats: filesRes.data.files });
        }

        if (action === 'loadChat') {
            const { fileId } = body;
            if (!fileId) return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });

            try {
                const getRes = await drive.files.get({ fileId, alt: 'media' });
                return NextResponse.json({ content: getRes.data });
            } catch (err) {
                console.error("Failed to load chat:", err);
                return NextResponse.json({ error: 'Failed to load chat' }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error(error);
        if (error.code === 401 || error.message?.includes('invalid_grant') || error.message?.includes('Invalid Credentials')) {
            return NextResponse.json({ error: 'Session expired or invalid credentials' }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper to ensure folder exists
async function ensureFolder(drive: any, name: string, parentId?: string) {
    const q = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false ${parentId ? `and '${parentId}' in parents` : ''}`;
    const listRes = await drive.files.list({ q, fields: 'files(id)' });

    if (listRes.data.files?.[0]?.id) {
        return { id: listRes.data.files[0].id };
    }

    const createRes = await drive.files.create({
        requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : undefined,
        },
        fields: 'id',
    });
    return { id: createRes.data.id };
}
