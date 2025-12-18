// Student Dashboard Mock Data

import { Tutor } from "@/types/student";

export const MOCK_TUTORS: Tutor[] = [
  {
    id: "t1",
    name: "Ayesha Rahman",
    subject: "Mathematics",
    area: "Dhanmondi",
    gender: "Female",
    rating: 4.9,
    qualifications: "B.Sc in Mathematics, DU",
    availability: ["Mon 6-8pm", "Wed 6-8pm", "Fri 4-6pm"],
    hourlyRate: 800,
  },
  {
    id: "t2",
    name: "Nayeem Hasan",
    subject: "Physics",
    area: "Uttara",
    gender: "Male",
    rating: 4.7,
    qualifications: "B.Sc in EEE, BUET",
    availability: ["Tue 7-9pm", "Thu 7-9pm"],
    hourlyRate: 1000,
  },
  {
    id: "t3",
    name: "Sadia Karim",
    subject: "English",
    area: "Banani",
    gender: "Female",
    rating: 4.8,
    qualifications: "BA in English, NSU",
    availability: ["Sat 10-12am", "Sun 10-12am"],
    hourlyRate: 700,
  },
  {
    id: "t4",
    name: "Abir Chowdhury",
    subject: "Chemistry",
    area: "Mirpur",
    gender: "Male",
    rating: 4.6,
    qualifications: "B.Sc in Chemistry, RU",
    availability: ["Fri 6-8pm", "Sat 6-8pm"],
    hourlyRate: 900,
  },
];

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "English",
  "Bangla",
  "Physics",
  "Chemistry",
  "Biology",
  "ICT",
  "Accounting",
  "Economics",
  "All Subjects",
];

export const CLASS_LEVELS = [
  "Play Group/KG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10 (SSC)",
  "Class 11 (HSC)",
  "Class 12 (HSC)",
  "University Level",
];
