import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from "react-native";
import { getSupabaseClient } from "@malpeos/shared";
import { Screen } from "@/components/ui/Screen";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { theme } from "@/theme";
import { useBoats } from "@/hooks/useBoats";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Boat } from "@malpeos/shared";

async function createBoat(data: { name: string; registration: string; engine_details?: string }) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("boats").insert(data);
  if (error) throw error;
}

export default function FleetScreen() {
  const router = useRouter();
  const { data: boats, isLoading, error, refetch } = useBoats();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", registration: "", engine_details: "" });

  const createMutation = useMutation({
    mutationFn: createBoat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boats"] });
      setModalOpen(false);
      setForm({ name: "", registration: "", engine_details: "" });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message);
    },
  });

  const renderBoat = ({ item }: { item: Boat }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/fleet/${item.id}`)}
    >
      <Card size="sm">
        <View style={styles.boatRow}>
          <View style={styles.boatInfo}>
            <Text style={styles.boatName}>{item.name}</Text>
            <View style={styles.boatMeta}>
              <Badge variant="outline">{item.registration}</Badge>
              {item.engine_details && (
                <Text style={styles.engineText}>{item.engine_details}</Text>
              )}
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Screen onRefresh={refetch} refreshing={isLoading}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Fleet</Text>
          <Text style={styles.headerSubtitle}>Manage your fishing boats</Text>
        </View>
        <Button onPress={() => setModalOpen(true)}>Add Boat</Button>
      </View>

      {error ? (
        <EmptyState title="Failed to load boats" message="Pull down to retry" />
      ) : boats && boats.length > 0 ? (
        <FlatList
          data={boats}
          renderItem={renderBoat}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      ) : !isLoading ? (
        <EmptyState
          title="No boats registered"
          message="Add your first boat to get started."
          actionLabel="Add Boat"
          onAction={() => setModalOpen(true)}
        />
      ) : null}

      {/* Add Boat Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <CardHeader>
              <CardTitle>Add Boat</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.formFields}>
                <Input
                  label="Boat Name *"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  placeholder="e.g., Sea Queen"
                />
                <Input
                  label="Registration *"
                  value={form.registration}
                  onChangeText={(text) => setForm({ ...form, registration: text })}
                  placeholder="e.g., IND-MP-2024-001"
                />
                <Input
                  label="Engine Details"
                  value={form.engine_details}
                  onChangeText={(text) => setForm({ ...form, engine_details: text })}
                  placeholder="e.g., Leyland - 120HP"
                />
              </View>
              <View style={styles.modalActions}>
                <Button variant="outline" onPress={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    if (!form.name || !form.registration) {
                      Alert.alert("Validation", "Name and registration are required");
                      return;
                    }
                    createMutation.mutate(form);
                  }}
                  loading={createMutation.isPending}
                >
                  Add Boat
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.foreground,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  listContent: {
    gap: 4,
  },
  boatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boatInfo: {
    flex: 1,
    gap: 4,
  },
  boatName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  boatMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  engineText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.mutedForeground,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    padding: 20,
  },
  formFields: {
    gap: 12,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});