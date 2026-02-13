import Link from "next/link"
import Button from "../components/Button"


const WelcomePage = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-[#180426]">
           <div className="rounded-[24px] p-12 bg-[#100319] flex flex-col items-center gap-[40px] w-[540px]">
            <div>
                <img src='logo3.svg' alt='logo' />
                <p className="text-sm text-white">Select an option</p>
            </div>
             <div>
                 <Button customClass="!w-full !h-[58px]  !text-white" onClick={() => console.log('done')} type='button'>
                          Continue with Email
                        </Button>
                         <Button customClass="!w-full !h-[58px] mt-3 !text-white !bg-[#330750]" onClick={() => console.log('done')} type='button'>
                                  Continue with Google
                                </Button>
             </div>
             <p className="text-sm font-medium text-[#89949E]">By using Breed, you agree to our <Link href='/privacy' className="text-[#6A0BA9]">Privacy Policy</Link> and <Link href='/terms' className="text-[#6A0BA9]">Terms of Services</Link></p>
           </div>
        </div>
    )
}

export default WelcomePage