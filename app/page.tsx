import MediaGallery from "./media-gallery";

export default function Home() {
  const phone = "0717818330";
  const whatsapp = "254717818330";

  return (
    <main className="wrap welcome-page">
      <section className="welcome-card">
        <div className="eyebrow">Welcome</div>
        <h1>Welcome to Salim&apos;s Travelling Booking and Guest House Rooms</h1>
        <p>Pick your travel and let us help make your journey and stay simple, comfortable, and convenient.</p>
        <div className="welcome-scenes" aria-label="Travel and accommodation">
          <div className="welcome-scene car">Line Up</div>
          <div className="welcome-scene house">Relaxing guest house stays</div>
        </div>
        <div className="contact-us">
          <h2>Contact Us</h2>
          <p>{phone}</p>
          <div className="actions">
            <a className="btn" href="tel:+254717818330">Call</a>
            <a className="btn secondary" href="sms:+254717818330">SMS</a>
            <a className="btn secondary" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
        <a className="btn" href="/book-travel">Next</a>
        <MediaGallery />
      </section>
    </main>
  );
}
