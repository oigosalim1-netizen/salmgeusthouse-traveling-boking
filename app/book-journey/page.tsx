export default function BookJourneyPage() {
  const counties = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu",
    "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho",
    "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui",
    "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
    "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
    "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
    "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
    "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
  ];

  return (
    <main className="wrap">
      <nav className="nav">
        <a className="brand" href="/">Salim&apos;s Travel</a>
        <a href="/book-travel">Back to choices</a>
      </nav>

      <section className="hero">
        <div className="eyebrow">Family Trip Package</div>
        <h1>Travel together, make memories</h1>
        <p>Private family and group trips from Nairobi to destinations across Kenya.</p>
        <div className="card">
          <h2>Family Trip Package</h2>
          <p><strong>Maximum group size: 7 people</strong></p>
          <p>Travel as a group in one package. Select your destination to view the available fare.</p>
        </div>
      </section>

      <section className="section">
        <h2>Choose your destination</h2>
        <div className="grid">
          {counties.map((county) => (
            <article className="card" key={county}>
              <h3>Nairobi → {county}</h3>
              {county === "Kisii" ? (
                <p><strong>KES 11,000</strong> <span>total package for up to 7 people</span></p>
              ) : (
                <p>Request a fare quote for your group.</p>
              )}
              <a className="button" href={`mailto:bookings@salimstravel.co.ke?subject=${encodeURIComponent(`Family trip quote: Nairobi to ${county}`)}`}>
                {county === "Kisii" ? "Ask about this trip" : "Request a quote"}
              </a>
            </article>
          ))}
        </div>
        <p className="note">Fares for destinations other than Kisii have not been published yet. Contact us for a confirmed quote before booking.</p>
      </section>
    </main>
  );
}
