import * as React from "react";

export type CatCompanionIconProps = React.SVGProps<SVGSVGElement>;

const CAT_COMPANION_PATH =
  "M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 " +
  "12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z";

const CatCompanionIcon = React.forwardRef<SVGSVGElement, CatCompanionIconProps>(
  (
    {
      className,
      "aria-label": ariaLabel,
      "aria-hidden": ariaHidden,
      role,
      focusable,
      ...rest
    },
    ref
  ) => {
    const computedRole = role ?? (ariaLabel ? "img" : "presentation");
    const computedAriaHidden = ariaHidden ?? (ariaLabel ? undefined : true);
    const computedFocusable = focusable ?? false;

    return (
      <svg
        ref={ref}
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        role={computedRole}
        aria-label={ariaLabel}
        aria-hidden={computedAriaHidden}
        focusable={computedFocusable}
        {...rest}
      >
        <path d={CAT_COMPANION_PATH} />
      </svg>
    );
  }
);

CatCompanionIcon.displayName = "CatCompanionIcon";

export default CatCompanionIcon;
