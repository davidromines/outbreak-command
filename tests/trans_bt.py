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
        await pg.goto('file:///home/claude/outbreak.html'); await pg.wait_for_timeout(2500)
        ev=pg.evaluate
        await ev("localStorage.removeItem('oc_camp');localStorage.removeItem('oc_loc');localStorage.setItem('oc_mode','campaign')"); await pg.reload(); await pg.wait_for_timeout(2500)
        await pg.click('#iStart')
        for i,t in enumerate([600,1400,2600,3600,5000,7000]):
            await pg.wait_for_timeout(t - ([0,600,1400,2600,3600,5000][i]))
            await pg.screenshot(path=f'tr1_{i}.png')
        await pg.wait_for_timeout(9000)
        st = "JSON.stringify({trans:document.body.classList.contains('trans'),hud:getComputedStyle(document.getElementById('hud')).display,zoom:__game.map.getZoom().toFixed(2),pitch:__game.map.getPitch().toFixed(0),phase:__game.phase,anim:!!__game.map.getLayer('regionAnim'),region:__game.map.getLayoutProperty('region','visibility')})"
        print('after stage1 intro', await ev(st))
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(3000)
        await ev("__game.stageEnd('time')"); await pg.wait_for_timeout(400)
        await pg.click('#bBtn'); await pg.wait_for_timeout(400); await pg.click('#shopGo')
        for i in range(6):
            await pg.wait_for_timeout(600)
            print('mid', i, await ev("(()=>{const m=__game.map,src=m.getSource('regionAnim');if(!src)return JSON.stringify({anim:false,reg:m.getLayer('region')&&m.getLayoutProperty('region','visibility')});const c=src.canvas||src.getCanvas&&src.getCanvas();const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let dark=0,red=0,clear=0;for(let i=0;i<d.length;i+=4){if(d[i+3]===0)clear++;else if(d[i]>200)red++;else dark++;}return JSON.stringify({anim:true,reg:m.getLayoutProperty('region','visibility'),dark,red,clear})})()"))
            if i==2: await pg.screenshot(path='tr2_mid.png')
            print(i, await ev("JSON.stringify({card:document.getElementById('tCard').className,l2:document.getElementById('tL2').textContent,z:__game.map.getZoom().toFixed(2)})"))
        await pg.wait_for_timeout(8000)
        print('after stage2', await ev(st))
        # skip test: next stage, press space early
        await ev("__game.stageEnd('time')"); await pg.wait_for_timeout(400); await pg.click('#bBtn'); await pg.wait_for_timeout(400); await pg.click('#shopGo'); await pg.wait_for_timeout(800)
        await pg.keyboard.press(' '); await pg.wait_for_timeout(300); print('skipped', await ev(st))
        await pg.wait_for_timeout(25000); print('stage3 loaded', await ev(st), await ev("document.getElementById('campInfo').textContent.slice(0,30)"))
        print('\n'.join(l for l in logs if 'PAGEERROR' in l or 'transition' in l or 'TRDBG' in l))
        await b.close()
asyncio.run(main())
