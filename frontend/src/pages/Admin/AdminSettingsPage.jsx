import { useState, useCallback } from "react";

// ── Initial Settings State ─────────────────────────────────────────────────
const INITIAL = {
  platform: {
    name: "BazaarBD",
    tagline: "Your trusted multi-vendor marketplace",
    email: "support@bazaarbd.com",
    phone: "+880 1711 000000",
    address: "House 12, Gulshan Ave, Dhaka 1212",
    currency: "BDT",
    timezone: "Asia/Dhaka",
    language: "en",
    maintenanceMode: false,
  },
  commission: {
    defaultRate: 10,
    minRate: 2,
    maxRate: 30,
    electronics: 8,
    clothing: 12,
    beauty: 15,
    sports: 10,
    home: 11,
    flatFee: false,
    flatAmount: 0,
    applyOnShipping: false,
  },
  payment: {
    bkash: true,
    nagad: true,
    rocket: false,
    stripe: false,
    cod: true,
    bankTransfer: false,
    bkashApiKey: "bk_live_••••••••",
    nagadApiKey: "ng_live_••••••••",
    stripePublic: "",
    stripeSecret: "",
    minimumOrder: 100,
    autoCapture: true,
    refundWindow: 7,
  },
  shipping: {
    freeShippingEnabled: true,
    freeShippingThreshold: 1000,
    defaultCharge: 60,
    insideDhaka: 60,
    outsideDhaka: 120,
    expressCharge: 200,
    expressEnabled: true,
    sameDayEnabled: false,
    sameDayCharge: 300,
    codExtraCharge: 30,
    sellerCanSetShipping: true,
  },
  seller: {
    autoApproval: false,
    requireNID: true,
    requireTradeLicense: false,
    requireBankAccount: true,
    minProductsToActivate: 1,
    maxProducts: 500,
    commissionHoldDays: 7,
    sellerDashboardEnabled: true,
    sellerCanEditProfile: true,
    allowProductEditing: true,
    reviewBeforePublish: false,
  },
  notifications: {
    emailNewOrder: true,
    emailNewSeller: true,
    emailLowStock: false,
    emailPaymentFail: true,
    emailRefundRequest: true,
    smsNewOrder: false,
    smsPaymentFail: true,
    smsCriticalAlert: true,
    pushEnabled: true,
    digestEnabled: false,
    digestFrequency: "daily",
    adminEmail: "admin@bazaarbd.com",
  },
  security: {
    twoFactor: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    requireStrongPassword: true,
    passwordExpiry: 90,
    ipWhitelistEnabled: false,
    ipWhitelist: "",
    activityLog: true,
    apiRateLimit: 100,
  },
  business: {
    returnEnabled: true,
    returnWindow: 7,
    refundEnabled: true,
    refundWindow: 14,
    cancellationEnabled: true,
    cancellationWindow: 24,
    autoRefundApproval: false,
    refundToWallet: false,
    sellerMediationRequired: true,
    disputeResolutionDays: 5,
    termsUrl: "https://bazaarbd.com/terms",
    privacyUrl: "https://bazaarbd.com/privacy",
  },
};

const TABS = [
  { id: "platform",      label: "Platform",      icon: "🏪" },
  { id: "commission",    label: "Commission",     icon: "💹" },
  { id: "payment",       label: "Payment",        icon: "💳" },
  { id: "shipping",      label: "Shipping",       icon: "🚚" },
  { id: "seller",        label: "Sellers",        icon: "🏬" },
  { id: "notifications", label: "Notifications",  icon: "🔔" },
  { id: "security",      label: "Security",       icon: "🔒" },
  { id: "business",      label: "Business Rules", icon: "📋" },
];

// ── Shared UI primitives ───────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: "pointer",
        background: value ? "#1d5bf5" : "#d1d0cb",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3,
        left: value ? 23 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

