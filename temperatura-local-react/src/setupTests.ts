import '@testing-library/jest-dom'
import i18n from './i18n'

// Force pt-BR language in tests so assertions match Portuguese text
i18n.changeLanguage('pt-BR')

// Mock ResizeObserver for components that use recharts
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
