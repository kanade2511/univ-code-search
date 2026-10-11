import { afterEach, expect } from 'bun:test'
import * as matchers from '@testing-library/jest-dom/matchers'
import { GlobalWindow } from 'happy-dom'

const happyWindow = new GlobalWindow()
const g = globalThis as unknown as {
    window: unknown
    document: unknown
    HTMLElement: unknown
    HTMLInputElement: unknown
    navigator: unknown
    localStorage: unknown
}
g.window = happyWindow
g.document = happyWindow.document
g.HTMLElement = happyWindow.HTMLElement
g.HTMLInputElement = happyWindow.HTMLInputElement
g.navigator = happyWindow.navigator
g.localStorage = happyWindow.localStorage

expect.extend(matchers as any)

afterEach(() => {
    if (typeof document !== 'undefined') {
        document.body.innerHTML = ''
    }
})
