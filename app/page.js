// app/page.js (or your Home page)
import Map from './components/map/Map';

export default function Home() {
  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Ghuss Map Overview</h1>
      <p>
        Below is a map showing some dummy Ghuss locations with their intensity levels.
        The red circles represent the intensity of each Ghuss.
      </p>
      <Map />
    </main>
  );
}
