import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="container">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <Link href="/">Chat interno do escritório</Link>
            <div className="row">
              <Link href="/">Chat</Link>
              <Link href="/admin/login">Admin</Link>
            </div>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
