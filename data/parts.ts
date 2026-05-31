import { Part } from "../types/inventory";

export const initialParts: Part[] = [
  {
    id: "part-1",
    name: "Brake Pad Set",
    nameKu: "سێتی پد بڕێک",
    partNumber: "04465-0R040",
    condition: "new",
    supplier: "Ahmad Auto Parts",
    buyPriceUSD: 28.00,
    sellPriceIQD: 45000,
    quantity: 12,
    lowStockThreshold: 5,
    status: "inStock",
    compatibleCars: [
      { brand: "Toyota", model: "Camry", yearFrom: 2015, yearTo: 2020 },
      { brand: "Toyota", model: "Corolla", yearFrom: 2014, yearTo: 2019 }
    ]
  },
  {
    id: "part-2",
    name: "Oil Filter",
    nameKu: "فلتەری نەوت",
    partNumber: "26300-35505",
    condition: "new",
    supplier: "Ahmad Auto Parts",
    buyPriceUSD: 7.50,
    sellPriceIQD: 12500,
    quantity: 3,
    lowStockThreshold: 5,
    status: "lowStock",
    compatibleCars: [
      { brand: "Kia", model: "Sportage", yearFrom: 2016, yearTo: 2021 }
    ]
  },
  {
    id: "part-3",
    name: "Spark Plug",
    nameKu: "شەمەی مۆتۆر",
    partNumber: "IFR6T11",
    condition: "new",
    supplier: "Ahmad Auto Parts",
    buyPriceUSD: 3.20,
    sellPriceIQD: 6000,
    quantity: 0,
    lowStockThreshold: 3,
    status: "outOfStock",
    compatibleCars: [
      { brand: "Hyundai", model: "Elantra", yearFrom: 2017, yearTo: 2022 }
    ]
  },
  {
    id: "part-4",
    name: "Alloy Wheel 17 inch",
    nameKu: "ویلی ئەلەمنیۆم ١٧ ئینج",
    partNumber: "AW-17-TY-2015",
    condition: "new",
    supplier: "Ahmad Wheels Co.",
    buyPriceUSD: 80.00,
    sellPriceIQD: 120000,
    quantity: 12,
    lowStockThreshold: 3,
    status: "inStock",
    compatibleCars: [
      { brand: "Toyota", model: "Camry", yearFrom: 2015, yearTo: 2020 },
      { brand: "Toyota", model: "Corolla", yearFrom: 2014, yearTo: 2019 },
      { brand: "Lexus", model: "ES", yearFrom: 2016, yearTo: 2021 }
    ]
  }
];
