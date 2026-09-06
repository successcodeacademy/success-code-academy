export interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
  description: string;
  image: string;
  slug: string;
}

export interface Testimonial {
  id: number;
  name: string;
  designation: string;
  quote: string;
  avatar: string;
  rating: number;
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
}

export interface Statistic {
  id: number;
  value: number;
  suffix: string;
  label: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "Success Code Academy",
  logo: {
    src: "/images/ui/logo2.png",
    width: 872,
    height: 908,
  },
  tagline: "Empowering Futures Through Quality Education",
  description:
    "Premier educational institution dedicated to academic excellence, holistic development, and shaping tomorrow's leaders.",
  heroTitle: "Shape Your Future with Excellence in Education",
  heroSubtitle:
    "Join thousands of successful students who transformed their careers through our industry-aligned programs and expert faculty.",
  email: "successcodeacademy@gmail.com",
  phone: "+91 86004 70850",
  address1: "2nd Floor, Nanaware- Gadhave Pride, Baramati Bhigwan Road, near Pandharpur Bank, Pushpak Apartment, Baramati, Maharashtra 413102",
  address2: "2nd Floor, Above Manpasand Collection, Near Sudit Hotel, Ring Road, Ambikanagar Baramati",
  social: {
    facebook: "https://www.facebook.com/SUCCESSCODE2020/",
    twitter: "https://twitter.com/successcodeacad", // Not Found
    instagram: "https://www.instagram.com/successcode_academy/",
    linkedin: "https://linkedin.com/school/successcodeacademy", // Not Found
    youtube: "https://www.youtube.com/@successcodeacademybaramati7120",
  },
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Admissions", href: "/admissions" },
  { label: "Results", href: "/results" },
  { label: "Contact", href: "/contact" },
];

export const statistics: Statistic[] = [
  { id: 1, value: 10000, suffix: "+", label: "Future Doctors Mentored" },
  { id: 2, value: 2500, suffix: "+", label: "Govt. Medical College Selections" },
  { id: 3, value: 98, suffix: "%", label: "Success Rate" },
  { id: 4, value: 15, suffix: "+", label: "Years of Trust" },
];

export const courses: Course[] = [
  {
    id: 1,
    title: "NEET Target Batch",
    category: "Droppers",
    duration: "1 Year",
    description: "Intensive program tailored for droppers, focusing purely on NEET cracking strategies and exhaustive problem-solving.",
    image: "/images/course-science.jpg",
    slug: "neet-target-batch",
  },
  {
    id: 2,
    title: "NEET Foundation",
    category: "Class 11",
    duration: "2 Years",
    description: "A comprehensive program starting from Class 11. Builds core concepts in Physics, Chemistry, and Biology from the ground up.",
    image: "/images/course-arts.jpg",
    slug: "neet-foundation",
  },
  {
    id: 3,
    title: "NEET Achiever",
    category: "Class 12",
    duration: "1 Year",
    description: "Designed for Class 12 students to perfectly balance board exams while ensuring top-tier preparation for the NEET exam.",
    image: "/images/course-commerce.jpg",
    slug: "neet-achiever",
  },
  {
    id: 4,
    title: "All India Test Series",
    category: "Test Series",
    duration: "6 Months",
    description: "Rigorous offline mock test series simulating the exact NEET environment, complete with detailed performance analytics.",
    image: "/images/course-cs.jpg",
    slug: "neet-test-series",
  }
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    designation: "NEET Score: 710/720 (AIIMS Delhi)",
    quote:
      "Success Code Academy transformed my preparation. The rigorous mock tests and personal mentoring from expert doctors helped me secure a seat at AIIMS.",
    avatar: "",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul Verma",
    designation: "NEET Score: 695/720 (AFMC Pune)",
    quote:
      "The offline classes are brilliant. The faculty doesn't just teach syllabus, they teach you how to think critically and solve complex physics problems in seconds.",
    avatar: "",
    rating: 5,
  },
  {
    id: 3,
    name: "Ananya Patel",
    designation: "NEET Score: 680/720 (GMC Mumbai)",
    quote:
      "The premium study material provided here is unmatched. It exactly mirrors the NCERT and NEET patterns, making revision incredibly fast and effective.",
    avatar: "",
    rating: 5,
  },
  {
    id: 4,
    name: "Vikram Singh",
    designation: "Parent of Selected Student",
    quote:
      "As a parent, I couldn't be happier. The discipline, care, and academic rigor here ensured my son cracked NEET in his very first attempt.",
    avatar: "",
    rating: 5,
  },
];

export const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "NEET 2026 Batch Admissions Open",
    excerpt:
      "Enrollment for our elite Droppers and Foundation batches has officially begun. Secure your seat before they fill up.",
    date: "2026-06-20",
    category: "Admission",
    slug: "neet-2026-admissions",
  },
  {
    id: 2,
    title: "All India Offline Mock Test Schedule Announced",
    excerpt:
      "Our highly anticipated AITS begins next month across all our offline centers. Register to benchmark your preparation.",
    date: "2026-06-15",
    category: "Event",
    slug: "aits-schedule",
  },
  {
    id: 3,
    title: "Dr. Sharma's Biology Masterclass",
    excerpt:
      "A special 3-day intensive workshop covering high-weightage topics in Human Physiology.",
    date: "2026-06-10",
    category: "Event",
    slug: "biology-masterclass",
  },
  {
    id: 4,
    title: "Top 100 Ranks Captured by Our Students",
    excerpt:
      "We are proud to announce that 24 of our students have secured a rank under AIR 100 in this year's NEET results.",
    date: "2026-06-05",
    category: "Achievement",
    slug: "top-100-ranks",
  }
];

export const overviewFeatures = [
  {
    title: "Academic Excellence",
    description:
      "Rigorous curriculum designed by industry experts ensuring students achieve outstanding academic results.",
  },
  {
    title: "Expert Faculty",
    description:
      "Highly qualified professors with decades of teaching experience and industry exposure.",
  },
  {
    title: "Modern Infrastructure",
    description:
      "State-of-the-art laboratories, digital classrooms, and a vast library resource center.",
  },
  {
    title: "Holistic Development",
    description:
      "Sports, cultural activities, and leadership programs for complete personality development.",
  },
];
