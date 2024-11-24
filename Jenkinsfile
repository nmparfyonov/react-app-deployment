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
                containers:
                - name: docker
                  image: docker:27.3.1
                  readinessProbe:
                    exec:
                      command: [sh, -c, "ls -S /var/run/docker.sock"]
                  command:
                  - sleep
                  args:
                  - 99d
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
                  command:
                  - sleep
                  args:
                  - 99d
            """
        }
    }
    environment {
        TG_TOKEN = credentials('telegram-bot-token')
        TG_CHAT_ID = credentials('telegram-chat-id')
    }
    stages {
        stage('Build') {
            steps {
                script {
                    sh "env"
                }
                // container('node') {
                //     sh "yarn install"
                //     sh "yarn run build"
                // }
                // script {
                //     sendNotification("success", "BUILD")
                // }
            }
        }
        // stage('Test') {
        //     steps {
        //         script {
        //             sendNotification("start", "TEST")
        //         }
        //         container('node') {
        //             sh "yarn run test"
        //         }
        //         script {
        //             sendNotification("success", "TEST")
        //         }
        //     }
        // }
        // stage('Docker') {
        //     steps {
        //         script {
        //             sendNotification("start", "TEST")
        //         }
        //         container('docker') {
        //             sh "docker build -t react-app-deployment:latest -t react-app-deployment:${env.BUILD_NUMBER} ."
        //         }
        //         script {
        //             sendNotification("success", "TEST")
        //         }
        //     }
        // }
    }
    post {
        failure {
                script {
                    sendNotification("failure", "pipeline")
                }
            }
        }    
}
