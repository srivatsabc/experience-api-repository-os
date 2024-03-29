pipeline {

  environment {
     GIT_SUBDIRECTORY = "geocode-locator-app-0.0.2"
     GIT_REPO_URL = "https://github.com/srivatsabc/experience-api-repository-os.git"
     OKD_APP = "geocode-locator-app-v002"
     OKD_NAMESPACE = "experience-api-ns"
     CONFIG_MAP = "geocode-locator-app-v002-config"
     DOCKER_ID = "srivatsabc"
     DOCKER_REPO = "geocode-locator-app"
     DOCKER_TAG = "os-e-api-v0.0.2"
     DOCKER_PWD = "wipro123"
     DEPLOYMENT_YAML = "geocode-locator-app-0.0.2-deployment.yaml"
     SERVICE_YAML = "geocode-locator-app-0.0.2-service.yaml"
   }

  agent {
      label "master"
  }

  stages {
     stage('Checkout') {
          steps {
            checkout([$class: 'GitSCM',
              branches: [[name: 'master']],
              doGenerateSubmoduleConfigurations: false,
              extensions: [[$class: 'SparseCheckoutPaths',  sparseCheckoutPaths:[[$class:'SparseCheckoutPath', path:"${GIT_SUBDIRECTORY}/"]]]                        ],
              submoduleCfg: [],
              userRemoteConfigs: [[credentialsId: 'srivatsabc_git_login', url: "${GIT_REPO_URL}"]]])

            sh "ls -lat"
          }
      }

    stage('OpenShift deployment delete') {
        steps {
          script {
            sh "echo deleting the current OpenShift deployment $OKD_APP from namespace $OKD_NAMESPACE"
            status = sh(returnStatus: true, script: "oc delete deployment $OKD_APP --namespace=$OKD_NAMESPACE")
            if (status == 0){
              stage('OpenShift service delete') {
                  script{
                    sh "echo deleting the current OpenShift service $OKD_APP from namespace $OKD_NAMESPACE"
                    status = sh(returnStatus: true, script: "oc delete service $OKD_APP --namespace=$OKD_NAMESPACE")
                    if (status == 0){
                      stage('Deleting current docker image from local repo'){
                        sh "echo deleting docker image from local $DOCKER_ID/$DOCKER_REPO:$DOCKER_TAG"
                        status = sh(returnStatus: true, script: "docker rmi $DOCKER_ID/$DOCKER_REPO:$DOCKER_TAG -f")
                        if (status == 0){
                          sh "echo Delete kube deployment service and docker image successfully"
                        }else{
                          stage('Nothing docker image to delete'){
                            sh "echo no docker image to delete in local repo"
                          }
                        }
                      }
                    }else{
                      stage('No OpenShift service to delete'){
                        sh "echo no service available in OpenShift"
                      }
                    }
                  }
              }
            }else{
              stage('No OpenShift deployment to delete'){
                sh "echo no deployment available in OpenShift"
              }
            }
          }
        }
      }

    stage('Build docker image') {
      steps {
        sh "echo build docker image $DOCKER_ID/$DOCKER_REPO:$DOCKER_TAG"
        sh 'docker build -t $DOCKER_ID/$DOCKER_REPO:$DOCKER_TAG $GIT_SUBDIRECTORY/.'
      }
    }

    stage('Docker login') {
      steps {
        sh "echo loging into Docker hub"
        sh 'docker login -u $DOCKER_ID -p $DOCKER_PWD'
      }
    }

    stage('Docker push') {
      steps {
        sh "echo Pushing $DOCKER_ID/$DOCKER_REPO:$DOCKER_TAG to Docker hub"
        sh 'docker push $DOCKER_ID/$DOCKER_REPO:$DOCKER_TAG'
      }
    }

    stage('OpenShift configmap') {
        steps {
          script {
            sh "echo creating oc create -n $OKD_NAMESPACE configmap $CONFIG_MAP --from-literal=RUNTIME_ENV_TYPE=k8s"
            statusCreate = sh(returnStatus: true, script: "oc create -n $OKD_NAMESPACE configmap $CONFIG_MAP --from-literal=RUNTIME_ENV_TYPE=k8s")
            if (statusCreate != 0){
              sh "echo Unable to create $CONFIG_MAP in $OKD_NAMESPACE as it already exists"
            }else{
              stage('OpenShift configmap created'){
                sh "echo OpenShift configmap successfully created"
              }
            }
          }
        }
      }

    stage('OpenShift deployment') {
      steps {
        sh 'oc apply -n $OKD_NAMESPACE -f $GIT_SUBDIRECTORY/$DEPLOYMENT_YAML'
      }
    }

    stage('OpenShift service') {
      steps {
        sh 'oc apply -n $OKD_NAMESPACE -f $GIT_SUBDIRECTORY/$SERVICE_YAML'
      }
    }
  }
}
