import { db } from "../firebase";
import { Customer } from "../../types/inventory";
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";

const CUSTOMERS_COLLECTION = "customers";

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const q = query(collection(db, CUSTOMERS_COLLECTION), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    const customers: Customer[] = [];
    snapshot.forEach((docSnap) => {
      customers.push({ id: docSnap.id, ...docSnap.data() } as Customer);
    });
    return customers;
  } catch (error) {
    console.error("Error fetching customers from Firestore:", error);
    throw error;
  }
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Customer;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching customer ${id} from Firestore:`, error);
    throw error;
  }
};

export const createCustomer = async (customer: Customer): Promise<void> => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, customer.id);
    await setDoc(docRef, customer);
  } catch (error) {
    console.error("Error creating customer in Firestore:", error);
    throw error;
  }
};

export const updateCustomerInFirestore = async (
  id: string,
  updates: Partial<Customer>
): Promise<void> => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error(`Error updating customer ${id} in Firestore:`, error);
    throw error;
  }
};

export const deleteCustomerFromFirestore = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting customer ${id} from Firestore:`, error);
    throw error;
  }
};
