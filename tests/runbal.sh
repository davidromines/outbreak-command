#!/bin/bash
cd /home/claude/test
run(){ node camp2.js $1 2 "$2" 2 >> bal.out 2>&1; }
: > bal.out
for cfg in '{}' '{"cap":25}' '{"budget":1.25}' '{"cap":25,"budget":1.25}' '{"walk":0.9}' '{"move":0.042}' '{"health":32}'; do
  run avg "$cfg" & run good "$cfg"; wait
done
echo DONE >> bal.out
