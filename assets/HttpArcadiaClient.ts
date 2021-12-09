import { ArcadiaClient } from './ArcadiaClient'

export const $HttpArcadiaClient = (url: string): ArcadiaClient => ({
  createScreen: async (screen) => {
    await fetch(`${url}/v1/screens`, {
      body: JSON.stringify({ data: screen }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  },
  getScreens: async () => {
    const response = await fetch(`${url}/v1/screens`)
    const json = await response.json()

    return json.data
  },
  createFilm: async (film) => {
    await fetch(`${url}/v1/films`, {
      body: JSON.stringify({ data: film }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  },
  getFilms: async () => {
    const response = await fetch(`${url}/v1/films`)
    const json = await response.json()

    return json.data
  },
})
