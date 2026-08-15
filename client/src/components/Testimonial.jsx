import { Star } from "lucide-react";

const Testimonial = () => {
  const dummyTestimonialData = [
    {
      image:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
      name: "John Doe",
      title: "Marketing Director, TechCorp",
      content:
        "Aven has completely transformed our content workflow. The quality of AI articles and image erasers saves us hours every week.",
      rating: 5,
    },
    {
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      name: "Jane Smith",
      title: "Lead Content Creator, MediaLab",
      content:
        "The AI tools in Aven are insanely fast and reliable. Producing blog posts and visual assets has never felt this effortless.",
      rating: 5,
    },
    {
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
      name: "David Lee",
      title: "Senior Copywriter, GrowthCo",
      content:
        "Aven is hands down the cleanest AI content suite I've used. The resume reviewer and background removal features are top-notch.",
      rating: 5,
    },
  ];

  return (
    <section className="px-6 md:px-12 xl:px-24 py-24 bg-[#09090B] relative tracking-[-0.02em]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl sm:text-6xl font-semibold text-white tracking-[-0.03em] leading-tight">
          Kind words from the community<span className="text-[#FF4D5E]">.</span>
        </h2>
        <p className="text-gray-400 mt-4 text-base sm:text-lg max-w-xl mx-auto font-medium">
          Here is what digital leaders and creators say about building with Aven.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {dummyTestimonialData.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-300"
          >
            <div>
              <div className="flex items-center gap-1 mb-4 text-[#FF4D5E]">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-[#FF4D5E] text-[#FF4D5E]"
                    />
                  ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed font-medium">
                "{testimonial.content}"
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
              <img
                src={testimonial.image}
                className="w-10 h-10 object-cover rounded-full border border-white/10"
                alt={testimonial.name}
              />
              <div>
                <h4 className="font-semibold text-white text-sm">{testimonial.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{testimonial.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonial;
