import { useState, useRef, useEffect } from 'react'

/**
 * Reusable HoverPopover Component (inspired by Dribbble preview dialog)
 *
 * @param {React.ReactNode} children - The trigger element (e.g., avatar, button, badge)
 * @param {React.ReactNode} content - Custom popover content
 * @param {string} title - Title if using standard layout
 * @param {string} subtitle - Subtitle or tag
 * @param {string} badge - Optional pill badge (e.g., "PRO", "AMR CHAMPION")
 * @param {Array<{title: string, value: string|number}>} stats - Quick metrics/stats
 * @param {string} actionLabel - Button CTA label (e.g. "View Details", "Follow")
 * @param {() => void} onAction - Action click handler
 * @param {'top'|'bottom'|'left'|'right'} placement - Direction to display popover
 */
export default function HoverPopover({
  children,
  content,
  title,
  subtitle,
  badge,
  stats = [],
  actionLabel,
  onAction,
  placement = 'bottom'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const timerRef = useRef(null)

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 180)
  }

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div
      className="popover-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="popover-trigger">{children}</div>

      {isOpen && (
        <div className={`popover-dialog placement-${placement}`} role="tooltip">
          {content ? (
            content
          ) : (
            <div className="popover-card">
              <div className="popover-card-header">
                <div>
                  <div className="popover-title-row">
                    <span className="popover-title">{title}</span>
                    {badge && <span className="popover-badge">{badge}</span>}
                  </div>
                  {subtitle && <p className="popover-sub">{subtitle}</p>}
                </div>

                {actionLabel && (
                  <button
                    type="button"
                    className="popover-cta"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAction && onAction()
                    }}
                  >
                    {actionLabel}
                  </button>
                )}
              </div>

              {stats.length > 0 && (
                <div className="popover-stats">
                  {stats.map((s, idx) => (
                    <div key={idx} className="popover-stat-item">
                      <span className="popover-stat-val">{s.value}</span>
                      <span className="popover-stat-lbl">{s.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
