import { Game } from "@/components/Game";
import { Intro } from "@/components/Intro";

export default function HomePage() {
  return (
    <main className="shell">
      <Intro />
      <Game />
      <footer className="footer">
        Map data © OneMap, Singapore Land Authority.
      </footer>
    </main>
  );
}
