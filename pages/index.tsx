import Head from 'next/head'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()

  const handleLogin = () => {
    signIn('spotify', { callbackUrl: 'http://localhost:3000' })
  }

  return (
    <>
      <Head>
        <title>readingmood</title>
        <meta name="description" content="Playlist that fits the vibe of the book." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-screen w-full items-center justify-center">
        {status === 'authenticated' ? (
          <div className="flex flex-col">
            <p>Yo! {session?.user?.name}</p>
            <button onClick={() => signOut()}>Sign Out</button>
          </div>
        ) : (
          <button onClick={handleLogin}>Sign In</button>
        )}
      </main>
    </>
  )
}
