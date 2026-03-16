const ModalIcon = ({ color, stroke, iconColor }: { color: string, stroke: string, iconColor: string }) => {
    return (
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="40" height="40" rx="20" fill={color} />
            <rect x="3" y="3" width="40" height="40" rx="20" stroke={stroke} strokeWidth="6" />
            <path d="M31.3346 22.2335V23.0002C31.3336 24.7972 30.7517 26.5458 29.6757 27.9851C28.5998 29.4244 27.0874 30.4773 25.3641 30.9868C23.6408 31.4963 21.799 31.4351 20.1134 30.8124C18.4277 30.1896 16.9885 29.0386 16.0104 27.5311C15.0324 26.0236 14.5678 24.2403 14.686 22.4471C14.8043 20.654 15.499 18.9472 16.6665 17.5811C17.8341 16.2151 19.412 15.263 21.1648 14.867C22.9176 14.471 24.7515 14.6522 26.393 15.3835M31.3346 16.3335L23.0013 24.6752L20.5013 22.1752" stroke={iconColor} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export default ModalIcon



