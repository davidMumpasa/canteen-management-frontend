// hooks/useAppAlert.js
import { useBeautifulAlert } from "expo-beautiful-alerts";

export default function useAppAlert() {
  const alert = useBeautifulAlert();

  const showError = (title, message) => {
    alert.show({
      title,
      message,
      alertType: "error",
      actions: [{ text: "OK", style: "cancel" }],
    });
  };

  const showSuccess = (title, message) => {
    alert.show({
      title,
      message,
      alertType: "success",
      actions: [{ text: "Nice!", style: "default" }],
    });
  };

  return { showError, showSuccess };
}
