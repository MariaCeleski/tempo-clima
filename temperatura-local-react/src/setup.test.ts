import { describe, it, expect } from 'vitest'

describe('Project Setup', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should have access to jsdom environment', () => {
    expect(document).toBeDefined()
    expect(window).toBeDefined()
  })
})
