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
        await pg.goto('file:///home/claude/outbreak.html'); await pg.wait_for_timeout(2000)
        ev=pg.evaluate
        await ev("localStorage.setItem('oc_mode','sandbox')"); await pg.reload(); await pg.wait_for_timeout(2000)
        await pg.click('#iStart'); await pg.wait_for_timeout(15000)
        S="JSON.stringify({nt:__game.sim.nt,inb:__game.sim.inbound.map(o=>o.k+':'+o.t.toFixed(1)),mk:document.querySelectorAll('.inb').length,txt:[...document.querySelectorAll('.inb')].map(e=>e.textContent).join('|'),planes:__game.sim.planes.length})"
        await pg.keyboard.press('p'); await pg.mouse.move(600,400); await pg.mouse.down(); await pg.mouse.move(760,420,steps=5); await pg.mouse.up()
        await pg.wait_for_timeout(500); print('plan +0.5s', await ev(S)); await pg.screenshot(path='drop1.png')
        await pg.wait_for_timeout(3500); print('plan +4s', await ev(S)); await pg.screenshot(path='drop2.png')
        await pg.wait_for_timeout(5000); print('plan +9s', await ev(S))
        await pg.mouse.click(700,450, button='right'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1000)
        await pg.keyboard.press('q'); await pg.mouse.move(500,300); await pg.mouse.down(); await pg.mouse.move(650,330,steps=5); await pg.mouse.up(); await pg.wait_for_timeout(500)
        print('live bomb', await ev(S)); await pg.wait_for_timeout(6000); print('after', await ev(S))
        print('\n'.join(l for l in logs if 'PAGEERROR' in l))
        await b.close()
asyncio.run(main())
