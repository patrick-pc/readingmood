import { Configuration, OpenAIApi } from 'openai'
import { getSession } from 'next-auth/react'
import type { NextApiRequest, NextApiResponse } from 'next'

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = (await getSession({ req })) as any
    const { book } = req.body

    let prompt = `Generate a list of 10 popular songs that fits the theme of "${book}" based on their lyrics, style, and general vibe. Do not include any official sound track.\n`
    console.log('@@@ prompt:', prompt)

    // generate a list of songs
    const baseCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      temperature: 0.8,
      max_tokens: 256,
    })
    const songs = baseCompletion.data.choices.pop().text
    console.log('@@@ songs:', songs)

    // format songs to proper array
    const playlist = songs.split('\n').map((song) => song.replace(/[^a-zA-Z ]/g, '').slice(1))
    playlist.shift()
    console.log('@@@ playlist:', playlist)

    // search songs from spotify
    const result = await Promise.all(
      playlist.map(async (song) => {
        const response = await fetch(
          `https://api.spotify.com/v1/search?type=track&limit=1&market=US&q=${encodeURIComponent(
            song
          )}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        )
        const data = await response.json()

        return data.tracks.items[0]
      })
    )
    console.log('@@@ result', result)

    res.status(200).json(result)
  } catch (error) {
    throw error
  }
}
