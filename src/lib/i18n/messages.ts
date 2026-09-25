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
  common: {
    comingSoon: string;
    loading: string;
    retry: string;
    save: string;
    cancel: string;
    edit: string;
    open: string;
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
  dashboard: {
    realtime: {
      noEvents: string;
      simulatedStream: string;
      firesEvery: string;
      start: string;
      stop: string;
      reset: string;
      eventsFired: string;
      deltaBalance: string;
      deltaYield: string;
      deltaApy: string;
      eventLog: string;
      status: {
        live: string;
        paused: string;
        idle: string;
      };
    };
    portfolio: {
      overview: string;
      overviewDesc: string;
      themePreview: string;
      lightMode: string;
      darkMode: string;
      scenarioPreview: string;
      liveWidgets: string;
      emptyStates: string;
      loadingWidget: string;
      syncingData: string;
      source: string;
      sandbox: string;
      theme: string;
      unavailableTitle: string;
      unavailableDesc: string;
      retryWidgets: string;
      allocationTitle: string;
      allocationDesc: string;
      lines: string;
      line: string;
      emptyAllocation: string;
      loadSample: string;
      activityTitle: string;
      activityDesc: string;
      events: string;
      event: string;
      emptyActivity: string;
      noAmount: string;
    };
  };
  settings: {
    index: {
      title: string;
      subtitle: string;
      appearance: {
        title: string;
        themeTitle: string;
        themeDesc: string;
      };
      profile: {
        title: string;
        displayTitle: string;
        displayDesc: string;
        editAction: string;
        regionTitle: string;
        regionDesc: string;
        openAction: string;
      };
      wallet: {
        title: string;
        connectedTitle: string;
        connectedDesc: string;
        networkTitle: string;
        networkDesc: string;
      };
      notifications: {
        title: string;
        emailTitle: string;
        emailDesc: string;
        whatsappTitle: string;
        whatsappDesc: string;
      };
      security: {
        title: string;
        twoFactorTitle: string;
        twoFactorDesc: string;
        sessionTitle: string;
        sessionDesc: string;
      };
      region: {
        title: string;
        currencyTitle: string;
        currencyDesc: string;
        openAction: string;
      };
    };
    preferences: {
      title: string;
      subtitle: string;
      savedSuccess: string;
      saveError: string;
      localisation: {
        title: string;
        desc: string;
        localeLabel: string;
      };
      appearance: {
        title: string;
        desc: string;
        themeLabel: string;
        light: string;
        dark: string;
        system: string;
      };
      timeCurrency: {
        title: string;
        desc: string;
        timezoneLabel: string;
        currencyLabel: string;
      };
      actions: {
        edit: string;
        unsaved: string;
        cancel: string;
        save: string;
        saving: string;
      };
    };
    notifications: {
      title: string;
      subtitle: string;
      channels: {
        title: string;
        desc: string;
        emailTitle: string;
        emailDesc: string;
        transactionTitle: string;
        transactionDesc: string;
        weeklyTitle: string;
        weeklyDesc: string;
        productTitle: string;
        productDesc: string;
        securityTitle: string;
        securityDesc: string;
      };
      summary: {
        title: string;
        desc: string;
        enabledPreferences: string;
        emailChannel: string;
        active: string;
        muted: string;
        securityCoverage: string;
        protected: string;
        atRisk: string;
      };
      saveBehavior: {
        title: string;
        desc: string;
      };
      securityAlertsOff: {
        title: string;
        desc: string;
      };
      actions: {
        edit: string;
        unsaved: string;
        noPending: string;
        cancel: string;
        save: string;
        saving: string;
        restoreAlerts: string;
      };
      toast: {
        savedTitle: string;
        savedDesc: string;
        failTitle: string;
        failDesc: string;
      };
      banner: {
        savedTitle: string;
        failTitle: string;
        failDesc: string;
      };
    };
    security: {
      title: string;
      subtitle: string;
      banner: {
        success: string;
        error: string;
      };
      password: {
        title: string;
        desc: string;
        lastChangedLabel: string;
        daysAgoSuffix: string;
        warning: string;
        changeAction: string;
      };
      twoFactor: {
        title: string;
        desc: string;
        enableLabel: string;
        enabledHint: string;
        disabledHint: string;
      };
      loginAlerts: {
        title: string;
        desc: string;
        enableLabel: string;
        enabledHint: string;
        disabledHint: string;
      };
      actions: {
        edit: string;
        unsaved: string;
        cancel: string;
        save: string;
        saving: string;
      };
      modal: {
        title: string;
        closeLabel: string;
        newPasswordLabel: string;
        newPasswordPlaceholder: string;
        cancel: string;
        updating: string;
        update: string;
      };
    };
    privacy: {
      title: string;
      subtitle: string;
      cookieSection: {
        title: string;
        desc: string;
      };
    };
    strategies: {
      eyebrow: string;
      title: string;
      description: string;
      backToPortfolio: string;
      currentBadge: string;
      activeStrategyButton: string;
      comparison: {
        title: string;
        featureHeader: string;
        activeBadge: string;
        apyRangeLabel: string;
        riskLevelLabel: string;
      };
      success: {
        updated: string;
      };
      confirmModal: {
        title: string;
        switchingFrom: string;
        settingTo: string;
        note: string;
        cancel: string;
        confirm: string;
        saving: string;
        closeLabel: string;
      };
      cards: {
        conservative: { title: string; riskLabel: string; description: string; primaryAction: string };
        balanced: { title: string; riskLabel: string; description: string; primaryAction: string };
        growth: { title: string; riskLabel: string; description: string; primaryAction: string };
      };
    };
    onboarding: {
      title: string;
      subtitle: string;
      statusLabel: string;
      statusCompleted: string;
      statusInProgress: string;
      lastStepLabel: string;
      lastStepValue: string;
      completedLabel: string;
      actionsTitle: string;
      reviewAction: string;
      resetAction: string;
      resetting: string;
      confirmReset: string;
      toastFailTitle: string;
      toastFailDesc: string;
      helpReviewLabel: string;
      helpReviewDesc: string;
      helpResetLabel: string;
      helpResetDesc: string;
    };
    themeSelector: {
      ariaLabel: string;
    };
  };
  transactions: {
    shared: {
      amount: string;
      fees: string;
      strategy: string;
      transactionReference: string;
    };
    flow: {
      eyebrow: string;
      heading: string;
      intro: string;
      themePreview: string;
      lightMode: string;
      darkMode: string;
      screenshotStates: string;
      liveFlow: string;
      previewStates: {
        validation: string;
        confirm: string;
        pending: string;
        success: string;
        failure: string;
      };
      deposit: string;
      withdraw: string;
      step1: string;
      step2: string;
      step3: string;
      enterDetails: string;
      confirm: string;
      trackResult: string;
      walletConditions: string;
      connectedWallet: string;
      availableBalance: string;
      validationRules: string;
      minimum: string;
      lifecycle: string;
      lifecycleValue: string;
      routes: string;
      portfolioOverview: string;
      transactionFlow: string;
    };
    recovery: {
      error: string;
      includeReference: string;
      tryAgain: string;
      reviewUpdate: string;
    };
    confirm: {
      confirmDeposit: string;
      confirmWithdrawal: string;
      depositAmount: string;
      withdrawalAmount: string;
      totalDebit: string;
      netDestinationAmount: string;
      shareReference: string;
      confirmAfterReview: string;
      back: string;
      submitting: string;
    };
    form: {
      available: string;
      max: string;
      amountValid: string;
      disconnect: string;
      reconnect: string;
      depositUsesWallet: string;
      disconnectVault: string;
      reconnectVault: string;
      destinationValid: string;
      anchoredNote: string;
      preparing: string;
    };
    pending: {
      processing: string;
      keepReference: string;
      requestedAmount: string;
      settlementTarget: string;
    };
    receipt: {
      success: string;
      failed: string;
      receiptIncludes: string;
      retryAfterReview: string;
      creditedAmount: string;
      destinationAmount: string;
      settledAt: string;
      startNew: string;
      retryUpdated: string;
      newTransaction: string;
      switchFlow: string;
    };
    history: {
      eyebrow: string;
      title: string;
      intro: string;
      all: string;
      deposits: string;
      withdrawals: string;
      rebalances: string;
      statusSuccess: string;
      statusPending: string;
      statusFailed: string;
      kindDeposit: string;
      kindWithdrawal: string;
      kindRebalance: string;
      noMatching: string;
      noHistory: string;
      adjustFilters: string;
      firstDeposit: string;
      clearAllFilters: string;
      makeDeposit: string;
      showing: string;
      of: string;
      paginationLabel: string;
      previousPage: string;
      nextPage: string;
      pageN: string;
      type: string;
      status: string;
      dateRange: string;
      fromDate: string;
      toDate: string;
      to: string;
      clearFilters: string;
      description: string;
      date: string;
      txHash: string;
      tx: string;
      loadError: string;
      loadingLabel: string;
      loadingText: string;
    };
  };
    domain: {
      context: {
        withdrawFunds: string;
        withdrawIntro: string;
        reviewWithdrawal: string;
        confirmWithdrawal: string;
        withdrawalAmount: string;
        withdrawHint: string;
        destinationWallet: string;
        destinationHint: string;
        vaultReady: string;
        sameDay: string;
        treasuryReview: string;
        addCapital: string;
        depositIntro: string;
        reviewDeposit: string;
        confirmDeposit: string;
        depositAmount: string;
        depositHint: string;
        fundingWallet: string;
        fundingHint: string;
        freighterConnected: string;
        usuallyCompletes: string;
        networkFee: string;
      };
      validation: {
        connectFunding: string;
        reconnectVault: string;
        enterAmount: string;
        validAmount: string;
        minDeposit: (min: number) => string;
        minWithdrawal: (min: number) => string;
        fundingAvailable: (amt: string) => string;
        withdrawAvailable: (amt: string) => string;
        enterDestination: string;
        validStellarAddress: string;
      };
      pending: {
        statusLabel: string;
        submittingDeposit: string;
        submittingWithdrawal: string;
        feeExpired: string;
        liquidityChanged: string;
      };
      receipt: {
        depositConfirmed: string;
        withdrawalConfirmed: string;
        failed: string;
        explorerAvailable: string;
      };
      statusChips: {
        walletRequired: string;
        depositCapacity: (amt: string) => string;
        withdrawalCapacity: (amt: string) => string;
      };
      recovery: {
        networkErrorTitle: string;
        networkErrorDesc: string;
        timeoutTitle: string;
        timeoutDesc: string;
        serverErrorTitle: string;
        serverErrorDesc: string;
        validationErrorTitle: string;
        validationErrorDesc: string;
        quotaErrorTitle: string;
        quotaErrorDesc: string;
        stateConflictTitle: string;
        stateConflictDesc: string;
        unknownErrorTitle: string;
        unknownErrorDesc: string;
        actionRetry: string;
        actionEdit: string;
        actionSupport: string;
        actionBack: string;
        actionReview: string;
      };
    };
  audit: {
    title: string;
    subtitle: string;
    exportCsv: string;
    filterAriaLabel: string;
    allEvents: string;
    eventTypes: {
      login: string;
      logout: string;
      signup: string;
      profile_update: string;
      password_change: string;
      settings_change: string;
      transaction: string;
      export: string;
    };
    sortAscending: string;
    sortDescending: string;
    newest: string;
    oldest: string;
    columns: {
      eventType: string;
      timestamp: string;
      actor: string;
      ipAddress: string;
      details: string;
    };
    noEvents: string;
    notAvailable: string;
    expandDetails: string;
    collapseDetails: string;
    show: string;
    hide: string;
    expandedDetailsLabel: string;
    metadata: string;
    paginationLabel: string;
    of: string;
    previousPage: string;
    nextPage: string;
    pageLabel: string;
  };
  profile: {
    pageTitleFallback: string;
    pageSubtitle: string;
    editProfile: string;
    breadcrumbLabel: string;
    breadcrumbSettings: string;
    breadcrumbProfile: string;
    fixErrorsOne: string;
    fixErrorsMany: string;
    saveSuccess: string;
    notSet: string;
    identity: {
      title: string;
      description: string;
      displayName: string;
      displayNamePlaceholder: string;
    };
    localisation: {
      title: string;
      description: string;
      locale: string;
    };
    timeCurrency: {
      title: string;
      description: string;
      timezone: string;
      currencyFormat: string;
      sample: string;
    };
    actions: {
      groupLabel: string;
      unsaved: string;
      cancel: string;
      saving: string;
      save: string;
    };
    errors: {
      displayNameRequired: string;
      displayNameMin: string;
      displayNameMax: string;
      localeRequired: string;
      timezoneRequired: string;
      currencyRequired: string;
      unknown: string;
    };
  };
  help: {
    faq: {
      searchLabel: string;
      searchPlaceholder: string;
      searchAria: string;
      filterLabel: string;
      filterAria: string;
      found: string;
      faqSingular: string;
      faqPlural: string;
      noResults: string;
      noResultsHint: string;
      categories: {
        all: string;
        gettingStarted: string;
        security: string;
        transactions: string;
        assets: string;
        staking: string;
        support: string;
      };
      items: {
        id: string;
        q: string;
        a: string;
      }[];
    };
    support: {
      categories: {
        technicalIssue: string;
        transactionProblem: string;
        accountAccess: string;
        securityConcern: string;
        generalInquiry: string;
        featureRequest: string;
        bugReport: string;
      };
      nameRequired: string;
      nameMin: string;
      emailRequired: string;
      emailInvalid: string;
      subjectRequired: string;
      subjectMax: string;
      categoryRequired: string;
      messageRequired: string;
      messageRange: string;
      transactionLookupFailed: string;
      submitFailed: string;
      contactSectionError: string;
      requestSectionError: string;
      successTitle: string;
      successBody: string;
      referenceId: string;
      submitAnother: string;
      title: string;
      subtitle: string;
      errorSummaryTitle: string;
      contactDetails: string;
      requestDetails: string;
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      categoryLabel: string;
      subjectLabel: string;
      subjectHint: string;
      subjectPlaceholder: string;
      transactionIdLabel: string;
      transactionIdHintBefore: string;
      transactionIdHintAfter: string;
      transactionIdPlaceholder: string;
      messageLabel: string;
      messageHint: string;
      messagePlaceholder: string;
      submitting: string;
      submit: string;
      otherOptions: string;
      liveChat: string;
      emailSupport: string;
      forum: string;
    };
    guidance: {
      title: string;
      subtitle: string;
      commonIssues: string;
      severity: {
        low: string;
        medium: string;
        high: string;
      };
      priority: string;
      symptoms: string;
      solutions: string;
      prevention: string;
      quickActions: string;
      checkStatus: string;
      networkStatus: string;
      backToAll: string;
      contactSupport: string;
      selectIssue: string;
      selectIssueHint: string;
      emergencyTitle: string;
      emergencyBody: string;
      emergencySupport: string;
      emailEmergency: string;
      issues: {
        id: string;
        severity: 'low' | 'medium' | 'high';
        title: string;
        description: string;
        symptoms: string[];
        solutions: string[];
        preventive: string[];
      }[];
    };
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
    common: {
      comingSoon: "Coming soon",
      loading: "Loading...",
      retry: "Retry",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      open: "Open",
    },
    navbar: {
      features: "Features",
      howItWorks: "How it works",
      strategies: "Strategies",
      help: "Help",
      account: "Account",
      signOut: "Sign Out",
      signIn: "Sign in",
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
          apy: "4–6%",
          risk: "Low",
          desc: "Stablecoin lending on Blend. Steady, predictable returns with minimal exposure.",
          accentText: "text-sky-400",
          border: "border-sky-500/20",
          btnVariant: "secondary",
        },
        {
          name: "Balanced",
          apy: "7–10%",
          risk: "Medium",
          desc: "Mix of lending and DEX liquidity provision for better yield without excessive risk.",
          accentText: "text-emerald-400",
          border: "border-emerald-500/30",
          btnVariant: "primary",
          featured: true,
        },
        {
          name: "Growth",
          apy: "11–18%",
          risk: "High",
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
    dashboard: {
      realtime: {
        noEvents: "No events yet — start the stream to see live updates.",
        simulatedStream: "Simulated event stream",
        firesEvery: "Fires deposits, withdrawals, and rebalances every 4–9 s",
        start: "Start",
        stop: "Stop",
        reset: "Reset",
        eventsFired: "Events fired",
        deltaBalance: "Δ Balance",
        deltaYield: "Δ Yield",
        deltaApy: "Δ APY",
        eventLog: "Event log",
        status: {
          live: "Live",
          paused: "Paused",
          idle: "Idle",
        },
      },
      portfolio: {
        overview: "NeuroWealth overview",
        overviewDesc: "Total balance, yield, APY, strategy, allocation, and recent activity in a single review surface with measurable light and dark theme parity.",
        themePreview: "Theme preview",
        lightMode: "Light mode",
        darkMode: "Dark mode",
        scenarioPreview: "Scenario preview",
        liveWidgets: "Live widgets",
        emptyStates: "Empty states",
        loadingWidget: "Loading portfolio widget state...",
        syncingData: "Syncing portfolio data",
        source: "Source",
        sandbox: "Sandbox",
        theme: "Theme",
        unavailableTitle: "Portfolio widgets unavailable",
        unavailableDesc: "The dashboard can retry once connectivity to the portfolio API is restored.",
        retryWidgets: "Retry widgets",
        allocationTitle: "Asset allocation",
        allocationDesc: "Visible deployment mix across strategy buckets and reserve capital.",
        lines: "allocation lines",
        line: "allocation line",
        emptyAllocation: "No allocation yet. Add a deposit to see deployed positions and reserve coverage.",
        loadSample: "Load sample data",
        activityTitle: "Recent activity",
        activityDesc: "Latest deposits, yield events, rebalances, and scheduled cash flows.",
        events: "events",
        event: "event",
        emptyActivity: "No recent activity yet. Deposits and rebalances will appear here as soon as they happen.",
        noAmount: "No amount",
      },
    },
    settings: {
      index: {
        title: "Settings",
        subtitle: "Manage your account preferences and connected wallet.",
        appearance: {
          title: "Appearance",
          themeTitle: "Theme",
          themeDesc: "Choose between light, dark, or system preference.",
        },
        profile: {
          title: "Profile",
          displayTitle: "Display Name & Preferences",
          displayDesc: "Edit your display name, locale, timezone, and currency format.",
          editAction: "Edit profile",
          regionTitle: "Language & Region",
          regionDesc: "Change your locale and regional display settings.",
          openAction: "Open",
        },
        wallet: {
          title: "Wallet",
          connectedTitle: "Connected Wallet",
          connectedDesc: "Freighter wallet connection for signing transactions.",
          networkTitle: "Network",
          networkDesc: "Switch between Stellar Testnet and Mainnet.",
        },
        notifications: {
          title: "Notifications",
          emailTitle: "Email Alerts",
          emailDesc: "Receive email notifications for deposits, withdrawals, and rebalances.",
          whatsappTitle: "WhatsApp Notifications",
          whatsappDesc: "Get updates via WhatsApp messaging.",
        },
        security: {
          title: "Security",
          twoFactorTitle: "Two-Factor Authentication",
          twoFactorDesc: "Add an extra layer of security to your account.",
          sessionTitle: "Session Management",
          sessionDesc: "View and revoke active sessions.",
        },
        region: {
          title: "Region",
          currencyTitle: "Currency Display",
          currencyDesc: "Choose your preferred display currency (USD, EUR, GBP).",
          openAction: "Open profile",
        },
      },
      preferences: {
        title: "Preferences",
        subtitle: "Manage language, timezone, and currency settings",
        savedSuccess: "Preferences saved successfully",
        saveError: "Failed to save preferences. Please try again.",
        localisation: {
          title: "Localisation",
          desc: "Language and regional display preferences",
          localeLabel: "Locale",
        },
        appearance: {
          title: "Appearance",
          desc: "Theme and visual display preferences",
          themeLabel: "Theme",
          light: "Light",
          dark: "Dark",
          system: "System",
        },
        timeCurrency: {
          title: "Time & Currency",
          desc: "Timezone and numeric format settings",
          timezoneLabel: "Timezone",
          currencyLabel: "Currency Format",
        },
        actions: {
          edit: "Edit Preferences",
          unsaved: "Unsaved changes",
          cancel: "Cancel",
          save: "Save Changes",
          saving: "Saving…",
        },
      },
      notifications: {
        title: "Notifications",
        subtitle: "Manage the alerts we send across email, account activity, and security events.",
        channels: {
          title: "Delivery channels",
          desc: "Choose which updates reach inboxes, dashboards, and weekly summaries.",
          emailTitle: "Email notifications",
          emailDesc: "Receive delivery updates and account notices in your inbox.",
          transactionTitle: "Transaction alerts",
          transactionDesc: "Send a notification whenever a deposit, withdrawal, or rebalance completes.",
          weeklyTitle: "Weekly digest",
          weeklyDesc: "Bundle performance summaries and highlights into a single weekly update.",
          productTitle: "Product updates",
          productDesc: "Hear about launches, experiments, and platform improvements.",
          securityTitle: "Security alerts",
          securityDesc: "Critical sign-in, wallet, and suspicious-activity notifications.",
        },
        summary: {
          title: "Current summary",
          desc: "Track enabled signals before publishing changes.",
          enabledPreferences: "Enabled preferences",
          emailChannel: "Email channel",
          active: "Active",
          muted: "Muted",
          securityCoverage: "Security coverage",
          protected: "Protected",
          atRisk: "At risk",
        },
        saveBehavior: {
          title: "Save behavior",
          desc: "Successful saves emit a success banner and toast. Disabling security alerts simulates a blocked save.",
        },
        securityAlertsOff: {
          title: "Security alerts are turned off",
          desc: "High-risk account events may be missed until you re-enable security coverage.",
        },
        actions: {
          edit: "Edit Preferences",
          unsaved: "Unsaved changes",
          noPending: "No pending changes",
          cancel: "Cancel",
          save: "Save Changes",
          saving: "Saving...",
          restoreAlerts: "Restore security alerts",
        },
        toast: {
          savedTitle: "Preferences saved",
          savedDesc: "Your notification rules were updated for future account activity.",
          failTitle: "Save failed",
          failDesc: "Security alerts are required in this mocked flow. Re-enable them and try again.",
        },
        banner: {
          savedTitle: "Notification preferences saved",
          failTitle: "Unable to save your current selection",
          failDesc: "This mocked failure path intentionally blocks saving while security alerts are disabled.",
        },
      },
      security: {
        title: "Security",
        subtitle: "Manage your password, two-factor authentication, and login alerts.",
        banner: {
          success: "Security settings updated successfully",
          error: "Failed to update security settings. Please try again.",
        },
        password: {
          title: "Password",
          desc: "Keep your account secure with a strong, regularly updated password.",
          lastChangedLabel: "Last changed",
          daysAgoSuffix: "days ago",
          warning: "Your password is over 90 days old. Consider updating it.",
          changeAction: "Change password",
        },
        twoFactor: {
          title: "Two-Factor Authentication",
          desc: "Add an extra layer of security to your account.",
          enableLabel: "Enable two-factor authentication",
          enabledHint: "Two-factor authentication is protecting your account.",
          disabledHint: "Enable two-factor authentication for stronger protection.",
        },
        loginAlerts: {
          title: "Login Alerts",
          desc: "Get notified whenever a new device signs in to your account.",
          enableLabel: "Enable login alerts",
          enabledHint: "You'll be notified of new sign-ins.",
          disabledHint: "You won't be notified of new sign-ins.",
        },
        actions: {
          edit: "Edit Security Settings",
          unsaved: "Unsaved changes",
          cancel: "Cancel",
          save: "Save Changes",
          saving: "Saving…",
        },
        modal: {
          title: "Change password",
          closeLabel: "Close",
          newPasswordLabel: "New password",
          newPasswordPlaceholder: "Enter new password",
          cancel: "Cancel",
          updating: "Updating…",
          update: "Update password",
        },
      },
      privacy: {
        title: "Privacy",
        subtitle: "Control how NeuroWealth uses cookies and data on your device.",
        cookieSection: {
          title: "Cookie & Privacy Preferences",
          desc: "Review your current consent status and adjust which cookie categories are active.",
        },
      },
      strategies: {
        eyebrow: "Settings",
        title: "Choose your strategy",
        description: "Select the risk/APY profile that matches your goals. Your active positions will rebalance on the next scheduled cycle.",
        backToPortfolio: "Back to portfolio",
        currentBadge: "Current",
        activeStrategyButton: "Active strategy",
        comparison: {
          title: "Strategy comparison",
          featureHeader: "Feature",
          activeBadge: "active",
          apyRangeLabel: "APY range",
          riskLevelLabel: "Risk level",
        },
        success: {
          updated: "Strategy updated to {{strategy}}. Rebalancing will apply on the next scheduled cycle.",
        },
        confirmModal: {
          title: "Confirm strategy change",
          switchingFrom: "Switching from {{from}} to {{to}}.",
          settingTo: "Setting your strategy to {{to}}.",
          note: "Active positions will be rebalanced on the next scheduled cycle. This change does not trigger an immediate on-chain transaction.",
          cancel: "Cancel",
          confirm: "Confirm change",
          saving: "Saving…",
          closeLabel: "Cancel",
        },
        cards: {
          conservative: {
            title: "Conservative",
            riskLabel: "Low risk",
            description: "Stablecoin lending and idle reserve coverage. Capital-preserving with predictable yield and minimal drawdown exposure.",
            primaryAction: "Select Conservative",
          },
          balanced: {
            title: "Balanced",
            riskLabel: "Medium risk",
            description: "Yield split across Blend lending, DEX liquidity, and a stable reserve. Best for steady growth with controlled volatility.",
            primaryAction: "Select Balanced",
          },
          growth: {
            title: "Growth",
            riskLabel: "High risk",
            description: "Leans into incentive programs, active rebalancing, and higher-volatility positions. Maximum upside with elevated risk.",
            primaryAction: "Select Growth",
          },
        },
      },
      onboarding: {
        title: "Onboarding Settings",
        subtitle: "Manage your onboarding progress and review setup steps.",
        statusLabel: "Status",
        statusCompleted: "Completed",
        statusInProgress: "In Progress",
        lastStepLabel: "Last Step:",
        lastStepValue: "Step {{step}}",
        completedLabel: "Completed:",
        actionsTitle: "Actions",
        reviewAction: "Review Onboarding",
        resetAction: "Reset Onboarding",
        resetting: "Resetting...",
        confirmReset: "Are you sure you want to reset the onboarding process? This will allow you to go through the setup again.",
        toastFailTitle: "Failed to reset onboarding",
        toastFailDesc: "Please try again.",
        helpReviewLabel: "Review Onboarding:",
        helpReviewDesc: "Go through the setup steps again without changing your current settings.",
        helpResetLabel: "Reset Onboarding:",
        helpResetDesc: "Clear all onboarding progress and start fresh from the beginning.",
      },
      themeSelector: {
        ariaLabel: "Theme selection",
      },
    },
    transactions: {
      shared: {
        amount: "Amount",
        fees: "Fees",
        strategy: "Strategy",
        transactionReference: "Transaction reference",
      },
      flow: {
        eyebrow: "Transaction flows",
        heading: "Deposit and withdrawal flow",
        intro: "Validate amounts and wallet conditions, confirm fees and request references, then review pending, success, and failure states from one mobile-friendly surface.",
        themePreview: "Theme preview",
        lightMode: "Light mode",
        darkMode: "Dark mode",
        screenshotStates: "Screenshot states",
        liveFlow: "Live flow",
        previewStates: {
          validation: "validation",
          confirm: "confirm",
          pending: "pending",
          success: "success",
          failure: "failure",
        },
        deposit: "Deposit",
        withdraw: "Withdraw",
        step1: "Step 1",
        step2: "Step 2",
        step3: "Step 3",
        enterDetails: "Enter details",
        confirm: "Confirm",
        trackResult: "Track result",
        walletConditions: "Wallet conditions",
        connectedWallet: "Connected wallet",
        availableBalance: "Available balance",
        validationRules: "Validation rules",
        minimum: "Minimum",
        lifecycle: "Lifecycle",
        lifecycleValue: "Pending, success, and failure states included",
        routes: "Routes",
        portfolioOverview: "Portfolio overview",
        transactionFlow: "Transaction flow",
      },
      recovery: {
        error: "Error",
        includeReference: "Include this reference when contacting support.",
        tryAgain: "Please try again.",
        reviewUpdate: "Please review and update your details.",
      },
      confirm: {
        confirmDeposit: "Confirm deposit",
        confirmWithdrawal: "Confirm withdrawal",
        depositAmount: "Deposit amount",
        withdrawalAmount: "Withdrawal amount",
        totalDebit: "Total debit",
        netDestinationAmount: "Net destination amount",
        shareReference: "Share this reference with support if you need help tracing the request.",
        confirmAfterReview: "Confirm after reviewing amount, fees, and reference.",
        back: "Back",
        submitting: "Submitting...",
      },
      form: {
        available: "Available {amount}",
        max: "Max",
        amountValid: "Amount looks valid for the next confirmation step.",
        disconnect: "Disconnect",
        reconnect: "Reconnect",
        depositUsesWallet: "Deposit uses the connected funding wallet shown above.",
        disconnectVault: "Disconnect vault",
        reconnectVault: "Reconnect vault",
        destinationValid: "Destination address passes the Stellar public key format check.",
        anchoredNote: "Primary action stays anchored at the bottom on mobile for longer forms.",
        preparing: "Preparing...",
      },
      pending: {
        processing: "Processing transaction",
        keepReference: "Keep this reference visible while the transaction is moving through the network.",
        requestedAmount: "Requested amount",
        settlementTarget: "Settlement target",
      },
      receipt: {
        success: "Success",
        failed: "Failed",
        receiptIncludes: "Receipt includes the amount, fees, and reference for follow-up.",
        retryAfterReview: "Retry after reviewing the validation state and updated quote.",
        creditedAmount: "Credited amount",
        destinationAmount: "Destination amount",
        settledAt: "Settled at",
        startNew: "Start a new transaction or switch flows.",
        retryUpdated: "Retry after reviewing the updated validation details.",
        newTransaction: "New transaction",
        switchFlow: "Switch flow",
      },
      history: {
        eyebrow: "Activity",
        title: "Transaction history",
        intro: "Full record of deposits, withdrawals, and rebalancing events. Click a transaction hash to view it on the Stellar explorer.",
        all: "All",
        deposits: "Deposits",
        withdrawals: "Withdrawals",
        rebalances: "Rebalances",
        statusSuccess: "Success",
        statusPending: "Pending",
        statusFailed: "Failed",
        kindDeposit: "Deposit",
        kindWithdrawal: "Withdrawal",
        kindRebalance: "Rebalance",
        noMatching: "No matching transactions",
        noHistory: "No transaction history yet",
        adjustFilters: "Try adjusting your filters or clearing the date range.",
        firstDeposit: "Make your first deposit to start building your history.",
        clearAllFilters: "Clear all filters",
        makeDeposit: "Make a deposit",
        showing: "Showing",
        of: "of",
        paginationLabel: "Pagination",
        previousPage: "Previous page",
        nextPage: "Next page",
        pageN: "Page {n}",
        type: "Type",
        status: "Status",
        dateRange: "Date range",
        fromDate: "From date",
        toDate: "To date",
        to: "to",
        clearFilters: "Clear filters",
        description: "Description",
        date: "Date",
        txHash: "Tx Hash",
        tx: "Tx:",
        loadError: "Unable to load transaction history.",
        loadingLabel: "Loading transactions",
        loadingText: "Loading transaction history…",
      },
    },
    audit: {
      title: "Account Audit Trail",
      subtitle: "View all account activity and events",
      exportCsv: "Export CSV",
      filterAriaLabel: "Filter events by type",
      allEvents: "All Events",
      eventTypes: {
        login: "Login",
        logout: "Logout",
        signup: "Sign Up",
        profile_update: "Profile Updated",
        password_change: "Password Changed",
        settings_change: "Settings Changed",
        transaction: "Transaction",
        export: "Export",
      },
      sortAscending: "Sort by date ascending",
      sortDescending: "Sort by date descending",
      newest: "Newest",
      oldest: "Oldest",
      columns: {
        eventType: "Event Type",
        timestamp: "Timestamp",
        actor: "Actor",
        ipAddress: "IP Address",
        details: "Details",
      },
      noEvents: "No events found",
      notAvailable: "N/A",
      expandDetails: "Expand details",
      collapseDetails: "Collapse details",
      show: "Show",
      hide: "Hide",
      expandedDetailsLabel: "Expanded event details",
      metadata: "Metadata",
      paginationLabel: "Audit trail pages",
      of: "of",
      previousPage: "Previous page",
      nextPage: "Next page",
      pageLabel: "Page {page}",
    },
    profile: {
      pageTitleFallback: "Your Profile",
      pageSubtitle: "Manage account details, preferences & display settings",
      editProfile: "Edit profile",
      breadcrumbLabel: "breadcrumb",
      breadcrumbSettings: "Settings",
      breadcrumbProfile: "Profile",
      fixErrorsOne: "Please fix 1 error before saving",
      fixErrorsMany: "Please fix {count} errors before saving",
      saveSuccess: "Profile saved successfully.",
      notSet: "Not set",
      identity: {
        title: "Identity",
        description: "How you appear across the platform",
        displayName: "Display name",
        displayNamePlaceholder: "e.g. Amara Okonkwo",
      },
      localisation: {
        title: "Localisation",
        description: "Language and regional display preferences",
        locale: "Locale",
      },
      timeCurrency: {
        title: "Time & Currency",
        description: "Timezone and numeric format settings",
        timezone: "Timezone",
        currencyFormat: "Currency format",
        sample: "Sample",
      },
      actions: {
        groupLabel: "Save or cancel changes",
        unsaved: "Unsaved changes",
        cancel: "Cancel",
        saving: "Saving…",
        save: "Save changes",
      },
      errors: {
        displayNameRequired: "Display name is required.",
        displayNameMin: "Display name must be at least 2 characters.",
        displayNameMax: "Display name must be 40 characters or fewer.",
        localeRequired: "Please select a locale.",
        timezoneRequired: "Please select a timezone.",
        currencyRequired: "Please select a currency format.",
        unknown: "Unknown error occurred.",
      },
    },
    help: {
      faq: {
        searchLabel: "Search FAQs",
        searchPlaceholder: "Type your question or keywords...",
        searchAria: "Search frequently asked questions",
        filterLabel: "Filter by Category",
        filterAria: "Filter FAQs by category",
        found: "Found",
        faqSingular: "FAQ",
        faqPlural: "FAQs",
        noResults: "No FAQs found matching your search criteria.",
        noResultsHint: "Try adjusting your search terms or category filter.",
        categories: {
          all: "All",
          gettingStarted: "Getting Started",
          security: "Security",
          transactions: "Transactions",
          assets: "Assets",
          staking: "Staking",
          support: "Support",
        },
        items: [
          {
            id: "connect-wallet",
            q: "How do I connect my wallet to NeuroWealth?",
            a: "To connect your wallet, click the \"Connect Wallet\" button in the top navigation bar. Select your preferred wallet (Freighter, Albedo, or other Stellar wallets), approve the connection request, and your wallet will be connected to the platform.",
          },
          {
            id: "what-is-neurowealth",
            q: "What is NeuroWealth and how does it work?",
            a: "NeuroWealth is a decentralized finance platform built on the Stellar network that allows you to manage digital assets, participate in staking, and access various DeFi services. It uses blockchain technology to ensure transparency and security.",
          },
          {
            id: "wallet-security",
            q: "Is my wallet secure on NeuroWealth?",
            a: "Yes, NeuroWealth prioritizes security. We never store your private keys or sensitive wallet information. All transactions require your explicit approval through your connected wallet. We use industry-standard encryption and security practices.",
          },
          {
            id: "forgot-password",
            q: "What should I do if I forget my password?",
            a: "NeuroWealth doesn't store passwords - we rely on your wallet's security. If you forget your wallet password or seed phrase, you'll need to use your wallet's recovery process. Always keep your seed phrase secure and backed up.",
          },
          {
            id: "transaction-slow",
            q: "Why is my transaction taking so long to confirm?",
            a: "Transaction times can vary based on network congestion and gas fees. Stellar transactions typically confirm within 3-5 seconds. If your transaction is pending, check the network status and ensure you've paid sufficient fees.",
          },
          {
            id: "gas-fees",
            q: "What are gas fees and how are they calculated?",
            a: "Gas fees are small amounts of XLM paid to network validators for processing transactions. On Stellar, fees are minimal (currently 0.00001 XLM per operation) and predictable. The total fee depends on the number of operations in your transaction.",
          },
          {
            id: "check-transaction-status",
            q: "How do I check my transaction status?",
            a: "You can check transaction status by using a Stellar block explorer like Stellar.expert or by checking your transaction history in your wallet. Enter the transaction ID to view details including confirmation status and network confirmations.",
          },
          {
            id: "supported-tokens",
            q: "What tokens are supported on NeuroWealth?",
            a: "NeuroWealth supports all Stellar-based tokens including XLM, USDC, EURT, and other custom tokens. You can view supported tokens in the assets section of your dashboard.",
          },
          {
            id: "add-custom-token",
            q: "How do I add a custom token to my wallet?",
            a: "To add a custom token, go to the Assets section, click \"Add Token,\" and enter the token's contract address. The system will verify the token and add it to your portfolio if it's valid.",
          },
          {
            id: "staking-basics",
            q: "What is staking and how do I participate?",
            a: "Staking allows you to earn rewards by locking your tokens to support network operations. Navigate to the Staking section, select the amount you want to stake, choose a validator, and confirm the transaction. Rewards are distributed automatically.",
          },
          {
            id: "staking-rewards",
            q: "When do I receive staking rewards?",
            a: "Staking rewards are typically distributed every 24-48 hours, depending on the validator and network conditions. You can view your pending and earned rewards in the Staking section of your dashboard.",
          },
          {
            id: "contact-support",
            q: "How can I contact customer support?",
            a: "You can reach our support team through the Contact Support form on this help page, email us at support@neurowealth.com, or join our Discord community for real-time assistance from our team and community members.",
          },
        ],
      },
      support: {
        categories: {
          technicalIssue: "Technical Issue",
          transactionProblem: "Transaction Problem",
          accountAccess: "Account Access",
          securityConcern: "Security Concern",
          generalInquiry: "General Inquiry",
          featureRequest: "Feature Request",
          bugReport: "Bug Report",
        },
        nameRequired: "Name is required",
        nameMin: "Name must be at least 2 characters",
        emailRequired: "Email address is required",
        emailInvalid: "Enter a valid email address",
        subjectRequired: "Subject is required",
        subjectMax: "Subject must be {max} characters or less",
        categoryRequired: "Select a support category",
        messageRequired: "Message is required",
        messageRange: "Message must be between 10 and {max} characters",
        transactionLookupFailed: "We could not verify that transaction reference in the mock lookup.",
        submitFailed: "Failed to submit support request. Please try again later.",
        contactSectionError: "Complete your contact details before we can respond.",
        requestSectionError: "Review the request details and fix the highlighted issues.",
        successTitle: "Support Request Submitted",
        successBody: "Your request is in the queue and a confirmation email is on the way.",
        referenceId: "Reference ID",
        submitAnother: "Submit Another Request",
        title: "Contact Support",
        subtitle: "Shared validation patterns here cover required, format, range, and async-like checks.",
        errorSummaryTitle: "Please fix the support form errors below.",
        contactDetails: "Contact Details",
        requestDetails: "Request Details",
        nameLabel: "Name",
        namePlaceholder: "Your full name",
        emailLabel: "Email Address",
        categoryLabel: "Category",
        subjectLabel: "Subject",
        subjectHint: "Required",
        subjectPlaceholder: "Brief description of your issue",
        transactionIdLabel: "Transaction ID",
        transactionIdHintBefore: "Async mock check: references containing",
        transactionIdHintAfter: "fail lookup.",
        transactionIdPlaceholder: "Optional: TX-123...",
        messageLabel: "Message",
        messageHint: "Please be as detailed as possible",
        messagePlaceholder: "Please provide details about your issue or question.",
        submitting: "Submitting...",
        submit: "Submit Request",
        otherOptions: "Other Support Options",
        liveChat: "Live Chat: Available 24/7 for urgent issues.",
        emailSupport: "Email Support: support@neurowealth.com",
        forum: "Community Forum: Get help from other users.",
      },
      guidance: {
        title: "Transaction Troubleshooting Guide",
        subtitle: "Common transaction issues and their solutions. Click on any issue to see detailed guidance.",
        commonIssues: "Common Issues",
        severity: {
          low: "low",
          medium: "medium",
          high: "high",
        },
        priority: "{severity} PRIORITY",
        symptoms: "Symptoms",
        solutions: "Solutions",
        prevention: "Prevention",
        quickActions: "Quick Actions",
        checkStatus: "Check Transaction Status",
        networkStatus: "Network Status",
        backToAll: "Back to All Issues",
        contactSupport: "Contact Support",
        selectIssue: "Select an Issue",
        selectIssueHint: "Choose a transaction issue from the list to view detailed troubleshooting steps and solutions.",
        emergencyTitle: "Emergency: Funds at Risk",
        emergencyBody: "If you believe your funds are at immediate risk or you've encountered a critical security issue:",
        emergencySupport: "Emergency Support",
        emailEmergency: "Email Emergency Team",
        issues: [
          {
            id: "transaction-stuck-pending",
            severity: "medium",
            title: "Transaction Stuck Pending",
            description: "Your transaction is not confirming and remains in pending state.",
            symptoms: [
              "Transaction shows as \"pending\" for more than 5 minutes",
              "No confirmation after multiple refreshes",
              "Gas fee was deducted but transaction not completed",
            ],
            solutions: [
              "Wait a few more minutes - Stellar transactions can sometimes take longer during high network traffic",
              "Check the transaction status on a block explorer like Stellar.expert",
              "Verify you have sufficient XLM balance for minimum reserve and fees",
              "Try refreshing the page and reconnecting your wallet",
              "If still pending after 30 minutes, contact support with the transaction ID",
            ],
            preventive: [
              "Always check network status before making transactions",
              "Ensure you have enough XLM for fees (minimum 0.00001 XLM per operation)",
              "Avoid making transactions during peak network congestion",
            ],
          },
          {
            id: "insufficient-balance",
            severity: "high",
            title: "Insufficient Balance Error",
            description: "Transaction failed due to insufficient balance in your wallet.",
            symptoms: [
              "Error message \"Insufficient balance\"",
              "Transaction rejected even though you see funds in wallet",
              "Unable to complete swap or transfer",
            ],
            solutions: [
              "Check your available balance (excluding minimum reserve requirements)",
              "Stellar requires 1 XLM minimum reserve per account plus 0.5 XLM per trustline",
              "Add more XLM to your wallet if below minimum requirements",
              "Break down large transactions into smaller ones if needed",
              "Consider the gas fees required for your transaction type",
            ],
            preventive: [
              "Always maintain at least 2 XLM as buffer for fees and reserves",
              "Check balance requirements before complex transactions",
              "Keep track of how many trustlines you have (each costs 0.5 XLM)",
            ],
          },
          {
            id: "wallet-connection",
            severity: "high",
            title: "Wallet Connection Issues",
            description: "Unable to connect or maintain connection with your wallet.",
            symptoms: [
              "Wallet connection button not working",
              "Frequent disconnections",
              "Error message about wallet not being detected",
              "Transaction signing prompts not appearing",
            ],
            solutions: [
              "Ensure your wallet extension is enabled and updated",
              "Clear browser cache and cookies",
              "Try using a different browser",
              "Check if your wallet is locked and unlock it",
              "Restart your browser and try again",
              "Make sure you're on the correct network (Stellar Mainnet)",
            ],
            preventive: [
              "Keep your wallet extension updated to latest version",
              "Use reputable browsers like Chrome, Firefox, or Brave",
              "Avoid using multiple wallet extensions simultaneously",
            ],
          },
          {
            id: "bad-sequence",
            severity: "medium",
            title: "Transaction Failed - Bad Sequence",
            description: "Transaction failed due to sequence number mismatch.",
            symptoms: [
              "Error message \"bad sequence\"",
              "Transaction rejected immediately",
              "Multiple transactions failing in sequence",
            ],
            solutions: [
              "Wait for any pending transactions to complete first",
              "Refresh your wallet connection to sync sequence numbers",
              "Check if you have multiple tabs or windows open with the same wallet",
              "Try the transaction again after a few minutes",
              "Contact support if issue persists",
            ],
            preventive: [
              "Avoid making multiple transactions simultaneously",
              "Wait for confirmation before initiating next transaction",
              "Close unused browser tabs with wallet connections",
            ],
          },
          {
            id: "trustline-issues",
            severity: "medium",
            title: "Trustline Issues",
            description: "Unable to hold or transact with certain tokens due to trustline problems.",
            symptoms: [
              "Cannot receive specific tokens",
              "Error about trustlines when adding assets",
              "Token balance showing as zero despite receiving tokens",
            ],
            solutions: [
              "Create a trustline for the specific token first",
              "Ensure you have sufficient XLM for trustline creation (0.5 XLM)",
              "Verify the token issuer and asset code are correct",
              "Check if the token is still active and not revoked",
              "Contact the token issuer if the trustline creation fails",
            ],
            preventive: [
              "Research tokens before creating trustlines",
              "Maintain sufficient XLM balance for trustline fees",
              "Only create trustlines for tokens you trust and plan to use",
            ],
          },
          {
            id: "high-network-fees",
            severity: "low",
            title: "High Network Fees",
            description: "Transaction fees are higher than expected or changing unexpectedly.",
            symptoms: [
              "Gas fees much higher than usual",
              "Fee estimation keeps increasing",
              "Transaction failing due to insufficient fees",
            ],
            solutions: [
              "Stellar has fixed low fees (0.00001 XLM per operation)",
              "Check if you're being charged by a third-party service",
              "Verify you're not on a testnet or custom network",
              "Compare fees shown with actual network fees",
              "Contact support if fees seem incorrect",
            ],
            preventive: [
              "Always verify transaction fees before confirming",
              "Use official NeuroWealth interface to avoid hidden fees",
              "Stay informed about network conditions",
            ],
          },
        ],
      },
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
    common: {
      comingSoon: "Bientôt disponible",
      loading: "Chargement...",
      retry: "Réessayer",
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      open: "Ouvrir",
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
          apy: "4–6 %",
          risk: "faible",
          desc: "Prêts en stablecoins sur Blend pour des rendements stables et prévisibles.",
          accentText: "text-sky-400",
          border: "border-sky-500/20",
          btnVariant: "secondary",
        },
        {
          name: "Équilibrée",
          apy: "7–10 %",
          risk: "moyen",
          desc: "Combinaison de lending et de liquidité DEX pour un bon équilibre risque/rendement.",
          accentText: "text-emerald-400",
          border: "border-emerald-500/30",
          btnVariant: "primary",
          featured: true,
        },
        {
          name: "Croissance",
          apy: "11–18 %",
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
    dashboard: {
      realtime: {
        noEvents: "Aucun événement pour le moment — démarrez le flux pour voir les mises à jour en direct.",
        simulatedStream: "Flux d'événements simulé",
        firesEvery: "Déclenche des dépôts, des retraits et des rééquilibrages toutes les 4–9 s",
        start: "Démarrer",
        stop: "Arrêter",
        reset: "Réinitialiser",
        eventsFired: "Événements déclenchés",
        deltaBalance: "Δ Solde",
        deltaYield: "Δ Rendement",
        deltaApy: "Δ APY",
        eventLog: "Journal des événements",
        status: {
          live: "En direct",
          paused: "En pause",
          idle: "Inactif",
        },
      },
      portfolio: {
        overview: "Aperçu NeuroWealth",
        overviewDesc: "Solde total, rendement, APY, stratégie, allocation et activité récente sur une seule interface d'évaluation, avec une parité mesurable entre les thèmes clair et sombre.",
        themePreview: "Aperçu du thème",
        lightMode: "Mode clair",
        darkMode: "Mode sombre",
        scenarioPreview: "Aperçu du scénario",
        liveWidgets: "Widgets en direct",
        emptyStates: "États vides",
        loadingWidget: "Chargement de l'état du widget de portefeuille...",
        syncingData: "Synchronisation des données du portefeuille",
        source: "Source",
        sandbox: "Sandbox",
        theme: "Thème",
        unavailableTitle: "Widgets de portefeuille indisponibles",
        unavailableDesc: "Le tableau de bord peut réessayer une fois la connectivité à l'API du portefeuille rétablie.",
        retryWidgets: "Réessayer les widgets",
        allocationTitle: "Allocation d'actifs",
        allocationDesc: "Répartition visible des déploiements entre les paniers de stratégie et le capital de réserve.",
        lines: "lignes d'allocation",
        line: "ligne d'allocation",
        emptyAllocation: "Aucune allocation pour le moment. Ajoutez un dépôt pour voir les positions déployées et la couverture de réserve.",
        loadSample: "Charger des données d'exemple",
        activityTitle: "Activité récente",
        activityDesc: "Derniers dépôts, événements de rendement, rééquilibrages et flux de trésorerie programmés.",
        events: "événements",
        event: "événement",
        emptyActivity: "Aucune activité récente. Les dépôts et rééquilibrages apparaîtront ici dès qu'ils se produiront.",
        noAmount: "Aucun montant",
      },
    },
    settings: {
      index: {
        title: "Paramètres",
        subtitle: "Gérez les préférences de votre compte et votre portefeuille connecté.",
        appearance: {
          title: "Apparence",
          themeTitle: "Thème",
          themeDesc: "Choisissez entre clair, sombre ou préférence système.",
        },
        profile: {
          title: "Profil",
          displayTitle: "Nom d'affichage et Préférences",
          displayDesc: "Modifiez votre nom d'affichage, vos paramètres régionaux, votre fuseau horaire et le format de votre devise.",
          editAction: "Modifier le profil",
          regionTitle: "Langue et Région",
          regionDesc: "Modifiez vos paramètres régionaux et d'affichage.",
          openAction: "Ouvrir",
        },
        wallet: {
          title: "Portefeuille",
          connectedTitle: "Portefeuille connecté",
          connectedDesc: "Connexion du portefeuille Freighter pour la signature des transactions.",
          networkTitle: "Réseau",
          networkDesc: "Basculer entre Stellar Testnet et Mainnet.",
        },
        notifications: {
          title: "Notifications",
          emailTitle: "Alertes par e-mail",
          emailDesc: "Recevez des notifications par e-mail pour les dépôts, retraits et rééquilibrages.",
          whatsappTitle: "Notifications WhatsApp",
          whatsappDesc: "Recevez des mises à jour via la messagerie WhatsApp.",
        },
        security: {
          title: "Sécurité",
          twoFactorTitle: "Authentification à deux facteurs",
          twoFactorDesc: "Ajoutez une couche de sécurité supplémentaire à votre compte.",
          sessionTitle: "Gestion de session",
          sessionDesc: "Afficher et révoquer les sessions actives.",
        },
        region: {
          title: "Région",
          currencyTitle: "Affichage de la devise",
          currencyDesc: "Choisissez votre devise d'affichage préférée (USD, EUR, GBP).",
          openAction: "Ouvrir le profil",
        },
      },
      preferences: {
        title: "Préférences",
        subtitle: "Gérer la langue, le fuseau horaire et les paramètres de devise",
        savedSuccess: "Préférences enregistrées avec succès",
        saveError: "Échec de l'enregistrement des préférences. Veuillez réessayer.",
        localisation: {
          title: "Localisation",
          desc: "Préférences de langue et d'affichage régional",
          localeLabel: "Paramètre régional",
        },
        appearance: {
          title: "Apparence",
          desc: "Préférences de thème et d'affichage visuel",
          themeLabel: "Thème",
          light: "Clair",
          dark: "Sombre",
          system: "Système",
        },
        timeCurrency: {
          title: "Heure et devise",
          desc: "Fuseau horaire et format numérique",
          timezoneLabel: "Fuseau horaire",
          currencyLabel: "Format de devise",
        },
        actions: {
          edit: "Modifier les préférences",
          unsaved: "Modifications non enregistrées",
          cancel: "Annuler",
          save: "Enregistrer",
          saving: "Enregistrement…",
        },
      },
      notifications: {
        title: "Notifications",
        subtitle: "Gérer les alertes que nous envoyons par e-mail, activité du compte et événements de sécurité.",
        channels: {
          title: "Canaux de diffusion",
          desc: "Choisissez les mises à jour qui arrivent dans vos boîtes de réception, tableaux de bord et résumés hebdomadaires.",
          emailTitle: "Notifications par e-mail",
          emailDesc: "Recevez les mises à jour de livraison et les avis de compte dans votre boîte de réception.",
          transactionTitle: "Alertes de transaction",
          transactionDesc: "Envoyer une notification à chaque dépôt, retrait ou rééquilibrage complété.",
          weeklyTitle: "Résumé hebdomadaire",
          weeklyDesc: "Regrouper les résumés de performance et les points saillants en une mise à jour hebdomadaire.",
          productTitle: "Mises à jour du produit",
          productDesc: "Découvrez les lancements, les expériences et les améliorations de la plateforme.",
          securityTitle: "Alertes de sécurité",
          securityDesc: "Notifications critiques de connexion, de portefeuille et d'activité suspecte.",
        },
        summary: {
          title: "Résumé actuel",
          desc: "Suivez les signaux activés avant de publier les modifications.",
          enabledPreferences: "Préférences activées",
          emailChannel: "Canal e-mail",
          active: "Actif",
          muted: "Désactivé",
          securityCoverage: "Couverture de sécurité",
          protected: "Protégé",
          atRisk: "À risque",
        },
        saveBehavior: {
          title: "Comportement de sauvegarde",
          desc: "Les sauvegardes réussies émettent une bannière de succès et un toast. Désactiver les alertes de sécurité simule une sauvegarde bloquée.",
        },
        securityAlertsOff: {
          title: "Les alertes de sécurité sont désactivées",
          desc: "Les événements de compte à haut risque peuvent être manqués jusqu'à ce que vous réactiviez la couverture de sécurité.",
        },
        actions: {
          edit: "Modifier les préférences",
          unsaved: "Modifications non enregistrées",
          noPending: "Aucune modification en attente",
          cancel: "Annuler",
          save: "Enregistrer",
          saving: "Enregistrement...",
          restoreAlerts: "Restaurer les alertes de sécurité",
        },
        toast: {
          savedTitle: "Préférences enregistrées",
          savedDesc: "Vos règles de notification ont été mises à jour pour les futures activités du compte.",
          failTitle: "Échec de l'enregistrement",
          failDesc: "Les alertes de sécurité sont requises dans ce flux simulé. Réactivez-les et réessayez.",
        },
        banner: {
          savedTitle: "Préférences de notification enregistrées",
          failTitle: "Impossible d'enregistrer votre sélection actuelle",
          failDesc: "Ce chemin d'échec simulé bloque intentionnellement la sauvegarde lorsque les alertes de sécurité sont désactivées.",
        },
      },
      security: {
        title: "Sécurité",
        subtitle: "Gérez le mot de passe, l'authentification à deux facteurs et les alertes de connexion de votre compte.",
        banner: {
          success: "Paramètres de sécurité mis à jour avec succès",
          error: "Échec de la mise à jour des paramètres de sécurité. Veuillez réessayer.",
        },
        password: {
          title: "Mot de passe",
          desc: "Protégez votre compte avec un mot de passe fort et régulièrement mis à jour.",
          lastChangedLabel: "Dernière modification",
          daysAgoSuffix: "jours",
          warning: "Votre mot de passe date de plus de 90 jours. Pensez à le mettre à jour.",
          changeAction: "Changer le mot de passe",
        },
        twoFactor: {
          title: "Authentification à deux facteurs",
          desc: "Ajoutez une couche de sécurité supplémentaire à votre compte.",
          enableLabel: "Activer l'authentification à deux facteurs",
          enabledHint: "L'authentification à deux facteurs protège votre compte.",
          disabledHint: "Activez l'authentification à deux facteurs pour une meilleure protection.",
        },
        loginAlerts: {
          title: "Alertes de connexion",
          desc: "Soyez averti chaque fois qu'un nouvel appareil se connecte à votre compte.",
          enableLabel: "Activer les alertes de connexion",
          enabledHint: "Vous serez averti des nouvelles connexions.",
          disabledHint: "Vous ne serez pas averti des nouvelles connexions.",
        },
        actions: {
          edit: "Modifier les paramètres de sécurité",
          unsaved: "Modifications non enregistrées",
          cancel: "Annuler",
          save: "Enregistrer les modifications",
          saving: "Enregistrement…",
        },
        modal: {
          title: "Changer le mot de passe",
          closeLabel: "Fermer",
          newPasswordLabel: "Nouveau mot de passe",
          newPasswordPlaceholder: "Entrez le nouveau mot de passe",
          cancel: "Annuler",
          updating: "Mise à jour…",
          update: "Mettre à jour le mot de passe",
        },
      },
      privacy: {
        title: "Confidentialité",
        subtitle: "Contrôlez la façon dont NeuroWealth utilise les cookies et les données sur votre appareil.",
        cookieSection: {
          title: "Préférences cookies & confidentialité",
          desc: "Consultez votre statut de consentement actuel et ajustez les catégories de cookies actives.",
        },
      },
      strategies: {
        eyebrow: "Paramètres",
        title: "Choisissez votre stratégie",
        description: "Sélectionnez le profil de risque/rendement qui correspond à vos objectifs. Vos positions actives seront rééquilibrées lors du prochain cycle programmé.",
        backToPortfolio: "Retour au portefeuille",
        currentBadge: "Actuelle",
        activeStrategyButton: "Stratégie active",
        comparison: {
          title: "Comparaison des stratégies",
          featureHeader: "Caractéristique",
          activeBadge: "active",
          apyRangeLabel: "Plage de rendement",
          riskLevelLabel: "Niveau de risque",
        },
        success: {
          updated: "Stratégie mise à jour vers {{strategy}}. Le rééquilibrage s'appliquera au prochain cycle programmé.",
        },
        confirmModal: {
          title: "Confirmer le changement de stratégie",
          switchingFrom: "Passage de {{from}} à {{to}}.",
          settingTo: "Définition de votre stratégie sur {{to}}.",
          note: "Les positions actives seront rééquilibrées lors du prochain cycle programmé. Ce changement ne déclenche pas de transaction on-chain immédiate.",
          cancel: "Annuler",
          confirm: "Confirmer le changement",
          saving: "Enregistrement…",
          closeLabel: "Annuler",
        },
        cards: {
          conservative: {
            title: "Conservateur",
            riskLabel: "Risque faible",
            description: "Prêt en stablecoins et couverture de réserve inactive. Préservation du capital avec rendement prévisible et exposition minimale aux baisses.",
            primaryAction: "Choisir Conservateur",
          },
          balanced: {
            title: "Équilibré",
            riskLabel: "Risque moyen",
            description: "Rendement réparti entre le prêt Blend, la liquidité DEX et une réserve stable. Idéal pour une croissance régulière avec une volatilité maîtrisée.",
            primaryAction: "Choisir Équilibré",
          },
          growth: {
            title: "Croissance",
            riskLabel: "Risque élevé",
            description: "Mise sur les programmes d'incitation, le rééquilibrage actif et des positions à volatilité plus élevée. Potentiel maximal avec risque accru.",
            primaryAction: "Choisir Croissance",
          },
        },
      },
      onboarding: {
        title: "Paramètres d'intégration",
        subtitle: "Gérez votre progression d'intégration et révisez les étapes de configuration.",
        statusLabel: "Statut",
        statusCompleted: "Terminé",
        statusInProgress: "En cours",
        lastStepLabel: "Dernière étape :",
        lastStepValue: "Étape {{step}}",
        completedLabel: "Terminé :",
        actionsTitle: "Actions",
        reviewAction: "Revoir l'intégration",
        resetAction: "Réinitialiser l'intégration",
        resetting: "Réinitialisation...",
        confirmReset: "Voulez-vous vraiment réinitialiser le processus d'intégration ? Vous pourrez suivre à nouveau la configuration.",
        toastFailTitle: "Échec de la réinitialisation de l'intégration",
        toastFailDesc: "Veuillez réessayer.",
        helpReviewLabel: "Revoir l'intégration :",
        helpReviewDesc: "Parcourez à nouveau les étapes de configuration sans modifier vos paramètres actuels.",
        helpResetLabel: "Réinitialiser l'intégration :",
        helpResetDesc: "Effacez toute la progression d'intégration et recommencez depuis le début.",
      },
      themeSelector: {
        ariaLabel: "Sélection du thème",
      },
    },
    transactions: {
      shared: {
        amount: "Montant",
        fees: "Frais",
        strategy: "Stratégie",
        transactionReference: "Référence de transaction",
      },
      flow: {
        eyebrow: "Flux de transaction",
        heading: "Flux de dépôt et de retrait",
        intro: "Validez les montants et les conditions du portefeuille, confirmez les frais et les références de demande, puis consultez les états en attente, réussi et échec depuis une seule interface adaptée au mobile.",
        themePreview: "Aperçu du thème",
        lightMode: "Mode clair",
        darkMode: "Mode sombre",
        screenshotStates: "États de capture",
        liveFlow: "Flux en direct",
        previewStates: {
          validation: "validation",
          confirm: "confirmation",
          pending: "en attente",
          success: "réussite",
          failure: "échec",
        },
        deposit: "Dépôt",
        withdraw: "Retrait",
        step1: "Étape 1",
        step2: "Étape 2",
        step3: "Étape 3",
        enterDetails: "Saisir les détails",
        confirm: "Confirmer",
        trackResult: "Suivre le résultat",
        walletConditions: "Conditions du portefeuille",
        connectedWallet: "Portefeuille connecté",
        availableBalance: "Solde disponible",
        validationRules: "Règles de validation",
        minimum: "Minimum",
        lifecycle: "Cycle de vie",
        lifecycleValue: "États en attente, réussi et échec inclus",
        routes: "Itinéraires",
        portfolioOverview: "Vue d'ensemble du portefeuille",
        transactionFlow: "Flux de transaction",
      },
      recovery: {
        error: "Erreur",
        includeReference: "Indiquez cette référence lorsque vous contactez le support.",
        tryAgain: "Veuillez réessayer.",
        reviewUpdate: "Veuillez vérifier et mettre à jour vos informations.",
      },
      confirm: {
        confirmDeposit: "Confirmer le dépôt",
        confirmWithdrawal: "Confirmer le retrait",
        depositAmount: "Montant du dépôt",
        withdrawalAmount: "Montant du retrait",
        totalDebit: "Débit total",
        netDestinationAmount: "Montant net de destination",
        shareReference: "Communiquez cette référence au support si vous avez besoin d'aide pour retracer la demande.",
        confirmAfterReview: "Confirmez après avoir vérifié le montant, les frais et la référence.",
        back: "Retour",
        submitting: "Envoi en cours...",
      },
      form: {
        available: "Disponible {amount}",
        max: "Max",
        amountValid: "Le montant semble valide pour l'étape de confirmation suivante.",
        disconnect: "Déconnecter",
        reconnect: "Reconnecter",
        depositUsesWallet: "Le dépôt utilise le portefeuille de financement connecté indiqué ci-dessus.",
        disconnectVault: "Déconnecter le coffre",
        reconnectVault: "Reconnecter le coffre",
        destinationValid: "L'adresse de destination respecte le format de clé publique Stellar.",
        anchoredNote: "L'action principale reste ancrée en bas sur mobile pour les formulaires plus longs.",
        preparing: "Préparation...",
      },
      pending: {
        processing: "Traitement de la transaction",
        keepReference: "Gardez cette référence visible pendant que la transaction traverse le réseau.",
        requestedAmount: "Montant demandé",
        settlementTarget: "Cible de règlement",
      },
      receipt: {
        success: "Réussi",
        failed: "Échec",
        receiptIncludes: "Le reçu inclut le montant, les frais et la référence pour le suivi.",
        retryAfterReview: "Réessayez après avoir vérifié l'état de validation et le devis mis à jour.",
        creditedAmount: "Montant crédité",
        destinationAmount: "Montant de destination",
        settledAt: "Réglé le",
        startNew: "Commencez une nouvelle transaction ou changez de flux.",
        retryUpdated: "Réessayez après avoir vérifié les détails de validation mis à jour.",
        newTransaction: "Nouvelle transaction",
        switchFlow: "Changer de flux",
      },
      history: {
        eyebrow: "Activité",
        title: "Historique des transactions",
        intro: "Historique complet des dépôts, retraits et rééquilibrages. Cliquez sur un hash de transaction pour l'afficher dans l'explorateur Stellar.",
        all: "Tous",
        deposits: "Dépôts",
        withdrawals: "Retraits",
        rebalances: "Rééquilibrages",
        statusSuccess: "Réussi",
        statusPending: "En attente",
        statusFailed: "Échec",
        kindDeposit: "Dépôt",
        kindWithdrawal: "Retrait",
        kindRebalance: "Rééquilibrage",
        noMatching: "Aucune transaction correspondante",
        noHistory: "Aucun historique de transactions pour le moment",
        adjustFilters: "Essayez d'ajuster vos filtres ou d'effacer la plage de dates.",
        firstDeposit: "Effectuez votre premier dépôt pour commencer à constituer votre historique.",
        clearAllFilters: "Effacer tous les filtres",
        makeDeposit: "Effectuer un dépôt",
        showing: "Affichage de",
        of: "sur",
        paginationLabel: "Pagination",
        previousPage: "Page précédente",
        nextPage: "Page suivante",
        pageN: "Page {n}",
        type: "Type",
        status: "Statut",
        dateRange: "Plage de dates",
        fromDate: "Date de début",
        toDate: "Date de fin",
        to: "au",
        clearFilters: "Effacer les filtres",
        description: "Description",
        date: "Date",
        txHash: "Hash Tx",
        tx: "Tx :",
        loadError: "Impossible de charger l'historique des transactions.",
        loadingLabel: "Chargement des transactions",
        loadingText: "Chargement de l'historique des transactions…",
      },
    },
    audit: {
      title: "Journal d'audit du compte",
      subtitle: "Consultez toute l'activité et tous les événements du compte",
      exportCsv: "Exporter en CSV",
      filterAriaLabel: "Filtrer les événements par type",
      allEvents: "Tous les événements",
      eventTypes: {
        login: "Connexion",
        logout: "Déconnexion",
        signup: "Inscription",
        profile_update: "Profil mis à jour",
        password_change: "Mot de passe modifié",
        settings_change: "Paramètres modifiés",
        transaction: "Transaction",
        export: "Export",
      },
      sortAscending: "Trier par date croissante",
      sortDescending: "Trier par date décroissante",
      newest: "Plus récents",
      oldest: "Plus anciens",
      columns: {
        eventType: "Type d'événement",
        timestamp: "Horodatage",
        actor: "Auteur",
        ipAddress: "Adresse IP",
        details: "Détails",
      },
      noEvents: "Aucun événement trouvé",
      notAvailable: "N/D",
      expandDetails: "Afficher les détails",
      collapseDetails: "Masquer les détails",
      show: "Afficher",
      hide: "Masquer",
      expandedDetailsLabel: "Détails de l'événement développés",
      metadata: "Métadonnées",
      paginationLabel: "Pages du journal d'audit",
      of: "sur",
      previousPage: "Page précédente",
      nextPage: "Page suivante",
      pageLabel: "Page {page}",
    },
    profile: {
      pageTitleFallback: "Votre profil",
      pageSubtitle: "Gérez les détails du compte, les préférences et les paramètres d'affichage",
      editProfile: "Modifier le profil",
      breadcrumbLabel: "fil d'Ariane",
      breadcrumbSettings: "Paramètres",
      breadcrumbProfile: "Profil",
      fixErrorsOne: "Veuillez corriger 1 erreur avant d'enregistrer",
      fixErrorsMany: "Veuillez corriger {count} erreurs avant d'enregistrer",
      saveSuccess: "Profil enregistré avec succès.",
      notSet: "Non défini",
      identity: {
        title: "Identité",
        description: "Comment vous apparaissez sur la plateforme",
        displayName: "Nom d'affichage",
        displayNamePlaceholder: "p. ex. Amara Okonkwo",
      },
      localisation: {
        title: "Localisation",
        description: "Préférences de langue et d'affichage régional",
        locale: "Langue",
      },
      timeCurrency: {
        title: "Heure et devise",
        description: "Paramètres de fuseau horaire et de format numérique",
        timezone: "Fuseau horaire",
        currencyFormat: "Format de devise",
        sample: "Exemple",
      },
      actions: {
        groupLabel: "Enregistrer ou annuler les modifications",
        unsaved: "Modifications non enregistrées",
        cancel: "Annuler",
        saving: "Enregistrement…",
        save: "Enregistrer les modifications",
      },
      errors: {
        displayNameRequired: "Le nom d'affichage est obligatoire.",
        displayNameMin: "Le nom d'affichage doit contenir au moins 2 caractères.",
        displayNameMax: "Le nom d'affichage doit contenir 40 caractères maximum.",
        localeRequired: "Veuillez sélectionner une langue.",
        timezoneRequired: "Veuillez sélectionner un fuseau horaire.",
        currencyRequired: "Veuillez sélectionner un format de devise.",
        unknown: "Une erreur inconnue s'est produite.",
      },
    },
    help: {
      faq: {
        searchLabel: "Rechercher dans la FAQ",
        searchPlaceholder: "Saisissez votre question ou des mots-clés...",
        searchAria: "Rechercher dans les questions fréquentes",
        filterLabel: "Filtrer par catégorie",
        filterAria: "Filtrer la FAQ par catégorie",
        found: "Trouvé",
        faqSingular: "question",
        faqPlural: "questions",
        noResults: "Aucune question ne correspond à votre recherche.",
        noResultsHint: "Essayez de modifier vos termes de recherche ou le filtre de catégorie.",
        categories: {
          all: "Toutes",
          gettingStarted: "Premiers pas",
          security: "Sécurité",
          transactions: "Transactions",
          assets: "Actifs",
          staking: "Staking",
          support: "Assistance",
        },
        items: [
          {
            id: "connect-wallet",
            q: "Comment connecter mon portefeuille à NeuroWealth ?",
            a: "Pour connecter votre portefeuille, cliquez sur le bouton « Connecter le portefeuille » dans la barre de navigation supérieure. Sélectionnez le portefeuille de votre choix (Freighter, Albedo ou un autre portefeuille Stellar), approuvez la demande de connexion et votre portefeuille sera connecté à la plateforme.",
          },
          {
            id: "what-is-neurowealth",
            q: "Qu'est-ce que NeuroWealth et comment ça fonctionne ?",
            a: "NeuroWealth est une plateforme de finance décentralisée construite sur le réseau Stellar qui vous permet de gérer des actifs numériques, de participer au staking et d'accéder à divers services DeFi. Elle s'appuie sur la technologie blockchain pour garantir transparence et sécurité.",
          },
          {
            id: "wallet-security",
            q: "Mon portefeuille est-il sécurisé sur NeuroWealth ?",
            a: "Oui, NeuroWealth fait de la sécurité une priorité. Nous ne stockons jamais vos clés privées ni les informations sensibles de votre portefeuille. Chaque transaction nécessite votre approbation explicite via votre portefeuille connecté. Nous appliquons un chiffrement et des pratiques de sécurité conformes aux standards du secteur.",
          },
          {
            id: "forgot-password",
            q: "Que faire si j'oublie mon mot de passe ?",
            a: "NeuroWealth ne stocke pas de mots de passe : nous nous appuyons sur la sécurité de votre portefeuille. Si vous oubliez le mot de passe ou la phrase de récupération de votre portefeuille, vous devrez utiliser la procédure de récupération de celui-ci. Conservez toujours votre phrase de récupération en lieu sûr et sauvegardée.",
          },
          {
            id: "transaction-slow",
            q: "Pourquoi ma transaction met-elle autant de temps à être confirmée ?",
            a: "Les délais de transaction peuvent varier selon la congestion du réseau et les frais. Les transactions Stellar sont généralement confirmées en 3 à 5 secondes. Si votre transaction est en attente, vérifiez l'état du réseau et assurez-vous d'avoir payé des frais suffisants.",
          },
          {
            id: "gas-fees",
            q: "Que sont les frais de réseau et comment sont-ils calculés ?",
            a: "Les frais de réseau sont de petits montants de XLM versés aux validateurs pour le traitement des transactions. Sur Stellar, les frais sont minimes (actuellement 0,00001 XLM par opération) et prévisibles. Le total dépend du nombre d'opérations de votre transaction.",
          },
          {
            id: "check-transaction-status",
            q: "Comment vérifier l'état de ma transaction ?",
            a: "Vous pouvez vérifier l'état d'une transaction avec un explorateur de blocs Stellar comme Stellar.expert ou dans l'historique des transactions de votre portefeuille. Saisissez l'identifiant de la transaction pour afficher les détails, dont l'état de confirmation et les confirmations du réseau.",
          },
          {
            id: "supported-tokens",
            q: "Quels jetons sont pris en charge sur NeuroWealth ?",
            a: "NeuroWealth prend en charge tous les jetons basés sur Stellar, notamment XLM, USDC, EURT et d'autres jetons personnalisés. Vous pouvez consulter les jetons pris en charge dans la section des actifs de votre tableau de bord.",
          },
          {
            id: "add-custom-token",
            q: "Comment ajouter un jeton personnalisé à mon portefeuille ?",
            a: "Pour ajouter un jeton personnalisé, accédez à la section Actifs, cliquez sur « Ajouter un jeton » et saisissez l'adresse du contrat du jeton. Le système vérifiera le jeton et l'ajoutera à votre portefeuille s'il est valide.",
          },
          {
            id: "staking-basics",
            q: "Qu'est-ce que le staking et comment y participer ?",
            a: "Le staking vous permet de gagner des récompenses en bloquant vos jetons pour soutenir le fonctionnement du réseau. Accédez à la section Staking, sélectionnez le montant à staker, choisissez un validateur et confirmez la transaction. Les récompenses sont distribuées automatiquement.",
          },
          {
            id: "staking-rewards",
            q: "Quand vais-je recevoir mes récompenses de staking ?",
            a: "Les récompenses de staking sont généralement distribuées toutes les 24 à 48 heures, selon le validateur et l'état du réseau. Vous pouvez consulter vos récompenses en attente et acquises dans la section Staking de votre tableau de bord.",
          },
          {
            id: "contact-support",
            q: "Comment contacter le support client ?",
            a: "Vous pouvez joindre notre équipe d'assistance via le formulaire de contact de cette page d'aide, par e-mail à support@neurowealth.com, ou en rejoignant notre communauté Discord pour une aide en temps réel de la part de notre équipe et des membres de la communauté.",
          },
        ],
      },
      support: {
        categories: {
          technicalIssue: "Problème technique",
          transactionProblem: "Problème de transaction",
          accountAccess: "Accès au compte",
          securityConcern: "Préoccupation de sécurité",
          generalInquiry: "Demande générale",
          featureRequest: "Demande de fonctionnalité",
          bugReport: "Signalement de bug",
        },
        nameRequired: "Le nom est obligatoire",
        nameMin: "Le nom doit comporter au moins 2 caractères",
        emailRequired: "L'adresse e-mail est obligatoire",
        emailInvalid: "Saisissez une adresse e-mail valide",
        subjectRequired: "L'objet est obligatoire",
        subjectMax: "L'objet ne doit pas dépasser {max} caractères",
        categoryRequired: "Sélectionnez une catégorie d'assistance",
        messageRequired: "Le message est obligatoire",
        messageRange: "Le message doit comporter entre 10 et {max} caractères",
        transactionLookupFailed: "Nous n'avons pas pu vérifier cette référence de transaction dans la recherche simulée.",
        submitFailed: "Échec de l'envoi de la demande d'assistance. Veuillez réessayer plus tard.",
        contactSectionError: "Complétez vos coordonnées avant que nous puissions vous répondre.",
        requestSectionError: "Vérifiez les détails de la demande et corrigez les problèmes signalés.",
        successTitle: "Demande d'assistance envoyée",
        successBody: "Votre demande est en file d'attente et un e-mail de confirmation vous sera envoyé.",
        referenceId: "ID de référence",
        submitAnother: "Envoyer une autre demande",
        title: "Contacter l'assistance",
        subtitle: "Les modèles de validation partagés couvrent ici les champs obligatoires, le format, les plages et les vérifications de type asynchrone.",
        errorSummaryTitle: "Veuillez corriger les erreurs du formulaire d'assistance ci-dessous.",
        contactDetails: "Coordonnées",
        requestDetails: "Détails de la demande",
        nameLabel: "Nom",
        namePlaceholder: "Votre nom complet",
        emailLabel: "Adresse e-mail",
        categoryLabel: "Catégorie",
        subjectLabel: "Objet",
        subjectHint: "Obligatoire",
        subjectPlaceholder: "Brève description de votre problème",
        transactionIdLabel: "ID de transaction",
        transactionIdHintBefore: "Vérification asynchrone simulée : les références contenant",
        transactionIdHintAfter: "échouent à la recherche.",
        transactionIdPlaceholder: "Facultatif : TX-123...",
        messageLabel: "Message",
        messageHint: "Merci d'être aussi précis que possible",
        messagePlaceholder: "Décrivez votre problème ou votre question.",
        submitting: "Envoi en cours...",
        submit: "Envoyer la demande",
        otherOptions: "Autres options d'assistance",
        liveChat: "Chat en direct : disponible 24 h/24, 7 j/7 pour les urgences.",
        emailSupport: "Assistance par e-mail : support@neurowealth.com",
        forum: "Forum communautaire : obtenez de l'aide auprès d'autres utilisateurs.",
      },
      guidance: {
        title: "Guide de dépannage des transactions",
        subtitle: "Problèmes de transaction courants et leurs solutions. Cliquez sur un problème pour voir les conseils détaillés.",
        commonIssues: "Problèmes courants",
        severity: {
          low: "faible",
          medium: "moyenne",
          high: "élevée",
        },
        priority: "PRIORITÉ {severity}",
        symptoms: "Symptômes",
        solutions: "Solutions",
        prevention: "Prévention",
        quickActions: "Actions rapides",
        checkStatus: "Vérifier l'état de la transaction",
        networkStatus: "État du réseau",
        backToAll: "Retour à tous les problèmes",
        contactSupport: "Contacter l'assistance",
        selectIssue: "Sélectionnez un problème",
        selectIssueHint: "Choisissez un problème de transaction dans la liste pour afficher les étapes de dépannage et les solutions détaillées.",
        emergencyTitle: "Urgence : fonds en danger",
        emergencyBody: "Si vous pensez que vos fonds sont immédiatement menacés ou que vous avez rencontré un problème de sécurité critique :",
        emergencySupport: "Assistance d'urgence",
        emailEmergency: "Écrire à l'équipe d'urgence",
        issues: [
          {
            id: "transaction-stuck-pending",
            severity: "medium",
            title: "Transaction bloquée en attente",
            description: "Votre transaction n'est pas confirmée et reste en attente.",
            symptoms: [
              "La transaction reste « en attente » pendant plus de 5 minutes",
              "Aucune confirmation après plusieurs actualisations",
              "Les frais ont été prélevés mais la transaction n'est pas terminée",
            ],
            solutions: [
              "Patientez quelques minutes de plus : les transactions Stellar peuvent parfois être plus longues en cas de fort trafic",
              "Vérifiez l'état de la transaction sur un explorateur de blocs comme Stellar.expert",
              "Vérifiez que votre solde XLM couvre la réserve minimale et les frais",
              "Actualisez la page et reconnectez votre portefeuille",
              "Si la transaction est toujours en attente après 30 minutes, contactez l'assistance avec l'identifiant de la transaction",
            ],
            preventive: [
              "Vérifiez toujours l'état du réseau avant d'effectuer une transaction",
              "Assurez-vous d'avoir assez de XLM pour les frais (minimum 0,00001 XLM par opération)",
              "Évitez d'effectuer des transactions pendant les pics de congestion du réseau",
            ],
          },
          {
            id: "insufficient-balance",
            severity: "high",
            title: "Erreur de solde insuffisant",
            description: "La transaction a échoué en raison d'un solde insuffisant dans votre portefeuille.",
            symptoms: [
              "Message d'erreur « Solde insuffisant »",
              "Transaction rejetée alors que des fonds apparaissent dans le portefeuille",
              "Impossible de finaliser un échange ou un transfert",
            ],
            solutions: [
              "Vérifiez votre solde disponible (hors réserve minimale requise)",
              "Stellar exige une réserve minimale de 1 XLM par compte plus 0,5 XLM par ligne de confiance",
              "Ajoutez des XLM à votre portefeuille s'il est sous le minimum requis",
              "Divisez les grosses transactions en plusieurs plus petites si nécessaire",
              "Tenez compte des frais requis pour votre type de transaction",
            ],
            preventive: [
              "Conservez toujours au moins 2 XLM en marge pour les frais et les réserves",
              "Vérifiez les exigences de solde avant les transactions complexes",
              "Gardez en tête le nombre de lignes de confiance que vous avez (0,5 XLM chacune)",
            ],
          },
          {
            id: "wallet-connection",
            severity: "high",
            title: "Problèmes de connexion du portefeuille",
            description: "Impossible de connecter votre portefeuille ou de maintenir la connexion.",
            symptoms: [
              "Le bouton de connexion du portefeuille ne fonctionne pas",
              "Déconnexions fréquentes",
              "Message d'erreur indiquant que le portefeuille n'est pas détecté",
              "Les demandes de signature de transaction n'apparaissent pas",
            ],
            solutions: [
              "Vérifiez que l'extension de votre portefeuille est activée et à jour",
              "Videz le cache et les cookies du navigateur",
              "Essayez un autre navigateur",
              "Vérifiez si votre portefeuille est verrouillé et déverrouillez-le",
              "Redémarrez votre navigateur et réessayez",
              "Assurez-vous d'être sur le bon réseau (Stellar Mainnet)",
            ],
            preventive: [
              "Gardez l'extension de votre portefeuille à jour",
              "Utilisez des navigateurs reconnus comme Chrome, Firefox ou Brave",
              "Évitez d'utiliser plusieurs extensions de portefeuille en même temps",
            ],
          },
          {
            id: "bad-sequence",
            severity: "medium",
            title: "Transaction échouée - Mauvaise séquence",
            description: "La transaction a échoué à cause d'un numéro de séquence incorrect.",
            symptoms: [
              "Message d'erreur « bad sequence »",
              "Transaction rejetée immédiatement",
              "Plusieurs transactions échouent à la suite",
            ],
            solutions: [
              "Attendez d'abord la fin des transactions en attente",
              "Actualisez la connexion de votre portefeuille pour synchroniser les numéros de séquence",
              "Vérifiez si plusieurs onglets ou fenêtres sont ouverts avec le même portefeuille",
              "Réessayez la transaction après quelques minutes",
              "Contactez l'assistance si le problème persiste",
            ],
            preventive: [
              "Évitez d'effectuer plusieurs transactions simultanément",
              "Attendez la confirmation avant de lancer la transaction suivante",
              "Fermez les onglets inutilisés connectés au portefeuille",
            ],
          },
          {
            id: "trustline-issues",
            severity: "medium",
            title: "Problèmes de ligne de confiance",
            description: "Impossible de détenir certains jetons ou de transiger avec eux en raison de problèmes de ligne de confiance.",
            symptoms: [
              "Impossible de recevoir certains jetons",
              "Erreur liée aux lignes de confiance lors de l'ajout d'actifs",
              "Le solde du jeton affiche zéro malgré la réception de jetons",
            ],
            solutions: [
              "Créez d'abord une ligne de confiance pour le jeton concerné",
              "Assurez-vous d'avoir assez de XLM pour créer la ligne de confiance (0,5 XLM)",
              "Vérifiez que l'émetteur du jeton et le code de l'actif sont corrects",
              "Vérifiez que le jeton est toujours actif et n'a pas été révoqué",
              "Contactez l'émetteur du jeton si la création de la ligne de confiance échoue",
            ],
            preventive: [
              "Renseignez-vous sur les jetons avant de créer des lignes de confiance",
              "Maintenez un solde XLM suffisant pour les frais de ligne de confiance",
              "Ne créez des lignes de confiance que pour les jetons de confiance que vous prévoyez d'utiliser",
            ],
          },
          {
            id: "high-network-fees",
            severity: "low",
            title: "Frais de réseau élevés",
            description: "Les frais de transaction sont plus élevés que prévu ou changent de façon inattendue.",
            symptoms: [
              "Frais bien plus élevés que d'habitude",
              "L'estimation des frais ne cesse d'augmenter",
              "Transaction échouée en raison de frais insuffisants",
            ],
            solutions: [
              "Stellar applique des frais fixes et faibles (0,00001 XLM par opération)",
              "Vérifiez si vous êtes facturé par un service tiers",
              "Vérifiez que vous n'êtes pas sur un testnet ou un réseau personnalisé",
              "Comparez les frais affichés avec les frais réels du réseau",
              "Contactez l'assistance si les frais semblent incorrects",
            ],
            preventive: [
              "Vérifiez toujours les frais avant de confirmer",
              "Utilisez l'interface officielle de NeuroWealth pour éviter les frais cachés",
              "Restez informé de l'état du réseau",
            ],
          },
        ],
      },
    },
  },
};
