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

const PROJECTS_COLLECTION = 'projects';

/**
 * Save a project to Firestore
 */
export async function saveProject(project: SEOProject): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, project.id);
    await setDoc(docRef, {
        ...project,
        updatedAt: Date.now()
    });
}

/**
 * Get all projects from Firestore
 */
export async function getProjects(): Promise<SEOProject[]> {
    const q = query(
        collection(db, PROJECTS_COLLECTION),
        orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as SEOProject);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<SEOProject | null> {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as SEOProject;
    }
    return null;
}

/**
 * Delete a project from Firestore
 */
export async function deleteProject(id: string): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
}

/**
 * Generate a unique project ID
 */
export function generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
