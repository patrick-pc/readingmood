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

    const prompt = `What is the best music genre that matches the theme of the book "${book}". Only return the genre name.\n`
    console.log('@@@ prompt:', prompt)

    // base prompt
    const baseCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      temperature: 0.5,
      max_tokens: 256,
    })

    const genre = baseCompletion.data.choices.pop().text.replace(/\n/g, '').toLowerCase()
    console.log('@@@ genre:', genre)

    const chainedPrompt = `Generate a list of 20 ${genre.replace(
      'folk',
      ''
    )} music songs that matches the theme of the book "${book}" based on lyrics, style, and general vibe. Do not include any official soundtrack. Only return the song title and artist.\n`
    console.log('@@@ chainedPrompt:', chainedPrompt)

    // generate a list of songs
    const chainedCompletion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: chainedPrompt,
      temperature: 0.8,
      max_tokens: 256,
    })
    const songs = chainedCompletion.data.choices.pop().text
    console.log('@@@ songs:', songs)

    // format songs to proper array
    const playlist = songs.split('\n').map((song) => song.replace(/[^a-zA-Z ]/g, '').slice(1))
    playlist.shift()
    playlist.pop()
    console.log('@@@ playlist:', playlist)

    // search songs from spotify
    const result = await Promise.all(
      playlist.map(async (song) => {
        if (song) {
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

          if (data?.error) {
            return data
          } else if (
            data?.tracks.items[0].name.toLowerCase().includes('version') ||
            data?.tracks.items[0].name.toLowerCase().includes('karaoke') ||
            data?.tracks.items[0].name.toLowerCase().includes('parody') ||
            data?.tracks.items[0].name.toLowerCase().includes('commentary') ||
            data?.tracks.items[0].name.toLowerCase().includes('instrumental') ||
            data?.tracks.items[0].name.toLowerCase().includes('piano') ||
            data?.tracks.items[0].name.toLowerCase().includes('remix') ||
            data?.tracks.items[0].name.toLowerCase().includes('originally') ||
            data?.tracks.items[0].name.toLowerCase().includes('perform') ||
            data?.tracks.items[0].name.toLowerCase().includes('cappella') ||
            data?.tracks.items[0].name.toLowerCase().includes('8-bit') ||
            data?.tracks.items[0].name.toLowerCase().includes('radio') ||
            data?.tracks.items[0].name.toLowerCase().includes('cover') ||
            data?.tracks.items[0].name.toLowerCase().includes('party mix') ||
            data?.tracks.items[0].name.toLowerCase().includes('made popular') ||
            data?.tracks.items[0].name.toLowerCase().includes('made famous') ||
            data?.tracks.items[0].name.toLowerCase().includes('replayed by') ||
            data?.tracks.items[0].name.toLowerCase().includes('inspired by') ||
            data?.tracks.items[0].name.toLowerCase().includes('the climb') ||
            data?.tracks.items[0].name.toLowerCase().includes('song review')
            // @TODO: remove artist with karaoke name
          ) {
            return null
          } else {
            return data.tracks.items[0]
          }
        }
      })
    )

    const filteredResult = result.filter((track) => {
      return track != null
    })

    if (filteredResult[0].error) {
      res.status(filteredResult[0].error.status).json(filteredResult[0].error.message)
    }
    console.log('@@@ filteredResult', filteredResult)

    res.status(200).json(filteredResult)
  } catch (error) {
    throw error
  }
}
