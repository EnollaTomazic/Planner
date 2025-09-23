import { Geist, Geist_Mono } from "geist/font";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const geistSansClassName = geistSans.className;
export const geistSansVariable = geistSans.variable;
export const geistMonoClassName = geistMono.className;
export const geistMonoVariable = geistMono.variable;
