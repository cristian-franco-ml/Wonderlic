#!/bin/bash

echo "🧠 Starting Wonderlic Practice Test..."
echo ""
echo "Opening setup guide..."

# Try to open with default browser
if command -v xdg-open &> /dev/null; then
    xdg-open setup.html
elif command -v open &> /dev/null; then
    open setup.html
elif command -v python3 &> /dev/null; then
    echo "Starting local server..."
    python3 -m http.server 8000 &
    echo "Server started at http://localhost:8000"
    echo "Opening setup guide..."
    sleep 2
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:8000/setup.html
    elif command -v open &> /dev/null; then
        open http://localhost:8000/setup.html
    else
        echo "Please open http://localhost:8000/setup.html in your browser"
    fi
else
    echo "Please open setup.html in your web browser"
fi

echo ""
echo "If setup.html doesn't open automatically, please:"
echo "1. Open setup.html in your web browser"
echo "2. Click 'Start Practicing Now' to begin"
echo ""
echo "Press Enter to exit..."
read 