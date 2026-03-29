export type AppLocale = "en" | "fr";

export interface LandingFeatureItem {
  icon: string;
  title: string;
  desc: string;
  accent: string;
  bg: string;
}

export interface HowItWorksItem {
  n: string;
  title: string;
  desc: string;
}

export interface StrategyItem {
  name: string;
  apy: string;
  risk: string;
  desc: string;
  accentText: string;
  border: string;
  btnVariant: "primary" | "secondary";
  featured?: boolean;
}

export interface SecurityFeatureItem {
  title: string;
  stat: string;
  statLabel: string;
  desc: string;
}

export interface AppMessages {
  locale: {
    label: string;
    switcherLabel: string;
    options: Record<AppLocale, string>;
  };
  navbar: {
    features: string;
    howItWorks: string;
    strategies: string;
    help: string;
    account: string;
    signOut: string;
    signIn: string;
  };
  hero: {
    badge: string;
    titleBeforeAccent: string;
    titleAccent: string;
    titleAfterAccent: string;
    description: string;
    stats: Array<{ label: string; value: string }>;
  };
  heroActions: {
    openDashboardArrow: string;
    connectWallet: string;
    connecting: string;
    openDashboard: string;
    learnMore: string;
    errorNoWallet: string;
    errorFailedConnect: string;
  };
  features: {
    badge: string;
    title: string;
    description: string;
    items: LandingFeatureItem[];
  };
  howItWorks: {
    badge: string;
    title: string;
    description: string;
    steps: HowItWorksItem[];
  };
  strategies: {
    badge: string;
    title: string;
    description: string;
    mostPopular: string;
    apyRiskLabel: string;
    selectPrefix: string;
    items: StrategyItem[];
  };
  security: {
    badge: string;
    title: string;
    description: string;
    items: SecurityFeatureItem[];
  };
  cta: {
    badge: string;
    title: string;
    description: string;
    connectWallet: string;
    openDashboard: string;
    trust: string[];
  };
  footer: {
    builtOn: string;
    designTokens: string;
  };
  formatters: {
    updatedPrefix: string;
  };
}

export const localeToIntl: Record<AppLocale, string> = {
  en: "en-US",
  fr: "fr-FR",
};

