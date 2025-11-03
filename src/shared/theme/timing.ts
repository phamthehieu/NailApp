export const timing = {
  /**
   * The duration (ms) for very quick animations (e.g., micro-interactions).
   */
  instant: 150,
  /**
   * The duration (ms) for quick animations (e.g., button press, small transitions).
   */
  quick: 300,
  /**
   * The duration (ms) for medium animations (e.g., modal transitions, page changes).
   */
  medium: 500,
  /**
   * The duration (ms) for slow animations (e.g., complex transitions, large movements).
   */
  slow: 800,
  /**
   * The duration (ms) for very slow animations (e.g., background changes, fade effects).
   */
  verySlow: 1200,
} as const
