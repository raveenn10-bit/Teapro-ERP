import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const preview = readFileSync(resolve('preview-site/dist/index.html'), 'utf8')

describe('customer preview disclosure', () => {
  it('labels the website as a preview and does not present it as the desktop product', () => {
    expect(preview).toContain('Customer Preview')
    expect(preview).toContain('Windows desktop application')
  })

  it('includes the supplied product identity', () => {
    expect(preview).toContain('TeaPro ERP')
    expect(preview).toContain('Smart Tea. Smart Business.')
    expect(preview).toContain('Harsh Apex Digital Solutions')
  })
})
