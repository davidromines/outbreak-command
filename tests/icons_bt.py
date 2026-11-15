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
        await pg.click('#iStart'); await pg.wait_for_timeout(14000); await pg.keyboard.press('Escape')
        await ev("__game.sim.budget=1e6; __game.sim.addHowitzer(0,-60); __game.sim.addMortar(40,40); __game.sim.addTurret(-40,40)")
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(800)
        await ev("const s=__game.sim; s.drop(-150,0,-60,0); s.airstrike(-200,80,100,80); s.precisionBomb(60,-20); s.strafe(-100,-100,150,-100)")
        await ev("__game.map.jumpTo({center: __game.map.getCenter(), zoom: 16.8, pitch: 0, bearing: 0})")
        for i,t in enumerate([2300,700,700]):
            await pg.wait_for_timeout(t); await pg.screenshot(path=f'ic{i}.png')
        print('\n'.join(l for l in logs if 'PAGEERROR' in l))
        await b.close()
asyncio.run(main())
