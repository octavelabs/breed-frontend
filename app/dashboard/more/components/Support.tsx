'use client'

import Button from "@/app/components/Button"
import { useState } from "react"


const Support = () => {
    const [value, setValue] = useState('')
    return (
        <div className="w-[40%] flex flex-col gap-8">
         <h2 className="text-[24px] font-bold">Support</h2>
         <p className="text-base">
Hey Dave, we would like to get your feedback, ideas and feelings about Breed. This will help us improve the product and make it better for everyone. Let us know what you think
         </p>
         <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Tell us how we can improve"
            rows={4}
            className="w-full px-4 py-3 border border-[#60666B] rounded-lg text-base resize-none"
          />
          <Button
                              onClick={() => console.log('done')}
                              customClass="w-full h-[58px] text-white"
                              disabled={true}
                              loading={false}
                            >
                              Submit
                            </Button>
         </div>
    )
}

export default Support