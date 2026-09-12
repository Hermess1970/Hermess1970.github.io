#!/bin/bash
cd "$(dirname "$0")"
echo "Avvio del pannello di controllo…"
python3 server.py
echo
read -n 1 -s -r -p "Premi un tasto per chiudere…"
