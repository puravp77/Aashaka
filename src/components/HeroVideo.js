import "./HeroVideo.css";

export default function HeroVideo() {
  return (
    <section className="hero-video">
      <video 
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/video/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </section>
  );
}
