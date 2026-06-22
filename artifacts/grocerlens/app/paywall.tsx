import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "₹99",
    period: "/month",
    annualEquiv: null,
    highlight: false,
    productId: "grocerlens_premium_monthly",
  },
  {
    id: "annual",
    label: "Annual",
    price: "₹799",
    period: "/year",
    annualEquiv: "₹66.58/month",
    highlight: true,
    badge: "Best value · Save 33%",
    productId: "grocerlens_premium_annual",
  },
];

const FEATURES_FREE = [
  "4 AI receipt scans/month",
  "4 AI insight refreshes/month",
  "Household sharing",
  "Category breakdown",
  "WhatsApp summary sharing",
];

const FEATURES_PREMIUM = [
  "Unlimited AI receipt scans",
  "Unlimited AI insights",
  "Priority processing",
  "Export spending data (CSV)",
  "Early access to new features",
  "Everything in Free",
];

export default function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<string>("annual");
  const [loading, setLoading] = useState(false);

  const topInset = Platform.OS === "web" ? 20 : insets.top;

  async function handlePurchase(planId: string) {
    setLoading(true);
    try {
      Alert.alert(
        "Coming soon",
        "In-app purchases will be available once the app is published on the App Store and Google Play.\n\nFor now, contact us at support@grocerlens.app to set up early access.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    Alert.alert(
      "Restore purchase",
      "This will be available once the app is published on the App Store and Google Play.",
      [{ text: "OK" }]
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#15803d", paddingTop: topInset + 16 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles" size={32} color="#fbbf24" />
        </View>
        <Text style={styles.headerTitle}>GrocerLens Premium</Text>
        <Text style={styles.headerSub}>
          Unlimited AI receipt scanning and personalised spending insights
        </Text>
      </View>

      {/* Limit hit callout */}
      <View style={[styles.callout, { backgroundColor: "#fef2f2", borderColor: "#fca5a5" }]}>
        <Ionicons name="lock-closed-outline" size={16} color="#dc2626" />
        <Text style={styles.calloutText}>
          You've reached your free monthly limit. Upgrade to continue using AI features.
        </Text>
      </View>

      {/* Plan selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose a plan</Text>
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: isSelected ? "#dcfce7" : colors.card,
                  borderColor: isSelected ? "#15803d" : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.85}
            >
              {plan.badge && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}
              <View style={styles.planRow}>
                <View
                  style={[
                    styles.planRadio,
                    { borderColor: isSelected ? "#15803d" : colors.border },
                  ]}
                >
                  {isSelected && <View style={styles.planRadioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planLabel, { color: colors.foreground }]}>{plan.label}</Text>
                  {plan.annualEquiv && (
                    <Text style={[styles.planSub, { color: colors.mutedForeground }]}>
                      {plan.annualEquiv}
                    </Text>
                  )}
                </View>
                <View style={styles.planPriceWrap}>
                  <Text style={[styles.planPrice, { color: "#15803d" }]}>{plan.price}</Text>
                  <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>
                    {plan.period}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.ctaBtn, { opacity: loading ? 0.7 : 1 }]}
        onPress={() => handlePurchase(selectedPlan)}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={18} color="#ffffff" />
        <Text style={styles.ctaText}>
          {loading
            ? "Processing…"
            : `Get Premium · ${PLANS.find((p) => p.id === selectedPlan)?.price}${PLANS.find((p) => p.id === selectedPlan)?.period}`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
        <Text style={[styles.restoreText, { color: colors.mutedForeground }]}>
          Restore purchase
        </Text>
      </TouchableOpacity>

      {/* Feature comparison */}
      <View style={styles.section}>
        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.featureHeader}>
            <Text style={[styles.featureCol, { color: colors.mutedForeground }]}>Feature</Text>
            <Text style={[styles.featureColRight, { color: colors.mutedForeground }]}>Free</Text>
            <Text style={[styles.featureColRight, { color: "#15803d" }]}>Premium</Text>
          </View>
          {[
            { label: "AI receipt scans", free: "4/mo", premium: "Unlimited" },
            { label: "AI insights refresh", free: "4/mo", premium: "Unlimited" },
            { label: "Household sharing", free: "✓", premium: "✓" },
            { label: "Category breakdown", free: "✓", premium: "✓" },
            { label: "CSV export", free: "—", premium: "✓" },
            { label: "Priority processing", free: "—", premium: "✓" },
          ].map((row, i) => (
            <View
              key={i}
              style={[
                styles.featureRow,
                i % 2 === 1 && { backgroundColor: colors.secondary },
              ]}
            >
              <Text style={[styles.featureCol, { color: colors.foreground }]}>{row.label}</Text>
              <Text style={[styles.featureColRight, { color: colors.mutedForeground }]}>
                {row.free}
              </Text>
              <Text
                style={[
                  styles.featureColRight,
                  { color: row.premium === "—" ? colors.mutedForeground : "#15803d", fontFamily: "Inter_600SemiBold" },
                ]}
              >
                {row.premium}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[styles.fine, { color: colors.mutedForeground }]}>
        Subscriptions auto-renew. Cancel anytime. Prices shown in INR.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: "center",
    gap: 10,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  headerSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  callout: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  calloutText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#dc2626",
    flex: 1,
    lineHeight: 18,
  },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  planCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    overflow: "hidden",
  },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#15803d",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  planBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  planRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  planRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#15803d",
  },
  planLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  planSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  planPriceWrap: { alignItems: "flex-end" },
  planPrice: { fontSize: 20, fontFamily: "Inter_700Bold" },
  planPeriod: { fontSize: 12, fontFamily: "Inter_400Regular" },
  ctaBtn: {
    marginHorizontal: 16,
    backgroundColor: "#15803d",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  restoreBtn: { alignItems: "center", marginBottom: 24 },
  restoreText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  featureCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  featureHeader: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  featureRow: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10 },
  featureCol: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  featureColRight: { width: 72, textAlign: "center", fontSize: 13, fontFamily: "Inter_400Regular" },
  fine: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
});
