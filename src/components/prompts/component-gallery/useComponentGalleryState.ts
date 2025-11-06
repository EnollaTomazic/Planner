"use client";

import * as React from "react";
import type { FilterKey } from "@/components/goals";
import type { GameSide } from "@/components/ui/league/SideSelector";
import type { Pillar } from "@/lib/types";

export type ToggleSide = "Left" | "Right";

export interface ButtonsPanelData {
  appTabs: {
    value: string;
    onValueChange: (value: string) => void;
  };
  neoTabs: {
    value: string;
    onValueChange: (value: string) => void;
  };
  filterTabs: {
    value: string;
    onValueChange: (value: string) => void;
  };
  checkCircle: {
    checked: boolean;
    onChange: (value: boolean) => void;
  };
  toggle: {
    value: ToggleSide;
    onChange: (value: ToggleSide) => void;
  };
  sideSelector: {
    value: GameSide;
    onChange: (value: GameSide) => void;
  };
  tactile: {
    primary: {
      active: boolean;
      onToggle: () => void;
    };
    secondary: {
      active: boolean;
      onToggle: () => void;
    };
  };
}

export interface InputsPanelData {
  searchBar: {
    value: string;
    onValueChange: (value: string) => void;
  };
  labelId: string;
  selects: {
    native: {
      value: string;
      onChange: (value: string) => void;
    };
    settings: {
      value: string | undefined;
      onChange: (value: string | undefined) => void;
    };
    defaultVariant: {
      value: string;
      onChange: (value: string) => void;
    };
    successVariant: {
      value: string;
      onChange: (value: string) => void;
    };
  };
}

export interface PromptsPanelData {
  pillarSelector: {
    value: Pillar[];
    onChange: (value: Pillar[]) => void;
  };
}

export interface PlannerPanelData {
  goalFilter: {
    value: FilterKey;
    onChange: (value: FilterKey) => void;
  };
}

export interface MiscPanelData {
  headerTabs: {
    value: string;
    onChange: (value: string) => void;
  };
  searchBar: {
    value: string;
    onValueChange: (value: string) => void;
  };
}

export interface ComponentGalleryPanels {
  buttons: ButtonsPanelData;
  inputs: InputsPanelData;
  prompts: PromptsPanelData;
  planner: PlannerPanelData;
  misc: MiscPanelData;
}

