build:
	docker build . -t localhost:32000/bmo-cloud-scheduler

publish: build
	docker push localhost:32000/bmo-cloud-scheduler

deploy: publish
	k apply -f ./manifest.yaml