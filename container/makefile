build:
	docker build . -t localhost:32000/bmo-cloud-scheduler

publish: build
	docker push localhost:32000/bmo-cloud-scheduler

deploy: publish
	microk8s kubectl delete -f ./manifest.yaml
	microk8s kubectl apply -f ./manifest.yaml

release:
	git checkout release
	git merge main
	git push
	git checkout main