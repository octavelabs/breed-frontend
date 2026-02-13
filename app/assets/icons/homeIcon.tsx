

const HomeIcon = ({ color, size = 26 }: {color: string, size?: number}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg" >
<path d="M9.99464 3.14674L4.02276 7.80015C3.0256 8.57571 2.2168 10.2266 2.2168 11.4786V19.6885C2.2168 22.259 4.31083 24.3641 6.88129 24.3641H19.7114C22.2819 24.3641 24.3759 22.259 24.3759 19.6996V11.6337C24.3759 10.293 23.4784 8.57572 22.3816 7.81123L15.5344 3.01378C13.9833 1.92799 11.4904 1.98339 9.99464 3.14674Z" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
<path d="M13.2949 19.9323V16.6084" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
</svg>
  )
}

export default HomeIcon
