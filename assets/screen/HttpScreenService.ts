import { ScreenService } from './ScreenService'

export const $HttpScreenService: ScreenService = {
  create: async (screen) => {
    await fetch('http://localhost:63246/api/v1/screens', {
      body: JSON.stringify({ data: screen }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  },
  getList: async () => [],
}
