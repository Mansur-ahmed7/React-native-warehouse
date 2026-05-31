import { Customer } from "../types/inventory";

export const initialCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Ahmad Hassan Garage",
    initials: "AH",
    color: "blue",
    phone: "+964 750 123 4567",
    specialty: "Toyota specialist",
    balance: 50000
  },
  {
    id: "cust-2",
    name: "Kamal Motors",
    initials: "KM",
    color: "green",
    phone: "+964 770 987 6543",
    specialty: "BMW & Mercedes Parts",
    balance: 120000
  },
  {
    id: "cust-3",
    name: "Soran Auto Service",
    initials: "SA",
    color: "purple",
    phone: "+964 751 555 8888",
    specialty: "General Repairs",
    balance: 0
  }
];
