import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App and Auth with our workspace-provisioned config
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Request the target spreadsheets scope for reading and writing Sheets
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Initializes the Firebase Auth listener.
 * Clears or caches credentials correctly.
 */
export const initAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

/**
 * Initiates the Google login flow and retrieves the access token.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get Google Sheets API access token.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Firebase Sign In error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Returns the currently active cached Google access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Signs the user out of Google / Firebase.
 */
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Direct fetch interface to insert values into a given sheet range.
 */
export const updateSheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      range,
      majorDimension: "ROWS",
      values
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sheets update failed: ${errText}`);
  }
  return res.json();
};

/**
 * Creates a brand new multi-tab structured Google Sheet for PlantAdda.
 */
export const createUnifiedSpreadsheet = async (
  accessToken: string,
  title: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const url = "https://sheets.googleapis.com/v1/spreadsheets";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: {
        title
      },
      sheets: [
        { properties: { title: "Orders Tab" } },
        { properties: { title: "Plant Inventory" } },
        { properties: { title: "Vendor Directory" } }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Spreadsheet creation failed: ${errText}`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
  };
};

/**
 * Formats order records into rows.
 */
export const formatOrdersData = (orders: any[]): any[][] => {
  const headers = [
    "Order ID",
    "Order Date",
    "Customer Name",
    "Email",
    "Phone",
    "Shipping Address",
    "Assigned Vendor ID",
    "Payment Method",
    "Payment Status",
    "Subtotal (INR)",
    "Delivery (INR)",
    "Total (INR)",
    "Status",
    "Ordered Items"
  ];

  const rows = orders.map(order => {
    const itemsDescription = (order.items || [])
      .map((it: any) => `${it.name} (Qty: ${it.quantity}, Original Price: \u20B9${it.price}, Disc: ${it.discount}%)`)
      .join(" | ");

    return [
      order.id || "N/A",
      order.orderDate || "N/A",
      order.customerName || "N/A",
      order.customerEmail || "N/A",
      order.customerPhone || "N/A",
      order.customerAddress || "N/A",
      order.assignedVendorId || "Auto-match pending",
      order.paymentMethod || "N/A",
      order.paymentStatus || "N/A",
      order.subtotal || 0,
      order.deliveryCharge || 0,
      order.total || 0,
      order.status || "pending",
      itemsDescription
    ];
  });

  return [headers, ...rows];
};

/**
 * Formats plant records into rows.
 */
export const formatPlantsData = (plants: any[]): any[][] => {
  const headers = [
    "Plant ID",
    "Plant Name",
    "Category",
    "Base Price (INR)",
    "Discount (%)",
    "Effective Price (INR)",
    "Stock Count",
    "Preferred Season",
    "Is Trending?",
    "Vendor ID",
    "Approval Status",
    "Description",
    "Care Instructions"
  ];

  const rows = plants.map(plant => {
    const net = Math.round(plant.price * (1 - (plant.discount || 0) / 100));
    return [
      plant.id || "N/A",
      plant.name || "N/A",
      plant.category || "N/A",
      plant.price || 0,
      plant.discount || 0,
      net,
      plant.stock || 0,
      plant.season || "All Season",
      plant.isTrending ? "TRUE" : "FALSE",
      plant.vendorId || "N/A",
      plant.isAdminApproved ? "Approved" : "Pending",
      plant.description || "",
      plant.careInstructions || ""
    ];
  });

  return [headers, ...rows];
};

/**
 * Formats vendor directory records into rows.
 */
export const formatVendorsData = (vendors: any[]): any[][] => {
  const headers = [
    "Vendor ID",
    "Owner Name",
    "Nursery Name",
    "Email ID",
    "Contact Phone",
    "Nursery Address/Location",
    "Platform Join Date",
    "Admin Commission Rate (%)",
    "Proposed Courier Rate (INR)",
    "Approved Courier Rate (INR)",
    "Courier Charge Status"
  ];

  const rows = vendors.map(v => [
    v.id || "N/A",
    v.name || "N/A",
    v.nurseryName || "N/A",
    v.contactEmail || "N/A",
    v.contactPhone || "N/A",
    v.address || "N/A",
    v.joinDate || "N/A",
    v.commissionPaidPercent || 0,
    v.proposedDeliveryCharge || 0,
    v.approvedDeliveryCharge || 0,
    v.deliveryChargeStatus || "N/A"
  ]);

  return [headers, ...rows];
};
