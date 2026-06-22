import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FamilyMemberCard } from "@/components/FamilyMemberCard";
import { useExpenses } from "@/context/ExpenseContext";
import { useColors } from "@/hooks/useColors";
import { useCurrency } from "@/hooks/useCurrency";

export default function FamilyScreen() {
  const colors = useColors();
  const currency = useCurrency();
  const insets = useSafeAreaInsets();
  const { familyMembers, bills, addFamilyMember, removeFamilyMember } = useExpenses();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const totalSpend = bills.reduce((s, b) => s + b.total, 0);
  const perPersonShare = familyMembers.length > 0 ? totalSpend / familyMembers.length : 0;

  async function handleAdd() {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const initials = name.trim().split(" ").map((p) => p[0].toUpperCase()).join("").slice(0, 2);
    await addFamilyMember({
      name: name.trim(),
      initials,
      email: email.trim() || undefined,
      color: "#22c55e",
    });
    setName("");
    setEmail("");
    setAdding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleRemove(id: string, memberName: string) {
    Alert.alert(
      "Remove member",
      `Remove ${memberName} from your household?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeFamilyMember(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background, flex: 1 }}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.primary, paddingTop: topInset + 16 },
        ]}
      >
        <Text style={styles.headerTitle}>Household</Text>
        <Text style={styles.headerSub}>
          {familyMembers.length} member{familyMembers.length !== 1 ? "s" : ""} ·{" "}
          {currency.format(perPersonShare)} each this month
        </Text>
      </View>

      {/* Members list */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Members</Text>
        <TouchableOpacity onPress={() => setAdding(true)}>
          <Ionicons name="person-add-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {familyMembers.map((m) => (
        <FamilyMemberCard
          key={m.id}
          member={m}
          totalShare={perPersonShare}
          billCount={bills.length}
          onRemove={m.isOwner ? undefined : () => handleRemove(m.id, m.name)}
        />
      ))}

      {/* Add member form */}
      {adding && (
        <View
          style={[
            styles.addForm,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.formTitle, { color: colors.foreground }]}>Add a member</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondary,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            placeholder="Full name"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondary,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
            placeholder="Email (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setAdding(false)}
            >
              <Text style={[styles.formBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.formBtn,
                { backgroundColor: name.trim() ? colors.primary : colors.muted },
              ]}
              onPress={handleAdd}
              disabled={!name.trim()}
            >
              <Text style={[styles.formBtnText, { color: "#ffffff" }]}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!adding && (
        <TouchableOpacity
          style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setAdding(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.addIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="person-add-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.inviteText}>
            <Text style={[styles.inviteTitle, { color: colors.foreground }]}>
              Add a flatmate or family member
            </Text>
            <Text style={[styles.inviteDesc, { color: colors.mutedForeground }]}>
              Split expenses and track shared grocery spend
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}

      {/* Stats */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Household stats</Text>
      </View>
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: "Total spend", value: currency.format(totalSpend) },
          { label: "Bills tracked", value: String(bills.length) },
          { label: "Per person", value: currency.format(perPersonShare) },
        ].map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 4,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  addForm: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  formTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  formButtons: {
    flexDirection: "row",
    gap: 10,
  },
  formBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  formBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  inviteCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteText: {
    flex: 1,
    gap: 2,
  },
  inviteTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  inviteDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statsCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  divider: {
    width: 1,
  },
});
