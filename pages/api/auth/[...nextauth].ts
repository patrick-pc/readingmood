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
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: addSeconds(new Date(), 3600 - 10), // time in seconds, spotify default is 1h or 3600s
          refreshToken: account.refresh_token,
          user: user,
        }
      }

      console.log(
        `@@@ currentTime: ${new Date().toISOString()} -- @@@ expiredTime: ${
          token.accessTokenExpires
        }`
      )
      if (new Date().toISOString() < token.accessTokenExpires) {
        return token
      }

      // access token has expired, update the token
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.user = token

      return session
    },
  },
})

async function refreshAccessToken(token) {
  try {
    const url =
      'https://accounts.spotify.com/api/token?' +
      new URLSearchParams({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      })

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    // give a 10 sec buffer
    const accessTokenExpires = addSeconds(new Date(), refreshedTokens.expires_in - 10).toISOString()
    console.log('@@@ accessTokenExpires', new Date(accessTokenExpires).toLocaleTimeString('en-US'))

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: accessTokenExpires,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // fall back to old refresh token
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

const addSeconds = (date, seconds) => {
  date.setSeconds(date.getSeconds() + seconds)
  return date
}
