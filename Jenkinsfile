def sendNotification(status, step) {
    def emoji
    if (status == "start") {
        emoji = "ℹ️"
    } else if (status == "success") {
        emoji = "✅"
    } else if (status == "failure") {
        emoji = "❌"
    }
    def message = "${emoji} ${step} *${env.JOB_NAME} #${env.BUILD_NUMBER}* ${status} ${emoji}"
    sh """
    curl --location --request POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
         --form text="${message}" \
         --form parse_mode=markdown \
         --form chat_id="${TG_CHAT_ID}"
    """
}
pipeline {
    agent {
        kubernetes {
            yaml """
              apiVersion: v1
              kind: Pod
              spec:
                volumes:
                - name: docker-socket
                  emptyDir: {}
                - name: kubeconfig
                  configMap:
                    name: kubeconfig-configmap
                containers:
                - name: docker
                  image: docker:27.3.1
                  readinessProbe:
                    exec:
                      command: [sh, -c, "ls -S /var/run/docker.sock"]
                  command: ['sleep']
                  args: ['99d']
                  volumeMounts:
                  - name: docker-socket
                    mountPath: /var/run
                - name: docker-daemon
                  image: docker:27.3.1-dind
                  securityContext:
                    privileged: true
                  volumeMounts:
                  - name: docker-socket
                    mountPath: /var/run
                - name: node
                  image: node:18-alpine
                  command: ['sleep']
                  args: ['99d']
                - name: aws-cli
                  image: amazon/aws-cli:2.13.7
                  command: ['sleep']
                  args: ['99d']
                - name: helm
                  image: alpine/helm:3.12.3
                  command: ['sleep']
                  args: ['99d']
                  volumeMounts:
                    - name: kubeconfig
                      mountPath: /root/.kube
                - name: kubectl
                  image: bitnami/kubectl:1.28
                  command: ['sleep']
                  args: ['99d']
                  volumeMounts:
                    - name: kubeconfig
                      mountPath: /root/.kube
            """
        }
    }
    environment {
        TG_TOKEN = credentials('telegram-bot-token')
        TG_CHAT_ID = credentials('telegram-chat-id')
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        AWS_REGION = 'eu-central-1'
        ECR_REGISTRY = credentials('ecr-registry')
    }
    stages {
        stage('Build') {
            steps {
                script {
                    sendNotification("start", "BUILD")
                }
                container('node') {
                    sh "yarn install"
                    sh "yarn run build"
                }
                script {
                    sendNotification("success", "BUILD")
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    sendNotification("start", "TEST")
                }
                container('node') {
                    sh "yarn run test"
                }
                script {
                    sendNotification("success", "TEST")
                }
            }
        }
        stage('Docker') {
            steps {
                script {
                    sendNotification("start", "DOCKER build")
                }
                container('aws-cli') {
                    sh "aws ecr get-login-password --region ${AWS_REGION} > .dockercredentials"
                }
                container('docker') {
                    sh "docker build -t ${env.ECR_REGISTRY}/rs-react:latest -t ${env.ECR_REGISTRY}/rs-react:1.0.${env.BUILD_NUMBER} ."
                    sh "cat .dockercredentials | docker login --username AWS --password-stdin ${env.ECR_REGISTRY}"
                    sh "docker push ${env.ECR_REGISTRY}/rs-react:latest"
                    sh "docker push ${env.ECR_REGISTRY}/rs-react:1.0.${env.BUILD_NUMBER}"
                }
                script {
                    sendNotification("success", "DOCKER build and push")
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    sendNotification("start", "DEPLOY")
                }
                container('helm') {
                    sh "helm upgrade --install rs-react helm-chart/ --set image.registry=${env.ECR_REGISTRY} --set image.tag=1.0.${env.BUILD_NUMBER} -n default"
                }
                script {
                    sendNotification("success", "DEPLOY")
                }
            }
        }
        stage('Verify') {
            steps {
                container('kubectl') {
                    sh "sleep 30"
                    sh "export NODE_PORT=$(kubectl get --namespace default -o jsonpath=\"{.spec.ports[0].nodePort}\" services rs-react)"
                    sh "export NODE_IP=$(kubectl get nodes --namespace default -o jsonpath=\"{.items[0].status.addresses[0].address}\")"
                    sh "echo http://\$NODE_IP:\$NODE_PORT > service_access"
                }
                script {
                    sh "curl $(cat service_access)"
                }
                script {
                    sendNotification("success", "VERIFIED")
                }
            }
        }
    }
    post {
        failure {
                script {
                    sendNotification("failure", "PIPELINE")
                }
            }
        }    
}
