export default function Home() {
  return (
    <main className="wrap welcome-page">
      <section className="welcome-card">
        <div className="eyebrow">Welcome</div>
        <h1>Welcome to Salim&apos;s Travelling Booking and Guest House Rooms</h1>
        <p>Pick your travel and let us help make your journey and stay simple, comfortable, and convenient.</p>
        <div className="welcome-scenes" aria-label="Travel and accommodation">
          <div className="welcome-scene car">Comfortable travel</div>
          <div className="welcome-scene house">Relaxing guest house stays</div>
        </div>
        <a className="btn" href="/book-travel">Next</a>
      </section>
    </main>
  );
}
