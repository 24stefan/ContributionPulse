#!/bin/bash


USERNAMES=("octocat" "torvalds" "gaearon" "microsoft" "24stefan")


OUTPUT_DIR="./test_svgs"
mkdir -p "$OUTPUT_DIR"


API_URL="http://localhost:3000/api/user"

for USER in "${USERNAMES[@]}"; do
  FILE="$OUTPUT_DIR/${USER}_heatmap.svg"
  echo "Fetching SVG for $USER..."

 
  RESPONSE=$(curl -s "$API_URL/$USER?format=svg")

  # Check if the response is SVG (starts with <svg)
  if [[ $RESPONSE == \<svg* ]]; then
    echo "$RESPONSE" > "$FILE"
    echo " Saved SVG for $USER to $FILE"
  else
    echo " Failed to fetch SVG for $USER"
    echo "   Response: $RESPONSE"
  fi
done
