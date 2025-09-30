        {
          "id": "neon-icon",
          "name": "NeonIcon",
          "description": "Animated neon glyph used for toggle affordances and scoreboard highlights. Glow layers respect tone tokens and reduced-motion preferences.",
          "kind": "primitive",
          "tags": [
            "icon",
            "glow",
            "toggle"
          ],
          "props": [
            {
              "name": "icon",
              "type": "React.ComponentType<React.SVGProps<SVGSVGElement>>"
            },
            {
              "name": "on",
              "type": "boolean",
              "defaultValue": "false"
            },
            {
              "name": "size",
              "type": "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\"",
              "defaultValue": "\"md\""
            },
            {
              "name": "tone",
              "type": "\"accent\" | \"primary\" | \"ring\" | \"success\" | \"warning\" | \"danger\" | \"info\"",
              "defaultValue": "\"accent\""
            },
            {
              "name": "colorVar",
              "type": "string",
              "description": "CSS variable override such as \"--primary\"."
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
            },
            {
              "name": "className",
              "type": "string"
            }
          ],
          "axes": [
            {
              "id": "size",
              "label": "Size",
              "type": "state",
              "values": [
                {
                  "value": "XS"
                },
                {
                  "value": "Small"
                },
                {
                  "value": "Medium"
                },
                {
                  "value": "Large"
                },
                {
                  "value": "XL"
                },
                {
                  "value": "2XL",
                  "description": "Anchors to --icon-size-2xl so large toggles stay aligned with the space-9-plus rhythm."
                }
              ]
            },
            {
              "id": "tone",
              "label": "Tone",
              "type": "variant",
              "values": [
                {
                  "value": "Accent"
                },
                {
                  "value": "Primary"
                },
                {
                  "value": "Ring"
                },
                {
                  "value": "Success"
                },
                {
                  "value": "Warning"
                },
                {
                  "value": "Danger"
                },
                {
                  "value": "Info"
                }
              ]
            }
          ],
          "code": "<div className=\"flex flex-col gap-[var(--space-4)]\">\n  <div className=\"grid grid-cols-[repeat(auto-fit,minmax(144px,1fr))] gap-[var(--space-3)]\">\n    <NeonIcon icon={Star} on size=\"xs\" />\n    <NeonIcon icon={Star} on size=\"sm\" />\n    <NeonIcon icon={Star} on size=\"md\" />\n    <NeonIcon icon={Star} on size=\"lg\" />\n    <NeonIcon icon={Star} on size=\"xl\" />\n    <NeonIcon icon={Star} on size=\"2xl\" />\n  </div>\n  <div className=\"flex flex-wrap items-center justify-center gap-[var(--space-3)]\">\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"accent\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"primary\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"ring\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"success\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"warning\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"danger\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"info\" />\n  </div>\n</div>",
          "preview": {
            "id": "ui:neon-icon:matrix"
          },
          "states": [
            {
              "id": "size-xs",
              "name": "XS",
              "code": "<NeonIcon icon={Star} on size=\"xs\" />",
              "preview": {
                "id": "ui:neon-icon:state:size-xs"
              }
            },
            {
              "id": "size-sm",
              "name": "Small",
              "code": "<NeonIcon icon={Star} on size=\"sm\" />",
              "preview": {
                "id": "ui:neon-icon:state:size-sm"
              }
            },
            {
              "id": "size-md",
              "name": "Medium",
              "code": "<NeonIcon icon={Star} on size=\"md\" />",
              "preview": {
                "id": "ui:neon-icon:state:size-md"
              }
            },
            {
              "id": "size-lg",
              "name": "Large",
              "code": "<NeonIcon icon={Star} on size=\"lg\" />",
              "preview": {
                "id": "ui:neon-icon:state:size-lg"
              }
            },
            {
              "id": "size-xl",
              "name": "XL",
              "code": "<NeonIcon icon={Star} on size=\"xl\" />",
              "preview": {
                "id": "ui:neon-icon:state:size-xl"
              }
            },
            {
              "id": "size-2xl",
              "name": "2XL",
              "description": "Anchors to --icon-size-2xl so large toggles stay aligned with the space-9-plus rhythm.",
              "code": "<NeonIcon icon={Star} on size=\"2xl\" />",
              "preview": {
                "id": "ui:neon-icon:state:size-2xl"
              }
            }
          ]
        },
      {
        "id": "neon-icon",
        "name": "NeonIcon",
        "description": "Animated neon glyph used for toggle affordances and scoreboard highlights. Glow layers respect tone tokens and reduced-motion preferences.",
        "kind": "primitive",
        "tags": [
          "icon",
          "glow",
          "toggle"
        ],
        "props": [
          {
            "name": "icon",
            "type": "React.ComponentType<React.SVGProps<SVGSVGElement>>"
          },
          {
            "name": "on",
            "type": "boolean",
            "defaultValue": "false"
          },
          {
            "name": "size",
            "type": "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\"",
            "defaultValue": "\"md\""
          },
          {
            "name": "tone",
            "type": "\"accent\" | \"primary\" | \"ring\" | \"success\" | \"warning\" | \"danger\" | \"info\"",
            "defaultValue": "\"accent\""
          },
          {
            "name": "colorVar",
            "type": "string",
            "description": "CSS variable override such as \"--primary\"."
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
          },
          {
            "name": "className",
            "type": "string"
          }
        ],
        "axes": [
          {
            "id": "size",
            "label": "Size",
            "type": "state",
            "values": [
              {
                "value": "XS"
              },
              {
                "value": "Small"
              },
              {
                "value": "Medium"
              },
              {
                "value": "Large"
              },
              {
                "value": "XL"
              },
              {
                "value": "2XL",
                "description": "Anchors to --icon-size-2xl so large toggles stay aligned with the space-9-plus rhythm."
              }
            ]
          },
          {
            "id": "tone",
            "label": "Tone",
            "type": "variant",
            "values": [
              {
                "value": "Accent"
              },
              {
                "value": "Primary"
              },
              {
                "value": "Ring"
              },
              {
                "value": "Success"
              },
              {
                "value": "Warning"
              },
              {
                "value": "Danger"
              },
              {
                "value": "Info"
              }
            ]
          }
        ],
        "code": "<div className=\"flex flex-col gap-[var(--space-4)]\">\n  <div className=\"grid grid-cols-[repeat(auto-fit,minmax(144px,1fr))] gap-[var(--space-3)]\">\n    <NeonIcon icon={Star} on size=\"xs\" />\n    <NeonIcon icon={Star} on size=\"sm\" />\n    <NeonIcon icon={Star} on size=\"md\" />\n    <NeonIcon icon={Star} on size=\"lg\" />\n    <NeonIcon icon={Star} on size=\"xl\" />\n    <NeonIcon icon={Star} on size=\"2xl\" />\n  </div>\n  <div className=\"flex flex-wrap items-center justify-center gap-[var(--space-3)]\">\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"accent\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"primary\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"ring\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"success\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"warning\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"danger\" />\n    <NeonIcon icon={Star} on size=\"2xl\" tone=\"info\" />\n  </div>\n</div>",
        "preview": {
          "id": "ui:neon-icon:matrix"
        },
        "states": [
          {
            "id": "size-xs",
            "name": "XS",
            "code": "<NeonIcon icon={Star} on size=\"xs\" />",
            "preview": {
              "id": "ui:neon-icon:state:size-xs"
            }
          },
          {
            "id": "size-sm",
            "name": "Small",
            "code": "<NeonIcon icon={Star} on size=\"sm\" />",
            "preview": {
              "id": "ui:neon-icon:state:size-sm"
            }
          },
          {
            "id": "size-md",
            "name": "Medium",
            "code": "<NeonIcon icon={Star} on size=\"md\" />",
            "preview": {
              "id": "ui:neon-icon:state:size-md"
            }
          },
          {
            "id": "size-lg",
            "name": "Large",
            "code": "<NeonIcon icon={Star} on size=\"lg\" />",
            "preview": {
              "id": "ui:neon-icon:state:size-lg"
            }
          },
          {
            "id": "size-xl",
            "name": "XL",
            "code": "<NeonIcon icon={Star} on size=\"xl\" />",
            "preview": {
              "id": "ui:neon-icon:state:size-xl"
            }
          },
          {
            "id": "size-2xl",
            "name": "2XL",
            "description": "Anchors to --icon-size-2xl so large toggles stay aligned with the space-9-plus rhythm.",
            "code": "<NeonIcon icon={Star} on size=\"2xl\" />",
            "preview": {
              "id": "ui:neon-icon:state:size-2xl"
            }
          }
        ]
      },
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-aurora",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-citrus",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-hardstuck",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-kitten",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-lg",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-lg--bg-1",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-lg--bg-2",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-lg--bg-3",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-lg--bg-4",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-noir",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-noir--bg-1",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-noir--bg-2",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-noir--bg-3",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-noir--bg-4",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-ocean",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-matrix--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:matrix",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": null,
    "stateName": null,
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-aurora",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-citrus",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-hardstuck",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-kitten",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-lg",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-lg--bg-1",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-lg--bg-2",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-lg--bg-3",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-lg--bg-4",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-noir",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-noir--bg-1",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-noir--bg-2",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-noir--bg-3",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-noir--bg-4",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-ocean",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-2xl--state-size-2xl--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:state:size-2xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-2xl",
    "stateName": "2XL",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-aurora",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-citrus",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-hardstuck",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-kitten",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-lg",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-lg--bg-1",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-lg--bg-2",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-lg--bg-3",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-lg--bg-4",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-noir",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-noir--bg-1",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-noir--bg-2",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-noir--bg-3",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-noir--bg-4",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-ocean",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-lg--state-size-lg--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:state:size-lg",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-lg",
    "stateName": "Large",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-aurora",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-citrus",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-hardstuck",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-kitten",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-lg",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-lg--bg-1",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-lg--bg-2",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-lg--bg-3",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-lg--bg-4",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-noir",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-noir--bg-1",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-noir--bg-2",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-noir--bg-3",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-noir--bg-4",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-ocean",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-md--state-size-md--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:state:size-md",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-md",
    "stateName": "Medium",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-aurora",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-citrus",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-hardstuck",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-kitten",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-lg",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-lg--bg-1",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-lg--bg-2",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-lg--bg-3",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-lg--bg-4",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-noir",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-noir--bg-1",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-noir--bg-2",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-noir--bg-3",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-noir--bg-4",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-ocean",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-sm--state-size-sm--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:state:size-sm",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-sm",
    "stateName": "Small",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-aurora",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-citrus",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-hardstuck",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-kitten",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-lg",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-lg--bg-1",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-lg--bg-2",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-lg--bg-3",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-lg--bg-4",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-noir",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-noir--bg-1",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-noir--bg-2",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-noir--bg-3",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-noir--bg-4",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-ocean",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xl--state-size-xl--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:state:size-xl",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xl",
    "stateName": "XL",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-aurora",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-aurora--bg-1",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-aurora--bg-2",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-aurora--bg-3",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-aurora--bg-4",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-citrus",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-citrus--bg-1",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-citrus--bg-2",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-citrus--bg-3",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-citrus--bg-4",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-hardstuck",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-hardstuck--bg-1",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-hardstuck--bg-2",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-hardstuck--bg-3",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-hardstuck--bg-4",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-kitten",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-kitten--bg-1",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-kitten--bg-2",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-kitten--bg-3",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-kitten--bg-4",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-lg",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-lg--bg-1",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-lg--bg-2",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-lg--bg-3",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-lg--bg-4",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-noir",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-noir--bg-1",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-noir--bg-2",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-noir--bg-3",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-noir--bg-4",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-ocean",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-ocean--bg-1",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-ocean--bg-2",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-ocean--bg-3",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-neon-icon--preview-ui-neon-icon-state-size-xs--state-size-xs--theme-ocean--bg-4",
    "previewId": "ui:neon-icon:state:size-xs",
    "entryId": "neon-icon",
    "entryName": "NeonIcon",
    "sectionId": "toggles",
    "stateId": "size-xs",
    "stateName": "XS",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-aurora",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-aurora--bg-1",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "aurora",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-aurora--bg-2",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "aurora",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-aurora--bg-3",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "aurora",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-aurora--bg-4",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "aurora",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-citrus",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "citrus",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-citrus--bg-1",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "citrus",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-citrus--bg-2",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "citrus",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-citrus--bg-3",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "citrus",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-citrus--bg-4",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "citrus",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-hardstuck",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "hardstuck",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-hardstuck--bg-1",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "hardstuck",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-hardstuck--bg-2",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "hardstuck",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-hardstuck--bg-3",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "hardstuck",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-hardstuck--bg-4",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "hardstuck",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-kitten",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "kitten",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-kitten--bg-1",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "kitten",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-kitten--bg-2",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "kitten",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-kitten--bg-3",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "kitten",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-kitten--bg-4",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "kitten",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-lg",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "lg",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-lg--bg-1",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "lg",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-lg--bg-2",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "lg",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-lg--bg-3",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "lg",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-lg--bg-4",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "lg",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-noir",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "noir",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-noir--bg-1",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "noir",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-noir--bg-2",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "noir",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-noir--bg-3",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "noir",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-noir--bg-4",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "noir",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-ocean",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "ocean",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-ocean--bg-1",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "ocean",
    "themeBackground": 1
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-ocean--bg-2",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "ocean",
    "themeBackground": 2
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-ocean--bg-3",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "ocean",
    "themeBackground": 3
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-active--state-active--theme-ocean--bg-4",
    "previewId": "ui:tab-bar:state:active",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "active",
    "stateName": "Active",
    "themeVariant": "ocean",
    "themeBackground": 4
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-default--state-default--theme-aurora",
    "previewId": "ui:tab-bar:state:default",
    "entryId": "tab-bar",
    "entryName": "TabBar",
    "sectionId": "toggles",
    "stateId": "default",
    "stateName": "Default",
    "themeVariant": "aurora",
    "themeBackground": 0
  },
  {
    "slug": "section-toggles--entry-tab-bar--preview-ui-tab-bar-state-default--state-default--theme-aurora--bg-1",
    "previewId": "ui:tab-bar:state:default",
  {
    loader: () => import("../ui/toggles/NeonIcon.gallery"),
    previewIds: [
      "ui:neon-icon:matrix",
      "ui:neon-icon:state:size-xs",
      "ui:neon-icon:state:size-sm",
      "ui:neon-icon:state:size-md",
      "ui:neon-icon:state:size-lg",
      "ui:neon-icon:state:size-xl",
      "ui:neon-icon:state:size-2xl",
    ],
  },
