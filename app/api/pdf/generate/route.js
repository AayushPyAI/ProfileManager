import { NextResponse } from 'next/server';

let puppeteer;
let chromium;

const getPuppeteer = async () => {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    if (!chromium) {
      chromium = await import('@sparticuz/chromium');
      puppeteer = await import('puppeteer-core');
    }
    return { puppeteer: puppeteer.default, chromium: chromium.default };
  } else {
    if (!puppeteer) {
      puppeteer = await import('puppeteer');
    }
    return { puppeteer: puppeteer.default, chromium: null };
  }
};

export async function POST(req) {
  let browser = null;
  try {
    const { profileId } = await req.json();
    
    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:7089');
    
    const portfolioUrl = `${baseUrl}/${profileId}`;

    const { puppeteer: puppeteerInstance, chromium: chromiumInstance } = await getPuppeteer();

    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };

    if (chromiumInstance) {
      launchOptions.executablePath = await chromiumInstance.executablePath();
      chromiumInstance.setGraphicsMode(false);
    }

    browser = await puppeteerInstance.launch(launchOptions);

    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1200,
      height: 1600,
    });

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      request.continue();
    });
    
    await page.goto(portfolioUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        [class*="overflow-x-auto"][class*="flex"] {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
          gap: 1.5rem !important;
          overflow: visible !important;
          flex-wrap: wrap !important;
        }
        [class*="overflow-x-auto"] [class*="shrink-0"] {
          width: 100% !important;
          max-width: 100% !important;
          flex-shrink: 1 !important;
        }
        section button[class*="rounded-full"] {
          display: none !important;
        }
        section, [class*="card"], [class*="Card"], [class*="section"], 
        [class*="experience-card"], [class*="certification-card"],
        article, [class*="ProjectCard"], [class*="BaseCard"] {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        section {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        [class*="border"], [class*="rounded"] {
          border-style: solid !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        [class*="text-slate-800"], [class*="text-slate-700"], [class*="text-slate-600"],
        [class*="text-gray-200"], [class*="text-gray-700"], [class*="text-gray-800"],
        [class*="dark:text-slate-300"], [class*="dark:text-slate-400"] {
          color: rgb(255, 255, 255) !important;
        }
        [class*="BaseCard"] p, [class*="BaseCard"] div[class*="text-sm"],
        [class*="ProjectCard"] p, [class*="ProjectCard"] div[class*="text-sm"] {
          color: rgb(255, 255, 255) !important;
        }
      `;
      document.head.appendChild(style);
    });

    await page.evaluate(async () => {
      const loadImage = (img) => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
            resolve();
            return;
          }
          
          const timeout = setTimeout(() => resolve(), 15000);
          
          const checkLoaded = () => {
            if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
              clearTimeout(timeout);
              resolve();
            }
          };
          
          img.onload = checkLoaded;
          img.onerror = () => {
            clearTimeout(timeout);
            resolve();
          };
          
          if (img.srcset) {
            const srcsetParts = img.srcset.split(',');
            if (srcsetParts.length > 0) {
              const largestSrc = srcsetParts[srcsetParts.length - 1].trim().split(' ')[0];
              img.src = largestSrc;
            }
          }
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          if (img.dataset.nimg) {
            try {
              const nimg = JSON.parse(img.dataset.nimg);
              if (nimg.src) {
                img.src = nimg.src;
              }
            } catch (e) {
            }
          }
          
          if (!img.src || img.src === '') {
            const parent = img.closest('picture, [class*="Image"]');
            if (parent) {
              const sources = parent.querySelectorAll('source');
              sources.forEach(source => {
                if (source.srcset) {
                  const srcsetParts = source.srcset.split(',');
                  if (srcsetParts.length > 0) {
                    img.src = srcsetParts[srcsetParts.length - 1].trim().split(' ')[0];
                  }
                }
              });
            }
          }
        });
      };

      const images = Array.from(document.querySelectorAll('img'));
      const pictureElements = Array.from(document.querySelectorAll('picture'));
      
      pictureElements.forEach(picture => {
        const img = picture.querySelector('img');
        if (img) {
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          if (img.srcset) {
            const srcsetParts = img.srcset.split(',');
            if (srcsetParts.length > 0) {
              img.src = srcsetParts[srcsetParts.length - 1].trim().split(' ')[0];
            }
          }
          const sources = picture.querySelectorAll('source');
          sources.forEach(source => {
            if (source.srcset && !img.src) {
              const srcsetParts = source.srcset.split(',');
              if (srcsetParts.length > 0) {
                img.src = srcsetParts[srcsetParts.length - 1].trim().split(' ')[0];
              }
            }
          });
        }
      });

      const nextImages = Array.from(document.querySelectorAll('[data-nimg]'));
      nextImages.forEach(el => {
        try {
          const nimg = JSON.parse(el.dataset.nimg);
          if (nimg.src) {
            const img = el.querySelector('img') || el;
            if (img.tagName === 'IMG') {
              img.src = nimg.src;
            }
          }
        } catch (e) {
        }
      });

      await Promise.all(images.map(loadImage));
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    });

    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            window.scrollTo(0, 0);
            setTimeout(resolve, 1000);
          }
        }, 100);
      });
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      tagged: false,
      outline: false
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="portfolio_${profileId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    if (browser) {
      await browser.close();
    }
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

