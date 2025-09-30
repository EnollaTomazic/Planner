        {
          "id": "neon-icon",
          "name": "NeonIcon",
          "description": "Animated neon glyph with tone-driven glow ramps and power states.",
          "kind": "primitive",
          "tags": [
            "icon",
            "toggle",
            "glow"
          ],
          "props": [
            {
              "name": "icon",
              "type": "React.ComponentType<React.SVGProps<SVGSVGElement>>"
            },
            {
              "name": "on",
              "type": "boolean"
            },
            {
              "name": "tone",
              "type": "\"accent\" | \"primary\" | \"ring\" | \"success\" | \"warning\" | \"danger\" | \"info\"",
              "defaultValue": "\"accent\""
            },
            {
              "name": "size",
              "type": "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\"",
              "defaultValue": "\"md\""
            },
            {
              "name": "scanlines",
              "type": "boolean",
              "defaultValue": "true"
            },
            {
              "name": "aura",
              "type": "boolean",
              "defaultValue": "true"
            }
          ],
          "axes": [
            {
              "id": "state",
              "label": "State",
              "type": "state",
              "values": [
                {
                  "value": "Accent (lit)"
                },
                {
                  "value": "Danger (lit)"
                },
                {
                  "value": "Danger (powerdown)"
                }
              ]
            }
          ],
          "code": "<div className=\"flex flex-wrap items-center gap-[var(--space-4)]\">\n  <NeonIcon icon={Zap} on tone=\"accent\" />\n  <NeonIcon icon={Zap} on tone=\"primary\" />\n  <NeonIcon icon={Zap} on tone=\"ring\" />\n  <NeonIcon icon={Zap} on tone=\"success\" />\n  <NeonIcon icon={Zap} on tone=\"warning\" />\n  <NeonIcon icon={Zap} on tone=\"danger\" />\n  <NeonIcon icon={Zap} on={false} tone=\"danger\" />\n</div>",
          "preview": {
            "id": "ui:neon-icon:gallery"
          },
          "states": [
            {
              "id": "accent",
              "name": "Accent (lit)",
              "code": "<NeonIcon icon={Zap} on tone=\"accent\" />",
              "preview": {
                "id": "ui:neon-icon:state:accent"
              }
            },
            {
              "id": "danger",
              "name": "Danger (lit)",
              "code": "<NeonIcon icon={Zap} on tone=\"danger\" />",
              "preview": {
                "id": "ui:neon-icon:state:danger"
              }
            },
            {
              "id": "danger-off",
              "name": "Danger (powerdown)",
              "code": "<NeonIcon icon={Zap} on={false} tone=\"danger\" />",
              "preview": {
                "id": "ui:neon-icon:state:danger-off"
              }
            }
          ]
        },
      {
        "id": "neon-icon",
        "name": "NeonIcon",
        "description": "Animated neon glyph with tone-driven glow ramps and power states.",
        "kind": "primitive",
        "tags": [
          "icon",
          "toggle",
          "glow"
        ],
        "props": [
          {
            "name": "icon",
            "type": "React.ComponentType<React.SVGProps<SVGSVGElement>>"
          },
          {
            "name": "on",
            "type": "boolean"
          },
          {
            "name": "tone",
            "type": "\"accent\" | \"primary\" | \"ring\" | \"success\" | \"warning\" | \"danger\" | \"info\"",
            "defaultValue": "\"accent\""
          },
          {
            "name": "size",
            "type": "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\"",
            "defaultValue": "\"md\""
          },
          {
            "name": "scanlines",
            "type": "boolean",
            "defaultValue": "true"
          },
          {
            "name": "aura",
            "type": "boolean",
            "defaultValue": "true"
          }
        ],
        "axes": [
          {
            "id": "state",
            "label": "State",
            "type": "state",
            "values": [
              {
                "value": "Accent (lit)"
              },
              {
                "value": "Danger (lit)"
              },
              {
                "value": "Danger (powerdown)"
              }
            ]
          }
        ],
        "code": "<div className=\"flex flex-wrap items-center gap-[var(--space-4)]\">\n  <NeonIcon icon={Zap} on tone=\"accent\" />\n  <NeonIcon icon={Zap} on tone=\"primary\" />\n  <NeonIcon icon={Zap} on tone=\"ring\" />\n  <NeonIcon icon={Zap} on tone=\"success\" />\n  <NeonIcon icon={Zap} on tone=\"warning\" />\n  <NeonIcon icon={Zap} on tone=\"danger\" />\n  <NeonIcon icon={Zap} on={false} tone=\"danger\" />\n</div>",
        "preview": {
          "id": "ui:neon-icon:gallery"
        },
        "states": [
          {
            "id": "accent",
            "name": "Accent (lit)",
            "code": "<NeonIcon icon={Zap} on tone=\"accent\" />",
            "preview": {
              "id": "ui:neon-icon:state:accent"
            }
          },
          {
            "id": "danger",
            "name": "Danger (lit)",
            "code": "<NeonIcon icon={Zap} on tone=\"danger\" />",
            "preview": {
              "id": "ui:neon-icon:state:danger"
            }
          },
          {
            "id": "danger-off",
            "name": "Danger (powerdown)",
            "code": "<NeonIcon icon={Zap} on={false} tone=\"danger\" />",
            "preview": {
              "id": "ui:neon-icon:state:danger-off"
            }
          }
        ]
      },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-aurora",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-citrus",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-hardstuck",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-kitten",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-lg",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-lg--bg-1",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-lg--bg-2",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-lg--bg-3",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-lg--bg-4",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-noir",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-noir--bg-1",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-noir--bg-2",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-noir--bg-3",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-noir--bg-4",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-ocean",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-gallery--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:gallery",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": null,
    "stateName": null,
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-aurora",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-citrus",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-hardstuck",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-kitten",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-lg",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-lg--bg-1",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-lg--bg-2",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-lg--bg-3",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-lg--bg-4",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-noir",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-noir--bg-1",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-noir--bg-2",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-noir--bg-3",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-noir--bg-4",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-ocean",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-accent--state-accent--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:state:accent",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "accent",
    "stateName": "Accent (lit)",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-aurora",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-citrus",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-hardstuck",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-kitten",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-lg",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-lg--bg-1",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-lg--bg-2",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-lg--bg-3",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-lg--bg-4",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-noir",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-noir--bg-1",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-noir--bg-2",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-noir--bg-3",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-noir--bg-4",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-ocean",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger--state-danger--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:state:danger",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger",
    "stateName": "Danger (lit)",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-aurora",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-citrus",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-hardstuck",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-kitten",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-lg",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-lg--bg-1",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-lg--bg-2",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-lg--bg-3",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-lg--bg-4",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-noir",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-noir--bg-1",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-noir--bg-2",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-noir--bg-3",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-noir--bg-4",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-ocean",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-danger-off--state-danger-off--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:state:danger-off",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "danger-off",
    "stateName": "Danger (powerdown)",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    loader: () => import("../ui/toggles/NeonIcon.gallery"),
    previewIds: [
      "ui:neon-icon:gallery",
      "ui:neon-icon:state:accent",
      "ui:neon-icon:state:danger",
      "ui:neon-icon:state:danger-off",
    ],
  },
