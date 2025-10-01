// // hooks/useAlert.js
// import React, { createContext, useContext, useState, useCallback } from "react";
// import CustomAlert from "../components/CustomAlert";

// // Create Alert Context
// const AlertContext = createContext();

// // Alert Provider Component
// export const AlertProvider = ({ children }) => {
//   const [alerts, setAlerts] = useState([]);

//   const showAlert = useCallback((config) => {
//     const id = Date.now().toString();
//     const alert = { id, ...config };

//     setAlerts((prev) => [...prev, alert]);

//     return id;
//   }, []);

//   const hideAlert = useCallback((id) => {
//     setAlerts((prev) => prev.filter((alert) => alert.id !== id));
//   }, []);

//   const hideAllAlerts = useCallback(() => {
//     setAlerts([]);
//   }, []);

//   return (
//     <AlertContext.Provider value={{ showAlert, hideAlert, hideAllAlerts }}>
//       {children}
//       {alerts.map((alert) => (
//         <CustomAlert
//           key={alert.id}
//           visible={true}
//           {...alert}
//           onConfirm={() => {
//             if (alert.onConfirm) alert.onConfirm();
//             hideAlert(alert.id);
//           }}
//           onCancel={() => {
//             if (alert.onCancel) alert.onCancel();
//             hideAlert(alert.id);
//           }}
//         />
//       ))}
//     </AlertContext.Provider>
//   );
// };

// // Custom hook to use alerts
// export const useAlert = () => {
//   const context = useContext(AlertContext);

//   if (!context) {
//     throw new Error("useAlert must be used within an AlertProvider");
//   }

//   const { showAlert, hideAlert, hideAllAlerts } = context;

//   // Convenience methods for different alert types
//   const showSuccess = useCallback(
//     (title, message, options = {}) => {
//       return showAlert({
//         type: "success",
//         title,
//         message,
//         confirmText: "Great!",
//         ...options,
//       });
//     },
//     [showAlert]
//   );

//   const showError = useCallback(
//     (title, message, options = {}) => {
//       return showAlert({
//         type: "error",
//         title,
//         message,
//         confirmText: "Got it",
//         ...options,
//       });
//     },
//     [showAlert]
//   );

//   const showWarning = useCallback(
//     (title, message, options = {}) => {
//       return showAlert({
//         type: "warning",
//         title,
//         message,
//         confirmText: "Understand",
//         ...options,
//       });
//     },
//     [showAlert]
//   );

//   const showInfo = useCallback(
//     (title, message, options = {}) => {
//       return showAlert({
//         type: "info",
//         title,
//         message,
//         confirmText: "OK",
//         ...options,
//       });
//     },
//     [showAlert]
//   );

//   const showConfirm = useCallback(
//     (title, message, onConfirm, options = {}) => {
//       return showAlert({
//         type: "warning",
//         title,
//         message,
//         showCancel: true,
//         confirmText: "Yes",
//         cancelText: "No",
//         onConfirm,
//         ...options,
//       });
//     },
//     [showAlert]
//   );

//   return {
//     showAlert,
//     hideAlert,
//     hideAllAlerts,
//     showSuccess,
//     showError,
//     showWarning,
//     showInfo,
//     showConfirm,
//   };
// };
