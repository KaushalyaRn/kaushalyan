# Fly.io helpers — run from the repository root.
# Log in first: fly auth login

fly apps list
fly status --app kaushalyan
fly logs --app kaushalyan
fly deploy --app kaushalyan
