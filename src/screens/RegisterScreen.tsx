import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
  Image,
} from "react-native";
import { Phone, Lock, Eye, EyeOff, Mail, MapPin } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export function RegisterScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!phoneNumber || !email || !address || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        address: address.trim(),
        roleId: 3,
      });

      Alert.alert("Thành công", "Đăng ký tài khoản thành công!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch {
      Alert.alert("Lỗi", "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/register.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>
              Bắt đầu hành trình tìm việc nông nghiệp
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Phone size={20} color={COLORS.gray[500]} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                placeholderTextColor={COLORS.gray[400]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Mail size={20} color={COLORS.gray[500]} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <MapPin size={20} color={COLORS.gray[500]} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ"
                placeholderTextColor={COLORS.gray[400]}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={COLORS.gray[500]} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor={COLORS.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color={COLORS.gray[500]} />
                ) : (
                  <Eye size={20} color={COLORS.gray[500]} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={COLORS.gray[500]} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={COLORS.gray[400]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={COLORS.gray[500]} />
                ) : (
                  <Eye size={20} color={COLORS.gray[500]} />
                )}
              </TouchableOpacity>
            </View>

            <Button
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            >
              Đăng ký
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md * -1,
    paddingBottom: SPACING.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  logoWrapper: {
    width: 250,
    height: 250,
    overflow: "hidden",
    marginBottom: SPACING.xs * -2,
  },
  logo: {
    width: "110%",
    height: "110%",
    marginLeft: "-5%",
    marginTop: "-5%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  form: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  registerButton: {
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  footerText: {
    color: COLORS.white,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.emerald[100],
    fontSize: 14,
    fontWeight: "700",
  },
});
