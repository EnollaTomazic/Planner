'use client';

import * as React from 'react';
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Badge,
  SearchBar,
  GlitchSegmentedGroup,
  GlitchSegmentedButton,
  Progress,
  Spinner,
  ThemeToggle,
  AnimationToggle,
  CheckCircle,
  NeonIcon,
  Toggle,
  Card,
  TitleBar,
  TabBar,
  SideSelector,
  PillarBadge,
  PillarSelector,
  AnimatedSelect,
  Select,
} from '@/components/ui';
import type { Pillar, Review } from '@/lib/types';
import type { GameSide } from '@/components/ui/league/SideSelector';
import { Search as SearchIcon, Star } from 'lucide-react';
import ReviewPanel from '@/components/reviews/ReviewPanel';
import ReviewListItem from '@/components/reviews/ReviewListItem';

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

export default function ComponentGallery() {
  const [query, setQuery] = React.useState('');
  const [seg, setSeg] = React.useState('one');
  const [checked, setChecked] = React.useState(false);
  const [toggleSide, setToggleSide] = React.useState<'Left' | 'Right'>('Left');
  const [side, setSide] = React.useState<GameSide>('Blue');
  const [pillars, setPillars] = React.useState<Pillar[]>([]);
  const [selectValue, setSelectValue] = React.useState<string | undefined>();

  const tabs = [
    { key: 'one', label: 'One' },
    { key: 'two', label: 'Two' },
    { key: 'three', label: 'Three' },
  ];

  const selectItems = [
    { value: 'apple', label: 'Apple' },
    { value: 'orange', label: 'Orange' },
    { value: 'pear', label: 'Pear' },
  ];

  const demoReview: Review = {
    id: 'demo',
    title: 'Demo Review',
    notes: 'Quick note',
    tags: [],
    pillars: [],
    createdAt: Date.now(),
    score: 8,
    result: 'Win',
  };

  return (
    <main className="p-6 bg-background text-foreground">
      <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
        Focus styles now use <code>focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]</code>
        for accessible highlights.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        <Item label="Button">
          <Button className="w-56">Click me</Button>
        </Item>
        <Item label="IconButton">
          <IconButton className="w-12 h-12">
            <SearchIcon />
          </IconButton>
        </Item>
        <Item label="Input">
          <Input placeholder="Type here" className="w-56" />
        </Item>
        <Item label="Textarea">
          <Textarea placeholder="Write here" className="w-56" />
        </Item>
        <Item label="Badge">
          <Badge>Badge</Badge>
        </Item>
        <Item label="Badge Pill">
          <Badge variant="pill">Pill</Badge>
        </Item>
        <Item label="Accent Overlay Box">
          <div className="w-56 h-20 flex items-center justify-center rounded bg-[var(--accent-overlay)] text-[var(--text-on-accent)]">
            Overlay
          </div>
        </Item>
        <Item label="SearchBar">
          <SearchBar value={query} onValueChange={setQuery} className="w-56" />
        </Item>
        <Item label="Segmented">
          <GlitchSegmentedGroup value={seg} onChange={setSeg} className="w-56">
            <GlitchSegmentedButton value="one">One</GlitchSegmentedButton>
            <GlitchSegmentedButton value="two">Two</GlitchSegmentedButton>
            <GlitchSegmentedButton value="three">Three</GlitchSegmentedButton>
          </GlitchSegmentedGroup>
        </Item>
        <Item label="Progress">
          <div className="w-56">
            <Progress value={50} />
          </div>
        </Item>
        <Item label="Spinner">
          <div className="w-56 flex justify-center">
            <Spinner />
          </div>
        </Item>
        <Item label="ThemeToggle">
          <div className="w-56 flex justify-center">
            <ThemeToggle />
          </div>
        </Item>
        <Item label="AnimationToggle">
          <div className="w-56 flex justify-center">
            <AnimationToggle />
          </div>
        </Item>
        <Item label="CheckCircle">
          <div className="w-56 flex justify-center">
            <CheckCircle checked={checked} onChange={setChecked} />
          </div>
        </Item>
        <Item label="NeonIcon">
          <div className="w-56 flex justify-center">
            <NeonIcon icon={Star} on={true} />
          </div>
        </Item>
        <Item label="Toggle">
          <Toggle value={toggleSide} onChange={setToggleSide} className="w-56" />
        </Item>
        <Item label="Card">
          <Card className="w-56 h-40 flex items-center justify-center">
            Card content
          </Card>
        </Item>
        <Item label="TitleBar">
          <div className="w-56">
            <TitleBar label="Navigation" />
          </div>
        </Item>
        <Item label="Tabs">
          <TabBar items={tabs} className="w-56" />
        </Item>
        <Item label="SideSelector">
          <SideSelector value={side} onChange={setSide} className="w-56" />
        </Item>
        <Item label="PillarBadge">
          <PillarBadge pillar="Wave" />
        </Item>
        <Item label="PillarSelector">
          <div className="w-56">
            <PillarSelector value={pillars} onChange={setPillars} />
          </div>
        </Item>
        <Item label="AnimatedSelect">
          <AnimatedSelect
            items={selectItems}
            value={selectValue}
            onChange={setSelectValue}
            className="w-56"
            hideLabel
          />
        </Item>
        <Item label="ReviewListItem">
          <div className="w-56">
            <ReviewListItem review={demoReview} />
          </div>
        </Item>
        <Item label="ReviewListItem Loading">
          <div className="w-56">
            <ReviewListItem loading />
          </div>
        </Item>
        <Item label="ReviewPanel">
          <ReviewPanel>Content</ReviewPanel>
        </Item>
        <Item label="Review Layout">
          <div className="grid w-full gap-4 md:grid-cols-12">
            <div className="md:col-span-4 md:w-[240px] bg-secondary h-10 rounded" />
            <div className="md:col-span-8 bg-muted h-10 rounded" />
          </div>
        </Item>
        <Item label="Select">
          <Select aria-label="Fruit" className="w-56">
            <option value="apple">Apple</option>
            <option value="orange">Orange</option>
            <option value="pear">Pear</option>
          </Select>
        </Item>
      </div>
    </main>
  );
}
