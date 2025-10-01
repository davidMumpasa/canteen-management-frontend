import React, { Component } from "react";
import {
  View,
  Platform,
  Alert,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../config";

const { width, height } = Dimensions.get("window");

// Configuration - Update these with your actual values
const PAYPAL_CLIENT_ID =
  "AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R";

class PayPalPayment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      processing: false,
      error: null,
      sent: false,
      debugInfo: [],
      visible: true,
      backendPaymentId: null,
      webViewLoaded: false,
    };

    // Enhanced postMessage patch
    const patchPostMessageFunction = function () {
      var originalPostMessage = window.postMessage;
      var patchedPostMessage = function (message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer);
      };
      patchedPostMessage.toString = function () {
        return String(Object.hasOwnProperty).replace(
          "hasOwnProperty",
          "postMessage"
        );
      };
      window.postMessage = patchedPostMessage;
    };

    this.patchPostMessageJsCode =
      "(" + String(patchPostMessageFunction) + ")();";
  }

  addDebugInfo = (message) => {
    if (__DEV__) {
      const timestamp = new Date().toLocaleTimeString();
      this.setState((prevState) => ({
        debugInfo: [
          ...prevState.debugInfo.slice(-4),
          `${timestamp}: ${message}`,
        ],
      }));
      console.log(`PayPal Debug: ${message}`);
    }
  };

  // API call to create PayPal order via backend
  createPayPalOrder = async (orderData) => {
    try {
      const response = await fetch(`${BASE_URL}/payment/paypal/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.userToken}`,
        },
        body: JSON.stringify({
          userId: orderData.userId,
          orderId: orderData.orderID,
          amount: orderData.amount,
          currency: orderData.currency || "USD",
          description: `Payment for order ${orderData.orderID}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create PayPal order");
      }

      return data;
    } catch (error) {
      console.error("Create PayPal order error:", error);
      throw error;
    }
  };

  // API call to capture PayPal order via backend
  capturePayPalOrder = async (paypalOrderId, paymentId) => {
    try {
      const response = await fetch(`${BASE_URL}/payment/paypal/capture-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.userToken}`, // Pass user token as prop
        },
        body: JSON.stringify({
          paypalOrderId,
          paymentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to capture PayPal payment");
      }

      return data;
    } catch (error) {
      console.error("Capture PayPal order error:", error);
      throw error;
    }
  };

  sendPaymentDataToWebView = () => {
    if (!this.webviewRef || !this.state.webViewLoaded) {
      this.addDebugInfo("WebView not ready, skipping payment data send");
      return;
    }

    const { amount = "10.00", orderID = "TEST123", userId } = this.props;
    const zarAmount = parseFloat(amount);
    const usdAmount = (zarAmount / 18.5).toFixed(2);

    const paymentData = {
      amount: usdAmount,
      originalAmount: amount,
      orderID,
      userId,
      clientId: PAYPAL_CLIENT_ID,
      currency: "USD",
      apiBaseUrl: BASE_URL,
      userToken: this.props.userToken,
    };

    try {
      const message = JSON.stringify(paymentData);
      this.webviewRef.postMessage(message);
      this.setState({ sent: true });
      this.addDebugInfo(
        `Payment data sent: $${usdAmount} USD (R${zarAmount.toFixed(
          2
        )} ZAR) for order ${orderID}`
      );
    } catch (error) {
      this.addDebugInfo(`Error sending payment data: ${error.message}`);
    }
  };

  onLoadEnd = () => {
    this.addDebugInfo("WebView loaded successfully");
    this.setState({ webViewLoaded: true });

    // Send payment data immediately and retry a few times
    setTimeout(() => {
      this.sendPaymentDataToWebView();
    }, 500);

    setTimeout(() => {
      this.sendPaymentDataToWebView();
    }, 2000);

    setTimeout(() => {
      this.sendPaymentDataToWebView();
    }, 4000);

    setTimeout(() => {
      this.setState({ loading: false });
    }, 2000);
  };

  onLoadStart = () => {
    this.addDebugInfo("WebView started loading");
    this.setState({ webViewLoaded: false, sent: false });
  };

  onLoadProgress = ({ nativeEvent }) => {
    this.addDebugInfo(
      `Loading progress: ${Math.round(nativeEvent.progress * 100)}%`
    );
  };

  handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      this.addDebugInfo(
        `Received message: ${data.type || data.status} - ${data.message || ""}`
      );

      switch (data.type || data.status) {
        case "debug":
          this.addDebugInfo(data.message);
          break;

        case "ready":
          this.addDebugInfo("PayPal SDK loaded and ready");
          this.setState({ loading: false });
          // Send payment data when WebView signals ready
          setTimeout(() => {
            this.sendPaymentDataToWebView();
          }, 100);
          break;

        case "processing":
          this.setState({ processing: true });
          this.addDebugInfo("Payment processing started...");
          break;

        case "success":
          this.setState({ processing: false });
          this.addDebugInfo("Payment successful!");

          Alert.alert(
            "Payment Successful!",
            `Transaction completed successfully.\nAmount: R${
              this.props.amount
            } ZAR\nReference: ${data.reference || data.transactionId}`,
            [
              {
                text: "OK",
                onPress: () => {
                  this.setState({ visible: false });
                  this.props.onSuccess?.({
                    ...data,
                    originalAmount: this.props.amount,
                    currency: "ZAR",
                  });
                },
              },
            ]
          );
          break;

        case "cancelled":
          this.setState({ processing: false });
          this.addDebugInfo("Payment cancelled by user");

          Alert.alert(
            "Payment Cancelled",
            "You cancelled the payment process.",
            [
              {
                text: "OK",
                onPress: () => {
                  this.setState({ visible: false });
                  this.props.onCancel?.(data);
                },
              },
            ]
          );
          break;

        case "error":
        case "failed":
          this.setState({ processing: false, error: data.message });
          this.addDebugInfo(`Payment failed: ${data.message}`);

          Alert.alert(
            "Payment Failed",
            data.message || "An error occurred during payment processing.",
            [
              {
                text: "Try Again",
                onPress: () => this.handleRetry(),
              },
              {
                text: "Cancel",
                onPress: () => {
                  this.setState({ visible: false });
                  this.props.onError?.(data);
                },
                style: "cancel",
              },
            ]
          );
          break;

        default:
          this.addDebugInfo(
            `Unknown message type: ${data.type || data.status}`
          );
          break;
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
      this.addDebugInfo(`Message parsing error: ${error.message}`);
    }
  };

  handleRetry = () => {
    this.setState({
      error: null,
      loading: true,
      processing: false,
      sent: false,
      debugInfo: [],
      backendPaymentId: null,
      webViewLoaded: false,
    });

    if (this.webviewRef) {
      this.webviewRef.reload();
    }
  };

  handleClose = () => {
    Alert.alert(
      "Cancel Payment",
      "Are you sure you want to cancel this payment?",
      [
        { text: "Continue Payment", style: "cancel" },
        {
          text: "Cancel",
          onPress: () => {
            this.setState({ visible: false });
            this.props.onCancel?.({
              status: "cancelled",
              message: "Payment cancelled by user",
            });
          },
        },
      ]
    );
  };

  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerIcon}>
          <Ionicons name="card" size={24} color="white" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>PayPal Payment</Text>
          <Text style={styles.headerSubtitle}>Secure checkout</Text>
        </View>
      </View>
      <TouchableOpacity onPress={this.handleClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  renderPaymentInfo = () => {
    const zarAmount = parseFloat(this.props.amount);
    const usdAmount = (zarAmount / 18.5).toFixed(2);

    return (
      <View style={styles.paymentInfo}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amount}>R{zarAmount.toFixed(2)}</Text>
        <Text style={styles.convertedAmount}>≈ ${usdAmount} USD</Text>
        <Text style={styles.orderLabel}>Order: {this.props.orderID}</Text>
      </View>
    );
  };

  renderSecurityBadge = () => (
    <View style={styles.securityBadge}>
      <Ionicons name="shield-checkmark" size={16} color="#059669" />
      <Text style={styles.securityText}>256-bit SSL Secured</Text>
    </View>
  );

  renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0070BA" />
      <Text style={styles.loadingTitle}>Loading PayPal...</Text>
      <Text style={styles.loadingSubtitle}>
        Preparing your secure payment gateway
      </Text>
    </View>
  );

  renderProcessingState = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color="#0070BA" />
      <Text style={styles.processingTitle}>Processing Payment...</Text>
      <Text style={styles.processingSubtitle}>
        Please don't close this window
      </Text>
    </View>
  );

  renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="warning" size={48} color="#EF4444" />
      <Text style={styles.errorTitle}>Payment Error</Text>
      <Text style={styles.errorMessage}>{this.state.error}</Text>
      <TouchableOpacity onPress={this.handleRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  renderDebugInfo = () => {
    if (!__DEV__ || this.state.debugInfo.length === 0) return null;

    return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        {this.state.debugInfo.map((info, index) => (
          <Text key={index} style={styles.debugText}>
            {info}
          </Text>
        ))}
      </View>
    );
  };

  renderCancelButton = () => {
    if (this.state.processing) return null;

    return (
      <TouchableOpacity onPress={this.handleClose} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel Payment</Text>
      </TouchableOpacity>
    );
  };

  renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Powered by <Text style={styles.footerBrand}>PayPal</Text>
      </Text>
    </View>
  );

  generatePayPalHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>PayPal Payment</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            padding: 15px;
            min-height: 100vh;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
        }
        .paypal-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            min-height: 200px;
        }
        #paypal-button-container {
            margin: 20px 0;
            min-height: 60px;
        }
        .loading {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        .error {
            text-align: center;
            padding: 40px 20px;
            color: #dc2626;
            background: #fef2f2;
            border-radius: 8px;
            margin: 20px 0;
        }
        .status {
            text-align: center;
            padding: 10px;
            margin: 10px 0;
            border-radius: 6px;
            font-size: 14px;
        }
        .status.info {
            background: #eff6ff;
            color: #1d4ed8;
        }
        .spinner {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #0070ba;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="paypal-container">
            <div id="loading" class="loading">
                <div class="spinner"></div>
                <p>Loading PayPal SDK...</p>
            </div>
            <div id="error" class="error" style="display: none;">
                <p>Failed to load PayPal. Please check your internet connection.</p>
            </div>
            <div id="status" class="status info" style="display: none;">
                Waiting for payment data...
            </div>
            <div id="paypal-button-container"></div>
        </div>
    </div>

    <script>
        let paymentData = null;
        let sdkLoaded = false;
        let retryCount = 0;
        let backendPaymentId = null;
        const maxRetries = 5;
        
        function sendMessage(data) {
            try {
                const message = JSON.stringify(data);
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(message);
                } else if (window.parent) {
                    window.parent.postMessage(message, '*');
                }
                console.log('Sent message:', data);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
        
        function updateStatus(message, type = 'info') {
            const statusDiv = document.getElementById('status');
            if (statusDiv) {
                statusDiv.textContent = message;
                statusDiv.className = 'status ' + type;
                statusDiv.style.display = 'block';
            }
            sendMessage({ type: 'debug', message: message });
        }
        
        function showError(message) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('status').style.display = 'none';
            const errorDiv = document.getElementById('error');
            errorDiv.innerHTML = '<p>' + message + '</p><p>Please try again or check your network connection.</p>';
            errorDiv.style.display = 'block';
            sendMessage({ type: 'error', message: message });
        }
        
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }
        
        function validateClientId(clientId) {
            if (!clientId || clientId === 'YOUR_PAYPAL_CLIENT_ID') {
                return false;
            }
            if (clientId.length < 50) {
                return false;
            }
            return true;
        }
        
        function loadPayPalScript(clientId, currency) {
            return new Promise((resolve, reject) => {
                if (!validateClientId(clientId)) {
                    reject(new Error('Invalid or missing PayPal client ID'));
                    return;
                }
                
                if (window.paypal && sdkLoaded) {
                    resolve();
                    return;
                }
                
                updateStatus('Loading PayPal SDK...');
                
                const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
                if (existingScript) {
                    existingScript.remove();
                }
                
                const script = document.createElement('script');
                script.src = \`https://www.paypal.com/sdk/js?client-id=\${clientId}&currency=\${currency}&disable-funding=credit,card&components=buttons\`;
                
                script.onload = () => {
                    if (window.paypal && window.paypal.Buttons) {
                        sdkLoaded = true;
                        updateStatus('PayPal SDK loaded successfully');
                        sendMessage({ type: 'ready' });
                        resolve();
                    } else {
                        setTimeout(() => {
                            if (window.paypal && window.paypal.Buttons) {
                                sdkLoaded = true;
                                updateStatus('PayPal SDK loaded successfully');
                                sendMessage({ type: 'ready' });
                                resolve();
                            } else {
                                reject(new Error('PayPal SDK loaded but not properly initialized'));
                            }
                        }, 1000);
                    }
                };
                
                script.onerror = (error) => {
                    console.error('PayPal SDK load error:', error);
                    reject(new Error('Failed to load PayPal SDK - Network error'));
                };
                
                document.head.appendChild(script);
                
                setTimeout(() => {
                    if (!sdkLoaded) {
                        reject(new Error('PayPal SDK load timeout after 20 seconds'));
                    }
                }, 20000);
            });
        }
        
        // Backend API calls
        async function createOrderViaBackend(orderData) {
            try {
                sendMessage({ type: 'debug', message: 'Making API call to: ' + orderData.apiBaseUrl + '/payment/paypal/create-order' });
                
                const requestBody = {
                    userId: orderData.userId,
                    orderId: orderData.orderID,
                    amount: orderData.amount,
                    currency: orderData.currency || 'USD',
                    description: \`Payment for order \${orderData.orderID}\`
                };
                
                sendMessage({ type: 'debug', message: 'Request body: ' + JSON.stringify(requestBody) });
                
                const response = await fetch(\`\${orderData.apiBaseUrl}/payment/paypal/create-order\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + orderData.userToken
                    },
                    body: JSON.stringify(requestBody)
                });

                sendMessage({ type: 'debug', message: 'API Response status: ' + response.status });

                const data = await response.json();
                sendMessage({ type: 'debug', message: 'API Response data: ' + JSON.stringify(data) });
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create PayPal order');
                }

                return data;
            } catch (error) {
                console.error('Backend create order error:', error);
                sendMessage({ type: 'debug', message: 'Backend create order error: ' + error.message });
                throw error;
            }
        }

        async function captureOrderViaBackend(paypalOrderId, paymentId, apiBaseUrl, userToken) {
            try {
                sendMessage({ type: 'debug', message: 'Making capture API call to: ' + apiBaseUrl + '/payment/paypal/capture-order' });
                
                const requestBody = {
                    paypalOrderId,
                    paymentId
                };
                
                sendMessage({ type: 'debug', message: 'Capture request body: ' + JSON.stringify(requestBody) });
                
                const response = await fetch(\`\${apiBaseUrl}/payment/paypal/capture-order\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + userToken
                    },
                    body: JSON.stringify(requestBody)
                });

                sendMessage({ type: 'debug', message: 'Capture API Response status: ' + response.status });

                const data = await response.json();
                sendMessage({ type: 'debug', message: 'Capture API Response data: ' + JSON.stringify(data) });
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to capture PayPal payment');
                }

                return data;
            } catch (error) {
                console.error('Backend capture order error:', error);
                sendMessage({ type: 'debug', message: 'Backend capture order error: ' + error.message });
                throw error;
            }
        }
        
        function renderPayPalButton() {
            if (!paymentData || !window.paypal) {
                showError('PayPal SDK not loaded or payment data missing');
                return;
            }
            
            sendMessage({ type: 'debug', message: 'About to render PayPal button with data: ' + JSON.stringify(paymentData) });
            
            hideLoading();
            updateStatus('Preparing PayPal button...');
            
            const container = document.getElementById('paypal-button-container');
            container.innerHTML = '';
            
            try {
                window.paypal.Buttons({
                    style: {
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'paypal',
                        height: 50,
                        tagline: false
                    },

                    onClick: function(data, actions) {
                        sendMessage({ type: 'debug', message: 'PayPal button onClick triggered' });
                        updateStatus('PayPal button clicked...');
                        
                        if (!paymentData || !paymentData.amount) {
                            showError('Payment data missing');
                            return actions.reject();
                        }
                        
                        return actions.resolve();
                    },
                    
                    createOrder: async function(data, actions) {
                        try {
                            sendMessage({ type: 'debug', message: 'PayPal createOrder called' });
                            updateStatus('Creating order via backend...');
                            sendMessage({ type: 'processing' });
                            
                            // Call backend API to create order
                            const orderResponse = await createOrderViaBackend(paymentData);
                            
                            backendPaymentId = orderResponse.paymentId;
                            updateStatus('Order created successfully');
                            sendMessage({ type: 'debug', message: 'Backend order created with PayPal ID: ' + orderResponse.paypalOrderId });
                            
                            return orderResponse.paypalOrderId;
                        } catch (error) {
                            console.error('Create order error:', error);
                            showError('Failed to create order: ' + error.message);
                            sendMessage({ type: 'debug', message: 'Create order error: ' + error.message });
                            throw error;
                        }
                    },
                    
                    onApprove: async function(data, actions) {
                        try {
                            sendMessage({ type: 'debug', message: 'Payment approved, capturing...' });
                            updateStatus('Processing payment...');
                            
                            // Call backend API to capture payment
                            const captureData = await captureOrderViaBackend(
                                data.orderID,
                                backendPaymentId,
                                paymentData.apiBaseUrl,
                                paymentData.userToken
                            );
                            
                            if (captureData.success) {
                                updateStatus('Payment completed successfully!');
                                sendMessage({ type: 'debug', message: 'Payment captured successfully' });
                                
                                const successData = {
                                    type: 'success',
                                    status: 'success',
                                    reference: data.orderID,
                                    amount: paymentData.amount,
                                    currency: paymentData.currency,
                                    orderID: paymentData.orderID,
                                    transactionId: captureData.captureId,
                                    paymentId: captureData.payment.id,
                                    backendPaymentId: backendPaymentId
                                };
                                
                                sendMessage(successData);
                            } else {
                                throw new Error('Payment capture failed');
                            }
                            
                        } catch (error) {
                            console.error('Capture error:', error);
                            showError('Payment failed: ' + error.message);
                            sendMessage({ type: 'debug', message: 'Capture error: ' + error.message });
                        }
                    },
                    
                    onCancel: function(data) {
                        sendMessage({ type: 'debug', message: 'Payment cancelled' });
                        updateStatus('Payment cancelled by user');
                        sendMessage({
                            type: 'cancelled',
                            status: 'cancelled',
                            message: 'Payment was cancelled',
                            orderID: data.orderID
                        });
                    },
                    
                    onError: function(err) {
                        console.error('PayPal button error:', err);
                        const errorMessage = err?.message || err?.toString() || 'PayPal payment failed';
                        updateStatus('PayPal error: ' + errorMessage, 'error');
                        sendMessage({
                            type: 'failed',
                            status: 'failed',
                            message: 'PayPal payment error: ' + errorMessage,
                            error: errorMessage
                        });
                        sendMessage({ type: 'debug', message: 'PayPal onError: ' + errorMessage });
                    }
                }).render('#paypal-button-container').then(() => {
                    const statusDiv = document.getElementById('status');
                    if (statusDiv) {
                        statusDiv.style.display = 'none';
                    }
                    sendMessage({ type: 'debug', message: 'PayPal button rendered successfully' });
                    
                    setTimeout(() => {
                        const buttons = container.querySelectorAll('div');
                        sendMessage({ type: 'debug', message: \`Button container has \${buttons.length} child elements\` });
                    }, 1000);
                    
                }).catch((err) => {
                    console.error('Render error:', err);
                    showError('Failed to render PayPal button: ' + (err.message || err.toString()));
                    sendMessage({ type: 'debug', message: 'Button render error: ' + (err.message || err.toString()) });
                });
            } catch (error) {
                console.error('PayPal button creation error:', error);
                showError('Failed to create PayPal button: ' + error.message);
                sendMessage({ type: 'debug', message: 'Button creation error: ' + error.message });
            }
        }
        
        function isValidPaymentData(data) {
            // Filter out postrobot messages
            if (data.__post_robot_11_0_0__ || data.type === 'postrobot_message_request') {
                return false;
            }
            return data && data.clientId && data.amount && data.orderID && data.userId;
        }
        
        function handlePaymentData(data) {
            try {
                const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                
                sendMessage({ type: 'debug', message: 'Received data: ' + JSON.stringify(parsedData) });
                
                if (!isValidPaymentData(parsedData)) {
                    sendMessage({ type: 'debug', message: 'Ignoring non-payment message' });
                    return;
                }
                
                paymentData = parsedData;
                sendMessage({ type: 'debug', message: 'Valid payment data received: ' + JSON.stringify(paymentData) });
                
                if (!paymentData.clientId || paymentData.clientId === 'YOUR_PAYPAL_CLIENT_ID') {
                    showError('Invalid PayPal client ID: ' + paymentData.clientId);
                    return;
                }
                
                if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
                    showError('Invalid payment amount: ' + paymentData.amount);
                    return;
                }
                
                if (!paymentData.userId) {
                    showError('User ID is required for payment processing');
                    return;
                }
                
                updateStatus('Initializing PayPal...');
                
                const currency = paymentData.currency || 'USD';
                
                loadPayPalScript(paymentData.clientId, currency).then(() => {
                    setTimeout(() => {
                        renderPayPalButton();
                    }, 1000);
                }).catch((error) => {
                    console.error('PayPal SDK load failed:', error);
                    if (retryCount < maxRetries) {
                        retryCount++;
                        updateStatus(\`Retrying PayPal load (attempt \${retryCount}/\${maxRetries})...\`);
                        setTimeout(() => {
                            loadPayPalScript(paymentData.clientId, currency).then(() => {
                                renderPayPalButton();
                            }).catch(() => {
                                showError('Failed to load PayPal SDK after multiple attempts. Please check your internet connection and client ID.');
                            });
                        }, 3000 * retryCount);
                    } else {
                        showError('Failed to load PayPal SDK: ' + error.message);
                    }
                });
            } catch (error) {
                console.error('Payment data processing error:', error);
                if (typeof data === 'string' && data.includes('__post_robot')) {
                    return;
                }
                showError('Invalid payment data received: ' + error.message);
            }
        }
        
        // Enhanced message listener that handles React Native WebView postMessage
        function handleWebViewMessage(event) {
            sendMessage({ type: 'debug', message: 'Message event received from: ' + event.origin });
            handlePaymentData(event.data);
        }
        
        // Listen for React Native WebView messages
        document.addEventListener('message', handleWebViewMessage);
        window.addEventListener('message', handleWebViewMessage);
        
        // Also listen for direct postMessage calls
        if (window.ReactNativeWebView) {
            sendMessage({ type: 'debug', message: 'ReactNativeWebView detected' });
        }
        
        sendMessage({ type: 'debug', message: 'PayPal WebView initialized and ready for payment data' });
        
        // Show waiting message after delay
        setTimeout(() => {
            if (!paymentData) {
                updateStatus('Waiting for payment data from app...', 'info');
                sendMessage({ type: 'debug', message: 'No payment data received after 10 seconds' });
            }
        }, 10000);
        
        // Additional debugging for message reception
        setInterval(() => {
            if (!paymentData) {
                sendMessage({ type: 'debug', message: 'Still waiting for payment data... WebView ready: true' });
            }
        }, 15000);
    </script>
</body>
</html>
    `;
  };

  render() {
    const { containerStyle, webViewStyle } = this.props;

    return (
      <Modal
        visible={this.state.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={this.handleClose}
      >
        <View style={[styles.container, containerStyle]}>
          {this.renderHeader()}

          <View style={styles.content}>
            {this.renderPaymentInfo()}
            {this.renderSecurityBadge()}

            <View style={styles.paymentContainer}>
              {this.state.loading && this.renderLoadingState()}
              {this.state.error && this.renderErrorState()}
              {this.state.processing && this.renderProcessingState()}

              <WebView
                ref={(ref) => (this.webviewRef = ref)}
                source={{
                  html: this.generatePayPalHTML(),
                }}
                style={[styles.webview, webViewStyle]}
                originWhitelist={["*"]}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                scalesPageToFit={Platform.OS === "android"}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                injectedJavaScript={this.patchPostMessageJsCode}
                onLoadStart={this.onLoadStart}
                onLoadEnd={this.onLoadEnd}
                onLoadProgress={this.onLoadProgress}
                onMessage={this.handleMessage}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error("WebView error: ", nativeEvent);
                  this.setState({
                    error:
                      "Failed to load payment page: " +
                      (nativeEvent.description || "Unknown error"),
                    loading: false,
                  });
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error("WebView HTTP error: ", nativeEvent);
                  this.addDebugInfo(`HTTP Error: ${nativeEvent.statusCode}`);
                }}
                mixedContentMode="compatibility"
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                userAgent="Mozilla/5.0 (Mobile; rv:70.0) Gecko/70.0 Firefox/70.0"
              />
            </View>

            {this.renderDebugInfo()}
            {this.renderCancelButton()}
            {this.renderFooter()}
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  paymentInfo: {
    backgroundColor: "#EBF4FF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  convertedAmount: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    borderColor: "#D1FAE5",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
    marginLeft: 8,
  },
  paymentContainer: {
    minHeight: 200,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  processingContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#EBF4FF",
    borderRadius: 12,
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginTop: 16,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 14,
    color: "#3B82F6",
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
    minHeight: 200,
  },
  debugContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
  },
  footerBrand: {
    fontWeight: "600",
    color: "#2563EB",
  },
});

export default PayPalPayment;
