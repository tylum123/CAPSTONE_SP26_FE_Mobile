import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING } from "../constants/theme";
import { workerProfileService } from "../services";

export function OnboardingProfileScreen({ navigation }: any) {
  const [fullName, setFullName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [travelRadiusKmPreference, setTravelRadiusKmPreference] = useState("");
  const [experienceLevelId, setExperienceLevelId] = useState("");
  const [availabilitySchedule, setAvailabilitySchedule] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (
      !fullName ||
      !ageRange ||
      !primaryLocation ||
      !experienceLevelId ||
      !availabilitySchedule
    ) {
      Alert.alert("Loi", "Vui long nhap day du thong tin bat buoc");
      return;
    }

    const parsedExperienceLevelId = Number(experienceLevelId);
    if (
      Number.isNaN(parsedExperienceLevelId) ||
      parsedExperienceLevelId < 1 ||
      parsedExperienceLevelId > 3
    ) {
      Alert.alert("Loi", "ExperienceLevelId phai la so tu 1 den 3");
      return;
    }

    setLoading(true);
    try {
      await workerProfileService.updateProfile({
        fullName,
        ageRange,
        primaryLocation,
        travelRadiusKmPreference: travelRadiusKmPreference
          ? Number(travelRadiusKmPreference)
          : undefined,
        experienceLevelId: parsedExperienceLevelId,
        availabilitySchedule,
        avatarUrl: avatarUrl || "",
      });
      navigation.replace("Worker");
    } catch {
      Alert.alert("Loi", "Khong the tao ho so. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Tao ho so lao dong</Text>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <TextInput
            style={styles.input}
            placeholder="Ho va ten"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Do tuoi (vd: 18-25)"
            value={ageRange}
            onChangeText={setAgeRange}
          />
          <TextInput
            style={styles.input}
            placeholder="Khu vuc chinh"
            value={primaryLocation}
            onChangeText={setPrimaryLocation}
          />
          <TextInput
            style={styles.input}
            placeholder="Ban kinh di chuyen (km)"
            value={travelRadiusKmPreference}
            onChangeText={setTravelRadiusKmPreference}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="ExperienceLevelId"
            value={experienceLevelId}
            onChangeText={setExperienceLevelId}
          />
          <TextInput
            style={styles.input}
            placeholder="Lich lam viec (vd: T2-T7)"
            value={availabilitySchedule}
            onChangeText={setAvailabilitySchedule}
          />
          <TextInput
            style={styles.input}
            placeholder="Avatar URL (tuy chon)"
            value={avatarUrl}
            onChangeText={setAvatarUrl}
          />
        </ScrollView>
        <Button onPress={handleContinue} loading={loading}>
          Tiep tuc
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.gray[900],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    gap: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.gray[900],
  },
});
