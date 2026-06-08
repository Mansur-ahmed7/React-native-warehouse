import { db } from "../firebase";
import { SaleRecord } from "../../types/inventory";
import { collection, doc, getDocs, setDoc, query, orderBy } from "firebase/firestore";

const SALES_COLLECTION = "sales";

export const getSalesHistory = async (): Promise<SaleRecord[]> => {
  try {
    const q = query(collection(db, SALES_COLLECTION), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const sales: SaleRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const timestamp = data.timestamp?.seconds 
        ? new Date(data.timestamp.seconds * 1000) 
        : new Date(data.timestamp);

      sales.push({ 
        id: docSnap.id, 
        ...data,
        timestamp 
      } as SaleRecord);
    });
    return sales;
  } catch (error) {
    console.error("Error fetching sales history from Firestore:", error);
    throw error;
  }
};

export const createSaleRecord = async (sale: SaleRecord): Promise<void> => {
  try {
    const docRef = doc(db, SALES_COLLECTION, sale.id);
    await setDoc(docRef, {
      ...sale,
      timestamp: sale.timestamp.toISOString()
    });
  } catch (error) {
    console.error("Error saving sale record in Firestore:", error);
    throw error;
  }
};