function Field({ label, hint, error, children, required }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#3d3c37", display: "block", marginBottom: 5, letterSpacing: "0.01em" }}>
        {label}{required && <span style={{ color: "#d93025", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && <div style={{ fontSize: 11, color: "#a09f97", marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 11, color: "#d93025", marginTop: 4 }}>⚠ {error}</div>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, disabled, min, max, step, prefix }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {prefix && (
        <span style={{
          position: "absolute", left: 12, fontSize: 13, color: "#6b6a63",
          pointerEvents: "none", zIndex: 1,
        }}>{prefix}</span>
      )}
      <input
        type={type} value={value} onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder} disabled={disabled} min={min} max={max} step={step}
        style={{
          width: "100%", height: 38, borderRadius: 9,
          border: "0.5px solid rgba(0,0,0,0.15)", background: disabled ? "#f8f7f3" : "#fff",
          padding: prefix ? "0 12px 0 28px" : "0 12px",
          fontSize: 13, color: "#1a1916", outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onFocus={e => { e.target.style.borderColor = "#1d5bf5"; e.target.style.boxShadow = "0 0 0 3px rgba(29,91,245,0.1)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.15)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Select({ value, onChange, options, disabled }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      style={{
        width: "100%", height: 38, borderRadius: 9,
        border: "0.5px solid rgba(0,0,0,0.15)", background: disabled ? "#f8f7f3" : "#fff",
        padding: "0 10px", fontSize: 13, color: "#1a1916", outline: "none", cursor: "pointer",
      }}
      onFocus={e => { e.target.style.borderColor = "#1d5bf5"; e.target.style.boxShadow = "0 0 0 3px rgba(29,91,245,0.1)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.15)"; e.target.style.boxShadow = "none"; }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function ToggleRow({ label, hint, value, onChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)",
    }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1916" }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: "#a09f97", marginTop: 2 }}>{hint}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function SectionCard({ title, desc, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "0.5px solid rgba(0,0,0,0.09)", marginBottom: 16,
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 20px", borderBottom: "0.5px solid rgba(0,0,0,0.07)", background: "#fafaf8" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1916" }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: "#a09f97", marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: "0 20px",
    }}>{children}</div>
  );
}

function SaveBar({ dirty, saving, onSave, onReset }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px",
      background: dirty ? "#fff" : "#f8f7f3",
      borderRadius: 12,
      border: dirty ? "1.5px solid #1d5bf5" : "0.5px solid rgba(0,0,0,0.09)",
      marginBottom: 20,
      transition: "all 0.2s",
    }}>
      <span style={{ fontSize: 13, color: dirty ? "#1755c2" : "#a09f97", fontWeight: dirty ? 600 : 400 }}>
        {dirty ? "⚡ You have unsaved changes" : "✓ All settings saved"}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onReset} disabled={!dirty} style={{
          fontSize: 12, padding: "7px 14px", borderRadius: 8,
          border: "0.5px solid rgba(0,0,0,0.12)", background: "#f5f4f0",
          color: dirty ? "#1a1916" : "#c0bfb8", cursor: dirty ? "pointer" : "not-allowed",
        }}>Discard</button>
        <button onClick={onSave} disabled={!dirty || saving} style={{
          fontSize: 12, padding: "7px 18px", borderRadius: 8,
          border: "none", background: dirty ? "#1d5bf5" : "#c0d0f8",
          color: "#fff", cursor: dirty ? "pointer" : "not-allowed", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {saving ? <><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.6s linear infinite", display: "inline-block" }} /> Saving…</> : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  if (!message) return null;
  const cfg = type === "success"
    ? { bg: "#e6f4ea", color: "#1e7e34", icon: "✓" }
    : { bg: "#fce8e6", color: "#d93025", icon: "✕" };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: cfg.bg, color: cfg.color,
      padding: "12px 18px", borderRadius: 10,
      fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 8,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      animation: "fadeInUp 0.3s ease",
    }}>
      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
      {message}
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: cfg.color, fontSize: 14, marginLeft: 4 }}>✕</button>
    </div>
  );
}

