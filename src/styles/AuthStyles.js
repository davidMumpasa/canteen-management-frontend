// styles/AuthStyles.ts
import { StyleSheet } from "react-native";

const AuthStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  authContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#667eea",
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 15,
  },
  linkButtonText: {
    color: "#667eea",
    fontSize: 16,
  },
  authFooter: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  authFooterText: {
    color: "#666",
  },
  linkText: {
    color: "#667eea",
    fontWeight: "bold",
  },
  // ... you can continue to add other styles if needed
});

export default AuthStyles;
