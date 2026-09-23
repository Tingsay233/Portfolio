/* Everything a visitor reads lives here. Sprite numbers refer to
   public/sprites/sprite_NNN.png. */

export const PROFILE = {
  name: 'Say Si Ting',
  role: 'Computer Science graduate',
  school: 'Multimedia University (MMU) Cyberjaya',
  specialization: 'Software Engineering',
  location: 'Kuala Lumpur, Malaysia',
  headline: 'Full-stack developer with a product mindset.',
  bio: 'I build full-stack web applications with React, Django, Python and SQL, and I like projects where clean implementation, readable UI and real workflow needs all matter.',
  lookingFor: 'Graduate roles in QA / software testing, software engineering, or product-focused technical teams. Open to remote or hybrid.',
  email: 'sitingsay@gmail.com',
  github: 'https://github.com/Tingsay233',
  linkedin: 'https://www.linkedin.com/in/say-si-ting-62051a339/',
  resume: '/resume.pdf',
};

/* Shown in the hero and the sidebar — the first things a reviewer should see. */
export const HIGHLIGHTS = [
  { icon: 49, title: 'Junior Programmer', detail: 'DSwim Academy · Sep 2026 – Present' },
  { icon: 52, title: 'Best Presenter', detail: 'CITIC 2026 · ML-backed customer retention system' },
  { icon: 34, title: 'B.Sc. (Hons.) Computer Science', detail: 'MMU graduate · Software Engineering · CGPA 3.39' },
];

export const ABOUT = [
  'I am a Computer Science graduate from Multimedia University Cyberjaya, specializing in Software Engineering. My work is mostly around full-stack web development, business systems, and practical machine learning features.',
  'My final-year project is an e-commerce customer retention system that uses RFM segmentation and gradient-boosted models to help small businesses identify at-risk customers before they churn. It was presented at CITIC 2026 and received a Best Presenter Award.',
  'I have also customized Shopify storefronts during my internship at Boolland Digital, and built a client billing system, an internal recruitment system with a MyKad scanner, and community mapping software.',
  'I am bilingual in English and Mandarin, with working Bahasa Melayu, and I am looking for QA and software engineering roles where I can keep improving while contributing to useful software.',
];

export const LANGUAGES = [
  { name: 'English', level: 'Fluent' },
  { name: 'Mandarin', level: 'Fluent' },
  { name: 'Bahasa Melayu', level: 'Working' },
];

export const SKILLS = [
  { icon: 36, name: 'Python / Django', tier: 'Main', note: 'Multiple full-stack systems and REST APIs' },
  { icon: 48, name: 'React / JavaScript', tier: 'Main', note: 'Dashboards, forms, client UIs, this portfolio' },
  { icon: 47, name: 'SQL / Databases', tier: 'Main', note: 'PostgreSQL, SQLite and MySQL project data' },
  { icon: 59, name: 'Testing & QA', tier: 'Main', note: 'Manual testing, test case design, Selenium (V&V coursework)' },
  { icon: 40, name: 'Java', tier: 'Projects', note: 'Object-oriented game engine with MVC' },
  { icon: 13, name: 'ML / Analytics', tier: 'Projects', note: 'RFM, LightGBM, XGBoost and scikit-learn in FYP' },
  { icon: 25, name: 'C++', tier: 'Coursework', note: 'Coursework and algorithm practice' },
];

export const TOOLS = ['Git', 'Docker', 'PostgreSQL', 'MySQL', 'Postman', 'Selenium', 'Flask', 'Figma', 'VS Code', 'Shopify Liquid', 'SCSS'];

