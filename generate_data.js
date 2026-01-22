const XLSX = require('xlsx');

const data = [
    { "Medicine Name": "Paracetamol 500mg", "Price": 5.00, "Stock": 100 },
    { "Medicine Name": "Amoxicillin 250mg", "Price": 12.50, "Stock": 50 },
    { "Medicine Name": "Ibuprofen 400mg", "Price": 8.00, "Stock": 75 },
    { "Medicine Name": "Cetirizine 10mg", "Price": 3.00, "Stock": 200 },
    { "Medicine Name": "Aspirin 75mg", "Price": 4.50, "Stock": 150 },
    { "Medicine Name": "Omeprazole 20mg", "Price": 15.00, "Stock": 60 },
    { "Medicine Name": "Metformin 500mg", "Price": 6.00, "Stock": 90 },
    { "Medicine Name": "Atorvastatin 10mg", "Price": 18.00, "Stock": 40 },
    { "Medicine Name": "Azithromycin 500mg", "Price": 45.00, "Stock": 30 },
    { "Medicine Name": "Cough Syrup 100ml", "Price": 55.00, "Stock": 25 },
    { "Medicine Name": "Vitamin C 500mg", "Price": 3.50, "Stock": 300 },
    { "Medicine Name": "Zinc Tablets", "Price": 7.00, "Stock": 120 },
    { "Medicine Name": "Bandages (Pack)", "Price": 10.00, "Stock": 500 },
    { "Medicine Name": "Surgical Mask (Box)", "Price": 150.00, "Stock": 50 },
    { "Medicine Name": "Sanitizer 500ml", "Price": 85.00, "Stock": 80 }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Medicines");

XLSX.writeFile(wb, "medicines.xlsx");
console.log("Sample medicines.xlsx file created successfully!");
