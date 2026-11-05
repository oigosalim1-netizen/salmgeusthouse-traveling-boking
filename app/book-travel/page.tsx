export default function BookTravelPage() {
  return (
    <main className="wrap">
      <nav className="nav">
        <a className="brand" href="/">Salim&apos;s Travel</a>
        <a href="/">Back</a>
      </nav>
      <section className="hero">
        <div className="eyebrow">What are you looking for?</div>
        <h1>Choose Your Booking</h1>
        <p>Book your journey or find a guest house to stay in.</p>
        <div className="actions">
          <a className="btn" href="/book-journey">Book Travel</a>
          <a className="btn" href="/find-house">Find House to Live</a>
        </div>
      </section>
    </main>
  );
}
