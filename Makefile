.PHONY: build preview deploy note clean

build:
	node scripts/build.mjs

preview: build
	python3 -m http.server 8080 --directory dist

deploy:
	fly deploy

note:
	bash scripts/new-note.sh "$(title)"

clean:
	rm -rf dist

status:
	fly status

logs:
	fly logs