// ── Section Panels ─────────────────────────────────────────────────────────
function PlatformPanel({ data, onChange }) {
  const s = data;
  const set = (k, v) => onChange({ ...s, [k]: v });
  return (
    <>
      <SectionCard title="Brand Identity" desc="Your marketplace name and public-facing info">
        <Grid cols={2}>
          <Field label="Platform Name" required><Input value={s.name} onChange={v => set("name", v)} placeholder="BazaarBD" /></Field>
          <Field label="Tagline"><Input value={s.tagline} onChange={v => set("tagline", v)} placeholder="Your marketplace tagline" /></Field>
          <Field label="Support Email" required><Input value={s.email} onChange={v => set("email", v)} type="email" placeholder="support@example.com" /></Field>
          <Field label="Support Phone"><Input value={s.phone} onChange={v => set("phone", v)} placeholder="+880 1700 000000" /></Field>
        </Grid>
        <Field label="Business Address"><Input value={s.address} onChange={v => set("address", v)} placeholder="Full address" /></Field>
      </SectionCard>

      <SectionCard title="Localization" desc="Currency, timezone and language preferences">
        <Grid cols={3}>
          <Field label="Currency">
            <Select value={s.currency} onChange={v => set("currency", v)} options={[
              { value: "BDT", label: "BDT (৳)" },
              { value: "USD", label: "USD ($)" },
              { value: "EUR", label: "EUR (€)" },
            ]} />
          </Field>
          <Field label="Timezone">
            <Select value={s.timezone} onChange={v => set("timezone", v)} options={[
              { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
              { value: "UTC", label: "UTC (GMT+0)" },
              { value: "America/New_York", label: "US Eastern" },
            ]} />
          </Field>
          <Field label="Language">
            <Select value={s.language} onChange={v => set("language", v)} options={[
              { value: "en", label: "English" },
              { value: "bn", label: "বাংলা" },
            ]} />
          </Field>
        </Grid>
      </SectionCard>

      <SectionCard title="System Control">
        <ToggleRow label="Maintenance Mode" hint="When ON, the storefront shows a maintenance page to customers. Admin panel stays accessible." value={s.maintenanceMode} onChange={v => set("maintenanceMode", v)} />
      </SectionCard>
    </>
  );
}

function CommissionPanel({ data, onChange }) {
  const s = data;
  const set = (k, v) => onChange({ ...s, [k]: v });
  const cats = [
    ["electronics", "Electronics"], ["clothing", "Clothing"],
    ["beauty", "Beauty"], ["sports", "Sports"], ["home", "Home & Living"],
  ];
  return (
    <>
      <SectionCard title="Default Commission" desc="Platform commission applied to all sellers unless overridden">
        <Grid cols={3}>
          <Field label="Default Rate (%)" hint="Applied when no category rule matches"><Input value={s.defaultRate} onChange={v => set("defaultRate", v)} type="number" min={0} max={100} prefix="%" /></Field>
          <Field label="Minimum Rate (%)"><Input value={s.minRate} onChange={v => set("minRate", v)} type="number" min={0} /></Field>
          <Field label="Maximum Rate (%)"><Input value={s.maxRate} onChange={v => set("maxRate", v)} type="number" max={100} /></Field>
        </Grid>
        <ToggleRow label="Apply commission on shipping charge" hint="Commission percentage will also be deducted from shipping fee" value={s.applyOnShipping} onChange={v => set("applyOnShipping", v)} />
      </SectionCard>

      <SectionCard title="Category-wise Commission" desc="Set different rates per product category">
        <Grid cols={3}>
          {cats.map(([key, label]) => (
            <Field key={key} label={`${label} (%)`}>
              <Input value={s[key]} onChange={v => set(key, v)} type="number" min={0} max={100} prefix="%" />
            </Field>
          ))}
        </Grid>
      </SectionCard>

      <SectionCard title="Flat Fee Option">
        <ToggleRow label="Enable flat fee instead of percentage" hint="Charge a fixed amount per order rather than a percentage" value={s.flatFee} onChange={v => set("flatFee", v)} />
        {s.flatFee && (
          <Field label="Flat Fee Amount (৳)" hint="Fixed amount deducted per completed order">
            <Input value={s.flatAmount} onChange={v => set("flatAmount", v)} type="number" min={0} prefix="৳" />
          </Field>
        )}
      </SectionCard>
    </>
  );
}

function PaymentPanel({ data, onChange }) {
  const s = data;
  const set = (k, v) => onChange({ ...s, [k]: v });
  const methods = [
    ["bkash", "bKash", "Mobile banking — most popular in BD"],
    ["nagad", "Nagad", "Postal mobile banking service"],
    ["rocket", "Rocket", "DBBL mobile banking"],
    ["stripe", "Stripe", "International card payments"],
    ["cod", "Cash on Delivery", "Pay when order arrives"],
    ["bankTransfer", "Bank Transfer", "Direct bank account transfer"],
  ];
  return (
    <>
      <SectionCard title="Payment Methods" desc="Enable or disable payment options for customers">
        {methods.map(([key, name, desc]) => (
          <ToggleRow key={key} label={name} hint={desc} value={s[key]} onChange={v => set(key, v)} />
        ))}
      </SectionCard>

      <SectionCard title="Gateway Configuration" desc="API keys for payment provider integration">
        <Grid cols={2}>
          <Field label="bKash API Key" hint="Keep this private"><Input value={s.bkashApiKey} onChange={v => set("bkashApiKey", v)} type="password" disabled={!s.bkash} /></Field>
          <Field label="Nagad API Key"><Input value={s.nagadApiKey} onChange={v => set("nagadApiKey", v)} type="password" disabled={!s.nagad} /></Field>
          <Field label="Stripe Public Key"><Input value={s.stripePublic} onChange={v => set("stripePublic", v)} placeholder="pk_live_..." disabled={!s.stripe} /></Field>
          <Field label="Stripe Secret Key"><Input value={s.stripeSecret} onChange={v => set("stripeSecret", v)} type="password" placeholder="sk_live_..." disabled={!s.stripe} /></Field>
        </Grid>
      </SectionCard>

      <SectionCard title="Order Rules">
        <Grid cols={3}>
          <Field label="Minimum Order (৳)" hint="Below this, checkout is blocked"><Input value={s.minimumOrder} onChange={v => set("minimumOrder", v)} type="number" min={0} prefix="৳" /></Field>
          <Field label="Refund Window (days)" hint="How many days after payment a refund can be initiated"><Input value={s.refundWindow} onChange={v => set("refundWindow", v)} type="number" min={0} /></Field>
        </Grid>
        <ToggleRow label="Auto-capture payment on order" hint="Charge immediately on order placement. If OFF, funds are held until fulfillment." value={s.autoCapture} onChange={v => set("autoCapture", v)} />
      </SectionCard>
    </>
  );
}

function ShippingPanel({ data, onChange }) {
  const s = data;
  const set = (k, v) => onChange({ ...s, [k]: v });
  return (
    <>
      <SectionCard title="Free Shipping">
        <ToggleRow label="Enable free shipping threshold" hint="Orders above a certain value get free shipping" value={s.freeShippingEnabled} onChange={v => set("freeShippingEnabled", v)} />
        {s.freeShippingEnabled && (
          <Field label="Free shipping on orders above (৳)">
            <Input value={s.freeShippingThreshold} onChange={v => set("freeShippingThreshold", v)} type="number" min={0} prefix="৳" />
          </Field>
        )}
      </SectionCard>

      <SectionCard title="Delivery Charges" desc="Base rates for different delivery zones">
        <Grid cols={2}>
          <Field label="Default Charge (৳)"><Input value={s.defaultCharge} onChange={v => set("defaultCharge", v)} type="number" min={0} prefix="৳" /></Field>
          <Field label="COD Extra Charge (৳)"><Input value={s.codExtraCharge} onChange={v => set("codExtraCharge", v)} type="number" min={0} prefix="৳" /></Field>
          <Field label="Inside Dhaka (৳)"><Input value={s.insideDhaka} onChange={v => set("insideDhaka", v)} type="number" min={0} prefix="৳" /></Field>
          <Field label="Outside Dhaka (৳)"><Input value={s.outsideDhaka} onChange={v => set("outsideDhaka", v)} type="number" min={0} prefix="৳" /></Field>
        </Grid>
      </SectionCard>

      <SectionCard title="Express & Same-Day Delivery">
        <ToggleRow label="Enable express delivery" hint="Faster delivery option with premium charge" value={s.expressEnabled} onChange={v => set("expressEnabled", v)} />
        {s.expressEnabled && <Field label="Express Charge (৳)"><Input value={s.expressCharge} onChange={v => set("expressCharge", v)} type="number" min={0} prefix="৳" /></Field>}
        <ToggleRow label="Enable same-day delivery" value={s.sameDayEnabled} onChange={v => set("sameDayEnabled", v)} />
        {s.sameDayEnabled && <Field label="Same-Day Charge (৳)"><Input value={s.sameDayCharge} onChange={v => set("sameDayCharge", v)} type="number" min={0} prefix="৳" /></Field>}
        <ToggleRow label="Sellers can set their own shipping" hint="Allow individual sellers to override platform shipping rates" value={s.sellerCanSetShipping} onChange={v => set("sellerCanSetShipping", v)} />
      </SectionCard>
    </>
  );
}

function SellerPanel({ data, onChange }) {
  const s = data;
  const set = (k, v) => onChange({ ...s, [k]: v });
  return (
    <>
      <SectionCard title="Seller Onboarding" desc="Control how new sellers join the platform">
        <ToggleRow label="Auto-approve new sellers" hint="If OFF, admin must manually approve each new seller application" value={s.autoApproval} onChange={v => set("autoApproval", v)} />
        <ToggleRow label="Require NID verification" hint="Seller must upload a valid National ID card" value={s.requireNID} onChange={v => set("requireNID", v)} />
        <ToggleRow label="Require trade license" value={s.requireTradeLicense} onChange={v => set("requireTradeLicense", v)} />
        <ToggleRow label="Require bank account" hint="Mandatory for commission payouts" value={s.requireBankAccount} onChange={v => set("requireBankAccount", v)} />
      </SectionCard>

      <SectionCard title="Seller Limits & Rules">
        <Grid cols={2}>
          <Field label="Min products to activate seller" hint="Seller account goes live only after adding this many products"><Input value={s.minProductsToActivate} onChange={v => set("minProductsToActivate", v)} type="number" min={1} /></Field>
          <Field label="Max products per seller"><Input value={s.maxProducts} onChange={v => set("maxProducts", v)} type="number" min={1} /></Field>
          <Field label="Commission hold (days)" hint="Days before earned commission is released to seller"><Input value={s.commissionHoldDays} onChange={v => set("commissionHoldDays", v)} type="number" min={0} /></Field>
        </Grid>
      </SectionCard>

      <SectionCard title="Seller Permissions">
        <ToggleRow label="Seller dashboard enabled" hint="Sellers can access their analytics & order dashboard" value={s.sellerDashboardEnabled} onChange={v => set("sellerDashboardEnabled", v)} />
        <ToggleRow label="Sellers can edit their profile" value={s.sellerCanEditProfile} onChange={v => set("sellerCanEditProfile", v)} />
        <ToggleRow label="Sellers can edit products" value={s.allowProductEditing} onChange={v => set("allowProductEditing", v)} />
        <ToggleRow label="Admin review before product publish" hint="All new products require admin approval before going live" value={s.reviewBeforePublish} onChange={v => set("reviewBeforePublish", v)} />
      </SectionCard>
    </>
  );
}

function NotificationsPanel({ data, onChange }) {
  const s = data;
  const set = (k, v) => onChange({ ...s, [k]: v });
  return (
    <>
      <SectionCard title="Admin Notification Email">
        <Field label="Admin Email Address" hint="All system alerts will be sent to this address">
          <Input value={s.adminEmail} onChange={v => set("adminEmail", v)} type="email" />
        </Field>
      </SectionCard>

      <SectionCard title="Email Notifications">
        <ToggleRow label="New order placed" hint="Email admin when a customer places an order" value={s.emailNewOrder} onChange={v => set("emailNewOrder", v)} />
        <ToggleRow label="New seller registered" value={s.emailNewSeller} onChange={v => set("emailNewSeller", v)} />
        <ToggleRow label="Low stock alert" hint="Notify when seller product stock falls below 5" value={s.emailLowStock} onChange={v => set("emailLowStock", v)} />
        <ToggleRow label="Payment failure" value={s.emailPaymentFail} onChange={v => set("emailPaymentFail", v)} />
        <ToggleRow label="Refund request" value={s.emailRefundRequest} onChange={v => set("emailRefundRequest", v)} />
      </SectionCard>

      <SectionCard title="SMS Notifications">
        <ToggleRow label="New order SMS" value={s.smsNewOrder} onChange={v => set("smsNewOrder", v)} />
        <ToggleRow label="Payment failure SMS" value={s.smsPaymentFail} onChange={v => set("smsPaymentFail", v)} />
        <ToggleRow label="Critical system alerts" value={s.smsCriticalAlert} onChange={v => set("smsCriticalAlert", v)} />
      </SectionCard>

      <SectionCard title="Digest & Push">
        <ToggleRow label="Enable push notifications" value={s.pushEnabled} onChange={v => set("pushEnabled", v)} />
        <ToggleRow label="Enable digest emails" hint="Summarized activity reports" value={s.digestEnabled} onChange={v => set("digestEnabled", v)} />
        {s.digestEnabled && (
          <Field label="Digest frequency">
            <Select value={s.digestFrequency} onChange={v => set("digestFrequency", v)} options={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ]} />
          </Field>
        )}
      </SectionCard>
    </>
  );
}

