import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { useRef, useState } from 'react'
import { Waveform } from '@uiball/loaders'
import AudioPlayer from '@/components/AudioPlayer'
import Head from 'next/head'
import Navbar from '@/components/Navbar'

export default function Home() {
  const { data: session, status } = useSession()
  const [book, setBook] = useState('')
  const [playlist, setPlaylist] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const playlistRef = useRef(null)

  const generatePlaylist = async () => {
    if (!book) return

    if (status !== 'authenticated') {
      toast.error('Sign in to continue.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book,
        }),
      })

      const data = await response.json()
      console.log('@@@ data', data)
      setPlaylist(data)

      // smooth scroll to section
      setTimeout(() => {
        playlistRef?.current?.scrollIntoView({ behavior: 'smooth' })
      }, 500)
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const createPlaylist = async () => {
    if (!book && playlist.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/spotify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book,
          songs: playlist,
        }),
      })

      const data = await response.json()
      console.log('@@@ data', data)
      if (data?.snapshot_id) toast.success('Playlist created!')
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>readingmood</title>
        <meta
          name="description"
          content="Create a spotify playlist that matches the vibe of your favorite book."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/img/logo.png" />
      </Head>

      <Navbar />

      <main className="container mx-auto pt-12 pb-24">
        <div className="flex flex-col gap-8 px-6">
          <section className="relative min-h-[600px]">
            <img
              className="absolute bottom-0 left-[24px] h-80 select-none"
              src="/img/character.png"
            />

            <div className="flex flex-col items-center justify-center gap-12">
              <div className="flex flex-col items-center justify-center gap-6 text-center">
                <h1 className="text-4xl font-bold md:text-5xl">
                  Tune in to the vibe of your favorite books
                </h1>
                <h2 className="text-lg text-orange-200 md:text-xl">
                  Create a spotify playlist that matches the vibe of your favorite book
                </h2>
              </div>
              <div className="flex w-full flex-col items-center justify-center gap-4">
                {session?.user?.name && (
                  <div className="flex w-full max-w-lg items-start justify-start text-xl">
                    Yo, {session?.user?.name}!
                  </div>
                )}
                <input
                  className="w-full max-w-lg rounded-lg border-2 border-zinc-800 bg-transparent py-3 px-5 text-sm placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                  placeholder="Type your favorite book here..."
                  value={book}
                  onChange={(e) => setBook(e.target.value)}
                />
                <button
                  className="flex w-52 items-center justify-center rounded-full bg-orange-400 px-5 py-3 text-center transition hover:bg-orange-500 disabled:bg-zinc-700 disabled:opacity-50"
                  onClick={generatePlaylist}
                  disabled={!book || isLoading}
                >
                  {isLoading ? <Waveform size={20} speed={1} color="white" /> : 'Generate Playlist'}
                </button>
              </div>
            </div>
          </section>

          <section className="flex justify-end gap-4">
            {playlist?.length > 0 && (
              <>
                <button
                  className="flex w-52 items-center justify-center rounded-full bg-orange-400 px-5 py-3 text-center transition hover:bg-orange-500 disabled:bg-zinc-700 disabled:opacity-50"
                  onClick={createPlaylist}
                  disabled={isLoading}
                >
                  {isLoading ? <Waveform size={20} speed={1} color="white" /> : 'Create Playlist'}
                </button>
                <button
                  className="disabled:cursor-not-allowed disabled:text-zinc-700"
                  onClick={generatePlaylist}
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </>
            )}
          </section>

          <section className="relative flex flex-col gap-8 md:flex-row">
            <div className="pointer-events-none absolute bottom-0 left-[calc(50%_-_500px)] h-[300px] w-[1000px] bg-yellow-600 opacity-20 blur-[150px]"></div>
            {playlist?.length > 0 && (
              <div className="flex w-full flex-col items-center justify-center gap-8 rounded-xl bg-zinc-900/50 p-6 md:w-[600px]">
                <img className="h-52 w-52 rounded-xl" src={playlist[0].album.images[0].url} />

                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <p className="text-lg font-medium">{playlist[0].name}</p>
                  <div className="flex gap-1 font-extralight text-orange-200">
                    {playlist[0].artists?.map((artist, j) => {
                      return (
                        <p>{`${artist.name}${j < playlist[0].artists.length - 1 ? ',' : ''}`}</p>
                      )
                    })}
                  </div>
                </div>
                <AudioPlayer src={playlist[0].preview_url} />
              </div>
            )}

            <div className="flex max-h-[500px] w-full flex-col gap-2 overflow-y-auto overflow-x-hidden">
              {playlist?.map((song, i) => {
                return (
                  song &&
                  i > 0 && (
                    <div
                      className="flex flex-col items-center justify-between gap-8 border-b border-zinc-800 py-4 pr-4 lg:flex-row"
                      key={i}
                    >
                      <img className="h-24 w-24 rounded-xl" src={song.album.images[0].url} />

                      <div className="flex w-full flex-col items-center justify-between gap-8 lg:flex-row">
                        <div className="flex flex-col items-center justify-center gap-2 text-center lg:items-start lg:justify-start lg:text-left">
                          <p className="font-medium">{song.name}</p>
                          <div className="flex gap-1 text-sm font-extralight text-orange-200">
                            {song.artists?.map((artist, j) => {
                              return (
                                <p>{`${artist.name}${j < song.artists.length - 1 ? ',' : ''}`}</p>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <AudioPlayer src={song.preview_url} />
                          <button
                            className="flex items-center justify-center rounded-full border border-red-500/75 bg-red-800/10 p-3 text-red-500/75"
                            onClick={() =>
                              setPlaylist([...playlist.slice(0, i), ...playlist.slice(i + 1)])
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-7 w-7"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )
              })}
            </div>
          </section>

          <section ref={playlistRef}></section>
        </div>
      </main>
    </>
  )
}
