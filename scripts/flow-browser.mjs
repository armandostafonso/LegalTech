import {chromium,webkit} from "playwright";
import fs from "node:fs";
import assert from "node:assert/strict";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
const url = pathToFileURL(resolve("flow.html")).href;
for (const [name, engine] of [["Chromium",chromium],["WebKit",webkit]]) {
  const browser = await engine.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
    const requests = [];
    page.on("request", req => {if (/^https?:\/\//i.test(req.url())) requests.push(req.url());});
    await page.goto(url, {waitUntil:"domcontentloaded"});
    assert.equal(await page.locator("#flow-txt").isEnabled(), false);
    await page.locator("#flow-type").selectOption("notificacao");
    await page.locator("#flow-reference").fill("Exemplo fictício");
    await page.locator("#flow-instruction").fill("Notifique para informar dos registos, em prazo confirmado.");
    await page.locator("#flow-date").fill("2026-11-30");
    await page.locator("#flow-notes").fill("Conferir documentalmente.");
    await page.locator("#flow-prepare").click();
    assert.ok((await page.locator("#flow-checks input").count()) >= 10);
    assert.ok((await page.locator("#flow-checks").innerText()).includes("registos"));
    assert.ok((await page.locator("#flow-report").inputValue()).includes("2026-11-30"));
    await page.locator("#flow-checks input").first().check();
    assert.match(await page.locator("#flow-progress").innerText(), /1 de \d+/);
    assert.ok((await page.locator("#flow-report").inputValue()).includes("[x]"));
    const toolUrls = await page.locator("#flow-tools a").evaluateAll(nodes => nodes.map(n => n.getAttribute("href")));
    assert.ok(toolUrls.includes("notify.html"));
    assert.ok(toolUrls.every(x => !x.includes("registos") && !x.includes("Exemplo")));
    const download = page.waitForEvent("download");
    await page.locator("#flow-txt").click();
    const file = await download;
    assert.ok(fs.readFileSync(await file.path(),"utf8").includes("[x]"));
    await page.locator("#flow-report").fill("Texto manual de teste.");
    await page.locator("#flow-checks input").nth(1).check();
    assert.equal(await page.locator("#flow-report").inputValue(), "Texto manual de teste.");
    await page.locator("#flow-regenerate").click();
    assert.ok((await page.locator("#flow-report").inputValue()).includes("2/"));
    await page.locator("#flow-clear").click();
    assert.equal(await page.locator("#flow-instruction").inputValue(), "");
    assert.equal(await page.locator("#flow-txt").isEnabled(), false);
    await page.reload();
    assert.equal(await page.locator("#flow-instruction").inputValue(), "");
    assert.equal(await page.locator("#flow-txt").isEnabled(), false);
    assert.deepEqual(requests, [], "Pedidos externos: " + requests.join(","));
    console.log("LegalTech Flow aprovado em " + name + " (ecrã móvel).");
  } finally {await browser.close();}
}
