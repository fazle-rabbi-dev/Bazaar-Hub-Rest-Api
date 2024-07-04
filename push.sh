git add .

read -p "[*] Type Commit Message:" commit_message
#git commit -m "backup"

# Get the current date in the desired format
# current_datetime=$(date "+%Y-%m-%d %I:%M:%S %p")

# Construct the commit message with the current date
# commit_message="backup at $current_datetime"

echo "$commit_message"

# Execute the git commit command with the constructed message
git commit -m "$commit_message"

git push
