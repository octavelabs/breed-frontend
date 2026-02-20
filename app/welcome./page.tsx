'use client'

import Link from "next/link"
import Button from "../components/Button"
import { useRouter } from "next/navigation"


const WelcomePage = () => {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center h-screen bg-[#180426]">
           <div className="rounded-[24px] p-12 bg-[#100319] flex flex-col items-center gap-[40px] w-[540px]">
            <div className="flex justify-center items-center flex-col gap-4">
                <img src='logo3.svg' alt='logo' />
                <p className="text-sm text-white ">Select an option below</p>
            </div>
             <div className="w-full">
                 <Button customClass="!w-full !h-[52px] !text-white" onClick={() => router.push('/signup')} type='button'>
                          Continue with Email
                        </Button>
                         <Button buttonType='custom' customClass="!w-full !h-[52px] mt-3 !text-white !bg-[#330750]" onClick={() => console.log('done')} type='button'>
                                  <p className="flex items-center gap-[10px]">
            <img src='/google.svg' className="w-5 h-5" /> Continue with Google
          </p>
                                </Button>
             </div>
             <p className="text-sm font-medium text-[#89949E]">By using Breed, you agree to our <Link href='/privacy' className="text-[#6A0BA9]">Privacy Policy</Link> and <Link href='/terms' className="text-[#6A0BA9]">Terms of Services</Link></p>
           </div>
        </div>
    )
}

export default WelcomePage