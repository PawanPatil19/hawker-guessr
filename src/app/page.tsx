import { Game } from "@/components/Game";
import { Intro } from "@/components/Intro";

export default function HomePage() {
  return (
    <main className="shell">
      <Intro />
      <div className="game-stage">
        <Game />
      </div>
      <footer className="footer">
        Map data © OneMap, Singapore Land Authority.
      </footer>
    </main>
  );
}
