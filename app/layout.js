import Script from 'next/script';
import './globals.css';
import localFont from 'next/font/local';
import { Doppio_One } from 'next/font/google';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Hanken_Grotesk } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';


const montserrat = localFont({
  src: [
    {
      path: '../public/fonts/montserrat/Montserrat-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/montserrat/Montserrat-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-montserrat',
  display: 'swap',
});

const telegraf = localFont({
  src: [
    {
      path: '../public/fonts/telegraf/Telegraf-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/telegraf/Telegraf-UltraBold.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-telegraf',
  display: 'swap',
});

const doppioOne = Doppio_One({
  weight: '400',
  variable: '--font-doppio-one',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: '800',
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const hankenGrotesk = Hanken_Grotesk({
  weight: '600',
  variable: '--font-hanken-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  verification: {
    google: 'xhfnSm5zX45Ov_N5NO-py7sXFqI6VC5EDAb4FhYafNQ',
  },
  metadataBase: new URL('https://digimedia-marketing.com'),
};
//correccion de body a body{margin:0;line-height:inherit;font-family:var(--font-montserrat),Arial,Helvetica,sans-serif;background:#fff;color:#000}
//.dark body{background:#000;color:#fff} por temas de variaciones de color cuando se modificaba el color del tema de oscuro a claro
const criticalCSS = `
/* Critical CSS - Inline for faster rendering */
html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}
body{margin:0;line-height:inherit;font-family:var(--font-montserrat),Arial,Helvetica,sans-serif;background:#fff;color:#000}
.dark body{background:#000;color:#fff}
img{display:block;max-width:100%;height:auto}
h1,h2,h3,h4,h5,h6{font-family:var(--font-telegraf),sans-serif;font-weight:700}
.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.header{display:flex;justify-content:center;box-shadow:0 2px 20px #333;position:sticky;top:0;z-index:100;height:125px;transition:box-shadow 0.4s ease,backdrop-filter 0.4s ease}
.headerScrolled{box-shadow:0 4px 24px rgba(0,0,0,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.contenidoHeader{display:flex;width:100%;height:125px;justify-content:space-between;align-items:center;max-width:1280px;margin:0 auto;padding:0 24px}
.menuHorizontal{display:flex;list-style:none;margin:0;align-items:center;padding-left:0}
.menuHorizontal li{display:flex;align-items:center;position:relative;box-sizing:border-box}
.menuHorizontal a,.menuHorizontal p{text-decoration:none;display:block;color:#fff;font-family:'Doppio One',Arial,Helvetica,sans-serif;padding:15px;height:100%;transition:background-color 0.3s ease}
.menuHorizontal a:hover,.menuHorizontal p:hover{background-color:rgba(51,51,51,0.4)}
.dropping-word{font-weight:600;color:#ffb800;animation:fadeInScale 0.5s forwards}
@keyframes fadeInScale{0%{opacity:0;transform:scale(0)}100%{opacity:1;transform:scale(1)}}
.animate-blink{animation:blink 1s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.whatsapp-float{position:fixed;bottom:24px;right:24px;z-index:1000;width:60px;height:60px;background:#25D366;border-radius:50%}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const theme = localStorage.getItem('theme');
              if (
                theme === 'dark' ||
                (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
              ) {
                document.documentElement.classList.add('dark');
              }
            } catch (_) {}
          `}
        </Script>

        <Script id="gtm-script" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MR2MC9SB');
          `}
        </Script>
      </head>
      <body
        className={`${montserrat.variable} ${telegraf.variable} ${doppioOne.variable} ${plusJakartaSans.variable} ${hankenGrotesk.variable} antialiased`}
      >
   <AuthProvider>
  {children}
</AuthProvider>



        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MR2MC9SB"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
      </body>
    </html>
  );
}