// Site configuration
export const siteConfig = {
  name: "ContentForge AI",
  description: "AI-powered content intelligence and transformation platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/contentforgeai",
    github: "https://github.com/contentforge",
  },
};

// Navigation configuration
export const navConfig = {
  mainNav: [
    { title: "Features", href: "/features" },
    { title: "Pricing", href: "/pricing" },
    { title: "Docs", href: "/docs" },
  ],
  dashboardNav: [
    { title: "Dashboard", href: "/dashboard", icon: "home" },
    { title: "Documents", href: "/dashboard/documents", icon: "file" },
    { title: "Transform", href: "/dashboard/transform", icon: "sparkles" },
    { title: "Knowledge Base", href: "/dashboard/knowledge", icon: "brain" },
    { title: "Settings", href: "/dashboard/settings", icon: "settings" },
  ],
};

// Pricing tiers
export const pricingConfig = {
  tiers: [
    {
      name: "Free",
      price: 0,
      description: "For individuals getting started",
      features: [
        "10 transforms per month",
        "5MB max file size",
        "Basic AI analysis",
        "Community support",
      ],
      limits: {
        transforms: 10,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 10,
      },
    },
    {
      name: "Starter",
      price: 19,
      description: "For freelancers and creators",
      features: [
        "100 transforms per month",
        "50MB max file size",
        "All AI features",
        "Email support",
        "Export options",
      ],
      limits: {
        transforms: 100,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 100,
      },
    },
    {
      name: "Pro",
      price: 49,
      description: "For teams up to 3 users",
      features: [
        "500 transforms per month",
        "200MB max file size",
        "Team collaboration",
        "Priority support",
        "API access",
        "Custom templates",
      ],
      limits: {
        transforms: 500,
        maxFileSize: 200 * 1024 * 1024, // 200MB
        maxFiles: 500,
        teamMembers: 3,
      },
      popular: true,
    },
    {
      name: "Business",
      price: 99,
      description: "For growing teams up to 10 users",
      features: [
        "2000 transforms per month",
        "1GB max file size",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations",
        "SSO (coming soon)",
      ],
      limits: {
        transforms: 2000,
        maxFileSize: 1024 * 1024 * 1024, // 1GB
        maxFiles: 2000,
        teamMembers: 10,
      },
    },
  ],
};

// Feature flags
export const featureFlags = {
  enableBetaFeatures: process.env.NODE_ENV === "development",
  enableAnalytics: process.env.NEXT_PUBLIC_POSTHOG_KEY !== undefined,
};
