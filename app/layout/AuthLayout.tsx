import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden h-screen max-h-screen">
        <div className="relative w-full h-full flex flex-col items-center justify-center px-16 bg-cover bg-no-repeat bg-center"
        style={{backgroundImage: `url('/authLayout.webp')` }}>
          <div className="relative z-10 text-white mt-auto mb-[70px]">
            <h1 className="text-[32px] font-[800] leading-[40px] mb-8">
              At Breed, we believe growth<br />
              in God shouldn't be left to<br />
              chance.
            </h1>
            <p className="text-[32px] leading-[40px] font-[800]">
              That's why we've created a<br />
              space where believers can<br />
              be intentional about their<br />
              faith every single day.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[60%] flex items-start justify-center bg-[#F8F9FC] px-6 py-12 pt-32 overflow-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;