import { ArcadiaClient } from './ArcadiaClient'

export const $HttpArcadiaClient = (url: string): ArcadiaClient => ({
  createScreen: async (screen) => {
    const response = await fetch(`${url}/v1/screens`, {
      body: JSON.stringify({ data: screen }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.status < 200 || response.status >= 300) {
      throw Error(response.statusText)
    }
  },
  getScreens: async () => {
    const response = await fetch(`${url}/v1/screens`)
    if (response.status < 200 || response.status >= 300) {
      throw Error(response.statusText)
    }

    const json = await response.json()

    return json.data
  },
  getScreen: async (id) => {
    const response = await fetch(`${url}/v1/screens/${id}`)
    if (response.status < 200 || response.status >= 300) {
      throw Error(response.statusText)
    }

    const json = await response.json()

    return json.data
  },
  editScreen: async (screen) => {
    const response = await fetch(`${url}/v1/screens/${screen._.id}`, {
      body: JSON.stringify({ data: screen }),
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.status < 200 || response.status >= 300) {
      throw Error(response.statusText)
    }

    const json = await response.json()

    return json.data
  },
  createFilm: async (film) => {
    const response = await fetch(`${url}/v1/films`, {
      body: JSON.stringify({ data: film }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.status < 200 || response.status >= 300) {
      throw Error(response.statusText)
    }
  },
  getFilms: async () => {
    const response = await fetch(`${url}/v1/films`)
    if (response.status < 200 || response.status >= 300) {
      throw Error(response.statusText)
    }

    const json = await response.json()

    return json.data
  },
  getFilm: async (id) => {
    const response = await fetch(`${url}/v1/films/${id}`)
    if (response.status < 200 || response.status >= 300) {
      throw Error(response.statusText)
    }

    const json = await response.json()

    return json.data
  },
  editFilm: async (film) => {
    const response = await fetch(`${url}/v1/films/${film._.id}`, {
      body: JSON.stringify({ data: film }),
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.status < 200 || response.status >= 300) {
      throw Error(response.statusText)
    }

    const json = await response.json()

    return json.data
  },
})
