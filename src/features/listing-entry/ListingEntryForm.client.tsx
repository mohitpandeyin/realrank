"use client";

import { ArrowRight, CornerDownLeft, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { startListingCheckout } from "./actions";
import { formatRankAmount, stepRankAmount } from "./amount";
import styles from "./ListingEntryForm.module.css";
import { initialListingEntryState } from "./types";

type ListingEntryFormProps = Readonly<{
  citySlug: string;
  initialAmountRupees: string;
  firstPlaceAmountRupees: string;
}>;

function FieldErrors({ errors }: { errors?: readonly string[] }) {
  if (!errors?.length) return null;
  return <span className={styles.rrFieldError}>{errors[0]}</span>;
}

export function ListingEntryForm({
  citySlug,
  initialAmountRupees,
  firstPlaceAmountRupees,
}: ListingEntryFormProps) {
  const checkoutAction = startListingCheckout.bind(null, citySlug);
  const [state, formAction, pending] = useActionState(checkoutAction, initialListingEntryState);
  const [entityName, setEntityName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [rankAmount, setRankAmount] = useState(initialAmountRupees);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const openedOrderId = useRef<string | null>(null);

  useEffect(() => {
    if (state.status !== "checkout" || !state.checkout) return;
    if (openedOrderId.current === state.checkout.orderId) return;
    const checkoutDetails = state.checkout;
    openedOrderId.current = checkoutDetails.orderId;

    let cancelled = false;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (cancelled) return;
      type RazorpayConstructor = new (options: Record<string, unknown>) => { open(): void };
      const Razorpay = (window as typeof window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!Razorpay) {
        setCheckoutMessage("Secure payment could not be loaded. Please try again.");
        return;
      }

      const checkout = new Razorpay({
        key: checkoutDetails.publicKeyId,
        amount: checkoutDetails.amountPaise,
        currency: checkoutDetails.currency,
        name: "Realrank",
        description: `Rank Amount for ${entityName}`,
        order_id: checkoutDetails.orderId,
        prefill: { contact: `+91${contactNumber}` },
        theme: { color: "#cc4f2a" },
        handler: () =>
          setCheckoutMessage(
            "Payment received. We are confirming it securely before updating the index.",
          ),
        modal: {
          ondismiss: () => setCheckoutMessage("Payment was not completed. You can try again."),
        },
      });
      checkout.open();
    };
    script.onerror = () => {
      if (!cancelled) setCheckoutMessage("Secure payment could not be loaded. Please try again.");
    };
    document.head.append(script);

    return () => {
      cancelled = true;
      script.remove();
    };
  }, [contactNumber, entityName, state]);

  return (
    <form className={styles.rrEntry} id="rr-entry-form" action={formAction} noValidate>
      <div className={styles.rrEntryGrid}>
        <label className={styles.rrFieldGroup}>
          <span className={styles.rrSrOnly}>Entity name</span>
          <input
            className={styles.rrField}
            name="entityName"
            value={entityName}
            onChange={(event) => setEntityName(event.target.value)}
            autoComplete="organization"
            placeholder="Entity Name"
            minLength={2}
            maxLength={160}
            required
            aria-invalid={Boolean(state.fieldErrors?.entityName)}
          />
          <FieldErrors errors={state.fieldErrors?.entityName} />
        </label>

        <label className={styles.rrFieldGroup}>
          <span className={styles.rrSrOnly}>Contact or WhatsApp number</span>
          <input
            className={styles.rrField}
            name="contactNumber"
            value={contactNumber}
            onChange={(event) => setContactNumber(event.target.value)}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit Contact or WhatsApp Number"
            pattern="[6-9][0-9]{9}"
            minLength={10}
            maxLength={10}
            required
            aria-invalid={Boolean(state.fieldErrors?.contactNumber)}
          />
          <FieldErrors errors={state.fieldErrors?.contactNumber} />
        </label>

        <div className={`${styles.rrFieldGroup} ${styles.rrAmountGroup}`}>
          <label className={styles.rrSrOnly} htmlFor="rr-rank-amount">
            Rank Amount, minimum 10 rupees
          </label>
          <button
            className={styles.rrClaimFirst}
            type="button"
            onClick={() => setRankAmount(firstPlaceAmountRupees)}
            aria-label={`Set Rank Amount to ${firstPlaceAmountRupees} rupees to claim position 1`}
          >
            <CornerDownLeft aria-hidden="true" size={14} />
            <strong>{formatRankAmount(firstPlaceAmountRupees)}</strong> to claim #1
          </button>
          <div className={styles.rrAmountControls}>
            <button
              type="button"
              onClick={() => setRankAmount((amount) => stepRankAmount(amount, "decrease"))}
              aria-label="Move to the previous 10-rupee amount"
            >
              <Minus aria-hidden="true" size={17} />
            </button>
            <div className={styles.rrAmountValue}>
              <span aria-hidden="true">₹</span>
              <input
                id="rr-rank-amount"
                name="rankAmount"
                type="number"
                inputMode="numeric"
                min="10"
                max="999999999"
                step="1"
                value={rankAmount}
                onChange={(event) => setRankAmount(event.target.value)}
                required
                aria-describedby="rr-rank-amount-help"
                aria-invalid={Boolean(state.fieldErrors?.rankAmount)}
              />
            </div>
            <button
              type="button"
              onClick={() => setRankAmount((amount) => stepRankAmount(amount, "increase"))}
              aria-label="Move to the next 10-rupee amount"
            >
              <Plus aria-hidden="true" size={17} />
            </button>
          </div>
          <span className={styles.rrSrOnly} id="rr-rank-amount-help">
            Enter any whole-rupee amount of at least 10 rupees. Minus and plus move to the previous
            or next 10-rupee amount.
          </span>
          <FieldErrors errors={state.fieldErrors?.rankAmount} />
        </div>

        <button className={styles.rrSubmit} type="submit" disabled={pending}>
          {pending ? "Opening secure payment…" : "List your Entity"}
          <ArrowRight aria-hidden="true" size={19} />
        </button>
      </div>

      <div className={styles.rrEntryFooter}>
        <p>
          By continuing, you agree to the <Link href="/terms">Terms</Link>,{" "}
          <Link href="/privacy">Privacy Policy</Link> and transparent{" "}
          <Link href="/ranking-policy">Ranking Policy</Link>.
        </p>
        <div className={styles.rrFormStatus} aria-live="polite" aria-atomic="true">
          {checkoutMessage ? (
            <p className={styles.rrQuoteSuccess}>{checkoutMessage}</p>
          ) : state.status === "error" && state.message ? (
            <p className={styles.rrFormError}>{state.message}</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