function SecurityPanel({ data, onChange }) {
  const s = data;
  const set = (k, v) => onChange({ ...s, [k]: v });
  return (
    <>
      <SectionCard title="Authentication">
        <ToggleRow label="Two-factor authentication (2FA)" hint="Require admin to verify login with an authenticator app" value={s.twoFactor} onChange={v => set("twoFactor", v)} />
        <ToggleRow label="Require strong passwords" hint="Minimum 8 characters, uppercase, number, and symbol" value={s.requireStrongPassword} onChange={v => set("requireStrongPassword", v)} />
        <Grid cols={2}>
          <Field label="Session timeout (minutes)" hint="Auto-logout after inactivity"><Input value={s.sessionTimeout} onChange={v => set("sessionTimeout", v)} type="number" min={5} /></Field>
          <Field label="Password expiry (days)" hint="Force password change after N days (0 = never)"><Input value={s.passwordExpiry} onChange={v => set("passwordExpiry", v)} type="number" min={0} /></Field>
          <Field label="Max login attempts" hint="Account locks after this many failed attempts"><Input value={s.maxLoginAttempts} onChange={v => set("maxLoginAttempts", v)} type="number" min={1} /></Field>
          <Field label="Lockout duration (minutes)"><Input value={s.lockoutDuration} onChange={v => set("lockoutDuration", v)} type="number" min={1} /></Field>
        </Grid>
      </SectionCard>

      <SectionCard title="Access Control">
        <ToggleRow label="Enable IP whitelist" hint="Restrict admin panel access to specific IP addresses only" value={s.ipWhitelistEnabled} onChange={v => set("ipWhitelistEnabled", v)} />
        {s.ipWhitelistEnabled && (
          <Field label="Allowed IP addresses" hint="Enter one IP per line, supports CIDR notation (e.g. 192.168.1.0/24)">
            <textarea
              value={s.ipWhitelist}
              onChange={e => set("ipWhitelist", e.target.value)}
              rows={4}
              placeholder={"192.168.1.100\n10.0.0.0/24"}
              style={{
                width: "100%", borderRadius: 9, border: "0.5px solid rgba(0,0,0,0.15)",
                padding: "10px 12px", fontSize: 13, color: "#1a1916",
                fontFamily: "'DM Mono', monospace", resize: "vertical", outline: "none",
              }}
              onFocus={e => { e.target.style.borderColor = "#1d5bf5"; e.target.style.boxShadow = "0 0 0 3px rgba(29,91,245,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.15)"; e.target.style.boxShadow = "none"; }}
            />
          </Field>
        )}
        <ToggleRow label="Enable activity logging" hint="Log all admin actions for audit trail" value={s.activityLog} onChange={v => set("activityLog", v)} />
        <Field label="API rate limit (req/min)" hint="Max API requests per minute per client">
          <Input value={s.apiRateLimit} onChange={v => set("apiRateLimit", v)} type="number" min={10} />
        </Field>
      </SectionCard>
    </>
  );
}

