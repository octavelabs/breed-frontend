import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  custom?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, custom = false }) => {
  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden h-screen max-h-screen">
        <div className="relative w-full h-full flex flex-col items-center justify-center px-15 bg-cover bg-no-repeat bg-center"
        style={{backgroundImage: `url('/authLayout.webp')` }}>
          <div className="relative z-10 text-white mt-[70%]  w-full rounded-[12px] p-6 bg-[#F8F9FC1A]">
            <p className="text-[20px] leading-[24px] mb-4">
              At <span className='font-[800]'>breed</span>, we believe growth
              in God shouldn't be left to
              chance.
            </p>
            <p className="text-[20px] leading-[24px] ">
              That's why we've created a
              space where believers can
              be intentional about their
              faith every single day.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[60%] flex items-start  bg-[#F8F9FC] overflow-auto">
        <div className={`w-full ${custom ? "" : "px-[200px] py-12 pt-32"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;