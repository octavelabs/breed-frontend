const BookOpenIcon = ({stroke}:{stroke: string}) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.6654 11.1614V3.11476C14.6654 2.31476 14.012 1.72143 13.2187 1.78809H13.1787C11.7787 1.90809 9.65203 2.62143 8.46536 3.36809L8.35203 3.44143C8.1587 3.56143 7.8387 3.56143 7.64536 3.44143L7.4787 3.34143C6.29203 2.60143 4.17203 1.89476 2.77203 1.78143C1.9787 1.71476 1.33203 2.31476 1.33203 3.10809V11.1614C1.33203 11.8014 1.85203 12.4014 2.49203 12.4814L2.68536 12.5081C4.13203 12.7014 6.36536 13.4348 7.64536 14.1348L7.67203 14.1481C7.85203 14.2481 8.1387 14.2481 8.31203 14.1481C9.59203 13.4414 11.832 12.7014 13.2854 12.5081L13.5054 12.4814C14.1454 12.4014 14.6654 11.8014 14.6654 11.1614Z"
        stroke={stroke}
        strokeWidth="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8 3.65918V13.6592"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.16797 5.65918H3.66797"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.66797 7.65918H3.66797"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BookOpenIcon;
