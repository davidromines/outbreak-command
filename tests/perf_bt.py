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
        await ev("localStorage.removeItem('oc_camp');localStorage.removeItem('oc_loc');localStorage.setItem('oc_mode','campaign')"); await pg.reload(); await pg.wait_for_timeout(2000)
        await pg.click('#iStart'); await pg.wait_for_timeout(20000)
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(2500); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(2000)
        await ev("__game.stageEnd('time')"); await pg.wait_for_timeout(400); await pg.click('#bBtn'); await pg.wait_for_timeout(400)
        await ev("window.__lt=[];(function f(t){window.__lt.push(t);if(window.__lt.length<3000)requestAnimationFrame(f)})(performance.now())")
        await pg.click('#shopGo'); await pg.wait_for_timeout(25000)
        print('longest frame gap ms', await ev("(()=>{let m=0,a=__lt;for(let i=1;i<a.length;i++)m=Math.max(m,a[i]-a[i-1]);return Math.round(m)})()"))
        print('\n'.join(l for l in logs if 'PERF' in l or 'PAGEERROR' in l))
        await b.close()
asyncio.run(main())
