import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

export type CaptureMethod = "sms" | "share" | "email" | "camera" | "manual";

export interface BillItem {
  id: string;
  name: string;
  qty: string;
  price: number;
  category: string;
}

export interface Bill {
  id: string;
  store: string;
  date: string;
  total: number;
  items: BillItem[];
  captureMethod: CaptureMethod;
  receiptUrl?: string;
  imageUri?: string;
  addedAt: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  initials: string;
  email?: string;
  phone?: string;
  color: string;
  isOwner?: boolean;
}

interface ExpenseContextType {
  bills: Bill[];
  familyMembers: FamilyMember[];
  smsMonitoringEnabled: boolean;
  emailAddress: string;
  isLoading: boolean;
  addBill: (bill: Omit<Bill, "id" | "addedAt">) => Promise<void>;
  removeBill: (id: string) => Promise<void>;
  addFamilyMember: (member: Omit<FamilyMember, "id">) => Promise<void>;
  removeFamilyMember: (id: string) => Promise<void>;
  setSmsMonitoringEnabled: (enabled: boolean) => Promise<void>;
  totalThisMonth: number;
  totalLastMonth: number;
  categoryTotals: Record<string, number>;
  billsByMethod: Record<CaptureMethod, number>;
}

const MEMBER_COLORS = [
  "#15803d",
  "#22c55e",
  "#4ade80",
  "#0284c7",
  "#9333ea",
  "#f59e0b",
];

