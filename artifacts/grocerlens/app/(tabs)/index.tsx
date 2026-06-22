import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BillCard } from "@/components/BillCard";
import { CategoryBar } from "@/components/CategoryBar";
import { SummaryCard } from "@/components/SummaryCard";
import { useExpenses } from "@/context/ExpenseContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bills, familyMembers, totalThisMonth, totalLastMonth, categoryTotals, isLoading } =
    useExpenses();

  const recentBills = bills.slice(0, 3);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
            paddingTop: topInset + 16,
          },
        ]}
      >
        <View>
          <Text style={styles.headerSub}>June 2026</Text>
          <Text style={styles.headerTitle}>GrocerLens</Text>
        </View>
        <View style={styles.avatarRow}>
          {familyMembers.slice(0, 3).map((m, i) => (
            <View
              key={m.id}
              style={[
                styles.avatar,
                {
                  backgroundColor: m.color,
                  marginLeft: i === 0 ? 0 : -10,
                  zIndex: 10 - i,
                },
              ]}
            >
              <Text style={styles.avatarText}>{m.initials}</Text>
            </View>
          ))}
          {familyMembers.length < 4 && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/family")}
              style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)", marginLeft: -10 }]}
            >
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary card */}
      <View style={{ marginTop: -1, backgroundColor: colors.primary, paddingBottom: 24 }}>
        <SummaryCard
          totalThisMonth={totalThisMonth}
          totalLastMonth={totalLastMonth}
        />
      </View>

      {/* Period selector */}
      <View style={[styles.periodRow, { backgroundColor: colors.background }]}>
        {(["Day", "Week", "Month", "Year"] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodBtn,
              p === "Month"
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.secondary },
            ]}
          >
            <Text
              style={[
                styles.periodText,
                { color: p === "Month" ? colors.primaryForeground : colors.secondaryForeground },
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <CategoryBar categoryTotals={categoryTotals} />
      )}

      {/* Recent bills */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent bills</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/bills")}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>

      {recentBills.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.secondary }]}>
          <Ionicons name="receipt-outline" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No bills yet — add your first receipt
          </Text>
        </View>
      ) : (
        recentBills.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            onPress={() => router.push(`/bill/${bill.id}`)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerSub: {
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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  periodText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
