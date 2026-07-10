'use client'

import Link from "next/link"
import Button from "../components/Button"
import { useRouter } from "next/navigation"
import { useGoogleLogin } from "@react-oauth/google"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

const WelcomePage = () => {
  const router = useRouter()
  const { loginWithGoogle } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithGoogle(tokenResponse.access_token)
      } catch (err: unknown) {
        setGoogleError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => {
      setGoogleError('Google sign-in was cancelled or failed. Please try again.')
      setGoogleLoading(false)
    },
    flow: 'implicit',
  })

  return (
    <div className="flex items-center justify-center h-screen bg-[#180426]">
      <div className="rounded-[24px] p-12 bg-[#100319] flex flex-col items-center gap-[40px] w-[90%] lg:w-[540px]">
        <div className="flex justify-center items-center flex-col gap-4">
          <img src='logo3.svg' alt='logo' />
          <p className="text-sm text-white">Select an option below</p>
        </div>

        <div className="w-full">
          <Button customClass="!w-full !h-[52px] !text-white" onClick={() => router.push('/signup')} type='button'>
            Continue with Email
          </Button>

          <Button
            buttonType='custom'
            customClass="!w-full !h-[52px] mt-3 !text-white !bg-[#330750]"
            loading={googleLoading}
            onClick={() => {
              setGoogleError(null)
              setGoogleLoading(true)
              signInWithGoogle()
            }}
            type='button'
          >
            <p className="flex items-center gap-[10px]">
              <img src='/google.svg' className="w-5 h-5" /> Continue with Google
            </p>
          </Button>

          {googleError && (
            <p className="text-red-400 text-xs text-center mt-3">{googleError}</p>
          )}
        </div>

        <p className="text-sm font-medium text-[#89949E]">
          By using Breed, you agree to our{' '}
          <Link href='/privacy' className="text-[#6A0BA9]">Privacy Policy</Link>
          {' '}and{' '}
          <Link href='/terms' className="text-[#6A0BA9]">Terms of Services</Link>
        </p>
      </div>
    </div>
  )
}

export default WelcomePage
