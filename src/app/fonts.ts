import localFont from 'next/font/local'

const geistSans = localFont({
  variable: '--font-geist-sans',
  display: 'swap',
  preload: true,
  src: [
    {
      path: '../../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../node_modules/geist/dist/fonts/geist-sans/Geist-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
})

const geistMonoCore = localFont({
  variable: '--font-geist-mono',
  display: 'swap',
  preload: true,
  src: [
    {
      path: '../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
})

const geistMonoExtras = localFont({
  display: 'swap',
  preload: false,
  declarations: [
    {
      prop: 'font-family',
      value: geistMonoCore.style.fontFamily,
    },
  ],
  src: [
    {
      path: '../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../node_modules/geist/dist/fonts/geist-mono/GeistMono-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
})

export const geistSansClassName = geistSans.className
export const geistSansVariable = geistSans.variable
export const geistMonoVariable = `${geistMonoCore.variable} ${geistMonoExtras.className}`
export const geistMonoExtrasClassName = geistMonoExtras.className
