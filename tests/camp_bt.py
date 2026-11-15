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
        await pg.wait_for_timeout(2000); await pg.click('#iStart')
        await pg.wait_for_timeout(15000)
        info = """(()=>{const g=__game,s=g.sim;let ins=0;if(s.region)for(const v of s.region)if(v)ins++;let w=0;for(const v of s.walk)if(v&1)w++;
          return JSON.stringify({area:s.AREA,res:s.RES,regionKm2:+(ins*s.RES*s.RES/1e6).toFixed(2),walk:w,humans:s.nh,pop:s.popScale.toFixed(2),budget:s.budget,phase:g.phase,
          camp:document.getElementById('campInfo').textContent,locked:document.querySelectorAll('button.locked').length,stage:g.camp.run&&g.camp.run.stage,layer:!!g.map.getLayer('region'),free:s.freeCrates})})()"""
        print('stage1', await pg.evaluate(info))
        await pg.screenshot(path='/home/claude/test/c1.png')
        # locked tool refuses
        await pg.keyboard.press('v')
        print('locked V ->', await pg.evaluate("document.getElementById('status').textContent"))
        # open a crate: pick 1 of 3
        c = await pg.evaluate("(()=>{const m=__game.map,o=__game.origin;const q=m.project(new maplibregl.MercatorCoordinate(o.x,o.y).toLngLat());return [q.x,q.y]})()")
        await pg.keyboard.press('l'); await pg.mouse.click(c[0], c[1])
        await pg.wait_for_timeout(500)
        print('pick shown', await pg.evaluate("JSON.stringify({vis:document.getElementById('pick').style.display,opts:[...document.querySelectorAll('#pick .opt')].map(b=>b.textContent),picking:__game.picking})"))
        await pg.screenshot(path='/home/claude/test/c2.png')
        await pg.keyboard.press('1')
        await pg.wait_for_timeout(300)
        print('after pick', await pg.evaluate("JSON.stringify({picking:__game.picking,toast:document.getElementById('toast').textContent,budget:__game.sim.budget,unlocked:__game.camp.unlocked})"))
        # several crates to exercise pity/blueprints
        res = await pg.evaluate("""(()=>{const s=__game.sim,out=[];s.budget=5000;for(let k=0;k<8;k++){s.payCrate(0,0);const o=s.rollCrate(__game.camp.unlocked.length<20?[{id:'apc',name:'APCs',rarity:'uncommon'},{id:'nuke',name:'Nukes',rarity:'jackpot'}]:null,null);out.push(o.map(x=>x.rarity[0]+':'+x.item).join(' | '));}return out})()""")
        print('rolls'); [print('  ', r) for r in res]
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(3000)
        print('live', await pg.evaluate("JSON.stringify({phase:__game.phase,nz:__game.sim.nz,t:__game.sim.time.toFixed(1)})"))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); await pg.evaluate("__game.stageEnd('time')")
        await pg.wait_for_timeout(300)
        print('banner1', await pg.evaluate("JSON.stringify({t:document.getElementById('bTitle').textContent,s:document.getElementById('bScore').textContent,txt:document.getElementById('bText').textContent,carry:document.getElementById('bCarry').textContent,btn:document.getElementById('bBtn').textContent})"))
        await pg.screenshot(path='/home/claude/test/c3.png')
        await pg.click('#bBtn'); await pg.wait_for_timeout(300); await pg.evaluate("(()=>{const g=document.getElementById('shopGo');if(g&&g.offsetParent)g.click()})()"); await pg.wait_for_timeout(20000)
        print('stage2', await pg.evaluate(info), 'seed', await pg.evaluate("(__game.sim.seed||[]).length/2"))
        await pg.screenshot(path='/home/claude/test/c4.png')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(2000)
        print('stage2 live', await pg.evaluate("JSON.stringify({nz:__game.sim.nz,z0:__game.sim.zombies0,ob:__game.sim.outbreaks.length})"))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); await pg.evaluate("__game.stageEnd('time')"); await pg.wait_for_timeout(200); await pg.click('#bBtn'); await pg.wait_for_timeout(300); await pg.evaluate("(()=>{const g=document.getElementById('shopGo');if(g&&g.offsetParent)g.click()})()"); await pg.wait_for_timeout(25000)
        print('stage3', await pg.evaluate(info))
        await pg.screenshot(path='/home/claude/test/c5.png')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); await pg.evaluate("__game.stageEnd('time')"); await pg.wait_for_timeout(200); await pg.click('#bBtn'); await pg.wait_for_timeout(300); await pg.evaluate("(()=>{const g=document.getElementById('shopGo');if(g&&g.offsetParent)g.click()})()"); await pg.wait_for_timeout(35000)
        print('stage4', await pg.evaluate(info))
        await pg.screenshot(path='/home/claude/test/c6.png')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(5000)
        print('stage4 live', await pg.evaluate("JSON.stringify({nz:__game.sim.nz,nh:__game.sim.nh,t:__game.sim.time.toFixed(1)})"))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); await pg.evaluate("__game.stageEnd('bar')"); await pg.wait_for_timeout(300)
        print('runover', await pg.evaluate("JSON.stringify({t:document.getElementById('bTitle').textContent,txt:document.getElementById('bText').textContent,carry:document.getElementById('bCarry').textContent,hq:document.querySelectorAll('#bExtra .up').length,medals:__game.camp.medals,run:__game.camp.run})"))
        await pg.screenshot(path='/home/claude/test/c7.png')
        await pg.click('#bExtra .up button')
        print('bought', await pg.evaluate("JSON.stringify({perm:__game.camp.perm,medals:__game.camp.medals})"))
        await pg.click('#bBtn'); await pg.wait_for_timeout(300); await pg.evaluate("(()=>{const g=document.getElementById('shopGo');if(g&&g.offsetParent)g.click()})()"); await pg.wait_for_timeout(15000)
        print('new run', await pg.evaluate(info), await pg.evaluate("JSON.stringify(__game.sim.up)"))
        # sandbox
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300); await pg.select_option('#modeSel', 'sandbox'); await pg.wait_for_timeout(15000)
        print('sandbox', await pg.evaluate(info))
        print('\n'.join(l for l in logs if 'error' in l.lower() or 'PAGEERROR' in l)[:3000])
        await b.close()
asyncio.run(main())
