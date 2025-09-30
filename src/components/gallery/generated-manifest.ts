    {
      "id": "homepage",
      "entries": [
        {
          "id": "glitch-landing",
          "name": "Lavender Glitch landing",
          "description": "Feature-flagged landing layout showcasing Lavender Glitch navigation, hero, planner cards, and timeline rail.",
          "kind": "complex",
          "tags": [
            "landing",
            "homepage",
            "glitch"
          ],
          "preview": {
            "id": "pages:glitch-landing:overview"
          }
        },
        {
          "id": "dashboard-card",
          "name": "DashboardCard",
          "tags": [
            "dashboard",
            "card"
          ],
          "kind": "complex",
          "code": "<DashboardCard title=\"Demo\" />",
          "preview": {
            "id": "prompts:homepage:dashboard-card"
          }
        },
        {
          "id": "dashboard-list",
          "name": "DashboardList",
          "tags": [
            "dashboard",
            "list"
          ],
          "kind": "complex",
          "code": "<DashboardList\n  items={[\n    { id: \"sync\", title: \"Strategy sync\", meta: \"Today\" },\n    { id: \"retro\", title: \"Retro prep\", meta: \"Wed\" },\n  ]}\n  getKey={(item) => item.id}\n  itemClassName=\"flex justify-between text-ui\"\n  empty=\"No highlights\"\n  renderItem={(item) => (\n    <>\n      <span>{item.title}</span>\n      <span className=\"text-label text-muted-foreground\">{item.meta}</span>\n    </>\n  )}\n/>",
          "preview": {
            "id": "prompts:homepage:dashboard-list"
          }
        },
        {
          "id": "isometric-room",
          "name": "IsometricRoom",
          "tags": [
            "room",
            "3d"
          ],
          "kind": "complex",
          "code": "<IsometricRoom variant=\"aurora\" />",
          "preview": {
            "id": "prompts:homepage:isometric-room"
          }
        },
        {
          "id": "quick-action-grid",
          "name": "QuickActionGrid",
          "description": "Maps quick action configs to styled planner shortcuts",
          "tags": [
            "actions",
            "planner"
          ],
          "kind": "complex",
          "code": "<QuickActionGrid\n  actions={[\n    { href: \"/planner\", label: \"Planner Today\" },\n    { href: \"/goals\", label: \"New Goal\", tone: \"accent\" },\n    { href: \"/reviews\", label: \"New Review\", tone: \"accent\" },\n  ]}\n  layout=\"inline\"\n  buttonSize=\"lg\"\n  hoverLift\n/>",
          "preview": {
            "id": "prompts:homepage:quick-action-grid"
          }
        },
        {
          "id": "hero-planner-cards",
          "name": "HeroPlannerCards",
          "description": "Composite hero surface combining quick actions, overview metrics, and planner highlights for the landing page.",
          "tags": [
            "planner",
            "homepage",
            "hero"
          ],
          "kind": "complex",
          "code": "<SectionCard aria-labelledby=\"planner-overview-heading\">\n  <SectionCard.Header\n    id=\"planner-overview-heading\"\n    sticky={false}\n    title=\"Planner overview\"\n    titleAs=\"h2\"\n    titleClassName=\"text-title font-semibold tracking-[-0.01em]\"\n  />\n  <SectionCard.Body>\n    <HeroPlannerCards\n      variant=\"aurora\"\n      plannerOverviewProps={plannerOverviewProps}\n      highlights={weeklyHighlights}\n    />\n  </SectionCard.Body>\n</SectionCard>",
          "preview": {
            "id": "prompts:homepage:hero-planner-cards"
          }
        },
        {
          "id": "hero-portrait-frame",
          "name": "HeroPortraitFrame",
          "description": "Circular neumorphic portrait frame with lavender glow, glitch accent rim, and configurable `frame` toggle built from semantic tokens.",
          "tags": [
            "hero",
            "portrait",
            "glitch"
          ],
          "kind": "complex",
          "code": "<div className=\"flex flex-wrap items-center justify-center gap-[var(--space-3)]\">\n  <HeroPortraitFrame\n    imageSrc=\"/hero_image.png\"\n    imageAlt=\"Illustration of the Planner hero floating above a holographic dashboard with full frame treatment\"\n  />\n  <HeroPortraitFrame\n    frame={false}\n    imageSrc=\"/hero_image.png\"\n    imageAlt=\"Illustration of the Planner hero floating above a holographic dashboard without frame treatment\"\n  />\n</div>",
          "preview": {
            "id": "prompts:homepage:hero-portrait-frame"
          }
        },
        {
          "id": "portrait-frame",
          "name": "PortraitFrame",
          "description": "Dual-character neumorphic portrait that stages the angel and demon busts with pose variants and theme-aware cinematic lighting.",
          "tags": [
            "hero",
            "portrait",
            "duo"
          ],
          "kind": "complex",
          "code": "<div className=\"flex flex-wrap items-center justify-center gap-[var(--space-3)]\">\n  <PortraitFrame />\n  <PortraitFrame pose=\"angel-leading\" />\n  <PortraitFrame pose=\"back-to-back\" transparentBackground />\n</div>",
          "preview": {
            "id": "prompts:homepage:portrait-frame"
          }
        },
        {
          "id": "welcome-hero-figure",
          "name": "WelcomeHeroFigure",
          "description": "Hero automation figure framed in a haloed neumorphic ring with eager loading tuned for the landing experience.",
          "tags": [
            "hero",
            "figure",
            "neomorphic"
          ],
          "kind": "complex",
          "code": "<WelcomeHeroFigure />",
          "preview": {
            "id": "prompts:homepage:welcome-hero-figure"
          }
        }
      ]
    },
      {
        "id": "glitch-landing",
        "name": "Lavender Glitch landing",
        "description": "Feature-flagged landing layout showcasing Lavender Glitch navigation, hero, planner cards, and timeline rail.",
        "kind": "complex",
        "tags": [
          "landing",
          "homepage",
          "glitch"
        ],
        "preview": {
          "id": "pages:glitch-landing:overview"
        }
      },
      {
        "id": "dashboard-card",
        "name": "DashboardCard",
        "tags": [
          "dashboard",
          "card"
        ],
        "kind": "complex",
        "code": "<DashboardCard title=\"Demo\" />",
        "preview": {
          "id": "prompts:homepage:dashboard-card"
        }
      },
      {
        "id": "dashboard-list",
        "name": "DashboardList",
        "tags": [
          "dashboard",
          "list"
        ],
        "kind": "complex",
        "code": "<DashboardList\n  items={[\n    { id: \"sync\", title: \"Strategy sync\", meta: \"Today\" },\n    { id: \"retro\", title: \"Retro prep\", meta: \"Wed\" },\n  ]}\n  getKey={(item) => item.id}\n  itemClassName=\"flex justify-between text-ui\"\n  empty=\"No highlights\"\n  renderItem={(item) => (\n    <>\n      <span>{item.title}</span>\n      <span className=\"text-label text-muted-foreground\">{item.meta}</span>\n    </>\n  )}\n/>",
        "preview": {
          "id": "prompts:homepage:dashboard-list"
        }
      },
      {
        "id": "isometric-room",
        "name": "IsometricRoom",
        "tags": [
          "room",
          "3d"
        ],
        "kind": "complex",
        "code": "<IsometricRoom variant=\"aurora\" />",
        "preview": {
          "id": "prompts:homepage:isometric-room"
        }
      },
      {
        "id": "quick-action-grid",
        "name": "QuickActionGrid",
        "description": "Maps quick action configs to styled planner shortcuts",
        "tags": [
          "actions",
          "planner"
        ],
        "kind": "complex",
        "code": "<QuickActionGrid\n  actions={[\n    { href: \"/planner\", label: \"Planner Today\" },\n    { href: \"/goals\", label: \"New Goal\", tone: \"accent\" },\n    { href: \"/reviews\", label: \"New Review\", tone: \"accent\" },\n  ]}\n  layout=\"inline\"\n  buttonSize=\"lg\"\n  hoverLift\n/>",
        "preview": {
          "id": "prompts:homepage:quick-action-grid"
        }
      },
      {
        "id": "hero-planner-cards",
        "name": "HeroPlannerCards",
        "description": "Composite hero surface combining quick actions, overview metrics, and planner highlights for the landing page.",
        "tags": [
          "planner",
          "homepage",
          "hero"
        ],
        "kind": "complex",
        "code": "<SectionCard aria-labelledby=\"planner-overview-heading\">\n  <SectionCard.Header\n    id=\"planner-overview-heading\"\n    sticky={false}\n    title=\"Planner overview\"\n    titleAs=\"h2\"\n    titleClassName=\"text-title font-semibold tracking-[-0.01em]\"\n  />\n  <SectionCard.Body>\n    <HeroPlannerCards\n      variant=\"aurora\"\n      plannerOverviewProps={plannerOverviewProps}\n      highlights={weeklyHighlights}\n    />\n  </SectionCard.Body>\n</SectionCard>",
        "preview": {
          "id": "prompts:homepage:hero-planner-cards"
        }
      },
      {
        "id": "hero-portrait-frame",
        "name": "HeroPortraitFrame",
        "description": "Circular neumorphic portrait frame with lavender glow, glitch accent rim, and configurable `frame` toggle built from semantic tokens.",
        "tags": [
          "hero",
          "portrait",
          "glitch"
        ],
        "kind": "complex",
        "code": "<div className=\"flex flex-wrap items-center justify-center gap-[var(--space-3)]\">\n  <HeroPortraitFrame\n    imageSrc=\"/hero_image.png\"\n    imageAlt=\"Illustration of the Planner hero floating above a holographic dashboard with full frame treatment\"\n  />\n  <HeroPortraitFrame\n    frame={false}\n    imageSrc=\"/hero_image.png\"\n    imageAlt=\"Illustration of the Planner hero floating above a holographic dashboard without frame treatment\"\n  />\n</div>",
        "preview": {
          "id": "prompts:homepage:hero-portrait-frame"
        }
      },
      {
        "id": "portrait-frame",
        "name": "PortraitFrame",
        "description": "Dual-character neumorphic portrait that stages the angel and demon busts with pose variants and theme-aware cinematic lighting.",
        "tags": [
          "hero",
          "portrait",
          "duo"
        ],
        "kind": "complex",
        "code": "<div className=\"flex flex-wrap items-center justify-center gap-[var(--space-3)]\">\n  <PortraitFrame />\n  <PortraitFrame pose=\"angel-leading\" />\n  <PortraitFrame pose=\"back-to-back\" transparentBackground />\n</div>",
        "preview": {
          "id": "prompts:homepage:portrait-frame"
        }
      },
      {
        "id": "welcome-hero-figure",
        "name": "WelcomeHeroFigure",
        "description": "Hero automation figure framed in a haloed neumorphic ring with eager loading tuned for the landing experience.",
        "tags": [
          "hero",
          "figure",
          "neomorphic"
        ],
        "kind": "complex",
        "code": "<WelcomeHeroFigure />",
        "preview": {
          "id": "prompts:homepage:welcome-hero-figure"
        }
      },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-aurora",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-aurora--bg-1",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-aurora--bg-2",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-aurora--bg-3",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-aurora--bg-4",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-citrus",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-citrus--bg-1",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-citrus--bg-2",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-citrus--bg-3",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-citrus--bg-4",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-hardstuck",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-hardstuck--bg-1",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-hardstuck--bg-2",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-hardstuck--bg-3",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-hardstuck--bg-4",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-kitten",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-kitten--bg-1",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-kitten--bg-2",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-kitten--bg-3",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-kitten--bg-4",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-lg",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-lg--bg-1",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-lg--bg-2",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-lg--bg-3",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-lg--bg-4",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-noir",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-noir--bg-1",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-noir--bg-2",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-noir--bg-3",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-noir--bg-4",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-ocean",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-ocean--bg-1",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-ocean--bg-2",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-ocean--bg-3",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-homepage--entry-glitch-landing--preview-pages-glitch-landing-overview--theme-ocean--bg-4",
    "previewId": "pages:glitch-landing:overview",
    "entryId": "glitch-landing",
    "entryName": "Lavender Glitch landing",
    "sectionId": "homepage",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    loader: () => import("./pages/glitch-landing.gallery"),
    previewIds: [
      "pages:glitch-landing:overview",
    ],
  },
