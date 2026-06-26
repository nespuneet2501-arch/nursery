import React, { useState, useEffect } from "react";
import { 
  Sprout, 
  ShoppingBag, 
  Search, 
  Filter, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  ChevronRight, 
  Coins, 
  Clock, 
  Camera, 
  Truck, 
  CreditCard,
  Percent,
  X,
  PlusCircle,
  Check,
  Building,
  Bell,
  Settings,
  Grid
} from "lucide-react";
import { Category, Plant, Vendor, Order, DeliverySettings, UserSession, Customer } from "./types";
import { translations } from "./translations";
import { PlantAddaLogo } from "./components/PlantAddaLogo";
const initialSettings = {
  id: "settings",
  freeDeliveryThreshold: 499,
  standardDeliveryCharge: 49,
  baseCommissionPercent: 12
};
const initialPromo = {
  imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80",
  title: "🌱 Monsoon Special Sale: Flat 20% OFF on all Green Air Purifiers!",
  isActive: true,
  newsText: "PlantAdda certified local nursery centers are now fully operational in 12+ states in India!"
};

export default function App() {
  // Navigation & Active Session States
  // Session can be: { role: "guest" } OR { role: "admin" } OR { role: "vendor", vendor: Vendor } OR { role: "customer", customer: Customer }
  const [activeSession, setActiveSession] = useState<{
    role: "guest" | "admin" | "vendor" | "customer";
    data?: any;
  }>(() => {
    try {
      const saved = localStorage.getItem("plantadda_session");
      return saved ? JSON.parse(saved) : { role: "guest" };
    } catch {
      return { role: "guest" };
    }
  });

  // Data States
  const [plants, setPlants] = useState<Plant[]>(() => {
    try {
      const saved = localStorage.getItem("plantadda_plants");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem("plantadda_vendors");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem("plantadda_customers");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("plantadda_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(() => {
    try {
      const saved = localStorage.getItem("plantadda_deliverySettings");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return initialSettings;
  });

  const [promoBanner, setPromoBanner] = useState(() => {
    try {
      const saved = localStorage.getItem("plantadda_promoBanner");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return initialPromo;
  });

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "discount">("default");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTab, setLoginTab] = useState<"customer" | "vendor" | "admin">("customer");
  const [cart, setCart] = useState<{ plantId: string; name: string; price: number; discount: number; adminDiscount: number; quantity: number; imageUrl: string; vendorId: string }[]>(() => {
    try {
      const saved = localStorage.getItem("plantadda_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "success" | "info" | "warning"; timestamp: Date }[]>([]);

  // Checkout parameters
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details" | "success">("cart");
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutPhoto, setCheckoutPhoto] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI_PHONEPE" | "UPI_GPAY" | "UPI_PAYTM" | "QR_CODE">("UPI_PHONEPE");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // QR Countdown and scanning loop
  const [qrScanStatus, setQrScanStatus] = useState<"idle" | "scanning" | "success">("idle");
  const [qrCountdown, setQrCountdown] = useState(300);

  useEffect(() => {
    let timer: any;
    if (checkoutStep === "details") {
      setQrCountdown(300);
      setQrScanStatus("idle");
      timer = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [checkoutStep]);

  // Admin and Vendor Form inputs
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [vendorLoginEmail, setVendorLoginEmail] = useState("");
  const [vendorLoginPassword, setVendorLoginPassword] = useState("");
  const [selectedVendorForLogin, setSelectedVendorForLogin] = useState<Vendor | null>(null);
  
  // Vendor Registration Inputs
  const [vendorRegName, setVendorRegName] = useState("");
  const [vendorRegNursery, setVendorRegNursery] = useState("");
  const [vendorRegEmail, setVendorRegEmail] = useState("");
  const [vendorRegPhone, setVendorRegPhone] = useState("");
  const [vendorRegAddress, setVendorRegAddress] = useState("");
  const [vendorRegPhoto, setVendorRegPhoto] = useState("");

  // Customer Login Inputs (For payment authentication)
  const [customerLoginEmail, setCustomerLoginEmail] = useState("");
  const [customerRegName, setCustomerRegName] = useState("");
  const [customerRegEmail, setCustomerRegEmail] = useState("");
  const [customerRegPhone, setCustomerRegPhone] = useState("");
  const [customerRegAddress, setCustomerRegAddress] = useState("");
  const [customerRegPhoto, setCustomerRegPhoto] = useState("");
  const [customerAuthTab, setCustomerAuthTab] = useState<"login" | "register">("login");

  // Plant addition / edit states for Nursery Owner
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [plantName, setPlantName] = useState("");
  const [plantCategory, setPlantCategory] = useState<Category>(Category.INDOOR_PLANTS);
  const [plantPrice, setPlantPrice] = useState("299");
  const [plantDiscount, setPlantDiscount] = useState("10");
  const [plantCare, setPlantCare] = useState("");
  const [plantImage, setPlantImage] = useState("");
  const [plantStock, setPlantStock] = useState("20");
  const [plantSeason, setPlantSeason] = useState("All Season");
  const [plantDesc, setPlantDesc] = useState("");

  // Admin dynamic banner states
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerNews, setBannerNews] = useState("");
  const [bannerActive, setBannerActive] = useState(true);

  // Admin delivery setting inputs
  const [deliveryChargeInput, setDeliveryChargeInput] = useState("49");
  const [deliveryThresholdInput, setDeliveryThresholdInput] = useState("499");
  const [proposedShippingInput, setProposedShippingInput] = useState("45");

  // Multi-language support (Hindi / English) and Theme states
  const [language, setLanguage] = useState<"en" | "hi">(() => {
    return (localStorage.getItem("plantadda_lang") as "en" | "hi") || "en";
  });
  const [activeTheme, setActiveTheme] = useState<"emerald" | "terracotta" | "teal">(() => {
    return (localStorage.getItem("plantadda_theme") as "emerald" | "terracotta" | "teal") || "emerald";
  });

  // Supabase Database Console Integration States
  const [dbConnections, setDbConnections] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("plantadda_dbConnections");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [dbSyncing, setDbSyncing] = useState(false);
  const [dbConsoleOutput, setDbConsoleOutput] = useState("");
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM public.vendors;");
  const [sqlQueryRows, setSqlQueryRows] = useState<any[]>([]);
  const [sqlQueryMessage, setSqlQueryMessage] = useState("");
  const [sqlQueryLoading, setSqlQueryLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("plantadda_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("plantadda_theme", activeTheme);
  }, [activeTheme]);

  const fetchDbConnections = async () => {
    try {
      const res = await fetch("/api/admin/db-connections");
      const data = await res.json();
      setDbConnections(data || []);
      if (data && data.length > 0) {
        localStorage.setItem("plantadda_dbConnections", JSON.stringify(data));
      }
      
      // Auto-connect and auto-sync on startup to ensure "everything is automatic"
      if (data && data.length > 0) {
        const primaryConn = data[0];
        if (primaryConn && primaryConn.id) {
          fetch(`/api/admin/db-connections/${primaryConn.id}/test`, { method: "POST" })
            .then(() => {
              fetch(`/api/admin/db-connections/${primaryConn.id}/sync`, { method: "POST" })
                .then(() => {
                  console.log("Database auto-connection & synchronization completed successfully.");
                })
                .catch(err => console.error("Database auto-sync failed:", err));
            })
            .catch(err => console.error("Database auto-connect failed:", err));
        }
      }
    } catch (e) {
      console.error("Error loading DB connections:", e);
    }
  };

  // Static SQL Schema fallback for offline/static environments
  const staticSqlSchema = `-- Create Nursery Vendors Table
CREATE TABLE public.vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nursery_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT,
  status TEXT DEFAULT 'pending',
  photograph TEXT,
  join_date TEXT,
  commission_paid_percent NUMERIC DEFAULT 10,
  proposed_delivery_charge NUMERIC DEFAULT 0,
  approved_delivery_charge NUMERIC DEFAULT 0,
  delivery_charge_status TEXT DEFAULT 'pending'
);

-- Create Plants Table
CREATE TABLE public.plants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  admin_discount NUMERIC DEFAULT 0,
  care_instructions TEXT,
  image_urls TEXT[],
  stock INTEGER DEFAULT 0,
  season TEXT,
  description TEXT,
  is_trending BOOLEAN DEFAULT FALSE,
  vendor_id TEXT REFERENCES public.vendors(id),
  is_admin_approved BOOLEAN DEFAULT FALSE
);

-- Create Customers Table
CREATE TABLE public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  photograph TEXT
);

-- Create Orders Table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  items JSONB,
  subtotal NUMERIC,
  delivery_charge NUMERIC,
  total NUMERIC,
  payment_method TEXT,
  payment_status TEXT,
  order_date TEXT,
  assigned_vendor_id TEXT,
  status TEXT DEFAULT 'pending'
);`;

  const handleTestConnection = async (connId: string) => {
    try {
      const res = await fetch(`/api/admin/db-connections/${connId}/test`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        addNotification(`🟢 Connected: ${data.message}`, "success");
        fetchDbConnections();
      } else {
        addNotification(data.error || "Connection test failed", "warning");
      }
    } catch (err) {
      addNotification("🟢 Sandbox Database Ping: Operational (Local Cache Active)", "success");
    }
  };

  const handleSyncDatabase = async (connId: string) => {
    setDbSyncing(true);
    setDbConsoleOutput("Initiating full synchronization of tables: public.vendors, public.plants, public.customers, public.orders...\n");
    try {
      const res = await fetch(`/api/admin/db-connections/${connId}/sync`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        let output = `[STATUS] ${data.message}\n`;
        output += `[TIMESTAMP] ${data.timestamp}\n`;
        output += `[RECORDS SYNCED] Plants: ${data.recordsSynced.plants}, Vendors: ${data.recordsSynced.vendors}, Customers: ${data.recordsSynced.customers}, Orders: ${data.recordsSynced.orders}\n`;
        if (data.isSimulated) {
          output += `\n[ACTION REQUIRED] Copy and run the following SQL schema in your Supabase SQL Editor to initialize your Cloud Database tables:\n\n${data.sqlSchema}\n`;
        } else {
          output += `\n🟢 All tables initialized and records safely persisted in Supabase Cloud!`;
        }
        setDbConsoleOutput(output);
        addNotification(data.isSimulated ? "Database schema sandbox created!" : "Real-time Supabase cloud synchronization complete!", "success");
        fetchDbConnections();
      } else {
        setDbConsoleOutput(`❌ Sync failed: ${data.error}`);
        addNotification("Synchronization failed.", "warning");
      }
    } catch (err) {
      console.warn("API database sync failed, using static fallback explanation", err);
      let output = `[ENVIRONMENT] Static Live Website (e.g. GitHub Pages / Vercel fallback)\n`;
      output += `[STATUS] Simulated Sandbox Tables fully operational in Browser LocalStorage!\n`;
      output += `[TIMESTAMP] ${new Date().toISOString()}\n`;
      output += `[LOCAL RECORDS PRE-SEEDED] Plants: ${plants.length}, Vendors: ${vendors.length}, Customers: ${customers.length}, Orders: ${orders.length}\n`;
      output += `\n💡 Tip: Your browser has pre-loaded all data statically from db.json. Any edits are fully saved in LocalStorage!\n`;
      output += `\n[ACTION REQUIRED FOR DIRECT CLOUD PERSISTENCE] Copy and run the following SQL schema in your Supabase SQL Editor to initialize your Cloud Database tables:\n\n${staticSqlSchema}\n`;
      setDbConsoleOutput(output);
      addNotification("Database Sandbox Synchronized statically!", "success");
    } finally {
      setDbSyncing(false);
    }
  };

  const handleRunSQL = async (connId: string) => {
    if (!sqlQuery.trim()) return;
    setSqlQueryLoading(true);
    setSqlQueryRows([]);
    setSqlQueryMessage("");
    try {
      const res = await fetch(`/api/admin/db-connections/${connId}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlQuery })
      });
      const data = await res.json();
      if (res.ok) {
        setSqlQueryRows(data.rows || []);
        setSqlQueryMessage(data.message);
        addNotification(data.isSimulated ? "Simulated query executed" : "Query executed on live Supabase", "success");
      } else {
        setSqlQueryMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      console.warn("API SQL query failed, using offline simulated execution", err);
      const queryLower = sqlQuery.toLowerCase().trim();
      let matchedRows: any[] = [];
      let msg = "";
      
      if (queryLower.includes("vendors")) {
        matchedRows = vendors;
        msg = `Simulated Offline Query: SELECT * FROM public.vendors [Returned ${vendors.length} rows from local state]`;
      } else if (queryLower.includes("plants")) {
        matchedRows = plants;
        msg = `Simulated Offline Query: SELECT * FROM public.plants [Returned ${plants.length} rows from local state]`;
      } else if (queryLower.includes("customers")) {
        matchedRows = customers;
        msg = `Simulated Offline Query: SELECT * FROM public.customers [Returned ${customers.length} rows from local state]`;
      } else if (queryLower.includes("orders")) {
        matchedRows = orders;
        msg = `Simulated Offline Query: SELECT * FROM public.orders [Returned ${orders.length} rows from local state]`;
      } else {
        msg = `Simulated offline success! Local sandbox tables are active. (Use SELECT * FROM public.vendors / plants / customers / orders to view lists)`;
      }
      
      setSqlQueryRows(matchedRows);
      setSqlQueryMessage(msg);
      addNotification("Offline Query executed successfully on local database sandbox!", "success");
    } finally {
      setSqlQueryLoading(false);
    }
  };

  // Effect to load initial data
  useEffect(() => {
    fetchPlants();
    fetchVendors();
    fetchCustomers();
    fetchOrders();
    fetchDeliverySettings();
    fetchPromoBanner();
    fetchDbConnections();
  }, []);

  // Translation helper
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key] || "";
  };

  // Dynamic Theme Colors Mapper
  const theme = {
    emerald: {
      bg: "bg-emerald-800",
      text: "text-emerald-800",
      hover: "hover:bg-emerald-950",
      border: "border-emerald-100",
      accentBg: "bg-emerald-50",
      accentText: "text-emerald-950",
      btn: "bg-emerald-800 text-white hover:bg-emerald-950",
      badge: "bg-emerald-100 text-emerald-800",
      shadow: "shadow-emerald-200"
    },
    terracotta: {
      bg: "bg-amber-700",
      text: "text-amber-700",
      hover: "hover:bg-amber-900",
      border: "border-amber-100",
      accentBg: "bg-amber-50",
      accentText: "text-amber-950",
      btn: "bg-amber-700 text-white hover:bg-amber-900",
      badge: "bg-amber-100 text-amber-800",
      shadow: "shadow-amber-200"
    },
    teal: {
      bg: "bg-teal-800",
      text: "text-teal-800",
      hover: "hover:bg-teal-950",
      border: "border-teal-100",
      accentBg: "bg-teal-50",
      accentText: "text-teal-950",
      btn: "bg-teal-800 text-white hover:bg-teal-950",
      badge: "bg-teal-100 text-teal-800",
      shadow: "shadow-teal-200"
    }
  }[activeTheme];

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem("plantadda_cart", JSON.stringify(cart));
  }, [cart]);

  // Save session to local storage
  useEffect(() => {
    localStorage.setItem("plantadda_session", JSON.stringify(activeSession));
    if (activeSession.role === "customer" && activeSession.data) {
      setCheckoutName(activeSession.data.name || "");
      setCheckoutEmail(activeSession.data.email || "");
      setCheckoutPhone(activeSession.data.phone || "");
      setCheckoutAddress(activeSession.data.address || "");
    }
  }, [activeSession]);

  // Add a beautiful toast notification
  const addNotification = (message: string, type: "success" | "info" | "warning" = "info") => {
    const id = Date.now().toString();
    setNotifications(prev => [{ id, message, type, timestamp: new Date() }, ...prev].slice(0, 5));
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  // FETCH METHODS
  // Load initial static data from db.json if API is offline
  const loadInitialStaticData = async () => {
    const urls = [
      `${(import.meta as any).env?.BASE_URL || "/"}db.json`,
      "db.json",
      "/db.json"
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const db = await res.json();
          const loadedPlants = db.plants || [];
          const loadedVendors = db.vendors || [];
          const loadedCustomers = db.customers || [];
          const loadedOrders = db.orders || [];
          const loadedSettings = db.delivery_settings || {
            id: "settings",
            freeDeliveryThreshold: 499,
            standardDeliveryCharge: 49,
            baseCommissionPercent: 12
          };
          const loadedPromo = db.promotional_banner || {
            imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80",
            title: "🌱 Monsoon Special Sale: Flat 20% OFF on all Green Air Purifiers!",
            isActive: true,
            newsText: "PlantAdda certified local nursery centers are now fully operational in 12+ states in India!"
          };

          if (!localStorage.getItem("plantadda_plants")) {
            setPlants(loadedPlants);
            localStorage.setItem("plantadda_plants", JSON.stringify(loadedPlants));
          }
          if (!localStorage.getItem("plantadda_vendors")) {
            setVendors(loadedVendors);
            localStorage.setItem("plantadda_vendors", JSON.stringify(loadedVendors));
          }
          if (!localStorage.getItem("plantadda_customers")) {
            setCustomers(loadedCustomers);
            localStorage.setItem("plantadda_customers", JSON.stringify(loadedCustomers));
          }
          if (!localStorage.getItem("plantadda_orders")) {
            setOrders(loadedOrders);
            localStorage.setItem("plantadda_orders", JSON.stringify(loadedOrders));
          }
          if (!localStorage.getItem("plantadda_deliverySettings")) {
            setDeliverySettings(loadedSettings);
            localStorage.setItem("plantadda_deliverySettings", JSON.stringify(loadedSettings));
          }
          if (!localStorage.getItem("plantadda_promoBanner")) {
            setPromoBanner(loadedPromo);
            localStorage.setItem("plantadda_promoBanner", JSON.stringify(loadedPromo));
          }
          console.log("Successfully seeded local database from static source:", url);
          return;
        }
      } catch (err) {
        console.warn(`Static data fetch failed for ${url}:`, err);
      }
    }
  };

  const fetchPlants = async () => {
    try {
      const res = await fetch("/api/plants");
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      setPlants(data || []);
      localStorage.setItem("plantadda_plants", JSON.stringify(data || []));
    } catch (e) {
      console.warn("Using offline fallback for plants", e);
      const saved = localStorage.getItem("plantadda_plants");
      if (saved) {
        setPlants(JSON.parse(saved));
      } else {
        await loadInitialStaticData();
      }
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors");
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      setVendors(data || []);
      localStorage.setItem("plantadda_vendors", JSON.stringify(data || []));
    } catch (e) {
      console.warn("Using offline fallback for vendors", e);
      const saved = localStorage.getItem("plantadda_vendors");
      if (saved) {
        setVendors(JSON.parse(saved));
      } else {
        await loadInitialStaticData();
      }
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      setCustomers(data || []);
      localStorage.setItem("plantadda_customers", JSON.stringify(data || []));
    } catch (e) {
      console.warn("Using offline fallback for customers", e);
      const saved = localStorage.getItem("plantadda_customers");
      if (saved) {
        setCustomers(JSON.parse(saved));
      } else {
        await loadInitialStaticData();
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      setOrders(data || []);
      localStorage.setItem("plantadda_orders", JSON.stringify(data || []));
    } catch (e) {
      console.warn("Using offline fallback for orders", e);
      const saved = localStorage.getItem("plantadda_orders");
      if (saved) {
        setOrders(JSON.parse(saved));
      } else {
        await loadInitialStaticData();
      }
    }
  };

  const fetchDeliverySettings = async () => {
    try {
      const res = await fetch("/api/delivery-settings");
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      setDeliverySettings(data);
      setDeliveryChargeInput(data.standardDeliveryCharge.toString());
      setDeliveryThresholdInput(data.freeDeliveryThreshold.toString());
      localStorage.setItem("plantadda_deliverySettings", JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for delivery settings", e);
      const saved = localStorage.getItem("plantadda_deliverySettings");
      if (saved) {
        const data = JSON.parse(saved);
        setDeliverySettings(data);
        setDeliveryChargeInput(data.standardDeliveryCharge.toString());
        setDeliveryThresholdInput(data.freeDeliveryThreshold.toString());
      } else {
        await loadInitialStaticData();
      }
    }
  };

  const fetchPromoBanner = async () => {
    try {
      const res = await fetch("/api/admin/promo");
      if (!res.ok) throw new Error("Status " + res.status);
      const data = await res.json();
      setPromoBanner(data);
      setBannerTitle(data.title);
      setBannerUrl(data.imageUrl);
      setBannerNews(data.newsText || "");
      setBannerActive(data.isActive);
      localStorage.setItem("plantadda_promoBanner", JSON.stringify(data));
    } catch (e) {
      console.warn("Using offline fallback for promo banner", e);
      const saved = localStorage.getItem("plantadda_promoBanner");
      if (saved) {
        const data = JSON.parse(saved);
        setPromoBanner(data);
        setBannerTitle(data.title);
        setBannerUrl(data.imageUrl);
        setBannerNews(data.newsText || "");
        setBannerActive(data.isActive);
      } else {
        await loadInitialStaticData();
      }
    }
  };

  // HANDLERS
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setPhotoState: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification("Image is too large! Please choose an image smaller than 2MB.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoState(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Authenticate Admin
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === "admin" && adminPassword === "admin123") {
      setActiveSession({ role: "admin" });
      setShowLoginModal(false);
      addNotification("Welcome back, Master Admin! Administrative controls unlocked.", "success");
      setAdminUsername("");
      setAdminPassword("");
    } else {
      addNotification("Invalid Admin credentials.", "warning");
    }
  };

  // Register a Nursery
  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: vendorRegName,
      nurseryName: vendorRegNursery,
      contactEmail: vendorRegEmail,
      contactPhone: vendorRegPhone,
      address: vendorRegAddress,
      photograph: vendorRegPhoto
    };
    try {
      const res = await fetch("/api/vendors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        addNotification("🌿 Nursery registered successfully! Access is currently 'pending' admin approval.", "success");
        fetchVendors();
        setActiveSession({ role: "vendor", data });
        setShowLoginModal(false);
        // Clear fields
        setVendorRegName("");
        setVendorRegNursery("");
        setVendorRegEmail("");
        setVendorRegPhone("");
        setVendorRegAddress("");
        setVendorRegPhoto("");
      } else {
        addNotification("Registration failed: " + data.error, "warning");
      }
    } catch (err) {
      console.warn("API write failed, using local fallback", err);
      const newVendor = {
        id: "vend-" + Math.random().toString(36).slice(2, 11),
        ...payload,
        status: "pending" as const,
        joinDate: new Date().toISOString().split("T")[0],
        commissionPaidPercent: 12,
        approvedDeliveryCharge: 45,
        proposedDeliveryCharge: 45,
        deliveryChargeStatus: "approved" as const,
        password: "123"
      };
      const updatedVendors = [...vendors, newVendor];
      localStorage.setItem("plantadda_vendors", JSON.stringify(updatedVendors));
      setVendors(updatedVendors);

      addNotification("🌿 Nursery registered successfully (Offline Mode)! Access is currently 'pending' admin approval.", "success");
      setActiveSession({ role: "vendor", data: newVendor });
      setShowLoginModal(false);
      setVendorRegName("");
      setVendorRegNursery("");
      setVendorRegEmail("");
      setVendorRegPhone("");
      setVendorRegAddress("");
      setVendorRegPhoto("");
    }
  };

  // Login a Nursery Owner
  const handleVendorLogin = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    
    const emailToUse = directEmail || selectedVendorForLogin?.contactEmail || vendorLoginEmail;
    const passwordToUse = directPassword || vendorLoginPassword;

    if (!emailToUse) {
      addNotification("❌ Please select a nursery center name or enter an email address.", "warning");
      return;
    }

    try {
      const res = await fetch("/api/vendors/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactEmail: emailToUse, password: passwordToUse })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === "rejected") {
          addNotification("❌ Access denied. This nursery portal is rejected by the administrator.", "warning");
          return;
        }
        setActiveSession({ role: "vendor", data });
        setShowLoginModal(false);
        addNotification(`Welcome back to your workstation, ${data.nurseryName}!`, "success");
        setVendorLoginEmail("");
        setVendorLoginPassword("");
        setSelectedVendorForLogin(null);
      } else {
        addNotification(data.error || "Incorrect password or nursery center not found.", "warning");
      }
    } catch (err) {
      console.warn("API login failed, using local fallback", err);
      const vendor = vendors.find((v: any) => v.contactEmail === emailToUse);
      if (vendor) {
        if (vendor.status === "rejected") {
          addNotification("❌ Access denied. This nursery portal is rejected by the administrator.", "warning");
          return;
        }
        setActiveSession({ role: "vendor", data: vendor });
        setShowLoginModal(false);
        addNotification(`Welcome back to your workstation (Offline Mode), ${vendor.nurseryName}!`, "success");
        setVendorLoginEmail("");
        setVendorLoginPassword("");
        setSelectedVendorForLogin(null);
      } else {
        addNotification("Nursery center not found offline.", "warning");
      }
    }
  };

  // Register Customer at Payment / Login
  const handleRegisterCustomer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const payload = {
      name: customerRegName,
      email: customerRegEmail,
      phone: customerRegPhone,
      address: customerRegAddress,
      photograph: customerRegPhoto
    };
    try {
      const res = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(`🌱 Registered account for ${data.name}!`, "success");
        fetchCustomers();
        setActiveSession({ role: "customer", data });
        // Auto fill checkout parameters
        setCheckoutName(data.name);
        setCheckoutEmail(data.email);
        setCheckoutPhone(data.phone);
        setCheckoutAddress(data.address);
        setCheckoutPhoto(data.photograph || "");
        
        // Clear fields
        setCustomerRegName("");
        setCustomerRegEmail("");
        setCustomerRegPhone("");
        setCustomerRegAddress("");
        setCustomerRegPhoto("");
        return data;
      } else {
        addNotification(data.error || "Customer registration failed", "warning");
      }
    } catch (err) {
      console.warn("API write failed, using local fallback", err);
      const newCustomer = {
        id: "cust-" + Math.random().toString(36).slice(2, 11),
        ...payload
      };
      const updatedCustomers = [...customers, newCustomer];
      localStorage.setItem("plantadda_customers", JSON.stringify(updatedCustomers));
      setCustomers(updatedCustomers);

      addNotification(`🌱 Registered account for ${newCustomer.name} (Offline Mode)!`, "success");
      setActiveSession({ role: "customer", data: newCustomer });
      setCheckoutName(newCustomer.name);
      setCheckoutEmail(newCustomer.email);
      setCheckoutPhone(newCustomer.phone);
      setCheckoutAddress(newCustomer.address);
      setCheckoutPhoto(newCustomer.photograph || "");
      
      setCustomerRegName("");
      setCustomerRegEmail("");
      setCustomerRegPhone("");
      setCustomerRegAddress("");
      setCustomerRegPhoto("");
      return newCustomer;
    }
    return null;
  };

  // Customer Quick switch / login
  const handleCustomerLogin = (customer: Customer) => {
    setActiveSession({ role: "customer", data: customer });
    addNotification(`Active Shopping Profile switched to: ${customer.name}`, "success");
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setActiveSession({ role: "guest" });
    addNotification("Logged out successfully.", "info");
  };

  // Change Promo Banner (Admin action)
  const handleUpdatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: bannerTitle,
      imageUrl: bannerUrl,
      isActive: bannerActive,
      newsText: bannerNews
    };
    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setPromoBanner(data);
        addNotification("⚡ Promotional Banner updated successfully!", "success");
      }
    } catch (e) {
      console.warn("API promo update failed, using local fallback", e);
      localStorage.setItem("plantadda_promoBanner", JSON.stringify(payload));
      setPromoBanner(payload);
      addNotification("⚡ Promotional Banner updated successfully (Offline Mode)!", "success");
    }
  };

  // Approve / Reject Nursery Owner Access (Admin action)
  const handleUpdateVendorStatus = async (vendorId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        addNotification(`Nursery status updated to: ${status.toUpperCase()}`, "success");
        fetchVendors();
      } else {
        addNotification("Failed to update nursery status", "warning");
      }
    } catch (e) {
      console.warn("API update vendor status failed, using local fallback", e);
      const currentVendors = JSON.parse(localStorage.getItem("plantadda_vendors") || "[]");
      const updatedVendors = currentVendors.map((v: any) => v.id === vendorId ? { ...v, status } : v);
      localStorage.setItem("plantadda_vendors", JSON.stringify(updatedVendors));
      setVendors(updatedVendors);
      addNotification(`Nursery status updated to: ${status.toUpperCase()} (Offline Mode)`, "success");
    }
  };

  // Save Delivery Settings (Admin action)
  const handleSaveDeliverySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: "settings",
      standardDeliveryCharge: Number(deliveryChargeInput),
      freeDeliveryThreshold: Number(deliveryThresholdInput),
      baseCommissionPercent: deliverySettings.baseCommissionPercent
    };
    try {
      const res = await fetch("/api/delivery-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setDeliverySettings(data);
        addNotification("📦 Delivery parameters updated globally!", "success");
      }
    } catch (e) {
      console.warn("API save delivery settings failed, using local fallback", e);
      localStorage.setItem("plantadda_deliverySettings", JSON.stringify(payload));
      setDeliverySettings(payload);
      addNotification("📦 Delivery parameters updated globally (Offline Mode)!", "success");
    }
  };

  // Propose Custom Shipping Rate (Nursery Owner action)
  const handleProposeShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSession.role !== "vendor" || !activeSession.data) return;
    try {
      const res = await fetch(`/api/vendors/${activeSession.data.id}/propose-shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposedCharge: Number(proposedShippingInput) })
      });
      if (res.ok) {
        addNotification("🚚 Courier price proposal submitted for Admin review!", "success");
        fetchVendors();
      }
    } catch (e) {
      console.warn("API propose shipping failed, using local fallback", e);
      const currentVendors = JSON.parse(localStorage.getItem("plantadda_vendors") || "[]");
      const updatedVendors = currentVendors.map((v: any) => v.id === activeSession.data.id ? { ...v, proposedDeliveryCharge: Number(proposedShippingInput), deliveryChargeStatus: "pending" as const } : v);
      localStorage.setItem("plantadda_vendors", JSON.stringify(updatedVendors));
      setVendors(updatedVendors);
      addNotification("🚚 Courier price proposal submitted (Offline Mode)!", "success");
    }
  };

  // Approve Nursery Shipping Rate (Admin action)
  const handleApproveNurseryShipping = async (vendorId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/approve-shipping`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        addNotification(`Nursery shipping rate ${action}d!`, "success");
        fetchVendors();
      }
    } catch (e) {
      console.warn("API approve nursery shipping failed, using local fallback", e);
      const currentVendors = JSON.parse(localStorage.getItem("plantadda_vendors") || "[]");
      const updatedVendors = currentVendors.map((v: any) => {
        if (v.id === vendorId) {
          return {
            ...v,
            deliveryChargeStatus: action === "approve" ? ("approved" as const) : ("rejected" as const),
            approvedDeliveryCharge: action === "approve" ? v.proposedDeliveryCharge : v.approvedDeliveryCharge
          };
        }
        return v;
      });
      localStorage.setItem("plantadda_vendors", JSON.stringify(updatedVendors));
      setVendors(updatedVendors);
      addNotification(`Nursery shipping rate ${action}d (Offline Mode)!`, "success");
    }
  };

  // Set Additional Admin Discount on a plant (Admin action)
  const handleSetAdminDiscount = async (plantId: string, additionalDiscount: number) => {
    try {
      const res = await fetch(`/api/plants/${plantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminDiscount: additionalDiscount })
      });
      if (res.ok) {
        addNotification(`Additional Admin Discount set to ${additionalDiscount}%!`, "success");
        fetchPlants();
      }
    } catch (e) {
      console.warn("API set admin discount failed, using local fallback", e);
      const currentPlants = JSON.parse(localStorage.getItem("plantadda_plants") || "[]");
      const updatedPlants = currentPlants.map((p: any) => p.id === plantId ? { ...p, adminDiscount: additionalDiscount } : p);
      localStorage.setItem("plantadda_plants", JSON.stringify(updatedPlants));
      setPlants(updatedPlants);
      addNotification(`Additional Admin Discount set to ${additionalDiscount}% (Offline Mode)!`, "success");
    }
  };

  // Nursery Owner: Upload Plant
  const handleSavePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSession.role !== "vendor" || !activeSession.data) return;

    const payload = {
      name: plantName,
      category: plantCategory,
      price: Number(plantPrice),
      discount: Number(plantDiscount),
      careInstructions: plantCare || "Keep in partial shade, water twice a week.",
      imageUrls: plantImage ? [plantImage] : ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80"],
      stock: Number(plantStock),
      season: plantSeason,
      description: plantDesc || "A healthy homegrown plant nurtured with organic fertilizers.",
      vendorId: activeSession.data.id,
      requestedByRole: "vendor",
      isAdminApproved: false,
      adminDiscount: 0
    };

    try {
      const url = editingPlant ? `/api/plants/${editingPlant.id}` : "/api/plants";
      const method = editingPlant ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        addNotification(editingPlant ? "🌱 Plant updated successfully! Pending review." : "🌱 New plant submitted to catalog! Pending review.", "success");
        fetchPlants();
        setShowAddPlantModal(false);
        setEditingPlant(null);
        // Clear fields
        setPlantName("");
        setPlantCare("");
        setPlantImage("");
        setPlantDesc("");
      }
    } catch (e) {
      console.warn("API save plant failed, using local fallback", e);
      const currentPlants = JSON.parse(localStorage.getItem("plantadda_plants") || "[]");
      let updatedPlants;
      if (editingPlant) {
        updatedPlants = currentPlants.map((p: any) => p.id === editingPlant.id ? { ...p, ...payload } : p);
      } else {
        const newPlant = {
          id: "plant-" + Math.random().toString(36).slice(2, 11),
          ...payload
        };
        updatedPlants = [...currentPlants, newPlant];
      }
      localStorage.setItem("plantadda_plants", JSON.stringify(updatedPlants));
      setPlants(updatedPlants);

      addNotification(editingPlant ? "🌱 Plant updated successfully (Offline Mode)! Pending review." : "🌱 New plant submitted to catalog (Offline Mode)! Pending review.", "success");
      setShowAddPlantModal(false);
      setEditingPlant(null);
      // Clear fields
      setPlantName("");
      setPlantCare("");
      setPlantImage("");
      setPlantDesc("");
    }
  };

  // Admin Approve Plant (Admin action)
  const handleApprovePlant = async (plantId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/plants/${plantId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved })
      });
      if (res.ok) {
        addNotification(approved ? "Plant approved for the marketplace!" : "Plant restricted from marketplace", "success");
        fetchPlants();
      }
    } catch (e) {
      console.warn("API approve plant failed, using local fallback", e);
      const currentPlants = JSON.parse(localStorage.getItem("plantadda_plants") || "[]");
      const updatedPlants = currentPlants.map((p: any) => p.id === plantId ? { ...p, isAdminApproved: approved } : p);
      localStorage.setItem("plantadda_plants", JSON.stringify(updatedPlants));
      setPlants(updatedPlants);
      addNotification(approved ? "Plant approved for the marketplace (Offline Mode)!" : "Plant restricted from marketplace (Offline Mode)", "success");
    }
  };

  // CART ACTIONS
  const addToCart = (plant: Plant) => {
    if (plant.stock <= 0) {
      addNotification("Sorry, this plant is out of stock!", "warning");
      return;
    }
    const finalPrice = plant.price;
    const finalDiscount = plant.discount;
    const adminDisc = plant.adminDiscount || 0;

    setCart(prev => {
      const existing = prev.find(item => item.plantId === plant.id);
      if (existing) {
        if (existing.quantity >= plant.stock) {
          addNotification(`Cannot add more. Nurtured stock limit is ${plant.stock}.`, "warning");
          return prev;
        }
        addNotification(`Added another ${plant.name} to cart.`, "success");
        return prev.map(item => item.plantId === plant.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      addNotification(`Added ${plant.name} to cart.`, "success");
      return [...prev, {
        plantId: plant.id,
        name: plant.name,
        price: finalPrice,
        discount: finalDiscount,
        adminDiscount: adminDisc,
        quantity: 1,
        imageUrl: plant.imageUrls[0],
        vendorId: plant.vendorId
      }];
    });
  };

  const updateCartQty = (plantId: string, change: number) => {
    const targetPlant = plants.find(p => p.id === plantId);
    setCart(prev => {
      return prev.map(item => {
        if (item.plantId === plantId) {
          const newQty = item.quantity + change;
          if (newQty <= 0) return null;
          if (targetPlant && newQty > targetPlant.stock) {
            addNotification(`Only ${targetPlant.stock} plants available in stock.`, "warning");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as any;
    });
  };

  const removeFromCart = (plantId: string) => {
    setCart(prev => prev.filter(item => item.plantId !== plantId));
    addNotification("Removed from cart.", "info");
  };

  // CHECKOUT LOGIC
  const getCartTotals = () => {
    const subtotal = cart.reduce((acc, item) => {
      // Calculate individual item rate after both vendor & admin discounts
      const combinedDiscount = Math.min(99, item.discount + item.adminDiscount);
      const itemFinalRate = item.price * (1 - combinedDiscount / 100);
      return acc + (itemFinalRate * item.quantity);
    }, 0);

    // Shipping rules: 
    // Uses the custom approved shipping charges of the nurseries involved or standard global charge.
    let calculatedShipping = 0;
    if (cart.length > 0) {
      if (subtotal >= deliverySettings.freeDeliveryThreshold) {
        calculatedShipping = 0;
      } else {
        // Find nurseries in cart
        const cartVendorIds = Array.from(new Set(cart.map(item => item.vendorId)));
        cartVendorIds.forEach(vid => {
          const vObj = vendors.find(v => v.id === vid);
          if (vObj && vObj.approvedDeliveryCharge !== undefined) {
            calculatedShipping += vObj.approvedDeliveryCharge;
          } else {
            calculatedShipping += deliverySettings.standardDeliveryCharge;
          }
        });
      }
    }

    const total = subtotal + calculatedShipping;
    return { subtotal, shipping: calculatedShipping, total };
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    let finalCustomerEmail = checkoutEmail;
    let finalCustomerName = checkoutName;

    // Verify registration/login if not logged in as a customer
    if (activeSession.role !== "customer" || !activeSession.data) {
      if (!checkoutName || !checkoutEmail || !checkoutPhone || !checkoutAddress) {
        addNotification("Please provide your delivery profile parameters first.", "warning");
        return;
      }
      // Register them dynamically
      const regObj = await handleRegisterCustomer();
      if (!regObj) return;
      finalCustomerEmail = regObj.email;
      finalCustomerName = regObj.name;
    }

    try {
      const { subtotal, shipping, total } = getCartTotals();
      const payload = {
        customerName: finalCustomerName,
        customerEmail: finalCustomerEmail,
        customerPhone: checkoutPhone,
        customerAddress: checkoutAddress,
        items: cart,
        subtotal,
        deliveryCharge: shipping,
        total,
        paymentMethod,
        paymentStatus: "paid"
      };

      let data;
      let ok = false;
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          data = await res.json();
          ok = true;
        } else {
          const errData = await res.json();
          addNotification("Payment processing failed: " + errData.error, "warning");
          return;
        }
      } catch (err) {
        console.warn("API write for placing order failed, using offline fallback", err);
        const newOrder = {
          id: "ord-" + Math.random().toString(36).slice(2, 11),
          ...payload,
          date: new Date().toISOString().split("T")[0],
          status: "pending" as const
        };
        const updatedOrders = [newOrder, ...orders];
        localStorage.setItem("plantadda_orders", JSON.stringify(updatedOrders));
        setOrders(updatedOrders);

        // Deduct plant stocks locally
        const updatedPlants = plants.map((p: any) => {
          const cartItem = cart.find(c => c.plantId === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        });
        localStorage.setItem("plantadda_plants", JSON.stringify(updatedPlants));
        setPlants(updatedPlants);

        data = newOrder;
        ok = true;
      }

      if (ok && data) {
        setPlacedOrder(data);
        setCart([]);
        setCheckoutStep("success");
        fetchOrders();
        fetchPlants(); // Reload stocks count
        
        // Trigger visual/functional purchase notifications
        addNotification(`🎉 Purchase Successful! Thank you ${finalCustomerName}. Your order is dispatched.`, "success");
        
        // Setup simple persistent mock notification in notification list
        addNotification(`📦 Order #${data.id.slice(0,8)} of ₹${Math.round(total)} is assigned to dispatch team.`, "info");
      }
    } catch (e: any) {
      addNotification("Billing connection error: " + e.message, "warning");
    }
  };

  // FILTERS AND SORTING
  const categoriesList = ["All", ...Object.values(Category)];
  const getFilteredAndSortedPlants = () => {
    let list = [...plants];

    // Customers and Guests only see Admin-Approved plants
    if (activeSession.role !== "admin" && activeSession.role !== "vendor") {
      list = list.filter(p => p.isAdminApproved === true);
    }

    // Category filter
    if (selectedCategory !== "All") {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Sort by best rates (price after combined discounts)
    list.sort((a, b) => {
      const aCombinedDisc = Math.min(99, a.discount + (a.adminDiscount || 0));
      const aRate = a.price * (1 - aCombinedDisc / 100);

      const bCombinedDisc = Math.min(99, b.discount + (b.adminDiscount || 0));
      const bRate = b.price * (1 - bCombinedDisc / 100);

      if (sortBy === "price-asc") {
        return aRate - bRate;
      } else if (sortBy === "price-desc") {
        return bRate - aRate;
      } else if (sortBy === "discount") {
        return bCombinedDisc - aCombinedDisc;
      }
      return 0; // Default sorting
    });

    return list;
  };

  const filteredAndSorted = getFilteredAndSortedPlants();
  const totals = getCartTotals();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      
      {/* Toast Notification Stack */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`p-4 rounded-2xl shadow-xl border flex gap-3 pointer-events-auto animate-bounce-in text-xs ${
              n.type === "success" ? "bg-emerald-800 border-emerald-600 text-white" :
              n.type === "warning" ? "bg-amber-600 border-amber-500 text-white" :
              "bg-slate-900 border-slate-700 text-white"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {n.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-semibold">{n.message}</p>
              <p className="text-[9px] opacity-75 mt-0.5">Just now</p>
            </div>
          </div>
        ))}
      </div>

      {/* HEADER SECTION with Portal Switcher in the Corner */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedCategory("All")}>
            <PlantAddaLogo size={145} showTagline={false} />
          </div>

          {/* Quick Stats Banner News */}
          {promoBanner.isActive && promoBanner.newsText && (
            <div className={`hidden lg:flex items-center gap-2 ${theme.accentBg} px-3 py-1.5 rounded-full border ${theme.border} max-w-md`}>
              <span className={`${theme.bg} text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full`}>NEWS</span>
              <p className={`text-[10px] ${theme.accentText} truncate font-medium`}>{promoBanner.newsText}</p>
            </div>
          )}

          {/* Top-Right Control Center (The Corner Login Component) */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Theme Selector (Color dots) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
              <button 
                onClick={() => setActiveTheme("emerald")}
                className={`w-4.5 h-4.5 rounded-full bg-emerald-600 border ${activeTheme === "emerald" ? "border-slate-900 scale-110 shadow-xs" : "border-transparent"} cursor-pointer transition-all`}
                title="Emerald Forest Theme"
              />
              <button 
                onClick={() => setActiveTheme("terracotta")}
                className={`w-4.5 h-4.5 rounded-full bg-amber-600 border ${activeTheme === "terracotta" ? "border-slate-900 scale-110 shadow-xs" : "border-transparent"} cursor-pointer transition-all`}
                title="Warm Earth Theme"
              />
              <button 
                onClick={() => setActiveTheme("teal")}
                className={`w-4.5 h-4.5 rounded-full bg-teal-600 border ${activeTheme === "teal" ? "border-slate-900 scale-110 shadow-xs" : "border-transparent"} cursor-pointer transition-all`}
                title="Teal Lagoon Theme"
              />
            </div>

            {/* Language Switcher Button */}
            <button 
              onClick={() => setLanguage(prev => prev === "en" ? "hi" : "en")}
              className="text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-bold px-2.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1"
            >
              🌐 {language === "en" ? "हिन्दी" : "English"}
            </button>
            
            {/* Cart Button */}
            <button 
              onClick={() => { setCartOpen(true); setCheckoutStep("cart"); }}
              className="relative p-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              {cart.length > 0 && (
                <span className={`absolute -top-1 -right-1 ${theme.bg} text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs`}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Account Corner Selector */}
            <div className="flex items-center gap-2">
              {activeSession.role !== "guest" ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1 pl-2.5 pr-1.5 shadow-xs">
                  <div className="text-right hidden sm:block">
                    <p className={`text-[9px] uppercase tracking-wider font-black ${theme.text} leading-tight`}>
                      {activeSession.role === "admin" ? "Master Admin" : 
                       activeSession.role === "vendor" ? "Nursery Hub" : "Member Client"}
                    </p>
                    <p className="text-[11px] font-bold text-slate-700 leading-normal truncate max-w-[120px]">
                      {activeSession.role === "admin" ? "Executive Desk" : 
                       activeSession.role === "vendor" ? activeSession.data.nurseryName : activeSession.data.name}
                    </p>
                  </div>
                  
                  {/* Portrait photo or fallback icon */}
                  <div className={`w-8 h-8 rounded-full ${theme.bg} text-white flex items-center justify-center text-xs font-black overflow-hidden border border-slate-200 shadow-inner`}>
                    {activeSession.role === "customer" && activeSession.data?.photograph ? (
                      <img src={activeSession.data.photograph} alt={activeSession.data.name} className="w-full h-full object-cover" />
                    ) : activeSession.role === "vendor" && activeSession.data?.photograph ? (
                      <img src={activeSession.data.photograph} alt={activeSession.data.nurseryName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="text-[10px] bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-full font-bold cursor-pointer transition-all shrink-0"
                  >
                    {t("exit")}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setLoginTab("customer"); setShowLoginModal(true); }}
                  className={`flex items-center gap-2 ${theme.btn} text-xs font-bold px-4 py-2 rounded-full transition-all shadow-md ${theme.shadow} cursor-pointer`}
                >
                  <User className="w-4 h-4" />
                  <span>{t("portalSignIn")}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* DYNAMIC BOLD PROMOTIONAL BANNER (Controlled by Admin) */}
      {promoBanner.isActive && (
        <section className="relative px-4 pt-6 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl shadow-xl min-h-[160px] sm:min-h-[200px] flex items-center">
            
            {/* Banner Background Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src={promoBanner.imageUrl} 
                alt="Monsoon Banner Background" 
                className="w-full h-full object-cover brightness-[0.35]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-transparent to-black/35" />
            </div>

            {/* Banner Content */}
            <div className="relative z-10 p-6 sm:p-10 text-left text-white max-w-2xl space-y-3">
              <span className="bg-emerald-500/35 backdrop-blur-md border border-emerald-400 text-emerald-200 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                ★ Live Campaign Active
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white leading-tight drop-shadow-md">
                {promoBanner.title}
              </h1>
              {promoBanner.newsText && (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium drop-shadow-xs max-w-xl">
                  {promoBanner.newsText}
                </p>
              )}
            </div>

            {/* Fast Admin Trigger inside the Banner */}
            {activeSession.role === "admin" && (
              <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-emerald-100 text-slate-800 max-w-xs shadow-xl hidden sm:block">
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">⚡ Instant Banner Override</p>
                <form onSubmit={handleUpdatePromo} className="mt-2 space-y-1.5">
                  <input 
                    type="text" 
                    value={bannerTitle} 
                    onChange={e => setBannerTitle(e.target.value)} 
                    placeholder="Campaign Title"
                    className="w-full text-[11px] border border-slate-200 rounded-lg p-1 text-slate-800"
                  />
                  <input 
                    type="text" 
                    value={bannerUrl} 
                    onChange={e => setBannerUrl(e.target.value)} 
                    placeholder="Image URL"
                    className="w-full text-[11px] border border-slate-200 rounded-lg p-1 text-slate-800"
                  />
                  <button type="submit" className="w-full bg-emerald-800 text-white text-[9px] font-bold py-1 rounded-lg">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

          </div>
        </section>
      )}

      {/* CORE WORKSPACES INSTEAD OF VISUAL OVERLOAD */}

      {/* A. WORKSPACE: MASTER ADMINISTRATIVE HUB */}
      {activeSession.role === "admin" && (
        <section className="px-4 py-6 sm:px-8 max-w-7xl mx-auto w-full bg-emerald-50/50 border border-emerald-100 rounded-3xl mt-6 space-y-8 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-100 pb-4">
            <div>
              <span className="bg-emerald-800 text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full inline-block">SYSTEM COMMAND</span>
              <h2 className="font-display font-black text-xl text-slate-900 mt-1">Master Administrative Workstation</h2>
              <p className="text-xs text-slate-500">Fully authorized parameters for nurseries, delivery algorithms, additional discounts, and marketing.</p>
            </div>
            
            {/* Quick stats */}
            <div className="flex gap-4">
              <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 text-center shadow-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Nurseries</p>
                <p className="text-lg font-black text-emerald-800">
                  {vendors.filter(v => v.status === "pending").length}
                </p>
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 text-center shadow-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Plants</p>
                <p className="text-lg font-black text-slate-800">{plants.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. Decide on Delivery Processes and global delivery settings */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-150 space-y-4 shadow-xs">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4.5 h-4.5 text-emerald-800" />
                Delivery Charging Engine
              </h3>
              <p className="text-xs text-slate-500">
                Decide on the global parameters. Standard charge is applied if purchase value does not breach free threshold.
              </p>
              <form onSubmit={handleSaveDeliverySettings} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Standard Delivery Fee (₹)</label>
                  <input 
                    type="number" 
                    value={deliveryChargeInput}
                    onChange={e => setDeliveryChargeInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Free Shipping Threshold (₹)</label>
                  <input 
                    type="number" 
                    value={deliveryThresholdInput}
                    onChange={e => setDeliveryThresholdInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Update Global Delivery Rates
                </button>
              </form>
            </div>

            {/* 2. Deciding which nursery owner to grant portal access to */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-150 space-y-4 shadow-xs">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Building className="w-4.5 h-4.5 text-emerald-800" />
                Nursery Portal Registries ({vendors.length})
              </h3>
              <p className="text-xs text-slate-500">
                Authorize or reject local nursery centers. Only authorized centers are allowed to sell plants on PlantAdda.
              </p>
              
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {vendors.map(v => (
                  <div key={v.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    
                    {/* Representative block & Photo Proof */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {v.photograph ? (
                          <img src={v.photograph} alt={v.nurseryName} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-950 text-sm leading-tight">{v.nurseryName}</p>
                        <p className="text-slate-500 text-[11px] leading-normal">{v.name} &bull; {v.contactEmail} &bull; {v.contactPhone}</p>
                        <p className="text-slate-450 italic text-[10px] truncate max-w-sm">📍 {v.address}</p>
                        
                        {/* Delivery charge details */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                            v.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                            v.status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {v.status.toUpperCase()}
                          </span>
                          {v.proposedDeliveryCharge !== undefined && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              Proposed Courier Rate: <b>₹{v.proposedDeliveryCharge}</b> 
                              ({v.deliveryChargeStatus || "pending"})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Decision controls */}
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      
                      {/* Approved / Rejected Nursery status */}
                      {v.status !== "approved" ? (
                        <button 
                          onClick={() => handleUpdateVendorStatus(v.id, "approved")}
                          className="bg-emerald-800 text-white hover:bg-emerald-950 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-xs"
                        >
                          Approve Station
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateVendorStatus(v.id, "rejected")}
                          className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-xs"
                        >
                          Reject / Revoke Portal Access
                        </button>
                      )}

                      {/* Propose Shipping Approval */}
                      {v.proposedDeliveryCharge !== undefined && v.deliveryChargeStatus !== "approved" && (
                        <button 
                          onClick={() => handleApproveNurseryShipping(v.id, "approve")}
                          className="bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                        >
                          Approve Shipping Rate
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* 3. Campaign & News settings */}
            <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-slate-150 space-y-4 shadow-xs">
              <h3 className="font-display font-bold text-sm text-slate-900">
                📢 Dynamic Top Promotional Banner Customizer
              </h3>
              <form onSubmit={handleUpdatePromo} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Campaign Title (e.g. Summer Offer)</label>
                  <input 
                    type="text" 
                    value={bannerTitle} 
                    onChange={e => setBannerTitle(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Background Image Unsplash URL</label>
                  <input 
                    type="text" 
                    value={bannerUrl} 
                    onChange={e => setBannerUrl(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-[10px]"
                  />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">News Sub-ticker Bulletin</label>
                  <input 
                    type="text" 
                    value={bannerNews} 
                    onChange={e => setBannerNews(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div className="md:col-span-12 flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input 
                      type="checkbox" 
                      checked={bannerActive} 
                      onChange={e => setBannerActive(e.target.checked)}
                      className="rounded text-emerald-800"
                    />
                    Display Banner Campaign active on Homepage
                  </label>
                  <button 
                    type="submit" 
                    className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold px-6 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    🚀 Update Bold Advertising Banner
                  </button>
                </div>
              </form>
            </div>

            {/* 4. Supabase Cloud Database Console (The requested "super base" database management) */}
            <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-slate-150 space-y-5 shadow-xs text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
                    <Settings className={`w-5 h-5 ${theme.text}`} />
                    Supabase Cloud Database & SQL Console
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage direct tables, synchronize active inventories, and run SQL queries in the dry-run console.
                  </p>
                </div>
                
                {dbConnections[0] && (
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      dbConnections[0].status === "connected" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {dbConnections[0].status === "connected" ? "🟢 Live Connected" : "🟡 Sandbox Simulator"}
                    </span>
                    <button 
                      onClick={() => handleTestConnection(dbConnections[0].id)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                    >
                      🔄 Test Ping
                    </button>
                    <button 
                      onClick={() => handleSyncDatabase(dbConnections[0].id)}
                      disabled={dbSyncing}
                      className={`${theme.btn} text-xs font-bold px-4 py-1.5 rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5`}
                    >
                      ⚡ {dbSyncing ? "Syncing..." : "Synchronize Database"}
                    </button>
                  </div>
                )}
              </div>

              {/* Status Warning & Explanation */}
              {(!(typeof process !== "undefined" && process.env?.SUPABASE_URL) || !(typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY)) && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl text-xs flex gap-2.5 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Database Running in Safe Sandbox Mode</p>
                    <p className="mt-0.5 opacity-90">
                      To establish a real-time internet-wide connection with your Supabase Cloud Database, go to the <b>Secrets panel in Settings</b>, and add <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code>. The applet will lazy-initialize and write directly to your real cloud tables!
                    </p>
                  </div>
                </div>
              )}

              {/* Console logs */}
              {dbConsoleOutput && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Synchronization Terminal</span>
                  <pre className="w-full bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800 whitespace-pre-wrap">
                    {dbConsoleOutput}
                  </pre>
                </div>
              )}

              {/* Interactive SQL query console */}
              {dbConnections[0] && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-100 pt-5">
                  <div className="md:col-span-5 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Interactive SQL Sandbox Editor</label>
                      <textarea 
                        value={sqlQuery}
                        onChange={e => setSqlQuery(e.target.value)}
                        className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:ring-1 focus:ring-slate-300"
                        placeholder="SELECT * FROM public.plants;"
                      />
                    </div>
                    <button 
                      onClick={() => handleRunSQL(dbConnections[0].id)}
                      disabled={sqlQueryLoading || !sqlQuery.trim()}
                      className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {sqlQueryLoading ? "Executing Query..." : "⚡ Execute SQL Query"}
                    </button>
                  </div>

                  <div className="md:col-span-7 space-y-3">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">Query Results Console</span>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-36 max-h-44 overflow-y-auto font-mono text-[11px] text-slate-700">
                      {sqlQueryMessage && (
                        <p className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2">{sqlQueryMessage}</p>
                      )}
                      {sqlQueryRows.length > 0 ? (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase">
                              {Object.keys(sqlQueryRows[0]).map((key, i) => (
                                <th key={i} className="pb-1 pr-3">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sqlQueryRows.map((row, i) => (
                              <tr key={i} className="border-b border-slate-100 last:border-0">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="py-1.5 pr-3 text-slate-600 truncate max-w-[150px]">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-slate-400 italic">No query output table returned. Write a SELECT statement and click execute.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {/* B. WORKSPACE: NURSERY STATION PORTAL */}
      {activeSession.role === "vendor" && activeSession.data && (
        <section className="px-4 py-6 sm:px-8 max-w-7xl mx-auto w-full bg-slate-50 border border-slate-200 rounded-3xl mt-6 space-y-8 text-left shadow-xs">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl border border-slate-300 overflow-hidden bg-white shadow-xs shrink-0">
                {activeSession.data.photograph ? (
                  <img src={activeSession.data.photograph} alt={activeSession.data.nurseryName} className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div>
                <span className="bg-emerald-800 text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full inline-block">NURSERY WORKSTATION</span>
                <h2 className="font-display font-black text-xl text-slate-900 mt-1">{activeSession.data.nurseryName}</h2>
                <p className="text-xs text-slate-500">Representative: {activeSession.data.name} &bull; Joined: {activeSession.data.joinDate}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setEditingPlant(null); setShowAddPlantModal(true); }}
                className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4.5 h-4.5" />
                Upload New Plant
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Propose Shipping processes & Courier charge */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4.5 h-4.5 text-emerald-800" />
                Propose Your Delivery Fee
              </h3>
              <p className="text-xs text-slate-500">
                You can propose standard nursery delivery charge processes. This charge is pending Admin approval. 
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Active Approved Charge:</span>
                  <span className="font-bold text-slate-900">₹{activeSession.data.approvedDeliveryCharge ?? "Global Standard"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Approval Status:</span>
                  <span className="font-black text-emerald-800 uppercase text-[10px]">{activeSession.data.deliveryChargeStatus || "No proposed"}</span>
                </div>
              </div>
              <form onSubmit={handleProposeShipping} className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Proposed Charge Rate (₹)</label>
                  <input 
                    type="number" 
                    value={proposedShippingInput}
                    onChange={e => setProposedShippingInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Propose Courier Rate
                </button>
              </form>
            </div>

            {/* View Uploaded Nursery Stocks status */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
              <h3 className="font-display font-bold text-sm text-slate-900">
                Your Botanical Stocks Catalog ({plants.filter(p => p.vendorId === activeSession.data.id).length})
              </h3>
              <p className="text-xs text-slate-500">Upload, edit price levels, stock, or set customer discounts here.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {plants.filter(p => p.vendorId === activeSession.data.id).map(p => {
                  const combinedDisc = Math.min(99, p.discount + (p.adminDiscount || 0));
                  const finalRate = p.price * (1 - combinedDisc / 100);
                  return (
                    <div key={p.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex gap-3 text-xs">
                      <img src={p.imageUrls[0]} alt={p.name} className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0" />
                      <div className="truncate flex-1 space-y-1">
                        <p className="font-bold text-slate-900 truncate leading-tight">{p.name}</p>
                        <p className="text-slate-500 text-[10px] leading-none">{p.category} &bull; {p.season}</p>
                        <p className="font-bold text-emerald-800 text-[11px] leading-tight">
                          ₹{Math.round(finalRate)} 
                          {combinedDisc > 0 && <span className="text-[9px] text-slate-400 line-through ml-1">₹{p.price}</span>}
                          {p.discount > 0 && <span className="text-[9px] text-emerald-600 font-normal ml-1">({p.discount}% Off)</span>}
                        </p>
                        <div className="flex gap-1 items-center mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            p.isAdminApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {p.isAdminApproved ? "Market Approved" : "Pending Admin"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">Stock: <b>{p.stock}</b></span>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <button 
                        onClick={() => {
                          setEditingPlant(p);
                          setPlantName(p.name);
                          setPlantCategory(p.category);
                          setPlantPrice(p.price.toString());
                          setPlantDiscount(p.discount.toString());
                          setPlantCare(p.careInstructions);
                          setPlantImage(p.imageUrls[0]);
                          setPlantStock(p.stock.toString());
                          setPlantSeason(p.season);
                          setPlantDesc(p.description);
                          setShowAddPlantModal(true);
                        }}
                        className="self-center p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white cursor-pointer"
                        title="Edit Details"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* CORE MARKETPLACE HOMEPAGE VIEW: VERY SIMPLE WITH PLANTS */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-8 space-y-6">
        
        {/* Simple Filters Section */}
        <div className="flex flex-col gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          
          {/* Main Search and category banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 text-left">
              <h2 className="font-display font-black text-lg text-slate-900 leading-tight">🌱 Natural Plants Catalog</h2>
              <p className="text-xs text-slate-500">Nurture your workspace with high quality, local nursery certified green air purifiers.</p>
            </div>

            {/* Quick search box */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search premium plants..."
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 outline-none rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold placeholder-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters List */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-slate-100 pt-4">
            
            {/* Category horizontal scroller */}
            <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1 -mb-1 pr-4 no-scrollbar">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? "bg-emerald-800 text-white shadow-md shadow-emerald-50" 
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown: "Sort by Best Available Rate" (Combined Discounts) */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="default">Sort by Recommended</option>
                <option value="price-asc">Best Rate: Low to High</option>
                <option value="price-desc">Best Rate: High to Low</option>
                <option value="discount">Biggest Active Discount</option>
              </select>
            </div>

          </div>

        </div>

        {/* PLANT CARD GRID - STYLED MINIMALIST AND SIMPLE */}
        {filteredAndSorted.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <span className="text-4xl">🪴</span>
            <h3 className="font-display font-bold text-slate-800 text-sm">No plants matching filters</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Try search modifiers or other botanical categories to locate live nursery stock.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSorted.map(p => {
              const nursery = vendors.find(v => v.id === p.vendorId);
              const combinedDiscount = Math.min(99, p.discount + (p.adminDiscount || 0));
              const finalRate = p.price * (1 - combinedDiscount / 100);

              return (
                <div 
                  key={p.id} 
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col group transition-all duration-350 hover:shadow-xl hover:border-emerald-200"
                >
                  
                  {/* Photo area */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={p.imageUrls[0]} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    />
                    
                    {/* Discount badge */}
                    {combinedDiscount > 0 && (
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {combinedDiscount}% OFF
                      </span>
                    )}

                    {/* Stock status indicator */}
                    {p.stock <= 0 ? (
                      <span className="absolute bottom-3 right-3 bg-rose-500 text-white font-black text-[9px] px-2 py-0.5 rounded-md">
                        SOLD OUT
                      </span>
                    ) : p.stock <= 5 ? (
                      <span className="absolute bottom-3 right-3 bg-amber-500 text-white font-black text-[9px] px-2 py-0.5 rounded-md">
                        ONLY {p.stock} LEFT
                      </span>
                    ) : null}
                  </div>

                  {/* Content area */}
                  <div className="p-5 flex-1 flex flex-col text-left space-y-2">
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                        <span>{p.category}</span>
                        <span>• {p.season}</span>
                      </div>
                      <h3 className="font-display font-black text-slate-900 text-[15px] leading-snug group-hover:text-emerald-950 transition-all">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 italic">
                        By: {nursery ? nursery.nurseryName : "Certified Supplier"}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
                      {p.description}
                    </p>

                    {/* Pricing with "Best rate" calculations */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Best Rate</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display font-extrabold text-lg text-emerald-800">
                            ₹{Math.round(finalRate)}
                          </span>
                          {combinedDiscount > 0 && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{p.price}
                            </span>
                          )}
                        </div>
                        
                        {/* Show Admin discount separate if active */}
                        {p.adminDiscount ? (
                          <p className="text-[9px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                            ★ +{p.adminDiscount}% Admin Special
                          </p>
                        ) : null}
                      </div>

                      {/* Add to Cart button */}
                      {p.stock > 0 && (
                        <button 
                          onClick={() => addToCart(p)}
                          className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold p-2.5 rounded-2xl cursor-pointer transition-all shadow-md hover:shadow-lg hover:shadow-emerald-100"
                        >
                          <ShoppingBag className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>

                    {/* ADMIN ONLY ACTIONS LIVE ON CARD */}
                    {activeSession.role === "admin" && (
                      <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px] bg-emerald-50/50 -mx-5 -mb-5 p-4 rounded-b-3xl">
                        <p className="font-bold text-emerald-950 flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          Set Additional Admin Discount (%)
                        </p>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            defaultValue={p.adminDiscount || 0}
                            onBlur={e => handleSetAdminDiscount(p.id, Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 w-16 text-center font-bold"
                          />
                          <span className="text-[10px] text-slate-500">Apply instantly to clients</span>
                        </div>
                        
                        {/* Approve plant control if pending */}
                        {!p.isAdminApproved && (
                          <div className="flex gap-2 pt-1.5">
                            <button 
                              onClick={() => handleApprovePlant(p.id, true)}
                              className="bg-emerald-800 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Approve Variety
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* RE-DESIGNED GORGEOUS SLIDING CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setCartOpen(false)} />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center text-left">
              <div>
                <h3 className="font-display font-black text-slate-900 text-base">Your Botanist Cart</h3>
                <p className="text-[11px] text-slate-400">Review selected plants & proceed to courier calculation</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-slate-50 rounded-full border border-slate-100 cursor-pointer">
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {checkoutStep === "cart" && (
                <>
                  {cart.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                      <span className="text-4xl">🛒</span>
                      <h4 className="font-display font-semibold text-slate-500 text-xs">Your cart is currently empty</h4>
                      <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">Explore available live varieties on the homepage to start shopping.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => {
                        const finalDisc = Math.min(99, item.discount + item.adminDiscount);
                        const rateAfterDisc = item.price * (1 - finalDisc / 100);
                        const totalRate = rateAfterDisc * item.quantity;

                        return (
                          <div key={item.plantId} className="flex gap-4 p-3 border border-slate-100 rounded-2xl bg-slate-50/50 text-left">
                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0" />
                            <div className="flex-1 truncate">
                              <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                                Base Rate: ₹{item.price} &bull; Disc: {finalDisc}%
                              </p>
                              
                              <p className="font-extrabold text-emerald-800 text-xs leading-tight mt-1">
                                ₹{Math.round(rateAfterDisc)} x {item.quantity} = ₹{Math.round(totalRate)}
                              </p>
                            </div>
                            
                            {/* Quantity buttons */}
                            <div className="flex flex-col items-end justify-between shrink-0">
                              <button 
                                onClick={() => removeFromCart(item.plantId)} 
                                className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                                <button onClick={() => updateCartQty(item.plantId, -1)} className="p-0.5 text-slate-600 hover:bg-slate-50 rounded"><Minus className="w-3 h-3" /></button>
                                <span className="text-[11px] font-bold px-1.5">{item.quantity}</span>
                                <button onClick={() => updateCartQty(item.plantId, 1)} className="p-0.5 text-slate-600 hover:bg-slate-50 rounded"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* DETAILS AND PAYMENT STEP (Customers login only when they intend to make a payment) */}
              {checkoutStep === "details" && (
                <div className="space-y-5 text-left">
                  
                  {/* Prompt User login if not logged in as a customer */}
                  {(activeSession.role !== "customer" || !activeSession.data) ? (
                    <div className="space-y-4 border border-emerald-100 p-4 rounded-2xl bg-emerald-50/50">
                      
                      <div className="space-y-1">
                        <span className="bg-emerald-800 text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full inline-block">Security Authentication</span>
                        <h4 className="font-display font-bold text-slate-900 text-xs mt-1">Save Profile in Database</h4>
                        <p className="text-[11px] text-slate-500">Provide your contact and delivery parameters below to securely initiate the payment gateway.</p>
                      </div>

                      {/* Customer Auth Tab switcher */}
                      <div className="flex bg-slate-150 p-0.5 rounded-xl text-[10px]">
                        <button 
                          onClick={() => setCustomerAuthTab("login")} 
                          className={`flex-1 py-1 rounded-lg font-bold ${customerAuthTab === "login" ? "bg-white text-emerald-800" : "text-slate-400"}`}
                        >
                          🔐 Switch Member Profile
                        </button>
                        <button 
                          onClick={() => setCustomerAuthTab("register")} 
                          className={`flex-1 py-1 rounded-lg font-bold ${customerAuthTab === "register" ? "bg-white text-emerald-800" : "text-slate-400"}`}
                        >
                          📋 Create Profile Card
                        </button>
                      </div>

                      {customerAuthTab === "login" ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Select Registered Profile:</label>
                          {customers.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic bg-white p-3 rounded-xl border border-dashed">No customer directory found. Please Register profile!</p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                              {customers.map(c => (
                                <button 
                                  key={c.id} 
                                  onClick={() => {
                                    setActiveSession({ role: "customer", data: c });
                                    addNotification(`Welcome back, ${c.name}!`, "success");
                                  }}
                                  className="flex items-center gap-3 bg-white hover:bg-emerald-50 border border-slate-200 p-2 rounded-xl transition-all text-left cursor-pointer"
                                >
                                  <div className="w-8 h-8 rounded-full border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                                    {c.photograph ? (
                                      <img src={c.photograph} alt={c.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <User className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="truncate text-xs">
                                    <p className="font-bold text-slate-900 leading-tight">{c.name}</p>
                                    <p className="text-[10px] text-slate-400 leading-none mt-0.5">{c.email}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">Your Name</label>
                            <input 
                              type="text" 
                              required
                              value={customerRegName}
                              onChange={e => setCustomerRegName(e.target.value)}
                              placeholder="e.g. Suresh Gupta"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">Email Address</label>
                            <input 
                              type="email" 
                              required
                              value={customerRegEmail}
                              onChange={e => setCustomerRegEmail(e.target.value)}
                              placeholder="e.g. suresh@gmail.com"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">Phone Number</label>
                            <input 
                              type="text" 
                              required
                              value={customerRegPhone}
                              onChange={e => setCustomerRegPhone(e.target.value)}
                              placeholder="e.g. +91 98888 77777"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">Delivery Address</label>
                            <input 
                              type="text" 
                              required
                              value={customerRegAddress}
                              onChange={e => setCustomerRegAddress(e.target.value)}
                              placeholder="Flat 402, Sector 56, Gurugram"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">Portrait Photograph (Saved in DB)</label>
                            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={e => handlePhotoUpload(e, setCustomerRegPhoto)}
                                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-800 cursor-pointer w-full"
                              />
                              {customerRegPhoto && <img src={customerRegPhoto} alt="Portrait Preview" className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200" />}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRegisterCustomer()}
                            className="w-full bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs hover:bg-emerald-950 transition-all cursor-pointer"
                          >
                            📋 Register delivery profile & proceed
                          </button>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Authenticated Customer parameters display */}
                      <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-emerald-200 bg-white flex items-center justify-center">
                          {activeSession.data.photograph ? (
                            <img src={activeSession.data.photograph} alt={activeSession.data.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-emerald-800" />
                          )}
                        </div>
                        <div className="text-xs flex-1 truncate">
                          <span className="bg-emerald-800 text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full inline-block">Member Checkout</span>
                          <h4 className="font-bold text-slate-900 truncate leading-tight mt-0.5">{activeSession.data.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">{activeSession.data.email} &bull; {activeSession.data.phone}</p>
                        </div>
                      </div>

                      {/* Checkout fields pre-filled */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Deliver to Address</label>
                          <input 
                            type="text" 
                            required
                            value={checkoutAddress}
                            onChange={e => setCheckoutAddress(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Contact Phone</label>
                          <input 
                            type="text" 
                            required
                            value={checkoutPhone}
                            onChange={e => setCheckoutPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                          />
                        </div>
                      </div>

                      {/* Payment gateway options */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Choose Instant UPI Gateway:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "UPI_PHONEPE", name: "PhonePe", icon: "🟣" },
                            { id: "UPI_GPAY", name: "Google Pay", icon: "🔵" },
                            { id: "UPI_PAYTM", name: "Paytm", icon: "⚫" },
                            { id: "QR_CODE", name: "QR Scanner", icon: "🔳" }
                          ].map(pay => (
                            <button
                              key={pay.id}
                              onClick={() => setPaymentMethod(pay.id as any)}
                              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                paymentMethod === pay.id ? "bg-emerald-50 border-emerald-600 text-emerald-800" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              <span>{pay.icon}</span>
                              <span>{pay.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* QR Scan to Pay Container */}
                      <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            ⚡ UPI Dynamic QR Code
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1">
                            ⏳ Expires: {Math.floor(qrCountdown / 60)}:{(qrCountdown % 60).toString().padStart(2, "0")}
                          </span>
                        </div>

                        {/* QR Code Container with Scanning Laser */}
                        <div className="relative w-40 h-40 mx-auto bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs flex items-center justify-center">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=064e3b&data=${encodeURIComponent(
                              `upi://pay?pa=plantadda@paytm&pn=PlantAdda&am=${Math.round(getCartTotals().total)}&cu=INR&tn=Order${Date.now().toString().slice(-6)}`
                            )}`}
                            alt="Scan QR to Pay via Paytm/UPI"
                            className={`w-full h-full object-contain transition-all duration-300 ${
                              qrScanStatus === "success" ? "blur-xs opacity-25" : ""
                            }`}
                          />

                          {/* Laser Scan Line (animates up and down) */}
                          {qrScanStatus === "idle" && (
                            <div className="absolute left-2 right-2 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-bounce top-2 z-10" style={{ animationDuration: "2.5s" }} />
                          )}

                          {/* Success Overlay */}
                          {qrScanStatus === "success" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20">
                              <span className="text-3xl">✅</span>
                              <span className="text-[10px] font-bold text-emerald-800 mt-1 uppercase">Payment Verified</span>
                            </div>
                          )}

                          {/* Verifying/Scanning Overlay */}
                          {qrScanStatus === "scanning" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20">
                              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-wider">Verifying Paytm / UPI ...</span>
                            </div>
                          )}
                        </div>

                        {/* Scanner Status and Instructions */}
                        <div className="text-[11px] space-y-1">
                          <p className="font-bold text-slate-800">
                            Scan with Paytm, PhonePe, GPay or your Mobile Camera
                          </p>
                          <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                            Scan the secure QR code using your mobile device. The payment will then be completed instantly via UPI or Paytm.
                          </p>
                        </div>

                        {/* Simulation Controls */}
                        <div className="pt-1">
                          {qrScanStatus === "idle" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setQrScanStatus("scanning");
                                setTimeout(() => {
                                  setQrScanStatus("success");
                                  addNotification("🟢 Paytm/UPI Scan Verified! Ordering now...", "success");
                                  setTimeout(() => {
                                    handlePlaceOrder();
                                  }, 1000);
                                }, 1800);
                              }}
                              className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <span>📲 Simulate Mobile Scan & Payment</span>
                            </button>
                          ) : qrScanStatus === "scanning" ? (
                            <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 py-1.5 rounded-xl animate-pulse">
                              ⏳ Fetching Paytm/UPI Webhook Status...
                            </div>
                          ) : (
                            <div className="text-[10px] font-bold text-white bg-emerald-700 border border-emerald-800 py-1.5 rounded-xl flex items-center justify-center gap-1">
                              <span>✓ Payment Received Successfully!</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* SUCCESS STATE */}
              {checkoutStep === "success" && placedOrder && (
                <div className="py-8 text-center space-y-4 text-slate-800 text-xs">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 text-2xl mx-auto">
                    🎉
                  </div>
                  <div className="space-y-2 text-center text-xs">
                    <h4 className="font-display font-black text-slate-900 text-sm">Purchase Complete!</h4>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Thank you Suresh! A simulated order notification has been dispatched to your profile registry: 
                      <b> {placedOrder.customerPhone}</b>.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-left space-y-2">
                    <div className="flex justify-between font-bold text-[10px] uppercase text-slate-450">
                      <span>Order Reference ID</span>
                      <span>₹{placedOrder.total}</span>
                    </div>
                    <p className="font-mono text-[10px] font-bold text-emerald-800 leading-none">{placedOrder.id}</p>
                    <div className="border-t border-slate-150 pt-2 text-[10px] text-slate-500">
                      <p>📍 Deliver to: <b>{placedOrder.customerAddress}</b></p>
                      <p>🚚 Courier: <b>Within 24 Hours</b></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setCartOpen(false); setCheckoutStep("cart"); }}
                    className="w-full bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs"
                  >
                    Return to Green Garden Homepage
                  </button>
                </div>
              )}

            </div>

            {/* Drawer Footer summary */}
            {cart.length > 0 && checkoutStep !== "success" && (
              <div className="p-6 bg-slate-50 border-t border-slate-200 text-left space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-450">Cart Subtotal:</span>
                    <span className="font-bold text-slate-800">₹{Math.round(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Delivery & Courier Processes:</span>
                    <span className="font-bold text-slate-800">
                      {totals.shipping === 0 ? "FREE" : `₹${Math.round(totals.shipping)}`}
                    </span>
                  </div>
                  {totals.shipping > 0 && (
                    <p className="text-[10px] text-emerald-800 italic bg-emerald-50 px-2.5 py-1 rounded-md">
                      💡 Add ₹{Math.max(0, deliverySettings.freeDeliveryThreshold - totals.subtotal)} more to qualify for <b>FREE Delivery</b>!
                    </p>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                    <span className="text-slate-900">Total Grand Amount:</span>
                    <span className="text-emerald-800">₹{Math.round(totals.total)}</span>
                  </div>
                </div>

                {checkoutStep === "cart" ? (
                  <button 
                    onClick={() => setCheckoutStep("details")}
                    className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-emerald-50 cursor-pointer text-center block"
                  >
                    Proceed to Payment Parameters
                  </button>
                ) : (
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={activeSession.role === "guest" || !activeSession.data}
                    className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-emerald-50 cursor-pointer text-center block disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    💳 Pay ₹{Math.round(totals.total)} via UPI
                  </button>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* PORTAL LOGIN MODAL (Allows three types of user registrations & logins) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowLoginModal(false)} />
          
          <div className="relative bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-zoom-in">
            
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 p-1">
              {[
                { id: "customer", name: "Customer", icon: "🛒" },
                { id: "vendor", name: "Nursery Owner", icon: "🏪" },
                { id: "admin", name: "Admin Desk", icon: "🔐" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setLoginTab(tab.id as any)}
                  className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer text-center ${
                    loginTab === tab.id 
                      ? "bg-white text-emerald-800 shadow-sm" 
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* CUSTOMER TAB (Customers switch or register) */}
              {loginTab === "customer" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-900 text-sm">Customer Profile Switchboard</h3>
                    <p className="text-[11px] text-slate-500">Customers do not need to log in initially. However, you can choose or switch any profile in the database below.</p>
                  </div>

                  {customers.length === 0 ? (
                    <div className="p-4 border border-slate-200 rounded-2xl text-center text-slate-400 bg-slate-50/50">
                      No customer profiles saved in the database. Shop and register at checkout!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {customers.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleCustomerLogin(c)}
                          className="flex items-center gap-3 w-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-2xl p-2.5 transition-all text-left cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-full border border-slate-300 overflow-hidden flex items-center justify-center bg-white shrink-0">
                            {c.photograph ? (
                              <img src={c.photograph} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-tight">{c.name}</p>
                            <p className="text-[10px] text-slate-500 leading-normal">{c.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => setShowLoginModal(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Close and Shop as Guest
                    </button>
                  </div>
                </div>
              )}

              {/* NURSERY OWNER TAB (Allows Register with Representative details, prices, upload photos) */}
              {loginTab === "vendor" && (
                <div className="space-y-4 text-xs">
                  
                  <div className="flex bg-slate-150 p-0.5 rounded-xl text-[10px]">
                    <button 
                      onClick={() => setCustomerAuthTab("login")} 
                      className={`flex-1 py-1 rounded-lg font-bold ${customerAuthTab === "login" ? "bg-white text-emerald-800" : "text-slate-400"}`}
                    >
                      🔐 Access Workstation
                    </button>
                    <button 
                      onClick={() => setCustomerAuthTab("register")} 
                      className={`flex-1 py-1 rounded-lg font-bold ${customerAuthTab === "register" ? "bg-white text-emerald-800" : "text-slate-400"}`}
                    >
                      📋 Register Your Nursery
                    </button>
                  </div>

                  {customerAuthTab === "login" ? (
                    selectedVendorForLogin === null ? (
                      <div className="space-y-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] text-slate-500 leading-normal flex gap-2 items-start">
                          <span className="text-sm">🏪</span>
                          <span>
                            Select your registered Nursery name from the roster below, then enter your password to access your dashboard instantly.
                          </span>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Registered Nursery Owners (Top 10)</span>
                          {(vendors || []).slice(0, 10).map(vendor => (
                            <button
                              key={vendor.id}
                              type="button"
                              onClick={() => {
                                setSelectedVendorForLogin(vendor);
                                setVendorLoginPassword("");
                              }}
                              className="flex items-center justify-between w-full p-2.5 text-left border border-slate-200 rounded-2xl bg-white hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                                  {vendor.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-[11px] leading-tight group-hover:text-emerald-900">{vendor.name}</h4>
                                  <p className="text-[10px] text-slate-500 leading-normal">{vendor.nurseryName}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shadow-3xs group-hover:bg-emerald-100 group-hover:text-emerald-800 group-hover:border-emerald-200 transition-all">Select</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleVendorLogin(e)} className="space-y-4">
                        <div className="p-3 border border-emerald-150 bg-emerald-50/30 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {selectedVendorForLogin.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-[11px] leading-tight">{selectedVendorForLogin.name}</h4>
                              <p className="text-[10px] text-slate-500 leading-normal">{selectedVendorForLogin.nurseryName}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedVendorForLogin(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                          >
                            Back
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block">Enter Password</label>
                          <input
                            type="password"
                            required
                            autoFocus
                            value={vendorLoginPassword}
                            onChange={e => setVendorLoginPassword(e.target.value)}
                            placeholder="e.g. 12345"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Default workstation key is <b className="text-emerald-700">12345</b></p>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-2 rounded-xl transition-all cursor-pointer text-center block text-xs"
                        >
                          ⚡ Access Workstation
                        </button>
                      </form>
                    )
                  ) : (
                    <form onSubmit={handleRegisterVendor} className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Nursery Center Name</label>
                        <input 
                          type="text" 
                          required
                          value={vendorRegNursery}
                          onChange={e => setVendorRegNursery(e.target.value)}
                          placeholder="e.g. Greenwood Valley Nursery"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Representative Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={vendorRegName}
                          onChange={e => setVendorRegName(e.target.value)}
                          placeholder="e.g. Rajesh Kumar"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={vendorRegEmail}
                          onChange={e => setVendorRegEmail(e.target.value)}
                          placeholder="e.g. rajesh@greenwood.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Contact Phone Number</label>
                        <input 
                          type="text" 
                          required
                          value={vendorRegPhone}
                          onChange={e => setVendorRegPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">Physical Address / Location</label>
                        <input 
                          type="text" 
                          required
                          value={vendorRegAddress}
                          onChange={e => setVendorRegAddress(e.target.value)}
                          placeholder="Sector 14, Gurugram, Haryana"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">License / Portrait Proof (Photo Upload)</label>
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={e => handlePhotoUpload(e, setVendorRegPhoto)}
                            className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-800 cursor-pointer w-full"
                          />
                          {vendorRegPhoto && <img src={vendorRegPhoto} alt="License preview" className="w-10 h-10 object-cover rounded-lg shrink-0" />}
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                      >
                        📋 Propose Nursery Partnership Card
                      </button>
                    </form>
                  )}

                </div>
              )}

              {/* ADMIN TAB (Username and password required) */}
              {loginTab === "admin" && (
                <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                  <div className="space-y-1 text-center">
                    <span className="text-3xl">🔐</span>
                    <h3 className="font-display font-bold text-slate-900 text-sm mt-1">Administrative Executive Desk</h3>
                    <p className="text-[11px] text-slate-400">Please authenticate using centralized parameters to enter command dashboard.</p>
                    <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-[10px] font-bold mt-1">
                      💡 Hint: Enter <b>admin</b> & <b>admin123</b> to unlock.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">Admin Username</label>
                      <input 
                        type="text" 
                        required
                        value={adminUsername}
                        onChange={e => setAdminUsername(e.target.value)}
                        placeholder="Enter admin username"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">Access Key Password</label>
                      <input 
                        type="password" 
                        required
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        placeholder="Enter admin password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                  >
                    🚀 Authenticate & Unlock Dashboard
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

      {/* PLANT UPLOAD/EDIT MODAL FOR VENDORS */}
      {showAddPlantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowAddPlantModal(false)} />
          
          <div className="relative bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-zoom-in">
            
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-display font-black text-slate-950 text-sm">
                {editingPlant ? "Modify Botanical Details" : "Publish Plant Variety to Catalog"}
              </h3>
              <button onClick={() => setShowAddPlantModal(false)} className="p-1 hover:bg-slate-200 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlant} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Plant Name</label>
                  <input 
                    type="text" 
                    required
                    value={plantName}
                    onChange={e => setPlantName(e.target.value)}
                    placeholder="e.g. Bonsai Ficus"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Category</label>
                  <select
                    value={plantCategory}
                    onChange={e => setPlantCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold cursor-pointer"
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Base Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={plantPrice}
                    onChange={e => setPlantPrice(e.target.value)}
                    placeholder="299"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Your Discount (%)</label>
                  <input 
                    type="number" 
                    required
                    value={plantDiscount}
                    onChange={e => setPlantDiscount(e.target.value)}
                    placeholder="10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Nurtured Stock Units</label>
                  <input 
                    type="number" 
                    required
                    value={plantStock}
                    onChange={e => setPlantStock(e.target.value)}
                    placeholder="20"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Ideal Growth Season</label>
                  <select
                    value={plantSeason}
                    onChange={e => setPlantSeason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer"
                  >
                    <option value="All Season">All Season</option>
                    <option value="Winter">Winter</option>
                    <option value="Summer">Summer</option>
                    <option value="Monsoon">Monsoon</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">Short Description</label>
                <textarea 
                  value={plantDesc}
                  onChange={e => setPlantDesc(e.target.value)}
                  placeholder="Tell clients about this homegrown beauty..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 h-16"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">Care Instructions</label>
                <input 
                  type="text" 
                  value={plantCare}
                  onChange={e => setPlantCare(e.target.value)}
                  placeholder="e.g. Keep in shade, water once in two days"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">Upload Botanical Photograph</label>
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handlePhotoUpload(e, setPlantImage)}
                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-800 cursor-pointer w-full"
                  />
                  {plantImage && <img src={plantImage} alt="Plant Preview" className="w-12 h-12 object-cover rounded-lg shrink-0" />}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md"
              >
                🚀 {editingPlant ? "Update Plant Details" : "Publish Plant to Catalog"}
              </button>

            </form>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-8 mt-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5 text-left">
            <PlantAddaLogo size={120} showTagline={false} className="brightness-110" />
            <div className="border-l border-slate-800 pl-4">
              <p className="text-[10px] opacity-75">&copy; 2026 PlantAdda, Inc. All rights reserved.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
            <span>&bull;</span>
            <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
            <span>&bull;</span>
            <span className="cursor-pointer hover:text-white transition-colors">Nursery Support</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
