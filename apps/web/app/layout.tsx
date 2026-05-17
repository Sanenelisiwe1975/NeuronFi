import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuronFi — Autonomous DeFi Agent",
  description: "Autonomous DeFi Agent powered by Kite AI",
};

// Runs synchronously before React hydrates — suppresses wallet extension
// errors (MetaMask service-worker failures, duplicate ethereum injections)
// so they never reach the Next.js error overlay.
const suppressWalletErrors = `
(function(){
  var KEYWORDS = [
    'Failed to connect to MetaMask',
    'Cannot redefine property: ethereum',
    'evmAsk',
    'inpage.js',
    'nkbihfbeogaeaoehlefnkodbefgpgknn',
    'bfnaelmomeimhlpmgjnjophhpkkoljpa'
  ];
  function shouldSuppress(msg){
    if(!msg) return false;
    var s = String(msg);
    for(var i=0;i<KEYWORDS.length;i++){
      if(s.indexOf(KEYWORDS[i])!==-1) return true;
    }
    return false;
  }
  window.addEventListener('error', function(e){
    if(shouldSuppress(e.message) || shouldSuppress(e.filename)){
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
  window.addEventListener('unhandledrejection', function(e){
    if(shouldSuppress(e.reason && (e.reason.message || e.reason))){
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
})();
`.trim();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Suppress wallet extension errors before React or MetaMask run */}
        <script dangerouslySetInnerHTML={{ __html: suppressWalletErrors }} />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
