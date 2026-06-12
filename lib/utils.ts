export function formatCurrency(
  value: number | string | null | undefined,
  currency = "USD",
): string {
  try {
    const amount = typeof value === "string" ? Number(value) : value;
    if (
      amount === null ||
      amount === undefined ||
      Number.isNaN(Number(amount))
    ) {
      throw new Error("Invalid numeric value");
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return "$0.00";
  }
}

export const formatSubscriptionDateTime = (value?: string): string => {
  try {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
