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
        <button className="flex items-center justify-center gap-2">
          <img className="h-8 cursor-pointer" src="/img/logo.png" />
          <div className="text-xl font-medium">
            <span className="text-[#D18161]">reading</span>
            <span className="text-[#FCE4AD]">mood</span>
          </div>
        </button>
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
