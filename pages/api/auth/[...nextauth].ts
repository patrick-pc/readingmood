import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'

const scope = 'user-read-email playlist-modify-public playlist-modify-private'

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: { params: { scope } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.id = account.id
        token.expires_at = account.expires_at
        token.accessToken = account.access_token
      }

      return token
    },
    async session({ session, token }) {
      session.user = token

      return session
    },
  },
})