export const PROJECTS = [
  {
    icon: 52,
    title: 'E-Commerce Customer Retention System',
    meta: 'Final-year project · Nov 2025 – Jul 2026',
    badge: 'Best Presenter · CITIC 2026',
    blurb:
      'Full-stack analytics platform that helps small e-commerce teams identify at-risk customers using RFM segmentation and gradient-boosted churn prediction.',
    impact: 'Research presented at CITIC 2026 and awarded Best Presenter.',
    stack: ['Django', 'React', 'PostgreSQL', 'LightGBM', 'XGBoost'],
    links: [],
    featured: true,
  },
  {
    icon: 51,
    title: 'PSS Billing System',
    meta: 'Client project · Jan 2026 – Aug 2026',
    blurb:
      'Production billing system for a family-run business: quotations, invoicing, customer management and payment tracking, with one-click quote-to-invoice conversion, server-side PDFs sent via WhatsApp, and Google Drive archiving.',
    impact: 'Requirements gathered directly from the business owner; role-based access for 3 roles and a bilingual EN/中文 UI.',
    stack: ['React', 'Django REST Framework', 'PostgreSQL (Supabase)', 'Vercel'],
    links: [{ label: 'GitHub', url: 'https://github.com/Tingsay233/PSS-Billing-System' }],
  },
  {
    icon: 49,
    title: 'Internal Recruitment Management System',
    meta: 'D Swim Academy · Apr 2026 – Present',
    blurb:
      'Internal HR platform covering the full hiring lifecycle: tablet-based candidate intake, PIC review dashboard, offer letter and contract generation, e-signature, and onboarding.',
    impact: 'Automatic MyKad scanner (OpenCV edge detection + neural OCR) that auto-fills candidate details; remote contract signing with audit logging.',
    stack: ['React', 'Vite', 'Django REST Framework', 'PostgreSQL', 'OpenCV', 'RapidOCR'],
    links: [],
  },
  {
    icon: 46,
    title: 'CommuMap',
    meta: 'Community resource mapping · 2026',
    blurb:
      'Django platform mapping clinics, shelters, libraries and food banks, with moderation and live capacity indicators.',
    impact: 'Focused on practical access to nearby support services.',
    stack: ['Django', 'Python', 'SQLite', 'Docker'],
    links: [{ label: 'GitHub', url: 'https://github.com/Tingsay233/Community-Map' }],
  },
  {
    icon: 37,
    title: 'Kwazam Chess',
    meta: 'Java game engine · 2024–2025',
    blurb:
      'Custom chess variant with MVC structure, unique movement rules, board flipping, piece transformation, and save/load.',
    impact: 'Object-oriented design, game state management and rule implementation.',
    stack: ['Java', 'MVC'],
    links: [{ label: 'GitHub', url: 'https://github.com/Tingsay233/Kwazam-Chess' }],
  },
];

export const EXPERIENCE = [
  {
    icon: 49,
    title: 'Junior Programmer',
    org: 'DSwim Academy',
    when: 'Sep 2026 – Present',
    desc: 'Building and maintaining the internal recruitment and onboarding system used by HR staff.',
  },
  {
    icon: 52,
    title: 'Best Presenter Award',
    org: 'CITIC 2026 · 6th International Conference on Computer, IT & Intelligent Computing',
    when: 'May 2026',
    desc: 'Awarded for the paper "E-Commerce Customer Retention Management System Using RFM Features and Gradient-Boosted Churn Prediction".',
  },
  {
    icon: 36,
    title: 'Frontend Developer Intern',
    org: 'Boolland Digital',
    when: 'Jul 2025 – Oct 2025',
    desc: 'Customized Shopify storefronts for multiple client brands using Liquid, JavaScript and SCSS in a 3–5 developer team. Built custom sections, blocks and theme schema settings on the Dawn theme so clients could manage content themselves, and fixed cross-browser and mobile issues on live production stores.',
  },
  {
    icon: 34,
    title: 'B.Sc. (Hons.) Computer Science',
    org: 'Multimedia University Cyberjaya · Software Engineering',
    when: 'Jul 2022 – Jul 2026',
    desc: 'CGPA 3.39 / 4.00. Coursework includes Verification & Validation, Software Evolution & Maintenance, OOP, Data Structures & Algorithms, Database Systems, Web Development and Machine Learning.',
  },
];

export const NAV = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'demos', label: 'Demos' },
  { id: 'contact', label: 'Contact' },
];
