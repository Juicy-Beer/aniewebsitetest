import "./globals.css";
import Link from "next/link";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Animeshelf: find your next anime",
    template: "%s | Animeshelf",
  },
  description:
    "Browse anime series and movies and filter them by genre, year, format and score.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <header className="site-header">
          <div className="container bar">
            <Link href="/" className="wordmark">
              Animeshelf
            </Link>
            <nav aria-label="Main">
              <Link href="/?format=TV">Series</Link>
              <Link href="/?format=MOVIE">Movies</Link>
            </nav>
          </div>
        </header>

        <main className="container page">{children}</main>

        <footer className="site-footer">
          <div className="container">
            Anime data from{" "}
            <a href="https://anilist.co" target="_blank" rel="noopener noreferrer">
              AniList
            </a>
            .
          </div>
        </footer>
      </body>
    </html>
  );
}
