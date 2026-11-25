import { ClipboardList } from "lucide-react";

export default function HomePage() {
  return (
    <main className="home">
      <h1>
        <ClipboardList aria-hidden="true" />
        SGAO
      </h1>
      <p>Suivi des références commerciales.</p>
    </main>
  );
}
