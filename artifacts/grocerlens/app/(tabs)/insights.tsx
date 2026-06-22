import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InsightCard, type Insight } from "@/components/InsightCard";
import { useExpenses } from "@/context/ExpenseContext";
import { useColors } from "@/hooks/useColors";
import { useCurrency } from "@/hooks/useCurrency";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

const DEFAULT_INSIGHTS: Insight[] = [
  {
    id: "ins-1",
    icon: "leaf-outline",
    title: "Grow your own leafy greens",
    body: "You spent significant amounts on spinach, kale, and lettuce this month. A small indoor herb kit (~25 in your currency one-time) pays for itself in 6 weeks.",
    tag: "Grow at home",
    saving: 18,
    tagColor: "#dcfce7",
    tagTextColor: "#15803d",
    cta: "See guide",
  },
  {
    id: "ins-2",
    icon: "pricetag-outline",
    title: "Switch to store-brand dairy",
    body: "Store-brand milk, yogurt, and cheese average 22% cheaper than name brands with comparable nutrition. You could save ~10 units on your monthly dairy spend.",
    tag: "Quick win",
    saving: 10,
    tagColor: "#fef9c3",
    tagTextColor: "#854d0e",
    cta: "Compare",
  },
  {
    id: "ins-3",
    icon: "cube-outline",
    title: "Bulk-buy protein and freeze",
    body: "Warehouse clubs price chicken 40–50% cheaper per kilogram. Buying in bulk and portioning for the freezer is a major saver each month.",
    tag: "Bulk buy",
    saving: 40,
    tagColor: "#ede9fe",
    tagTextColor: "#6d28d9",
    cta: "Add reminder",
  },
  {
    id: "ins-4",
    icon: "calendar-outline",
    title: "Shop mid-week for lower prices",
    body: "Produce prices are typically 10–15% lower on Tuesday–Wednesday when stores restock. Shifting your shopping day can reduce your weekly bill noticeably.",
    tag: "Timing tip",
    tagColor: "#fff7ed",
    tagTextColor: "#c2410c",
    cta: "Got it",
  },
];

export default function InsightsScreen() {
  const colors = useColors();
  const currency = useCurrency();
  const insets = useSafeAreaInsets();
  const { bills, categoryTotals, totalThisMonth } = useExpenses();
  const [insights, setInsights] = useState<Insight[]>(DEFAULT_INSIGHTS);
  const [loading, setLoading] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const totalSaving = insights.reduce((s, ins) => s + (ins.saving ?? 0), 0);

  async function loadAIInsights() {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const response = await fetch(`${API_BASE}/api/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalThisMonth,
          categoryTotals,
          billCount: bills.length,
          currencyCode: currency.currencyCode,
          locale: currency.locale,
        }),
      });
      if (!response.ok) throw new Error("Failed to load insights");
      const data = await response.json();
      if (data.insights?.length) {
        setInsights(data.insights);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert("Could not refresh", "Showing cached suggestions.");
    } finally {
      setLoading(false);
    }
  }

  const monthBars = [72, 88, 76, 95, 82, Math.min(Math.round((totalThisMonth / 300) * 100), 100)];
  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleDateString(undefined, { month: "narrow" });
  });

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.primary, paddingTop: topInset + 16 },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>AI Insights</Text>
            <Text style={styles.headerTitle}>Smart suggestions</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={loadAIInsights}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="refresh" size={18} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.summaryChip}>
          <Ionicons name="sparkles" size={18} color="#fbbf24" />
          <Text style={styles.summaryText}>
            Save up to{" "}
            <Text style={{ color: "#fbbf24", fontFamily: "Inter_700Bold" }}>
              {currency.format(totalSaving)}/mo
            </Text>{" "}
            with {insights.length} changes
          </Text>
        </View>
      </View>

      {/* Insights */}
      <View style={{ paddingTop: 16 }}>
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </View>

      {/* Monthly trend chart */}
      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>Monthly trend</Text>
        <View style={styles.chartBars}>
          {monthBars.map((h, i) => (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${h}%` as any,
                      backgroundColor: i === 5 ? colors.primary : colors.secondary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>
                {monthLabels[i]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* WhatsApp share */}
      <TouchableOpacity
        style={styles.whatsappCard}
        activeOpacity={0.8}
        onPress={() =>
          Alert.alert(
            "Share via WhatsApp",
            "Send your monthly summary to all household members on WhatsApp. This feature is coming in the next update.",
            [{ text: "Got it" }]
          )
        }
      >
        <View style={styles.whatsappIcon}>
          <Ionicons name="logo-whatsapp" size={24} color="#ffffff" />
        </View>
        <View style={styles.whatsappText}>
          <Text style={styles.whatsappTitle}>Share with household</Text>
          <Text style={styles.whatsappDesc}>
            Send this month's insights via WhatsApp to all members
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  chartCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 14,
  },
  chartBars: {
    flexDirection: "row",
    height: 80,
    gap: 8,
    alignItems: "flex-end",
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  barFill: {
    borderRadius: 4,
    width: "100%",
  },
  barLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  whatsappCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#25d366",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  whatsappIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappText: {
    flex: 1,
    gap: 3,
  },
  whatsappTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  whatsappDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
