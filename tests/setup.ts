import { afterEach, expect } from 'bun:test'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers as any)

afterEach(() => {
    if (typeof document !== 'undefined') {
        document.body.innerHTML = ''
    }
})
