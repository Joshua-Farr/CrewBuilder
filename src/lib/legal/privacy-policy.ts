import type { LegalSection } from "@/lib/legal/types";

export const privacyPolicyLastUpdated = "May 29, 2026";

export const privacyPolicySections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    paragraphs: [
      "All Blue (\"we,\" \"us,\" or \"our\") operates allblue.gg and related services that provide competitive One Piece Card Game decklists, tournament results, matchup statistics, and meta analytics (the \"Service\").",
      "This Privacy Policy explains how we collect, use, disclose, and protect information when you visit or use the Service. By using the Service, you agree to the practices described here.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    paragraphs: ["We collect information in the following ways:"],
    listItems: [
      "Account information you provide when signing in, such as your email address and display name, when you use Google or email/password authentication.",
      "User-generated content you submit, including saved decklists, bookmarks, tournament reports, and profile preferences stored in your account.",
      "Usage and technical data such as pages viewed, device type, browser, approximate location derived from IP address, and referral source, collected through standard web logs and hosting analytics.",
      "Cookies and similar technologies used to keep you signed in, remember preferences, and maintain session security.",
      "Public tournament and decklist data aggregated from third-party sources and community submissions, which may include player names and event results that were already publicly available.",
    ],
  },
  {
    id: "how-we-use",
    title: "How we use information",
    paragraphs: ["We use collected information to:"],
    listItems: [
      "Provide, operate, and improve the Service, including search, filtering, meta analytics, and personalized features for signed-in users.",
      "Authenticate accounts, prevent abuse, and enforce our Terms of Service.",
      "Communicate with you about account activity, security notices, or material changes to our policies.",
      "Analyze usage trends to improve performance, reliability, and product decisions.",
      "Comply with legal obligations and respond to lawful requests.",
    ],
  },
  {
    id: "sharing",
    title: "How we share information",
    paragraphs: [
      "We do not sell your personal information. We may share information with service providers that help us run the Service, including Firebase (authentication and database hosting), Google Cloud, and Vercel (application hosting), under contracts that limit their use to providing services to us.",
      "We may disclose information if required by law, to protect the rights and safety of users or the public, or in connection with a merger, acquisition, or sale of assets, subject to appropriate confidentiality protections.",
      "Decklists, tournament results, and meta statistics displayed on the Service may be visible to other users because they are part of the competitive data experience.",
    ],
  },
  {
    id: "retention",
    title: "Data retention",
    paragraphs: [
      "We retain account and user-generated data for as long as your account is active or as needed to provide the Service. You may request deletion of your account data by contacting us.",
      "Aggregated or de-identified analytics may be retained longer because it no longer identifies you.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "We use commercially reasonable safeguards, including encrypted connections (HTTPS) and access controls on production infrastructure. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "your-rights",
    title: "Your choices and rights",
    paragraphs: [
      "Depending on where you live, you may have rights to access, correct, delete, or export personal information we hold about you, or to object to certain processing.",
      "You can sign out of your account at any time. You may also limit cookies through your browser settings, though some features may not work without essential cookies.",
      "To exercise privacy rights, contact us at the address below. We may need to verify your identity before fulfilling a request.",
    ],
  },
  {
    id: "children",
    title: "Children",
    paragraphs: [
      "The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us so we can delete it.",
    ],
  },
  {
    id: "third-party",
    title: "Third-party links and content",
    paragraphs: [
      "The Service may link to external sites or display data sourced from third parties. Their privacy practices are governed by their own policies. One Piece Card Game and related trademarks are owned by their respective rights holders; All Blue is not affiliated with Bandai or Toei Animation.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. We will post the revised version on this page and update the \"Last updated\" date. Material changes may also be communicated through the Service or by email where appropriate.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    paragraphs: [
      "Questions about this Privacy Policy or our data practices may be sent to privacy@allblue.gg.",
    ],
  },
];
