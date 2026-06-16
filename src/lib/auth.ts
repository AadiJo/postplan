const DEFAULT_ALLOWED_EMAIL = "zakethegr8@gmail.com";

type ClerkUserEmail = {
  id?: string;
  emailAddress?: string;
};

type ClerkUserLike = {
  emailAddresses?: ClerkUserEmail[];
  primaryEmailAddressId?: string | null;
};

export function getAllowedEmail() {
  return (import.meta.env.POSTPLAN_ALLOWED_EMAIL || DEFAULT_ALLOWED_EMAIL).trim().toLowerCase();
}

export function getUserPrimaryEmail(user: ClerkUserLike | null) {
  if (!user?.emailAddresses?.length) {
    return "";
  }

  const primary = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);

  return (primary?.emailAddress || user.emailAddresses[0]?.emailAddress || "").toLowerCase();
}

export function isAllowedEmail(email: string) {
  return email.trim().toLowerCase() === getAllowedEmail();
}
