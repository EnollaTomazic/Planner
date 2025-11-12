"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui"
import {
  NoiseOverlay,
  type NoiseLevel,
} from "@/components/ui/patterns/NoiseOverlay"

type CardAs = "article" | "section"

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: CardAs
  noiseLevel?: NoiseLevel
}

type CardHeaderBaseProps = {
  eyebrow?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  titleAs?: "h2" | "h3" | "h4" | "h5" | "h6"
  eyebrowClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  actionsClassName?: string
  loading?: boolean
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> &
  CardHeaderBaseProps

export interface CardBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

type CardContextValue = {
  headingId?: string
  setHeadingId: React.Dispatch<React.SetStateAction<string | undefined>>
}

const CardContext = React.createContext<CardContextValue | null>(null)

const CardRoot = React.forwardRef<HTMLElement, CardProps>(
  (
    {
      as: Component = "article",
      className,
      children,
      noiseLevel = "subtle",
      ...props
    },
    ref,
  ) => {
    const [headingId, setHeadingId] = React.useState<string | undefined>()
    const contextValue = React.useMemo(
      () => ({ headingId, setHeadingId }),
      [headingId],
    )

    return (
      <CardContext.Provider value={contextValue}>
        <Component
          ref={ref}
          className={cn(
            "relative isolate flex flex-col gap-[var(--space-4)] overflow-hidden rounded-card",
            "r-card-lg border border-card-hairline/60 bg-panel/65 p-[var(--space-4)] text-card-foreground",
            "shadow-[inset_0_1px_0_hsl(var(--line)/0.2),var(--shadow-inner-md)]",
            "sm:p-[var(--space-5)]",
            className,
          )}
          {...props}
        >
          {children}
          <NoiseOverlay level={noiseLevel} />
        </Component>
      </CardContext.Provider>
    )
  },
)
CardRoot.displayName = "Card"

const baseActionsClass = "flex flex-wrap items-center gap-[var(--space-2)]"

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      eyebrow,
      title,
      description,
      actions,
      children,
      className,
      titleAs = "h3",
      eyebrowClassName,
      titleClassName,
      descriptionClassName,
      actionsClassName,
      id,
      loading = false,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(CardContext)
    const autoId = React.useId()
    const shouldUseSlotLayout = children === undefined || children === null
    const hasTitle = shouldUseSlotLayout && title != null
    const headingId = hasTitle ? id ?? autoId : id

    React.useEffect(() => {
      if (!context) return

      context.setHeadingId(headingId)

      return () => {
        context.setHeadingId(undefined)
      }
    }, [context, headingId])

    if (!shouldUseSlotLayout) {
      return (
        <header ref={ref} className={cn("flex flex-col gap-[var(--space-2)]", className)} {...props}>
          {children}
        </header>
      )
    }

    const HeadingTag = titleAs

    return (
      <header
        ref={ref}
        className={cn("flex flex-col gap-[var(--space-3)]", className)}
        {...props}
      >
        <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
          <div className="space-y-[var(--space-1)]">
            {eyebrow ? (
              <p
                className={cn(
                  "text-label font-medium uppercase tracking-[0.08em] text-muted-foreground",
                  eyebrowClassName,
                )}
              >
                {loading ? <Skeleton ariaHidden={false} className="h-[var(--space-3)] w-[var(--space-12)]" /> : eyebrow}
              </p>
            ) : null}
            {title ? (
              loading ? (
                <Skeleton
                  ariaHidden={false}
                  className="h-[var(--space-5)] w-[min(70%,var(--space-20))]"
                />
              ) : (
                <HeadingTag
                  id={headingId}
                  className={cn("text-title font-semibold text-foreground", titleClassName)}
                >
                  {title}
                </HeadingTag>
              )
            ) : null}
            {description ? (
              loading ? (
                <Skeleton
                  ariaHidden={false}
                  className="h-[var(--space-3)] w-[min(60%,var(--space-24))]"
                />
              ) : (
                <p
                  className={cn(
                    "text-label text-muted-foreground",
                    descriptionClassName,
                  )}
                >
                  {description}
                </p>
              )
            ) : null}
          </div>
          {actions ? (
            <div className={cn(baseActionsClass, actionsClassName)}>
              {loading ? (
                <Skeleton
                  ariaHidden={false}
                  className="h-[var(--control-h-sm)] w-[calc(var(--space-8)*2)]"
                />
              ) : (
                actions
              )}
            </div>
          ) : null}
        </div>
      </header>
    )
  },
)
CardHeader.displayName = "CardHeader"

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => {
    const headingId = React.useContext(CardContext)?.headingId

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-[var(--space-3)] text-ui text-muted-foreground", className)}
        aria-labelledby={headingId}
        {...props}
      />
    )
  },
)
CardBody.displayName = "CardBody"

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "border-t border-card-hairline/60 pt-[var(--space-4)] text-label text-muted-foreground",
          className,
        )}
        {...props}
      />
    )
  },
)
CardFooter.displayName = "CardFooter"

const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(baseActionsClass, className)}
        {...props}
      />
    )
  },
)
CardActions.displayName = "CardActions"

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Actions: CardActions,
})

export { Card }
