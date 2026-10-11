import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkout } from "../../services/orderService";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh",
    instructions: ""
  });
  
  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh"
  });
  
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [errors, setErrors] = useState({});

  // Calculate totals
  const subtotal = cart?.totalAmount || 0;
  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.05; // 5% tax
  const discount = couponApplied ? subtotal * couponDiscount : 0;
  const total = subtotal + shippingCost + tax - discount;

  const steps = [
    { number: 1, name: "Shipping", icon: "🚚" },
    { number: 2, name: "Payment", icon: "💳" },
    { number: 3, name: "Review", icon: "✓" }
  ];

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingInfo.fullName) newErrors.fullName = "Full name is required";
    if (!shippingInfo.email) newErrors.email = "Email is required";
    if (!shippingInfo.phone) newErrors.phone = "Phone number is required";
    if (!shippingInfo.address) newErrors.address = "Address is required";
    if (!shippingInfo.city) newErrors.city = "City is required";
    if (!shippingInfo.postalCode) newErrors.postalCode = "Postal code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(3);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        shippingAddress: `${shippingInfo.address}, ${shippingInfo.apartment ? shippingInfo.apartment + ', ' : ''}${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}, ${shippingInfo.country}`,
        billingAddress: billingInfo.sameAsShipping 
          ? `${shippingInfo.address}, ${shippingInfo.apartment ? shippingInfo.apartment + ', ' : ''}${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}, ${shippingInfo.country}`
          : `${billingInfo.address}, ${billingInfo.city}, ${billingInfo.state} ${billingInfo.postalCode}, ${billingInfo.country}`,
        paymentMethod,
        paymentDetails,
        customerInfo: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: shippingInfo.phone
        },
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
        couponCode: couponApplied ? couponCode : null,
        items: cart?.items || []
      };

      const res = await checkout(orderData);
      setOrderDetails(res);
      setOrderComplete(true);
      clearCart();
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Checkout failed:", error);
      setErrors({ submit: "Failed to place order. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    // Simulate coupon validation
    if (couponCode.toLowerCase() === "welcome10") {
      setCouponDiscount(0.1); // 10% off
      setCouponApplied(true);
    } else if (couponCode.toLowerCase() === "save20") {
      setCouponDiscount(0.2); // 20% off
      setCouponApplied(true);
    } else {
      alert("Invalid coupon code");
    }
  };

  if (orderComplete) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.successHeading}>Order Placed Successfully!</h1>
            <p style={styles.successText}>
              Thank you for your order. Your order ID is <strong>#{orderDetails?.orderId}</strong>
            </p>
            <p style={styles.successText}>
              We've sent a confirmation email to {shippingInfo.email}
            </p>
            
            <div style={styles.orderSummary}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <div style={styles.summaryRow}>
                <span>Order Number:</span>
                <span>#{orderDetails?.orderId}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Total Amount:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Payment Method:</span>
                <span style={styles.paymentMethod}>
                  {paymentMethod === 'bkash' && 'bKash'}
                  {paymentMethod === 'nagad' && 'Nagad'}
                  {paymentMethod === 'rocket' && 'Rocket'}
                  {paymentMethod === 'card' && 'Credit/Debit Card'}
                  {paymentMethod === 'cod' && 'Cash on Delivery'}
                </span>
              </div>
            </div>

            <div style={styles.successActions}>
              <Link 
                to="/orders" 
                style={styles.viewOrderButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0e3a9c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1a56db'}
              >
                View My Orders
              </Link>
              <Link 
                to="/" 
                style={styles.continueShoppingLink}
                onMouseEnter={(e) => {
                  e.target.style.color = '#0e3a9c';
                  e.target.style.borderBottomColor = '#0e3a9c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#1a56db';
                  e.target.style.borderBottomColor = 'transparent';
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Checkout</h1>

        {/* Progress Steps */}
        <div style={styles.progressContainer}>
          {steps.map((step, index) => (
            <div key={step.number} style={styles.stepWrapper}>
              <div style={styles.stepLineContainer}>
                {index > 0 && (
                  <div style={{
                    ...styles.stepLine,
                    backgroundColor: currentStep > index ? '#1a56db' : '#e2e8f0'
                  }} />
                )}
              </div>
              <div style={styles.stepContent}>
                <div style={{
                  ...styles.stepCircle,
                  backgroundColor: currentStep >= step.number ? '#1a56db' : '#ffffff',
                  borderColor: currentStep >= step.number ? '#1a56db' : '#cbd5e0',
                  color: currentStep >= step.number ? '#ffffff' : '#718096'
                }}>
                  {currentStep > step.number ? '✓' : step.icon}
                </div>
                <span style={{
                  ...styles.stepName,
                  color: currentStep >= step.number ? '#1a56db' : '#718096'
                }}>
                  {step.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.checkoutGrid}>
          {/* Main Checkout Form */}
          <div style={styles.mainContent}>
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <form onSubmit={handleShippingSubmit} style={styles.form}>
                <h2 style={styles.sectionTitle}>Shipping Information</h2>
                
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                      style={{
                        ...styles.input,
                        ...(errors.fullName ? styles.inputError : {})
                      }}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <span style={styles.errorText}>{errors.fullName}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email *</label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      style={{
                        ...styles.input,
                        ...(errors.email ? styles.inputError : {})
                      }}
                      placeholder="john@example.com"
                    />
                    {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      style={{
                        ...styles.input,
                        ...(errors.phone ? styles.inputError : {})
                      }}
                      placeholder="01XXXXXXXXX"
                    />
                    {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
                  </div>

                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Address *</label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      style={{
                        ...styles.input,
                        ...(errors.address ? styles.inputError : {})
                      }}
                      placeholder="Street address"
                    />
                    {errors.address && <span style={styles.errorText}>{errors.address}</span>}
                  </div>

                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Apartment, suite, etc. (optional)</label>
                    <input
                      type="text"
                      value={shippingInfo.apartment}
                      onChange={(e) => setShippingInfo({...shippingInfo, apartment: e.target.value})}
                      style={styles.input}
                      placeholder="Apt, suite, unit"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>City *</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      style={{
                        ...styles.input,
                        ...(errors.city ? styles.inputError : {})
                      }}
                      placeholder="Dhaka"
                    />
                    {errors.city && <span style={styles.errorText}>{errors.city}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>State/Division</label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                      style={styles.input}
                      placeholder="Dhaka"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Postal Code *</label>
                    <input
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                      style={{
                        ...styles.input,
                        ...(errors.postalCode ? styles.inputError : {})
                      }}
                      placeholder="1207"
                    />
                    {errors.postalCode && <span style={styles.errorText}>{errors.postalCode}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Country</label>
                    <select
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                      style={styles.select}
                    >
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="India">India</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Nepal">Nepal</option>
                    </select>
                  </div>

                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Delivery Instructions (optional)</label>
                    <textarea
                      value={shippingInfo.instructions}
                      onChange={(e) => setShippingInfo({...shippingInfo, instructions: e.target.value})}
                      style={styles.textarea}
                      placeholder="Special instructions for delivery"
                      rows="3"
                    />
                  </div>
                </div>

                <div style={styles.formActions}>
                  <Link 
                    to="/cart" 
                    style={styles.backLink}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#0e3a9c';
                      e.target.style.borderBottomColor = '#0e3a9c';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#1a56db';
                      e.target.style.borderBottomColor = 'transparent';
                    }}
                  >
                    ← Back to Cart
                  </Link>
                  <button type="submit" style={styles.continueButton}>
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <form onSubmit={handlePaymentSubmit} style={styles.form}>
                <h2 style={styles.sectionTitle}>Payment Method</h2>

                <div style={styles.paymentMethods}>
                  <label style={{
                    ...styles.paymentMethodCard,
                    borderColor: paymentMethod === 'bkash' ? '#1a56db' : 'rgba(26, 86, 219, 0.1)'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={styles.paymentRadio}
                    />
                    <div style={styles.paymentMethodContent}>
                      <span style={styles.paymentMethodName}>bKash</span>
                      <span style={styles.paymentMethodIcon}>📱</span>
                    </div>
                  </label>

                  <label style={{
                    ...styles.paymentMethodCard,
                    borderColor: paymentMethod === 'nagad' ? '#1a56db' : 'rgba(26, 86, 219, 0.1)'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="nagad"
                      checked={paymentMethod === 'nagad'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={styles.paymentRadio}
                    />
                    <div style={styles.paymentMethodContent}>
                      <span style={styles.paymentMethodName}>Nagad</span>
                      <span style={styles.paymentMethodIcon}>📱</span>
                    </div>
                  </label>

                  <label style={{
                    ...styles.paymentMethodCard,
                    borderColor: paymentMethod === 'rocket' ? '#1a56db' : 'rgba(26, 86, 219, 0.1)'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="rocket"
                      checked={paymentMethod === 'rocket'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={styles.paymentRadio}
                    />
                    <div style={styles.paymentMethodContent}>
                      <span style={styles.paymentMethodName}>Rocket</span>
                      <span style={styles.paymentMethodIcon}>📱</span>
                    </div>
                  </label>

                  <label style={{
                    ...styles.paymentMethodCard,
                    borderColor: paymentMethod === 'card' ? '#1a56db' : 'rgba(26, 86, 219, 0.1)'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={styles.paymentRadio}
                    />
                    <div style={styles.paymentMethodContent}>
                      <span style={styles.paymentMethodName}>Visa/MasterCard</span>
                      <span style={styles.paymentMethodIcon}>💳</span>
                    </div>
                  </label>

                  <label style={{
                    ...styles.paymentMethodCard,
                    borderColor: paymentMethod === 'cod' ? '#1a56db' : 'rgba(26, 86, 219, 0.1)'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={styles.paymentRadio}
                    />
                    <div style={styles.paymentMethodContent}>
                      <span style={styles.paymentMethodName}>Cash on Delivery</span>
                      <span style={styles.paymentMethodIcon}>💵</span>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'bkash' && (
                  <div style={styles.paymentInstructions}>
                    <h3 style={styles.instructionsTitle}>bKash Payment Instructions:</h3>
                    <p style={styles.instruction}>1. Go to your bKash mobile menu</p>
                    <p style={styles.instruction}>2. Select "Payment"</p>
                    <p style={styles.instruction}>3. Enter Merchant Number: 017XXXXXXXX</p>
                    <p style={styles.instruction}>4. Enter amount: ${total.toFixed(2)}</p>
                    <p style={styles.instruction}>5. Enter your PIN to confirm</p>
                    <p style={styles.instruction}>6. You'll receive a transaction ID</p>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Transaction ID</label>
                      <input
                        type="text"
                        value={paymentDetails.transactionId || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, transactionId: e.target.value})}
                        style={styles.input}
                        placeholder="Enter bKash transaction ID"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'nagad' && (
                  <div style={styles.paymentInstructions}>
                    <h3 style={styles.instructionsTitle}>Nagad Payment Instructions:</h3>
                    <p style={styles.instruction}>1. Dial *167#</p>
                    <p style={styles.instruction}>2. Select "Payment"</p>
                    <p style={styles.instruction}>3. Enter Merchant Number: 017XXXXXXXX</p>
                    <p style={styles.instruction}>4. Enter amount: ${total.toFixed(2)}</p>
                    <p style={styles.instruction}>5. Enter your PIN to confirm</p>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Transaction ID</label>
                      <input
                        type="text"
                        value={paymentDetails.transactionId || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, transactionId: e.target.value})}
                        style={styles.input}
                        placeholder="Enter Nagad transaction ID"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'rocket' && (
                  <div style={styles.paymentInstructions}>
                    <h3 style={styles.instructionsTitle}>Rocket Payment Instructions:</h3>
                    <p style={styles.instruction}>1. Dial *322#</p>
                    <p style={styles.instruction}>2. Select "Payment"</p>
                    <p style={styles.instruction}>3. Enter Merchant Number: 017XXXXXXXX</p>
                    <p style={styles.instruction}>4. Enter amount: ${total.toFixed(2)}</p>
                    <p style={styles.instruction}>5. Enter your PIN to confirm</p>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Transaction ID</label>
                      <input
                        type="text"
                        value={paymentDetails.transactionId || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, transactionId: e.target.value})}
                        style={styles.input}
                        placeholder="Enter Rocket transaction ID"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div style={styles.cardDetails}>
                    <div style={styles.formGroupFull}>
                      <label style={styles.label}>Card Number</label>
                      <input
                        type="text"
                        style={styles.input}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Expiry Date</label>
                        <input
                          type="text"
                          style={styles.input}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>CVV</label>
                        <input
                          type="text"
                          style={styles.input}
                          placeholder="123"
                        />
                      </div>
                    </div>
                    
                    <div style={styles.formGroupFull}>
                      <label style={styles.label}>Name on Card</label>
                      <input
                        type="text"
                        style={styles.input}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                <div style={styles.billingSection}>
                  <h3 style={styles.subsectionTitle}>Billing Address</h3>
                  
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={billingInfo.sameAsShipping}
                      onChange={(e) => setBillingInfo({...billingInfo, sameAsShipping: e.target.checked})}
                      style={styles.checkbox}
                    />
                    Same as shipping address
                  </label>

                  {!billingInfo.sameAsShipping && (
                    <div style={styles.formGrid}>
                      <div style={styles.formGroupFull}>
                        <label style={styles.label}>Full Name</label>
                        <input
                          type="text"
                          value={billingInfo.fullName}
                          onChange={(e) => setBillingInfo({...billingInfo, fullName: e.target.value})}
                          style={styles.input}
                        />
                      </div>
                      
                      <div style={styles.formGroupFull}>
                        <label style={styles.label}>Email</label>
                        <input
                          type="email"
                          value={billingInfo.email}
                          onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                          style={styles.input}
                        />
                      </div>
                      
                      <div style={styles.formGroupFull}>
                        <label style={styles.label}>Address</label>
                        <input
                          type="text"
                          value={billingInfo.address}
                          onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                          style={styles.input}
                        />
                      </div>
                      
                      <div style={styles.formGroup}>
                        <label style={styles.label}>City</label>
                        <input
                          type="text"
                          value={billingInfo.city}
                          onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                          style={styles.input}
                        />
                      </div>
                      
                      <div style={styles.formGroup}>
                        <label style={styles.label}>State</label>
                        <input
                          type="text"
                          value={billingInfo.state}
                          onChange={(e) => setBillingInfo({...billingInfo, state: e.target.value})}
                          style={styles.input}
                        />
                      </div>
                      
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Postal Code</label>
                        <input
                          type="text"
                          value={billingInfo.postalCode}
                          onChange={(e) => setBillingInfo({...billingInfo, postalCode: e.target.value})}
                          style={styles.input}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(1)} 
                    style={styles.backButton}
                  >
                    ← Back
                  </button>
                  <button type="submit" style={styles.continueButton}>
                    Review Order
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div style={styles.reviewSection}>
                <h2 style={styles.sectionTitle}>Review Your Order</h2>

                <div style={styles.reviewCard}>
                  <h3 style={styles.reviewCardTitle}>Shipping Address</h3>
                  <p style={styles.reviewText}>{shippingInfo.fullName}</p>
                  <p style={styles.reviewText}>{shippingInfo.address}</p>
                  {shippingInfo.apartment && <p style={styles.reviewText}>{shippingInfo.apartment}</p>}
                  <p style={styles.reviewText}>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
                  <p style={styles.reviewText}>{shippingInfo.country}</p>
                  <p style={styles.reviewText}>Phone: {shippingInfo.phone}</p>
                  <p style={styles.reviewText}>Email: {shippingInfo.email}</p>
                  <button 
                    onClick={() => setCurrentStep(1)} 
                    style={styles.editLink}
                  >
                    Edit
                  </button>
                </div>

                <div style={styles.reviewCard}>
                  <h3 style={styles.reviewCardTitle}>Payment Method</h3>
                  <p style={styles.reviewText}>
                    {paymentMethod === 'bkash' && 'bKash'}
                    {paymentMethod === 'nagad' && 'Nagad'}
                    {paymentMethod === 'rocket' && 'Rocket'}
                    {paymentMethod === 'card' && 'Credit/Debit Card'}
                    {paymentMethod === 'cod' && 'Cash on Delivery'}
                  </p>
                  {paymentDetails.transactionId && (
                    <p style={styles.reviewText}>Transaction ID: {paymentDetails.transactionId}</p>
                  )}
                  <button 
                    onClick={() => setCurrentStep(2)} 
                    style={styles.editLink}
                  >
                    Edit
                  </button>
                </div>

                <div style={styles.reviewCard}>
                  <h3 style={styles.reviewCardTitle}>Order Items</h3>
                  {cart?.items?.map((item) => (
                    <div key={item.id} style={styles.reviewItem}>
                      <div style={styles.reviewItemInfo}>
                        <span style={styles.reviewItemName}>{item.name}</span>
                        <span style={styles.reviewItemQty}>x{item.quantity}</span>
                      </div>
                      <span style={styles.reviewItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {errors.submit && (
                  <div style={styles.submitError}>{errors.submit}</div>
                )}

                <div style={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(2)} 
                    style={styles.backButton}
                  >
                    ← Back
                  </button>
                  <button 
                    onClick={handlePlaceOrder} 
                    style={styles.placeOrderButton}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryHeading}>Order Summary</h3>
              
              <div style={styles.summaryItems}>
                {cart?.items?.map((item) => (
                  <div key={item.id} style={styles.summaryItem}>
                    <div style={styles.summaryItemInfo}>
                      <span style={styles.summaryItemName}>{item.name}</span>
                      <span style={styles.summaryItemQty}>x{item.quantity}</span>
                    </div>
                    <span style={styles.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={styles.summaryDivider} />

              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div style={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              
              <div style={styles.summaryRow}>
                <span>Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              {couponApplied && (
                <div style={{...styles.summaryRow, color: '#48bb78'}}>
                  <span>Discount (10%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div style={styles.summaryDivider} />

              <div style={styles.summaryTotal}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Coupon Code */}
              <div style={styles.couponSection}>
                <h4 style={styles.couponHeading}>Have a coupon?</h4>
                <div style={styles.couponForm}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    style={styles.couponInput}
                    disabled={couponApplied}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    style={couponApplied ? styles.couponApplied : styles.couponButton}
                    disabled={couponApplied}
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap');

          @media (max-width: 1024px) {
            div[style*="grid-template-columns: 2fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
            div[style*="display: flex; justify-content: space-between; align-items: center;"] {
              flex-wrap: wrap !important;
            }
          }

          @media (max-width: 768px) {
            div[style*="grid-template-columns: repeat(2, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </section>
  );
}

const styles = {
  section: {
    backgroundColor: '#f9fafc',
    fontFamily: "'DM Sans', sans-serif",
    minHeight: 'calc(100vh - 200px)',
    padding: '3rem 0',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  heading: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '2.5rem',
    color: '#1a56db',
    marginBottom: '2rem',
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
    position: 'relative',
  },
  stepWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  stepLineContainer: {
    position: 'absolute',
    top: '24px',
    left: 'calc(-50% + 40px)',
    right: 'calc(50% + 40px)',
    height: '2px',
    zIndex: 1,
  },
  stepLine: {
    height: '100%',
    transition: 'background-color 0.3s ease',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    width: '100%',
  },
  stepCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    border: '2px solid',
    backgroundColor: '#ffffff',
    marginBottom: '0.5rem',
  },
  stepName: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  checkoutGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
  },
  mainContent: {
    minWidth: 0,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#1a56db',
    marginBottom: '1.5rem',
    marginTop: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroupFull: {
    display: 'flex',
    flexDirection: 'column',
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#4a5568',
    marginBottom: '0.25rem',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '6px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  inputError: {
    borderColor: '#f56565',
  },
  errorText: {
    color: '#f56565',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
  },
  select: {
    padding: '0.75rem',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '6px',
    fontSize: '0.95rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    outline: 'none',
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '6px',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: "'DM Sans', sans-serif",
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem',
  },
  backLink: {
    color: '#1a56db',
    textDecoration: 'none',
    fontSize: '0.95rem',
    borderBottom: '1px solid transparent',
    paddingBottom: '2px',
    transition: 'color 0.2s ease, borderBottomColor 0.2s ease',
  },
  backButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '6px',
    fontSize: '0.95rem',
    color: '#2d3748',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  continueButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#1a56db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  placeOrderButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#48bb78',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  paymentMethods: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  paymentMethodCard: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    position: 'relative',
  },
  paymentRadio: {
    position: 'absolute',
    opacity: 0,
  },
  paymentMethodContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontWeight: 500,
    color: '#2d3748',
  },
  paymentMethodIcon: {
    fontSize: '1.5rem',
  },
  paymentInstructions: {
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  instructionsTitle: {
    fontSize: '1rem',
    color: '#1a56db',
    marginBottom: '1rem',
  },
  instruction: {
    color: '#4a5568',
    marginBottom: '0.5rem',
    fontSize: '0.95rem',
  },
  cardDetails: {
    marginBottom: '2rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  billingSection: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(26, 86, 219, 0.1)',
  },
  subsectionTitle: {
    fontSize: '1.1rem',
    color: '#1a56db',
    marginBottom: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    color: '#4a5568',
    marginBottom: '1rem',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#1a56db',
  },
  reviewSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    padding: '2rem',
  },
  reviewCard: {
    border: '1px solid rgba(26, 86, 219, 0.1)',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    position: 'relative',
  },
  reviewCardTitle: {
    fontSize: '1rem',
    color: '#1a56db',
    marginBottom: '1rem',
  },
  reviewText: {
    color: '#4a5568',
    marginBottom: '0.25rem',
    fontSize: '0.95rem',
  },
  editLink: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    color: '#1a56db',
    textDecoration: 'none',
    fontSize: '0.9rem',
    borderBottom: '1px solid transparent',
    paddingBottom: '2px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(26, 86, 219, 0.1)',
  },
  reviewItemInfo: {
    display: 'flex',
    gap: '0.5rem',
  },
  reviewItemName: {
    color: '#2d3748',
  },
  reviewItemQty: {
    color: '#718096',
  },
  reviewItemPrice: {
    color: '#1a56db',
    fontWeight: 600,
  },
  submitError: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    border: '1px solid #fc8181',
  },
  sidebar: {
    minWidth: 0,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    padding: '1.5rem',
    position: 'sticky',
    top: '2rem',
  },
  summaryHeading: {
    fontSize: '1.2rem',
    color: '#1a56db',
    marginBottom: '1.5rem',
  },
  summaryItems: {
    marginBottom: '1rem',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    fontSize: '0.95rem',
  },
  summaryItemInfo: {
    display: 'flex',
    gap: '0.5rem',
  },
  summaryItemName: {
    color: '#2d3748',
  },
  summaryItemQty: {
    color: '#718096',
  },
  summaryItemPrice: {
    color: '#1a56db',
    fontWeight: 500,
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'rgba(26, 86, 219, 0.1)',
    margin: '1rem 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    fontSize: '0.95rem',
    color: '#4a5568',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#1a56db',
  },
  couponSection: {
    marginTop: '1.5rem',
  },
  couponHeading: {
    fontSize: '0.95rem',
    color: '#4a5568',
    marginBottom: '0.5rem',
  },
  couponForm: {
    display: 'flex',
    gap: '0.5rem',
  },
  couponInput: {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '4px',
    fontSize: '0.9rem',
    outline: 'none',
  },
  couponButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1a56db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  couponApplied: {
    padding: '0.5rem 1rem',
    backgroundColor: '#48bb78',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'not-allowed',
  },
  successCard: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    padding: '3rem 2rem',
    textAlign: 'center',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    backgroundColor: '#48bb78',
    color: '#ffffff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    margin: '0 auto 2rem',
  },
  successHeading: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '2rem',
    color: '#1a56db',
    marginBottom: '1rem',
  },
  successText: {
    color: '#4a5568',
    marginBottom: '1rem',
    lineHeight: 1.6,
  },
  orderSummary: {
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    padding: '1.5rem',
    margin: '2rem 0',
    textAlign: 'left',
  },
  summaryTitle: {
    fontSize: '1.1rem',
    color: '#1a56db',
    marginBottom: '1rem',
  },
  paymentMethod: {
    textTransform: 'capitalize',
  },
  successActions: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewOrderButton: {
    backgroundColor: '#1a56db',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.875rem 2rem',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'background-color 0.2s ease',
  },
  continueShoppingLink: {
    color: '#1a56db',
    textDecoration: 'none',
    fontSize: '1rem',
    borderBottom: '1px solid transparent',
    paddingBottom: '2px',
    transition: 'color 0.2s ease, borderBottomColor 0.2s ease',
  },
};