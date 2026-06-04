import React, { useState, useEffect } from "react";
import { 
  Sprout, 
  ShoppingBag, 
  Heart, 
  Search, 
  Filter, 
  Sparkles, 
  TrendingUp, 
  User, 
  ShoppingBag as CartIcon, 
  Plus, 
  Minus, 
  Trash2,
  Star, 
  CheckCircle, 
  AlertTriangle, 
  QrCode, 
  MapPin, 
  ChevronRight, 
  Activity, 
  UserCheck, 
  Hammer, 
  Coins, 
  Clock, 
  FileText, 
  Camera, 
  RefreshCw,
  Gift,
  Check,
  X,
  Truck,
  CreditCard,
  Database
} from "lucide-react";
import GardenHelper from "./components/GardenHelper";
import { Category, Plant, Vendor, Order, AMCService, DeliverySettings, UserSession } from "./types";
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  createUnifiedSpreadsheet, 
  updateSheetValues, 
  formatOrdersData, 
  formatPlantsData, 
  formatVendorsData 
} from "./googleSheetsService";

export default function App() {
  // Translate & Font states
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const t = (enText: string, hiText: string) => {
    return language === "hi" ? hiText : enText;
  };

  // Navigation & Role switcher
  const [currentTab, setCurrentTab] = useState<"marketplace" | "sub" | "ai" | "vendor" | "admin">("marketplace");
  const [currentUser, setCurrentUser] = useState<UserSession>({
    email: "customer@gmail.com",
    name: "Suresh Gupta",
    role: "customer"
  });

  // Data States
  const [plants, setPlants] = useState<any[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<any[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [amcServices, setAmcServices] = useState<AMCService[]>([]);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    id: "settings",
    freeDeliveryThreshold: 499,
    standardDeliveryCharge: 49,
    baseCommissionPercent: 12
  });

  // UI Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(1500);

  // Cart & Wishlist States
  const [cart, setCart] = useState<{ plantId: string; name: string; price: number; discount: number; quantity: number; imageUrl: any; vendorId: string }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Modal / Detail States
  const [selectedPlant, setSelectedPlant] = useState<any | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"none" | "address" | "upi" | "success">("none");
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Dynamic Category Covers, Addition & Plant Rating States
  const [categoryCovers, setCategoryCovers] = useState<Record<string, string>>({});
  const [catManageName, setCatManageName] = useState("");
  const [catManageUrl, setCatManageUrl] = useState("");
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewName, setNewReviewName] = useState("Suresh Gupta");

  // AI Care Consult popup custom states
  const [aiCustomConsultLoading, setAiCustomConsultLoading] = useState(false);
  const [aiCustomConsultResult, setAiCustomConsultResult] = useState("");

  // Form states
  const [checkoutName, setCheckoutName] = useState(currentUser.name);
  const [checkoutPhone, setCheckoutPhone] = useState("+91 98888 77777");
  const [checkoutAddress, setCheckoutAddress] = useState("Flat 402, Royal Orchids, Sector 56, Gurugram, HR");
  const [paymentProvider, setPaymentProvider] = useState<"PhonePe" | "GPay" | "Paytm" | "QR">("PhonePe");
  const [placedOrderDetails, setPlacedOrderDetails] = useState<Order | null>(null);

  // 24 Hour Return Guarantee form states
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnPhotoBase64, setReturnPhotoBase64] = useState<string>("");
  const [returnSuccessMessage, setReturnSuccessMessage] = useState("");

  // AI Botanical Photo Scanner states
  const [scanImageBase64, setScanImageBase64] = useState<string>("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string>("");
  const [scannedImagePreview, setScannedImagePreview] = useState<string>("");

  // Predefined image suggestions for fast testing of the botany scan
  const SCAN_PRESETS = [
    {
      name: "🍋 Lemon Leaf Spot",
      url: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80",
      b64: "MOCK_LEMON_LEAF_BASE64"
    },
    {
      name: "🌸 Wilted Flower Bloom",
      url: "https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&w=400&q=80",
      b64: "MOCK_WILTED_FLOWER_BASE64"
    },
    {
      name: "🪴 Healthier Snake Plant",
      url: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80",
      b64: "MOCK_HEALTHY_SNAKE_BASE64"
    }
  ];

  // AMC Subscription plan states
  const [amcPlanType, setAmcPlanType] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [amcServicesSelected, setAmcServicesSelected] = useState<string[]>([
    "Weekly plant watering",
    "Fertilizer service"
  ]);
  const [amcCachedPrice, setAmcCachedPrice] = useState(299);
  const [amcSubscribedMessage, setAmcSubscribedMessage] = useState("");

  // Vendor Interface States
  const [vendorRegName, setVendorRegName] = useState("");
  const [vendorRegNursery, setVendorRegNursery] = useState("");
  const [vendorRegEmail, setVendorRegEmail] = useState("");
  const [vendorRegPhone, setVendorRegPhone] = useState("");
  const [vendorRegAddress, setVendorRegAddress] = useState("");
  const [activeVendorSession, setActiveVendorSession] = useState<Vendor | null>(null);
  
  // Vendor Inventory Add state
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantCategory, setNewPlantCategory] = useState<Category>(Category.INDOOR_PLANTS);
  const [newPlantPrice, setNewPlantPrice] = useState("");
  const [newPlantDiscount, setNewPlantDiscount] = useState("10");
  const [newPlantSeason, setNewPlantSeason] = useState("All Season");
  const [newPlantStock, setNewPlantStock] = useState("20");
  const [newPlantDesc, setNewPlantDesc] = useState("");
  const [newPlantCare, setNewPlantCare] = useState("");
  const [newPlantImage, setNewPlantImage] = useState("");

  // Admin Config States
  const [adminFreeThreshold, setAdminFreeThreshold] = useState("499");
  const [adminDeliveryCharge, setAdminDeliveryCharge] = useState("49");
  const [adminCommissionRate, setAdminCommissionRate] = useState("12");

  // Three-tone Green Theme Selection Control
  const [greenTheme, setGreenTheme] = useState<"parrot" | "bottle" | "dark">("dark");

  // Database Integration & Promo Banner States
  const [promoBanner, setPromoBanner] = useState<{ imageUrl: string; title: string; isActive: boolean; newsText?: string } | null>({
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80",
    title: "🌱 Monsoon Special Sale: Flat 20% OFF on all Green Air Purifiers!",
    isActive: true,
    newsText: "PlantAdda certified local nursery centers are now fully operational in 12+ states in India!"
  });
  const [dbConnections, setDbConnections] = useState<any[]>([]);
  const [zoomedPlantPhoto, setZoomedPlantPhoto] = useState<any | null>(null);
  const [androidPreviewMode, setAndroidPreviewMode] = useState<boolean>(true);
  
  // Specific view data fetched from a selected database integration (like Supabase Auth profile list)
  const [activeIntegratedDbId, setActiveIntegratedDbId] = useState<string | null>(null);
  const [integratedUserProfiles, setIntegratedUserProfiles] = useState<any[]>([]);
  const [testingDbId, setTestingDbId] = useState<string | null>(null);
  const [dbTestMessage, setDbTestMessage] = useState<string>("");

  // New Database connection form states
  const [newDbProvider, setNewDbProvider] = useState<"supabase" | "postgresql" | "mongodb" | "firebase">("supabase");
  const [newDbDisplayName, setNewDbDisplayName] = useState("");
  const [newDbConnectionString, setNewDbConnectionString] = useState("");
  const [newDbApiKey, setNewDbApiKey] = useState("");
  const [newDbSchemaDetails, setNewDbSchemaDetails] = useState("");

  // Target promotional edits state in admin panel
  const [adminPromoTitle, setAdminPromoTitle] = useState("");
  const [adminPromoImageUrl, setAdminPromoImageUrl] = useState("");
  const [adminPromoIsActive, setAdminPromoIsActive] = useState(true);
  const [adminPromoNewsText, setAdminPromoNewsText] = useState("");

  // Vendor Courier Proposing State
  const [vendorProposedCourierRate, setVendorProposedCourierRate] = useState("");

  // Vendor Plant Editing state (Manage & update plant anytime)
  const [editingPlant, setEditingPlant] = useState<any | null>(null);

  // Admin instant manual pricing override state maps
  const [overrideVendorDeliveryVals, setOverrideVendorDeliveryVals] = useState<{ [vId: string]: string }>({});
  const [overridePlantPriceVals, setOverridePlantPriceVals] = useState<{ [pId: string]: string }>({});
  const [overridePlantDiscountVals, setOverridePlantDiscountVals] = useState<{ [pId: string]: string }>({});

  // Google Sheets integration state
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string | null>(() => localStorage.getItem("plantadda_google_sheet_url"));
  const [googleSheetId, setGoogleSheetId] = useState<string | null>(() => localStorage.getItem("plantadda_google_sheet_id"));
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<"idle" | "creating" | "syncing" | "success" | "error">("idle");
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem("plantadda_last_sync_time"));

  useEffect(() => {
    // Listen to Google Auth state
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLink = async () => {
    setIsLinkingGoogle(true);
    setSheetsError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleAccessToken(res.accessToken);
        alert(t("🎉 Google Account linked and synchronized successfully!", "🎉 Google खाता सफ़लतापूर्वक लिंक हो गया!"));
      }
    } catch (e: any) {
      console.error(e);
      setSheetsError(e.message || "Failed to sign in with Google.");
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleGoogleUnlink = async () => {
    const confirmSignout = window.confirm(t("Are you sure you want to decouple Google Sheets?", "क्या आप Google Sheets को डिस्कनेक्ट करना चाहते हैं?"));
    if (!confirmSignout) return;
    try {
      await logout();
      setGoogleUser(null);
      setGoogleAccessToken(null);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!googleAccessToken) {
      alert("Please link your Google account first.");
      return;
    }
    setSheetsSyncStatus("creating");
    setSheetsError(null);
    try {
      const title = `PlantAdda Unified Dashboard (${new Date().toLocaleDateString()})`;
      const sheetInfo = await createUnifiedSpreadsheet(googleAccessToken, title);
      
      localStorage.setItem("plantadda_google_sheet_url", sheetInfo.spreadsheetUrl);
      localStorage.setItem("plantadda_google_sheet_id", sheetInfo.spreadsheetId);
      setGoogleSheetUrl(sheetInfo.spreadsheetUrl);
      setGoogleSheetId(sheetInfo.spreadsheetId);

      // Now sync all tables right away
      setSheetsSyncStatus("syncing");
      
      const ordersData = formatOrdersData(orders);
      const plantsData = formatPlantsData(plants);
      const vendorsData = formatVendorsData(vendors);

      await updateSheetValues(googleAccessToken, sheetInfo.spreadsheetId, "Orders Tab!A1", ordersData);
      await updateSheetValues(googleAccessToken, sheetInfo.spreadsheetId, "Plant Inventory!A1", plantsData);
      await updateSheetValues(googleAccessToken, sheetInfo.spreadsheetId, "Vendor Directory!A1", vendorsData);

      const timestamp = new Date().toLocaleString();
      localStorage.setItem("plantadda_last_sync_time", timestamp);
      setLastSyncTime(timestamp);

      setSheetsSyncStatus("success");
      alert(t("📁 Multi-tab Google Sheet created & synchronized successfully!", "📁 Google Sheet बन गई और सिंक हो गई!"));
    } catch (e: any) {
      console.error(e);
      setSheetsSyncStatus("error");
      setSheetsError(e.message || "Failed to create spreadsheet.");
    }
  };

  const handleSyncExistingSheet = async () => {
    if (!googleAccessToken || !googleSheetId) {
      alert("No active linked sheet or Google authentication is missing.");
      return;
    }
    setSheetsSyncStatus("syncing");
    setSheetsError(null);
    try {
      const ordersData = formatOrdersData(orders);
      const plantsData = formatPlantsData(plants);
      const vendorsData = formatVendorsData(vendors);

      await updateSheetValues(googleAccessToken, googleSheetId, "Orders Tab!A1", ordersData);
      await updateSheetValues(googleAccessToken, googleSheetId, "Plant Inventory!A1", plantsData);
      await updateSheetValues(googleAccessToken, googleSheetId, "Vendor Directory!A1", vendorsData);

      const timestamp = new Date().toLocaleString();
      localStorage.setItem("plantadda_last_sync_time", timestamp);
      setLastSyncTime(timestamp);

      setSheetsSyncStatus("success");
      setTimeout(() => setSheetsSyncStatus("idle"), 4000); // go back to idle after showing success
    } catch (e: any) {
      console.error(e);
      setSheetsSyncStatus("error");
      setSheetsError(e.message || "Failed to sync spreadsheet.");
    }
  };

  const handleExportSingleSection = async (type: "orders" | "plants" | "vendors") => {
    if (!googleAccessToken) {
      alert("Please link Google Sheets first.");
      return;
    }
    setSheetsSyncStatus("syncing");
    setSheetsError(null);
    try {
      const title = `PlantAdda Single Section - ${type.toUpperCase()}`;
      const sheetInfo = await createUnifiedSpreadsheet(googleAccessToken, title);
      
      let rows: any[][] = [];
      let tabName = "Sheet1";
      if (type === "orders") {
        rows = formatOrdersData(orders);
        tabName = "Orders Tab";
      } else if (type === "plants") {
        rows = formatPlantsData(plants);
        tabName = "Plant Inventory";
      } else {
        rows = formatVendorsData(vendors);
        tabName = "Vendor Directory";
      }

      await updateSheetValues(googleAccessToken, sheetInfo.spreadsheetId, `${tabName}!A1`, rows);
      setSheetsSyncStatus("success");
      window.open(sheetInfo.spreadsheetUrl, "_blank");
      setTimeout(() => setSheetsSyncStatus("idle"), 3000);
    } catch (e: any) {
      console.error(e);
      setSheetsSyncStatus("error");
      setSheetsError(e.message || "Failed to export standalone sheet.");
    }
  };

  const fetchPromoBannerData = async () => {
    try {
      const res = await fetch("/api/admin/promo");
      if (res.ok) {
        const data = await res.json();
        setPromoBanner(data);
        setAdminPromoTitle(data.title);
        setAdminPromoImageUrl(data.imageUrl);
        setAdminPromoIsActive(data.isActive);
        setAdminPromoNewsText(data.newsText || "");
      }
    } catch(e) {
      console.error(e);
    }
  };

  const fetchCategoryCovers = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategoryCovers(data);
      }
    } catch (e) {
      console.error("Error loading categories", e);
    }
  };

  const handleSaveCategoryCover = async () => {
    if (!catManageName.trim()) {
      alert("Please specify a valid Category Name");
      return;
    }
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catManageName.trim(),
          imageUrl: catManageUrl.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCategoryCovers(data);
        setCatManageName("");
        setCatManageUrl("");
        alert(`✨ Default category image for "${catManageName.trim()}" saved and synchronized!`);
        fetchPlants();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategoryCover = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the category cover for "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const data = await res.json();
        setCategoryCovers(data.category_covers || {});
        alert(`♻️ Category cover image for "${name}" deleted!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddReview = async (plantId: string) => {
    if (!newReviewName.trim()) {
      alert("Please write your name");
      return;
    }
    if (!newReviewComment.trim()) {
      alert("Please write a small comment");
      return;
    }
    try {
      const res = await fetch(`/api/plants/${plantId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerName: newReviewName.trim(),
          reviewerEmail: currentUser.email,
          rating: newReviewRating,
          comment: newReviewComment.trim()
        })
      });
      if (res.ok) {
        alert("Customer review and star rate has been logged successfully!");
        setNewReviewComment("");
        
        // Reload plants and reset selectedPlant structure
        const plantsRes = await fetch("/api/plants");
        if (plantsRes.ok) {
          const loadedPlants = await plantsRes.json();
          setPlants(loadedPlants);
          const updated = loadedPlants.find((p: any) => p.id === plantId);
          if (updated) setSelectedPlant(updated);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReview = async (plantId: string, reviewId: string) => {
    if (!confirm("Remove this review and rating?")) return;
    try {
      const res = await fetch(`/api/plants/${plantId}/reviews/${reviewId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("🗑️ Review deleted!");
        const plantsRes = await fetch("/api/plants");
        if (plantsRes.ok) {
          const loadedPlants = await plantsRes.json();
          setPlants(loadedPlants);
          const updated = loadedPlants.find((p: any) => p.id === plantId);
          if (updated) setSelectedPlant(updated);
          else setSelectedPlant(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGetAiPlantCareBlueprint = async (plantName: string, category: string) => {
    if (aiCustomConsultLoading) return;
    setAiCustomConsultLoading(true);
    setAiCustomConsultResult("");

    try {
      const promptText = `Provide a premium, high-impact highly customized botanical organic plant care care Blueprint or checklist for houseplant "${plantName}" categorised under "${category}". Give actionable bullet points on (1) precise watering logic based on soil touch, (2) growth booster advice, and (3) a simple DIY pest control remedy with home ingredients like neem oil or baby soap. Address this guide to apartment balconies or small gardens. Keep it clean and highly actionable with nice emojis!`;

      const res = await fetch("/api/ai/botanical-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          previousMessages: []
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiCustomConsultResult(data.reply);
      } else {
        setAiCustomConsultResult("⚠️ AI Botanical Doctor is resting under tree shade. High nitrogen soil and monthly watering is recommended!");
      }
    } catch (e) {
      console.error("AI consult error", e);
      setAiCustomConsultResult("⚠️ Connection hiccup. Remember to give indirect bright sunlight and good organic compost!");
    } finally {
      setAiCustomConsultLoading(false);
    }
  };

  const handleClosePlantModal = () => {
    setSelectedPlant(null);
    setAiCustomConsultResult("");
  };

  const fetchDbConnectionsData = async () => {
    try {
      const res = await fetch("/api/admin/db-connections");
      if (res.ok) {
        const data = await res.json();
        setDbConnections(data);
        if (data.length > 0 && !activeIntegratedDbId) {
          // fetch first connection data by default
          fetchIntegratedUsers(data[0].id);
        }
      }
    } catch(e) {
      console.error(e);
    }
  };

  const fetchIntegratedUsers = async (dbId: string) => {
    try {
      setActiveIntegratedDbId(dbId);
      const res = await fetch(`/api/admin/db-connections/${dbId}/mock-users`);
      if (res.ok) {
        const data = await res.json();
        setIntegratedUserProfiles(data.profiles || []);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleTestDbConnection = async (dbId: string) => {
    try {
      setTestingDbId(dbId);
      setDbTestMessage("");
      const res = await fetch(`/api/admin/db-connections/${dbId}/test`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDbTestMessage(`✨ DB Test Successful! Latency: ${data.latencyMs}ms. Found tables: ${data.tablesFound.join(", ")}`);
        fetchDbConnectionsData();
        fetchIntegratedUsers(dbId);
      } else {
        setDbTestMessage(`❌ Test failed: ${data.error || "connection timeout"}`);
      }
    } catch (e: any) {
      setDbTestMessage(`❌ Error: ${e.message}`);
    } finally {
      setTestingDbId(null);
    }
  };

  const handleSaveDbConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/db-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: newDbProvider,
          displayName: newDbDisplayName || `${newDbProvider.toUpperCase()} Integrator Store`,
          connectionString: newDbConnectionString,
          apiKey: newDbApiKey,
          schemaDetails: newDbSchemaDetails || "public.profiles, public.user_logs"
        })
      });
      if (res.ok) {
        alert("🛡️ Custom database integration profile mounted successfully into our unified data router!");
        setNewDbDisplayName("");
        setNewDbConnectionString("");
        setNewDbApiKey("");
        setNewDbSchemaDetails("");
        fetchDbConnectionsData();
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleDeleteDbConnection = async (id: string) => {
    if (!confirm("Confirm deleting this database gateway? Sync operations will cease immediately.")) return;
    try {
      const res = await fetch(`/api/admin/db-connections/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDbConnectionsData();
        if (activeIntegratedDbId === id) {
          setActiveIntegratedDbId(null);
          setIntegratedUserProfiles([]);
        }
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleUpdatePromoBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: adminPromoTitle,
          imageUrl: adminPromoImageUrl,
          isActive: adminPromoIsActive,
          newsText: adminPromoNewsText
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPromoBanner(data);
        alert("✨ Homepage promotional banner & breaking news updated and synchronized in Real-time!");
      }
    } catch(e) {
      console.error(e);
    }
  };

  // Load all central APIs
  useEffect(() => {
    fetchPlants();
    fetchVendors();
    fetchOrders();
    fetchAMC();
    fetchDeliverySettings();
    fetchPromoBannerData();
    fetchDbConnectionsData();
    fetchCategoryCovers();
  }, [currentUser.role]); // Reload list when session switches roles

  const fetchPlants = async (overrideRole?: string) => {
    try {
      const activeRole = overrideRole || currentUser.role;
      const url = activeRole === "customer" ? "/api/plants" : `/api/plants?role=${activeRole}`;
      const res = await fetch(url);
      const data = await res.json();
      setPlants(data);
      setFilteredPlants(data);
    } catch (e) {
      console.error("Error loading plants", e);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      setVendors(data);
      // Auto-set vendor session for the current simulated active role
      const approved = data.find((v: Vendor) => v.status === "approved");
      if (approved && !activeVendorSession) {
        setActiveVendorSession(approved);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAMC = async () => {
    try {
      const res = await fetch("/api/amc");
      const data = await res.json();
      setAmcServices(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDeliverySettings = async () => {
    try {
      const res = await fetch("/api/delivery-settings");
      if (res.ok) {
        const data = await res.json();
        setDeliverySettings(data);
        setAdminFreeThreshold(String(data.freeDeliveryThreshold));
        setAdminDeliveryCharge(String(data.standardDeliveryCharge));
        setAdminCommissionRate(String(data.baseCommissionPercent));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run filtering on change
  useEffect(() => {
    let result = [...plants];

    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedSeason !== "All") {
      result = result.filter(p => p.season.toLowerCase() === selectedSeason.toLowerCase());
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    result = result.filter(p => {
      const priceAfterDiscount = p.price * (1 - p.discount / 100);
      return priceAfterDiscount <= priceRange;
    });

    setFilteredPlants(result);
  }, [plants, selectedCategory, searchQuery, selectedSeason, priceRange]);

  // Handle Cart Math
  const subtotal = cart.reduce((acc, item) => {
    const discountedPrice = item.price * (1 - item.discount / 100);
    return acc + discountedPrice * item.quantity;
  }, 0);

  const deliveryCharge = subtotal >= deliverySettings.freeDeliveryThreshold || subtotal === 0
    ? 0 : deliverySettings.standardDeliveryCharge;

  const totalAmount = subtotal + deliveryCharge;

  // Add Item to Shopping Cart
  const handleAddToCart = (plant: any, openDrawer: boolean = true) => {
    setCart(prev => {
      const existing = prev.find(item => item.plantId === plant.id);
      if (existing) {
        return prev.map(item => item.plantId === plant.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
        );
      }
      return [...prev, {
        plantId: plant.id,
        name: plant.name,
        price: plant.price,
        discount: plant.discount,
        quantity: 1,
        imageUrl: plant.imageUrls[0],
        vendorId: plant.vendorId || "vend-1" // Safely map fallback vendor
      }];
    });
    if (openDrawer) {
      setCartOpen(true);
    }
  };

  // Manage Cart item updates
  const updateCartQuantity = (id: string, amount: number) => {
    setCart(prev => prev.map(item => {
      if (item.plantId === id) {
        const nextQty = item.quantity + amount;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean) as any);
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) 
      ? prev.filter(item => item !== id) 
      : [...prev, id]
    );
  };

  // Checkout Placement Trigger
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    try {
      const payload = {
        customerName: checkoutName,
        customerEmail: currentUser.email,
        customerPhone: checkoutPhone,
        customerAddress: checkoutAddress,
        items: cart,
        paymentMethod: paymentProvider === "PhonePe" ? "UPI_PHONEPE" : 
                       paymentProvider === "GPay" ? "UPI_GPAY" :
                       paymentProvider === "Paytm" ? "UPI_PAYTM" : "QR_CODE"
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setPlacedOrderDetails(data);
        setCart([]);
        setCheckoutStep("success");
        setTrackingOrderId(data.id);
        fetchOrders();
        fetchPlants(); // Reload stocks count
      } else {
        alert("Payment process failed: " + data.error);
      }
    } catch (e: any) {
      alert("Billing connection error: " + e.message);
    }
  };

  // Claim 24 hour guarantee
  const handleInitiateReturn = (order: Order) => {
    setReturningOrder(order);
    setReturnReason("");
    setReturnPhotoBase64("");
    setReturnSuccessMessage("");
  };

  const handleReturnFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReturnPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitReturnRequest = async () => {
    if (!returningOrder) return;
    if (!returnReason || !returnPhotoBase64) {
      alert("Please upload photo evidence of the damaged plant and state the issue clearly.");
      return;
    }

    try {
      const res = await fetch(`/api/orders/${returningOrder.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: returnReason,
          photoProofUrl: returnPhotoBase64
        })
      });

      if (res.ok) {
        setReturnSuccessMessage("🌿 Claim received! PlantAdda Admin will inspect your 24-Hour Guarantee photo of lost foliage for immediate UPI wallet refund.");
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Botanical Scanner implementation
  const handleScanSample = async (preset: typeof SCAN_PRESETS[0]) => {
    setScannedImagePreview(preset.url);
    setScanLoading(true);
    setScanResult("");

    try {
      // Create random simulated base64 or pass preset info
      const res = await fetch("/api/ai/plant-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "data:image/jpeg;base64,...", // Simulated Image Part
          mimeType: "image/jpeg"
        })
      });

      const data = await res.json();
      if (res.ok) {
        setScanResult(data.analysis);
      } else {
        setScanResult("Could not process scanner. Make sure Gemini API Key is configured in Secrets.");
      }
    } catch (error) {
      setScanResult("Server offline. Displaying simulation feedback.");
    } finally {
      setScanLoading(false);
    }
  };

  const handleCustomScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const b64 = reader.result as string;
        setScannedImagePreview(b64);
        setScanLoading(true);
        setScanResult("");

        try {
          const res = await fetch("/api/ai/plant-scanner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: b64,
              mimeType: file.type
            })
          });

          const data = await res.json();
          setScanResult(data.analysis || "Analysis finished with empty output.");
        } catch (e: any) {
          setScanResult("Error scanning plant sample: " + e.message);
        } finally {
          setScanLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Recalculate AMC price live based on selections
  useEffect(() => {
    let multiplier = 1;
    if (amcPlanType === "quarterly") multiplier = 2.7; // discount
    if (amcPlanType === "yearly") multiplier = 10; // big discount
    
    const baseSum = amcServicesSelected.length * 150 * multiplier;
    setAmcCachedPrice(Math.round(baseSum));
  }, [amcPlanType, amcServicesSelected]);

  const handleSubscribeAMC = async () => {
    try {
      const res = await fetch("/api/amc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          customerPhone: "+91 99999 88888",
          address: "Flat 402, Royal Orchids, Sector 56, Gurugram, HR",
          plan: amcPlanType,
          services: amcServicesSelected,
          price: amcCachedPrice
        })
      });

      if (res.ok) {
        setAmcSubscribedMessage(`🎉 Subscription Active! Your AMC Service Code is AMC-${Math.floor(1000 + Math.random() * 9000)}. Our local nursery team will arrive for your first care appointment on Saturday!`);
        fetchAMC();
      } else {
        alert("Onboarding failed.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Vendor Registration API Trigger
  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vendors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vendorRegName,
          nurseryName: vendorRegNursery,
          contactEmail: vendorRegEmail,
          contactPhone: vendorRegPhone,
          address: vendorRegAddress
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert("🌿 Nursery submitted successfully! Your registry is currently 'pending' waiting for Admin inspection in the Admin tab.");
        fetchVendors();
        setActiveVendorSession(data);
      } else {
        alert("Registration failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Vendor Adds New Plant Image Link Or Mock
  const handleAddNewPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName || !newPlantPrice) {
      alert("Pls include plant name and pricing tag.");
      return;
    }

    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlantName,
          category: newPlantCategory,
          price: Number(newPlantPrice),
          discount: Number(newPlantDiscount) || 0,
          careInstructions: newPlantCare || "Grow nicely with plenty of medium watering.",
          stock: Number(newPlantStock) || 10,
          season: newPlantSeason,
          description: newPlantDesc || "Delightful PlantAdda verified botanic beauty.",
          imageUrls: newPlantImage ? [newPlantImage] : ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80"],
          vendorId: activeVendorSession?.id || "vend-1"
        })
      });

      if (res.ok) {
        alert("🌱 Brand item inserted cleanly under unified PlantAdda marketing!");
        setNewPlantName("");
        setNewPlantPrice("");
        setNewPlantDesc("");
        setNewPlantCare("");
        setNewPlantImage("");
        fetchPlants();
      } else {
        alert("Nursery error submitting item");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Inline stock adjustment API
  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      const res = await fetch(`/api/plants/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        fetchPlants();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Vendor dispatches order status in real time
  const handleModifyOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin approves vendor registry entry
  const handleApproveVendor = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/vendors/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchVendors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin approves return claim refund
  const handleResolveReturn = async (id: string, state: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/orders/${id}/return-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: state, adminNotes: "Approved under 24 hours foliage health policy." })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin changes delivery guidelines
  const handleSaveAdminConfig = async () => {
    try {
      const res = await fetch("/api/delivery-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeDeliveryThreshold: Number(adminFreeThreshold),
          standardDeliveryCharge: Number(adminDeliveryCharge),
          baseCommissionPercent: Number(adminCommissionRate)
        })
      });

      if (res.ok) {
        alert("⚙️ Delivery algorithms, commission rates, and threshold limits successfully deployed to PlantAdda system!");
        fetchDeliverySettings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin toggles plant approval activation
  const handleApprovePlant = async (plantId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/plants/${plantId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved })
      });
      if (res.ok) {
        alert(approved ? "🌱 Variety Approved! It is now live on the customer marketplace." : "Listing locked/disapproved and taken offline.");
        fetchPlants();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Vendor proposes their custom courier / delivery rate
  const handleProposeCourierFee = async (vendorId: string, feeStr: string) => {
    const feeVal = Number(feeStr);
    if (isNaN(feeVal) || feeVal < 0) {
      alert("Please state a valid positive postage rate.");
      return;
    }
    try {
      const res = await fetch(`/api/vendors/${vendorId}/propose-shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposedDeliveryCharge: feeVal })
      });
      if (res.ok) {
        alert("✔ Local courier & delivery charge proposed! Awaiting Admin verification.");
        fetchVendors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin resolves shipping proposal action
  const handleVendorShippingAction = async (vendorId: string, action: "approve" | "reject" | "override", overrideValue?: number) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/approve-shipping`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, overrideValue })
      });
      if (res.ok) {
        alert(`✔ Action '${action}' successfully synchronized on database!`);
        fetchVendors();
        fetchDeliverySettings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Vendor or Admin updates plant details (Manage & update plant product listings anytime)
  const handleUpdateFullPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlant) return;

    try {
      const res = await fetch(`/api/plants/${editingPlant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingPlant.name,
          category: editingPlant.category,
          price: Number(editingPlant.price),
          discount: Number(editingPlant.discount),
          careInstructions: editingPlant.careInstructions,
          stock: Number(editingPlant.stock),
          season: editingPlant.season,
          description: editingPlant.description,
          imageUrls: editingPlant.imageUrls,
          requestedByRole: currentUser.role // To trigger status reset if vendor
        })
      });

      if (res.ok) {
        alert(currentUser.role === "vendor" 
          ? "🌿 Listing updated successfully! As a premium vendor listing, it has been temporarily taken offline for Admin approval verify before going live."
          : "🌿 Listing updated & verified successfully by administrative override."
        );
        setEditingPlant(null);
        fetchPlants();
      } else {
        alert("Error saving plant details.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin overrides pricing parameters directly (bypass intermediate review cycles)
  const handleOverridePlantPricing = async (plantId: string, newPrice: number, newDiscount: number) => {
    try {
      const targetPlant = plants.find(p => p.id === plantId);
      if (!targetPlant) return;
      const res = await fetch(`/api/plants/${plantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetPlant,
          price: Number(newPrice),
          discount: Number(newDiscount),
          requestedByRole: "admin"
        })
      });
      if (res.ok) {
        alert("🛡️ Administrative oversight pricing applied and synchronized directly live!");
        fetchPlants();
      } else {
        alert("Error saving plant details.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate sum total of admin commission earnings
  const calculatedAdminCommission = orders
    .filter(o => o.paymentStatus === "paid")
    .reduce((acc, order) => {
      const commissionAmount = order.subtotal * (deliverySettings.baseCommissionPercent / 100);
      return acc + commissionAmount;
    }, 0);

  // Filter categories dynamically (merges enum Category contents with dynamic additions)
  const categoriesList = ["All", ...Array.from(new Set([...Object.values(Category), ...Object.keys(categoryCovers)]))];

  // Calculate average user star rating for any plant
  const getAverageRating = (plant: any) => {
    if (!plant) return 5;
    if (!plant.reviews || plant.reviews.length === 0) return 4.5;
    const total = plant.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    return total / plant.reviews.length;
  };

  // Live Three-Tone Green Theme Overrides style injector
  const getThemeStyleTag = () => {
    if (greenTheme === "parrot") {
      return (
        <style dangerouslySetInnerHTML={{ __html: `
          /* Main colors redefined for Lime/Parrot theme */
          .bg-emerald-950 { background-color: #000000 !important; }
          .bg-emerald-900 { background-color: #121214 !important; }
          .bg-emerald-800 { background-color: #1c1c1e !important; }
          .bg-emerald-700 { background-color: #00FF33 !important; }
          .bg-emerald-600 { background-color: #00FF33 !important; }
          .bg-emerald-500 { background-color: #00e62d !important; }
          .bg-emerald-100 { background-color: #ffffff !important; }
          .bg-emerald-50 { background-color: #fcfcfc !important; }
          
          .text-emerald-950 { color: #000000 !important; }
          .text-emerald-900 { color: #111111 !important; }
          .text-emerald-800 { color: #1e293b !important; }
          .text-emerald-700 { color: #047857 !important; }
          .text-emerald-600 { color: #059669 !important; }
          .text-emerald-500 { color: #00cc00 !important; }
          .text-emerald-300 { color: #00FF33 !important; }
          .text-emerald-250 { color: #ffffff !important; }
          .text-emerald-200 { color: #ffffff !important; }
          .text-emerald-100 { color: #ffffff !important; }
          
          .border-emerald-900 { border-color: #1e293b !important; }
          .border-emerald-800 { border-color: #334155 !important; }
          .border-emerald-600 { border-color: #00FF33 !important; }
          .border-emerald-100 { border-color: #f1f5f9 !important; }
          .border-emerald-200 { border-color: #00FF33 !important; }

          .hover\\:bg-emerald-950:hover { background-color: #000000 !important; }
          .hover\\:bg-emerald-900:hover { background-color: #121214 !important; }
          .hover\\:bg-emerald-800:hover { background-color: #1c1c1e !important; }
          .hover\\:bg-emerald-400:hover { background-color: #00FF33 !important; }
          .accent-emerald-700 { accent-color: #00FF33 !important; }
        ` }} />
      );
    }
    if (greenTheme === "dark") {
      return (
        <style dangerouslySetInnerHTML={{ __html: `
          /* High-Contrast Neon Green & Black/White Luxury Theme Overrides */
          .bg-emerald-950 { background-color: #000000 !important; } /* Pure Stark Black */
          .bg-emerald-900 { background-color: #0c0c0e !important; } /* Pitch Charcoal */
          .bg-emerald-800 { background-color: #121214 !important; } /* Dark Graphite text/backings */
          .bg-emerald-700 { background-color: #00FF00 !important; } /* Vibrant Pure Neon Green */
          .bg-emerald-600 { background-color: #00e600 !important; } /* Solid Active Saturated Green */
          .bg-emerald-500 { background-color: #00FF00 !important; } /* Vibrant Pulse Accent */
          .bg-emerald-100 { background-color: #ffffff !important; } /* Crisp Clean White Box */
          .bg-emerald-50 { background-color: #f8fafc !important; } /* Pure Soft Layout Slate */
          
          .text-emerald-950 { color: #000000 !important; } /* High Contrast True Black */
          .text-emerald-900 { color: #050507 !important; } /* Deep Obsidian */
          .text-emerald-800 { color: #111827 !important; } /* Stark Readable Charcoal */
          .text-emerald-700 { color: #008000 !important; } /* Solid Dark Emerald for extreme text contrast on light BG */
          .text-emerald-600 { color: #00991f !important; } /* Highly Visible Brand Green Font */
          .text-emerald-500 { color: #00cc00 !important; } 
          .text-emerald-300 { color: #00FF00 !important; } /* Electric Accent (on dark bg) */
          .text-emerald-250 { color: #ffffff !important; } /* True White contrast */
          .text-emerald-200 { color: #ffffff !important; } 
          .text-emerald-100 { color: #ffffff !important; } 
          
          .border-emerald-900 { border-color: #111827 !important; }
          .border-emerald-800 { border-color: #1f2937 !important; }
          .border-emerald-600 { border-color: #00FF00 !important; }
          .border-emerald-100 { border-color: #e5e7eb !important; }
          .border-emerald-200 { border-color: #00FF00 !important; }

          .hover\\:bg-emerald-950:hover { background-color: #000000 !important; }
          .hover\\:bg-emerald-900:hover { background-color: #0c0c0e !important; }
          .hover\\:bg-emerald-800:hover { background-color: #121214 !important; }
          .hover\\:bg-emerald-400:hover { background-color: #00FF00 !important; }
          .accent-emerald-700 { accent-color: #00FF00 !important; }
        ` }} />
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen selection:bg-emerald-200 transition-all duration-300 ${
      androidPreviewMode 
        ? "bg-slate-950 flex flex-col items-center justify-center py-6" 
        : "bg-[#f3f7f4] flex flex-col"
    }`}>
      {getThemeStyleTag()}

      {/* Floating System View Switcher (Simulated Android Phone vs Desktop Web layout) */}
      <div className="fixed bottom-4 left-4 z-[90] hidden md:flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-2xl shadow-2xl border border-zinc-800 text-[10px] font-bold leading-none select-none">
        <span className="text-[#00FF00] font-mono">📱 VIEW:</span>
        <button 
          onClick={() => setAndroidPreviewMode(true)}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-black ${androidPreviewMode ? 'bg-[#00FF00] text-black shadow-md' : 'hover:bg-white/10 text-white'}`}
        >
          Android App Mock
        </button>
        <button 
          onClick={() => setAndroidPreviewMode(false)}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-black ${!androidPreviewMode ? 'bg-[#00FF00] text-black shadow-md' : 'hover:bg-white/10 text-white'}`}
        >
          Full Desktop
        </button>
      </div>

      {/* Dynamic Device Frame Envelope Container */}
      <div className={`w-full flex-1 flex flex-col bg-[#f3f7f4] transition-all duration-300 relative ${
        androidPreviewMode 
          ? "md:max-w-[415px] md:h-[840px] md:rounded-[48px] md:shadow-2xl md:border-[12px] md:border-slate-900 md:overflow-y-auto md:overflow-x-hidden md:my-2 md:flex-none" 
          : "min-h-screen"
      }`}>

        {/* Mock Top Notches (active on desktop in simulated phone frame view) */}
        {androidPreviewMode && (
          <div className="hidden md:flex absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-[80] items-center justify-center p-0.5 pointer-events-none select-none">
            <div className="w-10 h-0.5 bg-slate-850 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-950 rounded-full ml-2 border border-slate-800"></div>
          </div>
        )}

        {/* Dynamic Material Design top status bar (Visible on true phone, or in desktop simulation frame mode) */}
        <div className={`bg-black text-white flex justify-between items-center text-[10.5px] font-bold font-mono tracking-wide px-6 select-none shrink-0 ${
          androidPreviewMode 
            ? "pt-6 pb-2.5 border-b border-white/5 md:pt-6 md:pb-2.5" 
            : "py-1.5 md:hidden" // hide on wide normal browser view, visible on true phones
        }`}>
          <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>📶</span>
            <span>🔋 98%</span>
          </div>
        </div>
      
      {/* Brand Unified Header banner - HIDES vendor identity from Customer */}
      <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0 select-none logo-animate">
              <svg viewBox="0 0 100 100" className="w-[62px] h-[62px] drop-shadow-[0_0_12px_rgba(0,255,51,0.65)] pointer-events-none">
                <defs>
                  <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00FF00" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3d2110" />
                    <stop offset="50%" stopColor="#7a4324" />
                    <stop offset="100%" stopColor="#3d2110" />
                  </linearGradient>
                  <linearGradient id="potGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#c2632b" />
                    <stop offset="100%" stopColor="#662200" />
                  </linearGradient>
                  <linearGradient id="leafNeon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00FF33" />
                    <stop offset="100%" stopColor="#006611" />
                  </linearGradient>
                  <filter id="neonFilter">
                    <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Soft Neon Backdrop Shadow circle */}
                <circle cx="50" cy="50" r="45" fill="url(#neonGlow)" />

                {/* Lush Neon Plant Leaves */}
                <path d="M 50 60 C 25 60 15 48 18 42 C 28 35 45 48 50 60 Z" fill="url(#leafNeon)" stroke="#002200" strokeWidth="0.75" />
                <path d="M 50 60 C 75 60 85 48 82 42 C 72 35 55 48 50 60 Z" fill="url(#leafNeon)" stroke="#002200" strokeWidth="0.75" />
                
                <path d="M 50 55 C 20 48 22 30 30 24 C 40 28 48 42 50 55 Z" fill="url(#leafNeon)" stroke="#002200" strokeWidth="0.75" />
                <path d="M 50 55 C 80 48 78 30 70 24 C 60 28 52 42 50 55 Z" fill="url(#leafNeon)" stroke="#002200" strokeWidth="0.75" />

                <path d="M 50 50 C 30 30 35 15 45 10 C 50 18 50 35 50 50 Z" fill="url(#leafNeon)" stroke="#002200" strokeWidth="0.75" />
                <path d="M 50 50 C 70 30 65 15 55 10 C 50 18 50 35 50 50 Z" fill="url(#leafNeon)" stroke="#002200" strokeWidth="0.75" />

                <path d="M 50 48 Q 40 25 50 2 Q 60 25 50 48 Z" fill="url(#leafNeon)" stroke="#002200" strokeWidth="0.75" filter="url(#neonFilter)" />

                {/* Delicate Blossoms (White and Yellow petals) */}
                {/* Left White Bloom */}
                <circle cx="28" cy="38" r="3.5" fill="#FFFFFF" />
                <circle cx="28" cy="38" r="1.2" fill="#FFCC00" />
                <g fill="#FFFFFF">
                  <circle cx="24.5" cy="38" r="1.8" />
                  <circle cx="31.5" cy="38" r="1.8" />
                  <circle cx="28" cy="34.5" r="1.8" />
                  <circle cx="28" cy="41.5" r="1.8" />
                </g>

                {/* Right White Bloom */}
                <circle cx="72" cy="38" r="3.5" fill="#FFFFFF" />
                <circle cx="72" cy="38" r="1.2" fill="#FFCC00" />
                <g fill="#FFFFFF">
                  <circle cx="68.5" cy="38" r="1.8" />
                  <circle cx="75.5" cy="38" r="1.8" />
                  <circle cx="72" cy="34.5" r="1.8" />
                  <circle cx="72" cy="41.5" r="1.8" />
                </g>

                {/* Left Yellow Bloom */}
                <circle cx="38" cy="22" r="3" fill="#FFD700" />
                <g fill="#FFD700">
                  <circle cx="35" cy="22" r="1.5" />
                  <circle cx="41" cy="22" r="1.5" />
                  <circle cx="38" cy="19" r="1.5" />
                  <circle cx="38" cy="25" r="1.5" />
                </g>

                {/* Right Yellow Bloom */}
                <circle cx="62" cy="22" r="3" fill="#FFD700" />
                <g fill="#FFD700">
                  <circle cx="59" cy="22" r="1.5" />
                  <circle cx="65" cy="22" r="1.5" />
                  <circle cx="62" cy="19" r="1.5" />
                  <circle cx="62" cy="25" r="1.5" />
                </g>

                {/* Central Locator Pin (glowing) */}
                <g filter="url(#neonFilter)">
                  <path d="M 50 56 C 41 45 37 41 37 34 C 37 26.5 42.8 20.7 50 20.7 C 57.2 20.7 63 26.5 63 34 C 63 41 59 45 50 56 Z" fill="#00FF33" stroke="#001804" strokeWidth="1.2" />
                  <circle cx="50" cy="33.5" r="5.5" fill="#040b02" stroke="#00FF33" strokeWidth="0.75" />
                </g>

                {/* Stem */}
                <path d="M 48 55 L 52 55 L 53 72 L 47 72 Z" fill="url(#trunkGrad)" stroke="#1a0c02" strokeWidth="0.75" />

                {/* Pot */}
                <path d="M 36 68 L 64 68 A 2 2 0 0 1 66 70 L 66 75 A 2 2 0 0 1 64 77 L 36 77 A 2 2 0 0 1 34 75 L 34 70 A 2 2 0 0 1 36 68 Z" fill="#5A2E12" stroke="#231005" strokeWidth="1" />
                <path d="M 37 76 L 63 76 L 59 95 C 59 96.5 57.5 98 56 98 L 44 98 C 42.5 98 41 96.5 41 95 Z" fill="url(#potGrad)" stroke="#231005" strokeWidth="1" />
                <ellipse cx="50" cy="70" rx="14" ry="1.5" fill="#1C1005" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-tight flex items-center flex-wrap gap-2">
                <span className="text-high-class-animation text-2xl font-black">PlantAdda</span>
                <span className="text-[11px] bg-black text-[#00FF00] border border-[#00FF00]/40 font-extrabold font-mono px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Nursery Marketplace
                </span>
              </h1>
              <p className="text-[10px] text-zinc-100 font-semibold tracking-wide">Verified 24hr Return Guarantee &bull; Direct Brand Fulfilled</p>
            </div>
          </div>

          {/* Quick Mock Role Switcher for previewer flow sandbox testing */}
          <div className="bg-emerald-950 px-3 py-1.5 rounded-2xl flex flex-wrap items-center gap-2 border border-emerald-800 text-[11px]">
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Simulation Sandbox:
            </span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => {
                  setCurrentTab("marketplace");
                  setCurrentUser({ email: "customer@gmail.com", name: "Suresh Gupta", role: "customer" });
                  fetchPlants("customer");
                }} 
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentUser.role === "customer" 
                    ? "bg-emerald-700 text-white shadow-sm" 
                    : "text-emerald-300 hover:bg-emerald-900"
                }`}
              >
                Customer Portal 🛒
              </button>
              <button 
                onClick={() => {
                  setCurrentTab("vendor");
                  setCurrentUser({ email: "vendor@greenwood.com", name: "Rajesh Kumar", role: "vendor" });
                  fetchPlants("vendor");
                }} 
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentUser.role === "vendor" 
                    ? "bg-emerald-700 text-white shadow-sm" 
                    : "text-emerald-300 hover:bg-emerald-900"
                }`}
              >
                Vendor Hub 🏪
              </button>
              <button 
                onClick={() => {
                  setCurrentTab("admin");
                  setCurrentUser({ email: "ceo@plantadda.com", name: "PlantAdda CEO", role: "admin" });
                  fetchPlants("admin");
                }} 
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentUser.role === "admin" 
                    ? "bg-emerald-700 text-white shadow-sm" 
                    : "text-emerald-300 hover:bg-emerald-900"
                }`}
              >
                Admin Panel 👤
              </button>
            </div>

            <div className="h-4 w-[1px] bg-emerald-800 hidden md:block"></div>

            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-mono">Theme:</span>
              <div className="flex bg-emerald-900/50 p-0.5 rounded-lg border border-emerald-800/80">
                <button 
                  onClick={() => setGreenTheme("parrot")} 
                  className={`px-2 py-0.5 rounded text-[10px] transition-all ${greenTheme === "parrot" ? "bg-emerald-600 text-white font-bold" : "text-emerald-300 hover:text-white"}`}
                >
                  🌱 Parrot
                </button>
                <button 
                  onClick={() => setGreenTheme("bottle")} 
                  className={`px-2 py-0.5 rounded text-[10px] transition-all ${greenTheme === "bottle" ? "bg-emerald-600 text-white" : "text-emerald-300 hover:text-white"}`}
                >
                  🌿 Bottle
                </button>
                <button 
                  onClick={() => setGreenTheme("dark")} 
                  className={`px-2 py-0.5 rounded text-[10px] transition-all ${greenTheme === "dark" ? "bg-emerald-600 text-white" : "text-emerald-300 hover:text-white"}`}
                >
                  🌳 Dark
                </button>
              </div>
            </div>
          </div>

          {/* User state and Cart/Wishlist summary */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            {/* High Class Language Selector with neon design */}
            <div className="flex items-center gap-1 bg-black border border-[#00FF00]/20 rounded-xl p-1 shrink-0 select-none shadow">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                  language === "en"
                    ? "bg-[#00FF00] text-black shadow-md"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                  language === "hi"
                    ? "bg-[#00FF00] text-black shadow-md"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
            </div>

            <span className="text-emerald-100 flex items-center gap-1.5 bg-emerald-800/60 px-3 py-1 rounded-full">
              <User className="w-4 h-4 text-emerald-400" />
              {currentUser.name}
            </span>
            
            {currentUser.role === "customer" && (
              <button
                onClick={() => setCartOpen(true)}
                id="cart-trigger-button"
                className="bg-[#00FF00] hover:bg-[#00e62d] text-slate-900 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all relative"
              >
                <ShoppingBag className="w-4 h-4" />
                {t("Cart", "कार्ट")} ({cart.reduce((ac, x) => ac + x.quantity, 0)})
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold w-4 h-4 rounded-full text-[9px] flex items-center justify-center animate-bounce">
                    !
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 10-Minute Blinkit-style Delivery Timing Localization Bar */}
        {currentUser.role === "customer" && (
          <div className="bg-amber-400 text-slate-900 font-sans font-bold text-xs py-2 px-4 shadow-inner flex items-center justify-between border-t border-emerald-850 select-none">
            <div className="flex items-center gap-2">
              <span className="bg-slate-950 text-[#00FF00] font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 animate-pulse">
                ⚡ 10 MINS
              </span>
              <div className="min-w-0">
                <span className="text-[11px] font-black text-slate-950 flex items-center gap-1">
                  Delivering to Balcony Garden, Sector 56, Gurugram <MapPin className="w-3 h-3 text-slate-950" />
                </span>
              </div>
            </div>
            <span className="text-[9.5px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded font-mono font-bold hidden sm:inline">
              Superfast Delivery Active 🛵
            </span>
          </div>
        )}
      </header>

      {/* Tabs Menu Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex gap-2 overflow-x-auto">
          <button 
            onClick={() => setCurrentTab("marketplace")} 
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              currentTab === "marketplace" 
                ? "bg-emerald-800 text-white shadow-sm" 
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            🌱 {t("Plant Marketplace", "पौधा बाज़ार")}
          </button>
          
          <button 
            onClick={() => setCurrentTab("sub")} 
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              currentTab === "sub" 
                ? "bg-emerald-800 text-white shadow-sm" 
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            🏡 {t("AMC Garden Care", "बगीचा रखरखाव (AMC)")}
          </button>

          <button 
            onClick={() => setCurrentTab("ai")} 
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              currentTab === "ai" 
                ? "bg-emerald-800 text-white shadow-sm" 
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            🌤️ {t("Botanical AI Scanner", "वनस्पति AI स्कैनर")}
          </button>

          {currentUser.role === "vendor" && (
            <button 
              onClick={() => setCurrentTab("vendor")} 
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
                currentTab === "vendor" 
                  ? "bg-emerald-800 text-white shadow-sm" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              🏪 {t("Vendor Hub", "विक्रेता केंद्र")}
            </button>
          )}

          {currentUser.role === "admin" && (
            <button 
              onClick={() => setCurrentTab("admin")} 
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
                currentTab === "admin" 
                  ? "bg-emerald-800 text-white shadow-sm" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              👤 {t("Admin Hub", "एडमिन हब")}
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        
        {/* TAB 1: PLANT MARKETPLACE */}
        {currentTab === "marketplace" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Dynamic Promotional Banner or Breaking News Image (Admin-Controlled) */}
            {promoBanner && promoBanner.isActive && (
              <div className="relative rounded-3xl overflow-hidden bg-[#0c0c0e] text-white shadow-md border border-[#00FF00]/10">
                <div className="flex flex-col md:flex-row min-h-[220px]">
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center space-y-3.5 z-10 bg-gradient-to-r from-[#0c0c0e] via-[#0c0c0e]/95 to-transparent">
                    <span className="inline-flex items-center gap-1.5 w-max bg-[#00FF00] text-black text-[9.5px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full font-mono">
                      📢 Live Promotional Offer & Alert
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold font-display leading-tight text-white">
                      {promoBanner.title}
                    </h2>
                    {promoBanner.newsText && (
                      <p className="text-zinc-300 text-xs leading-relaxed max-w-lg">
                        {promoBanner.newsText}
                      </p>
                    )}
                    <div className="flex gap-4 pt-1 text-[11px] text-[#00FF00] font-mono">
                      <span className="font-extrabold">⚡ Brand Direct Delivery</span>
                      <span>•</span>
                      <span className="font-extrabold">🛡️ replace within 24h</span>
                    </div>
                  </div>
                  {/* Banner Image */}
                  <div className="md:w-2/5 h-44 md:h-auto overflow-hidden relative shrink-0">
                    <img 
                      src={promoBanner.imageUrl} 
                      alt="Promotional Offer"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-transparent to-transparent md:block hidden"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent md:hidden block"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Live Tracking Area if tracking id exists */}
            {orders.length > 0 && orders.some(o => o.customerEmail === currentUser.email) && (
              <div className="bg-emerald-55/40 border border-emerald-100 rounded-2xl p-5 bg-white shadow-inner flex flex-col md:flex-row items-center gap-4 justify-between">
                <div>
                  <h4 className="text-xs uppercase font-bold text-emerald-800 flex items-center gap-1.5 tracking-wider">
                    <Activity className="w-3.5 h-3.5" /> Order Fulfillment Registry
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">Check real-time coordinate logs of local delivery updates and return options.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {orders.filter(o => o.customerEmail === currentUser.email).slice(-2).map((order) => (
                    <div key={order.id} className="bg-white border border-emerald-100 p-3 rounded-xl text-xs flex flex-col justify-between shadow-sm min-w-[200px]">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-emerald-800">{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "cancelled" ? "bg-rose-100 text-rose-700" :
                          "bg-amber-100 text-amber-700 animate-pulse"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1 font-semibold">Total: ₹{order.total}</p>
                      
                      {/* Active tracking actions */}
                      <div className="mt-3 flex gap-1.5">
                        <button
                          onClick={() => setTrackingOrderId(order.id)}
                          className="w-full text-center bg-emerald-800 text-white rounded-lg py-1 hover:bg-emerald-900 transition-colors text-[10px]"
                        >
                          Track Delivery Map
                        </button>
                        {order.status === "delivered" && !order.returnRequest && (
                          <button
                            onClick={() => handleInitiateReturn(order)}
                            className="w-full text-center bg-rose-50 text-rose-700 border border-rose-200 rounded-lg py-1 hover:bg-rose-100 transition-colors text-[10px] font-bold"
                          >
                            24h Refund Portal
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Marketplace Filter + Catalog Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Product Filtering parameters */}
              <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <Filter className="w-5 h-5 text-emerald-600" /> {t("Search & Filter", "खोजें और छानें")}
                  </h3>
                </div>

                {/* Sub Search */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 block">{t("Keyword Search", "नाम से खोजें")}</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("Lemon tree, tomato seed...", "नींबू का पौधा, टमाटर के बीज...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-200"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 block">{t("Botanical Category", "पौधों की श्रेणी")}</label>
                  <div className="flex flex-col gap-1">
                    {categoriesList.map((cat) => {
                      let catHindi = cat;
                      if (cat === "Fruit Plants") catHindi = "फल वाले पौधे";
                      if (cat === "Flower Plants") catHindi = "फूल वाले पौधे";
                      if (cat === "Trees") catHindi = "वृक्ष व बोनसाई";
                      if (cat === "Indoor Plants") catHindi = "इंडोर पौधे";
                      if (cat === "Seeds") catHindi = "बीज (Seeds)";
                      if (cat === "Compost & Fertilizers") catHindi = "खाद व उर्वरक";
                      if (cat === "Gardening Tools") catHindi = "गार्डनिंग टूल्स";
                      if (cat === "Pots & Planters") catHindi = "गमले और स्टैंड";
                      if (cat === "All") catHindi = "सभी श्रेणियां";

                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                            selectedCategory === cat 
                              ? "bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600" 
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {t(cat, catHindi)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Season suitability */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 block">{t("Growth Season", "मौसम अनुकूलता")}</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All">{t("All Seasons", "सभी मौसम")}</option>
                    <option value="Summer">{t("Summer ☀️", "गर्मी ☀️")}</option>
                    <option value="Winter">{t("Winter ❄️", "सर्दी ❄️")}</option>
                    <option value="All Season">{t("Year Round 🌿", "सदाबहार 🌿")}</option>
                  </select>
                </div>

                {/* Price range budget */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>{t("Max Budget", "अधिकतम बजट")}</span>
                    <span className="text-emerald-700">₹{priceRange}</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="1500"
                    step="20"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>₹40</span>
                    <span>₹1500</span>
                  </div>
                </div>

                <div className="pt-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" /> {t("Promotion Rule:", "विशेष योजना:")}
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    {t(
                      `Automatic free delivery if purchase total exceeds ₹${deliverySettings.freeDeliveryThreshold}. Otherwise, standard shipping applies: ₹${deliverySettings.standardDeliveryCharge}.`,
                      `₹${deliverySettings.freeDeliveryThreshold} से अधिक की खरीद पर मुफ्त डिलीवरी। कम होने पर ₹${deliverySettings.standardDeliveryCharge} का मानक डिलीवरी शुल्क लागू होगा।`
                    )}
                  </p>
                </div>

              </div>

              {/* Plant Grid - HIDES INDIVIDUAL VENDOR IDENTITY - BRANDED UNDER PLANTADDA */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Customer Section: Category Quick-Browse with dynamic default images */}
                <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <span>🌸 {t("Interactive Category Gallery", "श्रेणी गैलरी और डिफ़ॉल्ट चित्र")}</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {t("Filter plants immediately by category", "श्रेणी के अनुसार तुरंत पौधे देखें")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categoriesList.filter(c => c !== "All").map((cat) => {
                      const defaultImg = categoryCovers[cat] || "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80";
                      const isSelected = selectedCategory === cat;
                      const count = plants.filter(p => p.category === cat).length;
                      
                      return (
                        <div 
                          key={cat}
                          onClick={() => setSelectedCategory(isSelected ? "All" : cat)}
                          className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all relative h-28 flex flex-col justify-end p-3 ${
                            isSelected 
                              ? "border-emerald-600 ring-2 ring-emerald-200/50 shadow-md scale-[1.02]" 
                              : "border-slate-250 hover:border-emerald-500 shadow-xs hover:shadow-md hover:scale-[1.01]"
                          }`}
                        >
                          <img 
                            src={defaultImg} 
                            alt={cat} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
                          
                          <div className="relative text-white z-10 space-y-0.5">
                            <p className="font-display font-extrabold text-[11px] leading-tight text-white drop-shadow-md">
                              {cat}
                            </p>
                            <p className="text-[9px] text-[#00FF00] font-mono font-bold drop-shadow-md">
                              {count} {t("items", "पौधे")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 font-semibold">
                    Showing <span className="text-emerald-800 font-bold">{filteredPlants.length}</span> botanic items
                  </p>
                  
                  {/* Sorting metric marker */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Active Standard Branding layer: <span className="text-emerald-700 font-mono font-bold">PlantAdda Premium</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredPlants.map((plant) => {
                    const discountedPrice = Math.round(plant.price * (1 - plant.discount / 100));
                    return (
                      <div 
                        key={plant.id} 
                        id={`plant-card-${plant.id}`}
                        className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative"
                      >
                        {/* Discount Badge */}
                        {plant.discount > 0 && (
                          <span className="absolute left-3 top-3 z-10 bg-emerald-500 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-sm">
                            {plant.discount}% OFF
                          </span>
                        )}

                        {/* Favorite button */}
                        <button
                          onClick={() => toggleWishlist(plant.id)}
                          className="absolute right-3 top-3 z-10 bg-white/80 hover:bg-white text-slate-500 hover:text-rose-500 p-2 rounded-full transition-all shadow-sm"
                        >
                          <Heart 
                            className={`w-4 h-4 transition-transform active:scale-125 ${
                              wishlist.includes(plant.id) ? "fill-rose-500 text-rose-500" : ""
                            }`} 
                          />
                        </button>

                        {/* Clickable Image area for big screen photo popup */}
                        <div 
                          onClick={() => setZoomedPlantPhoto(plant)}
                          className="h-44 overflow-hidden relative bg-slate-100 cursor-zoom-in group"
                          title="Click to view large photo beautifully on the big screen"
                        >
                          <img 
                            src={(plant.imageUrls && plant.imageUrls[0]) ? plant.imageUrls[0] : (categoryCovers[plant.category] || "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80")} 
                            alt={plant.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1 shadow-md">
                              🔍 Large Photo Popup
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] text-white font-mono">
                            {plant.season}
                          </div>
                        </div>

                        {/* Plant Details */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                              Category: {plant.category}
                            </span>
                            <h4 className="font-display font-semibold text-slate-900 mt-2 text-base line-clamp-1">
                              {plant.name}
                            </h4>
                            {/* Star Rating Indicator */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => {
                                  const ratingVal = getAverageRating(plant);
                                  return (
                                    <Star 
                                      key={i} 
                                      className={`w-3 h-3 ${
                                        i < Math.round(ratingVal) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                      }`} 
                                    />
                                  );
                                })}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 font-mono">
                                {getAverageRating(plant).toFixed(1)} ({plant.reviews?.length || 0})
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs line-clamp-2 mt-1">
                              {plant.description}
                            </p>
                          </div>

                          {/* Pricing details and unified brand assurance */}
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-slate-900">₹{discountedPrice}</span>
                              {plant.discount > 0 && (
                                <span className="text-xs text-slate-450 line-through">₹{plant.price}</span>
                              )}
                            </div>

                            <p className="text-[10px] text-emerald-600 font-mono mt-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Fulfillable via PlantAdda Local Network
                            </p>
                          </div>
                        </div>

                        {/* Actions card footer */}
                        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex gap-2 items-center">
                          <button
                            onClick={() => setSelectedPlant(plant)}
                            className="flex-1 text-center bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                          >
                            Care Instructions
                          </button>
                          
                          {cart.find(c => c.plantId === plant.id) ? (
                            <div className="flex-1 flex items-center justify-between bg-emerald-800 text-white rounded-xl overflow-hidden text-xs font-extrabold shadow-sm border border-emerald-700 h-[38px] select-none">
                              <button
                                onClick={() => updateCartQuantity(plant.id, -1)}
                                className="px-3 hover:bg-emerald-900 transition-colors h-full flex items-center justify-center font-black text-sm active:scale-90 flex-1 cursor-pointer"
                                title="Subtract item"
                              >
                                −
                              </button>
                              <span className="font-sans text-xs text-white px-1 select-none font-bold">
                                {cart.find(c => c.plantId === plant.id)?.quantity}
                              </span>
                              <button
                                onClick={() => handleAddToCart(plant, false)}
                                className="px-3 hover:bg-emerald-900 transition-colors h-full flex items-center justify-center font-black text-sm active:scale-90 flex-1 cursor-pointer"
                                title="Add item"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(plant, false)}
                              disabled={plant.stock === 0}
                              className={`flex-1 transition-all py-2.5 rounded-xl text-xs font-extrabold text-center flex items-center justify-center gap-1 cursor-pointer border ${
                                plant.stock === 0 
                                  ? "bg-slate-105 text-slate-400 border-slate-200 cursor-not-allowed"
                                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-300 shadow-xs"
                              }`}
                            >
                              {plant.stock === 0 ? "Out of Stock" : "ADD ＋"}
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

                {filteredPlants.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-bounce" />
                    <h3 className="font-display font-bold text-lg text-slate-800">No Plants Fit Your Parameters</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                      Try expanding your max budget metric, clearing keywords, or switching categories list tab selections above.
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: AMC GARDEN CARE SUBSCRIPTION */}
        {currentTab === "sub" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                🌿 Premium Garden Care Services
              </span>
              <h2 className="text-3xl font-bold font-display text-slate-900">AMC Garden Care Subscriptions</h2>
              <p className="text-slate-500 text-xs">
                Keep your home balcony or front garden thriving. Subscribe to a periodic AMC care plan. Our verified local botanists visit regularly to sanitize and nourish your organic greens.
              </p>
            </div>

            {amcSubscribedMessage && (
              <div className="bg-emerald-800 text-white p-5 rounded-2xl flex items-start gap-3 shadow-md">
                <CheckCircle className="w-5 h-5 text-emerald-300 mt-1 shrink-0" />
                <p className="text-sm font-semibold">{amcSubscribedMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Build Custom Care Package */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6">
                <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  <Hammer className="w-5 h-5 text-emerald-600" /> 1. Customize Your Service Items
                </h3>

                <div className="space-y-3">
                  {[
                    "Weekly plant watering",
                    "Fertilizer service",
                    "Pest control",
                    "Garden maintenance",
                    "Soil aerating & repotting",
                    "Dead wood pruning"
                  ].map((service) => {
                    const isSelected = amcServicesSelected.includes(service);
                    return (
                      <button
                        key={service}
                        onClick={() => {
                          setAmcServicesSelected(prev => 
                            prev.includes(service) 
                              ? prev.filter(x => x !== service)
                              : [...prev, service]
                          );
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex justify-between items-center ${
                          isSelected 
                            ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold" 
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-650"
                        }`}
                      >
                        <span>{service}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "bg-emerald-800 border-emerald-800 text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 block mb-2">2. Billing Cycle Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["monthly", "quarterly", "yearly"] as const).map((cycle) => (
                      <button
                        key={cycle}
                        onClick={() => setAmcPlanType(cycle)}
                        className={`py-2 text-xs rounded-xl border text-center font-bold capitalize transition-all ${
                          amcPlanType === cycle 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* pricing calculator and Checkout subscription summary */}
              <div className="bg-emerald-950 text-white p-6 rounded-3xl space-y-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                  <Sprout className="w-48 h-48 transform translate-x-10 -translate-y-10" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-emerald-400">Subscription Summary</h3>
                  <p className="text-emerald-200/80 text-xs mt-1">Unified PlantAdda Care Contract</p>
                </div>

                <div className="space-y-3.5">
                  <div className="bg-emerald-900/40 p-4 rounded-xl border border-emerald-800">
                    <p className="text-xs text-emerald-200">Selected services: <span className="text-emerald-400 font-bold">({amcServicesSelected.length})</span></p>
                    <ul className="mt-2 space-y-1 text-[11px] text-emerald-300 list-disc list-inside">
                      {amcServicesSelected.map(s => <li key={s}>{s}</li>)}
                      {amcServicesSelected.length === 0 && <li className="list-none text-rose-300 italic">No services selected yet. Select items from list panel first!</li>}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-emerald-800">
                    <span className="text-xs text-emerald-200">Frequency Rate Plan</span>
                    <span className="text-xs font-mono uppercase bg-emerald-800 text-emerald-350 px-2.5 py-0.5 rounded-full font-bold">
                      {amcPlanType}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline py-2">
                    <span className="text-sm font-semibold">Total Price Projection</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-300">₹{amcCachedPrice}</p>
                      <p className="text-[10px] text-emerald-300/80">billed flat rate</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-900/50 p-4 rounded-xl text-[11px] text-emerald-200 leading-relaxed border border-emerald-800">
                  ⚠️ **Standard Service Rules**: Visits are pre-scheduled. Certified team carrying PlantAdda identification badge arrives prepared with soil kits, compost bags and insecticide sprays.
                </div>

                <button
                  onClick={handleSubscribeAMC}
                  disabled={amcServicesSelected.length === 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm py-3 rounded-xl transition-all shadow-md disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Confirm Subscription Onboarding via UPI
                </button>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: AI GARDEN PORTAL */}
        {currentTab === "ai" && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-700 bg-emerald-55 px-3 py-1 rounded-full inline-block">
                🌤️ Advanced Botanic Services
              </span>
              <h2 className="text-3xl font-bold font-display text-slate-950">AI Botanical Care & Diagnostic Suite</h2>
              <p className="text-xs text-slate-500">
                Identify plant species, diagnose yellow spots or foliage disease, and chat directly with our expert botanical assistant system.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Botanical Photo Scanner */}
              <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-display font-semibold text-slate-950 flex items-center gap-1.5 text-base">
                    <Camera className="w-5 h-5 text-emerald-600 animate-pulse" /> 100% Photographic Health Scanner
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">
                    Powered by Gemini 3.5
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload an image of your houseplant or garden crop to dissect vital statistics, receive structural care instructions, or identify soil compaction disease.
                </p>

                {/* File Uploader or Demo presets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Uploader Box layout */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 transition-colors rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 relative min-h-[160px]">
                    <div className="space-y-2">
                      <Camera className="w-8 h-8 text-emerald-600 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Upload Garden Photo</p>
                        <p className="text-[10px] text-slate-550 mt-0.5">Drag drop or browse files</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomScanFile}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* fast preset test triggers */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fast Simulation Presets:</p>
                    <div className="space-y-1.5">
                      {SCAN_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => handleScanSample(preset)}
                          className="w-full text-left p-2 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-2"
                        >
                          <img src={preset.url} className="w-8 h-8 object-cover rounded-md" />
                          <span className="font-medium text-slate-700">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Preview panel */}
                {scannedImagePreview && (
                  <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150 relative">
                    <button 
                      onClick={() => { setScannedImagePreview(""); setScanResult(""); }}
                      className="absolute top-2 right-2 bg-slate-900 text-white rounded-full p-1 hover:bg-slate-800 transition-colors"
                      title="Clear Demo image"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    <div className="w-full md:w-1/3 shrink-0 rounded-xl overflow-hidden shadow-sm aspect-square bg-white">
                      <img src={scannedImagePreview} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-[11px] uppercase font-bold text-slate-400">Diagnosis Output</p>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
                          {scanLoading ? "Analyzing..." : "Review Done"}
                        </span>
                      </div>

                      {scanLoading ? (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <Sprout className="w-4 h-4 animate-spin text-emerald-700" />
                          <span>Gemini is reading botanical properties...</span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-700 leading-relaxed max-h-[180px] overflow-y-auto font-sans prose prose-sm whitespace-pre-wrap">
                          {scanResult ? scanResult : "Select a preset or upload your camera proof to display live diagnostics."}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Chat Helper Assist Widget */}
              <div>
                <GardenHelper />
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: VENDOR CABINET */}
        {currentTab === "vendor" && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-2xl font-bold font-display text-slate-950">Local Nursery Registry Workbench</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage local inventory levels under the cohesive PlantAdda brand layer.</p>
                </div>

                <div className="bg-emerald-50 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-xs">
                    <p className="text-slate-500">Connected Station Partner:</p>
                    <p className="font-bold text-emerald-800 text-sm">
                      {activeVendorSession ? activeVendorSession.nurseryName : "Anonymous Registree"}
                    </p>
                  </div>
                </div>
              </div>

              {!activeVendorSession || activeVendorSession.status === "pending" ? (
                <div className="py-6 space-y-6">
                  {/* Status Indicator banner */}
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Nursery Status Flag: PENDING APPROVAL</p>
                      <p className="mt-1 leading-relaxed">
                        To maintain uniform high quality across PlantAdda, our administrators manually verify business compliance, nursery licenses, and initial stock health. Standard commission fee is set to: **{deliverySettings.baseCommissionPercent}%** of total sales amount.
                      </p>
                    </div>
                  </div>

                  {/* Register application form */}
                  <form onSubmit={handleRegisterVendor} className="border border-slate-100 bg-slate-50/50 p-6 rounded-2xl space-y-4">
                    <h3 className="font-display font-semibold text-slate-900 text-sm">New Local Vendor Registration Form</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Contact Officer Name</label>
                        <input
                          type="text"
                          required
                          value={vendorRegName}
                          onChange={(e) => setVendorRegName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Nursery Store Brand Name</label>
                        <input
                          type="text"
                          required
                          value={vendorRegNursery}
                          onChange={(e) => setVendorRegNursery(e.target.value)}
                          placeholder="e.g. Greenwood Valley Nursery"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Business Email Contact</label>
                        <input
                          type="email"
                          required
                          value={vendorRegEmail}
                          onChange={(e) => setVendorRegEmail(e.target.value)}
                          placeholder="e.g. ramesh@greenwood.com"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Business Phone Number</label>
                        <input
                          type="text"
                          required
                          value={vendorRegPhone}
                          onChange={(e) => setVendorRegPhone(e.target.value)}
                          placeholder="e.g. +91 99888 77665"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">Nursery Location Address</label>
                        <input
                          type="text"
                          required
                          value={vendorRegAddress}
                          onChange={(e) => setVendorRegAddress(e.target.value)}
                          placeholder="e.g. Sector 14, Gurugram, India"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl hover:bg-emerald-950 transition-all shadow-sm"
                    >
                      Submit Registration Entry for Verification
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mt-6 space-y-8">
                  {/* Order assignment panel for vendor */}
                  <div>
                    <h3 className="font-display font-semibold text-slate-900 border-l-4 border-emerald-600 pl-2 text-base">
                      Assigned Orders for Fulfillment
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {orders
                        .filter(o => o.assignedVendorId === activeVendorSession.id)
                        .map((order) => (
                          <div key={order.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 shadow-sm">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-emerald-800 font-mono">ID: {order.id}</span>
                              <span className="text-slate-500 font-mono text-[10px]">{order.orderDate.split("T")[0]}</span>
                            </div>

                            <div className="text-xs space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                              <p className="font-semibold text-slate-800">Dispatch Location:</p>
                              <p className="text-slate-500">{order.customerAddress}</p>
                            </div>

                            {/* Ordered Items details */}
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs text-slate-650">
                                  <span>&bull; {item.name} <span className="font-bold text-slate-900">x{item.quantity}</span></span>
                                  <span>₹{item.price - (item.price * item.discount) / 100}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200">
                              <span className="text-slate-500 font-semibold">Total Order Fee: <span className="text-slate-900">₹{order.total}</span></span>
                              <span className="text-xs uppercase bg-emerald-800 text-white px-2 py-0.5 rounded-full font-mono">{order.status}</span>
                            </div>

                            {/* Order Lifecycle Progress Button */}
                            <div className="flex gap-2 pt-1">
                              {order.status === "pending" && (
                                <button
                                  onClick={() => handleModifyOrderStatus(order.id, "packed")}
                                  className="w-full bg-slate-900 hover:bg-black text-white rounded-lg py-1.5 text-xs font-bold font-mono transition-colors"
                                >
                                  ✔ Pack Box under PlantAdda layer
                                </button>
                              )}
                              
                              {order.status === "packed" && (
                                <button
                                  onClick={() => handleModifyOrderStatus(order.id, "dispatched")}
                                  className="w-full bg-emerald-800 hover:bg-emerald-950 text-white rounded-lg py-1.5 text-xs font-bold font-mono transition-colors"
                                >
                                  🚚 Dispatch Locally
                                </button>
                              )}

                              {order.status === "dispatched" && (
                                <button
                                  onClick={() => handleModifyOrderStatus(order.id, "delivered")}
                                  className="w-full bg-[#15803d] hover:bg-[#166534] text-white rounded-lg py-1.5 text-xs font-bold font-mono transition-colors mr-2 inline-block text-center"
                                >
                                  Complete Delivery
                                </button>
                              )}

                              <p className="text-[10px] text-slate-400 italic">
                                *Note: Customers only watch the unified shipping sequence. Your nursery identity remains hidden behind PlantAdda guarantee.
                              </p>
                            </div>

                          </div>
                        ))}

                      {orders.filter(o => o.assignedVendorId === activeVendorSession.id).length === 0 && (
                        <p className="text-xs text-slate-400 italic py-4">No order dispatches routed. Waiting for system orders...</p>
                      )}
                    </div>
                  </div>

                  {/* Add stock batch interface */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Add Item form */}
                    <div className="lg:col-span-1 bg-slate-50/50 p-5 rounded-2xl border border-slate-150 space-y-4">
                      <h4 className="font-display font-semibold text-slate-950 text-sm pb-2 border-b border-slate-200">
                        Add New Batch Plant
                      </h4>
                      
                      <form onSubmit={handleAddNewPlant} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Plant Variety / Crop Name</label>
                          <input
                            type="text"
                            required
                            value={newPlantName}
                            onChange={(e) => setNewPlantName(e.target.value)}
                            placeholder="e.g. Dwarf Meyer Lemon Tree"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Category Bucket</label>
                          <select
                            value={newPlantCategory}
                            onChange={(e) => setNewPlantCategory(e.target.value as Category)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          >
                            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Best Price (₹)</label>
                            <input
                              type="number"
                              required
                              value={newPlantPrice}
                              onChange={(e) => setNewPlantPrice(e.target.value)}
                              placeholder="349"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none animate-pulse-once"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Promo Discount %</label>
                            <input
                              type="number"
                              value={newPlantDiscount}
                              onChange={(e) => setNewPlantDiscount(e.target.value)}
                              placeholder="15"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Growth Season</label>
                            <input
                              type="text"
                              value={newPlantSeason}
                              onChange={(e) => setNewPlantSeason(e.target.value)}
                              placeholder="All Season"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Stock Quantity</label>
                            <input
                              type="number"
                              value={newPlantStock}
                              onChange={(e) => setNewPlantStock(e.target.value)}
                              placeholder="25"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Plant Image Url</label>
                          <input
                            type="text"
                            value={newPlantImage}
                            onChange={(e) => setNewPlantImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-[11px] font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Short Botanical Description</label>
                          <textarea
                            value={newPlantDesc}
                            onChange={(e) => setNewPlantDesc(e.target.value)}
                            placeholder="Foliage features and growth description."
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none h-16 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-emerald-950 transition-all shadow-sm"
                        >
                          ✔ Insert as PlantAdda Assured Variety
                        </button>
                      </form>
                    </div>

                    {/* Stock level management ledger */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-semibold text-slate-950 text-sm">
                          Total Uploads & Stock Ledger
                        </h4>
                        {googleAccessToken ? (
                          <button
                            onClick={() => handleExportSingleSection("plants")}
                            className="bg-emerald-50 text-emerald-850 px-3 py-1.5 rounded-xl text-[10.5px] font-bold border border-emerald-100 transition-colors flex items-center hover:bg-emerald-100 gap-1 shadow-sm"
                          >
                            📊 Link Live Sheets ↗
                          </button>
                        ) : (
                          <button
                            onClick={handleGoogleLink}
                            className="bg-slate-50 text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-xl text-[10.5px] font-bold border border-slate-200 transition-colors flex items-center gap-1 shadow-xs"
                          >
                            🔗 Link Google Sheets
                          </button>
                        )}
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-100">
                            <tr>
                              <th className="p-4">Plant Variety</th>
                              <th className="p-4">Listing Price</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Active Stock</th>
                              <th className="p-4">Operations</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {plants
                              .filter(p => !activeVendorSession || p.vendorId === activeVendorSession.id)
                              .map((plant) => (
                                <tr key={plant.id}>
                                  <td className="p-4">
                                    <div className="space-y-1">
                                      <p className="font-bold text-slate-900">{plant.name}</p>
                                      {plant.isAdminApproved ? (
                                        <span className="inline-block text-[9px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">
                                          ✔ Live Approved
                                        </span>
                                      ) : (
                                        <span className="inline-block text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                          ⏳ Pending Review
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4">₹{plant.price} <span className="text-emerald-600">({plant.discount}% OFF)</span></td>
                                  <td className="p-4">{plant.category}</td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="number"
                                        value={plant.stock}
                                        onChange={(e) => handleUpdateStock(plant.id, Number(e.target.value))}
                                        className="w-12 bg-slate-50 border border-slate-200 px-1 py-0.5 rounded text-center text-xs font-bold"
                                      />
                                      <span className="text-[10px] text-slate-400">units</span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2.5">
                                      <button
                                        onClick={() => setEditingPlant({ ...plant })}
                                        className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px]"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (confirm("Confirm erasing this botanical batch?")) {
                                            const res = await fetch(`/api/plants/${plant.id}`, { method: "DELETE" });
                                            if (res.ok) fetchPlants();
                                          }
                                        }}
                                        className="text-rose-500 hover:text-rose-700 text-[11px]"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* Courier & Delivery Operations */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                    <h3 className="font-display font-semibold text-slate-950 text-base flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-805" /> Dynamic Local Courier Parameters
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs text-slate-650">
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3.5">
                        <p className="font-semibold text-slate-800">Your Shipping Station Profile:</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-slate-400 font-bold uppercase text-[9px]">Approved Courier Fee:</p>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">
                              ₹{activeVendorSession.approvedDeliveryCharge !== undefined ? activeVendorSession.approvedDeliveryCharge : 49}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase text-[9px]">Oversight Status:</p>
                            <div className="mt-0.5">
                              {activeVendorSession.deliveryChargeStatus === "approved" && (
                                <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">✔ Approved</span>
                              )}
                              {activeVendorSession.deliveryChargeStatus === "pending" && (
                                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">⏳ Pending Admin</span>
                              )}
                              {activeVendorSession.deliveryChargeStatus === "rejected" && (
                                <span className="font-bold text-rose-750 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">✖ Rejected</span>
                              )}
                              {!activeVendorSession.deliveryChargeStatus && (
                                <span className="text-slate-400 italic">No Proposal Yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {activeVendorSession.proposedDeliveryCharge !== undefined && activeVendorSession.deliveryChargeStatus === "pending" && (
                          <div className="bg-white p-3 rounded-xl border border-dashed border-amber-200 text-amber-800 leading-relaxed text-[11px]">
                            🔔 Proposed Shipping rate under review: <strong>₹{activeVendorSession.proposedDeliveryCharge}</strong>
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-3">
                        <p className="font-semibold text-slate-800">Propose New Local Delivery Rate</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Submit dynamic courier surcharge rates depending on seasonal packaging requirements. All requested pricing scales require manual review and approval by administrators.
                        </p>
                        
                        <div className="flex gap-2.5 pt-1">
                          <input
                            type="number"
                            value={vendorProposedCourierRate}
                            onChange={(e) => setVendorProposedCourierRate(e.target.value)}
                            placeholder="e.g. 50"
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold w-full focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            onClick={() => handleProposeCourierFee(activeVendorSession.id, vendorProposedCourierRate)}
                            className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm shrink-0"
                          >
                            Send Proposal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EDIT BOTANICAL PLANT BATCH MODAL/DIALOG */}
                  {editingPlant && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 text-xs text-left">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <h4 className="font-display font-semibold text-slate-950 text-base">
                            Edit Species Product Details
                          </h4>
                          <button 
                            onClick={() => setEditingPlant(null)} 
                            className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleUpdateFullPlant} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Crop Variety Name</label>
                            <input
                              type="text"
                              required
                              value={editingPlant.name}
                              onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Regular Price (₹)</label>
                              <input
                                type="number"
                                required
                                value={editingPlant.price}
                                onChange={(e) => setEditingPlant({ ...editingPlant, price: Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Promo Discount %</label>
                              <input
                                type="number"
                                value={editingPlant.discount}
                                onChange={(e) => setEditingPlant({ ...editingPlant, discount: Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Active Stock</label>
                              <input
                                type="number"
                                value={editingPlant.stock}
                                onChange={(e) => setEditingPlant({ ...editingPlant, stock: Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Season</label>
                              <input
                                type="text"
                                value={editingPlant.season}
                                onChange={(e) => setEditingPlant({ ...editingPlant, season: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Botanical Description</label>
                            <textarea
                              value={editingPlant.description}
                              onChange={(e) => setEditingPlant({ ...editingPlant, description: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold h-16 resize-none focus:outline-none focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Care Instructions</label>
                            <textarea
                              value={editingPlant.careInstructions}
                              onChange={(e) => setEditingPlant({ ...editingPlant, careInstructions: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold h-16 resize-none focus:outline-none focus:bg-white"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl hover:bg-emerald-950 transition-all shadow-sm"
                          >
                            ✔ Deploy Listing Updates
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 5: ADMIN CABINET */}
        {currentTab === "admin" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <Coins className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">PlantAdda Commission Share ({deliverySettings.baseCommissionPercent}%)</p>
                  <p className="text-2xl font-bold text-slate-900">₹{calculatedAdminCommission}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Approved Nurseries</p>
                  <p className="text-2xl font-bold text-slate-900">{vendors.filter(v => v.status === "approved").length}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Received Plant orders</p>
                  <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Foliage Replacement claims</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {orders.filter(o => o.returnRequest?.status === "pending").length} Pending
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Delivery pricing parameters settings */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-display font-semibold text-slate-950 flex items-center gap-1.5 text-base border-b border-slate-100 pb-3">
                      ✔ Centralized Delivery Controls
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Configure global standard thresholds under PlantAdda layer.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Free Delivery Minimum (₹)</label>
                      <input
                        type="number"
                        value={adminFreeThreshold}
                        onChange={(e) => setAdminFreeThreshold(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Standard Delivery Surcharge (₹)</label>
                      <input
                        type="number"
                        value={adminDeliveryCharge}
                        onChange={(e) => setAdminDeliveryCharge(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Platform Commission Share Fee (%)</label>
                      <input
                        type="number"
                        value={adminCommissionRate}
                        onChange={(e) => setAdminCommissionRate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                    <button
                      onClick={handleSaveAdminConfig}
                      className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
                    >
                      Deploy Global Algorithms
                    </button>
                  </div>
                </div>

                {/* 📊 Google Sheets Smart Sync Controls */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 text-emerald-850 rounded-xl">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-slate-950 text-xs">
                          Google Sheets Smart Sync
                        </h3>
                        <p className="text-[10px] text-slate-400">Export and synchronize orders, inventory, and registers instantly.</p>
                      </div>
                    </div>
                    {googleUser && (
                      <span className="bg-emerald-50 text-emerald-850 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                        Linked
                      </span>
                    )}
                  </div>

                  {!googleUser ? (
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                      <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Connect your Google Account to export and synchronize live nursery assets directly into a multi-tab Google Sheet automatically.
                      </p>
                      <button
                        onClick={handleGoogleLink}
                        disabled={isLinkingGoogle}
                        className="mx-auto flex items-center gap-2 bg-emerald-800 hover:bg-emerald-950 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                      >
                        {isLinkingGoogle ? t("Connecting...", "कनेक्ट हो रहा है...") : t("Link Google Account", "गूगल खाता जोड़ें")}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* User profile details */}
                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-150 text-xs">
                        <div className="flex items-center gap-2">
                          {googleUser.photoURL ? (
                            <img src={googleUser.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-slate-250" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                              {googleUser.displayName ? googleUser.displayName[0] : (googleUser.email ? googleUser.email[0] : "G")}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate text-[11px]">{googleUser.displayName || "Google Operator"}</p>
                            <p className="text-[9px] text-slate-400 font-mono truncate">{googleUser.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleGoogleUnlink}
                          className="text-[9px] font-bold text-rose-600 hover:text-rose-800 underline uppercase tracking-tight shrink-0 ml-2"
                        >
                          Disconnect
                        </button>
                      </div>

                      {/* Sync actions */}
                      <div className="space-y-2">
                        {googleSheetUrl ? (
                          <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-emerald-900 font-display text-[11px]">Linked Sheet Active</span>
                              <span className="text-[8px] text-emerald-700 font-bold font-mono">ID: ...{googleSheetId?.slice(-6)}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">
                              The sheet tracks: <strong className="text-emerald-850">Orders</strong>, <strong className="text-emerald-850">Inventory</strong>, and <strong className="text-emerald-850">Vendors</strong>.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <a
                                href={googleSheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center bg-emerald-700 hover:bg-emerald-850 text-white py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                              >
                                {t("Open Sheet ↗", "शीट खोलें ↗")}
                              </a>
                              <button
                                onClick={handleSyncExistingSheet}
                                disabled={sheetsSyncStatus === "syncing"}
                                className="px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-205 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 justify-center disabled:opacity-50"
                              >
                                {sheetsSyncStatus === "syncing" ? t("Syncing...", "सिंक...") : t("Sync Data", "सिंक करें")}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={handleCreateNewSheet}
                            disabled={sheetsSyncStatus === "creating"}
                            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                          >
                            {sheetsSyncStatus === "creating" ? "Preparing Cloud Sheet..." : "Create Unified Google Sheet"}
                          </button>
                        )}

                        {/* Standalone Quick Export */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                          <button
                            onClick={() => handleExportSingleSection("orders")}
                            disabled={sheetsSyncStatus === "syncing"}
                            className="bg-slate-100/75 hover:bg-slate-150 py-1.5 rounded-lg text-center font-bold text-slate-700 transition"
                          >
                            📦 Orders
                          </button>
                          <button
                            onClick={() => handleExportSingleSection("plants")}
                            disabled={sheetsSyncStatus === "syncing"}
                            className="bg-slate-100/75 hover:bg-slate-150 py-1.5 rounded-lg text-center font-bold text-slate-700 transition"
                          >
                            🌱 Inventory
                          </button>
                          <button
                            onClick={() => handleExportSingleSection("vendors")}
                            disabled={sheetsSyncStatus === "syncing"}
                            className="bg-slate-100/75 hover:bg-slate-150 py-1.5 rounded-lg text-center font-bold text-slate-700 transition"
                          >
                            🏪 Vendors
                          </button>
                        </div>
                      </div>

                      {/* Messages / indicators */}
                      {sheetsSyncStatus === "success" && (
                        <div className="p-2 bg-emerald-100/60 border border-emerald-200 text-emerald-900 rounded-xl text-[10px] leading-relaxed flex items-center gap-1">
                          <span>✅</span>
                          <div>
                            <p className="font-bold">Sync successful!</p>
                            {lastSyncTime && <p className="text-[8.5px] text-slate-400 font-mono">Timestamp: {lastSyncTime}</p>}
                          </div>
                        </div>
                      )}

                      {sheetsError && (
                        <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[9.5px] leading-relaxed flex items-center gap-1">
                          <span>⚠️</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold">Export failed</p>
                            <p className="text-[8.5px] font-mono truncate">{sheetsError}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 📂 Dynamic Default Category Image Manager */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display font-semibold text-slate-950 flex items-center gap-1.5 text-base border-b border-slate-100 pb-3">
                      📂 Category Cover Customizer
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Manage default category images & add/remove dynamic plant taxonomies easily.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Create / Update Field */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs space-y-2">
                      <p className="font-bold text-emerald-850 text-[10.5px] uppercase tracking-wider">Add/Update Category Cover</p>
                      
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-slate-400 font-bold block">Taxonomy Name (Category)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Bonsai Specimen"
                          value={catManageName}
                          onChange={(e) => setCatManageName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-emerald-600"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-slate-400 font-bold block">Default Cover Photo URL</label>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com/..."
                          value={catManageUrl}
                          onChange={(e) => setCatManageUrl(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-emerald-600"
                        />
                      </div>

                      <button 
                        onClick={handleSaveCategoryCover}
                        className="w-full bg-emerald-805 bg-emerald-800 hover:bg-emerald-950 text-white text-[10px] font-extrabold py-2 rounded-lg transition-colors"
                      >
                        Save Category & Default Image
                      </button>
                    </div>

                    {/* List & Demolish Categories */}
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-600 text-[10px] uppercase tracking-wider">Active Category covers ({Object.keys(categoryCovers).length})</p>
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs">
                        {Object.entries(categoryCovers).map(([catName, coverImg]) => (
                          <div key={catName} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-xl gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={coverImg} className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-700 truncate">{catName}</p>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleDeleteCategoryCover(catName)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition-colors shrink-0"
                              title="Delete category default cover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Approval Ledger and Claims manager */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Nursery Verification */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <h3 className="font-display font-semibold text-slate-950 text-base">
                    Nursery Vendor Partnership Applicants ({vendors.filter(v => v.status === "pending").length})
                  </h3>

                  <div className="space-y-3">
                    {vendors
                      .filter(v => v.status === "pending")
                      .map((vend) => (
                        <div key={vend.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                          <div className="space-y-1.5">
                            <p className="font-bold text-slate-900">{vend.nurseryName}</p>
                            <p className="text-slate-450">Representative: {vend.name} &bull; {vend.contactEmail} &bull; {vend.contactPhone}</p>
                            <p className="text-slate-500 italic">Address: {vend.address}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveVendor(vend.id, "approved")}
                              className="bg-[#15803d] hover:bg-[#166534] text-white font-bold px-3 py-1.5 rounded-xl transition-all"
                            >
                              Approve Partner
                            </button>
                            <button
                              onClick={() => handleApproveVendor(vend.id, "rejected")}
                              className="bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}

                    {vendors.filter(v => v.status === "pending").length === 0 && (
                      <p className="text-xs text-slate-400 italic">No applicant entries pending review.</p>
                    )}
                  </div>
                </div>

                {/* 24 hours Foliage loss claim approvals */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <h3 className="font-display font-semibold text-slate-950 text-base flex items-center gap-1.5">
                    <AlertTriangle className="w-5 h-5 text-rose-500" /> 24-Hour Guarantee Replacement & Refund Queue
                  </h3>

                  <div className="space-y-4">
                    {orders
                      .filter(o => o.returnRequest && o.returnRequest.status === "pending")
                      .map((order) => {
                        const rr = order.returnRequest!;
                        return (
                          <div key={order.id} className="border border-slate-200 p-4 rounded-2xl bg-slate-50/45 space-y-4 text-xs">
                            <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-100">
                              <div>
                                <p className="font-bold text-slate-900 font-mono">ORDER ID: {order.id}</p>
                                <p className="text-slate-450 mt-1">Customer: {order.customerName} ({order.customerEmail})</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-rose-600">UPI Pay Refund: ₹{order.total}</p>
                                <p className="text-[10px] text-slate-400 italic">{rr.requestDate.split("T")[0]}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2 space-y-2">
                                <p className="font-bold text-slate-800">Claimant Loss Justification:</p>
                                <p className="text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100 italic-text">
                                  "{rr.reason}"
                                </p>
                              </div>

                              <div>
                                <p className="font-bold text-slate-800 mb-1.5">Dead Plant proof:</p>
                                <div className="rounded-xl overflow-hidden aspect-video bg-white border border-slate-200 shadow-sm">
                                  {rr.photoProofUrl.startsWith("data:image") ? (
                                    <img src={rr.photoProofUrl} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 font-sans italic text-[10px] text-center p-2 bg-slate-50">
                                      Photo evidence uploaded
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                onClick={() => handleResolveReturn(order.id, "approved")}
                                className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold px-4 py-2 rounded-xl transition-all"
                              >
                                Approve Refund to Customer UPI Wallet
                              </button>
                              <button
                                onClick={() => handleResolveReturn(order.id, "rejected")}
                                className="bg-white border border-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition-all"
                              >
                                Reject Claim
                              </button>
                            </div>

                          </div>
                        );
                      })}

                    {orders.filter(o => o.returnRequest && o.returnRequest.status === "pending").length === 0 && (
                      <p className="text-xs text-slate-400 italic">No guarantee requests awaiting inspection.</p>
                    )}
                  </div>
                </div>

                {/* Proposed Plant Listings Approval Queue */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="font-display font-semibold text-slate-950 text-base">
                      🌱 Nursery Variety Approval Queue ({plants.filter(p => !p.isAdminApproved).length} Pending Review)
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-2 py-0.5 rounded">Visibility Lock</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    No plant variety listing is live for customers until administrative authorization is confirmed. Act as final authority for brand visibility.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plants
                      .filter(p => p.isAdminApproved !== true)
                      .map((plant) => {
                        const vendorOfPlant = vendors.find(v => v.id === plant.vendorId);
                        return (
                          <div key={plant.id} className="border border-slate-200 bg-slate-50/50 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-sm">
                            <div className="flex gap-3">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                                <img src={plant.imageUrls[0]} className="w-full h-full object-cover" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-900 leading-tight">{plant.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-mono">{plant.category}</p>
                                <p className="font-bold text-emerald-805 mt-1">₹{plant.price} <span className="text-slate-400 font-normal">({plant.discount}% discount proposed)</span></p>
                                <p className="text-[10px] text-slate-400 italic">By: {vendorOfPlant ? vendorOfPlant.nurseryName : "Verified Station"}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprovePlant(plant.id, true)}
                                className="w-full bg-[#15803d] hover:bg-[#166534] text-white font-bold p-1.5 rounded-lg transition-all text-[11px]"
                              >
                                Approve Listing
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm("Confirm rejecting this uploaded listing?")) {
                                    const res = await fetch(`/api/plants/${plant.id}`, { method: "DELETE" });
                                    if (res.ok) fetchPlants();
                                  }
                                }}
                                className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold p-1.5 rounded-lg transition-all text-[11px]"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {plants.filter(p => !p.isAdminApproved).length === 0 && (
                      <p className="text-slate-400 italic md:col-span-2">No unapproved variety listings pending checklist validation.</p>
                    )}
                  </div>
                </div>

                {/* Proposed Courier / Delivery Charges Approval Desk */}
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="font-display font-semibold text-slate-950 text-base flex items-center gap-1.5">
                      <Truck className="w-5 h-5 text-emerald-800" /> Courier Shipping Approvals Platform
                    </h3>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Verify and approve or reject shipping rates proposed by partner nurseries, or override pricing models directly below.
                  </p>

                  <div className="space-y-3.5">
                    {vendors
                      .filter(v => v.proposedDeliveryCharge !== undefined && v.status === "approved")
                      .map((v) => (
                        <div key={v.id} className="border border-slate-150 bg-slate-50 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900">{v.nurseryName}</p>
                            <p className="text-slate-500">Representative: {v.name} &bull; Active Approved Cost: <strong>₹{v.approvedDeliveryCharge ?? 49}</strong></p>
                            <span className="inline-block text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-1">Proposed Surcharge: <strong>₹{v.proposedDeliveryCharge}</strong> (Status: <span className="font-bold uppercase font-mono text-[9px]">{v.deliveryChargeStatus || "pending"}</span>)</span>
                          </div>

                          <div className="flex flex-wrap gap-2 items-center">
                            {v.deliveryChargeStatus === "pending" && (
                              <>
                                <button
                                  onClick={() => handleVendorShippingAction(v.id, "approve")}
                                  className="bg-[#15803d] hover:bg-[#166534] text-white font-bold px-3 py-1.5 rounded-lg transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleVendorShippingAction(v.id, "reject")}
                                  className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold px-3 py-1.5 rounded-lg transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {/* Manual Override inputs */}
                            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
                              <span className="text-slate-400 font-mono text-[10px]">Override: ₹</span>
                              <input
                                type="number"
                                placeholder={String(v.approvedDeliveryCharge ?? v.proposedDeliveryCharge ?? 49)}
                                value={overrideVendorDeliveryVals[v.id] || ""}
                                onChange={(e) => setOverrideVendorDeliveryVals({
                                  ...overrideVendorDeliveryVals,
                                  [v.id]: e.target.value
                                })}
                                className="w-12 bg-transparent text-xs font-bold text-slate-900 border-none outline-none focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  const val = Number(overrideVendorDeliveryVals[v.id]);
                                  if (isNaN(val) || val < 0) return alert("Write valid override sum cost");
                                  handleVendorShippingAction(v.id, "override", val);
                                }}
                                className="text-emerald-805 font-bold hover:text-emerald-950 text-[10px] uppercase cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                    {vendors.filter(v => v.proposedDeliveryCharge !== undefined && v.status === "approved").length === 0 && (
                      <p className="text-slate-400 italic">No nursery partners currently requesting custom postage fees.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Complete Platform Price Audit & Overrides Consistency Desk */}
            <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-display font-semibold text-slate-950 text-base flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-emerald-805" /> PlantAdda Marketplace Pricing Quality Watchdog
                </h3>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Audit active retail prices across all registered nurseries under the unified single brand guidelines. Perform instant modifications below as the final authority on pricing consistency.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Variety (Category)</th>
                      <th className="p-3">Vendor Origin</th>
                      <th className="p-3">Listed regular / Promo Discount</th>
                      <th className="p-3">Retail Selling Price</th>
                      <th className="p-3">Oversight Price Control Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] text-slate-650">
                    {plants.map((p) => {
                      const originalVendorObj = vendors.find(v => v.id === p.vendorId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">
                            {p.name}
                            <span className="block text-[9px] text-slate-400 font-normal">{p.category} &bull; {p.season}</span>
                          </td>
                          <td className="p-3 italic text-emerald-800 font-semibold text-[10px]">
                            {originalVendorObj ? originalVendorObj.nurseryName : "General Brand Assured"}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-805">₹{p.price}</span> / <span className="text-rose-600 font-semibold">{p.discount}% OFF</span>
                          </td>
                          <td className="p-3 font-bold text-emerald-800">
                            ₹{Math.round(p.price * (1 - p.discount/100))}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 w-max">
                              <div className="flex items-center gap-0.5">
                                <span className="text-[9px] font-mono text-slate-450">Regular: ₹</span>
                                <input
                                  type="number"
                                  placeholder={String(p.price)}
                                  value={overridePlantPriceVals[p.id] || ""}
                                  onChange={(e) => setOverridePlantPriceVals({
                                    ...overridePlantPriceVals,
                                    [p.id]: e.target.value
                                  })}
                                  className="w-12 bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px] text-center font-bold"
                                />
                              </div>
                              <div className="flex items-center gap-0.5">
                                <span className="text-[9px] font-mono text-slate-450">Disc: %</span>
                                <input
                                  type="number"
                                  placeholder={String(p.discount)}
                                  value={overridePlantDiscountVals[p.id] || ""}
                                  onChange={(e) => setOverridePlantDiscountVals({
                                    ...overridePlantDiscountVals,
                                    [p.id]: e.target.value
                                  })}
                                  className="w-10 bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px] text-center font-bold"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const pVal = overridePlantPriceVals[p.id] ? Number(overridePlantPriceVals[p.id]) : p.price;
                                  const dVal = overridePlantDiscountVals[p.id] ? Number(overridePlantDiscountVals[p.id]) : p.discount;
                                  if (pVal < 0 || dVal < 0 || dVal > 100) return alert("Write valid pricing parameter range");
                                  handleOverridePlantPricing(p.id, pVal, dVal);
                                }}
                                className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-1 px-2.5 rounded text-[10px] uppercase cursor-pointer"
                              >
                                Apply Override
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADMIN INTERACTION PANELS: PROMO WRITER & DATABASE ROUTER INTEGRATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              
              {/* Promo Banner & Breaking news writer */}
              <div id="admin-promo-editor" className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="p-2 bg-emerald-100 text-emerald-850 rounded-xl">
                    <Sprout className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base">Live Homepage Promotional Offer Editor</h3>
                    <p className="text-[10px] text-slate-400">Push breaking alerts, coupon banners, or live notifications instantly.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePromoBanner} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold block">Promotional Title / Hero Head</label>
                    <input 
                      type="text" 
                      value={adminPromoTitle}
                      onChange={(e) => setAdminPromoTitle(e.target.value)}
                      placeholder="Monsoon Special Sale..."
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl outline-none text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-semibold block">Promotional Image URL</label>
                    <input 
                      type="text" 
                      value={adminPromoImageUrl}
                      onChange={(e) => setAdminPromoImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/promo-plant..."
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl outline-none text-[11px] font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-semibold block">Secondary News / Subtext Alert</label>
                      <input 
                        type="text" 
                        value={adminPromoNewsText}
                        onChange={(e) => setAdminPromoNewsText(e.target.value)}
                        placeholder="Certified local nurseries are..."
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-semibold block">Banner Active Status</label>
                      <select 
                        value={String(adminPromoIsActive)}
                        onChange={(e) => setAdminPromoIsActive(e.target.value === "true")}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none text-xs font-semibold"
                      >
                        <option value="true">✅ Live and Published</option>
                        <option value="false">❌ Hidden / Offline</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold py-3 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                  >
                    <span>📣 Publish Live Front-Page Promotion</span>
                  </button>
                </form>
              </div>

              {/* Database router integration (Supabase, Postgres, Firebase etc) */}
              <div id="admin-db-integrations" className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-105 text-slate-800 rounded-xl">
                      <Database className="w-5 h-5 text-emerald-800" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-base">Direct Database Integrator</h3>
                      <p className="text-[10px] text-slate-400">Sync customer login photos, credentials, and logs from live databases.</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded uppercase font-mono">
                    Supabase Enabled
                  </span>
                </div>

                {/* DB Config list tab selector */}
                <div className="space-y-4">
                  <div className="bg-emerald-50/50 border border-emerald-100/60 p-3.5 rounded-2xl flex flex-col gap-2">
                    <p className="text-[11px] font-bold text-slate-700">Active Database Routers ({dbConnections.length}):</p>
                    {dbConnections.length === 0 ? (
                      <p className="text-slate-400 text-[10px] italic">No custom database connections registered. Using master template fallback.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {dbConnections.map((db) => {
                          const isActive = activeIntegratedDbId === db.id;
                          return (
                            <button
                              key={db.id}
                              onClick={() => fetchIntegratedUsers(db.id)}
                              className={`px-3 py-1.5 rounded-xl border transition-all text-left text-[11px] flex items-center gap-1.5 cursor-pointer ${
                                isActive 
                                  ? "bg-slate-900 text-white border-slate-800 shadow" 
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${db.provider === "supabase" ? "bg-emerald-400" : "bg-blue-400"}`}></span>
                              <span>{db.displayName}</span>
                              <span className="text-[9px] uppercase font-bold opacity-60">({db.provider})</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Connection Details and Actions */}
                  {activeIntegratedDbId && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      {dbConnections.filter(db => db.id === activeIntegratedDbId).map((db) => (
                        <div key={db.id} className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Database className="w-3.5 h-3.5 text-emerald-800" />
                                {db.displayName} Gateway config
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5 select-all">Host: {db.connectionString.substring(0, 45)}...</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTestDbConnection(db.id)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  testingDbId === db.id 
                                    ? "bg-amber-100 text-amber-800 border border-amber-250 animate-pulse"
                                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-150"
                                }`}
                              >
                                {testingDbId === db.id ? "Connecting..." : "🔌 Live Test Node"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDbConnection(db.id)}
                                className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-150 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Test results indicator */}
                          {dbTestMessage && (
                            <p className="text-[10.5px] font-mono leading-relaxed p-2.5 bg-neutral-900 text-lime-400 rounded-xl border border-neutral-800">
                              {dbTestMessage}
                            </p>
                          )}

                          {/* Retrieved user photographs and database row records listing */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                                📸 User Login Auth & Synchronized Data Profiles:
                              </p>
                              <span className="text-[9px] text-[#84cc16] bg-[#0b2e1b] font-bold font-mono px-2 py-0.5 rounded">
                                supabase Auth mapped
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                              {integratedUserProfiles.map((prof, index) => (
                                <div key={index} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-emerald-600/20 shrink-0">
                                    <img 
                                      src={prof.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                                      alt={prof.name} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="text-[11px] space-y-0.5 overflow-hidden">
                                    <p className="font-bold text-slate-900 truncate" title={prof.name}>{prof.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate" title={prof.email}>{prof.email}</p>
                                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">
                                      UUID: {prof.id}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {integratedUserProfiles.length === 0 && (
                                <p className="text-slate-400 text-[10px] italic p-4 text-center md:col-span-2">No profiles synced from this connection node. Run live diagnostic test above.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link new Database UI */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 text-xs">
                    <p className="font-bold text-slate-800 text-[12px] mb-3 flex items-center gap-1.5">
                      ⚙️ Setup External Database Credentials & Sync Gateways
                    </p>
                    
                    <form onSubmit={handleSaveDbConnection} className="space-y-3.5 flex flex-col">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold block">Router Type / Service API</label>
                          <select
                            value={newDbProvider}
                            onChange={(e: any) => setNewDbProvider(e.target.value)}
                            className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-slate-850"
                          >
                            <option value="supabase">⚡ Supabase Database & Auth (Recommended)</option>
                            <option value="postgresql">🐘 Relational PostgreSQL Server</option>
                            <option value="firebase">🔥 Firebase Auth & Firestore</option>
                            <option value="mongodb">🍃 MongoDB Atlas Cloud DB</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold block">Friendly Connection Name</label>
                          <input
                            type="text"
                            placeholder="My Production Supabase"
                            value={newDbDisplayName}
                            onChange={(e) => setNewDbDisplayName(e.target.value)}
                            className="w-full bg-white border border-slate-250 p-2.5 rounded-xl outline-none text-xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 font-semibold block">
                          Endpoint Connection URI / Database Host Hostname
                        </label>
                        <input
                          type="text"
                          placeholder={
                            newDbProvider === "supabase" 
                              ? "https://your-project.supabase.co" 
                              : "postgresql://postgres:password_goes_here@db.example.com:5432/main"
                          }
                          value={newDbConnectionString}
                          onChange={(e) => setNewDbConnectionString(e.target.value)}
                          className="w-full bg-white border border-slate-250 p-2.5 rounded-xl font-mono text-[11px]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold block">Secret API Key / Auth Token bearer</label>
                          <input
                            type="password"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            value={newDbApiKey}
                            onChange={(e) => setNewDbApiKey(e.target.value)}
                            className="w-full bg-white border border-slate-250 p-2.5 rounded-xl font-mono text-[11px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-500 font-semibold block">Relational Schemas / Tables to sync</label>
                          <input
                            type="text"
                            placeholder="public.profiles, public.user_logs"
                            value={newDbSchemaDetails}
                            onChange={(e) => setNewDbSchemaDetails(e.target.value)}
                            className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-extrabold hover:bg-black py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 md:text-xs text-[11px] cursor-pointer mt-2"
                      >
                        ⚡ Mount Connection Router Node & Sync Users
                      </button>
                    </form>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* PLANT CARE DETAILS MODAL POPUP */}
      {selectedPlant && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-slate-100 text-slate-700 uppercase font-mono px-2 py-0.5 rounded">
                  {selectedPlant.season} Growth Cycle
                </span>
                <h3 className="font-display font-bold text-xl text-slate-950 mt-1">{selectedPlant.name}</h3>
              </div>
              <button 
                onClick={handleClosePlantModal} 
                className="bg-slate-105 hover:bg-slate-200 p-1.5 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden h-48 bg-slate-50">
              <img 
                src={selectedPlant.imageUrls && selectedPlant.imageUrls[0] ? selectedPlant.imageUrls[0] : (categoryCovers[selectedPlant.category] || "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80")} 
                className="w-full h-full object-cover" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-800">{t("Care Directives", "देखभाल निर्देश")}:</h4>
                  <p className="text-xs text-slate-600 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 leading-relaxed">
                    {selectedPlant.careInstructions}
                  </p>
                </div>

                {/* AI Botanical Doctor Recommendation Generator Widget */}
                <div className="bg-emerald-900 text-white p-4 rounded-2xl border border-emerald-700 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono tracking-widest text-[#00FF00] bg-emerald-950 px-2 py-0.5 rounded-full uppercase font-black">
                      ✨ Gemini AI Care Desk
                    </span>
                    <span className="text-[9px] text-[#FFFF00] font-black tracking-wider uppercase bg-emerald-950 px-1.5 py-0.5 rounded">Pro Verified</span>
                  </div>
                  <h5 className="text-xs font-black font-display text-white">Generate Custom 10-Second Care Blueprint</h5>
                  <p className="text-[10px] text-emerald-100 leading-relaxed">
                    Consult our real botanical intelligence tool to get optimal soil aerations, sunlight exposure guide and a quick DIY pesticide recipe.
                  </p>
                  
                  {aiCustomConsultResult && (
                    <div className="text-[11px] text-slate-100 bg-emerald-950 p-2.5 rounded-xl border border-emerald-800/85 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans mt-2">
                      {aiCustomConsultResult}
                    </div>
                  )}

                  <button
                    onClick={() => handleGetAiPlantCareBlueprint(selectedPlant.name, selectedPlant.category)}
                    disabled={aiCustomConsultLoading}
                    className="w-full bg-[#00FF00] text-black font-extrabold text-[11px] py-2.5 rounded-xl hover:bg-[#00e02d] transition-transform active:scale-95 disabled:bg-emerald-800 disabled:text-emerald-300 mt-2 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {aiCustomConsultLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Diagnosing species properties...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{aiCustomConsultResult ? "Re-generate AI Blueprint" : "Consult AI Care Doctor"}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-[11px] text-neutral-600">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    🛡️ PlantAdda 24-Hour Guarantee
                  </p>
                  <p className="text-[10.5px]">
                    Should this species lose foliage health or perish within 24 hours of local delivery fulfillment, simply snap a picture with dead proof matching the invoice. Instant UPI compensation will be issued.
                  </p>
                </div>
              </div>

              {/* Multi reviews and rating module */}
              <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-850 flex items-center justify-between">
                  <span>{t("Ratings & Reviews", "रेटिंग और समीक्षाएं")}</span>
                  <span className="text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded font-mono font-bold">
                    ★ {getAverageRating(selectedPlant).toFixed(1)} / 5.0
                  </span>
                </h4>

                {/* Submitting custom rating */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-205 space-y-2 text-xs">
                  <p className="font-bold text-slate-700 text-[10.5px]">{t("Express New Rating Star", "नया स्टार रेटिंग जोड़ें")}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text"
                      placeholder={t("Your Name", "आपका नाम")}
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs outline-none focus:border-emerald-600"
                    />
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 justify-center">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className="hover:scale-110 active:scale-125 transition-transform text-amber-400"
                        >
                          <Star className={`w-3.5 h-3.5 ${star <= newReviewRating ? "fill-amber-400 text-amber-400" : "text-slate-250"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <input 
                      type="text"
                      placeholder={t("Write beautiful review...", "सुंदर समीक्षा लिखें...")}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs outline-none focus:border-emerald-600"
                    />
                    <button
                      onClick={() => handleAddReview(selectedPlant.id)}
                      className="bg-[#00FF00] hover:bg-[#00e62d] text-black font-black px-3 rounded-lg text-[11px]"
                    >
                      {t("Rate", "रेट करें")}
                    </button>
                  </div>
                </div>

                {/* Review Log Stream */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(!selectedPlant.reviews || selectedPlant.reviews.length === 0) ? (
                    <p className="text-[11px] text-slate-450 italic text-center py-4">{t("No customer rates yet.", "अभी तक कोई रेटिंग नहीं है।")}</p>
                  ) : (
                    selectedPlant.reviews.map((r: any) => (
                      <div key={r.id} className="p-2 border border-slate-200/60 rounded-xl bg-slate-50/40 flex justify-between gap-1 items-start">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-[11px] flex-wrap">
                            <span className="font-bold text-slate-850">{r.reviewerName}</span>
                            <span className="text-[9px] text-slate-400">{r.date}</span>
                            <div className="flex text-amber-400">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star key={idx} className={`w-2.5 h-2.5 ${idx < r.rating ? "fill-amber-400 text-amber-450" : "text-slate-200"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 italic mt-0.5">"{r.comment}"</p>
                        </div>

                        {/* Admin or personal deletion support */}
                        {(currentUser.role === "admin" || r.reviewerName === currentUser.name) && (
                          <button
                            onClick={() => handleDeleteReview(selectedPlant.id, r.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 hover:bg-slate-100 rounded transition-colors shrink-0"
                            title={t("Delete review", "समीक्षा हटाएं")}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button
                onClick={handleClosePlantModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Dismiss Care File
              </button>
              <button
                onClick={() => { handleAddToCart(selectedPlant); handleClosePlantModal(); }}
                className="bg-[#00FF00] hover:bg-[#00e32a] text-black px-5 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-sm"
              >
                Add to Cart (₹{Math.round(selectedPlant.price * (1 - selectedPlant.discount / 100))})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX ZOOMED BOTANIC PHOTO POPUP (BIG SCREEN CLEAR VIEWER) */}
      {zoomedPlantPhoto && (
        <div className="fixed inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl relative flex flex-col items-center space-y-4">
            
            {/* Toolbar Header */}
            <div className="flex justify-between items-center w-full text-white px-2">
              <div>
                <span className="text-[10px] bg-[#84cc16] text-[#0b2e1b] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                  🔍 High-Res Botanic Clear View
                </span>
                <h3 className="font-display font-bold text-2xl mt-1 text-white">{zoomedPlantPhoto.name}</h3>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">
                  Category: {zoomedPlantPhoto.category} &bull; Native Growth Cycle: {zoomedPlantPhoto.season}
                </p>
              </div>
              <button 
                onClick={() => setZoomedPlantPhoto(null)} 
                className="bg-white/10 hover:bg-white/25 p-3 rounded-full text-white transition-all transform active:scale-95 cursor-pointer border border-white/10"
                title="Close Photo Viewer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Full Screen Photo Container */}
            <div className="bg-slate-900/40 border border-white/10 rounded-[32px] overflow-hidden max-h-[66vh] w-full flex items-center justify-center shadow-2xl relative group p-2">
              <img 
                src={zoomedPlantPhoto.imageUrls[0]} 
                alt={zoomedPlantPhoto.name}
                className="object-contain max-h-[62vh] max-w-full rounded-2xl transition-transform duration-350 transform hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Care directives tooltip */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs text-slate-100 leading-relaxed">
                <span className="font-black text-[#84cc16] block uppercase tracking-wider text-[9px] mb-1">🌿 Species Care Directive:</span>
                {zoomedPlantPhoto.careInstructions}
              </div>
            </div>

            {/* Instant checkout triggers */}
            <div className="flex gap-4 items-center pt-2">
              <button
                onClick={() => {
                  handleAddToCart(zoomedPlantPhoto);
                  setZoomedPlantPhoto(null);
                }}
                className="bg-[#84cc16] hover:bg-[#a3e635] text-[#0b2e1b] font-extrabold py-3 px-8 rounded-2xl text-xs transition-all tracking-wider shadow-lg transform active:scale-95 flex items-center gap-2"
              >
                🛒 Add Direct to Invoice Cart &bull; ₹{Math.round(zoomedPlantPhoto.price * (1 - zoomedPlantPhoto.discount / 100))}
              </button>
              <button 
                onClick={() => setZoomedPlantPhoto(null)}
                className="bg-white/10 text-white hover:bg-white/20 border border-white/15 font-semibold py-3 px-6 rounded-2xl text-xs transition-colors"
              >
                Dismiss Clear Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER / SLIDEOUT SHEET */}
      {cartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-end backdrop-blur-8xs">
          <div className="bg-white max-w-md w-full h-full p-6 flex flex-col justify-between shadow-2xl animate-slide-in relative border-l border-slate-100">
            
            {/* Header drawer */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-display font-semibold text-slate-950 text-base flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-700" /> PlantAdda Invoice Cart
                </h3>
                <button 
                  onClick={() => setCartOpen(false)} 
                  className="bg-slate-100 p-1.5 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Checkout Progress bar */}
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span className={checkoutStep === "none" ? "text-emerald-700" : ""}>1. Cart Summary</span>
                <span className={checkoutStep === "address" ? "text-emerald-700" : ""}>2. Standard Dispatch</span>
                <span className={checkoutStep === "upi" ? "text-emerald-700" : ""}>3. Pay via UPI</span>
              </div>
            </div>

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {checkoutStep === "none" && (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.plantId} className="flex justify-between items-center border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                      <div className="flex gap-2.5 items-center">
                        <img src={item.imageUrl} className="w-10 h-10 object-cover rounded-xl shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-950 text-xs line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5">
                            ₹{Math.round(item.price * (1 - item.discount / 100))} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
                          <button onClick={() => updateCartQuantity(item.plantId, -1)} className="p-1 hover:bg-slate-50 text-slate-550 rounded"><Minus className="w-3 h-3" /></button>
                          <span className="px-2 font-mono text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.plantId, 1)} className="p-1 hover:bg-slate-50 text-slate-550 rounded"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => updateCartQuantity(item.plantId, -item.quantity)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <div className="text-center py-12 space-y-2">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-405 italic">Shopping cart is empty. Pls add items from the marketplace catalogue!</p>
                    </div>
                  )}
                </div>
              )}

              {checkoutStep === "address" && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-800">Dispatch Location details:</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Receiver Name</label>
                      <input
                        type="text"
                        required
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Receiver Mobile</label>
                      <input
                        type="text"
                        required
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Deliver Address Corridor</label>
                      <textarea
                        required
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none h-20 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === "upi" && (
                <div className="space-y-4 text-xs text-center">
                  <div className="bg-emerald-900 text-white p-4 rounded-2xl flex flex-col items-center justify-center space-y-2">
                    <QrCode className="w-12 h-12 text-emerald-300 pointer-events-none" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-300">Scan to Auto Verify Instantly</p>
                      <p className="text-sm font-bold">UPI Amount Due: ₹{totalAmount}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-slate-500">Select simulated UPI payment Provider:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["PhonePe", "GPay", "Paytm", "QR"] as const).map((prov) => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setPaymentProvider(prov)}
                          className={`p-3 rounded-xl border text-center font-bold font-mono text-xs flex items-center justify-center gap-1 ${
                            paymentProvider === prov 
                              ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 text-slate-500"
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" /> {prov}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && placedOrderDetails && (
                <div className="space-y-4 text-xs text-center py-6">
                  <div className="bg-emerald-100 text-emerald-800 p-4 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-slate-900">Payment Process Completed!</h4>
                    <p className="text-slate-500 mt-1">Order placed securely under unified Brand layer.</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-left font-mono">
                    <div className="flex justify-between text-[11px]">
                      <span>Invoice Code:</span>
                      <span className="font-bold text-slate-900">{placedOrderDetails.id}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>UPI Ref:</span>
                      <span>Verified Auto-Verify</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-200">
                      <span>Total Paid:</span>
                      <span className="font-bold text-emerald-700">₹{placedOrderDetails.total}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    Certified nursery dispatch code assigned: {placedOrderDetails.assignedVendorId}. Delivery agents are rolling.
                  </p>
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Cart Items sum</span>
                  <span>₹{Math.round(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Unified Delivery charges</span>
                  <span>{deliveryCharge === 0 ? <span className="text-emerald-700 font-bold">FREE Delivery</span> : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-100">
                  <span>Amount Payable</span>
                  <span className="text-emerald-800">₹{totalAmount}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {checkoutStep === "none" && (
                  <button
                    onClick={() => setCheckoutStep("address")}
                    disabled={cart.length === 0}
                    className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    Proceed to Delivery Details
                  </button>
                )}

                {checkoutStep === "address" && (
                  <>
                    <button
                      onClick={() => setCheckoutStep("none")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-650 px-4 py-3 rounded-xl text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCheckoutStep("upi")}
                      className="flex-1 bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3 rounded-xl text-xs transition-all"
                    >
                      Proceed to Payment Sandbox
                    </button>
                  </>
                )}

                {checkoutStep === "upi" && (
                  <>
                    <button
                      onClick={() => setCheckoutStep("address")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-650 px-4 py-3 rounded-xl text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 rounded-xl text-xs transition-all animate-bounce"
                    >
                      Pay & Place Order
                    </button>
                  </>
                )}

                {checkoutStep === "success" && (
                  <button
                    onClick={() => { setCheckoutStep("none"); setCartOpen(false); }}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs transition-all"
                  >
                    Continue Shopping
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED ORDER REAL-TIME MILESTONE TRACKING MODAL */}
      {trackingOrderId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-950">Real-Time Delivery Tracker</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Order ID: {trackingOrderId}</p>
              </div>
              <button 
                onClick={() => setTrackingOrderId(null)} 
                className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tracking Sequence visual diagram */}
            {(() => {
              const orderObj = orders.find(o => o.id === trackingOrderId);
              if (!orderObj) return <p className="text-xs text-rose-500">Registry error fetching order status mapping.</p>;
              
              const milestones = ["pending", "packed", "dispatched", "delivered"];
              const currentIndex = milestones.indexOf(orderObj.status);

              return (
                <div className="space-y-6">
                  {/* Progress Line */}
                  <div className="relative flex items-center justify-between pb-4">
                    <div className="absolute left-1 right-1 h-1.5 bg-slate-100 top-[15px] rounded z-0" />
                    <div 
                      className="absolute left-1 h-1.5 bg-emerald-600 top-[15px] rounded z-0 transition-all duration-700" 
                      style={{ width: `${(currentIndex / (milestones.length - 1)) * 100}%` }}
                    />

                    {milestones.map((m, idx) => {
                      const isActive = idx <= currentIndex;
                      const isCurrent = idx === currentIndex;
                      return (
                        <div key={m} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-mono font-bold text-xs shadow-sm transition-all ${
                            isCurrent ? "bg-emerald-800 text-white border-emerald-800 scale-110" :
                            isActive ? "bg-emerald-500 text-slate-900 border-emerald-500" :
                            "bg-white text-slate-400 border-slate-200"
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] capitalize font-bold mt-2 ${isActive ? "text-emerald-950" : "text-slate-400"}`}>
                            {m}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visual description message */}
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-xs text-emerald-950 leading-relaxed">
                    <p className="font-bold">Latest Milestone Update:</p>
                    <p className="mt-1">
                      {orderObj.status === "pending" && "🌿 Order verified and matching with nearest nursery partner. Packing sequence initiated."}
                      {orderObj.status === "packed" && "📦 PlantAdda standard packaging completed. Standard foliage moisture check passed. Bound for courier dispatch."}
                      {orderObj.status === "dispatched" && "🚚 Dispatch agent departed. Tracking local delivery route. Ensure somebody is available to collect."}
                      {orderObj.status === "delivered" && "💚 Sapling successfully delivered under brand assurance! Check green welfare within 24 hours."}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h4 className="font-semibold text-slate-800">Recipients details:</h4>
                    <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-slate-600 font-mono text-[11px]">
                      <p>Name: {orderObj.customerName}</p>
                      <p>Address: {orderObj.customerAddress}</p>
                      <p>Charge Total: ₹{orderObj.total}</p>
                    </div>
                  </div>

                  {/* 24 hour Replace alert */}
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-xl flex gap-2 text-[10px] items-start border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold leading-none">24-Hour Return Guarantee:</p>
                      <p className="mt-1 leading-normal">
                        Valid strictly for 24 hours starting delivery confirmation. If soil compaction or root stress perishes foliage, apply for compensation claiming portal.
                      </p>
                    </div>
                  </div>

                </div>
              );
            })()}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setTrackingOrderId(null)}
                className="bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl text-xs hover:bg-black transition-colors"
              >
                Dismiss Map Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 24 HOUR GUARANTEE CLAIM MODAL PORTAL */}
      {returningOrder && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" /> 100% Replacement Portal
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Order Invoice ID: {returningOrder.id}</p>
              </div>
              <button 
                onClick={() => setReturningOrder(null)} 
                className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {returnSuccessMessage ? (
              <div className="bg-emerald-50 p-4 rounded-xl text-xs text-emerald-800 space-y-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-700 animate-pulse" />
                <p className="font-bold">{returnSuccessMessage}</p>
                <button
                  onClick={() => setReturningOrder(null)}
                  className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Close Refund Tool
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  Every plant sold contains our **100% replacement/refund guarantee** should it die within 24 hours of delivery. Customer must submit photographic proof.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">Foliage / Root Issue Explanation</label>
                    <textarea
                      required
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Explain details: e.g. Sapling root arrived dry or stems broke entirely during local transit delivery..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none h-20 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 block">Dead Plant Photographic Proof</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReturnFileChange}
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 pointer-events-auto cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setReturningOrder(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-xs"
                  >
                    Cancel Claim
                  </button>
                  <button
                    onClick={submitReturnRequest}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Submit Photo Proof to Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-900 py-12 px-4 md:px-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="font-display font-bold text-base text-white">PlantAdda Unified Ecosystem</h4>
            <p className="text-emerald-300 leading-relaxed text-[11px]">
              Fostering localized organic nursery growth. Handpicking finest flower roots, fruit saplings, trees, and gardening tools for immediate delivery.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-3">Guarantee Assurance</h4>
            <ul className="space-y-2 text-emerald-300 text-[11px]">
              <li>&bull; 24h Dead Plant Replacements</li>
              <li>&bull; Strict Photographic Proof Verification</li>
              <li>&bull; Automated UPI Credit Refunds</li>
              <li>&bull; Unified Branding Layer Only</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-3">Service Coverage</h4>
            <ul className="space-y-2 text-emerald-300 text-[11px]">
              <li>&bull; Professional Lawn Aeration</li>
              <li>&bull; Weekly Irrigation Visits</li>
              <li>&bull; Premium Vermicompost Topdressing</li>
              <li>&bull; Certified Botanical Experts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-3">Developer Operations</h4>
            <p className="text-emerald-300 leading-normal text-[11px]">
              Standardized e-commerce mockups integrated directly with secure server APIs. Developed securely on Cloud Run containers.
            </p>
            <p className="text-emerald-455 font-mono text-[10px] mt-2">&bull; Version 1.0.4-Latest</p>
          </div>
        </div>
      </footer>

      {/* 10-Minute Blinkit-style Bottom Floating Cart Bar */}
      {currentUser.role === "customer" && cart.length > 0 && (
        <div 
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-emerald-700 hover:bg-emerald-850 text-white rounded-2xl py-3 px-4.5 flex items-center justify-between shadow-2xl z-40 cursor-pointer border border-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all select-none"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-900 text-white p-2.5 rounded-xl text-xs font-black relative shrink-0 border border-emerald-700">
              <ShoppingBag className="w-4 h-4 text-[#00FF00]" />
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-900 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div>
              <p className="text-xs font-black tracking-wide">{cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'Item' : 'Items'} Added</p>
              <p className="text-[10px] text-emerald-100 font-bold">₹{Math.round(subtotal)} • Delivering in 10 mins 🛵</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 font-extrabold text-xs bg-emerald-900 px-3.5 py-2 rounded-xl border border-emerald-700 hover:bg-emerald-950">
            <span>View Cart</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      </div> {/* Dynamic Device Frame Envelope Container */}
    </div>
  );
}
