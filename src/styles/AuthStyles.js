// styles/AuthStyles.ts
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const AuthStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1f36",
  },

  // Background Section
  backgroundGradient: {
    flex: 1,
    position: "relative",
  },

  floatingElement1: {
    position: "absolute",
    top: "15%",
    right: "10%",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    opacity: 0.6,
  },

  floatingElement2: {
    position: "absolute",
    top: "25%",
    left: "15%",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(118, 75, 162, 0.15)",
    opacity: 0.4,
  },

  floatingElement3: {
    position: "absolute",
    top: "35%",
    right: "25%",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(240, 147, 251, 0.1)",
    opacity: 0.5,
  },

  // Header Section
  headerSection: {
    alignItems: "center",
    paddingTop: height * 0.1,
    paddingHorizontal: 32,
    flex: 0.6,
    justifyContent: "center",
  },

  logoWrapper: {
    marginBottom: 24,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },

  logoEmoji: {
    fontSize: 48,
  },

  brandTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  brandSubtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: 0.5,
  },

  // Login Card (Bottom Sheet Style)
  loginCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: height * 0.65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },

  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  loginContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Form Header
  formHeader: {
    alignItems: "center",
    marginBottom: 40,
  },

  welcomeText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  loginSubtext: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 24,
  },

  // Form Fields
  formFields: {
    marginBottom: 32,
    gap: 20,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fafc",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#e2e8f0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    transition: "all 0.3s ease",
  },

  inputWrapperFocused: {
    borderColor: "#667eea",
    backgroundColor: "#ffffff",
    shadowColor: "#667eea",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },

  inputIconBox: {
    paddingLeft: 24,
    paddingRight: 16,
    paddingVertical: 20,
  },

  textInput: {
    flex: 1,
    fontSize: 17,
    color: "#1a202c",
    paddingVertical: 20,
    fontWeight: "500",
  },

  passwordToggle: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  // Login Button
  loginButton: {
    marginBottom: 32,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },

  loginButtonGradient: {
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  loginButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  loadingContainer: {
    flexDirection: "row",
    gap: 8,
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },

  // Footer Links
  footerLinks: {
    alignItems: "center",
    gap: 20,
  },

  forgotLink: {
    paddingVertical: 8,
  },

  forgotText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  signupPrompt: {
    flexDirection: "row",
    alignItems: "center",
  },

  noAccountText: {
    color: "#718096",
    fontSize: 16,
    fontWeight: "400",
  },

  signupLink: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  // Success Bottom Sheet
  successSheetBackground: {
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },

  successSheetHandle: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  successContent: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  successIcon: {
    marginBottom: 24,
    shadowColor: "#38a169",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a202c",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },

  successMessage: {
    fontSize: 17,
    color: "#4a5568",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
    fontWeight: "400",
    paddingHorizontal: 16,
  },

  continueButton: {
    width: "100%",
    shadowColor: "#38a169",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  continueButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  continueButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Back Button
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // Register Card (Taller than login)
  registerCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: height * 0.75,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },

  // Forgot Password Card (Smaller than login)
  forgotCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: height * 0.55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },

  // Help Section (for forgot password)
  helpSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fafc",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  helpIcon: {
    marginRight: 12,
  },

  helpText: {
    flex: 1,
    fontSize: 14,
    color: "#718096",
    lineHeight: 20,
    fontWeight: "400",
  },

  // Enhanced forgot link for forgot password screen
  forgotLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
});

export default AuthStyles;
