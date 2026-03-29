import React, { useEffect, useState } from "react";
import api from "../../Api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, CreditCard, Wallet } from "lucide-react";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function PlaceOrderPage({ userId }) {
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [place, setPlace] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState("ONLINE");
  const [isPlacing, setIsPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/customers/cart/user/${userId}`)
      .then((res) => setCart(res.data))
      .catch(() => toast.error("Failed to load cart."));
  }, [userId]);

  const getAddressParams = () => ({
    deliveryAddress,
    phone,
    place,
    postalCode,
  });

  const handleCODOrder = async () => {
    await api.post(`/orders/place/${userId}`, {}, { params: getAddressParams() });
    toast.success("Order placed! Pay on delivery.");
    navigate("/orders");
  };

  const handleOnlinePayment = async () => {
    // Step 1: Place order (PAYMENT_PENDING)
    const orderRes = await api.post(
      `/orders/place/${userId}`,
      {},
      { params: getAddressParams() }
    );
    const placedOrder = orderRes.data;

    // Step 2: Create Razorpay order
    const paymentRes = await api.post(
      `/payment/create-order/${placedOrder.orderId}`
    );
    const { razorpayOrderId, amount, keyId } = paymentRes.data;

    // Step 3: Open modal
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Payment gateway failed to load.");
      return;
    }

    const options = {
      key: keyId,
      amount: amount * 100,
      currency: "INR",
      name: "CloudBite",
      description: "Food Order Payment",
      order_id: razorpayOrderId,
      handler: async (response) => {
        try {
          // Step 4: Verify
          await api.post(`/payment/verify`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success("Payment successful! Order confirmed.");
          navigate("/orders");
        } catch {
          toast.error("Payment verification failed. Contact support.");
        } finally {
          setIsPlacing(false);
        }
      },
      prefill: { contact: phone },
      theme: { color: "#F97316" },
      modal: {
        ondismiss: () => {
          toast("Payment cancelled. Retry from Orders page.");
          setIsPlacing(false);
          navigate("/orders");
        },
      },
    };

    new window.Razorpay(options).open();
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast("Your cart is empty!");
      return;
    }
    setIsPlacing(true);
    try {
      if (paymentMode === "COD") {
        await handleCODOrder();
      } else {
        await handleOnlinePayment();
      }
    } catch (err) {
      toast.error(err.response?.data || "Error placing order");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-900 text-white rounded-2xl shadow-lg mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-center">Checkout</h2>

      {cart.length === 0 ? (
        <p className="text-gray-400 text-center">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-700 mb-6">
            {cart.map((item, idx) => (
              <li key={idx} className="flex justify-between py-2">
                <span>{item.food?.name}</span>
                <span>
                  ₹{item.food?.price} × {item.quantity}
                </span>
              </li>
            ))}
          </ul>

          <h3 className="font-medium text-lg mb-2">Delivery Details</h3>
          <div className="space-y-3 mb-6">
            <input type="text" placeholder="Delivery Address" value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white outline-none" />
            <input type="text" placeholder="City / Place" value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white outline-none" />
            <input type="text" placeholder="Postal Code" value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white outline-none" />
            <input type="text" placeholder="Phone" value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white outline-none" />
          </div>

          {/* Payment method selector */}
          <h3 className="font-medium text-lg mb-3">Payment Method</h3>
          <div className="flex gap-3 mb-6">
            <button onClick={() => setPaymentMode("ONLINE")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm border transition-all ${
                paymentMode === "ONLINE"
                  ? "bg-amber-500 border-amber-500 text-black"
                  : "bg-gray-800 border-gray-700 text-white opacity-60"
              }`}>
              <CreditCard size={16} /> Online Payment
            </button>
            <button onClick={() => setPaymentMode("COD")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm border transition-all ${
                paymentMode === "COD"
                  ? "bg-amber-500 border-amber-500 text-black"
                  : "bg-gray-800 border-gray-700 text-white opacity-60"
              }`}>
              <Wallet size={16} /> Cash on Delivery
            </button>
          </div>

          <button onClick={handlePlaceOrder} disabled={isPlacing}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {isPlacing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : paymentMode === "ONLINE" ? (
              <><CreditCard size={16} /> Pay Online</>
            ) : (
              "Confirm COD Order"
            )}
          </button>
        </>
      )}
    </div>
  );
}
