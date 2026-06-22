import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SummaryCardProps {
  totalThisMonth: number;
  totalLastMonth: number;
  budget?: number;
}

export function SummaryCard({
  totalThisMonth,
  totalLastMonth,
  budget = 400,
}: SummaryCardProps) {
  const colors = useColors();
  const pct = Math.min((totalThisMonth / budget) * 100, 100);
  const diff = totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;
  const isUp = diff > 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <Text style={styles.label}>This month</Text>
      <View style={styles.amountRow}>
        <Text style={styles.currency}>$</Text>
        <Text style={styles.amount}>
          {Math.floor(totalThisMonth).toLocaleString()}
        </Text>
        <Text style={styles.cents}>
          .{String(Math.round((totalThisMonth % 1) * 100)).padStart(2, "0")}
        </Text>
      </View>
      {totalLastMonth > 0 && (
        <View style={styles.diffRow}>
          <Text style={[styles.diffText, { color: isUp ? "#fca5a5" : "#86efac" }]}>
            {isUp ? "↑" : "↓"} {Math.abs(diff).toFixed(1)}% vs last month
          </Text>
        </View>
      )}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>
      <View style={styles.budgetRow}>
        <Text style={styles.budgetText}>${totalThisMonth.toFixed(0)} spent</Text>
        <Text style={styles.budgetText}>${budget} budget</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
  },
  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  currency: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  amount: {
    color: "#ffffff",
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    lineHeight: 52,
  },
  cents: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  diffRow: {
    marginTop: 4,
  },
  diffText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  budgetText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
