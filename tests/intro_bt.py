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
        await pg.goto('file:///home/claude/outbreak.html'); await pg.wait_for_timeout(4000)
        ev=pg.evaluate
        await ev("localStorage.removeItem('oc_camp');localStorage.removeItem('oc_loc')"); await pg.reload(); await pg.wait_for_timeout(5000)
        await pg.screenshot(path='intro.png')
        print('intro', await ev("JSON.stringify({vis:getComputedStyle(document.getElementById('intro')).display,opts:[...document.querySelectorAll('#iLoc option')].map(o=>o.textContent).slice(0,3),phase:__game.phase,walk:__game.sim?1:0})"))
        await pg.keyboard.press('p'); print('key ignored during intro:', await ev("document.getElementById('dropBtn').classList.contains('active')"))
        await pg.click('#iStart'); await pg.wait_for_timeout(15000)
        print('started', await ev("JSON.stringify({vis:getComputedStyle(document.getElementById('intro')).display,camp:document.getElementById('campInfo').textContent.slice(0,40),loc:localStorage.getItem('oc_loc')})"))
        c0 = await ev("JSON.stringify(__game.map.getCenter())")
        await pg.mouse.click(900,400); await pg.keyboard.down('d'); await pg.keyboard.down('w'); await pg.wait_for_timeout(800); await pg.keyboard.up('d'); await pg.keyboard.up('w')
        c1 = await ev("JSON.stringify(__game.map.getCenter())"); print('wasd pan', c0, '->', c1, '| heli mode not set:', await ev("document.getElementById('heliBtn').classList.contains('active')"), 'sniper not set:', await ev("document.getElementById('sniperBtn').classList.contains('active')"))
        await pg.keyboard.press('b'); a1 = await ev("document.getElementById('wallBtn').classList.contains('active')")
        await pg.mouse.click(700,450, button='right'); a2 = await ev("document.getElementById('wallBtn').classList.contains('active')")
        print('wall mode', a1, '-> after right click', a2)
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1500)
        await pg.keyboard.press('Control+a'); n1 = await ev("__game.sim.countSel()")
        await pg.mouse.click(700,450, button='right'); n2 = await ev("__game.sim.countSel()")
        print('ctrl+a selected', n1, '-> right click', n2)
        await pg.keyboard.press('i'); print('I = sniper:', await ev("document.getElementById('sniperBtn').classList.contains('active')"))
        await pg.mouse.click(700,450, button='right')
        await pg.reload(); await pg.wait_for_timeout(4000)
        print('reload opts', await ev("JSON.stringify([...document.querySelectorAll('#iLoc option')].map(o=>o.textContent).slice(0,2))"))
        await pg.select_option('#iLoc', '5'); await pg.wait_for_timeout(300); print('note', await ev("document.getElementById('iNote').textContent"))
        print('\n'.join(l for l in logs if 'PAGEERROR' in l))
        await b.close()
asyncio.run(main())
