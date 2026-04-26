import React from 'react'

type LogoSize = 'sm' | 'lg'

const sizeConfig: Record<LogoSize, { frame: string; img: string; text: string; radius: string }> = {
  sm: { frame: 'h-6 w-6', img: 'h-4 w-4', text: 'text-[10px]', radius: 'rounded-md' },
  lg: { frame: 'h-12 w-12', img: 'h-8 w-8', text: 'text-[14px]', radius: 'rounded-xl' },
}

function InitialsLogo({ label, size = 'sm' }: { label: string; size?: LogoSize }) {
  const { frame, text, radius } = sizeConfig[size]
  const words = label.trim().split(/\s+/)
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : label.trim().slice(0, 2).toUpperCase() || 'AI'
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${frame} ${radius} border border-[#e4e0d8] bg-[#f8f6f1]`}
      aria-hidden="true"
    >
      <span className={`font-semibold text-[#6b6860] ${text}`}>{initials}</span>
    </span>
  )
}

function FaviconLogo({ domain, alt, fallbackLabel, size = 'sm' }: { domain: string; alt: string; fallbackLabel: string; size?: LogoSize }) {
  const { frame, img, radius } = sizeConfig[size]
  const words = fallbackLabel.trim().split(/\s+/)
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : fallbackLabel.trim().slice(0, 2).toUpperCase() || 'AI'

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${frame} ${radius} border border-[#e4e0d8] bg-white`}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt={alt}
        className={`${img} object-contain`}
        onError={(event) => {
          const img = event.currentTarget
          if (!img.dataset.fallbackApplied) {
            img.dataset.fallbackApplied = 'true'
            const parent = img.parentElement
            if (parent) {
              img.remove()
              const span = document.createElement('span')
              span.style.fontSize = size === 'lg' ? '14px' : '10px'
              span.style.fontWeight = '600'
              span.style.color = '#6b6860'
              span.textContent = initials
              parent.appendChild(span)
            }
          }
        }}
      />
    </span>
  )
}

export function AIToolLogo({ tool, url, size = 'sm' }: { tool: string; url?: string; size?: LogoSize }) {
  if (url) {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '')
      return <FaviconLogo domain={domain} alt={tool} fallbackLabel={tool} size={size} />
    } catch {
      // fall through to initials
    }
  }
  return <InitialsLogo label={tool} size={size} />
}
