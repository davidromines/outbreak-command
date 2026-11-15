import asyncio, os, json
from playwright.async_api import async_playwright
D = '/home/claude/test/node_modules/maplibre-gl/dist/'
J = lambda x: json.dumps(x)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': 1280, 'height': 800})
        logs = []
        pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:200]))
        pg.on('pageerror', lambda e: logs.append('PAGEERROR ' + str(e)))
        async def route(r):
            u = r.request.url
            if u.startswith('file:'): await r.continue_()
            elif u.endswith('maplibre-gl.js'): await r.fulfill(path=D + 'maplibre-gl.js', content_type='application/javascript')
            elif u.endswith('maplibre-gl.css'): await r.fulfill(path=D + 'maplibre-gl.css', content_type='text/css')
            elif u.rstrip('/').endswith('/planet'): await r.fulfill(body='{"tiles":["https://tiles.openfreemap.org/planet/t/{z}/{x}/{y}.pbf"],"maxzoom":14}', content_type='application/json', headers={'Access-Control-Allow-Origin': '*'})
            elif u.endswith('.pbf') and '/planet/t/' in u:
                z, x, y = u[:-4].split('/')[-3:]; f = f'/home/claude/test/tiles/{z}_{x}_{y}.pbf'
                if os.path.exists(f): await r.fulfill(path=f, content_type='application/x-protobuf', headers={'Access-Control-Allow-Origin': '*'})
                else: await r.fulfill(status=204, body='', headers={'Access-Control-Allow-Origin': '*'})
            else: await r.abort()
        await pg.route('**/*', route)
        await pg.goto('file:///home/claude/outbreak.html')
        await pg.wait_for_timeout(15000)
        ev=pg.evaluate
        await ev("localStorage.removeItem('oc_camp')"); await pg.reload(); await pg.wait_for_timeout(14000)
        print('crate btn hidden:', await ev("getComputedStyle(document.getElementById('crateBtn')).display"), '| locked tools:', await ev("document.querySelectorAll('button.locked').length"))
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(3000)
        await ev("__game.stageEnd('time')"); await pg.wait_for_timeout(300)
        print('banner:', await ev("JSON.stringify({t:document.getElementById('bTitle').textContent,carry:document.getElementById('bCarry').textContent,btn:document.getElementById('bBtn').textContent})"))
        await pg.click('#bBtn'); await pg.wait_for_timeout(400)
        await pg.screenshot(path='/home/claude/test/s1.png')
        print('shop:', await ev("JSON.stringify({vis:document.getElementById('shop').style.display,sp:document.getElementById('shopSP').textContent,sections:[...document.querySelectorAll('#shop h3')].map(h=>h.textContent),items:document.querySelectorAll('#shop .it').length,go:document.getElementById('shopGo').textContent})"))
        # buy: first affordable upgrade, an air strike if offered, and a blueprint; then reroll
        async def buy(sel_text):
            return await ev("""((t)=>{const b=[...document.querySelectorAll('#shop .it')].find(d=>d.querySelector('.n').textContent.startsWith(t));if(!b)return 'none';const btn=b.querySelector('button');if(btn.disabled)return 'disabled';btn.click();return 'ok'})""" + "(" + __import__('json').dumps(sel_text) + ")")
        print('buy Hollow points:', await buy('Hollow points'), '| War budget:', await buy('War budget'), '| Intel:', await buy('Intel'))
        bp = await ev("(()=>{const c=[...document.querySelectorAll('#shop .it')].find(d=>d.querySelector('.d').textContent.includes('blueprint'));if(!c)return null;const n=c.querySelector('.n').textContent;const b=c.querySelector('button');const dis=b.disabled;b.click();return [n,dis]})()")
        print('blueprint:', bp, '| unlocked now:', await ev("JSON.stringify(__game.camp.unlocked)"), '| SP left:', await ev("__game.camp.run.sp"), '| supplies:', await ev("JSON.stringify(__game.camp.run.supplies)"), '| up:', await ev("JSON.stringify(__game.camp.run.up)"))
        await pg.screenshot(path='/home/claude/test/s2.png')
        await pg.click('#shopGo'); await pg.wait_for_timeout(20000)
        print('stage2:', await ev("JSON.stringify({stage:__game.camp.run.stage,budget:__game.sim.budget,intel:__game.sim.intel,up:__game.sim.up,free:__game.sim.free,picking:__game.picking})"))
        # sandbox shop
        await pg.select_option('#modeSel','sandbox'); await pg.wait_for_timeout(14000)
        b0 = await ev("__game.sim.budget"); await pg.keyboard.press('l'); await pg.wait_for_timeout(300)
        print('sandbox shop:', await ev("document.getElementById('shop').style.display"), await ev("document.getElementById('shopSP').textContent"), await buy('Optics'), await buy('Air strike'))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        print('sandbox after:', await ev("JSON.stringify({budget:__game.sim.budget,b0:%s,up:__game.sim.up,free:__game.sim.free,shop:document.getElementById('shop').style.display})" % b0))
        print('\n'.join(l for l in logs if 'PAGEERROR' in l)[:1500])
        await b.close()
asyncio.run(main())
