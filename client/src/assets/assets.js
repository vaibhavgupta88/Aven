import logo from "./logo.png";
import logo_light from "./logo_light.png";
import gradientBackground from "./gradientBackground.png";
import user_group from "./user_group.png";
import star_icon from "./star_icon.svg";
import star_dull_icon from "./star_dull_icon.svg";
import profile_img_1 from "./profile_img_1.png";
import arrow_icon from "./arrow_icon.svg";
import {
  SquarePen,
  Hash,
  Image,
  Eraser,
  Scissors,
  FileText,
} from "lucide-react";
import ai_gen_img_1 from "./ai_gen_img_1.png";
import ai_gen_img_2 from "./ai_gen_img_2.png";
import ai_gen_img_3 from "./ai_gen_img_3.png";

// Company logos
import facebook from "./facebook.svg";
import slack from "./slack.svg";
import framer from "./framer.svg";
import netflix from "./netflix.svg";
import google from "./google.svg";
import linkedin from "./linkedin.svg";
import instagram from "./instagram.svg";

export const assets = {
  logo,
  logo_light,
  gradientBackground,
  user_group,
  star_icon,
  star_dull_icon,
  profile_img_1,
  arrow_icon,
  facebook,
  slack,
  framer,
  netflix,
  google,
  linkedin,
  instagram,
  ai_gen_img_1,
  ai_gen_img_2,
  ai_gen_img_3,
};

export const AiToolsData = [
  {
    title: "AI Article Writer",
    description:
      "Generate high-quality, engaging articles on any topic with our AI writing technology.",
    Icon: SquarePen,
    bg: { from: "#FF4D5E", to: "#E6394A" },
    path: "/ai/write-article",
    isPro: false,
  },
  {
    title: "Blog Title Generator",
    description:
      "Find the perfect, catchy title for your blog posts with our AI-powered generator.",
    Icon: Hash,
    bg: { from: "#FF4D5E", to: "#E6394A" },
    path: "/ai/blog-titles",
    isPro: false,
  },
  {
    title: "AI Image Generation",
    description:
      "Create stunning visuals with our AI image generation tool, Experience the power of AI.",
    Icon: Image,
    bg: { from: "#FF4D5E", to: "#E6394A" },
    path: "/ai/generate-images",
    isPro: false,
  },
  {
    title: "Background Removal",
    description:
      "Effortlessly remove backgrounds from your images with our AI-driven tool.",
    Icon: Eraser,
    bg: { from: "#FF4D5E", to: "#E6394A" },
    path: "/ai/remove-background",
    isPro: true,
  },
  {
    title: "Object Removal",
    description:
      "Remove unwanted objects from your images seamlessly with our AI object removal tool.",
    Icon: Scissors,
    bg: { from: "#FF4D5E", to: "#E6394A" },
    path: "/ai/remove-object",
    isPro: true,
  },
  {
    title: "Resume Reviewer",
    description:
      "Get your resume reviewed by AI to improve your chances of landing your dream job.",
    Icon: FileText,
    bg: { from: "#FF4D5E", to: "#E6394A" },
    path: "/ai/review-resume",
    isPro: true,
  },
];

export const dummyTestimonialData = [
  {
    image: assets.profile_img_1,
    name: "John Doe",
    title: "Marketing Director, TechCorp",
    content:
      "ContentAI has revolutionized our content workflow. The quality of the articles is outstanding, and it saves us hours of work every week.",
    rating: 5,
  },
  {
    image: assets.profile_img_1,
    name: "Jane Smith",
    title: "Content Creator, TechCorp",
    content:
      "ContentAI has made our content creation process effortless. The AI tools have helped us produce high-quality content faster than ever before.",
    rating: 5,
  },
  {
    image: assets.profile_img_1,
    name: "David Lee",
    title: "Content Writer, TechCorp",
    content:
      "ContentAI has transformed our content creation process. The AI tools have helped us produce high-quality content faster than ever before.",
    rating: 5,
  },
];
