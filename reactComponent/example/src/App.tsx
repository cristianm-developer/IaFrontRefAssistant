function App() {
  return (
    <>
      <section data-wrapper-id="hero">
        <h1>Hero de ejemplo</h1>
        <div data-component-id="cta-card" data-component-kind="CtaCard">
          <p>Probá el asistente con este componente.</p>
          <div className="wrapper-only">
            <button>Click me</button>
          </div>
        </div>
      </section>
      <section data-wrapper-id="footer">
        <p>Footer de ejemplo</p>
      </section>
    </>
  );
}

export default App;