export function useComponentGalleryState(): ComponentGalleryPanels {
  const [goalFilter, setGoalFilter] = React.useState<FilterKey>("All");
  const [query, setQuery] = React.useState("");
  const [appTab, setAppTab] = React.useState("reviews");
  const [neoTab, setNeoTab] = React.useState("one");
  const [filterTab, setFilterTab] = React.useState("all");
  const [checked, setChecked] = React.useState(false);
  const [toggleSide, setToggleSide] = React.useState<ToggleSide>("Left");
  const [side, setSide] = React.useState<GameSide>("Blue");
  const [pillars, setPillars] = React.useState<Pillar[]>([]);
  const [selectValue, setSelectValue] = React.useState<string | undefined>();
  const [nativeSelectValue, setNativeSelectValue] = React.useState("");
  const [defaultVariantSelectValue, setDefaultVariantSelectValue] = React.useState("");
  const [successVariantSelectValue, setSuccessVariantSelectValue] = React.useState("");
  const [headerTab, setHeaderTab] = React.useState("one");
  const [tactilePrimaryActive, setTactilePrimaryActive] = React.useState(false);
  const [tactileSecondaryActive, setTactileSecondaryActive] = React.useState(false);

  const labelId = React.useId();

  const handleAppTabChange = React.useCallback((value: string) => {
    setAppTab(value);
  }, []);

  const handleNeoTabChange = React.useCallback((value: string) => {
    setNeoTab(value);
  }, []);

  const handleFilterTabChange = React.useCallback((value: string) => {
    setFilterTab(value);
  }, []);

  const handleCheckCircleChange = React.useCallback((value: boolean) => {
    setChecked(value);
  }, []);

  const handleToggleChange = React.useCallback((value: ToggleSide) => {
    setToggleSide(value);
  }, []);

  const handleSideChange = React.useCallback((value: GameSide) => {
    setSide(value);
  }, []);

  const togglePrimary = React.useCallback(() => {
    setTactilePrimaryActive((prev) => !prev);
  }, []);

  const toggleSecondary = React.useCallback(() => {
    setTactileSecondaryActive((prev) => !prev);
  }, []);

  const handleSearchChange = React.useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleNativeSelectChange = React.useCallback((value: string) => {
    setNativeSelectValue(value);
  }, []);

  const handleSettingsSelectChange = React.useCallback((value: string | undefined) => {
    setSelectValue(value);
  }, []);

  const handleDefaultSelectChange = React.useCallback((value: string) => {
    setDefaultVariantSelectValue(value);
  }, []);

  const handleSuccessSelectChange = React.useCallback((value: string) => {
    setSuccessVariantSelectValue(value);
  }, []);

  const handleGoalFilterChange = React.useCallback((value: FilterKey) => {
    setGoalFilter(value);
  }, []);

  const handlePillarsChange = React.useCallback((value: Pillar[]) => {
    setPillars(value);
  }, []);

  const handleHeaderTabChange = React.useCallback((value: string) => {
    setHeaderTab(value);
  }, []);

  const searchBarProps = React.useMemo(
    () => ({
      value: query,
      onValueChange: handleSearchChange,
    }),
    [query, handleSearchChange],
  );

  const selects = React.useMemo(
    () => ({
      native: {
        value: nativeSelectValue,
        onChange: handleNativeSelectChange,
      },
      settings: {
        value: selectValue,
        onChange: handleSettingsSelectChange,
      },
      defaultVariant: {
        value: defaultVariantSelectValue,
        onChange: handleDefaultSelectChange,
      },
      successVariant: {
        value: successVariantSelectValue,
        onChange: handleSuccessSelectChange,
      },
    }),
    [
      nativeSelectValue,
      handleNativeSelectChange,
      selectValue,
      handleSettingsSelectChange,
      defaultVariantSelectValue,
      handleDefaultSelectChange,
      successVariantSelectValue,
      handleSuccessSelectChange,
    ],
  );

  const buttons = React.useMemo<ButtonsPanelData>(
    () => ({
      appTabs: {
        value: appTab,
        onValueChange: handleAppTabChange,
      },
      neoTabs: {
        value: neoTab,
        onValueChange: handleNeoTabChange,
      },
      filterTabs: {
        value: filterTab,
        onValueChange: handleFilterTabChange,
      },
      checkCircle: {
        checked,
        onChange: handleCheckCircleChange,
      },
      toggle: {
        value: toggleSide,
        onChange: handleToggleChange,
      },
      sideSelector: {
        value: side,
        onChange: handleSideChange,
      },
      tactile: {
        primary: {
          active: tactilePrimaryActive,
          onToggle: togglePrimary,
        },
        secondary: {
          active: tactileSecondaryActive,
          onToggle: toggleSecondary,
        },
      },
    }),
    [
      appTab,
      handleAppTabChange,
      neoTab,
      handleNeoTabChange,
      filterTab,
      handleFilterTabChange,
      checked,
      handleCheckCircleChange,
      toggleSide,
      handleToggleChange,
      side,
      handleSideChange,
      tactilePrimaryActive,
      togglePrimary,
      tactileSecondaryActive,
      toggleSecondary,
    ],
  );

  const inputs = React.useMemo<InputsPanelData>(
    () => ({
      searchBar: searchBarProps,
      labelId,
      selects,
    }),
    [searchBarProps, labelId, selects],
  );

  const prompts = React.useMemo<PromptsPanelData>(
    () => ({
      pillarSelector: {
        value: pillars,
        onChange: handlePillarsChange,
      },
    }),
    [pillars, handlePillarsChange],
  );

  const planner = React.useMemo<PlannerPanelData>(
    () => ({
      goalFilter: {
        value: goalFilter,
        onChange: handleGoalFilterChange,
      },
    }),
    [goalFilter, handleGoalFilterChange],
  );

  const misc = React.useMemo<MiscPanelData>(
    () => ({
      headerTabs: {
        value: headerTab,
        onChange: handleHeaderTabChange,
      },
      searchBar: searchBarProps,
    }),
    [headerTab, handleHeaderTabChange, searchBarProps],
  );

  return {
    buttons,
    inputs,
    prompts,
    planner,
    misc,
  };
}