const SAMPLE_BILLS: Bill[] = [
  {
    id: "sample-1",
    store: "Whole Foods",
    date: "2026-06-22",
    total: 84.3,
    captureMethod: "sms",
    addedAt: Date.now() - 1000 * 60 * 60 * 2,
    items: [
      { id: "i1", name: "Organic Chicken Breast", qty: "2 lbs", price: 14.98, category: "Meat" },
      { id: "i2", name: "Baby Spinach", qty: "5 oz", price: 3.49, category: "Produce" },
      { id: "i3", name: "Almond Milk", qty: "1 gal", price: 4.99, category: "Dairy" },
      { id: "i4", name: "Greek Yogurt 4pk", qty: "1 pack", price: 6.99, category: "Dairy" },
      { id: "i5", name: "Blueberries", qty: "1 pint", price: 4.99, category: "Produce" },
      { id: "i6", name: "Brown Rice", qty: "2 lbs", price: 3.79, category: "Grains" },
      { id: "i7", name: "Protein Bars 6pk", qty: "1 box", price: 12.99, category: "Snacks" },
      { id: "i8", name: "Olive Oil", qty: "500ml", price: 8.49, category: "Pantry" },
      { id: "i9", name: "Sourdough Bread", qty: "1 loaf", price: 4.99, category: "Bakery" },
      { id: "i10", name: "Free Range Eggs", qty: "12pk", price: 5.99, category: "Dairy" },
      { id: "i11", name: "Lemons", qty: "3 pack", price: 2.49, category: "Produce" },
      { id: "i12", name: "Garlic", qty: "1 head", price: 0.99, category: "Produce" },
      { id: "i13", name: "Cherry Tomatoes", qty: "1 pint", price: 3.49, category: "Produce" },
      { id: "i14", name: "Tax", qty: "", price: 4.65, category: "Tax" },
    ],
  },
  {
    id: "sample-2",
    store: "Trader Joe's",
    date: "2026-06-21",
    total: 47.6,
    captureMethod: "email",
    addedAt: Date.now() - 1000 * 60 * 60 * 26,
    items: [
      { id: "j1", name: "Cauliflower Gnocchi", qty: "2 bags", price: 7.98, category: "Frozen" },
      { id: "j2", name: "Mandarin Oranges", qty: "3 lbs", price: 3.99, category: "Produce" },
      { id: "j3", name: "Brie Cheese", qty: "8 oz", price: 5.49, category: "Dairy" },
      { id: "j4", name: "Cold Brew Coffee", qty: "32oz", price: 4.99, category: "Drinks" },
      { id: "j5", name: "Dark Chocolate", qty: "3.5oz", price: 1.99, category: "Snacks" },
      { id: "j6", name: "Quinoa", qty: "1 lb", price: 3.99, category: "Grains" },
      { id: "j7", name: "Avocados 6pk", qty: "1 bag", price: 5.99, category: "Produce" },
      { id: "j8", name: "Coconut Water 6pk", qty: "1 pack", price: 6.99, category: "Drinks" },
      { id: "j9", name: "Tax", qty: "", price: 2.19, category: "Tax" },
    ],
  },
  {
    id: "sample-3",
    store: "Costco",
    date: "2026-06-20",
    total: 132.45,
    captureMethod: "camera",
    addedAt: Date.now() - 1000 * 60 * 60 * 50,
    items: [
      { id: "k1", name: "Chicken Thighs", qty: "10 lbs", price: 24.99, category: "Meat" },
      { id: "k2", name: "Salmon Fillets", qty: "3 lbs", price: 29.99, category: "Seafood" },
      { id: "k3", name: "Mixed Greens", qty: "1.5 lbs", price: 7.99, category: "Produce" },
      { id: "k4", name: "Greek Yogurt 24pk", qty: "1 case", price: 18.99, category: "Dairy" },
      { id: "k5", name: "Almond Butter", qty: "2 jars", price: 14.99, category: "Pantry" },
      { id: "k6", name: "Sparkling Water 48pk", qty: "1 case", price: 19.99, category: "Drinks" },
      { id: "k7", name: "Tax", qty: "", price: 15.51, category: "Tax" },
    ],
  },
  {
    id: "sample-4",
    store: "Aldi",
    date: "2026-06-18",
    total: 38.9,
    captureMethod: "sms",
    addedAt: Date.now() - 1000 * 60 * 60 * 76,
    items: [
      { id: "l1", name: "Pasta", qty: "2 lbs", price: 2.98, category: "Pantry" },
      { id: "l2", name: "Canned Tomatoes 4pk", qty: "4 cans", price: 3.96, category: "Pantry" },
      { id: "l3", name: "Whole Milk", qty: "1 gal", price: 3.49, category: "Dairy" },
      { id: "l4", name: "Bananas", qty: "1 bunch", price: 1.19, category: "Produce" },
      { id: "l5", name: "Apples Gala 3lb", qty: "1 bag", price: 2.89, category: "Produce" },
      { id: "l6", name: "Sliced Turkey", qty: "9 oz", price: 2.99, category: "Deli" },
      { id: "l7", name: "Sharp Cheddar", qty: "16 oz", price: 4.29, category: "Dairy" },
      { id: "l8", name: "Bread Wheat", qty: "1 loaf", price: 2.29, category: "Bakery" },
      { id: "l9", name: "Frozen Peas", qty: "2 lbs", price: 2.29, category: "Frozen" },
      { id: "l10", name: "Orange Juice", qty: "52oz", price: 3.49, category: "Drinks" },
      { id: "l11", name: "Butter", qty: "1 lb", price: 3.79, category: "Dairy" },
      { id: "l12", name: "Tax", qty: "", price: 3.25, category: "Tax" },
    ],
  },
  {
    id: "sample-5",
    store: "Walmart",
    date: "2026-06-15",
    total: 56.2,
    captureMethod: "share",
    addedAt: Date.now() - 1000 * 60 * 60 * 120,
    items: [
      { id: "m1", name: "Chicken Wings", qty: "4 lbs", price: 12.96, category: "Meat" },
      { id: "m2", name: "Rice Jasmine 5lb", qty: "1 bag", price: 5.97, category: "Grains" },
      { id: "m3", name: "Frozen Broccoli 4pk", qty: "4 bags", price: 5.96, category: "Frozen" },
      { id: "m4", name: "Black Beans 4pk", qty: "4 cans", price: 4.96, category: "Pantry" },
      { id: "m5", name: "Soy Sauce", qty: "10oz", price: 2.98, category: "Pantry" },
      { id: "m6", name: "Sriracha", qty: "17oz", price: 3.98, category: "Pantry" },
      { id: "m7", name: "Tortillas 30pk", qty: "1 pack", price: 4.97, category: "Bakery" },
      { id: "m8", name: "Shredded Cheese", qty: "16 oz", price: 4.98, category: "Dairy" },
      { id: "m9", name: "Tax", qty: "", price: 4.44, category: "Tax" },
    ],
  },
];

const SAMPLE_MEMBERS: FamilyMember[] = [
  { id: "me", name: "You", initials: "ME", color: "#15803d", isOwner: true },
  { id: "m2", name: "Jamie", initials: "JT", color: "#22c55e" },
];

