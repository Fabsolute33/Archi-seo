import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { SEOProject } from '../types/agents';

/**
 * Get the projects collection path for a user
 */
function getProjectsCollection(userId: string) {
    return collection(db, 'users', userId, 'projects');
}

/**
 * Deep clone and serialize nested arrays to JSON strings for Firestore compatibility
 * Firestore doesn't support nested arrays (arrays within arrays)
 */
function serializeForFirestore(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        // Check if this is a nested array (array of arrays)
        if (obj.length > 0 && Array.isArray(obj[0])) {
            // Serialize nested array as JSON string with marker
            return { __nestedArray: true, data: JSON.stringify(obj) };
        }
        // Regular array - recursively process elements
        return obj.map(item => serializeForFirestore(item));
    }

    if (typeof obj === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = serializeForFirestore(value);
        }
        return result;
    }

    return obj;
}

/**
 * Deserialize JSON strings back to nested arrays when loading from Firestore
 */
function deserializeFromFirestore(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deserializeFromFirestore(item));
    }

    if (typeof obj === 'object') {
        const record = obj as Record<string, unknown>;
        // Check if this is a serialized nested array
        if (record.__nestedArray === true && typeof record.data === 'string') {
            return JSON.parse(record.data);
        }
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(record)) {
            result[key] = deserializeFromFirestore(value);
        }
        return result;
    }

    return obj;
}

/**
 * Save a project to Firestore (under user's collection)
 */
export async function saveProject(userId: string, project: SEOProject): Promise<void> {
    const docRef = doc(db, 'users', userId, 'projects', project.id);
    // Serialize nested arrays before saving
    const serializedProject = serializeForFirestore({
        ...project,
        updatedAt: Date.now()
    });
    await setDoc(docRef, serializedProject as Record<string, unknown>);
}

/**
 * Get all projects from Firestore for a specific user
 */
export async function getProjects(userId: string): Promise<SEOProject[]> {
    const q = query(
        getProjectsCollection(userId),
        orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => deserializeFromFirestore(doc.data()) as SEOProject);
}

/**
 * Get a single project by ID for a specific user
 */
export async function getProject(userId: string, id: string): Promise<SEOProject | null> {
    const docRef = doc(db, 'users', userId, 'projects', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return deserializeFromFirestore(docSnap.data()) as SEOProject;
    }
    return null;
}

/**
 * Delete a project from Firestore for a specific user
 */
export async function deleteProject(userId: string, id: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'projects', id);
    await deleteDoc(docRef);
}

/**
 * Generate a unique project ID
 */
export function generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
