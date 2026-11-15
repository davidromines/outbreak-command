#!/bin/bash
cd /home/claude/test
for cfg in '{"budget":1.25}' '{"cap":25,"budget":1.25}' '{"walk":0.9}'; do
  node camp2.js avg 1 "$cfg" 2 >> bal.out 2>&1 & node camp2.js good 1 "$cfg" 2 >> bal.out 2>&1; wait
done
echo DONE >> bal.out
