# Application Deployment
## Prerequsites
* `Kubernetes` cluster
* `Jenkins` deployed in this cluster with following plugins:
    * kubernetes
    * workflow-aggregator
    * git
    * github
* `Telegram` bot
* `ECR` registry and AWS account with access to it
## Setup and usage
1. Create jenkins pipeline with `git source` and select `GitHub hook trigger for GITScm polling`
1. _OPTIONAL_ Add webhook trigger to github repo in repo settings
1. Add following credentials secrets to jenkins:
    * `telegram-bot-token` - Telegram bot token for notifications
    * `telegram-chat-id` - Telegram chat id for notifications
    * `aws-access-key-id` - AWS access key for user with read/write access to ECR 
    * `aws-secret-access-key` - AWS secret access key for user with read/write access to ECR 
    * `ecr-registry` - Link to ECR registry (e.g. 123456789123.dkr.ecr.us-east-1.amazonaws.com)
1. Create configmaps in your kubernetes cluster for helm deployment and ECR access:
    * `ECR` is used to pull image from registry when helm chart deploys:
        ```bash
        kubectl create secret docker-registry rs-react \
         --docker-server=123456789123.dkr.ecr.us-east-1.amazonaws.com \
         --docker-username=AWS \
         --docker-password=$(aws ecr get-login-password)
        ```
    * `HELM` - access to kubernetes master to deploy helm chart:
        ```bash
        kubectl create configmap kubeconfig-configmap --from-file=.kube/config
        ```
1. Trigger build manually or by pushing to repository if webhook is set
## Deployment process
Pipeline has following steps:
1. Application build
    ```bash
    yarn install
    yarn run build
    ```
1. Sample Unit test execution
    ```bash
    yarn run test
    ```
1. Docker image build and push to ECR
    1. Authorize ECR using `aws-cli` container
    1. Build and Push image using `docker` container
1. Deploy helm chart to kubernetes cluster using `helm` container with configmap `kubeconfig-configmap` mounted
1. Verify application deployment with `curl` main page