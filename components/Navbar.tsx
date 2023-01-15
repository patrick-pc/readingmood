import { signIn, signOut, useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const Navbar = () => {
  const { status } = useSession()

  const handleLogin = () => {
    signIn('spotify', { callbackUrl: 'https://readingmood.xyz' })
  }

  return (
    <div className="flex w-full items-center justify-between p-6">
      <Link href="/">
        <img className="h-10 cursor-pointer" src="/img/logo.png" />
      </Link>

      {status === 'authenticated' ? (
        <button onClick={() => signOut()}>Sign Out</button>
      ) : (
        <button onClick={handleLogin}>Sign In</button>
      )}
    </div>
  )
}

export default Navbar
