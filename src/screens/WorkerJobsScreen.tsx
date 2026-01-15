import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { COLORS, SPACING } from "../constants/theme";
import { Clock, MapPin } from "lucide-react-native";

export function WorkerJobsScreen() {
  const activeJobs = [
    {
      id: 1,
      title: "Thu hoạch lúa",
      farmer: "Nguyễn Văn A",
      location: "Cần Thơ",
      date: "20/01/2026",
      status: "active" as const,
    },
    {
      id: 2,
      title: "Chăm sóc vườn",
      farmer: "Trần Thị B",
      location: "Vĩnh Long",
      date: "22/01/2026",
      status: "pending" as const,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Công việc của tôi</Text>
      </View>

      {activeJobs.map((job) => (
        <Card key={job.id} style={styles.jobCard}>
          <CardContent>
            <View style={styles.cardHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Badge variant={job.status === "active" ? "success" : "warning"}>
                {job.status === "active" ? "Đang làm" : "Chờ xác nhận"}
              </Badge>
            </View>
            <Text style={styles.farmerName}>{job.farmer}</Text>
            <View style={styles.infoRow}>
              <MapPin size={14} color={COLORS.gray[500]} />
              <Text style={styles.infoText}>{job.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={14} color={COLORS.gray[500]} />
              <Text style={styles.infoText}>{job.date}</Text>
            </View>
          </CardContent>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.emerald[50],
  },
  header: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  jobCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  farmerName: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
});
