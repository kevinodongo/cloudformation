# CloudFormation Backend Sample

In this example we are going to use cloudformation to create the backend for a Todo application. 

To begin with we will create two s3 buckets. One to host our website and the other to host our artifacts like lambda .zip files.

To upload lambda file

```javascript
// create a zip file of the two folders todo-users and todo-task

aws s3api put-object --bucket todoappartifacts --key todo-tasks-zip --region us-east-1 --body ./todo-tasks.zip    

aws s3api put-object --bucket todoappartifacts --key todo-users-zip --region us-east-1 --body ./todo-users.zip     
```

Once done you can create the task using the following command

```javascript
aws cloudformation create-stack --stack-name todobackend --template-body file://backend.yml --parameters file://backend-parameters.json --capabilities CAPABILITY_NAMED_IAM  

```

While to update the stack use the following command

```javascript
aws cloudformation update-stack --stack-name todobacked --template-body file://backend.yml --parameters file://backend-parameters.json  --capabilities CAPABILITY_NAMED_IAM 
```

You can describe the stack events you have created as follows: 

```javascript
aws cloudformation describe-stacks --stack-name todobackend
aws cloudformation describe-stack-events --stack-name todobackend
```

Once done you can cleanup using the following command:

```javascript
aws cloudformation delete-stack --stack-name todobackend  
```
