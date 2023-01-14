import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const { data: session, status } = useSession()
  const [book, setBook] = useState('')
  const [playlist, setPlaylist] = useState(null)

  const handleLogin = () => {
    signIn('spotify', { callbackUrl: 'http://localhost:3000' })
  }

  const generatePlaylist = async () => {
    if (!book) return

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
  }

  const createPlaylist = async () => {
    if (!book && playlist.length === 0) return

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
  }

  return (
    <>
      <Head>
        <title>readingmood</title>
        <meta name="description" content="Playlist that fits the vibe of the book." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-screen w-full flex-col items-center justify-center">
        {status === 'authenticated' ? (
          <div className="flex flex-col">
            <p>Yo! {session?.user?.name}</p>
            <button onClick={() => signOut()}>Sign Out</button>
          </div>
        ) : (
          <button onClick={handleLogin}>Sign In</button>
        )}
        <div className="flex flex-col gap-2">
          <input className="border" value={book} onChange={(e) => setBook(e.target.value)} />
          <button onClick={generatePlaylist}>Generate Playlist</button>
        </div>

        <div className="flex max-h-[500px] max-w-[600px] flex-col gap-2 overflow-y-auto">
          {playlist?.map((song, i) => {
            return (
              song && (
                <div className="flex items-center justify-start gap-4 border-b py-4" key={i}>
                  <img className="h-24 w-24" src={song.album.images[0].url} />
                  <div>
                    <p>{song.name}</p>
                    <div className="flex gap-1">
                      {song.artists?.map((artist, j) => {
                        return <p>{`${artist.name}${j < song.artists.length - 1 ? ',' : ''}`}</p>
                      })}
                    </div>
                  </div>
                </div>
              )
            )
          })}
        </div>

        <button onClick={createPlaylist}>Create Playlist</button>
      </main>
    </>
  )
}
