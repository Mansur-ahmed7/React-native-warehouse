import { db } from "../firebase";
import { Part } from "../../types/inventory";
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";

const PARTS_COLLECTION = "parts";

export const getParts = async (): Promise<Part[]> => {
  try {
    const q = query(collection(db, PARTS_COLLECTION), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    const parts: Part[] = [];
    snapshot.forEach((docSnap) => {
      parts.push({ id: docSnap.id, ...docSnap.data() } as Part);
    });
    return parts;
  } catch (error) {
    console.error("Error fetching parts from Firestore:", error);
    throw error;
  }
};

export const getPartById = async (id: string): Promise<Part | null> => {
  try {
    const docRef = doc(db, PARTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Part;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching part ${id} from Firestore:`, error);
    throw error;
  }
};

export const createPart = async (part: Part): Promise<void> => {
  try {
    const docRef = doc(db, PARTS_COLLECTION, part.id);
    await setDoc(docRef, {
      ...part,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error creating part in Firestore:", error);
    throw error;
  }
};

export const updatePartInFirestore = async (
  id: string,
  updates: Partial<Part>
): Promise<void> => {
  try {
    const docRef = doc(db, PARTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating part ${id} in Firestore:`, error);
    throw error;
  }
};

export const deletePartFromFirestore = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PARTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting part ${id} from Firestore:`, error);
    throw error;
  }
};