const STORAGE_KEYS = {
  BILLS: "@grocerlens/bills",
  MEMBERS: "@grocerlens/members",
  SMS_ENABLED: "@grocerlens/sms_enabled",
  EMAIL_ADDRESS: "@grocerlens/email_address",
  SEEDED: "@grocerlens/seeded",
};

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateEmailAddress(): string {
  const suffix = Math.random().toString(36).substr(2, 8);
  return `gl-${suffix}@bills.grocerlens.app`;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [smsMonitoringEnabled, setSmsMonitoringState] = useState(
    Platform.OS === "android"
  );
  const [emailAddress, setEmailAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [
          billsRaw,
          membersRaw,
          smsRaw,
          emailRaw,
          seededRaw,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.BILLS),
          AsyncStorage.getItem(STORAGE_KEYS.MEMBERS),
          AsyncStorage.getItem(STORAGE_KEYS.SMS_ENABLED),
          AsyncStorage.getItem(STORAGE_KEYS.EMAIL_ADDRESS),
          AsyncStorage.getItem(STORAGE_KEYS.SEEDED),
        ]);

        const isSeeded = seededRaw === "true";

        const storedBills: Bill[] = billsRaw ? JSON.parse(billsRaw) : [];
        const storedMembers: FamilyMember[] = membersRaw
          ? JSON.parse(membersRaw)
          : [];

        if (!isSeeded) {
          await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(SAMPLE_BILLS));
          await AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(SAMPLE_MEMBERS));
          await AsyncStorage.setItem(STORAGE_KEYS.SEEDED, "true");
          setBills(SAMPLE_BILLS);
          setFamilyMembers(SAMPLE_MEMBERS);
        } else {
          setBills(storedBills);
          setFamilyMembers(storedMembers);
        }

        if (smsRaw !== null) {
          setSmsMonitoringState(smsRaw === "true");
        }

        if (emailRaw) {
          setEmailAddress(emailRaw);
        } else {
          const newEmail = generateEmailAddress();
          await AsyncStorage.setItem(STORAGE_KEYS.EMAIL_ADDRESS, newEmail);
          setEmailAddress(newEmail);
        }
      } catch {
        setBills(SAMPLE_BILLS);
        setFamilyMembers(SAMPLE_MEMBERS);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const addBill = useCallback(async (bill: Omit<Bill, "id" | "addedAt">) => {
    const newBill: Bill = { ...bill, id: generateId(), addedAt: Date.now() };
    setBills((prev) => {
      const updated = [newBill, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeBill = useCallback(async (id: string) => {
    setBills((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addFamilyMember = useCallback(async (member: Omit<FamilyMember, "id">) => {
    const newMember: FamilyMember = {
      ...member,
      id: generateId(),
      color: MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)],
    };
    setFamilyMembers((prev) => {
      const updated = [...prev, newMember];
      AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFamilyMember = useCallback(async (id: string) => {
    setFamilyMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setSmsMonitoringEnabled = useCallback(async (enabled: boolean) => {
    setSmsMonitoringState(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.SMS_ENABLED, String(enabled));
  }, []);

  const now = new Date();
  const thisMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthYear = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;

  const totalThisMonth = useMemo(
    () =>
      bills
        .filter((b) => b.date.startsWith(thisMonthYear))
        .reduce((sum, b) => sum + b.total, 0),
    [bills, thisMonthYear]
  );

  const totalLastMonth = useMemo(
    () =>
      bills
        .filter((b) => b.date.startsWith(lastMonthYear))
        .reduce((sum, b) => sum + b.total, 0),
    [bills, lastMonthYear]
  );

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    bills
      .filter((b) => b.date.startsWith(thisMonthYear))
      .forEach((b) => {
        b.items
          .filter((i) => i.category !== "Tax")
          .forEach((item) => {
            totals[item.category] = (totals[item.category] ?? 0) + item.price;
          });
      });
    return totals;
  }, [bills, thisMonthYear]);

  const billsByMethod = useMemo(() => {
    const counts: Record<CaptureMethod, number> = {
      sms: 0,
      share: 0,
      email: 0,
      camera: 0,
      manual: 0,
    };
    bills.forEach((b) => {
      counts[b.captureMethod] = (counts[b.captureMethod] ?? 0) + 1;
    });
    return counts;
  }, [bills]);

  return (
    <ExpenseContext.Provider
      value={{
        bills,
        familyMembers,
        smsMonitoringEnabled,
        emailAddress,
        isLoading,
        addBill,
        removeBill,
        addFamilyMember,
        removeFamilyMember,
        setSmsMonitoringEnabled,
        totalThisMonth,
        totalLastMonth,
        categoryTotals,
        billsByMethod,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpenseProvider");
  return ctx;
}
