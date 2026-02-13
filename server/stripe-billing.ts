import { getUncachableStripeClient } from "./stripeClient";
import { storage } from "./storage";

let stripeAvailable = false;

export async function initStripeBilling(): Promise<void> {
  try {
    const stripe = await getUncachableStripeClient();
    if (stripe) stripeAvailable = true;
    console.log("Stripe billing initialized");
  } catch (err: any) {
    console.log("Stripe billing not available:", err.message);
    stripeAvailable = false;
  }
}

export function isStripeConfigured(): boolean {
  return stripeAvailable;
}

export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string | null> {
  try {
    const stripe = await getUncachableStripeClient();

    const existing = await storage.getStripeCustomer(userId);
    if (existing) return existing.stripeCustomerId;

    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    await storage.createStripeCustomer({
      userId,
      stripeCustomerId: customer.id,
      email,
    });

    return customer.id;
  } catch {
    return null;
  }
}

export async function createUsageInvoice(
  userId: string,
  email: string,
  amountUsd: number,
  periodStart: Date,
  periodEnd: Date,
  featureBreakdown: Record<string, { count: number; cost: number }>
): Promise<string | null> {
  try {
    const stripe = await getUncachableStripeClient();

    const customerId = await getOrCreateStripeCustomer(userId, email);
    if (!customerId) return null;

    const amountGbp = Math.round(amountUsd * 0.79 * 100) / 100;

    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: 14,
      description: `My User Journey - AI Usage (${periodStart.toLocaleDateString("en-GB")} - ${periodEnd.toLocaleDateString("en-GB")})`,
      metadata: {
        userId,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      },
    });

    for (const [feature, data] of Object.entries(featureBreakdown)) {
      const featureName = feature.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        description: `${featureName} (${data.count} requests)`,
        amount: Math.round(data.cost * 100),
        currency: "usd",
      });
    }

    await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(invoice.id);

    await storage.createInvoice({
      userId,
      stripeInvoiceId: invoice.id,
      amountUsd,
      amountGbp,
      status: "sent",
      periodStart,
      periodEnd,
    });

    return invoice.id;
  } catch (err: any) {
    console.error("Failed to create invoice:", err.message);
    return null;
  }
}

export async function checkAndInvoiceUser(userId: string, email: string): Promise<{ invoiced: boolean; amount?: number }> {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const totalCost = await storage.getAiUsageTotalCost(userId, firstDay, lastDay);

  if (totalCost < 10) {
    return { invoiced: false };
  }

  const existingInvoices = await storage.getInvoices(userId);
  const alreadyInvoiced = existingInvoices.some(
    (inv) =>
      inv.periodStart.getTime() === firstDay.getTime() &&
      inv.status !== "cancelled"
  );

  if (alreadyInvoiced) {
    return { invoiced: false };
  }

  const logs = await storage.getAiUsageLogs(userId, firstDay, lastDay);
  const featureBreakdown: Record<string, { count: number; cost: number }> = {};
  for (const log of logs) {
    if (!featureBreakdown[log.feature]) {
      featureBreakdown[log.feature] = { count: 0, cost: 0 };
    }
    featureBreakdown[log.feature].count++;
    featureBreakdown[log.feature].cost += log.costUsd;
  }

  const invoiceId = await createUsageInvoice(userId, email, totalCost, firstDay, lastDay, featureBreakdown);

  if (invoiceId) {
    return { invoiced: true, amount: totalCost };
  }

  return { invoiced: false };
}
