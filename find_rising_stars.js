const fs = require('fs');
const readline = require('readline');

async function processFiles() {
    const ligaStoreIds = new Set();
    const mppStores = [];

    // 1. Read Liga ESS CSV
    const ligaRl = readline.createInterface({
        input: fs.createReadStream('CSV/CSE Analysis - Liga ESS.csv'),
        crlfDelay: Infinity
    });

    let isFirstLine = true;
    for await (const line of ligaRl) {
        if (isFirstLine) {
            isFirstLine = false;
            continue;
        }
        const fields = line.split(',');
        if (fields.length > 0) {
            // First column "Short branch name" is like "7010 - EIGER..."
            // Sometimes it's quoted if it contains commas. Let's just match the first 4 digits.
            const match = line.match(/^"?(\d{4})/);
            if (match) {
                ligaStoreIds.add(match[1]);
            }
        }
    }

    // 2. Read MPP Tracking CSV
    const mppRl = readline.createInterface({
        input: fs.createReadStream('CSV/Retail MPP Tracking (National) - Facility List.csv'),
        crlfDelay: Infinity
    });

    isFirstLine = true;
    for await (const line of mppRl) {
        if (isFirstLine) {
            isFirstLine = false;
            continue;
        }

        // Use a simple regex to split by comma, respecting quotes
        const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
        let p = [];
        let m;
        while ((m = regex.exec(line)) !== null && p.length < 10) {
            p.push(m[1] !== undefined ? m[1] : m[2]);
        }

        if (p.length >= 4) {
            const siteCode = p[2]?.trim();
            const siteName = p[3]?.trim();
            const region = p[0]?.trim();
            const branch = p[1]?.trim();

            if (siteCode && siteCode.match(/^\d{4}$/)) {
                if (!ligaStoreIds.has(siteCode)) {
                    mppStores.push({ siteCode, siteName, region, branch });
                }
            }
        }
    }

    console.log(`\nFound ${mppStores.length} "Rising Star" Stores (In MPP tracking but NO historical ESS score):\n`);
    mppStores.forEach(store => {
        console.log(`- [${store.siteCode}] ${store.siteName} (${store.region}, ${store.branch})`);
    });
}

processFiles().catch(console.error);
