

const LearnIcon = ({ color, size = 26, fill='none' }: {color: string, size?: number, fill?: string}) => {
  return (
   <svg width={size} height={size} viewBox="0 0 27 27" fill={fill} xmlns="http://www.w3.org/2000/svg">
<path d="M24.3739 18.5475V5.17452C24.3739 3.84497 23.2881 2.85889 21.9697 2.96969H21.9032C19.5765 3.16912 16.0421 4.35463 14.07 5.59554L13.8816 5.71741C13.5603 5.91684 13.0285 5.91684 12.7072 5.71741L12.4302 5.55122C10.458 4.32139 6.93473 3.14696 4.60803 2.95861C3.28956 2.84781 2.21484 3.84497 2.21484 5.16344V18.5475C2.21484 19.6112 3.07905 20.6083 4.14268 20.7413L4.46399 20.7856C6.86825 21.1069 10.5799 22.3257 12.7072 23.489L12.7515 23.5112C13.0506 23.6774 13.5271 23.6774 13.8151 23.5112C15.9424 22.3367 19.6651 21.1069 22.0805 20.7856L22.4461 20.7413C23.5097 20.6083 24.3739 19.6112 24.3739 18.5475Z" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
<path d="M13.2949 6.08203V22.7013" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
<path d="M8.58665 9.40625H6.09375" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
<path d="M9.41761 12.7305H6.09375" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
</svg>
  )
}

export default LearnIcon
