export const faqs = [
    {
      question: 'What is Breed?',
      answer: 'Breed is a spiritual companion platform designed to help believers grow consistently in their faith through devotionals, prayer groups, discipleship tools, and Christian courses, all accessible via both a mobile app and a web version.'
    },
    {
      question: 'Who can use Breed?',
      answer: 'Breed is for every believer—whether you’re just starting your faith journey, a discipler mentoring others, a preacher leading a congregation, or someone looking to deepen your relationship with God.'
    },
    {
      question: 'How do the devotionals and prayer groups work?',
      answer: 'You can access daily Spirit-filled devotionals and join live or scheduled prayer groups on both the mobile app and web version. The platform also sends gentle reminders to help you maintain a consistent prayer and devotional routine.'
    },
    {
      question: 'Can I track my spiritual growth on Breed?',
      answer: 'Yes! Breed offers tools to monitor your progress in prayer, Bible study, participation, and task completion—all aimed at helping you stay purposeful and motivated, whether you use the app or web version.'
    },
    {
      question: 'What kind of courses are available?',
      answer: 'Breed offers a range of short, Spirit-led courses on biblical teachings, doctrine, apologetics, and more—created by trusted pastors and theologians to help you learn and apply God’s Word.'
    },
    {
      question: 'Is Breed suitable for church leaders and preachers?',
      answer: 'Absolutely. Leaders can onboard disciples, schedule meetings, track attendance, and nurture deeper community engagement—all from one dashboard accessible on both mobile and web.'
    },
    {
      question: 'How do I get started?',
      answer: 'You can either download the Breed app on your mobile device or sign up through our web platform. Create your profile, connect with others, and begin your journey of growth, connection, and purpose today!'
    }
  ];

  export  const contactInfo = [
    {
      title: 'For support',
      email: 'support@joinbreed.com',

    },
    {
      title: 'To partner with us',
      email: 'partners@joinbreed.com',
     
    },
    {
      title: 'To volunteer',
      email: 'volunteers@joinbreed.com',

    },
    {
      title: 'To create courses, devotionals or prayer bulletins on Breed',
      email: 'creators@joinbreed.com',

    }
  ];


export const capitalizeFirstLetter = (word:string) => {
    if (word) {
      return word?.replace(/\b([a-zÁ-ú]{3,})/g, (w) => w?.charAt(0)?.toUpperCase() + w?.slice(1));
    }
  
    return null;
  };

  export const cleanupObject = (object: object) => {
    return Object.entries(object).reduce((acc, [key, value]) => {
      if (value) return { ...acc, [key]: value };
      return { ...acc };
    }, {});
  };

  export const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      case 'accepted':
      return 'bg-[#B4F6D5] border border-[#65E9A8] text-[#156342]';
    case 'due':
      case 'rejected':
      return 'bg-[#FED3D3] text-[#B52222] border border-[#FBAFAF]';
    case 'pending':
      return 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]';
    default:
      return 'bg-transparent texxt-[#3C3E40]';
  }
};