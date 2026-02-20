const MoreIcon = ({ color, size = 26, fill = 'none' }: {color: string, size?: number, fill?: string}) => {
  return (
<svg width={size} height={size} viewBox="0 0 27 27" fill={fill} xmlns="http://www.w3.org/2000/svg">
<path d="M3.32422 7.75586H23.2674" stroke={color} strokeLinecap="round"/>
<path d="M3.32422 13.2949H23.2674" stroke={color} strokeLinecap="round"/>
<path d="M3.32422 18.835H23.2674" stroke={color} strokeLinecap="round"/>
</svg>

  )
}

export default MoreIcon