function BusinessPanel({ data, onChange }) {
  const s = data;
  const set = (k, v) => onChange({ ...s, [k]: v });
  return (
    <>
      <SectionCard title="Returns Policy">
        <ToggleRow label="Enable product returns" hint="Customers can request to return delivered products" value={s.returnEnabled} onChange={v => set("returnEnabled", v)} />
        {s.returnEnabled && (
          <Field label="Return window (days)" hint="How many days after delivery to accept return requests">
            <Input value={s.returnWindow} onChange={v => set("returnWindow", v)} type="number" min={1} disabled={!s.returnEnabled} />
          </Field>
        )}
      </SectionCard>

      <SectionCard title="Refund Policy">
        <ToggleRow label="Enable refunds" value={s.refundEnabled} onChange={v => set("refundEnabled", v)} />
        {s.refundEnabled && <>
          <Field label="Refund window (days)">
            <Input value={s.refundWindow} onChange={v => set("refundWindow", v)} type="number" min={1} />
          </Field>
          <ToggleRow label="Auto-approve refunds" hint="Refunds below a threshold are automatically approved without admin review" value={s.autoRefundApproval} onChange={v => set("autoRefundApproval", v)} />
          <ToggleRow label="Refund to wallet balance" hint="Refunds go to customer's marketplace wallet instead of original payment method" value={s.refundToWallet} onChange={v => set("refundToWallet", v)} />
        </>}
      </SectionCard>

      <SectionCard title="Cancellation Policy">
        <ToggleRow label="Allow order cancellation" value={s.cancellationEnabled} onChange={v => set("cancellationEnabled", v)} />
        {s.cancellationEnabled && (
          <Field label="Cancellation window (hours)" hint="Orders can be cancelled within this many hours of placement">
            <Input value={s.cancellationWindow} onChange={v => set("cancellationWindow", v)} type="number" min={1} />
          </Field>
        )}
      </SectionCard>

      <SectionCard title="Dispute Resolution">
        <ToggleRow label="Require seller mediation" hint="Disputes must go through the seller first before admin escalation" value={s.sellerMediationRequired} onChange={v => set("sellerMediationRequired", v)} />
        <Field label="Dispute resolution deadline (days)" hint="Maximum days to resolve a dispute before auto-resolution">
          <Input value={s.disputeResolutionDays} onChange={v => set("disputeResolutionDays", v)} type="number" min={1} />
        </Field>
      </SectionCard>

      <SectionCard title="Legal URLs">
        <Grid cols={2}>
          <Field label="Terms of Service URL"><Input value={s.termsUrl} onChange={v => set("termsUrl", v)} placeholder="https://..." /></Field>
          <Field label="Privacy Policy URL"><Input value={s.privacyUrl} onChange={v => set("privacyUrl", v)} placeholder="https://..." /></Field>
        </Grid>
      </SectionCard>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [settings, setSettings] = useState(INITIAL);
  const [saved, setSaved] = useState(INITIAL);
  const [activeTab, setActiveTab] = useState("platform");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useState(() => {
    const fn = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  });

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaved(settings);
      setSaving(false);
      setToast({ message: "Settings saved successfully", type: "success" });
      setTimeout(() => setToast(null), 3500);
    }, 900);
  };

  const handleDiscard = () => {
    setSettings(saved);
    setToast({ message: "Changes discarded", type: "error" });
    setTimeout(() => setToast(null), 2500);
  };

  const updateSection = useCallback((section, data) => {
    setSettings(prev => ({ ...prev, [section]: data }));
  }, []);

  const panels = {
    platform:      <PlatformPanel      data={settings.platform}      onChange={d => updateSection("platform", d)} />,
    commission:    <CommissionPanel    data={settings.commission}    onChange={d => updateSection("commission", d)} />,
    payment:       <PaymentPanel       data={settings.payment}       onChange={d => updateSection("payment", d)} />,
    shipping:      <ShippingPanel      data={settings.shipping}      onChange={d => updateSection("shipping", d)} />,
    seller:        <SellerPanel        data={settings.seller}        onChange={d => updateSection("seller", d)} />,
    notifications: <NotificationsPanel data={settings.notifications} onChange={d => updateSection("notifications", d)} />,
    security:      <SecurityPanel      data={settings.security}      onChange={d => updateSection("security", d)} />,
    business:      <BusinessPanel      data={settings.business}      onChange={d => updateSection("business", d)} />,
  };

  const activeLabel = TABS.find(t => t.id === activeTab)?.label;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes slideRight { from { transform:translateX(-100%); opacity:0; } to { transform:none; opacity:1; } }
        input:focus, select:focus, textarea:focus { border-color: #1d5bf5 !important; box-shadow: 0 0 0 3px rgba(29,91,245,0.1) !important; }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d0cb; border-radius: 10px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Top Nav ── */}
        <div style={{
          background: "#fff", borderBottom: "0.5px solid rgba(0,0,0,0.09)",
          padding: isMobile ? "0 16px" : "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 56, position: "sticky", top: 0, zIndex: 200,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#1a1916", padding: "4px 6px", borderRadius: 6 }}
              >☰</button>
            )}
            <div style={{
              width: 30, height: 30, borderRadius: 9, background: "#1d5bf5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, color: "#fff", fontWeight: 800,
            }}>A</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1916" }}>
              {isMobile ? activeLabel : "Admin Panel"}
            </span>
            {!isMobile && <span style={{ fontSize: 12, color: "#a09f97" }}>/ Settings</span>}
          </div>
          {dirty && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#b06000", fontWeight: 600, background: "#fef3e2", padding: "3px 8px", borderRadius: 6 }}>Unsaved</span>
              <button onClick={handleSave} disabled={saving} style={{
                fontSize: 12, padding: "6px 14px", borderRadius: 8,
                border: "none", background: "#1d5bf5", color: "#fff",
                cursor: "pointer", fontWeight: 600,
              }}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", maxWidth: 1360, margin: "0 auto" }}>

          {/* ── Sidebar ── */}
          {isMobile && sidebarOpen && (
            <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 150 }} />
          )}
          <aside style={{
            width: 220, flexShrink: 0,
            ...(isMobile ? {
              position: "fixed", top: 56, bottom: 0, left: 0,
              background: "#fff", zIndex: 160, overflowY: "auto",
              borderRight: "0.5px solid rgba(0,0,0,0.09)",
              transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.25s ease",
            } : {
              position: "sticky", top: 56, height: "calc(100vh - 56px)",
              overflowY: "auto", background: "#fff",
              borderRight: "0.5px solid rgba(0,0,0,0.09)",
            }),
          }}>
            <div style={{ padding: "14px 12px" }}>
              {TABS.map(tab => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 9, marginBottom: 2,
                      border: "none", cursor: "pointer", textAlign: "left",
                      background: isActive ? "#e8f0fe" : "transparent",
                      color: isActive ? "#1d5bf5" : "#3d3c37",
                      fontWeight: isActive ? 700 : 400,
                      fontSize: 13, transition: "all 0.12s",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f5f4f0"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 16 }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {isActive && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#1d5bf5" }} />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Content ── */}
          <main style={{ flex: 1, padding: isMobile ? 16 : 24, minWidth: 0, animation: "fadeIn 0.3s ease" }}>

            <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onReset={handleDiscard} />

            <div key={activeTab} style={{ animation: "fadeIn 0.25s ease" }}>
              {panels[activeTab]}
            </div>

          </main>
        </div>
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </>
  );
}