export const dictionaries: Record<AppLocale, AppMessages> = {
  en: {
    locale: {
      label: "Language",
      switcherLabel: "Switch language",
      options: {
        en: "English",
        fr: "Français",
      },
    },
    navbar: {
      features: "Features",
      howItWorks: "How it works",
      strategies: "Strategies",
      help: "Help",
      account: "Account",
      signOut: "Sign Out",
      signIn: "Sign In",
    },
    hero: {
      badge: "Powered by Stellar · Built with AI",
      titleBeforeAccent: "Your money, working",
      titleAccent: "24/7",
      titleAfterAccent: "on autopilot",
      description:
        "NeuroWealth is an autonomous AI agent that finds and deploys your USDC into the highest-yielding opportunities on Stellar DeFi — automatically, every hour.",
      stats: [
        { label: "Avg. APY", value: "8.4%" },
        { label: "Finality", value: "~5s" },
        { label: "Tx Fee", value: "<$0.01" },
      ],
    },
    heroActions: {
      openDashboardArrow: "Open Dashboard →",
      connectWallet: "Connect Wallet",
      connecting: "Connecting...",
      openDashboard: "Open Dashboard",
      learnMore: "Learn More ↓",
      errorNoWallet: "Freighter wallet not found. Please install it.",
      errorFailedConnect: "Failed to connect. Please try again.",
    },
    features: {
      badge: "Features",
      title: "Everything you need",
      description: "Simple on the surface, powerful underneath.",
      items: [
        {
          icon: "🤖",
          title: "AI Agent",
          desc: "Autonomous 24/7 yield optimization across Stellar DeFi protocols.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
        {
          icon: "💬",
          title: "Natural Language",
          desc: "Chat to deposit, withdraw, and check balances — no DeFi knowledge needed.",
          accent: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          icon: "📈",
          title: "Auto-Rebalancing",
          desc: "The agent shifts funds to the best opportunities automatically, hourly.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
        {
          icon: "🔐",
          title: "Non-Custodial",
          desc: "Your funds live in audited Soroban smart contracts. Always yours.",
          accent: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          icon: "⚡",
          title: "Instant Withdrawals",
          desc: "No lock-ups, no penalties. Withdraw anytime in seconds.",
          accent: "text-amber-400",
          bg: "bg-amber-500/10",
        },
        {
          icon: "🌍",
          title: "Global Access",
          desc: "No geographic restrictions, no bank account required.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
      ],
    },
    howItWorks: {
      badge: "How it works",
      title: "Four steps to passive yield",
      description: "Get started in minutes, earn around the clock.",
      steps: [
        {
          n: "01",
          title: "Deposit USDC",
          desc: "Connect your Freighter wallet and deposit USDC into the NeuroWealth vault.",
        },
        {
          n: "02",
          title: "AI Deploys Funds",
          desc: "The agent detects your deposit and immediately deploys to the best protocol.",
        },
        {
          n: "03",
          title: "Yield Accumulates",
          desc: "Earnings compound 24/7. The agent rebalances hourly if better rates appear.",
        },
        {
          n: "04",
          title: "Withdraw Anytime",
          desc: "Request a withdrawal — funds arrive in your wallet within seconds.",
        },
      ],
    },
    strategies: {
      badge: "Strategies",
      title: "Choose your strategy",
      description: "Pick your risk appetite. The AI handles the rest.",
      mostPopular: "Most popular",
      apyRiskLabel: "APY · {{risk}} risk",
      selectPrefix: "Select",
      items: [
        {
          name: "Conservative",
          apy: "3–6%",
          risk: "Low",
          desc: "Stablecoin lending on Blend. Steady, predictable returns with minimal exposure.",
          accentText: "text-sky-400",
          border: "border-sky-500/20",
          btnVariant: "secondary",
        },
        {
          name: "Balanced",
          apy: "6–10%",
          risk: "Medium",
          desc: "Mix of lending and DEX liquidity provision for better yield without excessive risk.",
          accentText: "text-emerald-400",
          border: "border-emerald-500/30",
          btnVariant: "primary",
          featured: true,
        },
        {
          name: "Growth",
          apy: "10–15%",
          risk: "Higher",
          desc: "Aggressive multi-protocol deployment for maximum returns.",
          accentText: "text-amber-400",
          border: "border-amber-500/20",
          btnVariant: "secondary",
        },
      ],
    },
    security: {
      badge: "Security",
      title: "Built to be trusted",
      description: "Security is not an afterthought — it is the foundation.",
      items: [
        {
          title: "Non-Custodial",
          stat: "100%",
          statLabel: "Your keys, your coins",
          desc: "Your USDC stays in audited Soroban smart contracts that only you can authorize. We never hold or access your private keys.",
        },
        {
          title: "Audited Contracts",
          stat: "0",
          statLabel: "Security incidents",
          desc: "All smart contracts undergo rigorous third-party security audits before mainnet deployment. Source code is publicly verifiable on-chain.",
        },
        {
          title: "Open Source",
          stat: "100%",
          statLabel: "Transparent code",
          desc: "Every line of code is open source and community-reviewed. No black boxes — verify exactly what the protocol does with your funds.",
        },
        {
          title: "Stellar Network",
          stat: "10+",
          statLabel: "Years of proven uptime",
          desc: "Built on Stellar's battle-tested blockchain with a decade of proven reliability, instant finality (~5s), and sub-cent transaction fees.",
        },
      ],
    },
    cta: {
      badge: "Get started today",
      title: "Ready to put your USDC to work?",
      description:
        "Join thousands earning passive yield on Stellar DeFi. Connect your Freighter wallet and let NeuroWealth handle the rest.",
      connectWallet: "Connect Wallet",
      openDashboard: "Open Dashboard",
      trust: [
        "✔ Non-custodial",
        "✔ Audited contracts",
        "✔ No lock-ups",
        "✔ Open source",
      ],
    },
    footer: {
      builtOn: "Built on Stellar",
      designTokens: "Design Tokens",
    },
    formatters: {
      updatedPrefix: "Updated",
    },
  },
  fr: {
    locale: {
      label: "Langue",
      switcherLabel: "Changer de langue",
      options: {
        en: "Anglais",
        fr: "Français",
      },
    },
    navbar: {
      features: "Fonctionnalités",
      howItWorks: "Comment ça marche",
      strategies: "Stratégies",
      help: "Aide",
      account: "Compte",
      signOut: "Se déconnecter",
      signIn: "Se connecter",
    },
    hero: {
      badge: "Propulsé par Stellar · Construit avec l’IA",
      titleBeforeAccent: "Votre argent travaille",
      titleAccent: "24h/24",
      titleAfterAccent: "en pilote automatique",
      description:
        "NeuroWealth est un agent IA autonome qui place votre USDC dans les meilleures opportunités de rendement de l’écosystème DeFi Stellar — automatiquement, avec optimisation horaire.",
      stats: [
        { label: "APY moy.", value: "8,4 %" },
        { label: "Finalité", value: "~5 s" },
        { label: "Frais tx", value: "<0,01 $" },
      ],
    },
    heroActions: {
      openDashboardArrow: "Ouvrir le tableau de bord →",
      connectWallet: "Connecter le wallet",
      connecting: "Connexion en cours...",
      openDashboard: "Ouvrir le tableau de bord",
      learnMore: "En savoir plus ↓",
      errorNoWallet:
        "Wallet Freighter introuvable. Veuillez l’installer.",
      errorFailedConnect:
        "Échec de la connexion. Veuillez réessayer.",
    },
    features: {
      badge: "Fonctionnalités",
      title: "Tout ce dont vous avez besoin",
      description: "Simple en surface, puissant en profondeur.",
      items: [
        {
          icon: "🤖",
          title: "Agent IA autonome",
          desc: "Optimisation du rendement 24h/24 et 7j/7 sur plusieurs protocoles DeFi Stellar.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
        {
          icon: "💬",
          title: "Langage naturel",
          desc: "Déposer, retirer et vérifier vos soldes par chat — sans expertise DeFi.",
          accent: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          icon: "📈",
          title: "Rééquilibrage automatique",
          desc: "L’agent réalloue vos fonds automatiquement vers les meilleures opportunités.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
        {
          icon: "🔐",
          title: "Non-custodial",
          desc: "Vos fonds restent dans des smart contracts Soroban audités. Vous gardez le contrôle.",
          accent: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          icon: "⚡",
          title: "Retraits instantanés",
          desc: "Aucun blocage, aucune pénalité. Retirez vos fonds à tout moment en quelques secondes.",
          accent: "text-amber-400",
          bg: "bg-amber-500/10",
        },
        {
          icon: "🌍",
          title: "Accès global",
          desc: "Sans restriction géographique et sans compte bancaire traditionnel.",
          accent: "text-sky-400",
          bg: "bg-sky-500/10",
        },
      ],
    },
    howItWorks: {
      badge: "Comment ça marche",
      title: "Quatre étapes vers le rendement passif",
      description: "Commencez en quelques minutes, gagnez en continu.",
      steps: [
        {
          n: "01",
          title: "Déposer des USDC",
          desc: "Connectez votre wallet Freighter et déposez des USDC dans le vault NeuroWealth.",
        },
        {
          n: "02",
          title: "L’IA déploie les fonds",
          desc: "L’agent détecte votre dépôt et l’alloue immédiatement au meilleur protocole.",
        },
        {
          n: "03",
          title: "Les rendements s’accumulent",
          desc: "Les gains se composent 24h/24. L’agent rééquilibre dès qu’un meilleur taux apparaît.",
        },
        {
          n: "04",
          title: "Retirer à tout moment",
          desc: "Demandez un retrait — les fonds arrivent dans votre wallet en quelques secondes.",
        },
      ],
    },
    strategies: {
      badge: "Stratégies",
      title: "Choisissez votre stratégie",
      description: "Définissez votre niveau de risque. L’IA gère le reste.",
      mostPopular: "La plus populaire",
      apyRiskLabel: "APY · risque {{risk}}",
      selectPrefix: "Choisir",
      items: [
        {
          name: "Prudente",
          apy: "3–6 %",
          risk: "faible",
          desc: "Prêts en stablecoins sur Blend pour des rendements stables et prévisibles.",
          accentText: "text-sky-400",
          border: "border-sky-500/20",
          btnVariant: "secondary",
        },
        {
          name: "Équilibrée",
          apy: "6–10 %",
          risk: "moyen",
          desc: "Combinaison de lending et de liquidité DEX pour un bon équilibre risque/rendement.",
          accentText: "text-emerald-400",
          border: "border-emerald-500/30",
          btnVariant: "primary",
          featured: true,
        },
        {
          name: "Croissance",
          apy: "10–15 %",
          risk: "élevé",
          desc: "Allocation agressive multi-protocole pour maximiser le potentiel de rendement.",
          accentText: "text-amber-400",
          border: "border-amber-500/20",
          btnVariant: "secondary",
        },
      ],
    },
    security: {
      badge: "Sécurité",
      title: "Conçu pour inspirer confiance",
      description: "La sécurité n’est pas une option — c’est la base.",
      items: [
        {
          title: "Non-custodial",
          stat: "100 %",
          statLabel: "Vos clés, vos fonds",
          desc: "Vos USDC restent dans des smart contracts Soroban audités que vous seul pouvez autoriser.",
        },
        {
          title: "Contrats audités",
          stat: "0",
          statLabel: "incident de sécurité",
          desc: "Tous les smart contracts passent des audits de sécurité tiers avant déploiement mainnet.",
        },
        {
          title: "Open Source",
          stat: "100 %",
          statLabel: "code transparent",
          desc: "Chaque ligne de code est ouverte et vérifiable par la communauté — sans boîte noire.",
        },
        {
          title: "Réseau Stellar",
          stat: "10+",
          statLabel: "ans de disponibilité prouvée",
          desc: "Basé sur la blockchain Stellar, avec finalité rapide et frais de transaction très faibles.",
        },
      ],
    },
    cta: {
      badge: "Commencez dès aujourd’hui",
      title: "Prêt à faire travailler vos USDC ?",
      description:
        "Rejoignez des milliers d’utilisateurs qui génèrent un rendement passif sur la DeFi Stellar.",
      connectWallet: "Connecter le wallet",
      openDashboard: "Ouvrir le tableau de bord",
      trust: [
        "✔ Non-custodial",
        "✔ Contrats audités",
        "✔ Aucun blocage",
        "✔ Open source",
      ],
    },
    footer: {
      builtOn: "Construit sur Stellar",
      designTokens: "Tokens de design",
    },
    formatters: {
      updatedPrefix: "Mis à jour",
    },
  },
};
